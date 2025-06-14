const express = require("express");
const Community = require("../models/Community");
const { createCommunity } = require('../Controllers/communityController.js');
const authenticateUser = require('../middlewares/authenticateUser');
const User = require('../models/user');
const Admin = require('../models/admin');
const Notification = require('../models/notification'); 
const AdminLog = require("../models/AdminLog"); // importa el modelo





const router = express.Router();

router.get("/", async (req, res) => {
  const communities = await Community.find()
    .populate("members.user", "name email") // poblamos solo campos necesarios
    .populate({
      path: 'posts',
      populate: { path: 'author', select: 'name email' }
    })
    .sort({ createdAt: -1 });

  res.json(communities);
});


// POST /api/communities - Crear nueva comunidad
router.post("/", authenticateUser, createCommunity);

// Obtener comunidad por ID
router.get('/:id', async (req, res) => {
  console.log("GET /api/community/:id recibido:", req.params.id);
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'name') // Opcional: puedes ajustar qué campos quieres
      .populate('posts'); // Si quieres incluir posts
    if (!community) return res.status(404).json({ error: 'Comunidad no encontrada' });

    res.json(community);
  } catch (err) {
    console.error('Error al obtener comunidad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put("/:id", async (req, res) => {
    const updatedCommunity = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCommunity);
});

