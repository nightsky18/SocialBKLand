document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("usersTableBody");
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const sinUsuarios = document.getElementById("sinUsuarios");
  const tablaContainer = document.querySelector(".tabla-libros");

  let usuariosCargados = [];

  try {
    const res = await fetch("/api/admins/users");
    const users = await res.json();
    usuariosCargados = users; // Guardamos para poder filtrar luego

    users.forEach(user => {
      const permisos = user.permissions?.length ?
        user.permissions.map(formatearPermiso).join(", ") :
        "—";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.isAdmin ? 'Administrador' : 'Usuario general'}</td>
        <td>${permisos}</td>
        <td>
          <button class="btn edit-role-btn"
                  data-id="${user._id}"
                  data-is-admin="${user.isAdmin}"
                  data-permissions='${JSON.stringify(user.permissions || [])}'>
            <i class="fas fa-user-cog"></i> Editar Rol
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando usuarios:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'No se pudieron cargar los usuarios'
    });
  }

  // Función para normalizar texto (sin tildes, todo en minúsculas)
  function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // Filtro por correo
  function filtrarUsuariosPorCorreo() {
    const query = normalizarTexto(searchInput?.value.trim() || "");
    let coincidencias = 0;

    const filas = tableBody.querySelectorAll("tr");

    filas.forEach(row => {
      const correo = row.querySelector("td:nth-child(2)")?.textContent || "";
      const correoNormalizado = normalizarTexto(correo);

      const visible = correoNormalizado.includes(query);
      row.style.display = visible ? "" : "none";

      if (visible) coincidencias++;
    });

    if (coincidencias === 0) {
      if (sinUsuarios) sinUsuarios.style.display = "block";
      if (tablaContainer) tablaContainer.style.display = "none";
    } else {
      if (sinUsuarios) sinUsuarios.style.display = "none";
      if (tablaContainer) tablaContainer.style.display = "block";
    }
  }

  // Listeners para buscar con botón o Enter
  searchBtn?.addEventListener("click", filtrarUsuariosPorCorreo);
  searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      filtrarUsuariosPorCorreo();
    }
  });
});

// Editar rol
document.addEventListener("click", (e) => {
  if (e.target.closest(".edit-role-btn")) {
    const btn = e.target.closest(".edit-role-btn");
    const userId = btn.getAttribute("data-id");
    const isAdmin = btn.getAttribute("data-is-admin") === "true";
    const permissions = JSON.parse(btn.getAttribute("data-permissions") || "[]");

    window.openEditRoleModal(userId, isAdmin, permissions);
  }
});

function formatearPermiso(permiso) {
  return permiso
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}
