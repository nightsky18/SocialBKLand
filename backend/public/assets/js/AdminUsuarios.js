document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("usersTableBody");

  try {
    const res = await fetch("/api/admins/users"); 
    const users = await res.json();

    users.forEach(user => {
      const permisos = user.permissions?.length
        ? user.permissions.join(", ")
        : "—";

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
});


document.addEventListener("click", (e) => {
  if (e.target.closest(".edit-role-btn")) {
    const btn = e.target.closest(".edit-role-btn");
    const userId = btn.getAttribute("data-id");
    const isAdmin = btn.getAttribute("data-is-admin") === "true";
    const permissions = JSON.parse(btn.getAttribute("data-permissions") || "[]");

    window.openEditRoleModal(userId, isAdmin, permissions);
  }
});


