const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    contenido: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
