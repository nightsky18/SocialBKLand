const mongoose = require('mongoose');
const Post = require('./Post');

const ReviewSchema = new mongoose.Schema({
    libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

const Review = Post.discriminator('Review', ReviewSchema);

module.exports = Review;

