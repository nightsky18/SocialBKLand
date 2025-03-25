const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    libros: [
        {
            libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
            cantidad: { type: Number, required: true, min: 1 } 
        }
    ],
    total: { type: Number, default: 0 }
});

module.exports = mongoose.model('Cart', CartSchema);
