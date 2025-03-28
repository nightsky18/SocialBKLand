const mongoose = require('mongoose');
const User = require('./User'); // Importamos el modelo base

if (!User.discriminators || !User.discriminators['administrador']) {
    var Admin = User.discriminator('administrador', new mongoose.Schema({
        permisos: [{ type: String, required: true }]
    })); // ✅ Eliminamos `{ collection: 'admins' }`
}

module.exports = Admin;
