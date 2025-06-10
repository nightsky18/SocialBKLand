// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Asumimos que esto conecta Mongoose
const authRoutes = require('./routes/authRoutes');
const createAdminIfNotExists = require("./utils/createAdmin"); // Asumimos que esto existe
const Book = require('./models/Book'); // Importamos el modelo Book para el sembrado
const bookRoutes = require('./routes/bookRoutes');

const multer = require('multer');
const importData = require("./utils/importData");

// Configurar variables de entorno
dotenv.config();

// Configuración de Multer para almacenamiento de archivos (existente, no lo modificamos)
const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'assets', 'images'));
    },
    filename: function (req, file, cb) {
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
app.use(cors()); // Asegura que el front-end pueda comunicarse
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conectar a la base de datos
connectDB().then(() => {
    console.log('Base de datos conectada.');
    // Crear admin quemado si no existe
    createAdminIfNotExists(); // Asumimos que no bloquea el inicio del servidor si falla
    // --- Añadimos el sembrado de la base de datos aquí ---
    //importData(); // Asumimos que esto importa datos de book.json si existe
     seedDatabase();
})
.catch(err => {
    console.error('Error al conectar a la base de datos:', err);
    // Es crucial que la DB esté conectada para que el servidor funcione correctamente.
    // Considera una lógica más robusta si la conexión falla, como reintentar o salir.
    // process.exit(1); // Descomenta si quieres que el servidor se detenga si la DB no conecta
});


// --- Función para sembrar la base de datos con libros iniciales ---
async function seedDatabase() {
    try {
        const bookCount = await Book.countDocuments(); // Contar documentos existentes

        if (bookCount === 0) {
            console.log('La colección de libros está vacía. Sembrando datos iniciales...');

            // Tu array original de libros (copia y pega aquí)
            const initialBooks = [
                // Ficción
                {
                  title: 'El viaje del héroe',
                  author: 'Autor Desconocido',
                  quantity: 10,
                  price: 12,
                  originalPrice: 20,
                  category: 'ficcion',
                  image: '/assets/images/Elviajedelheroe.webp',
                  isDiscounted: true,
                  description: 'Una emocionante narrativa sobre el poder del cambio y la resiliencia.',
                  rating: 4.8,
                  deliveryTime: '2-3 días hábiles',
                  comments: [
                    { user: 'Alice', text: 'Increíble narrativa, me hizo reflexionar mucho.' },
                    { user: 'Carlos', text: 'Recomendado para quienes buscan inspiración.' }
                  ],
                  isbn: '978-3-16-148410-0'
                },
                {
                  title: 'Cuentos de la noche',
                  author: 'Autor Desconocido',
                  quantity: 15,
                  price: 18,
                  category: 'ficcion',
                  image: '/assets/images/cuentosdelanoche.webp',
                  isDiscounted: false,
                  description: 'Una colección de cuentos mágicos para leer al caer la noche.',
                  rating: 4.6,
                  deliveryTime: '3-4 días hábiles',
                  comments: [
                    { user: 'Laura', text: 'Perfecto para los amantes de los cuentos cortos.' }
                  ],
                  isbn: '978-3-16-148410-1'
                },
                {
                  title: 'La tierra olvidada',
                  author: 'Autor Desconocido',
                  quantity: 20,
                  price: 22,
                  category: 'ficcion',
                  image: '/assets/images/latierraolvidada.webp',
                  isDiscounted: false,
                  description: 'Un viaje a un mundo perdido lleno de aventuras y desafíos.',
                  rating: 4.7,
                  deliveryTime: '4-5 días hábiles',
                  comments: [
                    { user: 'Pedro', text: 'La ambientación es maravillosa, te transporta.' }
                  ],
                  isbn: '978-3-16-148410-2'
                },
                {
                  title: 'El príncipe perdido',
                  author: 'Autor Desconocido',
                  quantity: 5,
                  price: 15,
                  originalPrice: 25,
                  category: 'ficcion',
                  image: '/assets/images/elprincipeperdido.png',
                  isDiscounted: true,
                  description: 'Una épica historia de redención y valentía.',
                  rating: 4.9,
                  deliveryTime: '1-2 días hábiles',
                  comments: [
                    { user: 'Sofía', text: 'Simplemente perfecto. Una joya literaria.' }
                  ],
                  isbn: '978-3-16-148410-3'
                },
                // No Ficción
                {
                  title: 'El arte de la negociación',
                  author: 'Autor Desconocido',
                  quantity: 10,
                  price: 20,
                  category: 'no-ficcion',
                  image: '/assets/images/artenegociacion.webp',
                  isDiscounted: false,
                  description: 'Domina el arte de negociar en cualquier situación.',
                  rating: 4.5,
                  deliveryTime: '2-3 días hábiles',
                  comments: [
                    { user: 'José', text: 'Muy práctico y aplicable al día a día.' }
                  ],
                  isbn: '978-3-16-148410-4'
                },
                {
                  title: 'La mente y sus secretos',
                  author: 'Autor Desconocido',
                  quantity: 8,
                  price: 14,
                  originalPrice: 18,
                  category: 'no-ficcion',
                  image: '/assets/images/mentescretos.jpg',
                  isDiscounted: true,
                  description: 'Explora los misterios de la mente humana.',
                  rating: 4.3,
                  deliveryTime: '3-4 días hábiles',
                  comments: [
                    { user: 'Ana', text: 'Fascinante, muy bien explicado.' }
                  ],
                  isbn: '978-3-16-148410-5'
                },
                {
                  title: 'Caminos a la felicidad',
                  author: 'Autor Desconocido',
                  quantity: 12,
                  price: 19,
                  category: 'no-ficcion',
                  image: '/assets/images/caminofelicidad.webp',
                  isDiscounted: false,
                  description: 'Descubre cómo encontrar la verdadera felicidad.',
                  rating: 4.7,
                  deliveryTime: '4-5 días hábiles',
                  comments: [
                    { user: 'Jorge', text: 'Inspirador, cambió mi perspectiva de vida.' }
                  ],
                  isbn: '978-3-16-148410-6'
                },
                {
                  title: 'Historias reales',
                  author: 'Autor Desconocido',
                  quantity: 7,
                  price: 25,
                  originalPrice: 30,
                  category: 'no-ficcion',
                  image: '/assets/images/historiasreales.jpeg',
                  isDiscounted: true,
                  description: 'Relatos emocionantes basados en hechos reales.',
                  rating: 4.6,
                  deliveryTime: '3-4 días hábiles',
                  comments: [
                    { user: 'Clara', text: 'Algunas historias son realmente impactantes.' }
                  ],
                  isbn: '978-3-16-148410-7'
                },
                // Aventura
                {
                  title: 'La isla del tesoro',
                  author: 'Autor Desconocido',
                  quantity: 9,
                  price: 10,
                  originalPrice: 15,
                  category: 'aventura',
                  image: '/assets/images/laisladeltesoro.webp',
                  isDiscounted: true,
                  description: 'La clásica historia de piratas y aventuras inolvidables.',
                  rating: 4.8,
                  deliveryTime: '2-3 días hábiles',
                  comments: [
                    { user: 'Gabriel', text: 'Una aventura clásica que no decepciona.' }
                  ],
                  isbn: '978-3-16-148410-8'
                },
                {
                  title: 'Aventuras en el fin del mundo',
                  author: 'Autor Desconocido',
                  quantity: 6,
                  price: 16,
                  category: 'aventura',
                  image: '/assets/images/EN-EL-FIN-DEL-MUNDO-PORTADATAG.jpg',
                  isDiscounted: false,
                  description: 'Descubre los rincones más remotos del planeta.',
                  rating: 4.4,
                  deliveryTime: '4-5 días hábiles',
                  comments: [
                    { user: 'Isabel', text: 'Una lectura apasionante y educativa.' }
                  ],
                  isbn: '978-3-16-148410-9'
                },
                {
                  title: 'El explorador perdido',
                  author: 'Autor Desconocido',
                  quantity: 10,
                  price: 22,
                  category: 'aventura',
                  image: '/assets/images/exploradorperdido.jpg',
                  isDiscounted: false,
                  description: 'Un relato de exploración y superación en terrenos desconocidos.',
                  rating: 4.7,
                  deliveryTime: '2-3 días hábiles',
                  comments: [
                    { user: 'Tomás', text: 'Increíble historia llena de misterio y valor.' }
                  ],
                  isbn: '978-3-16-148411-0'
                },
                {
                  title: 'Ríos misteriosos',
                  author: 'Autor Desconocido',
                  quantity: 14,
                  price: 18,
                  originalPrice: 22,
                  category: 'aventura',
                  image: '/assets/images/riosmisteriosos.webp',
                  isDiscounted: true,
                  description: 'Una travesía a través de los ríos más enigmáticos del mundo.',
                  rating: 4.6,
                  deliveryTime: '3-4 días hábiles',
                  comments: [
                    { user: 'Marta', text: 'Recomiendo este libro, es muy entretenido.' }
                  ],
                  isbn: '978-3-16-148411-1'
                },
                // Ciencia
                {
                  title: 'Los misterios del universo',
                  author: 'Autor Desconocido',
                  quantity: 10,
                  price: 28,
                  category: 'ciencia',
                  image: '/assets/images/losmisteriosdeluniverso.webp',
                  isDiscounted: false,
                  description: 'Explora los secretos más grandes del cosmos.',
                  rating: 4.9,
                  deliveryTime: '1-2 días hábiles',
                  comments: [
                    { user: 'Carlos', text: 'Maravilloso, me inspiró a estudiar astronomía.' }
                  ],
                  isbn: '978-3-16-148411-2'
                },
                {
                  title: 'La física para todos',
                  author: 'Autor Desconocido',
                  quantity: 11,
                  price: 15,
                  originalPrice: 20,
                  category: 'ciencia',
                  image: '/assets/images/lafisicaparatodos.jpg',
                  isDiscounted: true,
                  description: 'Una introducción accesible al mundo de la física.',
                  rating: 4.3,
                  deliveryTime: '3-4 días hábiles',
                  comments: [
                    { user: 'Elena', text: 'Muy claro y perfecto para principiantes.' }
                  ],
                  isbn: '978-3-16-148411-3'
                },
                {
                  title: 'El ADN y sus secretos',
                  author: 'Autor Desconocido',
                  quantity: 8,
                  price: 25,
                  category: 'ciencia',
                  image: '/assets/images/adn.webp',
                  isDiscounted: false,
                  description: 'Descubre la base de la vida a través del ADN.',
                  rating: 4.7,
                  deliveryTime: '4-5 días hábiles',
                  comments: [
                  { user: 'Luis', text: 'Un libro que cambia la forma en que ves la biología.' }
                  ],
                  isbn: '978-3-16-148411-4'
                  },
                  {
                  title: 'La evolución humana',
                  author: 'Autor Desconocido',
                  quantity: 12,
                  price: 18,
                  originalPrice: 24,
                  category: 'ciencia',
                  image: '/assets/images/evolucionhumana.webp',
                  isDiscounted: true,
                  description: 'Un estudio sobre la evolución de la humanidad a lo largo de los siglos.',
                  rating: 4.8,
                  deliveryTime: '2-3 días hábiles',
                  comments: [
                  { user: 'Andrés', text: 'Muy educativo, me ayudó a entender mejor nuestra historia.' }
                  ],
                  isbn: '978-3-16-148411-5'
                  }
                  ];   


            // Insertar los documentos en la colección 'books'
            const insertedBooks = await Book.insertMany(initialBooks);
            console.log(`Se sembraron ${insertedBooks.length} libros en la base de datos.`);

            // Opcional: Imprimir los IDs de los libros insertados para que puedas usarlos en la URL
            console.log("IDs de los libros insertados (usar en la URL ?id=):");
            insertedBooks.forEach(book => console.log(`- ${book.title}: ${book._id}`));


        } else {
            console.log(`La base de datos ya contiene ${bookCount} libros. No se sembrarán datos iniciales.`);
        }
    } catch (err) {
        console.error('Error al sembrar la base de datos:', err);
        // No detenemos el servidor si la siembra falla, pero registramos el error.
    }
}
// --- Fin función de sembrado ---


// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// Asegúrate de que esta línea exista si tus imágenes están en public/assets/images y las rutas en DB son como '/assets/images/...'
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));


// Rutas básicas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "catalogo.html"));
});


app.use("/api/admins", require("./routes/adminRoutes"));
// Asumiendo que uploadRoutes requiere el objeto upload
app.use("/api/upload", require("./routes/uploadRoutes")(upload));
// Asegúrate de que './routes/bookRoutes' contenga la ruta GET /:id
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/cart", require("./routes/cartRoutes")); // Asumimos que este maneja la lógica del carrito 
app.use("/api/community", require("./routes/communityRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/payment-methods", require("./routes/paymentMethodRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/moderators", require("./routes/moderatorRoutes"));
app.use('/api', authRoutes);
const receiptRoutes = require('./routes/receiptRoutes');
app.use('/api/receipts', receiptRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto http://SocialBKLand.com:${PORT}`));