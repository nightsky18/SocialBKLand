const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metodosPago: [{ type: String }],
    historialCompras: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
});

module.exports = mongoose.model('Client', ClientSchema);
