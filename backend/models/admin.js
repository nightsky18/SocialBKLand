const mongoose = require("mongoose");
const User = require("./User");

const AdminSchema = new mongoose.Schema({
  permisos: {
    type: [String],
    default: []
  }
});


const Admin = mongoose.models.Admin || User.discriminator("Admin", AdminSchema);

module.exports = Admin;
