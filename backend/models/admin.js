const mongoose = require("mongoose");
const User = require("./User");

// Definir el esquema para el modelo de Admin
const adminSchema = new mongoose.Schema({
  permisos: {
    type: [String],
    default: [], // Valor por defecto para el arreglo de permisos
  },
});

// Crear el modelo Admin utilizando un discriminador si ya existe un modelo User
const Admin = mongoose.models.Admin || User.discriminator("Admin", adminSchema);

module.exports = Admin; // Exportar el modelo Admin
