// services/passwordRecoveryService.js

/**
 * Simula la validación del email para recuperación de contraseña
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function validateRecoveryEmail(email) {
  try {
    const response = await fetch('/api/users/recovery-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    console.error('Error al validar email de recuperación:', error);
    return { success: false, message: 'Error en el servidor' };
  }
}

/**
 * Envía la nueva contraseña al servidor
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function resetPassword(email, newPassword) {
  try {
    const response = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    return await response.json();
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return { success: false, message: 'Error en el servidor' };
  }
}