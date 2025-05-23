import { CartManager } from './CartManager.js';

const cartManager = new CartManager();
let userId = localStorage.getItem('userId') || null;

const paymentForm = document.getElementById('payment-form');
const paymentMethodSelect = document.getElementById('payment-method-select');
const tarjetaFields = document.getElementById('tarjeta-fields');
const transferenciaFields = document.getElementById('transferencia-fields');
const bankSelect = document.getElementById('bank-select');
const savedMethodsGroup = document.getElementById('saved-methods-group');
const savedMethodsSelect = document.getElementById('saved-methods-select');
const saveMethodGroup = document.getElementById('save-method-group');
//const saveMethodCheckbox = document.getElementById('save-method');
const payButton = document.getElementById('pay-button');
const paymentMessage = document.getElementById('payment-message');
//const comprobanteContainer = document.getElementById('comprobante-container');

let savedMethods = [];
let selectedSavedMethod = null;

function renderCartSummary() {
    const container = document.getElementById('payment-cart-summary');
    const totalElement = document.getElementById('payment-total');
    container.innerHTML = cartManager.cart.map(item => `
        <div class="summary-item">
            <span class="item-name">${item.title}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    totalElement.textContent = cartManager.getTotal();
}

async function fetchSavedMethods() {
    if (!userId) return;
    try {
        const res = await fetch(`/api/payment-methods/user/${userId}`);
        if (res.ok) {
            savedMethods = await res.json();
        }
    } catch (e) {
        savedMethods = [];
    }
}

function updateSavedMethodsUI() {
    if (!savedMethods.length) {
        savedMethodsGroup.style.display = 'none';
        savedMethodsSelect.innerHTML = '';
        return;
    }
    savedMethodsGroup.style.display = '';
    savedMethodsSelect.innerHTML = '<option value="">Selecciona un método guardado</option>' +
        savedMethods.map((m, i) => {
            if (m.type === 'tarjeta') {
                return `<option value="${i}">Tarjeta ••••${m.accountNumber.slice(-4)}</option>`;
            } else {
                return `<option value="${i}">Transferencia ${m.bank} ••••${m.accountNumber.slice(-4)}</option>`;
            }
        }).join('');
}

function showFieldsFor(method) {
    tarjetaFields.style.display = method === 'tarjeta' ? '' : 'none';
    transferenciaFields.style.display = method === 'transferencia' ? '' : 'none';
    saveMethodGroup.style.display = (method === 'tarjeta' || method === 'transferencia') ? '' : 'none';
}

paymentMethodSelect.addEventListener('change', () => {
    selectedSavedMethod = null;
    savedMethodsSelect.value = '';
    showFieldsFor(paymentMethodSelect.value);
});

savedMethodsSelect.addEventListener('change', () => {
    const idx = savedMethodsSelect.value;
    if (idx === '') {
        selectedSavedMethod = null;
        showFieldsFor(paymentMethodSelect.value);
        return;
    }
    selectedSavedMethod = savedMethods[idx];
    paymentMethodSelect.value = selectedSavedMethod.type;
    showFieldsFor(selectedSavedMethod.type);

    // Autocompletar campos y deshabilitarlos
    if (selectedSavedMethod.type === 'tarjeta') {
        document.getElementById('card-name').value = selectedSavedMethod.cardName || '';
        document.getElementById('card-number').value = selectedSavedMethod.accountNumber;
        document.getElementById('expiry-date').value = selectedSavedMethod.expiry || '';
        document.getElementById('cvv').value = '';
        document.getElementById('card-name').disabled = true;
        document.getElementById('card-number').disabled = true;
        document.getElementById('expiry-date').disabled = true;
        document.getElementById('cvv').disabled = false;
    } else {
        bankSelect.value = selectedSavedMethod.bank;
        document.getElementById('account-number').value = selectedSavedMethod.accountNumber;
        bankSelect.disabled = true;
        document.getElementById('account-number').disabled = true;
    }
    saveMethodGroup.style.display = 'none';
});

function resetFormFields() {
    ['card-name', 'card-number', 'expiry-date', 'cvv', 'account-number'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.disabled = false;
        }
    });
    bankSelect.value = '';
    bankSelect.disabled = false;
}

paymentForm.addEventListener('reset', resetFormFields);

function validateTarjeta() {
    const name = document.getElementById('card-name').value.trim();
    const number = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry-date').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(name)) return false;
    if (!/^\d{16}$/.test(number)) return false;
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return false;
    if (!/^\d{3}$/.test(cvv)) return false;
    return true;
}

function validateTransferencia() {
    const bank = bankSelect.value;
    const account = document.getElementById('account-number').value.trim();
    if (!bank) return false;
    if (!/^\d{10,20}$/.test(account)) return false;
    return true;
}

function showMessage(text, type) {
    paymentMessage.textContent = text;
    paymentMessage.className = `payment-message ${type}`;
    paymentMessage.style.display = 'block';
}

function hideMessage() {
    paymentMessage.style.display = 'none';
}

async function validateStockBeforePay() {
    const cartItems = cartManager.cart.map(item => ({
        id: item._id || item.id,
        quantity: item.quantity
    }));
    const res = await fetch('/api/books/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems)
    });
    return res.json();
}

function buildComprobante(data) {
    return `
        <div class="comprobante">
            <h3>Comprobante de Pago</h3>
            <p><strong>ID de pago:</strong> ${data.paymentId}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Método:</strong> ${data.method}</p>
            <p><strong>Total:</strong> $${data.total}</p>
            <h4>Libros:</h4>
            <ul>
                ${data.items.map(item => `<li>${item.title} x${item.quantity}</li>`).join('')}
            </ul>
        </div>
    `;
}

async function guardarMetodoPago(methodData) {
    if (!userId) return;
    await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...methodData, user: userId })
    });
}

function buildComprobanteData(methodLabel, total, items) {
    return {
        receiptId: 'REC-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        userId,
        method: methodLabel,
        total,
        items,
        date: new Date().toISOString()
    };
}

async function guardarComprobante(comprobante) {
    await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comprobante)
    });
}

async function simulatePaymentModal() {
    return new Promise(resolve => {
        let steps = [
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

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    payButton.disabled = true;
    payButton.textContent = 'Procesando...';

    // Validar stock antes de pagar
    const stockResult = await validateStockBeforePay();
    if (!stockResult.success) {
        showMessage('Algunos productos no tienen stock suficiente. Se eliminarán del carrito.', 'error');
        stockResult.outOfStock.forEach(b => {
            const idx = cartManager.cart.findIndex(i => (i._id || i.id) === b.id);
            if (idx !== -1) cartManager.removeItem(idx);
        });
        renderCartSummary();
        payButton.disabled = false;
        payButton.textContent = 'Pagar';
        return;
    }

    // Validar formulario
    let valid = false;
    let methodData = {};
    let methodLabel = '';
    let paymentMethod = paymentMethodSelect.value;
    if (selectedSavedMethod) {
        valid = true;
        paymentMethod = selectedSavedMethod.type;
        methodLabel = selectedSavedMethod.type === 'tarjeta'
            ? `Tarjeta ••••${selectedSavedMethod.accountNumber.slice(-4)}`
            : `Transferencia ${selectedSavedMethod.bank} ••••${selectedSavedMethod.accountNumber.slice(-4)}`;
        methodData = selectedSavedMethod;
    } else if (paymentMethod === 'tarjeta') {
        valid = validateTarjeta();
        methodLabel = `Tarjeta ••••${document.getElementById('card-number').value.slice(-4)}`;
        methodData = {
            type: 'tarjeta',
            cardName: document.getElementById('card-name').value.trim(),
            accountNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
            expiry: document.getElementById('expiry-date').value.trim(),
            CVV: document.getElementById('cvv').value.trim()
        };
    } else if (paymentMethod === 'transferencia') {
        // Cambia a nombre de cuenta
        const accountName = document.getElementById('account-name').value.trim();
        const bank = bankSelect.value;
        valid = !!bank && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(accountName);
        methodLabel = `Transferencia ${bank} (${accountName})`;
        methodData = {
            type: 'transferencia',
            bank: bank,
            accountName: accountName
        };
    }
    if (!valid) {
        showMessage('Por favor, completa correctamente los datos de pago.', 'error');
        payButton.disabled = false;
        payButton.textContent = 'Pagar';
        return;
    }

    // Construir datos de pago para Payment.json (estructura Payment.js)
    const cartItems = cartManager.cart.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price
    }));
    const total = cartManager.getTotal();
    const paymentPayload = {
        user: userId,
        paymentMethod: paymentMethod,
        total: total,
        paymentStatus: 'completado',
        transactionDetails: 'Pago procesado con éxito',
        paymentDate: new Date().toISOString(),
        books: cartItems // Puedes agregar este campo si lo quieres en el JSON
    };

    // Guardar pago en backend
    await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
    });

    // Simulación de pago emergente
    if (paymentMethod === 'transferencia') {
        // Simula redirección a portal bancario
        Swal.fire({
            icon: 'info',
            title: 'Redirigiendo a tu banco',
            html: `<p>Serás redirigido al portal bancario simulado para completar la transferencia.</p>`,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });
        setTimeout(() => {
            Swal.close();
            finalizarPagoExitoso();
        }, 4000);
    } else {
        await simulatePaymentModal();
        finalizarPagoExitoso();
    }

    function finalizarPagoExitoso() {
        // Limpiar carrito
        cartManager.clearCart();
        renderCartSummary();

        /*// Mostrar comprobante
        comprobanteContainer.innerHTML = buildComprobante({
            paymentId: paymentPayload._id || '',
            method: methodLabel,
            total: paymentPayload.total,
            items: cartItems
        });
        comprobanteContainer.style.display = '';
        showMessage('¡Pago exitoso! Aquí tienes tu comprobante.', 'success');
        payButton.disabled = true;
        payButton.textContent = 'Pagado';
*/
        Swal.fire({
            icon: 'success',
            title: '¡Gracias por tu compra!',
            text: 'Tu pedido ha sido procesado con éxito. Serás redirigido a la biblioteca.',
            timer: 3000,
            showConfirmButton: false
        });
        setTimeout(() => {
            window.location.href = '/catalogo.html';
        }, 3000);
    }
});

// Inicialización
(async function init() {
    renderCartSummary();
    await fetchSavedMethods();
    updateSavedMethodsUI();
    showFieldsFor('');
})();

document.addEventListener('DOMContentLoaded', () => {
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            this.value = value;
        });
    }
});