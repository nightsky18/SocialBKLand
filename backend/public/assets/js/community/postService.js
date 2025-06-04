// public/assets/js/community/postService.js

/**
 * postService.js
 * ——————————
 * Funciones para comunicarse con el backend (/api/posts)
 * y devolver datos a los componentes de publicación.
 *
 * Cada función ahora incluye console.log en puntos críticos.
 */

export async function fetchPostsByCommunity(communityId) {
  console.log(`[postService] fetchPostsByCommunity: iniciando con communityId=${communityId}`);

  try {
    const res = await fetch(`/api/posts/community/${communityId}`);
    console.log("[postService] fetchPostsByCommunity: respuesta cruda:", res);

    if (!res.ok) {
      const texto = await res.text();
      console.error(
        `[postService] fetchPostsByCommunity: respuesta no ok (${res.status}). body:`,
        texto
      );
      throw new Error(`Error ${res.status} al obtener posts: ${texto}`);
    }

    const posts = await res.json();
    console.log("[postService] fetchPostsByCommunity: posts recibidos:", posts);
    return posts;
  } catch (err) {
    console.error("[postService] fetchPostsByCommunity: error en la petición:", err);
    throw err;
  }
}

export async function createPost({ communityId, userId, content }) {
  console.log(
    `[postService] createPost: creando post con communityId=${communityId}, userId=${userId}, content="${content}"`
  );

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId, userId, content }),
    });
    console.log("[postService] createPost: respuesta cruda:", res);

    if (!res.ok) {
      const texto = await res.text();
      console.error(
        `[postService] createPost: respuesta no ok (${res.status}). body:`,
        texto
      );
      throw new Error(`Error ${res.status} al crear post: ${texto}`);
    }

    const nuevoPost = await res.json();
    console.log("[postService] createPost: post creado:", nuevoPost);
    return nuevoPost;
  } catch (err) {
    console.error("[postService] createPost: error en la petición:", err);
    throw err;
  }
}

export async function deletePost({ postId, userId }) {
  console.log(`[postService] deletePost: eliminando postId=${postId}, userId=${userId}`);
  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    console.log("[postService] deletePost: respuesta cruda:", res);

    if (!res.ok) {
      const texto = await res.text();
      console.error(
        `[postService] deletePost: respuesta no ok (${res.status}). body:`,
        texto
      );
      throw new Error(`Error ${res.status} al eliminar post: ${texto}`);
    }

    const resultado = await res.json();
    console.log("[postService] deletePost: resultado:", resultado);
    return resultado;
  } catch (err) {
    console.error("[postService] deletePost: error en la petición:", err);
    throw err;
  }
}

export async function reportPost({ postId, userId }) {
  console.log(`[postService] reportPost: reportando postId=${postId}, userId=${userId}`);
  try {
    const res = await fetch(`/api/posts/${postId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    console.log("[postService] reportPost: respuesta cruda:", res);

    if (!res.ok) {
      const texto = await res.text();
      console.error(
        `[postService] reportPost: respuesta no ok (${res.status}). body:`,
        texto
      );
      throw new Error(`Error ${res.status} al reportar post: ${texto}`);
    }

    const resultado = await res.json();
    console.log("[postService] reportPost: resultado:", resultado);
    return resultado;
  } catch (err) {
    console.error("[postService] reportPost: error en la petición:", err);
    throw err;
  }
}

export async function editPost({ postId, newContent, userId }) {
  console.log(
    `[postService] editPost: editando postId=${postId}, userId=${userId}, newContent="${newContent}"`
  );
  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, userId }),
    });
    console.log("[postService] editPost: respuesta cruda:", res);

    if (!res.ok) {
      const texto = await res.text();
      console.error(
        `[postService] editPost: respuesta no ok (${res.status}). body:`,
        texto
      );
      throw new Error(`Error ${res.status} al editar post: ${texto}`);
    }

    const actualizado = await res.json();
    console.log("[postService] editPost: post actualizado:", actualizado);
    return actualizado;
  } catch (err) {
    console.error("[postService] editPost: error en la petición:", err);
    throw err;
  }
}
