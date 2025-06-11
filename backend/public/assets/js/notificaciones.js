// public/js/notificaciones.js
import { NotificationManager } from './components/NotificationManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) return;

  const user = JSON.parse(userData);
  const manager = new NotificationManager('#notifications');
  window.notificationManager = manager;

  try {
    const res = await fetch(`/api/notifications/${user._id}`);
    const notis = await res.json();

    if (notis.length > 0) {
      notis.forEach(n => manager.add(n));

      const unread = notis.find(n => !n.read);
      if (unread) {
        showUserFloatingNotification(unread.message);
        document.getElementById('notificationBadge')?.classList.add('show');
      }
    }
  } catch (err) {
    console.error("❌ Error al cargar notificaciones:", err);
  }
});

// Muestra notificación flotante
function showUserFloatingNotification(message) {
  // Evitar mostrar si ya fue vista
  const key = `noti-${btoa(message).substring(0, 20)}`;
  if (sessionStorage.getItem(key)) return;

  sessionStorage.setItem(key, "visto");

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


// Mostrar panel y marcar como leídas
document.getElementById('notification-btn')?.addEventListener('click', async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  document.getElementById('notifications')?.classList.toggle('visible');
  window.notificationManager?.markAllAsRead();

  try {
    await fetch(`/api/notifications/${user._id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.error("❌ Error al marcar como leídas:", err);
  }

  const badge = document.getElementById('notificationBadge');
  if (badge) badge.style.display = 'none';
});

// Cerrar panel si se hace clic fuera
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('notifications');
  const button = document.getElementById('notification-btn');

  if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
    dropdown.classList.remove('visible');
  }
});

// Comprobar nuevas notificaciones cada 15s
setInterval(async () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) return;

  const user = JSON.parse(userData);

  try {
    const res = await fetch(`/api/notifications/${user._id}`);
    const notis = await res.json();
    const unread = notis.find(n => !n.read);
    if (unread) showUserFloatingNotification(unread.message);
  } catch (err) {
    console.warn("⏱ Error en el polling de notificaciones:", err);
  }
}, 15000);
