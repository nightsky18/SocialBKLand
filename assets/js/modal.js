
        // Función para abrir el modal
        function openModal() {
            document.getElementById('authModal').style.display = 'block';
        }

        // Función para cerrar el modal
        function closeModal() {
            document.getElementById('authModal').style.display = 'none';
        }

        // Función para cambiar entre pestañas
        function switchTab(tabName) {
            // Ocultar todos los contenidos de pestañas
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido de la pestaña seleccionada
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Actualizar las pestañas activas
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Marcar la pestaña actual como activa
            event.currentTarget.classList.add('active');
        }

        // Cerrar el modal si se hace clic fuera del contenido
        window.onclick = function(event) {
            const modal = document.getElementById('authModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Manejar el envío de formularios
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Inicio de sesión enviado');
            // Aquí iría la lógica de autenticación
        });

        document.getElementById('register-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Registro enviado');
            // Aquí iría la lógica de registro
        });