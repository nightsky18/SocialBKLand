// Suponiendo que tienes los libros del carrito almacenados en el LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para renderizar el carrito
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = ''; // Limpiar el contenedor

    // Si el carrito está vacío, mostrar un mensaje
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        updateTotal();
        return;
    }

    // Renderizar los artículos del carrito
    cart.forEach((book, index) => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('cart-item');
        bookElement.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p class="price">$${book.price}</p>
            <button class="remove-from-cart" data-index="${index}">Eliminar</button>
        `;
        cartContainer.appendChild(bookElement);
    });

    // Agregar evento para eliminar un libro
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const bookIndex = e.target.getAttribute('data-index');
            removeBookFromCart(bookIndex);
        });
    });

    updateTotal(); // Actualizar el total del carrito
}

// Función para eliminar un libro del carrito
function removeBookFromCart(index) {
    cart.splice(index, 1); // Eliminar el libro en el índice especificado
    localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el carrito actualizado
    renderCart(); // Volver a renderizar el carrito
}

// Función para calcular y actualizar el total
function updateTotal() {
    const totalElement = document.getElementById('cart-total');
    const total = cart.reduce((acc, book) => acc + parseFloat(book.price), 0);
    totalElement.textContent = total.toFixed(2); // Actualizar el total con 2 decimales
}

// Función para vaciar el carrito
document.getElementById('clear-cart').addEventListener('click', () => {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el carrito vacío
    renderCart(); // Volver a renderizar el carrito
});

// Función para proceder a la compra (esto puede llevar al usuario a una página de pago)
document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de proceder.");
    } else {
        alert("Compra realizada");
    }
});

// Inicializar la renderización del carrito
renderCart();
