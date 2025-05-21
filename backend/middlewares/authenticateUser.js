// Middleware simple para validar userId desde req.body
module.exports = function authenticateUser(req, res, next) {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado. userId es requerido.' });
  }

  req.userId = userId; // Se pasa al controlador
  next();
};

