const express = require("express");
const Community = require("../models/Community");
const { createCommunity } = require('../Controllers/communityController.js');
const authenticateUser = require('../middlewares/authenticateUser');
const User = require('../models/user');

const router = express.Router();

router.get("/", async (req, res) => {
  const communities = await Community.find()
    .populate("members.user", "name email") // poblamos solo campos necesarios
    .populate("posts")
    .sort({ createdAt: -1 });

  res.json(communities);
});


// POST /api/communities - Crear nueva comunidad
router.post("/", authenticateUser, createCommunity);

router.get("/:id", async (req, res) => {
    const community = await Community.findById(req.params.id);
    res.json(community);
});

router.put("/:id", async (req, res) => {
    const updatedCommunity = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCommunity);
});

router.delete("/:id", async (req, res) => {
    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: "Comunidad eliminada" });
});

// POST /api/community/:id/join
router.post('/:id/join', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Falta el ID del usuario' });
    }

    const community = await Community.findById(communityId);
    const user = await User.findById(userId);

    if (!community || !user) {
      return res.status(404).json({ message: 'Comunidad o usuario no encontrado' });
    }

    // Verificar si ya es miembro
    const yaMiembro = community.members.some(m => m.user.toString() === userId);
    if (yaMiembro) {
      return res.status(400).json({ message: 'Ya eres miembro de esta comunidad' });
    }

    // Solo permitir unión directa si es pública
    if (community.type !== 'public') {
      return res.status(403).json({ message: 'Esta comunidad es privada. No puedes unirte directamente.' });
    }

    // Agregar a la comunidad
    community.members.push({ user: userId, isModerator: false });
    await community.save();

    // Agregar la comunidad al usuario si no está
    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    res.status(200).json({ message: 'Unido exitosamente a la comunidad' });
  } catch (err) {
    console.error('Error al unir a comunidad:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/community/:id/request
router.post('/:id/request', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Falta el ID del usuario' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    if (community.type !== 'private') {
      return res.status(400).json({ message: 'La comunidad no es privada' });
    }

    const yaMiembro = community.members.some(m => m.user.toString() === userId);
    if (yaMiembro) {
      return res.status(400).json({ message: 'Ya eres miembro de esta comunidad' });
    }

    // Verifica si ya hay una solicitud pendiente (opcional, si lo implementas en el modelo)
    const yaSolicitada = community.joinRequests?.some(id => id.toString() === userId);
    if (yaSolicitada) {
      return res.status(400).json({ message: 'Ya has solicitado unirte' });
    }

    // Agrega la solicitud al array joinRequests (requiere que el modelo la tenga)
    if (!community.joinRequests) community.joinRequests = [];
    community.joinRequests.push(userId);
    await community.save();

    res.status(200).json({ message: 'Solicitud enviada con éxito' });
  } catch (err) {
    console.error('Error al solicitar ingreso:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
