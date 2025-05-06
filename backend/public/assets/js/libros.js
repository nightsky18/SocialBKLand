// public/script.js
// Importamos CartManager
import { CartManager } from './CartManager.js';
// Asumiendo SweetAlert2 está disponible globalmente (incluido en HTML o otro script)
// import Swal from 'sweetalert2';

// NOTA IMPORTANTE: El array 'books' hardcodeado HA SIDO ELIMINADO de este archivo.
// La data del libro se obtendrá del back-end a través del endpoint /api/books/:id

// Función asíncrona para obtener los detalles del libro desde la API del back-end y renderizarlos
async function fetchAndRenderBookDetails() {
    // Obtener el ID del libro de la URL
    const params = new URLSearchParams(window.location.search);
    // Obtenemos el ID. Ahora esperamos que sea el _id de MongoDB, que es un string.
    const bookId = params.get('id');

    const bookDetailsContainer = document.getElementById('book-details');

    if (!bookId) {
        // Manejar el caso donde no hay ID en la URL
        if (bookDetailsContainer) {
            bookDetailsContainer.innerHTML = '<p>Error: No se especificó ID de libro en la URL.</p>';
        }
        console.error("No se proporcionó ID de libro en la URL.");
        return; // Salir de la función
    }

    // Mostrar un mensaje de carga mientras se obtiene la data
    if (bookDetailsContainer) {
         bookDetailsContainer.innerHTML = '<p>Cargando detalles del libro...</p>';
    }

    try {
        // Hacer la solicitud al back-end para obtener los datos del libro
        // La URL debe apuntar a tu servidor back-end y al endpoint /api/books/ seguido del ID.
        // Usamos window.location.origin para obtener la parte inicial de la URL (ej: http://localhost:5000)
        // y luego añadimos la ruta de la API y el ID.
        const apiUrl = `${window.location.origin}/api/books/${bookId}`;

        console.log(`Workspaceing book from: ${apiUrl}`); // Para depuración

        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Si la respuesta no es exitosa (ej. 404 Not Found, 500 Internal Server Error)
            // Intentamos leer el mensaje de error del JSON de respuesta si existe
            const errorData = await response.json().catch(() => ({ message: response.statusText })); // Fallback al texto del estado
            const errorMessage = errorData.message;

            if (bookDetailsContainer) {
                if (response.status === 404) {
                    bookDetailsContainer.innerHTML = '<p>Libro no encontrado.</p>';
                } else {
                    bookDetailsContainer.innerHTML = `<p>Error al cargar los detalles del libro: ${errorMessage}</p>`;
                }
            }
            console.error(`Error fetching book ${bookId}: ${response.status} - ${errorMessage}`);
            return; // Salir de la función
        }

        // Si la respuesta es OK (status 2xx)
        const book = await response.json(); // Parsear la respuesta JSON a un objeto JavaScript

        // Ahora que tenemos el objeto 'book' del back-end, renderizamos los detalles
        if (bookDetailsContainer) { // Verificar si el elemento existe antes de manipularlo
            bookDetailsContainer.innerHTML = `
                <div class="book-detail">
                    <img src="${book.image}" alt="${book.title}">
                    <div class="info">
                        <h1>${book.title}</h1>
                        <p class="category">Categoría: ${book.category}</p>
                        <p class="description">${book.description}</p>
                        <p class="price">
                            Precio:
                            ${book.isDiscounted ? `<span class="original-price">$${book.originalPrice}</span>` : ''}
                            $${book.price}
                        </p>
                        <p class="rating">Calificación: ${book.rating} ★</p>
                        <p class="delivery-time">Tiempo de entrega: ${book.deliveryTime}</p>
                        <div class="quantity">
                            <label for="quantity">Cantidad:</label>
                            <input type="number" id="quantity" value="1" min="1">
                        </div>
                    </div>
                    <div class="actions">
                        <button id="add-to-cart">Añadir al Carrito</button>
                        <button id="buy-now">Comprar Ahora</button>
                    </div>
                    <div class="comments">
                        <h2>Comentarios</h2>
                        ${book.comments && book.comments.length > 0 ? // Verificar si hay comentarios antes de mapear
                          book.comments.map(comment => `
                            <div class="comment">
                                <strong>${comment.user}:</strong> <p>${comment.text}</p>
                            </div>
                          `).join('')
                          : '<p>No hay comentarios aún.</p>' // Mensaje si no hay comentarios
                        }
                    </div>
                </div>
            `;

            // --- Agregar eventos a los botones DESPUÉS de que se ha renderizado el HTML ---
            // Es crucial seleccionar los botones *después* de que innerHTML ha actualizado el DOM.
            const addToCartButton = document.getElementById('add-to-cart');
            if (addToCartButton) {
                addToCartButton.addEventListener('click', () => {
                    const quantityInput = document.getElementById('quantity');
                    const quantity = parseInt(quantityInput.value) || 1;

                    // Crea o usa una instancia de CartManager.
                    // Si CartManager maneja estado en localStorage, es mejor crearla una vez al inicio
                    // (fuera de esta función o usar un patrón Singleton).
                    const cartManager = new CartManager();

                    // Añadir el libro al carrito la cantidad de veces indicada
                    for (let i = 0; i < quantity; i++) {
                        // Pasa el objeto book obtenido del backend
                        cartManager.addItem(book); // Tu CartManager debe aceptar el objeto libro completo
                    }

                    // *** NOTA: La línea `localStorage.setItem('cart', JSON.stringify(cart));`
                    //          previamente existente fue eliminada.
                    //          CartManager DEBE manejar su propio guardado en localStorage
                    //          dentro de sus métodos (ej: addItem, removeItem). ***


                    // Mostrar notificación (asumiendo SweetAlert2 está disponible globalmente)
                    if (typeof Swal !== 'undefined' && Swal.fire) {
                         Swal.fire({
                            icon: 'success',
                            title: 'Añadido al carrito',
                            text: `"${book.title}" se ha añadido al carrito ${quantity} ${quantity === 1 ? 'vez' : 'veces'}.`,
                            timer: 2000, // Duración en ms
                            showConfirmButton: false,
                            toast: true, // Estilo toast en la esquina
                            position: 'top-end' // Posición
                        });
                    } else {
                        // Fallback si SweetAlert2 no está disponible
                        console.log(`"${book.title}" se ha añadido al carrito ${quantity} ${quantity === 1 ? 'vez' : 'veces'}.`);
                        alert(`"${book.title}" se ha añadido al carrito ${quantity} ${quantity === 1 ? 'vez' : 'veces'}.`);
                    }

                });
            }


            const buyNowButton = document.getElementById('buy-now');
             if (buyNowButton) {
                buyNowButton.addEventListener('click', () => {
                    const quantityInput = document.getElementById('quantity');
                    const quantity = parseInt(quantityInput.value) || 1;

                    const cartManager = new CartManager(); // O reusar instancia

                    // Añadir items al carrito
                    for (let i = 0; i < quantity; i++) {
                         cartManager.addItem(book);
                    }

                    // Redirigir usando el método de CartManager
                    // Si handleCheckout implica un proceso de pago REAL,
                    // tu CartManager (o una lógica separada de checkout) DEBERÍA
                    // hacer una llamada API al back-end aquí para procesar la compra.
                    const redirectUrl = cartManager.handleCheckout();
                    if (redirectUrl) {
                         window.location.href = redirectUrl;
                    } else {
                         console.warn("handleCheckout no retornó una URL de redirección.");
                         // Opcional: Mostrar un mensaje al usuario indicando que algo falló
                    }
                });
             }
        }

    } catch (error) {
        // Manejar errores generales de la solicitud fetch (ej. problema de red, servidor caído)
        console.error('Error general al obtener datos del libro:', error);
         if (bookDetailsContainer) {
            bookDetailsContainer.innerHTML = '<p>Error al cargar los detalles del libro. Intente nuevamente más tarde.</p>';
        }
    }
}

// Ejecutar la función para cargar y renderizar los detalles del libro cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', fetchAndRenderBookDetails);


// Evento para el botón de ir al carrito (asumiendo que existe un elemento con clase 'cart-btn' en el HTML)
const cartButton = document.querySelector('.cart-btn');
if (cartButton) {
     cartButton.addEventListener('click', function() {
        // Asegúrate de que la ruta a carrito.html sea correcta
        window.location.href = "./carrito.html";
    });
}

// *** Recordatorio sobre CartManager ***
// Asegúrate de que tu archivo public/CartManager.js maneje la lógica de carga y guardado
// del carrito en localStorage (o interactúe con tu backend si el carrito es server-side).
// Los métodos addItem, removeItem, etc., DEBEN llamar a un método de guardado interno.
// Ejemplo conceptual de saveCart en CartManager:
// saveCart() {
//     localStorage.setItem('cart', JSON.stringify(this.cart));
// }
// Ejemplo conceptual de loadCart en CartManager constructor:
// constructor() {
//     const savedCart = localStorage.getItem('cart');
//     this.cart = savedCart ? JSON.parse(savedCart) : [];
// }