const express = require("express");
const Client = require("../models/Client");

const router = express.Router();

router.get("/", async (req, res) => {
    const clients = await Client.find();
    res.json(clients);
});

router.post("/", async (req, res) => {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
});

router.get("/:id", async (req, res) => {
    const client = await Client.findById(req.params.id);
    res.json(client);
});

router.put("/:id", async (req, res) => {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClient);
});

router.delete("/:id", async (req, res) => {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Cliente eliminado" });
});

module.exports = router;
