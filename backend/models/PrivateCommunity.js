const mongoose = require('mongoose');
const Community = require('./Community'); // Importamos el modelo completo, no solo el schema

// Creamos un nuevo esquema desde cero para evitar problemas con timestamps
const PrivateCommunitySchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tema: { type: String },
    tipo: { type: String, enum: ['publica', 'privada'], default: 'publica' },
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    publicaciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    estadoInvitacion: { type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' }
});

// Creamos el modelo de discriminador SIN incluir timestamps
const PrivateCommunity = Community.discriminator('PrivateCommunity', PrivateCommunitySchema);

module.exports = PrivateCommunity;
