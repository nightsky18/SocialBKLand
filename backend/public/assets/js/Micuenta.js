function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('show');
}

function logout() {
  sessionStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  window.location.reload();
}

function updateUserGreeting() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const greetingEl = document.getElementById('userGreeting');

  if (user && user.name) {
    const name = user.name.split(' ')[0]; // Solo el primer nombre
    greetingEl.textContent = `Hola ${name}`;
  } else {
    greetingEl.textContent = 'Mi Cuenta';
  }
}

function handleUserMenuClick() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user) {
    toggleUserDropdown();
  } else {
    openModal();
  }
}

document.addEventListener('DOMContentLoaded', updateUserGreeting);
