import { CartManager } from './CartManager.js';

const cartManager = new CartManager();

// Renderizar carrito
function renderCart() {
  const cartContainer = document.getElementById('cart-container');
  cartContainer.innerHTML = '';

  if (cartManager.cart.length === 0) {
    cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    updateTotal();
    return;
  }

  cartManager.cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="item-details">
        <h3>${item.title}</h3>
        <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div class="quantity-controls">
        <button class="decrement" data-index="${index}">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="increment" data-index="${index}">+</button>
      </div>
      <button class="remove-item" data-index="${index}">🗑️</button>
    `;
    cartContainer.appendChild(itemElement);
  });

  // Event listeners
  document.querySelectorAll('.increment').forEach(button => {
    button.addEventListener('click', (e) => {
      cartManager.incrementQuantity(parseInt(e.target.dataset.index));
      renderCart();
    });
  });

  document.querySelectorAll('.decrement').forEach(button => {
    button.addEventListener('click', (e) => {
      cartManager.decrementQuantity(parseInt(e.target.dataset.index));
      renderCart();
    });
  });

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      cartManager.cart.splice(parseInt(e.target.dataset.index), 1);
      cartManager.saveCart();
      renderCart();
    });
  });

  updateTotal();
}

// Actualizar total
function updateTotal() {
  document.getElementById('cart-total').textContent = cartManager.getTotal();
}

// Vaciar carrito
document.getElementById('clear-cart').addEventListener('click', () => {
  cartManager.clearCart();
  renderCart();
});

// Inicializar
renderCart();