const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");


// Configurar variables de entorno
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Ejecutar importación automática solo si la base de datos está vacía
// const importData = require(__dirname + "/utils/importData");


// importData()
//     .then(() => console.log("Datos importados automáticamente."))
//     .catch(err => console.log(" Error importando datos:", err));

// Rutas
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/community", require("./routes/communityRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/payment-methods", require("./routes/paymentMethodRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/moderators", require("./routes/moderatorRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
