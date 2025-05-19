document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("usersTableBody");

    try {
        const response = await fetch("/api/users"); // ENDPOINT a implementar en backend
        const users = await response.json();

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
  <td>${user.name}</td>
  <td>${user.email}</td>
  <td>${user.isAdmin ? 'Administrador' : 'Usuario general'}</td>
  <td>${(user.permissions || []).join(', ') || '—'}</td>
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
    }
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".edit-role-btn")) {
    const btn = e.target.closest(".edit-role-btn");
    const userId = btn.getAttribute("data-id");
    const isAdmin = btn.getAttribute("data-is-admin") === "true";

    window.openEditRoleModal(userId, isAdmin);
  }
});
