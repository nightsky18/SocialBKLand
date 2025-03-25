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

//Para parsar de pagina
document.querySelector('.cart-btn').addEventListener('click', function() {
    window.location.href = "./carrito.html";
});



const books = [
    // Ficción
    {
        id: 1,
        title: 'El viaje del héroe',
        price: 12,
        originalPrice: 20,
        category: 'ficcion',
        image: '/assets/images/Elviajedelheroe.webp',
        isDiscounted: true,
        description: 'Una emocionante narrativa sobre el poder del cambio y la resiliencia.',
        rating: 4.8,
        deliveryTime: '2-3 días hábiles',
        comments: [{
                user: 'Alice',
                text: 'Increíble narrativa, me hizo reflexionar mucho.'
            },
            {
                user: 'Carlos',
                text: 'Recomendado para quienes buscan inspiración.'
            }
        ]
    },
    {
        id: 2,
        title: 'Cuentos de la noche',
        price: 18,
        category: 'ficcion',
        image: '/assets/images/cuentosdelanoche.webp',
        isDiscounted: false,
        description: 'Una colección de cuentos mágicos para leer al caer la noche.',
        rating: 4.6,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Laura',
            text: 'Perfecto para los amantes de los cuentos cortos.'
        }]
    },
    {
        id: 3,
        title: 'La tierra olvidada',
        price: 22,
        category: 'ficcion',
        image: '/assets/images/latierraolvidada.webp',
        isDiscounted: false,
        description: 'Un viaje a un mundo perdido lleno de aventuras y desafíos.',
        rating: 4.7,
        deliveryTime: '4-5 días hábiles',
        comments: [{
            user: 'Pedro',
            text: 'La ambientación es maravillosa, te transporta.'
        }]
    },
    {
        id: 4,
        title: 'El príncipe perdido',
        price: 15,
        originalPrice: 25,
        category: 'ficcion',
        image: '/assets/images/elprincipeperdido.png',
        isDiscounted: true,
        description: 'Una épica historia de redención y valentía.',
        rating: 4.9,
        deliveryTime: '1-2 días hábiles',
        comments: [{
            user: 'Sofía',
            text: 'Simplemente perfecto. Una joya literaria.'
        }]
    },

    // Otros libros siguen aquí con propiedades similares...
    // No Ficción
    {
        id: 5,
        title: 'El arte de la negociación',
        price: 20,
        category: 'no-ficcion',
        image: '/assets/images/artenegociacion.webp',
        isDiscounted: false,
        description: 'Domina el arte de negociar en cualquier situación.',
        rating: 4.5,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'José',
            text: 'Muy práctico y aplicable al día a día.'
        }]
    },
    {
        id: 6,
        title: 'La mente y sus secretos',
        price: 14,
        originalPrice: 18,
        category: 'no-ficcion',
        image: '/assets/images/mentescretos.jpg',
        isDiscounted: true,
        description: 'Explora los misterios de la mente humana.',
        rating: 4.3,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Ana',
            text: 'Fascinante, muy bien explicado.'
        }]
    },
    {
        id: 7,
        title: 'Caminos a la felicidad',
        price: 19,
        category: 'no-ficcion',
        image: '/assets/images/caminofelicidad.webp',
        isDiscounted: false,
        description: 'Descubre cómo encontrar la verdadera felicidad.',
        rating: 4.7,
        deliveryTime: '4-5 días hábiles',
        comments: [{
            user: 'Jorge',
            text: 'Inspirador, cambió mi perspectiva de vida.'
        }]
    },
    {
        id: 8,
        title: 'Historias reales',
        price: 25,
        originalPrice: 30,
        category: 'no-ficcion',
        image: '/assets/images/historiasreales.jpeg',
        isDiscounted: true,
        description: 'Relatos emocionantes basados en hechos reales.',
        rating: 4.6,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Clara',
            text: 'Algunas historias son realmente impactantes.'
        }]
    },

    // Aventura
    {
        id: 9,
        title: 'La isla del tesoro',
        price: 10,
        originalPrice: 15,
        category: 'aventura',
        image: '/assets/images/laisladeltesoro.webp',
        isDiscounted: true,
        description: 'La clásica historia de piratas y aventuras inolvidables.',
        rating: 4.8,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'Gabriel',
            text: 'Una aventura clásica que no decepciona.'
        }]
    },
    {
        id: 10,
        title: 'Aventuras en el fin del mundo',
        price: 16,
        category: 'aventura',
        image: '/assets/images/EN-EL-FIN-DEL-MUNDO-PORTADATAG.jpg',
        isDiscounted: false,
        description: 'Descubre los rincones más remotos del planeta.',
        rating: 4.4,
        deliveryTime: '4-5 días hábiles',
        comments: [{
            user: 'Isabel',
            text: 'Una lectura apasionante y educativa.'
        }]
    },
    {
        id: 11,
        title: 'El explorador perdido',
        price: 22,
        category: 'aventura',
        image: '/assets/images/exploradorperdido.jpg',
        isDiscounted: false,
        description: 'Un relato de exploración y superación en terrenos desconocidos.',
        rating: 4.7,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'Tomás',
            text: 'Increíble historia llena de misterio y valor.'
        }]
    },
    {
        id: 12,
        title: 'Ríos misteriosos',
        price: 18,
        originalPrice: 22,
        category: 'aventura',
        image: '/assets/images/riosmisteriosos.webp',
        isDiscounted: true,
        description: 'Una travesía a través de los ríos más enigmáticos del mundo.',
        rating: 4.6,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Marta',
            text: 'Recomiendo este libro, es muy entretenido.'
        }]
    },

    // Ciencia
    {
        id: 13,
        title: 'Los misterios del universo',
        price: 28,
        category: 'ciencia',
        image: '/assets/images/losmisteriosdeluniverso.webp',
        isDiscounted: false,
        description: 'Explora los secretos más grandes del cosmos.',
        rating: 4.9,
        deliveryTime: '1-2 días hábiles',
        comments: [{
            user: 'Carlos',
            text: 'Maravilloso, me inspiró a estudiar astronomía.'
        }]
    },
    {
        id: 14,
        title: 'La física para todos',
        price: 15,
        originalPrice: 20,
        category: 'ciencia',
        image: '/assets/images/lafisicaparatodos.jpg',
        isDiscounted: true,
        description: 'Una introducción accesible al mundo de la física.',
        rating: 4.3,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Elena',
            text: 'Muy claro y perfecto para principiantes.'
        }]
    },
    {
        id: 15,
        title: 'El ADN y sus secretos',
        price: 25,
        category: 'ciencia',
        image: '/assets/images/adn.webp',
        isDiscounted: false,
        description: 'Descubre la base de la vida a través del ADN.',
        rating: 4.7,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'Luis',
            text: 'Cautivador, perfecto para estudiantes de biología.'
        }]
    },
    {
        id: 16,
        title: 'Energías renovables',
        price: 18,
        originalPrice: 23,
        category: 'ciencia',
        image: '/assets/images/energiasrenovables.webp',
        isDiscounted: true,
        description: 'Todo lo que necesitas saber sobre las energías limpias.',
        rating: 4.5,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'Natalia',
            text: 'Informativo y relevante para los tiempos actuales.'
        }]
    },
    {
        id: 17,
        title: 'Guía para programadores',
        price: 30,
        category: 'ciencia',
        image: '/assets/images/guiaparaprogramadores.webp',
        isDiscounted: false,
        description: 'Una guía esencial para iniciarse en el mundo de la programación.',
        rating: 4.8,
        deliveryTime: '1-2 días hábiles',
        comments: [{
            user: 'Juan',
            text: 'Muy útil, lo recomiendo a nuevos desarrolladores.'
        }]
    },

    // Miscelánea
    {
        id: 18,
        title: 'Las mejores recetas',
        price: 12,
        originalPrice: 15,
        category: 'no-ficcion',
        image: '/assets/images/lasmejoresrecetas.webp',
        isDiscounted: true,
        description: 'Recetas deliciosas y fáciles para toda la familia.',
        rating: 4.6,
        deliveryTime: '3-4 días hábiles',
        comments: [{
            user: 'Andrea',
            text: '¡Delicioso! Muy práctico.'
        }]
    },
    {
        id: 19,
        title: 'Cuentos infantiles',
        price: 8,
        category: 'ficcion',
        image: '/assets/images/cuentosinfantiles.png',
        isDiscounted: false,
        description: 'Cuentos mágicos para los más pequeños.',
        rating: 4.4,
        deliveryTime: '2-3 días hábiles',
        comments: [{
            user: 'Diana',
            text: 'A mis hijos les encanta este libro.'
        }]
    },
    {
        id: 20,
        title: 'Atlas de aventuras',
        price: 20,
        category: 'aventura',
        image: '/assets/images/atlasdeaventuras.jpeg',
        isDiscounted: false,
        description: 'Explora el mundo con este fascinante atlas ilustrado.',
        rating: 4.9,
        deliveryTime: '1-2 días hábiles',
        comments: [{
            user: 'Miguel',
            text: 'Perfecto para los exploradores curiosos.'
        }]
    }
];

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
        <button class="add-to-cart" data-index="${index}">Añadir al Carrito</button>
    `;
    bookDiv.innerHTML = bookHTML;
    return bookDiv;
}

// Crear instancia de BookCollection
const bookCollection = new BookCollection(books);

// Función modificada para usar el Iterator
function renderBooks() {
    const discountsSection = document.querySelector('.discounts .book-list');
    const generalBooksSection = document.querySelector('.general-books .book-list');

    discountsSection.innerHTML = '';
    generalBooksSection.innerHTML = '';

    // Usar iterator para libros con descuento
    const discountedIterator = bookCollection.getDiscountedIterator();
    while (discountedIterator.hasNext()) {
        const book = discountedIterator.next();
        const bookElement = BookFactory(book, books.indexOf(book));
        discountsSection.appendChild(bookElement);
    }

    // Usar iterator para todos los libros sin descuento
    const generalIterator = bookCollection.getIterator();
    while (generalIterator.hasNext()) {
        const book = generalIterator.next();
        if (!book.isDiscounted) {
            const bookElement = BookFactory(book, books.indexOf(book));
            generalBooksSection.appendChild(bookElement);
        }
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

// Los event listeners se mantienen igual
document.getElementById('category-filter').addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === 'all') {
        renderBooks();
    } else {
        filterBooks(selectedCategory);
    }
});

function handleAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const bookIndex = e.target.getAttribute('data-index');
            const book = books[bookIndex];

            // Obtener carrito actual de localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Agregar libro al carrito
            cart.push(book);

            // Guardar carrito actualizado en localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            alert(`"${book.title}" se ha añadido al carrito.`);
        });
    });
}


// Renderizar los libros al cargar la página
renderBooks();
