const mongoose = require('mongoose');


const User = require('./User');

const ClientSchema = new mongoose.Schema({
    metodosPago: [{ type: String }],
    historialCompras: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
});

const Client = User.discriminator('cliente', ClientSchema);
module.exports = Client;
