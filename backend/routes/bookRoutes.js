const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');


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
        res.status(500).json({ message: 'El isbn ya esta registrado, actualiza la cantidad del libro' });
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
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
  
      // Eliminar la imagen físicamente del disco
      const imagePath = path.join(__dirname, '..', 'public', book.image); // ej: /assets/images/book.jpg
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Imagen eliminada: ${imagePath}`);
      } else {
        console.warn(`Imagen no encontrada en disco: ${imagePath}`);
      }
  
      await book.deleteOne();
      res.status(200).json({ message: 'Libro e imagen eliminados correctamente' });
    } catch (err) {
      console.error('Error al eliminar libro:', err);
      res.status(500).json({ message: 'Error al eliminar el libro' });
    }
  });
  

module.exports = router;
