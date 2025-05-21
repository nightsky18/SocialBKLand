import { NotificationManager } from './components/NotificationManager.js';

const manager = new NotificationManager('#notifications');
let hasUnreadNotifications = false;

document.addEventListener('DOMContentLoaded', async () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) return;

  const user = JSON.parse(userData);
  const badge = document.getElementById('notificationBadge');

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

      // Mostrar punto rojo si hay no leídas
      hasUnreadNotifications = notis.some(n => !n.read);
      if (hasUnreadNotifications && badge) {
        badge.style.display = 'block';
      }
    }
  } catch (err) {
    console.error("❌ Error al cargar notificaciones:", err);
  }
});

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
