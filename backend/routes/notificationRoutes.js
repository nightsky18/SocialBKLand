const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

//  GET /api/notifications/:userId
// Obtener todas las notificaciones de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const notis = await Notification.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(notis);
  } catch (err) {
    console.error("❌ Error al cargar notificaciones:", err);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
});

//  PATCH /api/notifications/:userId/read
// Marcar todas como leídas
router.patch('/:userId/read', async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.params.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Notificaciones marcadas como leídas" });
  } catch (err) {
    console.error("❌ Error al actualizar notificaciones:", err);
    res.status(500).json({ message: "No se pudo actualizar el estado de las notificaciones" });
  }
});

module.exports = router;
