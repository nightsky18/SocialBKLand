/**
 * Verifica si un libro tiene stock suficiente antes de agregarlo al carrito
 * @param {string} bookId - El ID del libro a verificar
 * @param {number} quantity - Cantidad deseada
 * @returns {Promise<boolean>} - true si hay stock suficiente, false si no
 */
export async function checkBookAvailability(bookId, quantity = 1) {
    try {
      const response = await fetch(`/api/books/${bookId}/availability`);
      if (!response.ok) throw new Error('Error al verificar disponibilidad');
  
      const data = await response.json();
      return data.quantity >= quantity;
    } catch (error) {
      console.error('Error en checkBookAvailability:', error);
      return false; // Por seguridad, asumir que no hay stock si falla la verificación
    }
  }
  
  /**
   * Valida si el carrito completo tiene stock suficiente antes del checkout
   * @param {Array<{id: string, quantity: number}>} cartItems - Lista de libros con cantidades
   * @returns {Promise<{ success: boolean, outOfStock?: Array<{ id: string, availableQuantity: number }> }>} 
   */
  export async function validateCartStock(cartItems) {
    try {
      const response = await fetch('/api/books/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems)
      });
  
      if (!response.ok) throw new Error('Fallo en validación de stock del carrito');
      return await response.json();
    } catch (error) {
      console.error('Error en validateCartStock:', error);
      return { success: false, outOfStock: [] };
    }
  }
  