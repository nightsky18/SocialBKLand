const express = require("express");
const Community = require("../models/Community");

const router = express.Router();

router.get("/", async (req, res) => {
    const communities = await Community.find();
    res.json(communities);
});

router.post("/", async (req, res) => {
    const newCommunity = new Community(req.body);
    await newCommunity.save();
    res.status(201).json(newCommunity);
});

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
