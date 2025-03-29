const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PaymentMethodSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['tarjeta', 'transferencia'], 
        required: true, 
        trim: true 
    },
    accountNumber: { 
        type: String, 
        required: function () { return this.type === 'tarjeta'; }, // Requerido solo si es tarjeta
        trim: true 
    },
    CVV: { 
        type: String,
        required: function () { return this.type === 'tarjeta'; }, // Solo si es tarjeta
        select: false // Evita que se devuelva en consultas por defecto
    }
}, { timestamps: true });

/**
 * Encripta el CVV antes de guardarlo en la base de datos.
 */
PaymentMethodSchema.pre('save', async function (next) {
    if (!this.isModified('CVV')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.CVV = await bcrypt.hash(this.CVV, salt);
    
    next();
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
