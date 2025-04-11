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
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.querySelector('#login-form input[placeholder="Correo electrónico"]').value;
    const password = document.querySelector('#login-form input[placeholder="Contraseña"]').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos al usuario en sessionStorage

            sessionStorage.setItem('user', JSON.stringify(data.user));


            alert('Inicio de sesión exitoso');
            console.log('Usuario logueado:', email);

            // Opcional: redirige o cierra modal
            closeModal(); // si tienes una función para cerrar el modal
            checkSession();
            showUserInfo();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
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
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso');
            console.log(data);
            closeModal();
            // Cierra el modal después del registro
        } else {
            alert('Error en el registro: ' + data.error);
            console.error(data);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
});



function logout() {
    sessionStorage.removeItem('user');
    checkSession();
    alert('Sesión cerrada');
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

function closeUserInfoModal() {
    document.getElementById('userInfoModal').style.display = 'none';
}

function logout() {
    sessionStorage.removeItem('user');
    closeUserInfoModal();
    alert('Sesión cerrada');
    // Opcional: recargar para restablecer estado inicial
    location.reload();
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', checkSession);