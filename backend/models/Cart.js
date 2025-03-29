const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    total: { type: Number, default: 0 } // Será recalculado antes de guardar
});

//  Middleware para calcular el total antes de guardar
CartSchema.pre('save', async function (next) {
    try {
        const cart = this;
        let total = 0;

        // Obtener detalles de cada libro
        for (const item of cart.items) {
            const book = await mongoose.model('Book').findById(item.book);
            if (book) {
                total += item.quantity * book.price;
            }
        }

        cart.total = total;
        next();
    } catch (error) {
        next(error);
    }
});

// Virtual para calcular el total dinámicamente
CartSchema.virtual('calculatedTotal').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity * (item.book?.price || 0), 0);
});

module.exports = mongoose.model('Cart', CartSchema);
