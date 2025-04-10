document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configuración inicial
  window.user = { isAdmin: true }; // Temporal: usuario admin

  // 2. Elementos del DOM
  const adminBtn = document.querySelector(".admin-libros");
  const librosStat = document.querySelector("#libros-agregados");

  // 3. Mostrar elementos admin si corresponde
  if (window.user?.isAdmin) {
    if (adminBtn) adminBtn.style.display = "inline-block";
    if (librosStat) librosStat.closest(".stat").style.display = "block";
    initBookManagement();
  }

  // 4. Cargar libros iniciales
  await loadBooks();
});

// Función principal de gestión de libros
function initBookManagement() {
  createBookModal();
  setupEventListeners();
}



// Función para cargar libros
async function loadBooks() {
  try {
    const response = await fetch("/api/books");
    if (response.ok) {
      const books = await response.json();
      console.log("Libros cargados:", books);
      // Aquí puedes actualizar la UI con los libros
    } else {
      console.error("Error al cargar libros:", response.status);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
}

// Crear el modal del formulario
function createBookModal() {
  if (document.getElementById("bookModal")) return;

const modalHTML = `
  <div id="bookModal" class="book-modal-overlay">
    <div class="book-modal">
      <div class="modal-drag-handle" id="modalDragHandle">
        <h2 class="modal-title">Agregar nuevo libro</h2>
       <button id="closeBookModal" class="close-btn">&times;</button>

      </div>

      <form id="bookForm" class="book-form">

        <div class="form-group">
          <label for="categorySelect">Categoría*</label>
          <select name="category" id="categorySelect" required>
            <option value="">Selecciona categoría</option>
            <option value="Ficción">Ficción</option>
            <option value="Educativo">Educativo</option>
            <option value="Técnico">Técnico</option>
            <option value="Infantil">Infantil</option>
            <option value="nueva">Nueva categoría...</option>
          </select>
        </div>

        <div id="newCategoryContainer" class="form-group" style="display:none;">
          <label for="newCategoryInput">Nueva categoría</label>
          <input type="text" name="newCategory" id="newCategoryInput">
        </div>

        <div class="form-group">
          <label for="isbn">ISBN*</label>
          <input type="text" name="isbn" id="isbn" required>
        </div>

        <div class="form-group">
          <label for="title">Título*</label>
          <input type="text" name="title" id="title" required>
        </div>

        <div class="form-group">
          <label for="price">Precio*</label>
          <input type="number" name="price" id="price" step="0.01" required>
        </div>

        <div class="form-group">
          <label for="originalPrice">Precio original</label>
          <input type="number" name="originalPrice" id="originalPrice" step="0.01">
        </div>

        <div class="form-group">
          <label for="imageFile">Imagen</label>
          <input type="file" name="imageFile" id="imageFile" accept="image/*">
          <small>Máximo 5MB</small>
        </div>

        <div class="form-group">
          <label for="description">Descripción*</label>
          <textarea name="description" id="description" required></textarea>
        </div>

        <div class="form-group">
          <label><input type="checkbox" name="hasDiscount"> ¿Tiene descuento?</label>
        </div>

        <div class="form-group">
          <label for="bookType">Tipo:</label>
          <select name="bookType" id="bookType" required>
            <option value="physical">Físico</option>
            <option value="digital">Digital</option>
          </select>
        </div>

        <div id="digitalFields" style="display:none;">
          <div class="form-group">
            <label for="format">Formato*</label>
            <input type="text" name="format" id="format" placeholder="PDF, EPUB, MOBI">
          </div>

          <div class="form-group">
            <label for="fileSize">Tamaño (MB)*</label>
            <input type="number" name="fileSize" id="fileSize" step="0.1">
          </div>

          <div class="form-group">
            <label for="downloadLink">Enlace*</label>
            <input type="url" name="downloadLink" id="downloadLink" placeholder="https://...">
          </div>
        </div>

        <button type="submit" class="submit-btn">Guardar</button>

      </form>
    </div>
  </div>
`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Configurar event listeners
function setupEventListeners() {
  // Botón para abrir modal (debe existir en tu HTML)
  document.getElementById("openBookModal")?.addEventListener("click", () => {
    document.getElementById("bookModal").style.display = "block";
  });

  // Botón para cerrar modal
  document.getElementById("closeBookModal")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("bookModal").style.display = "none";
  });

  // Cambio entre libro físico/digital
  document.getElementById("bookType")?.addEventListener("change", (e) => {
    const digitalFields = document.getElementById("digitalFields");
    if (digitalFields) {
      digitalFields.style.display = e.target.value === "digital" ? "block" : "none";
    }
  });

  // Mostrar/ocultar campo para nueva categoría
  document.getElementById("categorySelect")?.addEventListener("change", (e) => {
    const container = document.getElementById("newCategoryContainer");
    if (container) {
      container.style.display = e.target.value === "nueva" ? "block" : "none";
    }
  });

  // Envío del formulario
  document.getElementById("bookForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitBookForm(e.target);
  });
}

