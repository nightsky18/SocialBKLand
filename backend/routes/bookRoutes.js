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

// Crear nuevo libro (físico o digital)
router.post("/", async (req, res) => {
    try {
        let book;

        if (req.body.type === 'digital') {
            // Validar campos específicos de libro digital
            const { format, fileSizeMB, downloadLink, author, quantity } = req.body;

            if (!format || !fileSizeMB || !downloadLink) {
                return res.status(400).json({
                    success: false,
                    message: "Para libros digitales son obligatorios: formato, tamaño de archivo y enlace de descarga"
                });
            }

            if (!author || quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Campos 'author' y 'quantity' también son obligatorios"
                });
            }

            book = new DigitalBook(req.body);
        } else {
            const { author, quantity } = req.body;

            if (!author || quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Campos 'author' y 'quantity' son obligatorios para libros físicos"
                });
            }

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

// Obtener todos los libros
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

// Obtener un libro por ID
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

//  actualizar solo el stock
router.patch("/:id/stock", async (req, res) => {
    const { quantity, delta } = req.body;

    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }

        let newQuantity;

        if (typeof delta === 'number') {
            newQuantity = book.quantity + delta;
        } else if (typeof quantity === 'number') {
            newQuantity = quantity;
        } else {
            return res.status(400).json({
                success: false,
                message: "Debes proporcionar 'quantity' (nuevo valor absoluto) o 'delta' (ajuste relativo)"
            });
        }

        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "El stock no puede ser menor a 0"
            });
        }

        book.quantity = newQuantity;
        await book.save();

        res.json({
            success: true,
            message: "Stock actualizado correctamente",
            data: book
        });
    } catch (error) {
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
