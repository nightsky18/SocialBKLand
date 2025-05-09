import { CartManager } from './CartManager.js';
import { checkBookAvailability } from './stockService.js';
import { requireUserSession } from './sessionService.js';

const cartManager = new CartManager();


let books = []; // Ahora se llenará con los datos de la API
let bookCollection = null;
let searchText = '';
let searchType = 'title';

// Cargar libros del backend
async function fetchBooksFromAPI() {
    try {
        const response = await fetch('/api/books');
        const data = await response.json();
        books = data; // esto actualiza la variable global
        bookCollection = new BookCollection(books);
        renderBooksByCategory(books);
    } catch (error) {
        console.error('Error al cargar libros desde la API:', error);
    }
}

//Para parsar de pagina
document.querySelector('.cart-btn').addEventListener('click', function() {
    window.location.href = "./carrito.html";
});

// Mostrar/ocultar filtros avanzados
document.getElementById('toggle-filters').addEventListener('click', () => {
    const filters = document.getElementById('filters-container');
    filters.classList.toggle('hidden');
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
  ${isDiscounted && typeof originalPrice === 'number' ? `<span class="original-price">$${originalPrice.toFixed(2)}</span>` : ''}
  $${price.toFixed(2)}
</p>
        </a>
       <button class="add-to-cart" data-id="${id}">Añadir al Carrito</button>
    `;
    bookDiv.innerHTML = bookHTML;
    return bookDiv;
}

// Utilidad para ordenar libros alfabéticamente
function sortBooksAlphabetically(books) {
    return books.slice().sort((a, b) => a.title.localeCompare(b.title));
}

// Renderiza los libros agrupados por categorías con paginación y botón "Más"
function renderBooksByCategory(filteredBooks) {
    const catalogContainer = document.querySelector('.general-books');
    catalogContainer.innerHTML = '';

    // Categorías fijas
    const fixedCategories = [
        { label: "Aventura", match: "aventura" },
        { label: "Ciencia", match: "ciencia" },
        { label: "Ficcion", match: "ficcion" },
        { label: "No-Ficcion", match: "no-ficcion" },
        { label: "Terror", match: "terror" }
    ];

    // Inicializa los grupos
    const categoriesMap = {
        'General': [],
        'En Descuento': [],
        'Aventura': [],
        'Ciencia': [],
        'Ficcion': [],
        'No-Ficcion': [],
        'Terror': []
    };

    // Clasifica los libros
    filteredBooks.forEach(book => {
        // General (sin repetir)
        if (!categoriesMap['General'].some(b => (b._id || b.id) === (book._id || book.id))) {
            categoriesMap['General'].push(book);
        }
        // En Descuento
        if (book.isDiscounted) {
            categoriesMap['En Descuento'].push(book);
        }
        // Clasificación por coincidencia parcial
        if (book.category) {
            const bookCats = book.category.split(',').map(c => c.trim().toLowerCase().replace(/-/g, ''));
            fixedCategories.forEach(cat => {
                if (bookCats.some(bc => bc.includes(cat.match.replace(/-/g, '')))) {
                    if (!categoriesMap[cat.label].some(b => (b._id || b.id) === (book._id || book.id))) {
                        categoriesMap[cat.label].push(book);
                    }
                }
            });
        }
    });

    // Orden de categorías: General, En Descuento, luego las fijas en el orden dado
    const sortedCategories = ['General', 'En Descuento', ...fixedCategories.map(c => c.label)];

    sortedCategories.forEach(category => {
        let booksInCategory = categoriesMap[category] || [];
        // Elimina duplicados en General
        if (category === 'General') {
            const seen = new Set();
            booksInCategory = booksInCategory.filter(b => {
                const id = b._id || b.id;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });
        }
        // Ordena libros alfabéticamente
        const sortedBooks = sortBooksAlphabetically(booksInCategory);

        // Crea sección de categoría
        const section = document.createElement('section');
        section.className = 'category-section';

        section.innerHTML = `
            <h2>${category}</h2>
            <div class="book-list" id="book-list-${category.replace(/\s/g, '-')}"></div>
            <button class="load-more-btn" data-category="${category}" style="display: none;">Más</button>
            <p class="no-books-message" style="display: none;">No hay coincidencias</p>
        `;
        catalogContainer.appendChild(section);

        // Renderizar libros iniciales
        renderBooksInCategory(sortedBooks, category, 0);

        // Mostrar botón "Más" si hay más
        if (sortedBooks.length > 8) {
            const loadMoreBtn = section.querySelector('.load-more-btn');
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.addEventListener('click', () => {
                const currentCount = section.querySelectorAll('.book').length;
                renderBooksInCategory(sortedBooks, category, currentCount);
                if (currentCount + 8 >= sortedBooks.length) {
                    loadMoreBtn.style.display = 'none';
                    loadMoreBtn.disabled = true;
                }
            });
        }

        // Mostrar mensaje "No hay coincidencias" si no hay libros
        if (sortedBooks.length === 0) {
            section.querySelector('.no-books-message').style.display = 'block';
        }
    });

    handleAddToCart();
}

// Renderiza libros dentro de una categoría con paginación
function renderBooksInCategory(books, category, startIndex) {
    const categoryContainer = document.getElementById(`book-list-${category.replace(/\s/g, '-')}`);
    const booksToRender = books.slice(startIndex, startIndex + 8);

    booksToRender.forEach(book => {
        const bookElement = BookFactory(book, books.indexOf(book));
        categoryContainer.appendChild(bookElement);
    });

    handleAddToCart();
}

// Renderiza solo libros filtrados (sin categorías ni paginación)
function renderFilteredBooks(filteredBooks) {
    const catalogContainer = document.querySelector('.general-books');
    catalogContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'category-section';

    section.innerHTML = `
        <h2>Resultados de la búsqueda</h2>
        <div class="book-list" id="filtered-book-list"></div>
        <p class="no-books-message" style="display: none;">No hay coincidencias</p>
    `;
    catalogContainer.appendChild(section);

    const bookList = section.querySelector('.book-list');
    if (filteredBooks.length === 0) {
        section.querySelector('.no-books-message').style.display = 'block';
    } else {
        filteredBooks.forEach(book => {
            const bookElement = BookFactory(book, books.indexOf(book));
            bookList.appendChild(bookElement);
        });
    }

    handleAddToCart();
}

// Mostrar libros al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    await fetchBooksFromAPI();
    renderBooksByCategory(books);

    if (searchQuery) {
        searchBooks(searchQuery);
    }

    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
});

// Filtros avanzados
async function applyFilters() {
    const categories = Array.from(document.getElementById('category-filter').selectedOptions).map(opt => opt.value);
    const ratingValue = document.getElementById('rating-filter').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const discount = document.getElementById('discount-filter').checked;
    const stock = document.getElementById('stock-filter').checked;

    const params = new URLSearchParams();
    if (categories.length > 0) params.append('categories', categories.join(','));
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (discount) params.append('discount', 'true');
    if (ratingValue && ratingValue !== 'all') {
        const [min, max] = ratingValue.split('-');
        params.append('minRating', min);
        params.append('maxRating', max);
    }

    let url = '/api/books?' + params.toString();
    let response = await fetch(url);
    let filteredBooks = await response.json();

    if (stock) {
        filteredBooks = filteredBooks.filter(book => (book.quantity ?? book.stock ?? 0) > 0);
    }
    if (discount) {
        filteredBooks = filteredBooks.filter(book => book.isDiscounted && book.isDiscounted === true);
    }
    if (categories.length > 0) {
        filteredBooks = filteredBooks.filter(book => {
            const bookCats = book.category.split(',').map(c => c.trim().toLowerCase());
            return categories.some(cat => bookCats.includes(cat));
        });
    }
    if (ratingValue && ratingValue !== 'all') {
        const [min, max] = ratingValue.split('-').map(Number);
        filteredBooks = filteredBooks.filter(book => {
            const rating = book.rating || 0;
            return rating >= min && rating <= max;
        });
    }
    if (minPrice) {
        filteredBooks = filteredBooks.filter(book => book.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
        filteredBooks = filteredBooks.filter(book => book.price <= parseFloat(maxPrice));
    }

    renderFilteredBooks(filteredBooks);
}

// Limpiar filtros y restaurar categorías y paginación
function clearFilters() {
    document.getElementById('category-filter').selectedIndex = -1;
    document.getElementById('rating-filter').value = 'all';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('discount-filter').checked = false;
    document.getElementById('stock-filter').checked = false;
    renderBooksByCategory(books);
}

// Búsqueda por título o autor
function searchBooks(query, type = 'title') {
    searchText = query.trim();
    searchType = type;
    applyCombinedFilters();
}

document.getElementById('search-bar').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value;
        const type = document.getElementById('search-type').value;
        searchBooks(query, type);
    }
});
document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-bar').value;
    const type = document.getElementById('search-type').value;
    searchBooks(query, type);
});

// Función para manejar la búsqueda
function handleSearch(query) {
    if (query.trim()) {
        window.location.href = `/catalogo.html?search=${encodeURIComponent(query)}`;
    }
}

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

// Aplicar filtros combinados
function applyCombinedFilters() {
    // 1. Filtros avanzados
    const categories = Array.from(document.getElementById('category-filter').selectedOptions).map(opt => opt.value);
    const ratingValue = document.getElementById('rating-filter').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const discount = document.getElementById('discount-filter').checked;
    const stock = document.getElementById('stock-filter').checked;

    let filteredBooks = books.slice();

    // 2. Filtro por búsqueda de texto
    if (searchText) {
        filteredBooks = filteredBooks.filter(book =>
            (searchType === 'title' && book.title.toLowerCase().includes(searchText.toLowerCase())) ||
            (searchType === 'author' && book.author && book.author.toLowerCase().includes(searchText.toLowerCase()))
        );
    }

    // 3. Filtros avanzados
    if (categories.length > 0) {
        filteredBooks = filteredBooks.filter(book => {
            const bookCats = book.category.split(',').map(c => c.trim().toLowerCase());
            return categories.some(cat => bookCats.includes(cat));
        });
    }
    if (ratingValue && ratingValue !== 'all') {
        const [min, max] = ratingValue.split('-').map(Number);
        filteredBooks = filteredBooks.filter(book => {
            const rating = book.rating || 0;
            return rating >= min && rating <= max;
        });
    }
    if (minPrice) {
        filteredBooks = filteredBooks.filter(book => book.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
        filteredBooks = filteredBooks.filter(book => book.price <= parseFloat(maxPrice));
    }
    if (discount) {
        filteredBooks = filteredBooks.filter(book => book.isDiscounted && book.isDiscounted === true);
    }
    if (stock) {
        filteredBooks = filteredBooks.filter(book => (book.quantity ?? book.stock ?? 0) > 0);
    }

    // Mostrar resultados
    if (
        !searchText &&
        categories.length === 0 &&
        ratingValue === 'all' &&
        !minPrice &&
        !maxPrice &&
        !discount &&
        !stock
    ) {
        renderBooksByCategory(books);
    } else {
        renderFilteredBooks(filteredBooks);
    }
}