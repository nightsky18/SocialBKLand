const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado, no hay token' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

const verifyModerator = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.rol.includes('moderador')) {
            return res.status(403).json({ error: 'Acceso denegado, no eres moderador' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Error en la autenticación' });
    }
};

module.exports = { verifyToken, verifyModerator };
