const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, unique: true},
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    image: { type: String },
    isDiscounted: { type: Boolean, default: false },
    description: { type: String },
    rating: { type: Number, default: 0 },
    deliveryTime: { type: String },
    comments: [
        {
            user: { type: String },
            text: { type: String }
        }
    ]
});

module.exports = mongoose.model('Book', BookSchema);
