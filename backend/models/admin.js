const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permisos: [{ type: String, enum: ['editar', 'eliminar', 'gestionarUsuarios'] }]
});

module.exports = mongoose.model('Admin', AdminSchema);
