const mongoose = require("mongoose");
require("dotenv").config(); // Cargar variables de entorno

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(process.env.MONGO_URI, {
            
        });

        console.log(`✅ MongoDB conectado: ${dbConnection.connection.host}`);
    } catch (error) {
        console.error(`❌ Error conectando a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
