import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

export const CHAT_MODEL = 'gemini-2.5-flash';
export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIMENSIONS = 768;

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
}

export function isGeminiConfigured(): boolean {
  const apiKey = getApiKey();
  return Boolean(
    apiKey &&
      apiKey !== 'demo-gemini-key' &&
      apiKey !== 'your-gemini-api-key-here' &&
      !apiKey.includes('your-gemini'),
  );
}

let client: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
}

