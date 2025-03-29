const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ['tarjeta', 'transferencia'], 
        required: true,
        trim: true 
    },
    total: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pendiente', 'completado'], 
        default: 'pendiente', 
        trim: true 
    },
    transactionDetails: { 
        type: String, 
        trim: true, 
        maxlength: 500 
    },
    paymentDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
