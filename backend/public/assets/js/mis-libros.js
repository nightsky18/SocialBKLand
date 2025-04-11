//Para parsar de pagina
document.querySelector('.cart-btn').addEventListener('click', function() {
    window.location.href = "./carrito.html";
});

// public/assets/js/mis-libros.js
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const bookListContainer = document.getElementById('my-books-list');
    const communityListContainer = document.getElementById('my-communities-list');
    const noBooksMessage = document.getElementById('no-books-message');
    const noCommunitiesMessage = document.getElementById('no-joined-communities-message');

    // --- DATOS DE MARCADOR DE POSICIÓN (Libros del Usuario) ---
    // Reemplazar con llamada a API: /api/user/my-books o similar
    const MisLibros = [
        { id: 1, title: 'El viaje del héroe', image: '/assets/images/Elviajedelheroe.webp', status: 'leyendo' },
        { id: 9, title: 'La isla del tesoro', image: '/assets/images/laisladeltesoro.webp', status: 'leyendo' },
        { id: 5, title: 'El arte de la negociación', image: '/assets/images/artenegociacion.webp', status: 'comprado' },
        { id: 13, title: 'Los misterios del universo', image: '/assets/images/losmisteriosdeluniverso.webp', status: 'comprado' },
        { id: 17, title: 'Guía para programadores', image: '/assets/images/guiaparaprogramadores.webp', status: 'comprado' },
        { id: 2, title: 'Cuentos de la noche', image: '/assets/images/cuentosdelanoche.webp', status: 'leido' },
        { id: 6, title: 'La mente y sus secretos', image: '/assets/images/mentescretos.jpg', status: 'leido' },
        { id: 14, title: 'La física para todos', image: '/assets/images/lafisicaparatodos.jpg', status: 'leido' },
        { id: 20, title: 'Atlas de aventuras', image: '/assets/images/atlasdeaventuras.jpeg', status: 'leido' }
    ];
    // ----------------------------------------

    // --- DATOS DE MARCADOR DE POSICIÓN (Todas las Comunidades) ---
    // Reemplazar con llamada a API: /api/communities
    const allCommunityData = [
      { "_id": "comm1", "nombre": "Ficción Fantástica", "tema": "Debate sobre dragones, magia...", "tipo": "publica", "miembros": ["alice@example.com", "pedro@example.com"], "publicaciones": [] },
      { "_id": "comm2", "nombre": "Ciencia Ficción y Cosmos", "tema": "Exploración de futuros distópicos...", "tipo": "publica", "miembros": ["carlos@example.com", "admin@example.com"], "publicaciones": [] },
      { "_id": "comm3", "nombre": "Club de Lectura: Clásicos", "tema": "Análisis y discusión de obras...", "tipo": "publica", "miembros": ["maria@example.com"], "publicaciones": [] },
      { "_id": "comm4", "nombre": "Misterio y Novela Negra", "tema": "Para amantes de los thrillers...", "tipo": "publica", "miembros": ["miguel@example.com"], "publicaciones": [] },
      { "_id": "comm5", "nombre": "Desarrollo Personal y No Ficción", "tema": "Libros sobre psicología...", "tipo": "privada", "miembros": ["carlos@example.com"], "publicaciones": [] },
      { "_id": "comm6", "nombre": "Aventuras Épicas", "tema": "Relatos de exploradores...", "tipo": "publica", "miembros": ["gabriel@example.com"], "publicaciones": [] }
    ];
     // ----------------------------------------

    // Función para obtener info del usuario actual (si existe)
    function getCurrentUser() {
        const userData = sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

     // Función para verificar si el usuario se unió (usando localStorage)
     // Importante: Esta función debe ser la misma que en comunidades.js para consistencia
     function hasUserJoined(communityId, userEmail) {
        if (!userEmail || !communityId) return false;
        const community = allCommunityData.find(c => c._id === communityId);
        const isInData = community ? community.miembros.includes(userEmail) : false;
        const isInStorage = localStorage.getItem(`joined_community_${userEmail}_${communityId}`) === 'true';
        return isInData || isInStorage;
    }

    // === Funciones de Renderizado (Libros) ===
    function createMyBookElement(book) {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book'; // Reutiliza estilo de catalogo
        bookDiv.innerHTML = `
            <a href="/libros.html?id=${book.id}" class="book-link">
                <img src="${book.image || '/assets/images/placeholder.png'}" alt="${book.title}">
                <h3>${book.title}</h3>
            </a>
        `;
        return bookDiv;
    }

    function renderBooks(booksToRender) {
        bookListContainer.innerHTML = ''; // Limpiar
        noBooksMessage.style.display = 'none'; // Ocultar msg
        if (!booksToRender || booksToRender.length === 0) {
            noBooksMessage.style.display = 'block'; // Mostrar msg si no hay libros
            return;
        }
        booksToRender.forEach(book => {
            bookListContainer.appendChild(createMyBookElement(book));
        });
    }

    function filterAndRenderBooks(filterType) {
        // En una app real, harías fetch(`/api/user/my-books?status=${filterType}`)
        const filteredBooks = MisLibros.filter(book => book.status === filterType);
        renderBooks(filteredBooks);
    }

    // === Funciones de Renderizado (Comunidades) ===
    // COPIAR/IMPORTAR la función createCommunityCard de comunidades.js aquí
    // Asegúrate de que sea la misma versión actualizada
    function createCommunityCard(community, currentUserEmail = null) {
         const card = document.createElement('div');
         card.className = 'community-card';
         card.setAttribute('data-type', community.tipo);
         card.setAttribute('data-community-id', community._id);

         const memberCount = community.miembros ? community.miembros.length : 0;
         const postCount = community.publicaciones ? community.publicaciones.length : 0;

         let isMember = false; // Asumimos que sí, ya que estamos en "Mis Comunidades"
         let buttonText = 'Ver Comunidad';
         let buttonAction = 'view';

        // Verificación extra (aunque ya deberíamos haber filtrado)
         if (currentUserEmail) {
            isMember = hasUserJoined(community._id, currentUserEmail);
         }

         if (!isMember && currentUserEmail) {
             console.warn(`Intento de renderizar comunidad ${community.nombre} en 'Mis Comunidades' para ${currentUserEmail}, pero no es miembro.`);
             // Podrías optar por no renderizar la tarjeta o mostrar un estado de error
             // return null; // O simplemente no añadir el botón
             buttonText = "Error - No unido";
         }

         const cardIconClass = community.tipo === 'privada' ? 'fas fa-lock' : 'fas fa-users';

         card.innerHTML = `
             <div class="community-card-image">
                 <i class="${cardIconClass}"></i>
             </div>
             <div class="community-card-content">
                 <h3 class="community-name">${community.nombre}</h3>
                 <p class="community-topic">${community.tema}</p>
                 <div class="community-meta">
                     <span class="member-count"><i class="fas fa-user"></i> ${memberCount} Miembro${memberCount !== 1 ? 's' : ''}</span>
                     <span class="post-count"><i class="fas fa-comments"></i> ${postCount} Post${postCount !== 1 ? 's' : ''}</span>
                     <span class="community-type"><i class="${community.tipo === 'privada' ? 'fas fa-eye-slash' : 'fas fa-globe'}"></i> ${community.tipo.charAt(0).toUpperCase() + community.tipo.slice(1)}</span>
                 </div>
                 <button class="community-action-btn" data-community-id="${community._id}" data-action="${buttonAction}">
                     ${buttonText}
                 </button>
             </div>
         `;

         const viewButton = card.querySelector('.community-action-btn');
         if (viewButton && isMember) { // Solo añadir listener si es miembro
             viewButton.addEventListener('click', (e) => {
                 e.stopPropagation();
                 const communityId = e.target.getAttribute('data-community-id');
                 // Aquí puedes redirigir a una página de detalles de la comunidad si existe
                 // window.location.href = `/comunidad/${communityId}`;
                 alert(`Navegar a la comunidad "${community.nombre}" (ID: ${communityId}) - Pendiente implementación.`);
             });
         } else if (viewButton && !isMember) {
             viewButton.disabled = true; // Deshabilitar si hay error
         }

         return card;
     }
    // --- Fin createCommunityCard ---


    function renderJoinedCommunities() {
        communityListContainer.innerHTML = ''; // Limpiar
        noCommunitiesMessage.style.display = 'none'; // Ocultar msg
        const currentUser = getCurrentUser();

        if (!currentUser) {
            noCommunitiesMessage.textContent = 'Inicia sesión para ver tus comunidades.';
            noCommunitiesMessage.style.display = 'block';
            // Opcional: Ocultar el botón 'Mis Comunidades' si no hay sesión
            // document.getElementById('btn-my-communities').style.display = 'none';
            return;
        }
        // Si está logueado, asegurarse que el botón sea visible (si se ocultó antes)
        // document.getElementById('btn-my-communities').style.display = 'inline-block';

        // Filtrar comunidades donde el usuario es miembro (basado en email y localStorage)
        // En una app real, harías fetch('/api/user/my-communities')
        const joinedCommunities = allCommunityData.filter(community =>
            hasUserJoined(community._id, currentUser.email)
        );

        if (joinedCommunities.length === 0) {
            noCommunitiesMessage.textContent = 'No te has unido a ninguna comunidad.';
            noCommunitiesMessage.style.display = 'block';
            return;
        }

        joinedCommunities.forEach(community => {
            const cardElement = createCommunityCard(community, currentUser.email);
            if(cardElement) { // Solo añadir si la función no retornó null
                 communityListContainer.appendChild(cardElement);
            }
        });
    }


    // === Lógica de Cambio de Pestaña (Botones de Filtro) ===
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');

            // Gestión de clases 'selected'
            filterButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            // Mostrar/Ocultar contenedores y renderizar contenido
            if (filterType === 'comunidades') {
                bookListContainer.style.display = 'none'; // Ocultar libros
                communityListContainer.style.display = 'grid'; // Mostrar comunidades (usa 'grid' como en comunidades.css)
                renderJoinedCommunities(); // Renderizar las comunidades unidas
            } else {
                // Es un filtro de libros
                communityListContainer.style.display = 'none'; // Ocultar comunidades
                bookListContainer.style.display = 'flex'; // Mostrar libros (usa 'flex' como en el CSS base de .book-list)
                filterAndRenderBooks(filterType); // Renderizar libros filtrados
            }
        });
    });

    // --- Carga Inicial ---
    // Mostrar "Leyendo" por defecto al cargar la página
    const defaultButton = document.getElementById('btn-leyendo');
    if (defaultButton) {
        // Forzamos el estado inicial visual y de contenido
        defaultButton.classList.add('selected');
        communityListContainer.style.display = 'none';
        bookListContainer.style.display = 'flex';
        filterAndRenderBooks('leyendo');
    } else if (filterButtons.length > 0) {
        filterButtons[0].click(); // Simular clic en el primer botón si 'leyendo' no existe
    } else {
        // Caso raro: no hay botones
        bookListContainer.style.display = 'flex';
        communityListContainer.style.display = 'none';
        renderBooks([]); // Mostrar mensaje 'no libros'
        renderJoinedCommunities(); // Actualizar mensaje 'no comunidades' (probablemente dirá q inicie sesión)
    }

     // --- Event Listener para el logo ---
    const logoButton = document.getElementById('imageButton');
     if (logoButton) {
         logoButton.addEventListener('click', () => {
             window.location.href = "/home.html";
         });
     }

});