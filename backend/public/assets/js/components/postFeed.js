// public/assets/js/components/postFeed.js

/**
 * postFeed.js
 * —————————
 * Se encarga de renderizar todas las publicaciones en una comunidad.
 * Cada paso crítico tiene un console.log para seguimiento.
 */

import {
  fetchPostsByCommunity,
  deletePost,
  reportPost,
  editPost,
} from "../community/postService.js";

export async function renderPostFeed({ communityId, currentUser, containerId }) {
  console.log(`[postFeed] renderPostFeed: communityId=${communityId}, currentUser=`, currentUser);

  const postsContainer = document.getElementById(containerId);
  if (!postsContainer) {
    console.error(`[postFeed] renderPostFeed: NO existe contenedor con id="${containerId}"`);
    return;
  }
  postsContainer.innerHTML = ""; // Limpiamos

  try {
    console.log("[postFeed] renderPostFeed: llamando a fetchPostsByCommunity...");
    const posts = await fetchPostsByCommunity(communityId);

    console.log("[postFeed] renderPostFeed: posts obtenidos:", posts);
    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = `
        <p style="text-align:center; color:#888; margin-top:20px;">
          No hay publicaciones aún.
        </p>`;
      return;
    }

    // Orden cronológico descendente
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    posts.forEach((post) => {
      const isAuthor = currentUser && post.author._id === currentUser._id;
      const date = new Date(post.createdAt).toLocaleDateString();

      const card = document.createElement("div");
      card.classList.add("post-card");
      card.dataset.postId = post._id;

      let html = `
        <div class="post-header">
          <strong>${post.author.name}</strong>
          <span class="post-date">${date}</span>
        </div>
        <p class="post-content" data-original-content="${post.content}">
          ${post.content}
        </p>
        <div class="post-actions">
          ${isAuthor
            ? `
            <button class="edit-btn" data-id="${post._id}">Editar</button>
            <button class="delete-btn" data-id="${post._id}">Eliminar</button>
          `
            : `
          `}
        </div>
      `;

      if (currentUser && post.author && post.author._id !== currentUser._id) {
        html += `<button class="report-user-btn" data-user-id="${post.author._id}" data-user-name="${post.author.name}">
    <i class="fas fa-user-slash"></i> Reportar usuario
  </button>`;
      }

      card.innerHTML = html;
      postsContainer.appendChild(card);
    });

    console.log("[postFeed] renderPostFeed: publicaciones renderizadas en DOM.");
    // Adjuntamos listeners después de renderizar
    attachPostListeners({ communityId, currentUser, containerId });
  } catch (err) {
    console.error("[postFeed] renderPostFeed: Error al cargar posts:", err);
    postsContainer.innerHTML = `
      <p style="text-align:center; color:#E74C3C; margin-top:20px;">
        Error al cargar publicaciones.
      </p>`;
  }
}

function attachPostListeners({ communityId, currentUser, containerId }) {
  console.log("[postFeed] attachPostListeners: configurando eventos en", containerId);

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[postFeed] attachPostListeners: contenedor no encontrado id="${containerId}"`);
    return;
  }

  // “Eliminar”
  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;
      console.log(`[postFeed] attachPostListeners: click en delete-btn, postId=${postId}`);

      const result = await Swal.fire({
        title: "¿Eliminar publicación?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
      });
      if (!result.isConfirmed) return;

      try {
        console.log(`[postFeed] delete-btn: llamando a deletePost con postId=${postId}`);
        await deletePost({ postId, userId: currentUser._id });
        console.log(`[postFeed] delete-btn: post eliminado, recargando feed...`);
        await renderPostFeed({ communityId, currentUser, containerId });
      } catch (err) {
        console.error("[postFeed] delete-btn: Error al eliminar post", err);
        Swal.fire("Error", "No se pudo eliminar la publicación.", "error");
      }
    });
  });

  // “Reportar”
  container.querySelectorAll(".report-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;
      console.log(`[postFeed] attachPostListeners: click en report-btn, postId=${postId}`);
      try {
        console.log(`[postFeed] report-btn: llamando a reportPost con postId=${postId}`);
        await reportPost({ postId, userId: currentUser._id });
        console.log("[postFeed] report-btn: reporte exitoso.");
        Swal.fire("Gracias", "Se ha reportado la publicación.", "success");
      } catch (err) {
        console.error("[postFeed] report-btn: Error al reportar post", err);
        Swal.fire("Error", "No se pudo reportar la publicación.", "error");
      }
    });
  });

  // “Editar”
  container.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.id;
      console.log(`[postFeed] attachPostListeners: click en edit-btn, postId=${postId}`);

      const postCard = container.querySelector(`.post-card[data-post-id="${postId}"]`);
      const contentP = postCard.querySelector(".post-content");
      const originalContent = contentP.dataset.originalContent || contentP.textContent;

      Swal.fire({
        title: "Editar publicación",
        input: "textarea",
        inputValue: originalContent,
        showCancelButton: true,
      }).then(async (result) => {
        if (result.isConfirmed && result.value.trim()) {
          try {
            console.log(
              `[postFeed] edit-btn: llamando a editPost con postId=${postId}, newContent="${result.value.trim()}"`
            );
            await editPost({
              postId,
              newContent: result.value.trim(),
              userId: currentUser._id,
            });
            console.log("[postFeed] edit-btn: post editado, recargando feed...");
            await renderPostFeed({ communityId, currentUser, containerId });
          } catch (err) {
            console.error("[postFeed] edit-btn: Error al editar post", err);
            Swal.fire("Error", "No se pudo editar la publicación.", "error");
          }
        } else if (result.isConfirmed) {
          Swal.fire("Error", "El contenido no puede estar vacío.", "warning");
        }
      });
    });
  });
}
