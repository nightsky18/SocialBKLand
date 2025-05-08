module.exports = function(upload) {
    const express = require('express');
    const router = express.Router();
  
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
  
    return router;
  };