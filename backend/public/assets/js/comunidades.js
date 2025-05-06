//Para parsar de pagina
document.querySelector('.cart-btn').addEventListener('click', function() {
    window.location.href = "./carrito.html";
});

// public/assets/js/comunidades.js
document.addEventListener('DOMContentLoaded', () => {
    const communitiesGrid = document.getElementById('communities-grid');
    const loadingMessage = document.getElementById('loading-message');
    const noCommunitiesMessage = document.getElementById('no-communities-message');

    // --- DATOS DE MARCADOR DE POSICIÓN ---
    // (Mismos datos que actualizamos en Community.json)
    const communityData = [
      { "_id": "comm1", "nombre": "Ficción Fantástica", "tema": "Debate sobre dragones, magia, mundos épicos y autores como Tolkien o Sanderson.", "tipo": "publica", "miembros": ["alice@example.com", "pedro@example.com"], "publicaciones": [] },
      { "_id": "comm2", "nombre": "Ciencia Ficción y Cosmos", "tema": "Exploración de futuros distópicos, viajes espaciales, IA y clásicos como Asimov o Clarke.", "tipo": "publica", "miembros": ["carlos@example.com", "admin@example.com"], "publicaciones": [] },
      { "_id": "comm3", "nombre": "Club de Lectura: Clásicos", "tema": "Análisis y discusión de obras literarias universales, desde Homero hasta García Márquez.", "tipo": "publica", "miembros": ["maria@example.com"], "publicaciones": [] },
      { "_id": "comm4", "nombre": "Misterio y Novela Negra", "tema": "Para amantes de los thrillers, detectives, crímenes sin resolver y autores como Agatha Christie.", "tipo": "publica", "miembros": ["miguel@example.com"], "publicaciones": [] },
      { "_id": "comm5", "nombre": "Desarrollo Personal y No Ficción", "tema": "Libros sobre psicología, productividad, historia, ciencia y autoayuda.", "tipo": "privada", "miembros": ["carlos@example.com"], "publicaciones": [] },
      { "_id": "comm6", "nombre": "Aventuras Épicas", "tema": "Relatos de exploradores, tesoros perdidos, piratas y grandes viajes.", "tipo": "publica", "miembros": ["gabriel@example.com"], "publicaciones": [] }
    ];
    // ----------------------------------------

    // Función para obtener info del usuario actual (si existe)
    function getCurrentUser() {
        const userData = sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    // Función para verificar si el usuario se unió (usando localStorage)
    function hasUserJoined(communityId, userEmail) {
        if (!userEmail || !communityId) return false;
        // Verifica también los datos 'reales' si están actualizados
        const community = communityData.find(c => c._id === communityId);
        const isInData = community ? community.miembros.includes(userEmail) : false;
        const isInStorage = localStorage.getItem(`joined_community_${userEmail}_${communityId}`) === 'true';
        return isInData || isInStorage;
    }

     // Función para verificar si se solicitó unirse (localStorage)
     function hasUserRequested(communityId, userEmail) {
        if (!userEmail || !communityId) return false;
        return localStorage.getItem(`requested_community_${userEmail}_${communityId}`) === 'true';
    }

    // Función para marcar como unido (en localStorage y simulación local)
    function markAsJoined(communityId, userEmail) {
        if (!userEmail || !communityId) return;
        localStorage.setItem(`joined_community_${userEmail}_${communityId}`, 'true');
        // Simular adición a los datos locales para reflejo inmediato
        const community = communityData.find(c => c._id === communityId);
        if (community && !community.miembros.includes(userEmail)) {
            community.miembros.push(userEmail);
        }
        console.log(`Simulación: ${userEmail} añadido a miembros de ${communityId}`);
    }

     // Función para marcar como solicitud enviada (en localStorage)
     function markAsRequested(communityId, userEmail) {
        if (!userEmail || !communityId) return;
        localStorage.setItem(`requested_community_${userEmail}_${communityId}`, 'true');
    }

     // --- Función createCommunityCard (Reutilizable) ---
     // Esta función es la misma que se usará en mis-libros.js
     function createCommunityCard(community, currentUserEmail = null) {
        const card = document.createElement('div');
        card.className = 'community-card';
        card.setAttribute('data-type', community.tipo);
        card.setAttribute('data-community-id', community._id);

        const memberCount = community.miembros ? community.miembros.length : 0;
        const postCount = community.publicaciones ? community.publicaciones.length : 0;

        let isMember = false;
        let hasRequested = false;
        let buttonText = 'Ver Comunidad';
        let buttonDisabled = true;
        let buttonAction = 'view';

        if (currentUserEmail) {
            isMember = hasUserJoined(community._id, currentUserEmail); // Usa la función con localStorage
            hasRequested = hasUserRequested(community._id, currentUserEmail);

            if (isMember) {
                buttonText = 'Ya eres miembro';
                buttonDisabled = true;
                buttonAction = 'member';
            } else if (community.tipo === 'publica') {
                buttonText = 'Unirse';
                buttonDisabled = false;
                buttonAction = 'join';
            } else { // privada y no miembro
                if (hasRequested) {
                     buttonText = 'Solicitud Enviada';
                     buttonDisabled = true;
                     buttonAction = 'requested';
                } else {
                    buttonText = 'Solicitar Unirse';
                    buttonDisabled = false;
                    buttonAction = 'request';
                }
            }
        } else { // No hay usuario logueado
             if (community.tipo === 'publica') {
                buttonText = 'Unirse';
                buttonAction = 'join'; // La lógica del click pedirá login
                buttonDisabled = false;
             } else {
                 buttonText = 'Solicitar Unirse';
                 buttonAction = 'request'; // La lógica del click pedirá login
                 buttonDisabled = false;
             }
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
                <button
                    class="community-action-btn"
                    data-community-id="${community._id}"
                    data-action="${buttonAction}"
                    ${buttonDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;

        const actionButton = card.querySelector('.community-action-btn');
        if (actionButton && !buttonDisabled) {
             actionButton.addEventListener('click', (e) => {
                 e.stopPropagation();
                 const communityId = e.target.getAttribute('data-community-id');
                 const action = e.target.getAttribute('data-action');
                 const user = getCurrentUser();

                 if (!user) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Inicia sesión',
                        text: 'Debes iniciar sesión para interactuar con las comunidades.',
                        confirmButtonText: 'Iniciar sesión',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed && typeof openModal === 'function') {
                            openModal();
                        }
                    });
                    return;
                }
                

                 if (action === 'join') {
                     console.log(`Unirse a la comunidad: ${communityId} por ${user.email}`);
                     markAsJoined(communityId, user.email); // Guardar en localStorage
                     // Actualizar botón visualmente
                     e.target.textContent = 'Ya eres miembro';
                     e.target.disabled = true;
                     e.target.dataset.action = 'member';
                     // Opcional: Actualizar contador de miembros visualmente
                     const memberCountSpan = card.querySelector('.member-count');
                     if(memberCountSpan) {
                         const currentCount = parseInt(memberCountSpan.textContent.match(/\d+/)[0] || '0');
                         memberCountSpan.innerHTML = `<i class="fas fa-user"></i> ${currentCount + 1} Miembro${(currentCount + 1) !== 1 ? 's' : ''}`;
                     }
                     Swal.fire({
                        icon: 'success',
                        title: '¡Unido con éxito!',
                        text: `Te has unido a "${community.nombre}".`,
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    
                 } else if (action === 'request') {
                      console.log(`Solicitar unirse a la comunidad privada: ${communityId} por ${user.email}`);
                      markAsRequested(communityId, user.email); // Guardar en localStorage
                      Swal.fire({
                        icon: 'info',
                        title: 'Solicitud enviada',
                        text: `Tu solicitud para unirte a "${community.nombre}" ha sido enviada (simulación).`,
                        timer: 2200,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    
                      e.target.textContent = 'Solicitud Enviada';
                      e.target.disabled = true;
                      e.target.dataset.action = 'requested';
                 }
             });
        }

        return card;
    }
     // --- Fin Función createCommunityCard ---

    // Función para renderizar todas las comunidades
    function renderCommunities(communities) {
        loadingMessage.style.display = 'none';
        noCommunitiesMessage.style.display = 'none';
        communitiesGrid.innerHTML = '';

        if (!communities || communities.length === 0) {
            noCommunitiesMessage.style.display = 'block';
            return;
        }

        const currentUser = getCurrentUser();

        communities.forEach(community => {
            const cardElement = createCommunityCard(community, currentUser ? currentUser.email : null);
            communitiesGrid.appendChild(cardElement);
        });
    }

    // --- Carga Inicial ---
    setTimeout(() => {
        renderCommunities(communityData);
    }, 300);

    // --- Event Listener para el logo ---
    const logoButton = document.getElementById('imageButton');
     if (logoButton) {
         logoButton.addEventListener('click', () => {
             window.location.href = "/home.html";
         });
     }

});