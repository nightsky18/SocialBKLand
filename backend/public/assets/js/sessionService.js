export function requireUserSession() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
      // Mostrar modal
      const modal = document.getElementById('authModal');
      if (modal) modal.style.display = 'block';
  
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión.',
        timer: 2500,
        showConfirmButton: false
      });
  
      return false;
    }
  
    return true;
  }

  export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}