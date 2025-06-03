// myCommunities.js (mostrar comunidades del usuario en mis-libros.html)

async function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function fetchUserCommunities(userId) {
  try {
    const res = await fetch(`/api/users/${userId}/communities`);
    if (!res.ok) throw new Error('No se pudieron obtener las comunidades');
    return await res.json();
  } catch (err) {
    console.error('Error al obtener comunidades del usuario:', err);
    return [];
  }
}

function renderCommunityCard(community) {
  const card = document.createElement('div');
  card.classList.add('community-card');

  const iconClass = community.type === 'private' ? 'fas fa-lock' : 'fas fa-globe';

  card.innerHTML = `
    <div class="community-card-image">
      <i class="${iconClass}"></i>
    </div>
    <div class="community-card-content">
      <h3 class="community-name">${community.name}</h3>
      <p class="community-topic">${community.topic || 'Sin tema definido'}</p>
      <div class="community-meta">
        <span class="member-count">
          <i class="fas fa-user"></i> ${community.members.length} miembro${community.members.length !== 1 ? 's' : ''}
        </span>
        <span class="post-count">
          <i class="fas fa-comments"></i> ${community.posts.length} post${community.posts.length !== 1 ? 's' : ''}
        </span>
        <span class="community-type">
          <i class="${iconClass}"></i> ${community.type[0].toUpperCase() + community.type.slice(1)}
        </span>
      </div>
    </div>
  `;

    card.addEventListener("click", () => {
      window.location.href = `/comunidad.html?id=${community._id}`;
    });

  return card;
}

async function renderUserCommunities() {
  const container = document.getElementById('mis-comunidades-grid');
  const user = await getCurrentUser();

  if (!container || !user) return;

  container.innerHTML = '';
  const communities = await fetchUserCommunities(user._id);

  if (communities.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'Aún no te has unido a ninguna comunidad.';
    msg.style.color = '#666';
    msg.style.fontStyle = 'italic';
    container.appendChild(msg);
    return;
  }

  communities.forEach(c => {
    const card = renderCommunityCard(c);
    container.appendChild(card);
  });
}

// 🔁 Escuchar activación de pestaña
const btnCommunities = document.getElementById('btn-my-communities');
if (btnCommunities) {
  btnCommunities.addEventListener('click', renderUserCommunities);
}

document.addEventListener('DOMContentLoaded', () => {
  // Si ya está visible al cargar, renderizar igual
  const seccionComunidades = document.getElementById('seccion-mis-comunidades');
  if (seccionComunidades && seccionComunidades.style.display !== 'none') {
    renderUserCommunities();
  }
});