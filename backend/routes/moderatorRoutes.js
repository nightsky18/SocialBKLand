const express = require('express');
const router = express.Router();
const Moderator = require('../models/Moderator');

const { verifyToken, verifyModerator } = require('../middlewares/authMiddleware');


//  Obtener todos los moderadores
router.get('/', verifyToken, verifyModerator, async (req, res) => {
    try {
        const moderators = await Moderator.find().populate('usuario', 'nombre email');
        res.json(moderators);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener moderadores' });
    }
});

// Asignar un usuario como moderador
router.post('/assign', verifyToken, verifyModerator, async (req, res) => {
    try {
        const { usuario, permisos } = req.body;

        const existingModerator = await Moderator.findOne({ usuario });
        if (existingModerator) {
            return res.status(400).json({ error: 'El usuario ya es moderador' });
        }

        const newModerator = new Moderator({ usuario, permisos });
        await newModerator.save();
        res.status(201).json({ message: 'Moderador asignado con éxito', newModerator });
    } catch (error) {
        res.status(500).json({ error: 'Error al asignar moderador' });
    }
});


module.exports = router;
