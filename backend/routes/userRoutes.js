const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post("/", async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
});

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

router.put("/:id", async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
});

router.delete("/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado" });
});

module.exports = router;
