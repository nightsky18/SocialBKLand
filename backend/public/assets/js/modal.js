const user = JSON.parse(sessionStorage.getItem('user'));
if (user) {
    console.log('Usuario en sesión:', user.email);

} else {
    console.log('No hay sesión activa');
}


// Función para abrir el modal
function openModal() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
        // Si hay usuario en sesión, mostrar modal de información
        showUserInfo();
    } else {
        // Si no hay sesión, mostrar modal de login/registro
        document.getElementById('authModal').style.display = 'block';
    }
}

function userPerfil() {
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (user) {
    // Redirigir al perfil
    window.location.href = "usuario.html";
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Ingresa a tu cuenta',
      text: 'Debes iniciar sesión para acceder al perfil.'
    });
  }
}



// Función para cerrar el modal
function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Función para cambiar entre pestañas
function switchTab(tabName) {
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Mostrar el contenido de la pestaña seleccionada
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Actualizar las pestañas activas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Marcar la pestaña actual como activa
    event.currentTarget.classList.add('active');
}

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Manejar el envío de formularios
// LOGIN
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        closeModal();

        if (email === "admin@example.com") {
          localStorage.setItem('isAdmin', 'true');
          window.location.href = "usuario.html";
        } else {
          localStorage.setItem('isAdmin', 'false');
          Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: 'Has iniciado sesión como usuario normal',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: data.message || data.error
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor'
      });
    }
  });
}

// REGISTRO
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const name = registerForm.querySelector('input[placeholder="Nombre completo"]').value;
      const email = registerForm.querySelector('input[placeholder="Correo electrónico"]').value;
      const password = registerForm.querySelector('input[placeholder="Contraseña"]').value;
  
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: '¡Ahora puedes iniciar sesión!',
            timer: 2000,
            showConfirmButton: false
          });
          closeModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: data.error || 'Intenta de nuevo'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor'
        });
      }
    });
  }
  

// Mostrar modal con info de usuario
function showUserInfoModal(user) {
    document.getElementById('user-name').textContent = user.name || 'Nombre no disponible';
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('userInfoModal').style.display = 'block';
}

// Cerrar modal de info de usuario
function closeUserInfoModal() {
    document.getElementById('userInfoModal').style.display = 'none';
}




function showUserInfo() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('userInfoModal').style.display = 'block';
    }
}


function logout() {
    sessionStorage.removeItem('user');
    window.location.href = "catalogo.html"
    closeUserInfoModal();

    Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        timer: 1500,
        showConfirmButton: false
    });

    localStorage.removeItem('cart'); // si lo estás guardando ahí
    sessionStorage.removeItem('cart'); // por si acaso

    // Recargar después de un pequeño retraso para que se vea el mensaje
    setTimeout(() => {
        location.reload();
    }, 1600);
}

// Función para abrir modal de libro desde cualquier parte
window.openBookModal = function () {
    const modal = document.getElementById('bookModal');
    if (modal) modal.style.display = 'block';
  };
  // Cerrar modal de libro
  window.closeBookModal = function () {
    const modal = document.getElementById('bookModal');
    if (modal) modal.style.display = 'none';
  
    //  Emitir evento para que lo escuche gestionLibros.js
    window.dispatchEvent(new Event('modal:closed'));
  };
  

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', checkSession);