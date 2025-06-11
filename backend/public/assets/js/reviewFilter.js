// Lista de malas palabras (puedes agregar más)
const BAD_WORDS = [
  "tonto", "idiota", "estúpido", "imbécil", "mierda", "puta", "pendejo","estupido", "cabron", "gilipollas"
];

// Reemplaza cada mala palabra por asteriscos de la misma longitud
function censorBadWords(text) {
  let censored = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(regex, match => '*'.repeat(match.length));
  });
  return censored;
}

// Ejemplo de uso al renderizar reseñas:
function renderReview(review) {
  return `
    <div class="review" data-review-id="${review._id}">
      <strong>${review.user}</strong> - <span>${new Date(review.createdAt).toLocaleDateString()}</span>
      <p>${censorBadWords(review.text)}</p>
      <p>★ ${review.rating}</p>
    </div>
  `;
}