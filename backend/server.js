const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require('./routes/authRoutes');

const multer = require('multer');

// Configurar variables de entorno
dotenv.config();

// Configuración de Multer para almacenamiento de archivos
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    // Asegúrate de que esta carpeta exista
    cb(null, path.join(__dirname, 'public', 'assets', 'images'));
  },
  filename: function (req, file, cb) {
    // Nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'book-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: function (req, file, cb) {
    // Solo aceptar imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conectar a la base de datos
connectDB();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas básicas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalogo.html"));
});

// Rutas API
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes")(upload)); // Pasamos la configuración de multer
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
app.use('/api', authRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto http://localhost:${PORT}`));
