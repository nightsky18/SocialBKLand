const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metodoDePago: { type: String, enum: ['tarjeta', 'transferencia'], required: true },
    total: { type: Number, required: true },
    estadoPago: { type: String, enum: ['pendiente', 'completado'], default: 'pendiente' },
    detallesTransaccion: { type: String },
    fechaPago: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
