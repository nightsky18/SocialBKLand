/**
 * Sube una imagen de un libro al servidor.
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<Object>} Respuesta JSON del servidor
 * @throws {Error} Si el archivo es inválido o la subida falla
 */
async function uploadBookImage(file) {
  const MAX_FILE_SIZE_MB = 5;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Validar tipo de archivo
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten imágenes JPG, PNG o WEBP.');
  }

  // Validar tamaño del archivo
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`La imagen no puede exceder los ${MAX_FILE_SIZE_MB}MB.`);
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al subir imagen: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
}
