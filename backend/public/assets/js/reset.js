// controllers/resetPasswordController.js
import { resetPassword } from './passwordRecoveryService.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-form');
  const msg = document.getElementById('reset-message');

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

  if (!email) {
    msg.textContent = 'URL inválida. Falta el parámetro de correo electrónico.';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pass1 = document.getElementById('new-password').value;
    const pass2 = document.getElementById('confirm-password').value;

    if (pass1 !== pass2) {
      msg.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    msg.textContent = 'Procesando...';
    const result = await resetPassword(email, pass1);

    if (result.success) {
      msg.textContent = 'Contraseña actualizada con éxito. Redirigiendo al login...';
      setTimeout(() => window.location.href = '/catalogo.html', 3000);
    } else {
      msg.textContent = result.message || 'Error al actualizar contraseña';
    }
  });
});
