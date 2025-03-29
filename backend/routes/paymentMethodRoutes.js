const express = require("express");
const PaymentMethod = require("../models/PaymentMethod");

const router = express.Router();

router.get("/", async (req, res) => {
    const methods = await PaymentMethod.find();
    res.json(methods);
});

router.post("/", async (req, res) => {
    const newMethod = new PaymentMethod(req.body);
    await newMethod.save();
    res.status(201).json(newMethod);
});

router.get("/:id", async (req, res) => {
    const method = await PaymentMethod.findById(req.params.id);
    res.json(method);
});

router.put("/:id", async (req, res) => {
    const updatedMethod = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMethod);
});

router.delete("/:id", async (req, res) => {
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ message: "Método de pago eliminado" });
});

module.exports = router;
