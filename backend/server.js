// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Asumimos que esto conecta Mongoose
const authRoutes = require('./routes/authRoutes');
const createAdminIfNotExists = require("./utils/createAdmin"); // Asumimos que esto existe
const Book = require('./models/Book'); // Importamos el modelo Book para el sembrado

const multer = require('multer');

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
                    title: 'El viaje del héroe', price: 12, originalPrice: 20, category: 'ficcion', image: '/assets/images/Elviajedelheroe.webp', isDiscounted: true, description: 'Una emocionante narrativa sobre el poder del cambio y la resiliencia.', rating: 4.8, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Alice', text: 'Increíble narrativa, me hizo reflexionar mucho.' }, { user: 'Carlos', text: 'Recomendado para quienes buscan inspiración.' }]
                },
                {
                    title: 'Cuentos de la noche', price: 18, category: 'ficcion', image: '/assets/images/cuentosdelanoche.webp', isDiscounted: false, description: 'Una colección de cuentos mágicos para leer al caer la noche.', rating: 4.6, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Laura', text: 'Perfecto para los amantes de los cuentos cortos.' }]
                },
                 {
                    title: 'La tierra olvidada', price: 22, category: 'ficcion', image: '/assets/images/latierraolvidada.webp', isDiscounted: false, description: 'Un viaje a un mundo perdido lleno de aventuras y desafíos.', rating: 4.7, deliveryTime: '4-5 días hábiles', comments: [{ user: 'Pedro', text: 'La ambientación es maravillosa, te transporta.' }]
                },
                {
                    title: 'El príncipe perdido', price: 15, originalPrice: 25, category: 'ficcion', image: '/assets/images/elprincipeperdido.png', isDiscounted: true, description: 'Una épica historia de redención y valentía.', rating: 4.9, deliveryTime: '1-2 días hábiles', comments: [{ user: 'Sofía', text: 'Simplemente perfecto. Una joya literaria.' }]
                },
                // No Ficción
                {
                    title: 'El arte de la negociación', price: 20, category: 'no-ficcion', image: '/assets/images/artenegociacion.webp', isDiscounted: false, description: 'Domina el arte de negociar en cualquier situación.', rating: 4.5, deliveryTime: '2-3 días hábiles', comments: [{ user: 'José', text: 'Muy práctico y aplicable al día a día.' }]
                },
                {
                    title: 'La mente y sus secretos', price: 14, originalPrice: 18, category: 'no-ficcion', image: '/assets/images/mentescretos.jpg', isDiscounted: true, description: 'Explora los misterios de la mente humana.', rating: 4.3, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Ana', text: 'Fascinante, muy bien explicado.' }]
                },
                {
                    title: 'Caminos a la felicidad', price: 19, category: 'no-ficcion', image: '/assets/images/caminofelicidad.webp', isDiscounted: false, description: 'Descubre cómo encontrar la verdadera felicidad.', rating: 4.7, deliveryTime: '4-5 días hábiles', comments: [{ user: 'Jorge', text: 'Inspirador, cambió mi perspectiva de vida.' }]
                },
                {
                    title: 'Historias reales', price: 25, originalPrice: 30, category: 'no-ficcion', image: '/assets/images/historiasreales.jpeg', isDiscounted: true, description: 'Relatos emocionantes basados en hechos reales.', rating: 4.6, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Clara', text: 'Algunas historias son realmente impactantes.' }]
                },
                // Aventura
                {
                    title: 'La isla del tesoro', price: 10, originalPrice: 15, category: 'aventura', image: '/assets/images/laisladeltesoro.webp', isDiscounted: true, description: 'La clásica historia de piratas y aventuras inolvidables.', rating: 4.8, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Gabriel', text: 'Una aventura clásica que no decepciona.' }]
                },
                {
                    title: 'Aventuras en el fin del mundo', price: 16, category: 'aventura', image: '/assets/images/EN-EL-FIN-DEL-MUNDO-PORTADATAG.jpg', isDiscounted: false, description: 'Descubre los rincones más remotos del planeta.', rating: 4.4, deliveryTime: '4-5 días hábiles', comments: [{ user: 'Isabel', text: 'Una lectura apasionante y educativa.' }]
                },
                {
                    title: 'El explorador perdido', price: 22, category: 'aventura', image: '/assets/images/exploradorperdido.jpg', isDiscounted: false, description: 'Un relato de exploración y superación en terrenos desconocidos.', rating: 4.7, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Tomás', text: 'Increíble historia llena de misterio y valor.' }]
                },
                {
                    title: 'Ríos misteriosos', price: 18, originalPrice: 22, category: 'aventura', image: '/assets/images/riosmisteriosos.webp', isDiscounted: true, description: 'Una travesía a través de los ríos más enigmáticos del mundo.', rating: 4.6, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Marta', text: 'Recomiendo este libro, es muy entretenido.' }]
                },
                // Ciencia
                {
                    title: 'Los misterios del universo', price: 28, category: 'ciencia', image: '/assets/images/losmisteriosdeluniverso.webp', isDiscounted: false, description: 'Explora los secretos más grandes del cosmos.', rating: 4.9, deliveryTime: '1-2 días hábiles', comments: [{ user: 'Carlos', text: 'Maravilloso, me inspiró a estudiar astronomía.' }]
                },
                {
                    title: 'La física para todos', price: 15, originalPrice: 20, category: 'ciencia', image: '/assets/images/lafisicaparatodos.jpg', isDiscounted: true, description: 'Una introducción accesible al mundo de la física.', rating: 4.3, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Elena', text: 'Muy claro y perfecto para principiantes.' }]
                },
                {
                    title: 'El ADN y sus secretos', price: 25, category: 'ciencia', image: '/assets/images/adn.webp', isDiscounted: false, description: 'Descubre la base de la vida a través del ADN.', rating: 4.7, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Luis', text: 'Cautivador, perfecto para estudiantes de biología.' }]
                },
                {
                    title: 'Energías renovables', price: 18, originalPrice: 23, category: 'ciencia', image: '/assets/images/energiasrenovables.webp', isDiscounted: true, description: 'Todo lo que necesitas saber sobre las energías limpias.', rating: 4.5, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Natalia', text: 'Informativo y relevante para los tiempos actuales.' }]
                },
                {
                    title: 'Guía para programadores', price: 30, category: 'ciencia', image: '/assets/images/guiaparaprogramadores.webp', isDiscounted: false, description: 'Una guía esencial para iniciarse en el mundo de la programación.', rating: 4.8, deliveryTime: '1-2 días hábiles', comments: [{ user: 'Juan', text: 'Muy útil, lo recomiendo a nuevos desarrolladores.' }]
                },
                // Miscelánea
                {
                    title: 'Las mejores recetas', price: 12, originalPrice: 15, category: 'no-ficcion', image: '/assets/images/lasmejoresrecetas.webp', isDiscounted: true, description: 'Recetas deliciosas y fáciles para toda la familia.', rating: 4.6, deliveryTime: '3-4 días hábiles', comments: [{ user: 'Andrea', text: '¡Delicioso! Muy práctico.' }]
                },
                {
                    title: 'Cuentos infantiles', price: 8, category: 'ficcion', image: '/assets/images/cuentosinfantiles.png', isDiscounted: false, description: 'Cuentos mágicos para los más pequeños.', rating: 4.4, deliveryTime: '2-3 días hábiles', comments: [{ user: 'Diana', text: 'A mis hijos les encanta este libro.' }]
                },
                {
                    title: 'Atlas de aventuras', price: 20, category: 'aventura', image: '/assets/images/atlasdeaventuras.jpeg', isDiscounted: false, description: 'Explora el mundo con este fascinante atlas ilustrado.', rating: 4.9, deliveryTime: '1-2 días hábiles', comments: [{ user: 'Miguel', text: 'Perfecto para los exploradores curiosos.' }]
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
// Asegúrate de que esta línea exista si tus imágenes están en public/assets/images y las rutas en DB son como '/assets/images/...'
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));


// Rutas básicas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "catalogo.html"));
});

// Rutas API (ya existentes, solo nos aseguramos de que 'bookRoutes' tenga la ruta :id)
app.use("/api/admins", require("./routes/adminRoutes"));
// Asumiendo que uploadRoutes requiere el objeto upload
app.use("/api/upload", require("./routes/uploadRoutes")(upload));
// Asegúrate de que './routes/bookRoutes' contenga la ruta GET /:id
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/cart", require("./routes/cartRoutes")); // Asumimos que este maneja la lógica del carrito (¿backend?)
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