import { CartManager } from './CartManager.js';
import { checkBookAvailability } from './stockService.js';
import { requireUserSession } from './sessionService.js';

const cartManager = new CartManager();


let books = []; // Ahora se llenará con los datos de la API
let bookCollection = null;

// Cargar libros del backend
async function fetchBooksFromAPI() {
    try {
        const response = await fetch('/api/books');
        const data = await response.json();
        books = data; // esto actualiza la variable global
        bookCollection = new BookCollection(books);
        renderBooks();
    } catch (error) {
        console.error('Error al cargar libros desde la API:', error);
    }
}
// Filtrar libros por categoría
document.getElementById('category-filter').addEventListener('change', function () {
    const selectedCategory = this.value;
    const books = document.querySelectorAll('.book');

    books.forEach(book => {
        const bookCategory = book.getAttribute('data-category');
        if (selectedCategory === 'all' || bookCategory === selectedCategory) {
            book.style.display = 'block';
        } else {
            book.style.display = 'none';
        }
    });
});
// Filtrar libros por rating
document.getElementById('rating-filter').addEventListener('change', function () {
    const selectedRating = this.value;
    const books = document.querySelectorAll('.book');

    books.forEach(book => {
        const bookRating = book.getAttribute('data-rating');
        if (selectedRating === 'all' || bookRating === selectedRating) {
            book.style.display = 'block';
        } else {
            book.style.display = 'none';
        }
    });
});
//Para parsar de pagina
document.querySelector('.cart-btn').addEventListener('click', function() {
    window.location.href = "./carrito.html";
});

// BookCollection implementa el patrón Iterator
class BookCollection {
    constructor(books) {
        this.books = books;
    }

    // Método que devuelve el iterator
    getIterator() {
        return new BookIterator(this.books);
    }

    // Método que devuelve un iterator filtrado
    getCategoryIterator(category) {
        const filteredBooks = category === 'all' 
            ? this.books 
            : this.books.filter(book => book.category === category);
        return new BookIterator(filteredBooks);
    }

    // Método que devuelve un iterator para libros con descuento
    getDiscountedIterator() {
        return new BookIterator(this.books.filter(book => book.isDiscounted));
    }
}

// Implementación del Iterator
class BookIterator {
    constructor(books) {
        this.books = books;
        this.index = 0;
    }

    // Verifica si hay siguiente elemento
    hasNext() {
        return this.index < this.books.length;
    }

    // Obtiene el siguiente elemento
    next() {
        return this.hasNext() ? this.books[this.index++] : null;
    }

    // Reinicia el iterator
    reset() {
        this.index = 0;
    }

    // Obtiene el elemento actual sin avanzar
    current() {
        return this.books[this.index];
    }
}

// Factory para crear el HTML de un libro (se mantiene igual)
function BookFactory({ id, title, price, originalPrice, category, image, isDiscounted }, index) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';
    bookDiv.setAttribute('data-category', category);

    const bookHTML = `
        <a href="/libros.html?id=${id}" class="book-link">
            <img src="${image}" alt="${title}">
            <h3>${title}</h3>
            <p class="price">
                ${isDiscounted ? `<span class="original-price">$${originalPrice.toFixed(2)}</span>` : ''}
                $${price.toFixed(2)}
            </p>
        </a>
       <button class="add-to-cart" data-id="${id}">Añadir al Carrito</button>
    `;
    bookDiv.innerHTML = bookHTML;
    return bookDiv;
}

// Crear instancia de BookCollection


// Función modificada para usar el Iterator
function renderBooks() {
    const generalBooksSection = document.querySelector('.general-books .book-list');
    generalBooksSection.innerHTML = '';

    const generalIterator = bookCollection.getIterator();
    while (generalIterator.hasNext()) {
        const book = generalIterator.next();
        const bookElement = BookFactory(book, books.indexOf(book));
        generalBooksSection.appendChild(bookElement);
    }

    handleAddToCart();
}

// Función modificada para usar el Iterator
function filterBooks(category) {
    const generalBooksSection = document.querySelector('.general-books .book-list');
    generalBooksSection.innerHTML = '';

    const categoryIterator = bookCollection.getCategoryIterator(category);
    while (categoryIterator.hasNext()) {
        const book = categoryIterator.next();
        const bookElement = BookFactory(book, books.indexOf(book));
        generalBooksSection.appendChild(bookElement);
    }
}

// Mostrar/ocultar filtros
document.getElementById('toggle-filters').addEventListener('click', () => {
    const filtersContainer = document.getElementById('filters-container');
    filtersContainer.classList.toggle('hidden');
});

// Aplicar filtros al presionar el botón "Aplicar Filtros"
document.getElementById('apply-filters').addEventListener('click', applyFilters);

