// components/NotificationManager.js

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

    const badge = document.querySelector('#notificationBadge');
    if (badge) {
      const count = this.getUnreadCount();
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'inline-block' : 'none';
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
