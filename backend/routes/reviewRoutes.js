const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

router.get("/", async (req, res) => {
    const reviews = await Review.find();
    res.json(reviews);
});

router.post("/", async (req, res) => {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json(newReview);
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
