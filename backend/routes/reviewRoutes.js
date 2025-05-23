const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.libro) {
      filter.libro = req.query.libro; // 🔥 Esto es lo más importante
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


router.post("/", async (req, res) => {
  try {
    const { libro, user, rating, text } = req.body;

    const review = new Review({
      libro,
      user,
      rating,
      text
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('Error al guardar la reseña:', err);
    res.status(500).json({ message: 'Error al guardar la reseña' });
  }
});


router.get("/:id", async (req, res) => {
    const review = await Review.findById(req.params.id);
    res.json(review);
});

router.put("/:id", async (req, res) => {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedReview);
});

router.delete("/:id", async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Reseña eliminada" });
});

module.exports = router;
