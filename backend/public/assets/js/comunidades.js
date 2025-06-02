
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

// 🔁 Servicio de Unión: unir a una comunidad pública

async function joinCommunity(communityId, userId) {
  try {
    const res = await fetch(`/api/community/${communityId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 400 && data.message?.includes('Ya eres miembro')) {
        Swal.fire({ icon: 'info', title: 'Ya estás unido', text: data.message });
        return null;
      }
      throw new Error(data.message || 'Error al unirse');
    }

    return data;
  } catch (err) {
    console.error('Error al unirse a la comunidad:', err.message);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo unir a la comunidad.' });
    return null;
  }
}

// 🔁 Solicitud a comunidad privada

async function requestJoinCommunity(communityId, userId) {
  try {
    const res = await fetch(`/api/community/${communityId}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 400 && data.message?.includes('Ya has solicitado')) {
        Swal.fire({ icon: 'info', title: 'Ya solicitaste ingreso', text: data.message });
        return null;
      }
      if (res.status === 400 && data.message?.includes('Ya eres miembro')) {
        Swal.fire({ icon: 'info', title: 'Ya estás en la comunidad', text: data.message });
        return null;
      }
      throw new Error(data.message || 'Error al solicitar ingreso');
    }

    return data;
  } catch (err) {
    console.error('Error en solicitud:', err.message);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo enviar la solicitud.' });
    return null;
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

  const buttonText = hasJoined
    ? 'Unido'
    : community.type === 'private'
    ? 'Solicitar ingreso'
    : 'Unirse';

  const buttonDisabled = hasJoined;

  const card = document.createElement('div');
  card.className = 'community-card';

  const cardIconClass = community.type === 'private' ? 'fas fa-lock' : 'fas fa-globe';

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
              <i class="${cardIconClass}"></i> 
              ${(community.type || 'public')[0].toUpperCase() + (community.type || 'public').slice(1)}
            </span>
        </div>
        <button
            class="community-action-btn"
            data-community-id="${community._id}"
            data-community-type="${community.type}"
            ${buttonDisabled ? 'disabled' : ''}>
            ${buttonText}
        </button>
    </div>
  `;
  card.addEventListener('click', () => {
  window.location.href = `/comunidad.html?id=${community._id}`;
  });

  if (!buttonDisabled) {
    const joinBtn = card.querySelector('.community-action-btn');
    joinBtn.addEventListener('click', async () => {
      e.stopPropagation();
      const user = getCurrentUser();
      if (!user) {
        Swal.fire({ icon: 'warning', title: 'Inicia sesión', text: 'Debes iniciar sesión para unirte a comunidades.' });
        return;
      }

      if (community.type === 'public') {
        const result = await joinCommunity(community._id, user._id);
        if (result) {
          joinBtn.textContent = 'Unido';
          joinBtn.disabled = true;
          Swal.fire({ icon: 'success', title: '¡Te uniste!', text: 'Ahora eres miembro de esta comunidad.' });
        }
      } else if (community.type === 'private') {
        const result = await requestJoinCommunity(community._id, user._id);
        if (result) {
          joinBtn.textContent = 'Solicitud enviada';
          joinBtn.disabled = true;
          Swal.fire({ icon: 'info', title: 'Solicitud enviada', text: 'Tu solicitud está pendiente de aprobación.' });
        }
      }
    });
  }

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
