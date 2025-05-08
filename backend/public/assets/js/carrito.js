import { CartManager } from './CartManager.js';
import { CartUIController } from './CartUIController.js';
import { validateCartStock } from './stockService.js';


// Inicialización única
new CartUIController();

document.getElementById('checkout').addEventListener('click', async () => {
  const cartManager = new CartManager();
  const cartItems = cartManager.cart.map(item => ({
    id: item._id || item.id,
    quantity: item.quantity
  }));

  const result = await validateCartStock(cartItems);

  if (!result.success) {
      const msg = result.outOfStock.map(
        b => `"${b.title}" - quedan ${b.availableQuantity}`
      ).join('\n');
      
      Swal.fire({
        icon: 'error',
        title: 'Stock insuficiente',
        text: `Algunos libros no tienen stock suficiente:\n${msg}`,
        showConfirmButton: true
      });
    return;
  }

  const redirectUrl = cartManager.handleCheckout();
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
});
