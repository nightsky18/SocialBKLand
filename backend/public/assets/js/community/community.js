// community.js - lógica principal para comunidad.html

const communityId = new URLSearchParams(window.location.search).get("id");
const user = getCurrentUser();

const communityName = document.getElementById("community-name");
const communityTopic = document.getElementById("community-topic");
const postEditorSection = document.getElementById("post-editor-section");
const postForm = document.getElementById("post-form");
const postContentInput = document.getElementById("post-content");
const postsContainer = document.getElementById("posts-container");
const reportCommunityBtn = document.getElementById("report-community-btn");

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function fetchCommunity() {
  try {
    const communityId = new URLSearchParams(window.location.search).get("id");
    const res = await fetch(`/api/community/${communityId}`);
    const community = await res.json();
    communityName.textContent = community.name;
    communityTopic.textContent = community.topic || "Sin tema definido";

    const isMember = community.members.some(
      (m) => m.user === user?._id
    );
    if (isMember) postEditorSection.style.display = "block";
  } catch (err) {
    console.error("Error al cargar comunidad", err);
  }
}

async function fetchPosts() {
  try {
    const res = await fetch(`/api/posts/community/${communityId}`);
    const posts = await res.json();
    postsContainer.innerHTML = "";
    posts.forEach(renderPost);
  } catch (err) {
    console.error("Error al cargar posts", err);
  }
}

function renderPost(post) {
  const card = document.createElement("div");
  card.classList.add("post-card");

  const date = new Date(post.createdAt).toLocaleDateString();
  const isAuthor = user && user._id === post.author._id;

  card.innerHTML = `
    <div class="post-header">
      <strong>${post.author.name}</strong>
      <span class="post-date">${date}</span>
    </div>
    <p class="post-content">${post.content}</p>
    <div class="post-actions">
      ${isAuthor ? `
        <button class="edit-btn" data-id="${post._id}">Editar</button>
        <button class="delete-btn" data-id="${post._id}">Eliminar</button>
      ` : `
        <button class="report-btn" data-id="${post._id}">Reportar</button>
      `}
    </div>
  `;

  postsContainer.appendChild(card);
}

postForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = postContentInput.value.trim();
  if (!content) {
    Swal.fire("Error", "No puedes publicar contenido vacío", "warning");
    return;
  }

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        community: communityId,
        author: user._id,
      }),
    });

    if (!res.ok) throw new Error("Error al publicar");
    postContentInput.value = "";
    await fetchPosts();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo publicar", "error");
  }
});

postsContainer.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("delete-btn")) {
    const confirm = await Swal.fire({
      title: "¿Eliminar publicación?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });
    if (!confirm.isConfirmed) return;

    await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
    });
    await fetchPosts();
  } else if (e.target.classList.contains("report-btn")) {
    await fetch(`/api/posts/${id}/report`, { method: "POST" });
    Swal.fire("Gracias", "Se ha reportado la publicación", "success");
  }
});

fetchCommunity();
fetchPosts();