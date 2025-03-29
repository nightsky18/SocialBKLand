const express = require("express");
const Cart = require("../models/Cart");

const router = express.Router();

router.get("/", async (req, res) => {
    const cartItems = await Cart.find();
    res.json(cartItems);
});

router.post("/", async (req, res) => {
    const newCartItem = new Cart(req.body);
    await newCartItem.save();
    res.status(201).json(newCartItem);
});

router.delete("/:id", async (req, res) => {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item eliminado del carrito" });
});

module.exports = router;
