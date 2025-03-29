const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Conectar a MongoDB
const connectDB = require("../config/db");
connectDB();

// Importar modelos automáticamente desde la carpeta models/
const modelsDir = path.join(__dirname, "../models");
const models = {};

fs.readdirSync(modelsDir).forEach((file) => {
    if (file.endsWith(".js")) {
        const modelName = file.replace(".js", "");
        models[modelName] = require(path.join(modelsDir, file));
    }
});

// Ruta de los archivos JSON
const dataDir = path.join(__dirname, "../cache");

if (!fs.existsSync(dataDir)) {
    console.log("❌ La carpeta `cache/` no existe.");
    process.exit(1);
}

// Función para importar datos
const importData = async () => {
    try {
        console.log("⏳ Importando datos JSON...\n");

        const files = fs.readdirSync(dataDir);

        for (const file of files) {
            if (file.endsWith(".json")) {
                const modelName = file.replace(".json", "");

                if (models[modelName]) {
                    const filePath = path.join(dataDir, file);
                    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

                    if (jsonData.length > 0) {
                        await models[modelName].insertMany(jsonData);
                        console.log(`✅ Datos importados en ${modelName} (${jsonData.length} registros)`);
                    } else {
                        console.log(`⚠️ Archivo ${file} está vacío.`);
                    }
                } else {
                    console.log(`⚠️ No se encontró un modelo para ${modelName}.`);
                }
            }
        }

        console.log("\n🎉 Importación finalizada.");
    } catch (error) {
        console.error("❌ Error al importar datos:", error);
    }
};

// Exportar la función para ser usada en `server.js`
module.exports = importData;
