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
        const { contractText } = JSON.parse(event.body);

        if (!contractText || contractText.trim().length < 50) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Por favor, proporciona un texto de contrato válido (mínimo 50 caracteres)'
                })
            };
        }

        // System prompt para análisis legal
        const systemPrompt = `Eres un asistente legal experto en análisis de contratos. Tu trabajo es revisar textos de contratos y identificar posibles riesgos, cláusulas problemáticas o puntos que requieren atención.

INSTRUCCIONES:
- Analiza el contrato proporcionado
- Identifica riesgos potenciales (cláusulas abusivas, términos poco claros, obligaciones desbalanceadas)
- Destaca puntos positivos si los hay
- Proporciona recomendaciones específicas
- Usa un formato estructurado con secciones claras
- Sé profesional pero accesible
- Indica que esto es un análisis preliminar y se recomienda consultar con un abogado

FORMATO DE RESPUESTA:
📋 **RESUMEN GENERAL**
[Breve resumen del tipo de contrato y propósito]

⚠️ **RIESGOS IDENTIFICADOS**
[Lista de riesgos potenciales]

✅ **PUNTOS POSITIVOS**
[Aspectos favorables del contrato]

💡 **RECOMENDACIONES**
[Sugerencias específicas]

⚖️ **CONCLUSIÓN**
[Evaluación general y próximos pasos]

Responde en español y adapta el análisis al contexto de Guinea Ecuatorial cuando sea relevante.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Por favor, analiza el siguiente contrato y proporciona un análisis detallado:\n\n${contractText}`
            }
        ];

        const openaiResponse = await fetch('https://oai.helicone.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY || ''}`,
                'Helicone-Property-Environment': 'demo',
                'Helicone-Property-App': 'MBA-NZANG-Demo-Legal'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.3, // Más conservador para análisis legal
                max_tokens: 800
            })
        });

        if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const analysis = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                analysis: analysis,
                disclaimer: 'Este es un análisis preliminar generado por IA. Para decisiones legales importantes, consulte con un abogado profesional.',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Error in demo-legal function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error al analizar el contrato. Por favor, intenta de nuevo.',
                details: error.message
            })
        };
    }
};
