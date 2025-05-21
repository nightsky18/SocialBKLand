// models/notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
