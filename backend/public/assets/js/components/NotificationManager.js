// NotificationManager.js
export class NotificationManager {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.notifications = [];
  }

  add(notification) {
    this.notifications.push(notification);
    this.render();
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.render();
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    if (this.notifications.length === 0) {
      this.container.innerHTML = '<p class="empty">No hay notificaciones</p>';
      return;
    }

    this.notifications.forEach(n => {
      const item = document.createElement('div');
      item.classList.add('notification-item');
      if (!n.read) item.classList.add('unread');
      item.innerHTML = `
        <p>${n.message}</p>
        <span class="date">${this.formatDate(n.date)}</span>
      `;
      this.container.appendChild(item);
    });

    const badge = document.querySelector('#notification-count');
    if (badge) {
      const count = this.getUnreadCount();
      badge.textContent = count > 0 ? count : '';
    }
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

import { NotificationManager } from './NotificationManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userSession = JSON.parse(localStorage.getItem('userSession'));

  if (!userSession || !userSession._id) {
    console.warn('⚠️ No hay sesión activa para mostrar notificaciones');
    return;
  }

  const userId = userSession._id;
  const manager = new NotificationManager('#notification-panel');

  try {
    const res = await fetch(`/api/notifications/${userId}`);
    if (!res.ok) throw new Error("Error al cargar notificaciones");

    const notificaciones = await res.json();
    notificaciones.sort((a, b) => new Date(b.date) - new Date(a.date)); // opcional

    notificaciones.forEach(n => manager.add(n));
  } catch (err) {
    console.error('❌ No se pudieron obtener las notificaciones:', err);
  }
});


await Notification.create({
  user: userId, // el _id del usuario sancionado
  message: "Tu reseña fue eliminada por un administrador por uso de lenguaje inapropiado. Has recibido un strike.",
  read: false,
  date: new Date()
});
