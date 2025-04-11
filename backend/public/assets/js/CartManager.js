export class CartManager {
    constructor() {
      this.cart = this.loadCart();
    }
  
    loadCart() {
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return cart.map(item => ({
          ...item,
          quantity: item.quantity || 1
        }));
      } catch (error) {
        console.error('Error loading cart:', error);
        return [];
      }
    }
  
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
    }
  
    addItem(item) {
      const existingIndex = this.cart.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        this.cart[existingIndex].quantity++;
      } else {
        this.cart.push({ ...item, quantity: 1 });
      }
      this.saveCart();
    }
  
    incrementQuantity(index) {
      if (this.cart[index].quantity < 99) this.cart[index].quantity++;
      this.saveCart();
    }
  
    decrementQuantity(index) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
      this.saveCart();
    }
  
    getTotal() {
      return this.cart.reduce((acc, item) => 
        acc + (Number(item.price) * item.quantity), 0
      ).toFixed(2);
    }
  
    clearCart() {
      this.cart = [];
      this.saveCart();
    }
  }