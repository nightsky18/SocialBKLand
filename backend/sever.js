const express = require('express');
const connectDB = require('./config/db');
const app = express();

// Conectar a MongoDB
connectDB();

app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));
