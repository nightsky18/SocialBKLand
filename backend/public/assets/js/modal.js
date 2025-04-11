
        // Función para abrir el modal
        function openModal() {
            document.getElementById('authModal').style.display = 'block';
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
        window.onclick = function(event) {
            const modal = document.getElementById('authModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Manejar el envío de formularios
// LOGIN
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
  
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  
    const data = await res.json();

    if (res.ok) {
        // Verificar si el correo es admin
        if (email === "admin@example.com") {  // Asegúrate de modificarlo si es necesario
            // Guardar en el localStorage que el usuario es admin
            localStorage.setItem('isAdmin', 'true');
            window.location.href = "usuario.html";  // Redirigir al panel de admin
        } else {
            localStorage.setItem('isAdmin', 'false');
            // Si no es admin, continuar con el proceso normal
            alert("Bienvenido, usuario normal");
        }
    } else {
        // Si la autenticación falla
        alert(data.message || data.error);
    }
});

  
  // REGISTRO
  document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.querySelector('#register-form input[placeholder="Nombre completo"]').value;
    const email = document.querySelector('#register-form input[placeholder="Correo electrónico"]').value;
    const password = document.querySelector('#register-form input[placeholder="Contraseña"]').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso');
            console.log(data);
        } else {
            alert('Error en el registro: ' + data.error);
            console.error(data);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
});

