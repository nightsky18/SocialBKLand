// routes/adminLogRoutes.js
const express = require("express");
const router = express.Router();
const AdminLog = require("../models/AdminLog");

// ✅ GET: Obtener todos los registros
router.get("/", async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ Error al obtener logs:", err);
    res.status(500).json({ message: "Error al obtener registros administrativos." });
  }
});

// ✅ GET: Obtener un log por ID
router.get("/:id", async (req, res) => {
  try {
    const log = await AdminLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log no encontrado." });
    res.json(log);
  } catch (err) {
    console.error("❌ Error al buscar log:", err);
    res.status(500).json({ message: "Error al buscar registro." });
  }
});

// ✅ POST: Crear un nuevo log
router.post("/", async (req, res) => {
  try {
    const newLog = await AdminLog.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    console.error("❌ Error al crear log:", err);
    res.status(400).json({ message: "Datos inválidos para crear el log." });
  }
});

// ✅ DELETE: Eliminar un log
router.delete("/:id", async (req, res) => {
  try {
    const result = await AdminLog.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Log no encontrado." });
    res.json({ message: "Log eliminado correctamente." });
  } catch (err) {
    console.error("❌ Error al eliminar log:", err);
    res.status(500).json({ message: "Error al eliminar el log." });
  }
});

module.exports = router;
