const express = require("express");
const PaymentMethod = require("../models/PaymentMethod");
const fs = require('fs');
const path = require('path');
const PAYMENT_METHOD_PATH = path.join(__dirname, '../cache/PaymentMethod.json');

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

// Obtener métodos de pago por usuario
router.get('/user/:userId', async (req, res) => {
    const methods = await PaymentMethod.find({ user: req.params.userId }).select('+CVV');
    res.json(methods);
});

// Guardar método de pago en PaymentMethod.json
router.post('/save-json', (req, res) => {
    let methods = [];
    if (fs.existsSync(PAYMENT_METHOD_PATH)) {
        methods = JSON.parse(fs.readFileSync(PAYMENT_METHOD_PATH, 'utf-8'));
    }
    methods.push(req.body);
    fs.writeFileSync(PAYMENT_METHOD_PATH, JSON.stringify(methods, null, 2));
    res.status(201).json({ message: 'Método guardado en PaymentMethod.json' });
});

module.exports = router;
