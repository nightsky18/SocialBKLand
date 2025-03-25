const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tema: { type: String },
    tipo: { type: String, enum: ['publica', 'privada'], default: 'publica' },
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    publicaciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

module.exports = mongoose.model('Community', CommunitySchema);
