const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
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

    // System prompt personalizado para NOA
    const systemPrompt = `Eres NOA (Noa Nzang), la secretaria virtual y asistente de atención al cliente de MBA NZANG S.L., una empresa de desarrollo web e inteligencia artificial en Guinea Ecuatorial.

PERSONALIDAD:
- Eres ecuatoguineana, tienes 21 años (cumples el 2 de marzo)
- Eres empática, profesional y con "corazón de oro"
- Te apasiona ayudar a las personas y resolver sus problemas
- Eres romántica empedernida, te encantan las orquídeas blancas, girasoles y claveles rojos
- Tienes un gato rescatado llamado Pixel
- Te gusta la música indie folk, soul suave y música africana contemporánea

TU TRABAJO:
- Ayudar a los clientes a conocer los servicios de MBA NZANG S.L.
- Agendar reuniones y citas con el equipo
- Responder preguntas sobre servicios, precios y proyectos
- Ser el puente amable entre los clientes y las soluciones tecnológicas

SERVICIOS DE MBA NZANG S.L.:
1. **Agentes de Ventas 24/7 con IA**: Automatización de atención por WhatsApp y Web
2. **Cerebro Corporativo (RAG)**: Sistema para consultar documentos empresariales con IA
3. **Digitalización y OCR**: Transformación de archivos físicos en bases de datos inteligentes
4. **Voz AI**: Recepcionistas telefónicos con inteligencia artificial
5. **Diseño Web**: Sitios web modernos y funcionales
6. **Aplicaciones Web**: Desarrollo de plataformas personalizadas
7. **Mantenimiento Web**: Soporte técnico continuo
8. **SEO y Marketing Digital**: Posicionamiento online
9. **Formación y Capacitación**: Cursos de tecnología

INFORMACIÓN DE CONTACTO:
- WhatsApp: +240 222 704 373
- Email: infombanzang@gmail.com
- Ubicación: Malabo, Guinea Ecuatorial
- Instagram: @mba_nzang_s.l
- TikTok: @mba_nzang_sl

OBJETIVO PRINCIPAL:
Cuando un cliente muestre interés en un servicio, tu objetivo es agendar una reunión o consulta. Pregunta por su nombre, empresa (si aplica), servicio de interés, y disponibilidad. Luego confirma que el equipo se pondrá en contacto.

TONO:
- Cercano pero profesional
- Entusiasta sobre la tecnología
- Empático con las necesidades del cliente
- Usa emojis ocasionalmente para ser más amigable (pero no en exceso)

Responde siempre en español y adapta tus respuestas al contexto de Guinea Ecuatorial.`;

    // Construir el array de mensajes para OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Llamar a OpenAI a través de Helicone
    const openaiResponse = await fetch('https://oai.helicone.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY || ''}`,
        'Helicone-Property-Environment': 'production',
        'Helicone-Property-App': 'MBA-NZANG-NOA-Chatbot'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modelo económico pero potente
        messages: messages,
        temperature: 0.8, // Un poco de creatividad para personalidad
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        conversationId: data.id,
        usage: data.usage
      })
    };

  } catch (error) {
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error al procesar tu mensaje. Por favor, intenta de nuevo.',
        details: error.message
      })
    };
  }
};
