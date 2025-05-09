document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openBookModal')?.addEventListener('click', window.openBookModal);
    document.getElementById('closeBookModal')?.addEventListener('click', window.closeBookModal);
    cargarLibros(); 
    fetchCategorias(); // Cargar categorías al inicio
  });
  
// Función para crear un libro
async function handleCreateBook(form) {
    const formData = new FormData(form);
    const errors = [];
  
    // Obtener y limpiar campos
    const book = {
      title: formData.get('title')?.trim(),
      author: formData.get('author')?.trim(),
      isbn: formData.get('isbn')?.trim(),
      category: formData.get('category')?.trim(),
      description: formData.get('description')?.trim(),
      price: parseFloat(formData.get('price')),
      originalPrice: parseFloat(formData.get('originalPrice')) || undefined,
      quantity: parseInt(formData.get('quantity')),
      deliveryTime: formData.get('deliveryTime')?.trim(),
      isDiscounted: formData.get('isDiscounted') === 'on'
    };
  
    // Validar campos requeridos
    const requiredFields = ['title', 'author', 'price', 'category', 'quantity', 'description'];
    requiredFields.forEach(field => {
      if (!book[field] || (typeof book[field] === 'string' && book[field].trim() === '')) {
        errors.push(`El campo "${field}" es obligatorio`);
      }
    });
  
    // Validaciones adicionales
    if (book.price <= 0) {
      errors.push('El precio debe ser mayor que 0');
    }
  
    if (book.isDiscounted && book.originalPrice < book.price) {
      errors.push('El precio original no puede ser menor al precio actual si hay descuento');
    } else if (!book.isDiscounted && book.originalPrice !== book.price) {
      errors.push('El precio original debe ser igual al precio si no hay descuento');
    }
  
    if (book.deliveryTime && !/^\d{1,2}(-\d{1,2})?$/.test(book.deliveryTime)) {
        errors.push('El tiempo de entrega debe tener el formato # o #-# (ej: 3 o 2-5)');
      }
      
  
    // Mostrar errores si existen
    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
        willOpen: () => {
          document.querySelector('.swal2-popup').style.zIndex = '10001';
        }
      });
      return;
    }
  
    // Subir imagen
    const imageFile = formData.get('imageFile');
    if (imageFile && imageFile.size > 0) {
      try {
        book.image = await uploadImage(imageFile);
      } catch (error) {
        return Swal.fire({
          icon: 'error',
          title: 'Error al subir imagen',
          text: error.message || 'No se pudo subir la imagen',
          willOpen: () => {
            document.querySelector('.swal2-popup').style.zIndex = '10001';
          }
        });
      }
    } else {
      return Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debes seleccionar una imagen para el libro.',
        willOpen: () => {
          document.querySelector('.swal2-popup').style.zIndex = '10001';
        }
      });
    }
  
    // Enviar al servidor
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
  
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el libro');
      }
      
    
      Swal.fire({
        icon: 'success',
        title: 'Libro creado',
        text: `El libro "${data.title}" fue guardado correctamente.`,
        timer: 2000,
        showConfirmButton: false
      });
        form.reset(); // Limpiar el formulario
      
      closeBookModal();
      await cargarLibros();
      
    } catch (err) {
      console.error('Error al guardar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar el libro',
        text: err.message,
        willOpen: () => {
          document.querySelector('.swal2-popup').style.zIndex = '10001';
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
       
      });
    }
  });
 
  async function fetchCategorias() {
    const res = await fetch('/api/books');
    const books = await res.json();
  
    const categorias = [...new Set(books.map(b => b.category.toLowerCase()))]
      .sort()
      .map(c => c.charAt(0).toUpperCase() + c.slice(1));
  
    const datalist = document.getElementById('categorias-list');
    datalist.innerHTML = '';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      datalist.appendChild(option);
    });
  }
  // Función datos en la tabla 
  function capitalizar(text) {
    return text?.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  
  function formatearEntrega(entrega) {
    return entrega ? `${entrega.replace(/\s*días hábiles\s*/i, '')} días hábiles` : '-';
  }

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

        function capitalizarNombreCompleto(texto) {
            if (!texto) return '';
            return texto
              .toLowerCase()
              .split(' ')
              .map(p => p.charAt(0).toUpperCase() + p.slice(1))
              .join(' ');
          }
  
        tr.innerHTML = `
          <td><img src="${book.image}" alt="${book.title}" style="width: 60px; height: auto; border-radius: 6px;"></td>
          <td>${capitalizar(book.title)}</td>
          <td>${capitalizarNombreCompleto(book.author)}</td>
          <td>${book.isbn || '-'}</td>
          <td>${capitalizar(book.category)}</td>
          <td>$${book.price.toFixed(2)}</td>
          <td>${book.originalPrice ? `$${book.originalPrice.toFixed(2)}` : '-'}</td>
          <td>${book.quantity}</td>
          <td>${book.isDiscounted ? 'Sí' : 'No'}</td>
          <td>${book.rating?.toFixed(1) || '0'}</td>
          <td>${formatearEntrega(book.deliveryTime)}</td>
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
  
  // Función para eliminar un libro
  async function eliminarLibro(id) {
    const confirmar = await Swal.fire({
      title: '¿Eliminar libro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
  
    if (!confirmar.isConfirmed) return;
  
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El libro fue eliminado correctamente',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-custom-popup'
        }
      });
  
      await cargarLibros(); // recargar tabla
    } catch (err) {
      console.error('Error al eliminar libro:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error al eliminar el libro',
        customClass: {
          popup: 'swal2-custom-popup'
        }
      });
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
  