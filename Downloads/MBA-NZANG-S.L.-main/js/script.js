// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Detección automática del modo oscuro basada en las preferencias del sistema
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', '');
    }

    // Escuchar cambios en las preferencias del sistema
    prefersDarkScheme.addEventListener('change', function (e) {
        if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', '');
        }
    });
    // Funcionalidad del menú responsive
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar el menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
        });
    });

    // Funcionalidad del chatbot
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const closeChat = document.querySelector('.close-chat');
    const sendMessage = document.getElementById('sendMessage');
    const userMessage = document.getElementById('userMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Asegurar que el chatbot SIEMPRE inicie oculto
    if (chatbotContainer) {
        chatbotContainer.style.display = 'none';
    }

    // Abrir/cerrar chatbot
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function () {
            // Si el chat está visible, lo ocultamos, y si está oculto, lo mostramos
            if (chatbotContainer.style.display === 'block') {
                chatbotContainer.style.display = 'none';
            } else {
                chatbotContainer.style.display = 'block';
            }
        });
    }

    // Cerrar el chatbot con cualquier botón .close-chat
    const closeChatButtons = document.querySelectorAll('.close-chat');
    if (closeChatButtons.length) {
        closeChatButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Buscar el contenedor del chatbot más cercano y ocultarlo
                const container = btn.closest('.chatbot-container');
                if (container) {
                    container.style.display = 'none';
                }
            });
        });
    }

    // Historial de conversación para contexto
    let conversationHistory = [];

    // Función para enviar mensajes con IA
    async function sendUserMessage() {
        const message = userMessage.value.trim();
        if (message !== '') {
            // Añadir mensaje del usuario
            appendMessage('user', message);
            userMessage.value = '';

            // Deshabilitar input mientras se procesa
            userMessage.disabled = true;
            sendMessage.disabled = true;

            // Mostrar indicador de escritura
            showTyping();

            try {
                // Llamar a la Netlify Function
                const response = await fetch('/.netlify/functions/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        conversationHistory: conversationHistory
                    })
                });

                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }

                const data = await response.json();

                // Actualizar historial de conversación
                conversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.message }
                );

                // Limitar historial a últimos 10 mensajes para no exceder límites
                if (conversationHistory.length > 10) {
                    conversationHistory = conversationHistory.slice(-10);
                }

                hideTyping();
                appendMessage('bot', data.message);

            } catch (error) {
                console.error('Error al comunicarse con NOA:', error);
                hideTyping();
                appendMessage('bot', 'Lo siento, estoy teniendo problemas técnicos en este momento. Por favor, contáctanos directamente por WhatsApp al +240 222 704 373 o email a infombanzang@gmail.com 📞');
            } finally {
                // Rehabilitar input
                userMessage.disabled = false;
                sendMessage.disabled = false;
                userMessage.focus();
            }
        }
    }

    // Enviar mensaje al hacer clic en el botón o pulsar Enter
    if (sendMessage) {
        sendMessage.addEventListener('click', sendUserMessage);
    }

    if (userMessage) {
        userMessage.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    // Botones rápidos (quick replies) - mantenidos para sugerencias iniciales
    function showQuickReplies(options) {
        let quickReplies = document.getElementById('quickReplies');
        if (!quickReplies) {
            quickReplies = document.createElement('div');
            quickReplies.id = 'quickReplies';
            quickReplies.className = 'quick-replies';
            chatbotContainer.appendChild(quickReplies);
        }
        quickReplies.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = opt.label;
            btn.onclick = () => {
                userMessage.value = opt.value || opt.label;
                sendUserMessage();
                quickReplies.innerHTML = '';
            };
            quickReplies.appendChild(btn);
        });
    }

    // Mostrar sugerencias iniciales cuando se abre el chat
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function () {
            if (chatbotContainer.style.display === 'block') {
                chatbotContainer.style.display = 'none';
            } else {
                chatbotContainer.style.display = 'block';
                // Mostrar sugerencias solo si no hay historial
                if (conversationHistory.length === 0) {
                    setTimeout(() => {
                        showQuickReplies([
                            { label: '🤖 Servicios de IA', value: 'Cuéntame sobre los servicios de inteligencia artificial' },
                            { label: '💼 Ver todos los servicios', value: '¿Qué servicios ofrecen?' },
                            { label: '📞 Contacto', value: '¿Cómo puedo contactarlos?' },
                            { label: '🎯 Agendar reunión', value: 'Quiero agendar una reunión' }
                        ]);
                    }, 500);
                }
            }
        });
    }

    let userName = null;

    // Animación de "escribiendo..."
    function showTyping() {
        let typingDiv = document.getElementById('noa-typing');
        if (!typingDiv) {
            typingDiv = document.createElement('div');
            typingDiv.id = 'noa-typing';
            typingDiv.className = 'message bot typing-indicator';
            const avatar = document.createElement('img');
            avatar.src = 'img/noa.png';
            avatar.alt = 'Noa';
            avatar.className = 'chatbot-avatar';
            typingDiv.appendChild(avatar);
            const typingText = document.createElement('p');
            typingText.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
            typingDiv.appendChild(typingText);
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    function hideTyping() {
        const typingDiv = document.getElementById('noa-typing');
        if (typingDiv) typingDiv.remove();
    }

    // Modificar appendMessage para mejor formato
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (sender === 'bot') {
            const avatar = document.createElement('img');
            avatar.src = 'img/noa.png';
            avatar.alt = 'Noa';
            avatar.className = 'chatbot-avatar';
            messageDiv.appendChild(avatar);
        }
        const messagePara = document.createElement('p');

        // Convertir saltos de línea y formato básico
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        messagePara.innerHTML = formattedText;

        messageDiv.appendChild(messagePara);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Mostrar feedback al usuario
    function showFeedbackRequest() {
        let quickReplies = document.getElementById('quickReplies');
        if (!quickReplies) {
            quickReplies = document.createElement('div');
            quickReplies.id = 'quickReplies';
            quickReplies.className = 'quick-replies';
            chatbotContainer.appendChild(quickReplies);
        }
        quickReplies.innerHTML = '';
        const texto = document.createElement('span');
        texto.textContent = '¿Te ha sido útil la ayuda de NOA?';
        quickReplies.appendChild(texto);
        ['👍 Sí', '👎 No'].forEach((label, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = label;
            btn.onclick = () => {
                quickReplies.innerHTML = '';
                if (idx === 0) {
                    appendMessage('bot', '¡Gracias por tu valoración positiva! 😊');
                } else {
                    appendMessage('bot', 'Gracias por tu sinceridad. Si tienes sugerencias para mejorar, escríbelas aquí.');
                }
            };
            quickReplies.appendChild(btn);
        });
    }

    // Funcionalidad del formulario de contacto - desactivada para permitir el envío a FormSubmit
    // El formulario ahora se envía directamente a FormSubmit sin interceptación JavaScript

    // Efecto de animación para las tarjetas al hacer scroll
    function revealOnScroll() {
        const elements = document.querySelectorAll('.card');
        const windowHeight = window.innerHeight;

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - 100) {
                element.classList.add('revealed');
            }
        });
    }

    // Añadir evento de scroll
    window.addEventListener('scroll', revealOnScroll);

    // Ejecutar una vez al cargar la página
    revealOnScroll();

    // Ya tenemos la detección de preferencias del sistema implementada al inicio
});
