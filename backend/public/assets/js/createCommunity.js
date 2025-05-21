// Mostrar el modal si el usuario está logueado
document.getElementById('btn-crear-comunidad').addEventListener('click', () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    Swal.fire('Inicia sesión para crear una comunidad');
    return;
  }
  document.getElementById('modalCrearComunidad').style.display = 'block';
});

function cerrarModalCrearComunidad() {
  document.getElementById('modalCrearComunidad').style.display = 'none';
  document.getElementById('mensajeCreacion').textContent = '';
}

// Manejo del formulario de creación
document.getElementById('formCrearComunidad').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreComunidad').value.trim();
  const tema = document.getElementById('temaComunidad').value.trim();
  const tipo = document.getElementById('tipoComunidad').value;

  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user || !user._id) {
    Swal.fire('Error: No se pudo obtener tu sesión. Por favor, inicia sesión nuevamente.');
    return;
  }

  try {
    const res = await fetch('/api/community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nombre,
        topic: tema,
        type: tipo,
        userId: user._id 
      })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('mensajeCreacion').textContent = 'Comunidad creada con éxito';
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      document.getElementById('mensajeCreacion').textContent = data.message || 'Error al crear la comunidad.';
    }
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    document.getElementById('mensajeCreacion').textContent = 'Error de conexión con el servidor.';
  }
});