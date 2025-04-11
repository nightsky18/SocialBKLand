async function uploadBookImage(file) {
    // Verificar tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede exceder los 5MB');
    }
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
        // No necesitas headers con FormData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }