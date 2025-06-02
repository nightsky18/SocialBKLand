const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const checkPostAuthor = require("../middleware/checkPostAuthor"); // si lo pones aparte

router.get("/", async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

router.get("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.json(post);
});

router.put("/:id", async (req, res) => {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
});

router.delete("/:id", async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Publicación eliminada" });
});

router.get("/community/:communityId", async (req, res) => {
  try {
    const posts = await Post.find({ community: req.params.communityId })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
});

router.post("/:id/report", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isReported: true });
    res.status(200).json({ message: "Publicación reportada" });
  } catch (err) {
    res.status(500).json({ message: "Error al reportar publicación" });
  }
});

router.put("/:id", checkPostAuthor, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: "El contenido no puede estar vacío" });
  }

  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error al editar publicación" });
  }
});

router.delete("/:id", checkPostAuthor, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Publicación eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar publicación" });
  }
});

module.exports = router;
