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
const payButton = document.getElementById('pay-button');
const paymentMessage = document.getElementById('payment-message');
const comprobanteContainer = document.getElementById('comprobante-container');

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
    const number = document.getElementById('card-number').value.replace(/\s/g, '');
    const cvv = document.getElementById('cvv').value.trim();
    if (!/^\d{8}$/.test(number)) return false;
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
            <p><strong>Fecha:</strong> ${new Date(data.paymentDate).toLocaleString()}</p>
            <p><strong>Método:</strong> ${data.paymentMethod}</p>
            <p><strong>Total:</strong> $${data.total}</p>
            <h4>Libros:</h4>
            <ul>
                ${data.books.map(item => `<li>${item.title} x${item.quantity}</li>`).join('')}
            </ul>
        </div>
        <div style="text-align:center;margin-top:20px;">
            <button id="comprobante-ok-btn" class="pay-button">Aceptar</button>
        </div>
    `;
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
    let paymentMethod = paymentMethodSelect.value;
    if (selectedSavedMethod) {
        valid = true;
        paymentMethod = selectedSavedMethod.type;
    } else if (paymentMethod === 'tarjeta') {
        valid = validateTarjeta();
    } else if (paymentMethod === 'transferencia') {
        valid = validateTransferencia();
    }
    if (!valid) {
        showMessage('Por favor, completa correctamente los datos de pago.', 'error');
        payButton.disabled = false;
        payButton.textContent = 'Pagar';
        return;
    }

    // Construir comprobante con la estructura de Payment.json
    const now = new Date();
    const paymentId = 'PAY-' + now.toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(Math.random()*1000000);
    const books = cartManager.cart.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price
    }));
    const total = parseFloat(cartManager.getTotal());
    const paymentDate = now.toISOString();

    // Guardar comprobante en backend
    const paymentPayload = {
        paymentId,
        userId,
        books,
        total,
        paymentMethod,
        paymentStatus: 'completado',
        transactionDetails: 'Pago procesado con éxito',
        paymentDate
    };

    await simulatePaymentModal();
    Swal.close();

    // Guardar comprobante en Payment.json
    await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
    });

    // Limpiar carrito
    cartManager.clearCart();
    renderCartSummary();

    // Mostrar comprobante en pantalla hasta que el usuario acepte
    comprobanteContainer.innerHTML = buildComprobante(paymentPayload);
    comprobanteContainer.style.display = '';
    showMessage('¡Pago exitoso! Aquí tienes tu comprobante.', 'success');
    payButton.disabled = true;
    payButton.textContent = 'Pagado';

    // Esperar click en el botón "Aceptar" para redirigir
    document.getElementById('comprobante-ok-btn').onclick = () => {
        window.location.href = '/catalogo.html';
    };
});

// Inicialización
(async function init() {
    renderCartSummary();
    await fetchSavedMethods();
    updateSavedMethodsUI();
    showFieldsFor('');
})();