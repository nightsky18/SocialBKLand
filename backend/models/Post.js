const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        trim: true 
    },
    content: { 
        type: String, 
        required: true, 
        trim: true 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        default: 3 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
