document.addEventListener("DOMContentLoaded", () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  window.user = { isAdmin };

  const adminBtn = document.getElementById("openBookModal");
  const adminSeccion = document.getElementById("adminSeccion");
  const librosStat = document.querySelector("#libros-agregados");

  if (isAdmin) {
    if (adminBtn) adminBtn.style.display = "inline-block";
    if (adminSeccion) adminSeccion.style.display = "block";
    if (librosStat) librosStat.closest(".stat").style.display = "block";

    // Navegar a gestión de libros
    adminBtn?.addEventListener("click", () => {
      window.location.href = "/gestionLibros.html"; 
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const userBtn = document.querySelector('.user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      window.location.href = '/usuario.html';
    });
  }
});

document.querySelector('.cart-btn').addEventListener('click', function() {
  window.location.href = "./carrito.html";
});