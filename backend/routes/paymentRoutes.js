const express = require("express");
const fs = require("fs");
const path = require("path");
const Payment = require("../models/Payment");

const router = express.Router();

const PAYMENT_PATH = path.join(__dirname, "../cache/Payment.json");

router.get("/", async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
});

router.post("/", (req, res) => {
    let payments = [];
    if (fs.existsSync(PAYMENT_PATH)) {
        payments = JSON.parse(fs.readFileSync(PAYMENT_PATH, "utf-8"));
    }
    payments.push(req.body);
    fs.writeFileSync(PAYMENT_PATH, JSON.stringify(payments, null, 2));
    res.status(201).json({ message: "Comprobante guardado", id: req.body.paymentId });
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
