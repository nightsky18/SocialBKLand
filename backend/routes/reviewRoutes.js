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

    // Verifica si ya existe una reseña de este usuario para este libro
    const existingReview = await Review.findOne({ libro, user });
    if (existingReview) {
      return res.status(400).json({ message: 'Ya has enviado una reseña para este libro con ese nombre.' });
    }

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

// NUEVAS RUTAS PARA COMENTARIOS

// Agregar comentario a una reseña
router.post("/:reviewId/comments", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { user, text } = req.body;

    // Validar que el texto no esté vacío
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'El texto del comentario es requerido' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    const commentData = {
      user: user || 'Anónimo',
      text: text.trim()
    };

    await review.addComment(commentData);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({ message: 'Error al agregar comentario' });
  }
});

// Obtener comentarios de una reseña específica
router.get("/:reviewId/comments", async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json(review.comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error al obtener comentarios' });
  }
});

// Eliminar comentario específico
router.delete("/:reviewId/comments/:commentId", async (req, res) => {
  try {
    const { reviewId, commentId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    const comment = review.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    await review.removeComment(commentId);
    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error al eliminar comentario' });
  }
});

// RUTAS EXISTENTES PARA RESEÑAS

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
