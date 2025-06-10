// community.js
// -------------
// Main orchestration for comunidad.html:
// 1. Load basic community info
// 2. Check access (public vs. private + membership)
// 3. If member, show post editor + feed
// 4. Wire up "Report Community" button

import { setupPostEditor } from '../components/postEditor.js';
import { renderPostFeed } from '../components/postFeed.js';

let currentUser = JSON.parse(sessionStorage.getItem("user")) || null;
let currentCommunity = null;

const communityNameEl      = document.getElementById("community-name");
const communityTopicEl     = document.getElementById("community-topic");
const postEditorSection    = document.getElementById("post-editor-section");
const reportCommunityBtn   = document.getElementById("report-community-btn");
const postsContainerId     = "posts-container";

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function fetchCommunity() {
  const params = new URLSearchParams(window.location.search);
  const communityId = params.get("id");
  if (!communityId) {
    Swal.fire("Error", "No se indicó ID de comunidad.", "error");
    return;
  }

  try {
    const res = await fetch(`/api/community/${communityId}`);
    if (!res.ok) throw new Error(`Error ${res.status} al obtener comunidad`);
    const community = await res.json();
    currentCommunity = community;

    // 1) Show basic info
    communityNameEl.textContent  = community.name;
    communityTopicEl.textContent = community.topic || "Sin tema definido";

    // 2) Private check
    const isPrivate = (community.type === "private");
    const user      = getCurrentUser();
    const isMember  = user && community.members.some(m => {
      // m.user may be string (ObjectId) or full object {_id,…}
      const memberId = (typeof m.user === 'string') ? m.user : m.user._id;
      return memberId === user._id;
    });

    if (isPrivate && !isMember) {
      Swal.fire(
        "Acceso denegado",
        "Esta comunidad es privada. Debes unirte para ver su contenido.",
        "warning"
      );
      // Show a placeholder in feed area
      document.getElementById("community-post-feed").innerHTML =
        `<p style="text-align:center; color:#888; margin-top:20px;">
          No tienes acceso a esta comunidad.
        </p>`;
      postEditorSection.style.display = "none";
      return;
    }

    // 3) If member → show post editor and initialize it
    if (user && isMember) {
      postEditorSection.style.display = "block";
      setupPostEditor({
        communityId,
        getCurrentUser,
        currentCommunity,
        containerId: "post-editor-section",
        onPostCreated: () => renderFeed()
      });
    } else {
      // if not member or not logged in, keep editor hidden
      postEditorSection.style.display = "none";
    }

    // 4) Always attempt to render feed (itself will skip if no access)
    await renderFeed();

  } catch (err) {
    console.error("community.js: Error al cargar comunidad:", err);
    Swal.fire("Error", "No se pudo cargar la comunidad.", "error");
  }
}

async function renderFeed() {
  const communityId = new URLSearchParams(window.location.search).get("id");
  currentUser = getCurrentUser();

  // If it's private and not member, bail out
  if (currentCommunity?.type === "private") {
    const user = currentUser;
    const isMember = user && currentCommunity.members.some(m => {
      const memberId = (typeof m.user === 'string') ? m.user : m.user._id;
      return memberId === user._id;
    });
    if (!isMember) return;
  }

  // Delegate to the postFeed component
  await renderPostFeed({
    communityId,
    currentUser,
    containerId: postsContainerId
  });
}

// “Reportar comunidad” button
async function handleCommunityReport() {
  const user = getCurrentUser();
  if (!user || !user._id) {
    Swal.fire("Acceso", "Debes iniciar sesión para reportar.", "warning");
    return;
  }

  const communityId = new URLSearchParams(window.location.search).get("id");
  if (!communityId) {
    Swal.fire("Error", "No se encontró el ID de la comunidad.", "error");
    return;
  }

  try {
    const response = await fetch(`/api/community/${communityId}/report`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user._id }) 
});


    const result = await response.json();

    if (response.ok) {
      Swal.fire("Gracias", result.message, "success");
    } else {
      Swal.fire("Atención", result.message || "No se pudo reportar.", "warning");
    }
  } catch (err) {
    console.error("Error al reportar comunidad:", err);
    Swal.fire("Error", "No se pudo reportar la comunidad.", "error");
  }
}

document.getElementById("report-community-btn")
  .addEventListener("click", handleCommunityReport);


// On DOM ready, load everything
document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrentUser();
  fetchCommunity();
});