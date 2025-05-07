const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Conectar a MongoDB
const connectDB = require("../config/db");
connectDB();

// utils/importData.js
const { Book } = require("../models/Book");



// Ruta del archivo book.json
const bookDataPath = path.join(__dirname, "../cache/books.json");

const importData = async () => {
    try {
        if (!fs.existsSync(bookDataPath)) {
            console.log("❌ El archivo `books.json` no existe.");
            return;
        }

        console.log("⏳ Importando `books.json`...\n");

        const bookData = JSON.parse(fs.readFileSync(bookDataPath, "utf-8"));

        if (bookData.length > 0) {
            await Book.insertMany(bookData);
            console.log(`✅ Datos importados en Book (${bookData.length} registros)`);
        } else {
            console.log("⚠️ El archivo `book.json` está vacío.");
        }

        console.log("\n🎉 Importación finalizada.");
    } catch (error) {
        console.error("❌ Error al importar datos de `books.json`:", error);
    }
};

module.exports = importData;
