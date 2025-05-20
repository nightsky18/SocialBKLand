const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Esquema de Mongoose para la colección Community.
 * Representa una comunidad dentro de la aplicación.
 *
 * @typedef {Object} Community
 * @property {String} name - Nombre único de la comunidad (obligatorio).
 * @property {String} topic - Tema principal de la comunidad (opcional).
 * @property {'public'|'private'} type - Tipo de comunidad, puede ser pública o privada (por defecto: 'public').
 * @property {Array<Object>} members - Lista de miembros de la comunidad.
 * @property {ObjectId} members.user - Referencia al usuario miembro (obligatorio).
 * @property {Boolean} members.isModerator - Indica si el usuario es moderador (por defecto: false).
 * @property {Array<ObjectId>} posts - Referencias a los posts asociados a la comunidad.
 * @property {Date} createdAt - Fecha de creación de la comunidad (por defecto: fecha actual).
 */
const CommunitySchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  topic: { type: String, trim: true },
  type: { type: String, enum: ['public', 'private'], default: 'public' },

  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isModerator: { type: Boolean, default: false }
  }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now }
});

// Middleware: elimina duplicados en miembros y posts
CommunitySchema.pre('save', function (next) {
  const unique = new Map();
  this.members.forEach(member => {
    const id = member.user.toString();
    if (!unique.has(id)) unique.set(id, member);
  });
  this.members = Array.from(unique.values());

  this.posts = [...new Set(this.posts.map(id => id.toString()))];
  next();
});

module.exports = mongoose.model('Community', CommunitySchema);

