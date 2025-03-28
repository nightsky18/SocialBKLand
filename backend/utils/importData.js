const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Importar modelos
const User = require('../models/User');
const Admin = require('../models/Admin');
const Moderator = require('../models/Moderator');
const Client = require('../models/Client');
const { Book, DigitalBook } = require('../models/Book');

class ImportData {
    static async importarDatos() {
        try {
            console.log('⏳ Importando datos JSON...');

            // Cargar datos desde JSON
            const userData = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/user.json'), 'utf-8'));
            const booksData = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/books.json'), 'utf-8'));

            // Función para importar datos sin duplicados
            async function bulkUpsert(Model, data, uniqueField) {
                if (!data || data.length === 0) return;

                const bulkOps = data.map(item => ({
                    updateOne: {
                        filter: { [uniqueField]: item[uniqueField] },
                        update: { $setOnInsert: item },
                        upsert: true
                    }
                }));

                await Model.bulkWrite(bulkOps, { ordered: false }).catch(err => {
                    console.error(`❌ Error en ${Model.collection.name}:`, err.message);
                });

                console.log(`✅ Datos importados en ${Model.collection.name}`);
            }

            // 1️⃣ Importar usuarios en `User`
            await bulkUpsert(User, userData, 'email');

            // 2️⃣ Obtener IDs reales de los usuarios importados
            const usersInDB = await User.find({}, '_id email rol');
            const usersMap = new Map(usersInDB.map(user => [user.email, user._id]));

            // 3️⃣ Filtrar usuarios según su rol y mapearlos a sus respectivas colecciones
            const admins = usersInDB
                .filter(user => user.rol === 'administrador')
                .map(user => ({ usuario: user._id }));

            const moderators = usersInDB
                .filter(user => user.rol === 'moderador')
                .map(user => ({ usuario: user._id, permisos: ['eliminar_comentarios', 'aprobar_reviews'] }));

            const clients = usersInDB
                .filter(user => user.rol === 'cliente')
                .map(user => ({ usuario: user._id, metodosPago: [], historialCompras: [] }));

            // 4️⃣ Importar roles en Admin, Moderator y Client
            await bulkUpsert(Admin, admins, 'usuario');
            await bulkUpsert(Moderator, moderators, 'usuario');
            await bulkUpsert(Client, clients, 'usuario');

            // 5️⃣ Separar libros físicos y digitales usando `type`
            const physicalBooks = booksData
                .filter(book => book.type !== 'DigitalBook')
                .map(book => ({ ...book, type: 'Book' }));

            const digitalBooks = booksData
                .filter(book => book.type === 'DigitalBook')
                .map(book => ({
                    ...book,
                    type: 'DigitalBook',
                    formato: book.formato || 'PDF',
                    tamañoArchivoMB: book.tamañoArchivoMB || 5,
                    enlaceDescarga: book.enlaceDescarga || ''
                }));

            // 6️⃣ Importar libros físicos y digitales
            await bulkUpsert(Book, physicalBooks, 'isbn');
            await bulkUpsert(DigitalBook, digitalBooks, 'isbn');

            console.log('✅ Datos importados correctamente');
        } catch (error) {
            console.error('❌ Error al importar los datos:', error);
        }
    }
}

module.exports = ImportData;
