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
// Crear un nuevo libro
router.post('/', async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            quantity,
            category,
            description,
            price,
            originalPrice,
            image,
            isDiscounted,
            deliveryTime,
            rating
        } = req.body;

        const newBook = new Book({
            title,
            author,
            isbn,
            quantity,
            category,
            description,
            price,
            originalPrice,
            image,
            isDiscounted,
            deliveryTime,
            rating
        });

        const saved = await newBook.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error al crear el libro:', err);
        res.status(500).json({ message: 'Error al crear el libro' });
    }
});

// Actualizar un libro existente
router.put('/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }

        res.status(200).json(updatedBook);
    } catch (err) {
        console.error('Error al actualizar el libro:', err);
        res.status(500).json({ message: 'Error al actualizar el libro' });
    }
});

// Eliminar un libro
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }

        res.status(200).json({ message: 'Libro eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar el libro:', err);
        res.status(500).json({ message: 'Error al eliminar el libro' });
    }
});


module.exports = router;
