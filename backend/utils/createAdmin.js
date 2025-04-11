const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const createAdminIfNotExists = async () => {
  try {
    console.log("🛠️ Verificando admin...");
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = new Admin({
        nombre: "Admin Principal",
        email: "admin@example.com",
        password: hashedPassword,
        permisos: ["gestionar_usuarios", "ver_estadisticas", "modificar_contenido"],
      });

      await admin.save();
      console.log("✅ Admin creado exitosamente");
    } else {
      console.log("ℹ️ Admin ya existe");
    }
  } catch (error) {
    console.error("❌ Error al crear el admin:", error);
  }
};


module.exports = createAdminIfNotExists;
