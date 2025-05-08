export function requireUserSession() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
      // Mostrar modal
      const modal = document.getElementById('authModal');
      if (modal) modal.style.display = 'block';
  
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar libros al carrito.',
        timer: 2500,
        showConfirmButton: false
      });
  
      return false;
    }
  
    return true;
  }