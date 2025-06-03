const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const checkPostAuthor = require("../middlewares/checkPostAuthor"); // si lo pones aparte
const Community = require("../models/Community");

router.get("/", async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

router.post('/', async (req, res) => {
  try {
    const { content, userId, communityId } = req.body;
    console.log("POST recibido con body:", req.body);

    if (!content || !userId || !communityId) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const post = new Post({
      content,
      author: userId,
      community: communityId
    });

    await post.save();

    // Asociarlo a la comunidad
    await Community.findByIdAndUpdate(communityId, {
      $push: { posts: post._id }
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('Error al crear post:', err);
    res.status(500).json({ message: 'Error al crear post' });
  }
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
    const { communityId } = req.params;
    console.log(`[postRoutes] GET /api/posts/community/${communityId}`);
    // Buscar TODOS los posts cuyo campo `community` sea `communityId`
    // además, populamos author para que traiga nombre del autor
    const posts = await Post.find({ community: communityId })
      .populate("author", "name")      // opcional: traemos solo nombre del autor
      .sort({ createdAt: -1 });        // opcional: ordenamos por fecha descendente
    console.log("[postRoutes] posts encontrados:", posts.length);
    return res.json(posts);
  } catch (err) {
    console.error("[postRoutes] Error al obtener posts de comunidad:", err);
    return res.status(500).json({ message: "Error interno al obtener posts" });
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
