const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

router.get("/", async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

router.post("/", async (req, res) => {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
});

router.get("/:id", async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.json(book);
});

router.put("/:id", async (req, res) => {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
});

router.delete("/:id", async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Libro eliminado" });
});

module.exports = router;
