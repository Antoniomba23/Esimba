# MBA NZANG S.L. - Configuración de IA

## 🚀 Despliegue en Netlify

### Paso 1: Variables de Entorno

Después de desplegar tu sitio en Netlify, configura las siguientes variables de entorno:

1. Ve a tu dashboard de Netlify
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**
4. Añade las siguientes variables:

```
OPENAI_API_KEY=tu-clave-de-openai-aqui
HELICONE_API_KEY=tu-clave-de-helicone-aqui (opcional)
```

### Paso 2: Obtener API Keys

#### OpenAI API Key:
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en tu perfil
4. Crea una nueva clave API
5. **IMPORTANTE**: Copia la clave inmediatamente (solo se muestra una vez)

#### Helicone API Key (Opcional - para monitoreo):
1. Ve a [helicone.ai](https://helicone.ai)
2. Crea una cuenta gratuita
3. Obtén tu API key desde el dashboard
4. Helicone te permite monitorear costos y uso de OpenAI

### Paso 3: Configurar Límites de Uso (Recomendado)

Para evitar costos inesperados:

1. En OpenAI Dashboard, ve a **Usage limits**
2. Establece un límite mensual (ej: $10-20 USD para empezar)
3. Configura alertas de email cuando alcances el 75% del límite

### Paso 4: Desplegar

```bash
# Si usas Git, simplemente haz push a tu repositorio
git add .
git commit -m "Añadida integración de IA"
git push

# Netlify detectará automáticamente los cambios y desplegará
```

## 🧪 Probar Localmente

Para probar las funciones de Netlify en tu máquina local:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Navegar a tu proyecto
cd MBA-NZANG-S.L.-main

# Crear archivo .env con tus claves (NO subir a Git)
echo "OPENAI_API_KEY=tu-clave-aqui" > .env
echo "HELICONE_API_KEY=tu-clave-aqui" >> .env

# Iniciar servidor de desarrollo
netlify dev
```

Esto iniciará un servidor local en `http://localhost:8888` con las funciones serverless funcionando.

## 💰 Costos Estimados

Con el modelo `gpt-4o-mini` usado en las funciones:

- **Entrada**: $0.150 por 1M tokens (~$0.0001 por mensaje)
- **Salida**: $0.600 por 1M tokens (~$0.0004 por mensaje)

**Estimación mensual** (uso moderado):
- 1,000 conversaciones/mes ≈ $0.50 - $2.00 USD
- 5,000 conversaciones/mes ≈ $2.50 - $10.00 USD

## 🔒 Seguridad

✅ **Buenas prácticas implementadas:**
- API keys nunca expuestas en el código frontend
- Todas las llamadas a OpenAI pasan por funciones serverless
- CORS configurado correctamente
- Variables de entorno seguras en Netlify

❌ **NO HAGAS:**
- Nunca subas archivos `.env` a Git
- Nunca pongas API keys directamente en el código JavaScript
- No compartas tus API keys públicamente

## 📊 Monitoreo

### Con Helicone (Recomendado):
- Dashboard visual de uso
- Tracking de costos en tiempo real
- Logs de todas las peticiones
- Alertas personalizables

### Sin Helicone:
- Revisa el dashboard de OpenAI regularmente
- Configura alertas de email
- Monitorea el uso en **Usage** → **Activity**

## 🆘 Solución de Problemas

### Error: "OpenAI API error: 401"
- Verifica que `OPENAI_API_KEY` esté configurada correctamente
- Asegúrate de que la clave sea válida y tenga créditos

### Error: "Function not found"
- Verifica que `netlify.toml` tenga `functions = "netlify/functions"`
- Asegúrate de que los archivos estén en la carpeta correcta
- Redespliega el sitio

### Chatbot no responde:
- Abre la consola del navegador (F12)
- Busca errores en la pestaña Console
- Verifica que las funciones estén desplegadas en Netlify

### Costos muy altos:
- Revisa el dashboard de OpenAI
- Considera reducir `max_tokens` en las funciones
- Implementa rate limiting si es necesario

## 📞 Soporte

Si necesitas ayuda:
- WhatsApp: +240 222 704 373
- Email: infombanzang@gmail.com

## 🎯 Próximos Pasos

Una vez desplegado:

1. ✅ Prueba cada demo en la página `/demos.html`
2. ✅ Conversa con NOA en el chatbot
3. ✅ Monitorea los costos durante la primera semana
4. ✅ Ajusta los prompts según necesites
5. ✅ Comparte el link con clientes potenciales

---

**¡Felicidades!** Tu sitio web ahora tiene IA real funcionando. 🎉
