const express = require("express");
const Community = require("../models/Community");
const { createCommunity } = require('../Controllers/communityController.js');
const authenticateUser = require('../middlewares/authenticateUser');

const router = express.Router();

router.get("/", async (req, res) => {
  const communities = await Community.find()
    .populate("members.user", "name email") // poblamos solo campos necesarios
    .populate("posts")
    .sort({ createdAt: -1 });

  res.json(communities);
});


// POST /api/communities - Crear nueva comunidad
router.post("/", authenticateUser, createCommunity);

router.get("/:id", async (req, res) => {
    const community = await Community.findById(req.params.id);
    res.json(community);
});

router.put("/:id", async (req, res) => {
    const updatedCommunity = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCommunity);
});

router.delete("/:id", async (req, res) => {
    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: "Comunidad eliminada" });
});

module.exports = router;
