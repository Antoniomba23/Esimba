document.addEventListener('DOMContentLoaded', function() {
    // Configuración de fechas mínimas para el formulario
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput && checkOutInput) {
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        checkInInput.min = today;
        
        // Actualizar fecha mínima de salida cuando cambia la fecha de llegada
        checkInInput.addEventListener('change', function() {
            checkOutInput.min = this.value;
        });
    }

    // Galería de imágenes
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                // Implementar lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <img src="${imgSrc}" alt="Imagen ampliada">
                        <button class="lightbox-close">&times;</button>
                    </div>
                `;
                document.body.appendChild(lightbox);

                // Cerrar lightbox
                lightbox.addEventListener('click', function(e) {
                    if (e.target === lightbox || e.target.className === 'lightbox-close') {
                        lightbox.remove();
                    }
                });
            });
        });
    }
});

async function cargarInformacionHotel(hotelId) {
    try {
        const response = await fetch(`