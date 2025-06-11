const BAD_WORDS = [
  "tonto", "idiota", "estupido", "imbécil", "mierda", "puta", "pendejo", "cabron", "gilipollas"
];

function containsBadWord(text) {
  return BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
}

function highlightBadWords(text) {
  let result = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    result = result.replace(regex, match => `<span class="bad-word">${'*'.repeat(match.length)}</span>`);
  });
  return result;
}

async function fetchReviews() {
  const res = await fetch('/api/reviews');
  return res.ok ? res.json() : [];
}

function renderAdminReview(review) {
  // Reseña principal
  let flagged = containsBadWord(review.text);
  let commentsFlagged = (review.comments || []).filter(c => containsBadWord(c.text));
  if (!flagged && commentsFlagged.length === 0) return '';

  return `
    <div class="review-card" data-review-id="${review._id}">
      <div class="review-header">
        <div><strong>Usuario:</strong> ${review.user}</div>
        <div><strong>Fecha:</strong> ${new Date(review.createdAt).toLocaleString()}</div>
        <div><strong>Calificación:</strong> ★ ${review.rating}</div>
      </div>
      ${flagged ? `
        <div class="original">
          <strong>Reseña original:</strong>
          <div class="review-text">${review.text}</div>
          <div class="actions">
            <button class="btn-valid" data-type="review">Válido</button>
            <button class="btn-invalid" data-type="review">Inválido</button>
          </div>
        </div>
      ` : ''}
      ${(review.comments || []).map(comment => containsBadWord(comment.text) ? `
        <div class="original comment-flagged" data-comment-id="${comment._id}">
          <strong>Comentario de ${comment.user} (${new Date(comment.createdAt).toLocaleString()}):</strong>
          <div class="review-text">${comment.text}</div>
          <div class="actions">
            <button class="btn-valid" data-type="comment" data-comment-id="${comment._id}">Válido</button>
            <button class="btn-invalid" data-type="comment" data-comment-id="${comment._id}">Inválido</button>
          </div>
        </div>
      ` : '').join('')}
    </div>
  `;
}

function renderReviewHTML(review) {
  return `
    <div class="review" data-review-id="${review._id}">
      <strong>${review.user || 'Anónimo'}</strong>
      <div class="comments-section">
        ${(review.comments || []).map(comment => `
          <div class="comment" data-comment-id="${comment._id}">
            <strong>${comment.user}</strong>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function addStrikeToUser(user) {
  await fetch(`/api/users/strike/${encodeURIComponent(user)}`, { method: 'PATCH' });
}

async function deleteReview(reviewId) {
  await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
}

async function deleteComment(reviewId, commentId) {
  await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, { method: 'DELETE' });
}

async function notifyUser(user, text, type = 'reseña') {
  await fetch(`/api/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user,
      message: `Tu ${type} "${text}" fue eliminada por un administrador por uso de lenguaje inapropiado.`
    })
  });
}

function showFloatingNotification(message, type = "success") {
  let notif = document.getElementById('floating-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'floating-notification';
    notif.className = 'floating-notification';
    document.body.appendChild(notif);
  }
  notif.className = 'floating-notification'; // reset
  let icon = '';
  if (type === "success") {
    notif.classList.add('show');
    icon = '<span class="icon">✅</span>';
  } else if (type === "error") {
    notif.classList.add('show', 'error');
    icon = '<span class="icon">❌</span>';
  } else if (type === "strike") {
    notif.classList.add('show', 'strike');
    icon = '<span class="icon">⚠️</span>';
  }
  notif.innerHTML = `${icon}${message}`;
  setTimeout(() => notif.classList.remove('show'), 4000);
}

async function main() {
  const container = document.getElementById('admin-reviews-container');
  const reviews = await fetchReviews();
  const flagged = reviews.filter(r => containsBadWord(r.text) || (r.comments || []).some(c => containsBadWord(c.text)));

  if (!flagged.length) {
    container.innerHTML = "<p>No hay reseñas ni comentarios con malas palabras.</p>";
    return;
  }

  container.innerHTML = flagged.map(renderAdminReview).join('');

  // Acciones para reseñas
  container.querySelectorAll('.btn-valid[data-type="review"]').forEach(btn => {
    btn.onclick = function() {
      btn.closest('.original').remove();
      // No se elimina la reseña, sigue visible
    };
  });
  container.querySelectorAll('.btn-invalid[data-type="review"]').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.review-card');
      const reviewId = card.dataset.reviewId;
      const user = card.querySelector('.review-header div').textContent.replace('Usuario:', '').trim();
      const reviewText = card.querySelector('.review-text').textContent;
      await addStrikeToUser(user);
      await deleteReview(reviewId);
      await notifyUser(user, reviewText, 'reseña');
      card.remove();
      showFloatingNotification(`La reseña fue eliminada`, "strike");
    };
  });

  // Acciones para comentarios
  container.querySelectorAll('.btn-valid[data-type="comment"]').forEach(btn => {
    btn.onclick = function() {
      btn.closest('.comment-flagged').remove();
      // No se elimina el comentario, sigue visible
    };
  });
  container.querySelectorAll('.btn-invalid[data-type="comment"]').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.review-card');
      const reviewId = card.dataset.reviewId;
      const commentDiv = btn.closest('.comment-flagged');
      const commentId = btn.getAttribute('data-comment-id');
      const user = commentDiv.querySelector('strong').textContent.match(/Comentario de (.+?) \(/)[1];
      const commentText = commentDiv.querySelector('.review-text').textContent;
      await addStrikeToUser(user);
      await deleteComment(reviewId, commentId);
      await notifyUser(user, commentText, 'comentario');
      commentDiv.remove();
      showFloatingNotification(`El comentario fue eliminado y el usuario recibió un strike.`, "strike");
    };
  });
}

main();