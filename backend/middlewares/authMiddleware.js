// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware para verificar el token JWT de autorización.
 */
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: no se proporcionó un token.' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken; // Agrega los datos del usuario al objeto req
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    res.status(400).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware para verificar si el usuario autenticado es moderador.
 */
const verifyModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.rol?.includes('moderador')) {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de moderador.' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar rol de moderador:', error.message);
    res.status(500).json({ error: 'Error interno en la autenticación.' });
  }
};

module.exports = {
  verifyToken,
  verifyModerator,
};
