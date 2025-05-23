import { CartManager } from './CartManager.js';

class PaymentController {
    constructor() {
        this.cartManager = new CartManager();
        this.paymentForm = document.getElementById('payment-form');
        this.paymentMessage = document.getElementById('payment-message');
        this.inputs = {
            cardNumber: document.getElementById('card-number'),
            expiry: document.getElementById('expiry-date'),
            cvv: document.getElementById('cvv')
        };
        this.init();
    }

    init() {
        this.renderCartSummary();
        this.setupForm();
        this.setupInputValidation();
    }

    renderCartSummary() {
        const container = document.getElementById('payment-cart-summary');
        const totalElement = document.getElementById('payment-total');
        let cart = [];
        if (window.CartManager) {
            const cartManager = new CartManager();
            cart = cartManager.cart;
        } else {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
        }

        if (!cart.length) {
            container.innerHTML = '<p>No hay productos en el carrito.</p>';
            totalElement.textContent = '0.00';
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="summary-item">
                <span class="item-name">${item.title}</span>
                <span class="item-qty">x${item.quantity}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalElement.textContent = total.toFixed(2);
    }

    setupForm() {
        this.paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.clearFieldErrors();
            const invalidFields = this.validateForm();
            if (invalidFields.length > 0) {
                this.showFieldErrors(invalidFields);
                this.showMessage('Por favor corrige los campos marcados.', 'error');
                return;
            }
            // Preguntar si desea guardar el método de pago
            const save = await this.askSaveMethod();
            if (save) {
                await this.savePaymentMethod();
            }
            this.handlePayment();
        });
    }

    setupInputValidation() {
        // Validación en tiempo real
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateForm() {
        const invalid = [];
        // Card Number (8 dígitos)
        const cardNumber = this.inputs.cardNumber.value.replace(/\s/g, '');
        if (!/^\d{8}$/.test(cardNumber)) {
            invalid.push({ field: this.inputs.cardNumber, message: 'Debe tener 8 dígitos numéricos.' });
        }
        // CVV (3 dígitos)
        const cvv = this.inputs.cvv.value.trim();
        if (!/^\d{3}$/.test(cvv)) {
            invalid.push({ field: this.inputs.cvv, message: 'Debe tener 3 dígitos.' });
        }
        return invalid;
    }

    showFieldErrors(errors) {
        errors.forEach(({ field, message }) => {
            field.classList.add('input-error');
            let errorMsg = field.parentElement.querySelector('.field-error');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'field-error';
                field.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = message;
        });
    }

    clearFieldErrors() {
        Object.values(this.inputs).forEach(input => this.clearFieldError(input));
    }

    clearFieldError(input) {
        input.classList.remove('input-error');
        const errorMsg = input.parentElement.querySelector('.field-error');
        if (errorMsg) errorMsg.remove();
    }

    async askSaveMethod() {
        const result = await Swal.fire({
            title: '¿Guardar método de pago?',
            text: '¿Deseas guardar esta tarjeta para futuras compras?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'No'
        });
        return result.isConfirmed;
    }

    async savePaymentMethod() {
        const userId = localStorage.getItem('userId');
        const cardNumber = this.inputs.cardNumber.value.replace(/\s/g, '');
        const cvv = this.inputs.cvv.value.trim();
        // Guarda solo los últimos 4 dígitos para mostrar, pero el número completo para backend
        const method = {
            user: userId,
            type: 'tarjeta',
            accountNumber: cardNumber,
            CVV: cvv
        };
        await fetch('/api/payment-methods/save-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(method)
        });
    }

    async handlePayment() {
        this.showMessage('Procesando pago...', 'processing');
        const submitButton = this.paymentForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        // Simulación de pago emergente con mensajes
        await this.simulatePaymentModal();

        // Simulación de éxito/fallo
        const paymentSuccess = Math.random() < 0.95;
        if (!paymentSuccess) {
            this.showMessage('Pago rechazado. Intenta nuevamente', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Pagar';
            return;
        }

        // Aquí iría la lógica de comprobante y limpieza de carrito...

        this.showMessage('¡Pago exitoso! Redirigiendo...', 'success');
        this.cartManager.clearCart();

        Swal.fire({
            icon: 'success',
            title: '¡Gracias por tu compra!',
            text: 'Tu pedido ha sido procesado con éxito.',
            timer: 3000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = '/catalogo.html';
        }, 3000);
    }

    async simulatePaymentModal() {
        return new Promise(resolve => {
            const steps = [
                "Validando información de pago...",
                "Conectando con el banco...",
                "Procesando transacción...",
                "Confirmando pago...",
                "Generando comprobante...",
                "Actualizando inventario...",
                "¡Casi listo!"
            ];
            let current = 0;
            Swal.fire({
                title: 'Procesando pago',
                html: `<b>${steps[0]}</b>`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                    let interval = setInterval(() => {
                        current++;
                        if (current < steps.length) {
                            Swal.getHtmlContainer().querySelector('b').textContent = steps[current];
                        } else {
                            clearInterval(interval);
                            setTimeout(() => resolve(), 1000);
                        }
                    }, 1000);
                }
            });
        });
    }

    showMessage(text, type) {
        this.paymentMessage.textContent = text;
        this.paymentMessage.className = `payment-message ${type}`;
        this.paymentMessage.style.display = 'block';
    }
}

// CSS para campos con error y mensajes
const style = document.createElement('style');
style.innerHTML = `
.input-error {
    border: 2px solid #e74c3c !important;
    background: #fff6f6;
}
.field-error {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 2px;
    margin-bottom: 2px;
}
`;
document.head.appendChild(style);

// Inicializar
new PaymentController();