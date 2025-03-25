const mongoose = require('mongoose');

const PrivateCommunitySchema = new mongoose.Schema({
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    estadoInvitacion: { type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' }
});

module.exports = mongoose.model('PrivateCommunity', PrivateCommunitySchema);
 