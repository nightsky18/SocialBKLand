const express = require("express");
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rutas
const adminRoutes = require("./routes/adminRoutes");
const bookRoutes = require("./routes/bookRoutes");
const cartRoutes = require("./routes/cartRoutes");
const clientRoutes = require("./routes/clientRoutes");
const communityRoutes = require("./routes/communityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const postRoutes = require("./routes/postRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");

// Configuración
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'catalogo.html'));
});

// Rutas
app.use("/api/admins", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
