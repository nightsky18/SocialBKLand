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

// POST /api/books/validate-stock
router.post('/validate-stock', async (req, res) => {
    try {
      const cartItems = req.body;
  
      if (!Array.isArray(cartItems)) {
        return res.status(400).json({ success: false, message: 'El cuerpo debe ser un array de items' });
      }
  
      const outOfStock = [];
  
      for (const item of cartItems) {
        const book = await Book.findById(item.id).select('quantity title');
  
        if (!book || book.quantity < item.quantity) {
            console.log(`Libro sin stock:`, book);
            outOfStock.push({
                id: item.id,
                title: book?.title || 'Desconocido',
                availableQuantity: book?.quantity || 0
            });             
        }
      }
  
      if (outOfStock.length > 0) {
        return res.status(200).json({ success: false, outOfStock });
      }
  
      return res.json({ success: true });
  
    } catch (error) {
      console.error('Error en /validate-stock:', error);
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  });

  // POST /api/books/decrement-stock
  router.post('/decrement-stock', async (req, res) => {
    try {
      const items = req.body;
  
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Datos inválidos' });
      }
  
      for (const item of items) {
        if (!item.id || typeof item.quantity !== 'number') {
          return res.status(400).json({ success: false, message: 'Item inválido' });
        }
  
        const book = await Book.findById(item.id);
        if (!book || book.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para el libro con ID ${item.id}`
          });
        }
  
        book.quantity -= item.quantity;
        await book.save();
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error al descontar stock:', error);
      res.status(500).json({ success: false, message: 'Error al descontar stock' });
    }
  });  

// GET /api/books/:id/availability
router.get('/:id/availability', async (req, res) => {
    try {
      const { id } = req.params;
      const book = await Book.findById(id).select('quantity');
  
      if (!book) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
  
      res.json({ quantity: book.quantity });
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      res.status(500).json({ message: 'Error del servidor al verificar stock' });
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
