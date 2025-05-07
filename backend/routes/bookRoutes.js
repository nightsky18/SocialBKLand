const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Obtener todos los libros (usado por el catálogo)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find().sort({ title: 1 }).lean();

        // Añadir el campo 'id' como string a cada libro
        const booksWithId = books.map(book => ({
            ...book,
            id: book._id.toString()
        }));

        res.status(200).json(booksWithId);
    } catch (err) {
        console.error('Error al obtener los libros:', err);
        res.status(500).json({ message: 'Error al obtener los libros' });
    }
});

// Obtener un libro por ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.status(200).json(book);
    } catch (err) {
        console.error('Error al buscar el libro:', err);
        res.status(500).json({ message: 'Error al buscar el libro' });
    }
});

module.exports = router;
