// notificaciones.js
import { NotificationManager } from './components/NotificationManager.js';

const manager = new NotificationManager('#notifications');

document.getElementById('notification-btn').addEventListener('click', () => {
  document.getElementById('notifications').classList.toggle('visible');
  manager.markAllAsRead();
});

// Simulación de notificaciones
manager.add({ message: 'Nuevo comentario en tu publicación', date: Date.now(), read: false });
manager.add({ message: 'Has sido añadido a una comunidad', date: Date.now(), read: false });


// Cierra el dropdown si se hace clic fuera
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

let hasUnreadNotifications = true;

function toggleNotifications() {
  const panel = document.getElementById('notificationPanel');
  const badge = document.getElementById('notificationBadge');

  panel.classList.toggle('show');

  if (hasUnreadNotifications) {
    // marcar como leído al abrir
    badge.style.display = 'none';
    hasUnreadNotifications = false;
  }
}

// Mostrar el punto rojo solo si hay no leídas al cargar
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('notificationBadge');
  if (!hasUnreadNotifications) {
    badge.style.display = 'none';
  }
});


