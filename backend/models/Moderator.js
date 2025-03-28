const mongoose = require('mongoose');


const User = require('./User');

const ModeratorSchema = new mongoose.Schema({
    permisos: { 
        type: [String], 
        enum: ['eliminar_comentarios', 'bloquear_usuarios', 'editar_posts', 'aprobar_reviews'], 
        default: ['eliminar_comentarios', 'aprobar_reviews']
    },
    asignadoDesde: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
});

const Moderator = User.discriminator('moderador', ModeratorSchema);
module.exports = Moderator;
