import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

dotenv.config();

async function getGeminiService() {
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const isRealKey = apiKey && 
    apiKey !== 'demo-gemini-key' && 
    apiKey !== 'your-gemini-api-key-here' &&
    !apiKey.includes('your-gemini');

  if (isRealKey) {
    return import('../services/gemini.service.js');
  }
  return import('../services/gemini.mock.js');
}

// ─── POST /chat ─────────────────────────────────────
export async function chat(req: Request, res: Response) {
  try {
    const geminiService = await getGeminiService();
    try {
      const reply = await geminiService.chat(req.body);
      sendSuccess(res, { reply }, 'Respuesta generada');
    } catch (apiErr) {
      console.warn('Real Gemini API call failed, using fallback:', apiErr);
      const mockService = await import('../services/gemini.mock.js');
      const reply = await mockService.chat(req.body);
      sendSuccess(res, { reply }, 'Respuesta generada');
    }
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

