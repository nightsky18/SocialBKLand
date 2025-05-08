document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openBookModal')?.addEventListener('click', window.openBookModal);
    document.getElementById('closeBookModal')?.addEventListener('click', window.closeBookModal);
    cargarLibros(); 
  });
  
// Función para crear un libro
  async function handleCreateBook(form) {
    const formData = new FormData(form);
  
    // Validar campos requeridos
    const requiredFields = ['title', 'author', 'price', 'category', 'quantity', 'description'];
    const errors = [];
  
    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || value.trim() === '') {
        errors.push(`El campo "${field}" es obligatorio`);
      }
    }
  
    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios faltantes',
        html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
        willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '10001';
          }
      });
      return;
    }
  
    // Construir objeto para la API
    const book = {
      title: formData.get('title'),
      author: formData.get('author'),
      isbn: formData.get('isbn') || '',
      price: parseFloat(formData.get('price')),
      originalPrice: parseFloat(formData.get('originalPrice')) || undefined,
      quantity: parseInt(formData.get('quantity')),
      category: formData.get('category'),
      description: formData.get('description'),
      deliveryTime: formData.get('deliveryTime') || '',
      isDiscounted: formData.get('isDiscounted') === 'on',
      rating: 0 // por defecto
    };
  
    //  Subir imagen si existe
    const imageFile = formData.get('imageFile');
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadedPath = await uploadImage(imageFile);
        book.image = uploadedPath;
      } catch (error) {
        return Swal.fire({
          icon: 'error',
          title: 'Error al subir imagen',
          text: error.message || 'No se pudo subir la imagen',
          willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '99999';
          }
        });
      }
    } else {
      return Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debes seleccionar una imagen para el libro.',
        willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '100001';
          }
      });
    }
  
    //  Enviar al servidor
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error al guardar el libro');
      }
      
  
      const data = await res.json();
  
      Swal.fire({
        icon: 'success',
        title: 'Libro creado',
        text: `El libro "${data.title}" ha sido guardado.`,
        timer: 2000,
        showConfirmButton: false,
        willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '100001';
          }
      });
  
      form.reset();
      closeBookModal();
      await cargarLibros(); // función que debe refrescar la tabla
  
    } catch (err) {
      console.error('Error al guardar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err.message || 'Error inesperado', 
        willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '100001';
          }
      });
    }
  }
  
// Función para subir la imagen al servidor
  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
  
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.message || 'Error al subir imagen');
    }
  
    return data.imagePath; // se espera que retorne la ruta: "/images/imagen.jpg"
  }

  //
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateBook(form);
        await cargarLibros(); // Refrescar la tabla después de crear un libro
        form.reset(); // Limpiar el formulario después de enviar
      });
    }
  });


 // Función para cargar los libros en la tabla 
  async function cargarLibros() {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('No se pudieron cargar los libros');
  
      const books = await res.json();
      const tbody = document.getElementById('librosTablaBody');
      const tabla = document.getElementById('tablaLibrosContainer');
      const sinLibros = document.getElementById('sinLibros');
  
      tbody.innerHTML = ''; // limpiar tabla
  
      if (books.length === 0) {
        tabla.style.display = 'none';
        sinLibros.style.display = 'block';
        return;
      }
  
      sinLibros.style.display = 'none';
      tabla.style.display = 'block';
  
      books.forEach(book => {
        const tr = document.createElement('tr');
  
        tr.innerHTML = `
          <td><img src="${book.image}" alt="${book.title}" style="width: 60px; height: auto; border-radius: 6px;"></td>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.isbn || '-'}</td>
          <td>${book.category}</td>
          <td>$${book.price.toFixed(2)}</td>
          <td>${book.originalPrice ? `$${book.originalPrice.toFixed(2)}` : '-'}</td>
          <td>${book.quantity}</td>
          <td>${book.isDiscounted ? 'Sí' : 'No'}</td>
          <td>${book.rating?.toFixed(1) || '0'}</td>
          <td>${book.deliveryTime || '-'}</td>
          <td class="acciones">
            <button class="btn-ver" data-id="${book._id}"><i class="fas fa-eye"></i></button>
            <button class="btn-editar" data-id="${book._id}"><i class="fas fa-edit"></i></button>
            <button class="btn-eliminar" data-id="${book._id}"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
  
        tbody.appendChild(tr);
      });
  
      conectarBotonesAcciones(); // asignar listeners
    } catch (err) {
      console.error('Error al cargar libros:', err);
      Swal.fire('Error', err.message || 'No se pudieron cargar los libros', 'error');
    }
  }
  
  // Función para conectar los botones de acción
  function conectarBotonesAcciones() {
    document.querySelectorAll('.btn-ver').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        mostrarLibro(id);
      });
    });
  
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        editarLibro(id);
      });
    });
  
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        eliminarLibro(id);
      });
    });
  }
  