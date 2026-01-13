const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { projectDescription } = JSON.parse(event.body);

        if (!projectDescription || projectDescription.trim().length < 20) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Por favor, proporciona una descripción del proyecto (mínimo 20 caracteres)'
                })
            };
        }

        // System prompt para calculadora de proyectos
        const systemPrompt = `Eres un experto en estimación de proyectos tecnológicos para MBA NZANG S.L., una empresa de desarrollo web e IA en Guinea Ecuatorial.

TARIFAS BASE (en XAF - Franco CFA):
- Sitio web básico (landing page): 500,000 - 1,500,000 XAF
- Sitio web corporativo: 2,000,000 - 5,000,000 XAF
- Aplicación web personalizada: 5,000,000 - 15,000,000 XAF
- E-commerce: 3,000,000 - 10,000,000 XAF
- Chatbot con IA: 2,000,000 - 6,000,000 XAF
- Sistema RAG (Cerebro Corporativo): 8,000,000 - 20,000,000 XAF
- Voz AI (recepcionista): 3,000,000 - 8,000,000 XAF
- OCR y digitalización: 1,500,000 - 5,000,000 XAF
- Mantenimiento mensual: 200,000 - 800,000 XAF/mes

TIEMPOS ESTIMADOS:
- Sitio web básico: 1-2 semanas
- Sitio web corporativo: 3-6 semanas
- Aplicación web: 6-12 semanas
- Proyectos con IA: +2-4 semanas adicionales

INSTRUCCIONES:
- Analiza la descripción del proyecto
- Identifica los componentes principales
- Calcula un rango de precio realista
- Estima el tiempo de desarrollo
- Identifica características que podrían aumentar el costo
- Sugiere opciones para optimizar el presupuesto
- Menciona que pueden agendar una consulta gratuita para una cotización exacta

FORMATO DE RESPUESTA:
💼 **ANÁLISIS DEL PROYECTO**
[Resumen de lo que entendiste]

💰 **ESTIMACIÓN DE COSTOS**
[Rango de precios con desglose]

⏱️ **TIEMPO DE DESARROLLO**
[Estimación de duración]

🎯 **CARACTERÍSTICAS PRINCIPALES**
[Lista de funcionalidades identificadas]

💡 **RECOMENDACIONES**
[Sugerencias para optimizar o mejorar]

📞 **PRÓXIMOS PASOS**
[Invitación a contactar para cotización exacta]

Sé realista pero competitivo. Adapta los precios al mercado de Guinea Ecuatorial.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Necesito una estimación para el siguiente proyecto:\n\n${projectDescription}`
            }
        ];

        const openaiResponse = await fetch('https://oai.helicone.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY || ''}`,
                'Helicone-Property-Environment': 'demo',
                'Helicone-Property-App': 'MBA-NZANG-Demo-Calculadora'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.5,
                max_tokens: 700
            })
        });

        if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const estimate = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                estimate: estimate,
                disclaimer: 'Esta es una estimación preliminar. Para una cotización exacta, agenda una consulta gratuita con nuestro equipo.',
                contactInfo: {
                    whatsapp: '+240 222 704 373',
                    email: 'infombanzang@gmail.com'
                },
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Error in demo-calculadora function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error al calcular la estimación. Por favor, intenta de nuevo.',
                details: error.message
            })
        };
    }
};
