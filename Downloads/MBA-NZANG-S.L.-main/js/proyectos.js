// JavaScript para la galería de proyectos

document.addEventListener('DOMContentLoaded', function() {
    // Filtrado de proyectos
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    // Añadir evento click a cada botón de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar la clase activa de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir la clase activa al botón clicado
            button.classList.add('active');
            
            // Obtener la categoría a filtrar
            const filterValue = button.getAttribute('data-filter');
            
            // Mostrar/ocultar proyectos según el filtro
            projectCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });

            // Animar la transición
            setTimeout(() => {
                projectCards.forEach(card => {
                    if (card.style.display === 'block') {
                        card.classList.add('show');
                    } else {
                        card.classList.remove('show');
                    }
                });
            }, 100);
        });
    });

    // Gestión de parámetros URL para la página de detalle
    if (window.location.pathname.includes('proyecto-detalle.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        // Aquí se podría cargar dinámicamente el contenido del proyecto según el ID
        // Por ahora, solo mostraremos el ID en la consola para verificar
        console.log(`Cargando proyecto con ID: ${projectId}`);
        
        // Para una implementación real, aquí se haría una petición a un API o se cargarían 
        // datos desde un archivo JSON para mostrar el proyecto específico
    }

    // Animación para las imágenes de la galería
    const galleryImages = document.querySelectorAll('.gallery-item img');
    if (galleryImages.length > 0) {
        galleryImages.forEach(image => {
            image.addEventListener('click', () => {
                // Aquí se podría implementar un lightbox para ver las imágenes a tamaño completo
                console.log('Imagen clicada: Se podría abrir un lightbox aquí');
            });
        });
    }

    // Navegación entre proyectos
    const prevProjectLink = document.querySelector('.prev-project a');
    const nextProjectLink = document.querySelector('.next-project a');
    
    if (prevProjectLink && nextProjectLink) {
        prevProjectLink.addEventListener('click', (e) => {
            // En una implementación real, esto llevaría al proyecto anterior
            if (!prevProjectLink.getAttribute('href') || prevProjectLink.getAttribute('href') === '#') {
                e.preventDefault();
                console.log('Navegar al proyecto anterior');
            }
        });
        
        nextProjectLink.addEventListener('click', (e) => {
            // En una implementación real, esto llevaría al proyecto siguiente
            if (!nextProjectLink.getAttribute('href') || nextProjectLink.getAttribute('href') === '#') {
                e.preventDefault();
                console.log('Navegar al proyecto siguiente');
            }
        });
    }

    // Lightbox para galería de Guinea Ventas
    const guineaventasGallery = document.getElementById('guineaventas-gallery');
    if (guineaventasGallery) {
        const images = guineaventasGallery.querySelectorAll('img');
        images.forEach((img, idx) => {
            img.style.cursor = 'pointer';
            img.onclick = () => openLightbox(images, idx);
        });
    }
});

// Lightbox para galería de Guinea Ventas
function openLightbox(images, startIndex) {
    let current = startIndex;
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${images[current].src}" alt="Imagen ampliada" id="lightbox-img">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
            <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;
    document.body.appendChild(lightbox);

    const updateImage = () => {
        const img = document.getElementById('lightbox-img');
        img.src = images[current].src;
        img.alt = images[current].alt;
    };

    lightbox.querySelector('.lightbox-close').onclick = () => lightbox.remove();
    lightbox.querySelector('.lightbox-prev').onclick = (e) => {
        e.stopPropagation();
        current = (current - 1 + images.length) % images.length;
        updateImage();
    };
    lightbox.querySelector('.lightbox-next').onclick = (e) => {
        e.stopPropagation();
        current = (current + 1) % images.length;
        updateImage();
    };
    // Swipe para móvil
    let startX = 0;
    lightbox.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    lightbox.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        if (endX - startX > 50) {
            current = (current - 1 + images.length) % images.length;
            updateImage();
        } else if (startX - endX > 50) {
            current = (current + 1) % images.length;
            updateImage();
        }
    });
    // Cerrar al hacer click fuera de la imagen
    lightbox.onclick = (e) => {
        if (e.target === lightbox) lightbox.remove();
    };
}
