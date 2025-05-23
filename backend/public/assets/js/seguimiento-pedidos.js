document.addEventListener('DOMContentLoaded', () => {
    new OrderTimeline();
});

class OrderTimeline {
    constructor() {
        this.ordersContainer = document.getElementById('orders-container');
        this.userId = localStorage.getItem('userId') || 'demo-user';
        this.init();
    }

    async init() {
        this.loadOrders();
        setInterval(() => this.loadOrders(), 60000);
    }

    loadOrders() {
        // Pedidos quemados para demo
        const pedidos = [
            {
                paymentId: "PAY-20250523-320540",
                userId: this.userId,
                books: [
                    { title: "Caminos a la felicidad", quantity: 1, price: 19 }
                ],
                total: 19,
                paymentMethod: "tarjeta",
                paymentStatus: "completado",
                transactionDetails: "Pago procesado con éxito",
                paymentDate: "2025-05-23T19:32:04.647Z",
                deliveryDate: "2025-05-28T19:32:04.647Z"
            },
            {
                paymentId: "PAY-20250520-111111",
                userId: this.userId,
                books: [
                    { title: "El viaje del héroe", quantity: 2, price: 12 },
                    { title: "La tierra olvidada", quantity: 1, price: 22 }
                ],
                total: 46,
                paymentMethod: "tarjeta",
                paymentStatus: "completado",
                transactionDetails: "Pago procesado con éxito",
                paymentDate: "2025-05-20T10:00:00.000Z",
                deliveryDate: "2025-05-25T10:00:00.000Z"
            },
            {
                paymentId: "PAY-20250510-333333",
                userId: this.userId,
                books: [
                    { title: "Historias del futuro", quantity: 1, price: 25 }
                ],
                total: 25,
                paymentMethod: "tarjeta",
                paymentStatus: "completado",
                transactionDetails: "Pago procesado con éxito",
                paymentDate: "2025-05-10T09:00:00.000Z",
                deliveryDate: "2025-05-15T09:00:00.000Z"
            },
            {
                paymentId: "PAY-20250518-222222",
                userId: this.userId,
                books: [
                    { title: "Cuentos de la noche", quantity: 1, price: 18 }
                ],
                total: 18,
                paymentMethod: "transferencia",
                paymentStatus: "pendiente",
                transactionDetails: "Esperando confirmación bancaria",
                paymentDate: "2025-05-18T09:00:00.000Z",
                deliveryDate: "2025-05-23T09:00:00.000Z"
            }
        ];
        const userOrders = pedidos
            .filter(order => order.userId === this.userId)
            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        if (userOrders.length === 0) {
            this.ordersContainer.innerHTML = '<p class="no-orders">No tienes pedidos activos</p>';
            return;
        }

        this.renderOrders(userOrders);
    }

    calculateProgress(orderDate, deliveryDate) {
        const now = new Date();
        const start = new Date(orderDate);
        const end = new Date(deliveryDate);
        const total = end - start;
        const current = now - start;
        const progress = (current / total) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    getOrderStatus(progress, paymentStatus, deliveryDate) {
        const now = new Date();
        const delivered = now >= new Date(deliveryDate);
        if (paymentStatus && paymentStatus.toLowerCase() === 'pendiente') return 'Pendiente';
        if (delivered) return 'Entregado';
        if (progress <= 5) return 'Pendiente';
        if (progress >= 95) return 'Entregado';
        return 'En envío';
    }

    getOrderStatusClass(status) {
        if (status === 'Entregado') return 'entregado';
        if (status === 'Pendiente') return 'pendiente';
        return 'envio';
    }

    renderTimeline(order) {
        const progress = this.calculateProgress(order.paymentDate, order.deliveryDate);
        const status = this.getOrderStatus(progress, order.paymentStatus, order.deliveryDate);
        const statusClass = this.getOrderStatusClass(status);

        return `
            <div class="timeline-container">
                <div class="timeline-bar"></div>
                <div class="timeline-progress" style="width: ${progress}%"></div>
                <span class="truck-icon" style="left: ${progress}%">🚚</span>
                <div class="timeline-dates">
                    <span>Pedido: ${new Date(order.paymentDate).toLocaleDateString()}</span>
                    <span>Entrega: ${new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${statusClass}">${status}</div>
                ${status === 'Entregado' ? `<div class="delivered-date">Entregado el ${new Date(order.deliveryDate).toLocaleDateString()}</div>` : ''}
            </div>
        `;
    }

    renderOrder(order) {
        const progress = this.calculateProgress(order.paymentDate, order.deliveryDate);
        const status = this.getOrderStatus(progress, order.paymentStatus, order.deliveryDate);
        const statusClass = this.getOrderStatusClass(status);

        return `
            <div class="order-card${status === 'Entregado' ? ' entregado' : ''}">
                <h3>Pedido #${order.paymentId}</h3>
                ${this.renderTimeline(order)}
                <div class="order-details">
                    <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
                <div class="order-books">
                    <h4>Libros:</h4>
                    <ul>
                        ${order.books.map(book => `
                            <li>${book.title} (x${book.quantity}) - $${(book.price * book.quantity).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    renderOrders(orders) {
        this.ordersContainer.innerHTML = orders.map(order => this.renderOrder(order)).join('');
    }
}