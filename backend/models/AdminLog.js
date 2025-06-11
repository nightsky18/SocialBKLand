const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminLogSchema = new Schema({
  action: { type: String, required: true },
  admin: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }
  },
  target: {
    type: {
      type: String, required: true
    },
    details: {
      type: String
    }
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdminLog", AdminLogSchema);
