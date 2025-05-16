//admin.models/Admin.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
user: {
type: Schema.Types.ObjectId,
ref: 'User',
required: true,
unique: true
},
permisos: {
type: [String],
default: []
}
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);

