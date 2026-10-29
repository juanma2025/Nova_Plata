/**
 * Mock Gemini Service — simulates Nova IA for demo/testing purposes.
 */
import { logger } from '../utils/logger.js';
import type { ChatInput } from '../schemas/gemini.schemas.js';

const DEMO_RESPONSES: Record<string, string> = {
  hola: '¡Hola! 👋 Soy Nova IA, tu copiloto financiero inteligente de Nova Plata. ¿En qué puedo ayudarte hoy con tus finanzas? 💰',
  presupuesto: '📊 ¡Excelente pregunta sobre presupuestos! Te recomiendo la regla 50/30/20:\n\n• **50%** para necesidades (arriendo, servicios, mercado)\n• **30%** para deseos (entretenimiento, restaurantes)\n• **20%** para ahorro e inversión\n\n¿Quieres que te ayude a aplicar esta regla a tu situación?',
  ahorro: '💡 Aquí van algunos tips de ahorro efectivos:\n\n1. **Automatiza**: Programa transferencias automáticas el día de pago\n2. **Regla de 24h**: Antes de compras impulsivas, espera un día\n3. **Gastos hormiga**: Revisa suscripciones y cafés diarios\n4. **Meta visual**: Ten una imagen de tu meta como fondo de pantalla\n\n¿Sobre cuál quieres profundizar?',
  deuda: '🎯 Para manejar deudas, te sugiero el **método avalancha**:\n\n1. Paga el mínimo en todas las deudas\n2. Destina el extra a la deuda con mayor tasa de interés\n3. Al terminar esa, pasa al siguiente\n\nEsto minimiza el costo total de tus deudas. ¿Quieres analizar tu situación?',
  inversión: '📈 Para empezar a invertir:\n\n1. **Fondo de emergencia primero** (3-6 meses de gastos)\n2. **CDTs** para principiantes (bajo riesgo)\n3. **Fondos de inversión** cuando tengas más experiencia\n4. **Nunca inviertas dinero que necesitas a corto plazo**\n\n⚠️ Recuerda: no soy asesor de inversiones certificado. Consulta siempre con un profesional.',
};

export async function chat(input: ChatInput): Promise<string> {
  logger.info('Mock Gemini: Chat request received', {
    inputLength: input.message.length,
    historyLength: input.history.length,
  });

  // Simulate a small delay like a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const messageLower = input.message.toLowerCase();

  // Match against known topics
  for (const [keyword, response] of Object.entries(DEMO_RESPONSES)) {
    if (messageLower.includes(keyword)) {
      return response;
    }
  }

  // Default response
  return `¡Gracias por tu pregunta! 🤔\n\nComo asistente financiero de Nova Plata, puedo ayudarte con:\n\n• **Presupuestos** — Cómo organizar tus ingresos\n• **Ahorro** — Estrategias para ahorrar más\n• **Deudas** — Cómo salir de deudas eficientemente\n• **Inversión** — Primeros pasos para invertir\n\n¿Sobre cuál tema te gustaría saber más?\n\n_[Modo Demo — Conecta tu API Key de Gemini para respuestas personalizadas]_`;
}
