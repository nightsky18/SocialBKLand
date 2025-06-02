// ======= Utilidades =======
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
}

// ======= Renderizar Libros del Usuario (con contenido quemado) =======
function renderUserBooks() {
  const librosUsuario = [
    {
      titulo: "El viaje del héroe",
      autor: "Autor Desconocido",
      imagen: "/assets/images/Elviajedelheroe.webp",
    },
    {
      titulo: "El poder del ahora",
      autor: "Eckhart Tolle",
      imagen: "/assets/images/poderahora.webp",
    },
  ];

  const container = document.getElementById("mis-libros-grid");
  container.innerHTML = "";

  librosUsuario.forEach((libro) => {
    const card = document.createElement("div");
    card.classList.add("book-card");

    card.innerHTML = `
      <img src="${libro.imagen}" alt="${libro.titulo}" />
      <h3>${libro.titulo}</h3>
      <p>${libro.autor}</p>
    `;

    container.appendChild(card);
  });
}

// ======= Control de Pestañas =======
document.addEventListener("DOMContentLoaded", () => {
  const seccionLibros = document.getElementById("seccion-mis-libros");
  const seccionComunidades = document.getElementById("seccion-mis-comunidades");

  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Quitar clase active de todos los botones
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Mostrar/ocultar secciones
      if (btn.id === "btn-my-communities") {
        seccionLibros.style.display = "none";
        seccionComunidades.style.display = "block";
      } else {
        seccionLibros.style.display = "block";
        seccionComunidades.style.display = "none";
      }
    });
  });

  // Cargar libros inicialmente
  renderUserBooks();
});