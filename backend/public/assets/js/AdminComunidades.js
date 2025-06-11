// AdminComunidades.js

document.addEventListener("DOMContentLoaded", () => {
  cargarComunidades();
});

async function cargarComunidades() {
  try {
    const response = await fetch("/api/community");
    const comunidades = await response.json();

    const tabla = document.getElementById("comunidadesTableBody");
    tabla.innerHTML = "";

    const enRevision = comunidades.filter(c => c.underReview);

    enRevision.forEach(comunidad => {
      const fila = document.createElement("tr");

      const advertencia = comunidad.reports.length >= 7 ? "⚠️" : "";
      const estado = comunidad.type === "private" ? "Privada" : "Pública";

      fila.innerHTML = `
        <td>${comunidad.name} ${advertencia}</td>
        <td>${comunidad.topic || "-"}</td>
        <td>${estado}</td>
        <td>${comunidad.members.length}</td>
        <td>${comunidad.reports.length}</td>
        <td>🕵️‍♀️ En revisión</td>
        <td>
          <button class="action-btn revisar-btn" onclick="verResumenComunidad('${comunidad._id}')">🔍 Revisar</button>
          <button class="action-btn eliminar-btn" onclick="confirmarEliminacion('${comunidad._id}', '${comunidad.name}')">🗑 Eliminar</button>
        </td>
      `;

      tabla.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar comunidades:", error);
  }
}