// Procesar envío del formulario
async function submitBookForm(form) {
  const formData = new FormData(form);
  
  // 1. Validación
  const errors = validateBookForm(formData);
  if (errors.length > 0) {
    alert(`Errores:\n${errors.join("\n")}`);
    return;
  }
  console.log("formData.has('hasDiscount')", formData.has('hasDiscount'));
console.log("formData.get('hasDiscount')", formData.get('hasDiscount'));

  // 2. Preparar datos
  const bookData = await prepareBookData(formData);
  
  // 3. Enviar al servidor
  try {
    const response = await fetch("/api/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookData)
    });

    if (response.ok) {
      const result = await response.json();
      alert("✅ Libro agregado correctamente");
      form.reset();
      document.getElementById("bookModal").style.display = "none";
      await loadBooks(); // Recargar lista
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.message || "Error al guardar"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión con el servidor");
  }
}

// Validación del formulario
function validateBookForm(formData) {
  const errors = [];
  const type = formData.get("bookType");

  // Validaciones comunes
  if (!formData.get("isbn")) errors.push("ISBN es obligatorio");
  if (!formData.get("title")) errors.push("Título es obligatorio");
  if (!formData.get("description")) errors.push("Descripción es obligatoria");
  
  const price = parseFloat(formData.get("price"));
  if (isNaN(price)) errors.push("Precio debe ser un número válido");

  // Validación de categoría
  const category = formData.get("category");
  if (!category) {
    errors.push("Debe seleccionar una categoría");
  } else if (category === "nueva" && !formData.get("newCategory")?.trim()) {
    errors.push("Debe ingresar nombre para nueva categoría");
  }

  // Validación para libros digitales
  if (type === "digital") {
    if (!formData.get("format")) errors.push("Formato es obligatorio");
    if (!formData.get("fileSize")) errors.push("Tamaño de archivo es obligatorio");
    if (!formData.get("downloadLink")) errors.push("Enlace de descarga es obligatorio");
  }

  return errors;
}
async function uploadBookImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return result.imagePath; // Retorna la ruta relativa ej: "/assets/images/book-123456789.jpg"
    } else {
      throw new Error(result.message || 'Error al subir imagen');
    }
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
}

// Preparar datos para enviar al servidor
async function prepareBookData(formData) {
  const type = formData.get('bookType');
  const category = formData.get('category') === 'nueva' 
    ? formData.get('newCategory') 
    : formData.get('category');

  const bookData = {
    isbn: formData.get('isbn'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: parseFloat(formData.get('price')),
    category: category,
    type: type,
    hasDiscount: formData.get('hasDiscount') === 'on' 
  };

  // Campos opcionales
  if (formData.get('originalPrice')) {
    bookData.originalPrice = parseFloat(formData.get('originalPrice'));
  }

  // Procesar imagen
  const imageFile = formData.get('imageFile');
  if (imageFile && imageFile.size > 0) {
    bookData.image = await uploadBookImage(imageFile);
  }

  // Campos específicos para digital
  if (type === 'digital') {
    bookData.digital = {
      format: formData.get('format'),
      fileSize: parseFloat(formData.get('fileSize')),
      downloadLink: formData.get('downloadLink')
    };
  }

  return bookData;
}

// Convertir imagen a Base64
function convertImageToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // Solo el Base64
    reader.readAsDataURL(file);
  });
}