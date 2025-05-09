const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();


// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso',
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/recovery-request
router.post('/recovery-request', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Correo requerido' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'Este correo no está asociado a ninguna cuenta.' });
  }

  // Simulación de éxito (sin token/email real)
  return res.json({ success: true, message: 'Correo válido. Puedes continuar.' });
});


module.exports = router;
