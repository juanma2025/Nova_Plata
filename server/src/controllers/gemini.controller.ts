import type { Request, Response } from 'express';
import { isGeminiConfigured } from '../config/gemini.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

async function getGeminiService() {
  if (isGeminiConfigured()) {
    return import('../services/gemini.service.js');
  }
  return import('../services/gemini.mock.js');
}

// ─── POST /chat ─────────────────────────────────────
export async function chat(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const geminiService = await getGeminiService();
    try {
      const reply = await geminiService.chat(req.body, authReq.user, authReq.accessToken);
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

