const express = require("express");
const Admin = require("../models/admin");

const router = express.Router();

// Obtener todos los administradores
router.get("/", async (req, res) => {
    const admins = await Admin.find();
    res.json(admins);
});

// Crear un nuevo administrador
router.post("/", async (req, res) => {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.status(201).json(newAdmin);
});

// Obtener un administrador por ID
router.get("/:id", async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    res.json(admin);
});

// Actualizar administrador
router.put("/:id", async (req, res) => {
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAdmin);
});

// Eliminar administrador
router.delete("/:id", async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Administrador eliminado" });
});

module.exports = router;
