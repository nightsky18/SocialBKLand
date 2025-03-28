const mongoose = require("mongoose");

const path = require('path');
const ImportData = require(path.join(__dirname, '../utils/importData'));

require("dotenv").config(); // Cargar variables de entorno

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

        // Importar datos JSON después de conectar
        await ImportData.importarDatos();

    } catch (error) {
        console.error(`❌ Error conectando a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
