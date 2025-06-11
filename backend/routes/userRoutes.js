// routes/userRoutes.js
const express = require("express");
const User = require("../models/user"); 
const Admin = require('../models/admin');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta para obtener todos los usuarios (AHORA SIN PROTECCIÓN - INSEGURO)
// En producción, PROTEGER: solo para administradores.
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Excluir contraseñas
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Ruta para crear un nuevo usuario (registro) - Asumimos manejado en authRoutes
// Esta ruta generalmente no necesita auth/auth si es registro público,
// pero SÍ necesita validación y hashing de contraseña (manejado en authRoutes.js).
// router.post("/", async (req, res) => { ... }); // Comentada, asumo que está en authRoutes

// Ruta para obtener un usuario por ID (AHORA SIN PROTECCIÓN - INSEGURO)
// En producción, PROTEGER: solo el propio usuario o administradores.
// Antes: router.get("/:id", authenticate, authorizeOwner, async (req, res) => { ... });
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Excluir contraseña
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
         console.error('Error fetching user by ID:', error);
         if (error.kind === 'ObjectId') {
              return res.status(400).json({ message: 'ID de usuario inválido' });
         }
         res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// Ruta para ACTUALIZAR un usuario por ID (Perfil de usuario) (AHORA SIN PROTECCIÓN - MUY INSEGURO)
// En producción, PROTEGER: solo el propio usuario o administradores.
// Antes: router.patch("/:id", authenticate, authorizeOwner, async (req, res) => { ... });
router.patch("/:id", async (req, res) => {
    const userId = req.params.id;
    const updates = req.body;

    // **Sanitización de datos (AUN NECESARIA aunque no haya AUTH)**
    // Aunque no haya auth, sigue siendo buena idea controlar qué campos se pueden actualizar
    const allowedUpdates = {};
    // Puedes ajustar esta lista según los campos que quieres permitir editar
    const allowedFields = ['name', 'email' /*, otros campos no sensibles */];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            allowedUpdates[field] = updates[field];
        }
    });

    // **IMPORANTE:** NUNCA permitas actualizar la contraseña o el rol
    // a través de este endpoint de actualización de perfil general, incluso sin auth.
    delete updates.password; // Safety check, aunque allowedUpdates es la protección principal
    delete updates.role;

    if (Object.keys(allowedUpdates).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron campos válidos para actualizar.' });
    }

    try {
        // Encontrar y actualizar el usuario
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true } // runValidators sigue siendo útil para validaciones de esquema (formato email, etc.)
        ).select('-password'); // Excluir la contraseña

        if (!updatedUser) {
            // Esto puede pasar si se envía un ID que no existe
            return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        }

        res.status(200).json({
            message: 'Perfil actualizado exitosamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

         if (error.kind === 'ObjectId') {
              return res.status(400).json({ message: 'ID de usuario inválido para actualizar' });
         }

        res.status(500).json({ message: 'Error interno del servidor al actualizar el perfil' });
    }
});


// Ruta para ELIMINAR un usuario por ID (AHORA SIN PROTECCIÓN - EXTREMADAMENTE INSEGURO)
// En producción, PROTEGER: solo el propio usuario o administradores.
// Antes: router.delete("/:id", authenticate, authorizeOwner, async (req, res) => { ... });
router.delete("/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            // Esto puede pasar si se envía un ID que no existe
            return res.status(404).json({ message: "Usuario no encontrado para eliminar" });
        }
        res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error('Error deleting user:', error);
         if (error.kind === 'ObjectId') {
              return res.status(400).json({ message: 'ID de usuario inválido para eliminar' });
         }
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

// GET /api/users/:userId/communities
router.get('/:userId/communities', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'communities',
      populate: { path: 'members posts' }
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json(user.communities);
  } catch (err) {
    console.error('Error al obtener comunidades del usuario:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/user/:id/report
router.post('/:id/report', async (req, res) => {
  const { reporterId, reason, details, communityId } = req.body;
  const reportedUserId = req.params.id;

  const reportPath = path.join(__dirname, '../cache/userReports.json');
  let reports = [];
  if (fs.existsSync(reportPath)) {
    reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  }
  reports.push({
    reportedUserId,
    reporterId,
    reason,
    details,
    communityId,
    date: new Date()
  });
  fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));

  res.status(200).json({ message: "Reporte de usuario registrado." });
});

module.exports = router;