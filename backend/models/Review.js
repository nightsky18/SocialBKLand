const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    calificacion: { type: Number, min: 1, max: 5, required: true },
    comentario: { type: String }
});

module.exports = mongoose.model('Review', ReviewSchema);
