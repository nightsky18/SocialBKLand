const express = require("express");
const Payment = require("../models/Payment");

const router = express.Router();

router.get("/", async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
});

router.post("/", async (req, res) => {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.status(201).json(newPayment);
});

router.get("/:id", async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    res.json(payment);
});

router.put("/:id", async (req, res) => {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPayment);
});

router.delete("/:id", async (req, res) => {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Pago eliminado" });
});

module.exports = router;
