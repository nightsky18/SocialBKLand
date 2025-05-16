document.addEventListener("DOMContentLoaded", () => {
  const userData = sessionStorage.getItem('user');
  let isAdmin = false;

  if (userData) {
    try {
      const user = JSON.parse(userData);
      isAdmin = user.isAdmin === true;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }

  const adminBtn = document.getElementById("openBookModal");
  const adminSeccion = document.getElementById("adminSeccion");
  const librosStat = document.querySelector("#libros-agregados");

  if (isAdmin) {
    if (adminBtn) adminBtn.style.display = "inline-block";
    if (adminSeccion) adminSeccion.style.display = "block";
    if (librosStat) librosStat.closest(".stat").style.display = "block";

    adminBtn?.addEventListener("click", () => {
      window.location.href = "/gestionLibros.html";
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const userBtn = document.querySelector('.user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      window.location.href = '/usuario.html';
    });
  }
});

document.querySelector('.cart-btn').addEventListener('click', function() {
  window.location.href = "./carrito.html";
});

// Asegúrate de que este código se ejecute después de que el DOM esté completamente cargado

document.addEventListener('DOMContentLoaded', () => {

  // --- Lógica para mostrar la información del usuario ---
  const userNameDisplay = document.getElementById('perfil-nombre');
  const userEmailDisplay = document.getElementById('perfil-email');
  const registroFechaDisplay = document.getElementById('registroFecha');

  const userData = sessionStorage.getItem('user');

  if (userData) {
    try {
      const user = JSON.parse(userData);

      // Mostrar nombre y email (si existen en los datos guardados)
      if (userNameDisplay && user.name) {
        userNameDisplay.textContent = user.name;
      } else if (userNameDisplay && user.email) { // Fallback si no hay nombre, mostrar email
         userNameDisplay.textContent = user.email;
      }

      if (userEmailDisplay && user.email) {
        userEmailDisplay.textContent = user.email;
      }

      // Mostrar fecha de registro (si existe y está en un formato usable)
      // Asumiendo que user.createdAt o similar contiene la fecha
      if (registroFechaDisplay && user.createdAt) {
        try {
          const date = new Date(user.createdAt);
          // Formatear la fecha como desees (ej: dd-mm-yyyy)
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexed
          const year = date.getFullYear();
          registroFechaDisplay.textContent = `${day}-${month}-${year}`;
        } catch (e) {
          console.error("Error formatting date:", e);
          registroFechaDisplay.textContent = 'Fecha no disponible';
        }
      } else if (registroFechaDisplay) {
          registroFechaDisplay.textContent = 'Fecha no disponible';
      }


    } catch (e) {
      console.error("Error parsing user data from sessionStorage:", e);
      // Manejar el caso donde los datos en sessionStorage son inválidos
      // Quizás redirigir al login o mostrar un mensaje de error
    }
  } else {
    // Si no hay datos de usuario en sessionStorage, el usuario no está logueado
    // Aquí podrías redirigir al usuario a la página de login
    console.log("No user data found in sessionStorage. User not logged in.");
    // window.location.href = "/login.html"; // Ejemplo de redirección
    // Ocultar partes de la UI que requieren login
  }

  // --- Lógica para el modal de edición ---
  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  const editProfileModal = document.getElementById('editProfileModal');
  const editProfileForm = document.getElementById('editProfileForm');
  const editNameInput = document.getElementById('editName');
  const editEmailInput = document.getElementById('editEmail'); // Si permites editar el email

  // Función para abrir el modal de edición
  window.openEditProfileModal = () => {
    const currentUserData = sessionStorage.getItem('user');
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      // Rellenar el formulario con los datos actuales del usuario
      if (editNameInput && user.name) {
        editNameInput.value = user.name;
      }
      if (editEmailInput && user.email) {
        editEmailInput.value = user.email;
      }
      // Mostrar el modal
      if (editProfileModal) {
        editProfileModal.style.display = 'block';
      }
    } else {
       // Manejar el caso si no hay usuario logueado (aunque deberías redirigir antes)
       console.error("No user data to edit.");
       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: 'No se encontraron datos de usuario para editar.'
       });
    }
  };

  // Función para cerrar el modal de edición
  window.closeEditProfileModal = () => {
    if (editProfileModal) {
      editProfileModal.style.display = 'none';
    }
  };

  // Event listener para el botón "Editar mi perfil"
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', openEditProfileModal);
  }

  // Event listener para el envío del formulario de edición
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const updatedName = editNameInput.value;
      const updatedEmail = editEmailInput.value; // Si se puede editar el email

      // Obtener el ID del usuario para la petición PATCH/PUT
      const currentUserData = sessionStorage.getItem('user');
      if (!currentUserData) {
         console.error("No user data found for update.");
         Swal.fire({
           icon: 'error',
           title: 'Error',
           text: 'No se encontraron datos de usuario para actualizar.'
         });
         return;
      }
      const user = JSON.parse(currentUserData);
      const userId = user._id; // Asumiendo que tu objeto de usuario tiene un campo _id de MongoDB

      if (!userId) {
         console.error("User ID not found.");
          Swal.fire({
           icon: 'error',
           title: 'Error',
           text: 'ID de usuario no encontrado.'
         });
         return;
      }

      try {
        // Realizar la petición al backend para actualizar el usuario
        const res = await fetch(`/api/users/${userId}`, { // **DEBES IMPLEMENTAR ESTE ENDPOINT EN TU BACKEND**
          method: 'PATCH', // O PUT, dependiendo de tu API
          headers: {
            'Content-Type': 'application/json',
            // Si usas tokens (JWT), DEBES incluirlos aquí para autenticar la solicitud
            // 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
          },
          body: JSON.stringify({
             name: updatedName,
             email: updatedEmail // Incluir si se puede editar el email
             // Incluir otros campos editables
          })
        });

        const data = await res.json();

        if (res.ok) {
          // Actualizar los datos en sessionStorage con la respuesta del servidor (si el server devuelve el usuario actualizado)
          // O construir el objeto user actualizado si el server solo devuelve éxito
          const updatedUser = { ...user, name: updatedName, email: updatedEmail }; // Ejemplo si solo actualizas name/email
          sessionStorage.setItem('user', JSON.stringify(updatedUser));

          // Actualizar la interfaz de usuario en la página con los nuevos datos
          if (userNameDisplay) userNameDisplay.textContent = updatedUser.name;
          if (userEmailDisplay) userEmailDisplay.textContent = updatedUser.email;


          Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Tu información ha sido guardada.',
            timer: 2000,
            showConfirmButton: false
          });
          closeEditProfileModal(); // Cerrar el modal tras el éxito

        } else {
          // Mostrar error si el backend responde con un problema
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: data.message || data.error || 'No se pudo actualizar el perfil'
          });
        }
      } catch (error) {
        // Mostrar error si hay un problema de red o del servidor
        console.error("Error updating profile:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor para actualizar el perfil'
        });
      }
    });
  }


  // --- Tu código existente (chequeo de admin, listeners de botones) ---
  // Esto puede quedarse donde está o integrarse aquí, asegúrate de que no haya duplicados

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  // window.user = { isAdmin }; // Esto puede ser redundante si ya tienes el objeto user del sessionStorage

  const adminSeccion = document.getElementById("adminSeccion");
  // const librosStat = document.querySelector("#libros-agregados"); // Este select parece incorrecto según tu HTML anterior

  if (isAdmin) {
    // if (adminBtn) adminBtn.style.display = "inline-block"; // adminBtn no está definido aquí
    if (adminSeccion) adminSeccion.style.display = "block";
    // if (librosStat) librosStat.closest(".stat").style.display = "block"; // lógica y select a revisar
  }

  // Listener para el botón de usuario (ya estaba, pero puedes dejarlo)
  // const userBtn = document.querySelector('.user-btn');
  // if (userBtn) {
  //   userBtn.addEventListener('click', () => {
  //     window.location.href = '/usuario.html'; // Esto es un poco redundante si ya estás en usuario.html
  //   });
  // }

  // Listener para el botón del carrito (ya estaba, puedes dejarlo)
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
      cartBtn.addEventListener('click', function() {
        window.location.href = "./carrito.html";
      });
  }

  // Asegúrate de que openModal y closeModal (del modal de login/registro) estén definidos en modal.js
  // Asegúrate de que closeUserInfoModal (del modal de info de usuario) esté definida en modal.js
  // Asegúrate de que logout() esté definida si la usas en el modal de info de usuario

});

// Define openEditProfileModal y closeEditProfileModal globalmente si no estás usando módulos
// Si estás usando modules (type="module"), puedes exportarlas o asegurarte de que el DOMContentLoaded las defina en el ámbito correcto
// window.openEditProfileModal = openEditProfileModal;
// window.closeEditProfileModal = closeEditProfileModal;