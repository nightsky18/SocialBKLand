export class CartManager {
    #KEY = 'cart';  // Propiedad privada

    constructor() {
        this.cart = this.#load();
    }

    #load() {
        try {
        const cart = JSON.parse(localStorage.getItem(this.#KEY)) || [];
        return cart.map(item => ({ ...item, quantity: item.quantity || 1 }));
        } catch (error) {
        console.error('Cart load error:', error);
        return [];
        }
    }

    #save() {
        localStorage.setItem(this.#KEY, JSON.stringify(this.cart));
    }

    addItem(item) {
        const existing = this.cart.find(i => i.id === item.id);
        existing ? existing.quantity++ : this.cart.push({ ...item, quantity: 1 });
        this.#save();
    }
  
    removeItem(index) {
        this.cart.splice(index, 1);
        this.#save();
      }
    
      incrementQuantity(index) {
        if (this.cart[index].quantity < 99) this.cart[index].quantity++;
        this.#save(); 
      }
    
      decrementQuantity(index) {
        if (this.cart[index].quantity > 1) {
          this.cart[index].quantity--;
        } else {
          this.removeItem(index);
        }
        this.#save(); 
      }
  
    getTotal() {
      return this.cart.reduce((acc, item) => 
        acc + (Number(item.price) * item.quantity), 0
      ).toFixed(2);
    }
  
    clearCart() {
      this.cart = [];
      this.#save();
    }
  }