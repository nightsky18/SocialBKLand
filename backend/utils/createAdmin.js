const User = require("../models/user");
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");

const createAdminIfNotExists = async () => {
  try {
    console.log("🛠️ Verificando existencia de administradores...");

    const adminUsersCount = await User.countDocuments({ isAdmin: true });
    const adminEntriesCount = await Admin.countDocuments();

    if (adminUsersCount === 0 || adminEntriesCount === 0) {
      const existingUser = await User.findOne({ email: "admin@example.com" });

      let user;

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        user = new User({
          name: "Admin Principal",
          email: "admin@example.com",
          password: hashedPassword,
          isAdmin: true,
          image: "/assets/images/admin.png",
          address: {
            street: "Av. Principal 123",
            city: "Ciudad Admin",
            postalCode: "00000",
            country: "Adminland"
          }
        });

        await user.save();
        console.log(" Usuario admin creado en colección users");
      } else {
        // Si ya existe el usuario, lo promovemos a admin si no lo es
        if (!existingUser.isAdmin) {
          existingUser.isAdmin = true;
          await existingUser.save();
          console.log("Usuario existente promovido a admin");
        }
        user = existingUser;
      }

      // Crear documento en colección Admin
      const existingAdminEntry = await Admin.findOne({ user: user._id });

      if (!existingAdminEntry) {
        const admin = new Admin({
          user: user._id,
          permisos: ["gestionar_usuarios", "gestionar_libros", "gestionar_comunidades"],
        });
        await admin.save();
        console.log("Entrada en colección admins creada");
      } else {
        console.log("ℹ️ Ya existe entrada en colección admins para este usuario");
      }
    } else {
      console.log("ℹ️ Ya existen administradores en el sistema");
    }
  } catch (error) {
    console.error("❌ Error al crear o verificar admin:", error);
  }
};

module.exports = createAdminIfNotExists;
