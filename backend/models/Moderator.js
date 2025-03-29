const mongoose = require('mongoose');
const User = require('./User');

// Lista de permisos válidos
const PERMISOS_VALIDOS = [
    'eliminar_comentarios',
    'bloquear_usuarios',
    'editar_posts',
    'aprobar_reviews'
];

// Esquema específico de Moderator
const ModeratorSchema = new mongoose.Schema({
    permisos: {
        type: [String],
        enum: PERMISOS_VALIDOS,
        default: ['eliminar_comentarios', 'aprobar_reviews'],
        validate: {
            validator: function (val) {
                return val.every(permiso => PERMISOS_VALIDOS.includes(permiso));
            },
            message: 'Uno o más permisos no son válidos.'
        }
    },
    asignadoDesde: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Crear modelo de Moderator con discriminador
const Moderator = User.discriminator('moderador', ModeratorSchema);
module.exports = Moderator;
