// AdminComunidades.js
document.addEventListener("DOMContentLoaded", () => {
  cargarComunidades();

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "cerrarResumenModal") {
      closeComunidadResumenModal();
    }
  });
});



async function cargarComunidades() {
  try {
    const response = await fetch("/api/community");
    const comunidades = await response.json();

    const tabla = document.getElementById("comunidadesTableBody");
    const mensaje = document.getElementById("sinComunidadesMensaje");
    tabla.innerHTML = "";

    const enRevision = comunidades.filter(c => c.underReview);

    if (enRevision.length === 0) {
      mensaje.style.display = "block";     // Mostrar mensaje
      return;                               // Salir antes de renderizar tabla
    }

    mensaje.style.display = "none";         // Ocultar mensaje si hay comunidades

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
          <button class="action-btn revisar-btn" data-id="${comunidad._id}">🔍 Revisar</button>
          <button class="action-btn eliminar-btn" data-id="${comunidad._id}" data-nombre="${comunidad.name}">🗑 Eliminar</button>
        </td>
      `;

      tabla.appendChild(fila);
    });

    // 🔁 Agregar eventos después de renderizar la tabla
    document.querySelectorAll(".revisar-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        verResumenComunidad(id);
      });
    });

    document.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const nombre = btn.getAttribute("data-nombre");
        confirmarEliminacion(id, nombre);
      });
    });

  } catch (error) {
    console.error("Error al cargar comunidades:", error);
  }
}


async function verResumenComunidad(id) {
  try {
    const response = await fetch(`/api/community/${id}`);
    const comunidad = await response.json();

    document.getElementById("resumen-nombre").textContent = comunidad.name;
    document.getElementById("resumen-desc").textContent = comunidad.topic || "(Sin tema)";
    document.getElementById("resumen-miembros").textContent = comunidad.members.length;
    document.getElementById("resumen-publicaciones").textContent = comunidad.posts.length;

    // Mostrar miembros
    const listaMiembros = document.getElementById("resumen-miembros-lista");
    listaMiembros.innerHTML = "";
    comunidad.members.forEach(m => {
      const li = document.createElement("li");
      li.textContent = m.user?.name || "(Sin nombre)";
      listaMiembros.appendChild(li);
    });

    // Mostrar publicaciones
// Obtener los posts reales desde la nueva ruta
const responsePosts = await fetch(`/api/posts/community/${id}/resumen`);
const posts = await responsePosts.json();

const listaPosts = document.getElementById("resumen-posts-lista");
listaPosts.innerHTML = "";

posts.forEach(p => {
  const li = document.createElement("li");
  li.textContent = `${p.author?.name || "Autor desconocido"}: ${p.content.substring(0, 100)}...`;
  listaPosts.appendChild(li);
});

    document.getElementById("comunidadResumenModal").style.display = "block";

  } catch (error) {
    console.error("Error al obtener resumen de comunidad:", error);
  }
}async function confirmarEliminacion(id, nombre) {
  const confirmacion = await Swal.fire({
    title: `¿Eliminar comunidad "${nombre}"?`,
    text: "Esta acción es irreversible. Se eliminarán todos sus datos.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#E05252",
    cancelButtonColor: "#808080",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`/api/community/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al eliminar comunidad");

      let extra = "";
      if (data.logStatus === "registrado") {
        extra = "\n La acción fue registrada en AdminLog.";
      } else if (data.logStatus === "no_registrado") {
        extra = "\n La comunidad fue eliminada, pero no se pudo registrar la acción.";
      }

      await Swal.fire({
        icon: "success",
        title: "Comunidad eliminada",
        text: `La comunidad "${nombre}" fue eliminada correctamente.${extra}`,
        confirmButtonColor: "#62B9F9"
      });

      cargarComunidades(); 

    } catch (error) {
      console.error("Error al eliminar comunidad:", error);
      Swal.fire("Error", error.message || "No se pudo eliminar la comunidad.", "error");
    }
  }
}



function closeComunidadResumenModal() {
  document.getElementById("comunidadResumenModal").style.display = "none";
}
