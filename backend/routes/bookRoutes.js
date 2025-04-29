// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book'); // Importa el modelo Book
const mongoose = require('mongoose'); // Necesario para validar ObjectId

// Ejemplo: Ruta para OBTENER TODOS los libros (si la necesitas)
// router.get('/', async (req, res) => {
//     try {
//         const books = await Book.find();
//         res.json(books);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// --- NUEVA RUTA: Obtener UN libro por su ID ---
router.get('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;

        // Validar si el ID proporcionado es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: 'ID de libro inválido' });
        }

        // Buscar el libro por su _id en la base de datos
        const book = await Book.findById(bookId);

        if (!book) {
            // Si no se encuentra el libro, enviar una respuesta 404
            return res.status(404).json({ message: 'Libro no encontrado' });
        }

        // Enviar los datos del libro encontrado
        // Mongoose transforma automáticamente el _id en un campo 'id' virtual
        res.json(book);

    } catch (error) {
        console.error('Error al obtener libro por ID:', error);
        // Enviar un error 500 si ocurre un problema con la DB
        res.status(500).json({ message: 'Error interno del servidor al buscar libro' });
    }
});

// Ejemplo: Ruta para CREAR un nuevo libro (si la necesitas, probablemente protegida)
// router.post('/', async (req, res) => {
//     const book = new Book({
//         title: req.body.title,
//         // ...otras propiedades del body
//     });
//     try {
//         const newBook = await book.save();
//         res.status(201).json(newBook);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// ... otras rutas para PUT, DELETE, etc.

module.exports = router;