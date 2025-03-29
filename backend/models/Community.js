const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },  // Se agrega `trim` para evitar espacios innecesarios
    topic: { type: String, trim: true },
    type: { type: String, enum: ['public', 'private'], default: 'public' }, // Cambié a inglés para mantener consistencia
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Administrador de la comunidad
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
    createdAt: { type: Date, default: Date.now } // Fecha de creación automática
});

// Middleware para evitar miembros o publicaciones duplicadas
CommunitySchema.pre('save', function (next) {
    this.members = [...new Set(this.members.map(id => id.toString()))]; // Evita miembros duplicados
    this.posts = [...new Set(this.posts.map(id => id.toString()))]; // Evita publicaciones duplicadas
    next();
});

module.exports = mongoose.model('Community', CommunitySchema);
