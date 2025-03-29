const mongoose = require('mongoose');
const User = require('./User'); // Importar el modelo base de usuario

const ClientSchema = new mongoose.Schema({
    paymentMethods: [
        {
            type: { type: String, enum: ['Tarjeta', 'PayPal', 'Criptomoneda'], required: true },
            details: { type: String } // Ejemplo: Número de tarjeta, dirección de billetera
        }
    ],
    purchaseHistory: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
    ]
});

// Middleware para evitar duplicados en historial de compras
ClientSchema.pre('save', function (next) {
    this.purchaseHistory = [...new Set(this.purchaseHistory.map(id => id.toString()))];
    next();
});

// Crear el modelo Client como un discriminador de User
const Client = User.discriminator('Client', ClientSchema);

module.exports = Client;
