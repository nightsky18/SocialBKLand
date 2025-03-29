const mongoose = require("mongoose");
const User = require("./User"); // Modelo base

// Definir el esquema específico de Admin
const AdminSchema = new mongoose.Schema({
    permisos: {
        type: [String],
        default: [] // No obligatorio en la importación
    }
});

// Evitar registrar el discriminador más de una vez
const Admin = User.discriminator("Admin", AdminSchema);

module.exports = Admin;
