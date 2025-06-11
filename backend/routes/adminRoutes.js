const express = require("express");
const Admin = require("../models/admin");
const User = require('../models/user');
const router = express.Router();
const Notification = require('../models/notification');



// GET /api/admins/users — traer usuarios con permisos
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email isAdmin').lean();

    const userIds = users.map(user => user._id);
    const adminDocs = await Admin.find({ user: { $in: userIds } }).lean();

    const permisosMap = {};
    adminDocs.forEach(admin => {
      permisosMap[admin.user.toString()] = admin.permisos;
    });

    const usuariosConPermisos = users.map(user => ({
      ...user,
      permissions: user.isAdmin ? (permisosMap[user._id.toString()] || []) : []
    }));

    res.status(200).json(usuariosConPermisos);
  } catch (err) {
    console.error('❌ Error en /admins/users:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo administrador
router.post("/", async (req, res) => {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.status(201).json(newAdmin);
});

// Obtener un administrador por ID
router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.params.id }); //  busca por el campo user
    if (!admin) {
      return res.status(404).json({ permisos: [] }); // evita el null
    }
    res.json(admin);
  } catch (err) {
    console.error("Error al obtener admin:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// Actualizar administrador
router.put("/:id", async (req, res) => {
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAdmin);
});

// Eliminar administrador
router.delete("/:id", async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Administrador eliminado" });
});


 
// PATCH: Asignar rol y permisos
router.patch('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { isAdmin, permissions, adminId } = req.body;

  try {
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'El campo "isAdmin" debe ser booleano.' });
    }

    if (isAdmin && (!Array.isArray(permissions) || permissions.length === 0)) {
      return res.status(400).json({ message: 'Debes asignar al menos un permiso al administrador.' });
    }

    // Esta línea ahora sí está dentro del bloque async
    const adminUser = await User.findById(adminId); // quien ejecuta la acción

    // Actualizar isAdmin en User
    const user = await User.findByIdAndUpdate(id, { isAdmin }, { new: true });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    if (isAdmin) {
      const admin = await Admin.findOneAndUpdate(
        { user: id },
        { permisos: permissions },
        { upsert: true, new: true }
      );

      //  Notificación al usuario modificado
      const Notification = require('../models/notification');
      const mensaje = `Tu perfil fue actualizado por ${adminUser.name}. Nuevos permisos: ${permissions.join(", ")}.`;

      await Notification.create({
        user: id,
        message: mensaje,
        read: false,
        date: new Date()
      });

      return res.status(200).json({ user, admin });
    } else {
      await Admin.deleteOne({ user: id });

      //  Notificación al ser revocado
      const Notification = require('../models/notification');
      const mensaje = `Tu perfil fue actualizado por ${adminUser.name}. Ya no eres administrador.`;

      await Notification.create({
        user: id,
        message: mensaje,
        read: false,
        date: new Date()
      });

      return res.status(200).json({ user });
    }
  } catch (error) {
    console.error('Error actualizando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
