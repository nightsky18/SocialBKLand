import { CartManager } from './CartManager.js';

class PaymentController {
    constructor() {
        this.cartManager = new CartManager();
        this.paymentForm = document.getElementById('payment-form');
        this.paymentMessage = document.getElementById('payment-message');
        this.init();
    }

    init() {
        this.renderCartSummary();
        this.setupForm();
    }

    renderCartSummary() {
        const container = document.getElementById('payment-cart-summary');
        const totalElement = document.getElementById('payment-total');
        
        // Generar HTML de los items
        container.innerHTML = this.cartManager.cart.map(item => `
            <div class="summary-item">
                <span class="item-name">${item.title}</span>
                <span class="item-qty">x${item.quantity}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // Actualizar total
        totalElement.textContent = this.cartManager.getTotal();
    }

    setupForm() {
        this.paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePayment();
        });
    }

    validateForm() {
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;

        // Validación básica
        const isCardValid = /^\d{16}$/.test(cardNumber.replace(/\s/g, ''));
        const isExpiryValid = /^\d{2}\/\d{2}$/.test(expiry);
        const isCVVValid = /^\d{3}$/.test(cvv);

        return isCardValid && isExpiryValid && isCVVValid;
    }

    simulatePayment() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.random() > 0.1); // 90% éxito
            }, 1500);
        });
    }

    async handlePayment() {
        this.showMessage('Procesando pago...', 'processing');

        if (!this.validateForm()) {
            this.showMessage('Datos de pago inválidos', 'error');
            return;
        }

        const paymentSuccess = await this.simulatePayment();

        if (paymentSuccess) {
            this.showMessage('¡Pago exitoso! Redirigiendo...', 'success');
            this.cartManager.clearCart();
            Swal.fire({
                icon: 'success',
                title: '¡Gracias por tu compra!',
                text: 'Tu pedido ha sido procesado con éxito.',
                timer: 3000,
                showConfirmButton: false
            });
            
        } else {
            this.showMessage('Pago rechazado. Intenta nuevamente', 'error');
        }
    }

    showMessage(text, type) {
        this.paymentMessage.textContent = text;
        this.paymentMessage.className = `payment-message ${type}`;
        this.paymentMessage.style.display = 'block';
    }
}

// Inicializar
new PaymentController();