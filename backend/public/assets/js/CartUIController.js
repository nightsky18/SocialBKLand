import { CartManager } from './CartManager.js';

export class CartUIController {
  #elements = {
    container: document.getElementById('cart-container'),
    total: document.getElementById('cart-total'),
    clearBtn: document.getElementById('clear-cart')
  };

  #cartManager = new CartManager();

  constructor() {
    this.#setupEventListeners();
    this.render();
  }

  #setupEventListeners() {
    this.#elements.clearBtn.addEventListener('click', () => this.#handleClearCart());
    this.#elements.container.addEventListener('click', (e) => this.#handleContainerClick(e));
  }

  #handleContainerClick(e) {
    const index = parseInt(e.target.dataset?.index);
    
    if (e.target.classList.contains('increment')) {
      this.#cartManager.incrementQuantity(index);
      this.render();
    }
    
    if (e.target.classList.contains('decrement')) {
      this.#cartManager.decrementQuantity(index);
      this.render();
    }
    
    if (e.target.classList.contains('remove-item')) {
      this.#cartManager.removeItem(index);
      this.render();
    }
  }

  #handleClearCart() {
    this.#cartManager.clearCart();
    this.render();
  }

  #createCartItemHTML(item, index) {
    return `
      <div class="cart-item">
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
      </div>
    `;
  }

  render() {
    this.#elements.container.innerHTML = this.#cartManager.cart.length === 0
      ? '<p>Tu carrito está vacío.</p>'
      : this.#cartManager.cart.map((item, index) => 
          this.#createCartItemHTML(item, index)).join('');

    this.#elements.total.textContent = this.#cartManager.getTotal();
  }
}