const express = require("express");
const router = express.Router();
const { Book, DigitalBook } = require("../models/Book");

// Helper para manejar errores
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor"
    });
};

router.post('/', async (req, res) => {
    try {
      
      const newBook = new Book(req.body);
      await newBook.save();
      
      res.status(201).json({
        success: true,
        data: newBook
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });
// Obtener todos los libros (ambos tipos)
router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Crear nuevo libro (físico o digital)
router.post("/", async (req, res) => {
    try {
        let book;
        
        if (req.body.type === 'digital') {
            // Validar campos específicos de libro digital
            if (!req.body.format || !req.body.fileSizeMB || !req.body.downloadLink) {
                return res.status(400).json({
                    success: false,
                    message: "Para libros digitales son obligatorios: formato, tamaño de archivo y enlace de descarga"
                });
            }
            book = new DigitalBook(req.body);
        } else {
            book = new Book(req.body);
        }

        const savedBook = await book.save();
        res.status(201).json({
            success: true,
            data: savedBook
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        handleError(res, error);
    }
});

// Obtener un libro específico por ID
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }
        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Actualizar un libro
router.put("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }

        // No permitir cambiar el tipo de libro
        if (req.body.type && req.body.type !== book.type) {
            return res.status(400).json({
                success: false,
                message: "No se puede cambiar el tipo de libro"
            });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: updatedBook
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        handleError(res, error);
    }
});

// Eliminar un libro
router.delete("/:id", async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }
        res.json({
            success: true,
            message: "Libro eliminado exitosamente"
        });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router; 
