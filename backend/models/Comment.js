const mongoose = require('mongoose');
const PostSchema = require('./Post').schema;

const CommentSchema = new mongoose.Schema({
    ...PostSchema.obj,  // Hereda los campos de Post
    publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
});

module.exports = mongoose.model('Comment', CommentSchema);
