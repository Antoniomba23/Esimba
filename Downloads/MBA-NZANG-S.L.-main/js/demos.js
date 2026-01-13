// Demos JavaScript - Handles interactions for AI Laboratory demos

document.addEventListener('DOMContentLoaded', function () {
    // Demo 1: Asistente Inmobiliario
    const inmobiliariaInput = document.getElementById('input-inmobiliaria');
    const inmobiliariaBtn = document.getElementById('send-inmobiliaria');
    const inmobiliariaChat = document.getElementById('chat-inmobiliaria');
    let inmobiliariaHistory = [];

    if (inmobiliariaBtn && inmobiliariaInput) {
        inmobiliariaBtn.addEventListener('click', () => sendInmobiliariaMessage());
        inmobiliariaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendInmobiliariaMessage();
        });
    }

    async function sendInmobiliariaMessage() {
        const message = inmobiliariaInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addChatMessage(inmobiliariaChat, 'user', message);
        inmobiliariaInput.value = '';
        inmobiliariaBtn.disabled = true;
        inmobiliariaInput.disabled = true;

        // Show typing indicator
        const typingId = addTypingIndicator(inmobiliariaChat);

        try {
            const response = await fetch('/.netlify/functions/demo-inmobiliaria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: inmobiliariaHistory
                })
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const data = await response.json();

            // Update history
            inmobiliariaHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: data.message }
            );

            // Limit history
            if (inmobiliariaHistory.length > 10) {
                inmobiliariaHistory = inmobiliariaHistory.slice(-10);
            }

            removeTypingIndicator(typingId);
            addChatMessage(inmobiliariaChat, 'bot', data.message);

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingId);
            addChatMessage(inmobiliariaChat, 'bot', 'Lo siento, hubo un error. Por favor, intenta de nuevo.');
        } finally {
            inmobiliariaBtn.disabled = false;
            inmobiliariaInput.disabled = false;
            inmobiliariaInput.focus();
        }
    }

    // Demo 2: Análisis Legal
    const analyzeContractBtn = document.getElementById('analyze-contract');
    const contractText = document.getElementById('contract-text');
    const legalResult = document.getElementById('legal-result');

    if (analyzeContractBtn) {
        analyzeContractBtn.addEventListener('click', analyzeContract);
    }

    async function analyzeContract() {
        const text = contractText.value.trim();
        if (text.length < 50) {
            alert('Por favor, proporciona un texto de contrato más largo (mínimo 50 caracteres)');
            return;
        }

        analyzeContractBtn.disabled = true;
        legalResult.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Analizando contrato...</p></div>';
        legalResult.classList.add('show');

        try {
            const response = await fetch('/.netlify/functions/demo-legal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractText: text })
            });

            if (!response.ok) throw new Error('Error en el análisis');

            const data = await response.json();

            // Format the analysis with proper HTML
            const formattedAnalysis = formatAnalysis(data.analysis);
            legalResult.innerHTML = `
                <h3><i class="fas fa-file-contract"></i> Análisis Completo</h3>
                <div class="analysis-content">${formattedAnalysis}</div>
            `;

        } catch (error) {
            console.error('Error:', error);
            legalResult.innerHTML = '<p style="color: #d32f2f;"><i class="fas fa-exclamation-circle"></i> Error al analizar el contrato. Por favor, intenta de nuevo.</p>';
        } finally {
            analyzeContractBtn.disabled = false;
        }
    }

    // Demo 3: Calculadora de Proyectos
    const calculateBtn = document.getElementById('calculate-project');
    const projectDesc = document.getElementById('project-description');
    const calculatorResult = document.getElementById('calculator-result');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateProject);
    }

    async function calculateProject() {
        const description = projectDesc.value.trim();
        if (description.length < 20) {
            alert('Por favor, proporciona una descripción más detallada (mínimo 20 caracteres)');
            return;
        }

        calculateBtn.disabled = true;
        calculatorResult.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Calculando estimación...</p></div>';
        calculatorResult.classList.add('show');

        try {
            const response = await fetch('/.netlify/functions/demo-calculadora', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectDescription: description })
            });

            if (!response.ok) throw new Error('Error en el cálculo');

            const data = await response.json();

            // Format the estimate
            const formattedEstimate = formatAnalysis(data.estimate);
            calculatorResult.innerHTML = `
                <h3><i class="fas fa-chart-line"></i> Estimación del Proyecto</h3>
                <div class="estimate-content">${formattedEstimate}</div>
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <strong><i class="fas fa-phone"></i> ¿Listo para empezar?</strong><br>
                    Contacta con nosotros:<br>
                    WhatsApp: <a href="https://wa.me/240222704373" target="_blank">+240 222 704 373</a><br>
                    Email: <a href="mailto:infombanzang@gmail.com">infombanzang@gmail.com</a>
                </div>
            `;

        } catch (error) {
            console.error('Error:', error);
            calculatorResult.innerHTML = '<p style="color: #d32f2f;"><i class="fas fa-exclamation-circle"></i> Error al calcular la estimación. Por favor, intenta de nuevo.</p>';
        } finally {
            calculateBtn.disabled = false;
        }
    }

    // Helper Functions
    function addChatMessage(container, sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        // Format text with basic markdown support
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        bubble.innerHTML = formattedText;

        messageDiv.appendChild(bubble);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    function addTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        const id = 'typing-' + Date.now();
        typingDiv.id = id;
        typingDiv.className = 'chat-message bot';
        typingDiv.innerHTML = `
            <div class="message-bubble" style="background: #e0e0e0; color: #666;">
                <i class="fas fa-spinner fa-spin"></i> Escribiendo...
            </div>
        `;
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    function formatAnalysis(text) {
        // Convert markdown-style formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h2>$1</h2>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gim, '<p>$1</p>')
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><\/p>/g, '</li></ul>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-4])><\/p>/g, '</h$1>');
    }
});
