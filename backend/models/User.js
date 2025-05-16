const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

  // Datos personales
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  // Imagen de perfil 
  image: {
    type: String 
  },

  // Dirección estructurada
  address: {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },

  // Métodos de pago
  paymentMethods: [
    {
      type: {
        type: String,
        enum: ['Tarjeta', 'Transferencia'],
        required: true
      },
      details: {
        type: String,
        required: true
      },
      lastUsed: {
        type: Date
      }
    }
  ],

  // Historial de compras (pagos)
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  ],

  // Relaciones directas
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }
  ],

  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);




/*const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true, 
        match: [/^\S+@\S+\.\S+$/, 'El email no es válido'] 
    },
    password: { type: String, required: true, select: false, trim: true },
    fechaRegistro: { type: Date, default: Date.now },
    rol: { type: String, enum: ['cliente', 'administrador', 'moderador'], default: 'cliente' },
    direccion: { type: String, trim: true }
}, { timestamps: true });

//  Encriptar password antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//  Método para comparar contraseñas en el login
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);*/
