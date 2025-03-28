const mongoose = require('mongoose');

const options = { discriminatorKey: 'type', collection: 'books' };

const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, unique: true },
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
}, options);

const Book = mongoose.model('Book', BookSchema);

const DigitalBookSchema = new mongoose.Schema({
    formato: { type: String, enum: ['PDF', 'EPUB', 'MOBI'], required: true },
    tamañoArchivoMB: { type: Number, required: true },
    enlaceDescarga: { type: String, required: true }
}, { collection: 'digital_books' });

const DigitalBook = Book.discriminator('DigitalBook', DigitalBookSchema);

module.exports = { Book, DigitalBook };
