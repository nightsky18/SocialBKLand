import { CartManager } from './CartManager.js';
import { CartUIController } from './CartUIController.js';

// Inicialización única
new CartUIController();

document.getElementById('checkout').addEventListener('click', () => {
    const cartManager = new CartManager();
    const redirectUrl = cartManager.handleCheckout();
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  });