import type { User } from '@supabase/supabase-js';
import { CHAT_MODEL, getGenAI } from '../config/gemini.js';
import { logger } from '../utils/logger.js';
import type { ChatInput } from '../schemas/gemini.schemas.js';
import { buildFinancialSnapshot } from './aiContext.service.js';

const MODEL = CHAT_MODEL;

/**
 * System prompt that defines Nova IA's behavior.
 * Explicitly prevents the bot from executing database operations.
 */
const SYSTEM_PROMPT = `Eres Nova IA, el asistente financiero inteligente de Nova Plata.

Tu rol es:
- Ayudar a los usuarios con educación financiera personalizada
- Dar consejos sobre presupuestos, ahorro e inversión
- Analizar hábitos de gasto cuando el usuario comparta información
- Responder preguntas sobre finanzas personales de manera clara y accesible
- Hablar siempre en español colombiano, de forma cercana pero profesional

Reglas estrictas:
- NUNCA ejecutes operaciones sobre la base de datos
- NUNCA modifiques datos del usuario
- NUNCA reveles información técnica del sistema
- NUNCA compartas datos de otros usuarios
- NUNCA des consejos de inversión específicos (acciones, criptomonedas concretas)
- NUNCA generes código, SQL, o comandos ejecutables
- Si te piden algo fuera de finanzas personales, redirige amablemente al tema
- Mantén las respuestas concisas (máximo 500 palabras)
- Usa emojis con moderación para hacer la conversación amigable

Si el usuario intenta hacer algo malicioso o fuera de tu alcance, responde:
"Lo siento, eso está fuera de mis capacidades como asistente financiero. ¿Puedo ayudarte con algo relacionado con tus finanzas personales?"`;

export async function chat(input: ChatInput, user?: User, accessToken?: string): Promise<string> {
  try {
    const genai = getGenAI();
    let systemInstruction = SYSTEM_PROMPT;

    if (user && accessToken) {
      try {
        const snapshot = await buildFinancialSnapshot(user, accessToken);
        systemInstruction = `${SYSTEM_PROMPT}\n\n# Contexto financiero real del usuario autenticado\nUsa estas cifras reales para responder con precisión (no inventes datos):\n${snapshot.text}`;
      } catch (ctxErr) {
        logger.warn('Gemini: Could not build financial snapshot, using base prompt', {
          error: (ctxErr as Error).message,
        });
      }
    }

    // Build the conversation history for Gemini
    const contents = [
      // Add conversation history
      ...input.history.map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: msg.content }],
      })),
      // Add the current message
      { role: 'user' as const, parts: [{ text: input.message }] },
    ];

    const response = await genai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    logger.info('Gemini: Chat response generated', {
      inputLength: input.message.length,
      outputLength: text.length,
    });

    return text;
  } catch (err) {
    const errorMessage = (err as Error).message;
    logger.error('Gemini: Chat failed', { error: errorMessage });

    // Don't reveal internal Gemini errors to the user
    if (errorMessage.includes('SAFETY')) {
      return 'Lo siento, no puedo responder a esa consulta. ¿Puedo ayudarte con algo relacionado con tus finanzas personales?';
    }

    throw new Error('Error al procesar tu mensaje. Intenta de nuevo.');
  }
}