// Aplicar filtros dinámicamente
function applyFilters() {
    const selectedCategories = Array.from(document.getElementById('category-filter').selectedOptions).map(opt => opt.value);
    const selectedRating = document.getElementById('rating-filter').value;
    const minPrice = parseFloat(document.getElementById('filter-min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('filter-max-price').value) || Infinity;
    const showDiscounted = document.getElementById('discount-filter').checked;
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();

    const generalBooksSection = document.querySelector('.general-books .book-list');
    generalBooksSection.innerHTML = '';

    const filteredIterator = bookCollection.getIterator();
    while (filteredIterator.hasNext()) {
        const book = filteredIterator.next();

        // Aplicar filtros
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category);
        const matchesRating = selectedRating === 'all' || (
            book.rating >= parseFloat(selectedRating.split('-')[0]) &&
            book.rating <= parseFloat(selectedRating.split('-')[1])
        );
        const matchesPrice = book.price >= minPrice && book.price <= maxPrice;
        const matchesDiscount = !showDiscounted || (book.originalPrice && book.price < book.originalPrice);
        const matchesSearch = book.title.toLowerCase().includes(searchQuery);

        if (matchesCategory && matchesRating && matchesPrice && matchesDiscount && matchesSearch) {
            const bookElement = BookFactory(book, books.indexOf(book));
            generalBooksSection.appendChild(bookElement);
        }
    }

    handleAddToCart();
}

// Limpiar filtros
document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('category-filter').value = '';
    document.getElementById('rating-filter').value = 'all';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('discount-filter').checked = false;
    document.getElementById('search-bar').value = '';
    applyFilters();
});

// Mostrar libros al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    await fetchBooksFromAPI();

    if (searchQuery) {
        searchBooks(searchQuery);
    }
});
// Función para buscar libros por título
function searchBooks(query) {
    const generalBooksSection = document.querySelector('.general-books .book-list');
    generalBooksSection.innerHTML = '';

    const filteredIterator = bookCollection.getIterator();
    while (filteredIterator.hasNext()) {
        const book = filteredIterator.next();
        if (book.title.toLowerCase().includes(query.toLowerCase())) {
            const bookElement = BookFactory(book, books.indexOf(book));
            generalBooksSection.appendChild(bookElement);
        }
    }

    handleAddToCart();
}

// Función para manejar la búsqueda
function handleSearch(query) {
    if (query.trim()) {
        window.location.href = `/catalogo.html?search=${encodeURIComponent(query)}`;
    }
}

// Barra de busqueda
document.getElementById('search-bar').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value;
        searchBooks(query);
    }
});

document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-bar').value;
    handleSearch(query);
});

// En la función handleAddToCart:
function handleAddToCart() {
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            if (!requireUserSession()) return;
            const bookId = button.dataset.id;
            const book = books.find(b => b.id === bookId);
        
            if (book) {
                const cartManager = new CartManager();
                const cartItem = cartManager.cart.find(i => (i._id || i.id) === book._id);
                const cantidadExistente = cartItem?.quantity || 0;
                const cantidad=1; 
                const tieneStock = await checkBookAvailability(book._id, cantidad + cantidadExistente);
                if (!tieneStock) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Sin stock',
                        text: `No hay stock suficiente para "${book.title}".`,
                        toast: true,
                        position: 'top-end',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    return;
                }
        
                cartManager.addItem(book);
                Swal.fire({
                    icon: 'success',
                    title: 'Añadido al carrito',
                    text: `"${book.title}" se ha añadido correctamente.`,
                    timer: 1800,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                console.error(`Libro con ID ${bookId} no encontrado.`);
            }
        });        
    });
}

// Catálogo Cambios (Mongoose)
const express = require('express');
const { Book } = require('../models');
const router = express.Router();

// GET /api/books - Obtener libros con filtros opcionales
router.get('/', async (req, res) => {
    try {
        const { search, category, minRating, minPrice, maxPrice, categories, discount } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { author: new RegExp(search, 'i') }
            ];
        }

        if (category && !categories) {
            filter.category = category;
        }

        if (minRating) {
            const rating = parseInt(minRating, 10);
            if (!isNaN(rating)) {
                filter.rating = { $gte: rating };
            }
        }

        const priceFilter = {};
        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                priceFilter.$gte = min;
            }
        }
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                priceFilter.$lte = max;
            }
        }
        if (Object.keys(priceFilter).length > 0) {
            if (discount === 'true') {
                filter.discountPrice = { ...priceFilter, $ne: null, $gt: 0 };
            } else {
                filter.price = priceFilter;
            }
        }

        if (categories) {
            const categoryArray = categories.split(',').map(cat => cat.trim()).filter(Boolean);
            if (categoryArray.length > 0) {
                filter.category = { $in: categoryArray };
            }
        }

        if (discount === 'true') {
            filter.discountPrice = { $ne: null, $lt: { $col: 'price' } };
        }

        const books = await Book.find(filter).sort({ title: 1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros del servidor', error: error.message });
    }
});

module.exports = router;