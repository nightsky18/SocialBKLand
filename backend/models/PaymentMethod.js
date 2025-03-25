const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, enum: ['tarjeta', 'transferencia'], required: true },
    numeroCuenta: { type: String },
    CVV: { type: String }
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
