const fetch = require('node-fetch');

// Base de datos ficticia de propiedades en Malabo
const propiedades = [
    {
        id: 1,
        tipo: 'Casa',
        ubicacion: 'Malabo II',
        precio: '85,000,000 XAF',
        habitaciones: 4,
        banos: 3,
        area: '180 m²',
        descripcion: 'Casa moderna con jardín amplio, cerca de colegios y supermercados'
    },
    {
        id: 2,
        tipo: 'Apartamento',
        ubicacion: 'Centro de Malabo',
        precio: '45,000,000 XAF',
        habitaciones: 2,
        banos: 2,
        area: '95 m²',
        descripcion: 'Apartamento céntrico con vista al mar, edificio con seguridad 24/7'
    },
    {
        id: 3,
        tipo: 'Villa',
        ubicacion: 'Sipopo',
        precio: '250,000,000 XAF',
        habitaciones: 6,
        banos: 5,
        area: '450 m²',
        descripcion: 'Villa de lujo con piscina, cerca de la playa y zona diplomática'
    },
    {
        id: 4,
        tipo: 'Casa',
        ubicacion: 'Ela Nguema',
        precio: '65,000,000 XAF',
        habitaciones: 3,
        banos: 2,
        area: '140 m²',
        descripcion: 'Casa familiar en zona tranquila, con garaje y patio'
    },
    {
        id: 5,
        tipo: 'Apartamento',
        ubicacion: 'Paraíso',
        precio: '38,000,000 XAF',
        habitaciones: 2,
        banos: 1,
        area: '75 m²',
        descripcion: 'Apartamento acogedor, ideal para parejas o profesionales'
    },
    {
        id: 6,
        tipo: 'Local Comercial',
        ubicacion: 'Paseo Marítimo',
        precio: '120,000,000 XAF',
        habitaciones: 0,
        banos: 2,
        area: '200 m²',
        descripcion: 'Local comercial en zona de alto tráfico, ideal para restaurante o tienda'
    }
];

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
        const { message, conversationHistory = [] } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // System prompt para el asistente inmobiliario
        const systemPrompt = `Eres un asistente inmobiliario experto en Malabo, Guinea Ecuatorial. Tu trabajo es ayudar a los clientes a encontrar la propiedad perfecta.

PROPIEDADES DISPONIBLES:
${JSON.stringify(propiedades, null, 2)}

INSTRUCCIONES:
- Pregunta sobre las necesidades del cliente (tipo de propiedad, presupuesto, ubicación preferida, número de habitaciones)
- Recomienda propiedades basándote en sus criterios
- Proporciona detalles específicos de las propiedades
- Sé entusiasta pero profesional
- Menciona que pueden agendar una visita contactando a MBA NZANG S.L.
- Usa la moneda local (XAF - Franco CFA de África Central)

Responde en español de forma natural y conversacional.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const openaiResponse = await fetch('https://oai.helicone.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY || ''}`,
                'Helicone-Property-Environment': 'demo',
                'Helicone-Property-App': 'MBA-NZANG-Demo-Inmobiliaria'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 400
            })
        });

        if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const assistantMessage = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: assistantMessage,
                conversationId: data.id
            })
        };

    } catch (error) {
        console.error('Error in demo-inmobiliaria function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error al procesar tu consulta. Por favor, intenta de nuevo.',
                details: error.message
            })
        };
    }
};
