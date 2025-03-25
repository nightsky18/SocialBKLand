const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contenido: { type: String, required: true },
    calificacion: { type: Number, min: 1, max: 5 },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