router.delete("/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Comunidad no encontrada" });
    }

    const admin = await Admin.findOne().populate("user", "name");
    if (!admin || !admin.user) {
      return res.status(500).json({ message: "No se pudo identificar un administrador válido." });
    }

    await Community.findByIdAndDelete(req.params.id);

    let logGuardado = false;

    try {
      await AdminLog.create({
        action: "delete_community",
        admin: {
          id: admin.user._id,
          name: admin.user.name
        },
        target: {
          type: "community",
          details: `Comunidad eliminada: ${community.name} (ID: ${community._id})`
        }
      });
      logGuardado = true;
    } catch (logError) {
      console.error("Error al guardar el log de eliminación de comunidad:", logError);
      logGuardado = false; // Si falla, no marcamos como guardado
    }


    res.json({
      message: "Comunidad eliminada correctamente.",
      logStatus: logGuardado ? "registrado" : "no_registrado"
    });
        // Notificar a los miembros de la comunidad eliminada
    try {
      const notifications = community.members.map(m => ({
        user: m.user,
        message: `Tu comunidad "${community.name}" fue eliminada por incumplir normas.`,
        read: false,
        date: new Date()
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error("❌ Error al notificar miembros:", notifError);
      // Esto no detiene el flujo, solo loguea
    }


  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// POST /api/community/:id/join
router.post('/:id/join', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Falta el ID del usuario' });
    }

    const community = await Community.findById(communityId);
    const user = await User.findById(userId);

    if (!community || !user) {
      return res.status(404).json({ message: 'Comunidad o usuario no encontrado' });
    }

    // Verificar si ya es miembro
    const yaMiembro = community.members.some(m => m.user.toString() === userId);
    if (yaMiembro) {
      return res.status(400).json({ message: 'Ya eres miembro de esta comunidad' });
    }

    // Solo permitir unión directa si es pública
    if (community.type !== 'public') {
      return res.status(403).json({ message: 'Esta comunidad es privada. No puedes unirte directamente.' });
    }

    // Agregar a la comunidad
    community.members.push({ user: userId, isModerator: false });
    await community.save();

    // Agregar la comunidad al usuario si no está
    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    res.status(200).json({ message: 'Unido exitosamente a la comunidad' });
  } catch (err) {
    console.error('Error al unir a comunidad:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/community/:id/request
router.post('/:id/request', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Falta el ID del usuario' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    if (community.type !== 'private') {
      return res.status(400).json({ message: 'La comunidad no es privada' });
    }

    const yaMiembro = community.members.some(m => m.user.toString() === userId);
    if (yaMiembro) {
      return res.status(400).json({ message: 'Ya eres miembro de esta comunidad' });
    }

    // Verifica si ya hay una solicitud pendiente (opcional, si lo implementas en el modelo)
    const yaSolicitada = community.joinRequests?.some(id => id.toString() === userId);
    if (yaSolicitada) {
      return res.status(400).json({ message: 'Ya has solicitado unirte' });
    }

    // Agrega la solicitud al array joinRequests (requiere que el modelo la tenga)
    if (!community.joinRequests) community.joinRequests = [];
    community.joinRequests.push(userId);
    await community.save();

    res.status(200).json({ message: 'Solicitud enviada con éxito' });
  } catch (err) {
    console.error('Error al solicitar ingreso:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener las solicitudes pendientes de una comunidad GET /api/community/:id/request
router.get('/:id/requests', async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Falta el ID del usuario autenticado' });
    }

    const community = await Community.findById(communityId).populate('joinRequests', 'name email');
    if (!community) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    // Verificar si el usuario es moderador de esta comunidad
    const esModerador = community.members.some(
      m => m.user.toString() === userId && m.isModerator
    );

    if (!esModerador) {
      return res.status(403).json({ message: 'No tienes permisos para ver las solicitudes' });
    }

    res.status(200).json({ joinRequests: community.joinRequests });
  } catch (err) {
    console.error('Error al obtener solicitudes:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/community/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId, moderatorId } = req.body;

    if (!userId || !moderatorId) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    // Verificar si quien aprueba es moderador
    const isModerator = community.members.some(
      m => m.user.toString() === moderatorId && m.isModerator
    );
    if (!isModerator) {
      return res.status(403).json({ message: 'No tienes permisos para aprobar solicitudes' });
    }

    // Verificar si el usuario está en solicitudes
    const wasRequested = community.joinRequests.includes(userId);
    if (!wasRequested) {
      return res.status(400).json({ message: 'El usuario no tiene una solicitud pendiente' });
    }

    // Agregar al usuario como miembro no moderador
    community.members.push({ user: userId, isModerator: false });

    // Eliminar de joinRequests
    community.joinRequests = community.joinRequests.filter(
      id => id.toString() !== userId
    );

    await community.save();

    // Agregar la comunidad al array de comunidades del usuario
    const user = await User.findById(userId);
    if (user && !user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    res.status(200).json({ message: 'Usuario aprobado correctamente' });

  } catch (err) {
    console.error('Error al aprobar usuario:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

//POST /api/community/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId, moderatorId } = req.body;

    if (!userId || !moderatorId) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    // Verifica si quien rechaza es moderador
    const isModerator = community.members.some(
      m => m.user.toString() === moderatorId && m.isModerator
    );
    if (!isModerator) {
      return res.status(403).json({ message: 'No tienes permisos para rechazar solicitudes' });
    }

    // Verifica si el usuario tiene una solicitud pendiente
    const wasRequested = community.joinRequests.includes(userId);
    if (!wasRequested) {
      return res.status(400).json({ message: 'El usuario no tiene una solicitud pendiente' });
    }

    // Eliminar la solicitud
    community.joinRequests = community.joinRequests.filter(
      id => id.toString() !== userId
    );

    await community.save();

    res.status(200).json({ message: 'Solicitud rechazada correctamente' });

  } catch (err) {
    console.error('Error al rechazar solicitud:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// POST /api/community/:id/report - Reportar una comunidad
router.post('/:id/report', async (req, res) => {
  try {
    const { userId } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Comunidad no encontrada." });
    }

    // Verificar si el usuario ya reportó
    const alreadyReported = community.reports?.some(
      (r) => r.userId.toString() === userId.toString()
    );
    if (alreadyReported) {
      return res.status(400).json({ message: "Ya has reportado esta comunidad." });
    }

    // Agregar el nuevo reporte
    community.reports.push({ userId, date: new Date() });

    let triggeredReview = false;

    // Lógica para activar revisión
    if (community.reports.length >= 4 && !community.underReview) {
      community.underReview = true;
      triggeredReview = true;
    }

    await community.save();

    // Notificar a admins si se activó la revisión
    if (triggeredReview) {
      // Buscar administradores con el permiso "gestion_comunidades"
      const admins = await Admin.find({ permisos: 'gestion_comunidades' }).lean();

      const adminUserIds = admins.map(a => a.user);

      const notifications = adminUserIds.map(userId => ({
        user: userId,
        message: `La comunidad "${community.name}" ha sido reportada más de 3 veces. Requiere revisión.`,
        read: false,
        date: new Date()
      }));
try {
  await Notification.insertMany(notifications);
  console.log(`📣 Se notificó a ${adminUserIds.length} administradores`);
} catch (error) {
  console.error("❌ Error al insertar notificaciones:", error);
}
    }

    return res.status(200).json({ message: "Reporte enviado correctamente." });
  } catch (error) {
    console.error(" Error al reportar comunidad:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});



module.exports = router;
