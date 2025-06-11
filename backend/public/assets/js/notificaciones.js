import { NotificationManager } from './components/NotificationManager.js';

const manager = new NotificationManager('#notifications');
let hasUnreadNotifications = false;

document.addEventListener('DOMContentLoaded', async () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) return;

  const user = JSON.parse(userData);

  try {
    //  Obtener notificaciones del backend
    const res = await fetch(`/api/notifications/${user._id}`);
    const notis = await res.json();

    if (notis.length > 0) {
      notis.forEach(n => manager.add({
        message: n.message,
        date: n.date,
        read: n.read
      }));

      // Mostrar notificación flotante si hay alguna no leída
      const unread = notis.find(n => !n.read);
      if (unread) {
        showUserFloatingNotification(unread.message);
      }
    }
  } catch (err) {
    console.error("❌ Error al cargar notificaciones:", err);
  }
});

// Notificación flotante para el usuario
function showUserFloatingNotification(message) {
  let notif = document.getElementById('user-floating-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'user-floating-notification';
    notif.className = 'floating-notification strike';
    document.body.appendChild(notif);
  }
  notif.innerHTML = `<span class="icon">⚠️</span>${message}`;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 6000);
}

// 🔔 Mostrar/ocultar panel y marcar como leídas
document.getElementById('notification-btn')?.addEventListener('click', async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  document.getElementById('notifications')?.classList.toggle('visible');
  manager.markAllAsRead();

  // Marcar como leídas en el backend
  try {
    await fetch(`/api/notifications/${user._id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.error("❌ Error al marcar como leídas:", err);
  }

  // Ocultar badge rojo
  const badge = document.getElementById('notificationBadge');
  if (badge) badge.style.display = 'none';
  hasUnreadNotifications = false;
});

//  Cierra el dropdown si se hace clic fuera
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('notifications');
  const button = document.getElementById('notification-btn');

  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    !button.contains(event.target)
  ) {
    dropdown.classList.remove('visible');
  }
});

setInterval(async () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) return;
  const user = JSON.parse(userData);

  try {
    const res = await fetch(`/api/notifications/${user._id}`);
    const notis = await res.json();
    const unread = notis.find(n => !n.read);
    if (unread) {
      showUserFloatingNotification(unread.message);
    }
  } catch (err) {}
}, 15000); // cada 15 segundos
