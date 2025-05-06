const mongoose = require('mongoose');

const options = { discriminatorKey: 'type', collection: 'books' };

// 📘 Modelo base de libros
const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true }, 
    quantity: { type: Number, required: true, min: 0 },
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
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 🔹 Ahora referencia a un usuario real
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, options);

const Book = mongoose.model('Book', BookSchema);

//  Modelo de libro digital (subtipo de Book)
const DigitalBookSchema = new mongoose.Schema({
    format: { type: String, enum: ['PDF', 'EPUB', 'MOBI'], required: true },
    fileSizeMB: { type: Number, required: true },
    downloadLink: { type: String, required: true }
});

// Se crea el discriminador de libros digitales
const DigitalBook = Book.discriminator('DigitalBook', DigitalBookSchema);


module.exports = { Book, DigitalBook };
