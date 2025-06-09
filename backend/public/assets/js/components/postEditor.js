// assets/js/community/components/postEditor.js

/**
 * postEditor.js
 * --------------
 * Se encarga de manejar la interfaz del formulario de publicación.
 * - Muestra/oculta el editor
 * - Valida contenido no vacío
 * - Al enviar, llama a postService.createPost()
 */

import { createPost } from '../community/postService.js';

export function setupPostEditor({ communityId, getCurrentUser, currentCommunity, containerId, onPostCreated }) {
  const editorSection = document.getElementById(containerId);
  const postForm = editorSection.querySelector('#post-form');
  const postContentInput = editorSection.querySelector('#post-content');

  // Inicialmente, el editor está oculto. Será mostrado por community.js
  editorSection.style.display = 'none';

  // Validación de membresía y mostrar editor si corresponde.
  function checkAndShowEditor() {
    const user = getCurrentUser();
    if (!user || !currentCommunity) return;

    const isMember = currentCommunity.members.some(m => {
      // m.user puede ser string o objeto {_id, name}
      const memberId = (typeof m.user === 'string') ? m.user : m.user._id;
      return memberId === user._id;
    });
    if (isMember) {
      editorSection.style.display = 'block';
    } else {
      editorSection.style.display = 'none';
    }
  }

  // Llamamos al inicio
  checkAndShowEditor();

  // Evento SUBMIT para crear post
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();
    if (!content) {
      Swal.fire("Error", "No puedes publicar contenido vacío.", "warning");
      return;
    }
    const user = getCurrentUser();
    if (!user || !user._id) {
      Swal.fire("Error", "Debes iniciar sesión para publicar.", "warning");
      return;
    }
    try {
      await createPost({
        content,
        communityId,
        userId: user._id
      });
      postContentInput.value = '';
      // Notificar a quien use postEditor que se creó un post
      if (typeof onPostCreated === 'function') {
        onPostCreated();
      }
    } catch (err) {
      console.error("postEditor: Error al crear post", err);
      Swal.fire("Error", "No se pudo publicar.", "error");
    }
  });

  return {
    checkAndShowEditor
  };
}