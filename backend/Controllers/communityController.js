const Community = require('../models/Community');
const User = require('../models/user');

// POST /api/communities
exports.createCommunity = async (req, res) => {
  const { name, topic, type } = req.body;
  const userId = req.userId; // Requiere middleware de autenticación

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre de la comunidad es obligatorio.' });
  }

  try {
    // Validar que no exista otra comunidad con el mismo nombre
    const existing = await Community.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Ya existe una comunidad con ese nombre.' });
    }

    // Crear la comunidad y agregar al creador como moderador
    const newCommunity = new Community({
      name: name.trim(),
      topic: topic?.trim() || '',
      type: type === 'private' ? 'private' : 'public',
      members: [{ user: userId, isModerator: true }]
    });

    const saved = await newCommunity.save();

    // Agregar comunidad al usuario
    await User.findByIdAndUpdate(userId, {
      $addToSet: { communities: saved._id }
    });

    res.status(201).json(saved);

  } catch (error) {
    console.error('Error al crear comunidad:', error);
    res.status(500).json({ message: 'Error al crear comunidad' });
  }
};
