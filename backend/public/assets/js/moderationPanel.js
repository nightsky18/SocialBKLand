// Obtener usuario autenticado

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}


// Obtener comunidades donde el usuario es moderador privado

async function fetchModeratedPrivateCommunities(userId) {
  try {
    const res = await fetch('/api/community');
    if (!res.ok) throw new Error('Error al obtener comunidades');
    const all = await res.json();
    console.log("Comunidades:", all);
    console.log("Filtradas:", all.filter(c => c.type === 'private' && c.members.some(m => (typeof m.user === 'object' ? m.user._id : m.user).toString() === userId && m.isModerator)));
    return all.filter(c =>
    c.type === 'private' &&
    c.members.some(m =>
        (typeof m.user === 'object' ? m.user._id : m.user).toString() === userId &&
        m.isModerator
    )
    );

  } catch (err) {
    console.error('Error al filtrar comunidades privadas moderadas:', err);
    return [];
  }
}


// Obtener solicitudes de ingreso para una comunidad

async function fetchJoinRequests(communityId, userId) {
  try {
    const res = await fetch(`/api/community/${communityId}/requests?userId=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener solicitudes');
    return data.joinRequests || [];
  } catch (err) {
    console.error(`Error en comunidad ${communityId}:`, err);
    return [];
  }
}


// Aprobar solicitud

async function approveRequest(communityId, userId, moderatorId, container) {
  try {
    const res = await fetch(`/api/community/${communityId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, moderatorId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    Swal.fire({ icon: 'success', title: 'Aprobado', text: data.message });
    container.remove();
  } catch (err) {
    console.error('Error al aprobar solicitud:', err);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  }
}


// Rechazar solicitud

async function rejectRequest(communityId, userId, moderatorId, container) {
  try {
    const res = await fetch(`/api/community/${communityId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, moderatorId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    Swal.fire({ icon: 'info', title: 'Rechazada', text: data.message });
    container.remove();
  } catch (err) {
    console.error('Error al rechazar solicitud:', err);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  }
}


// Renderizar solicitudes por comunidad

async function renderModerationPanel() {
  const user = getCurrentUser();
  if (!user) return;

  const section = document.getElementById('moderation-section');
  if (!section) return;

  const communities = await fetchModeratedPrivateCommunities(user._id);
  if (communities.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  section.innerHTML = '<h2>Solicitudes pendientes</h2>';

  for (const community of communities) {
    const requests = await fetchJoinRequests(community._id, user._id);

    const container = document.createElement('div');
    container.classList.add('community-request-box');
    container.innerHTML = `<h3>${community.name}</h3>`;

    if (requests.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No hay solicitudes pendientes.';
        emptyMsg.style.color = '#666';
        emptyMsg.style.fontStyle = 'italic';
        container.appendChild(emptyMsg);
    } else {
        requests.forEach(r => {
            const div = document.createElement('div');
            div.classList.add('moderation-request');
            div.innerHTML = `
                <p><strong>${r.name}</strong> (${r.email})</p>
                <button class="approve-btn">Aprobar</button>
                <button class="reject-btn">Rechazar</button>
            `;

            div.querySelector('.approve-btn').onclick = () => approveRequest(community._id, r._id, user._id, div);
            div.querySelector('.reject-btn').onclick = () => rejectRequest(community._id, r._id, user._id, div);

            container.appendChild(div);
        });
    }  
    section.appendChild(container);
  }
}


// Inicialización

document.addEventListener('DOMContentLoaded', renderModerationPanel);
