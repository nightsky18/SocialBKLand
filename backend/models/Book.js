// models/book.js
const mongoose = require('mongoose');

// Sub-esquema para los comentarios (si los quieres guardar)
const commentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    text: { type: String, required: true }
}, { _id: false }); // No necesitamos un _id separado para cada comentario en este caso

// Esquema principal para el libro
const bookSchema = new mongoose.Schema({
    // MongoDB automáticamente añade un campo _id como ObjectId único.
    // Este será el identificador que usaremos.
    title: { type: String, required: true },
    author: { type: String, required: true }, 
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true },
    originalPrice: { type: Number }, // Opcional
    category: { type: String, required: true },
    image: { type: String, required: true }, // Ruta a la imagen
    isDiscounted: { type: Boolean, default: false },
    description: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    deliveryTime: { type: String },
    comments: [commentSchema] // Un array de comentarios usando el sub-esquema
}, {
    timestamps: true // Añade campos createdAt y updatedAt automáticamente
});


module.exports = mongoose.model('Book', bookSchema);