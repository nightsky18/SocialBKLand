const fs = require('fs');
const path = require('path');

module.exports = function(upload) {
  const express = require('express');
  const router = express.Router();

  // SUBIR imagen
  router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ningún archivo'
      });
    }

    const imagePath = `/assets/images/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      imagePath: imagePath
    });
  });

  // ELIMINAR imagen
  router.delete('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'public', 'assets', 'images', filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar imagen:', err);
        return res.status(404).json({ message: 'No se pudo eliminar la imagen (¿ya no existe?)' });
      }

      res.status(200).json({ message: 'Imagen eliminada correctamente' });
    });
  });

  return router;
};
