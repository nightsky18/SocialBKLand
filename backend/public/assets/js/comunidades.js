
// Servicio de Datos: obtiene comunidades del backend

async function fetchCommunities() {
  try {
    const res = await fetch('/api/community');
    if (!res.ok) throw new Error('No se pudo obtener las comunidades');
    return await res.json();
  } catch (error) {
    console.error('Error al obtener comunidades:', error);
    showError('No se pudieron cargar las comunidades. Intenta más tarde.');
    return [];
  }
}


// Servicio de Usuario: verifica sesión y obtiene datos

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}


// UI: renderiza mensaje de error

function showError(message) {
  const msgDiv = document.getElementById('no-communities-message');
  if (msgDiv) {
    msgDiv.style.display = 'block';
    msgDiv.textContent = message;
  }
}


// UI: renderiza una comunidad

function createCommunityCard(community, currentUser) {
  const memberCount = community.members?.length || 0;
  const postCount = community.posts?.length || 0;

  const hasJoined = currentUser && community.members.some(m => m.user === currentUser._id);
  const buttonText = hasJoined ? 'Unido' : 'Unirse';
  const buttonAction = hasJoined ? 'joined' : 'join';
  const buttonDisabled = hasJoined;

  const card = document.createElement('div');
  card.className = 'community-card';

  const cardIconClass = community.tipo === 'privada' ? 'fas fa-lock' : 'fas fa-globe';

  card.innerHTML = `
    <div class="community-card-image">
        <i class="${cardIconClass}"></i>
    </div>
    <div class="community-card-content">
        <h3 class="community-name">${community.name}</h3>
        <p class="community-topic">${community.topic || 'Sin tema definido'}</p>
        <div class="community-meta">
            <span class="member-count"><i class="fas fa-user"></i> ${memberCount} Miembro${memberCount !== 1 ? 's' : ''}</span>
            <span class="post-count"><i class="fas fa-comments"></i> ${postCount} Post${postCount !== 1 ? 's' : ''}</span>
            <span class="community-type">
            <i class="${community.type === 'privada' ? 'fas fa-eye-slash' : 'fas fa-globe'}"></i> 
            ${(community.type || 'pública')[0].toUpperCase() + (community.type || 'pública').slice(1)}
            </span>
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

  return card;
}


// UI: renderiza todas las comunidades

function renderCommunities(communities, currentUser) {
  const container = document.getElementById('communities-grid');
  const noMsg = document.getElementById('no-communities-message');

  if (!container) return;

  container.innerHTML = '';
  if (noMsg) noMsg.style.display = 'none';

  if (communities.length === 0) {
    showError('No hay comunidades disponibles');
    return;
  }

  communities.forEach(community => {
    const card = createCommunityCard(community, currentUser);
    container.appendChild(card);
  });
}


// Inicialización

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const communities = await fetchCommunities();
  renderCommunities(communities, user);
});
