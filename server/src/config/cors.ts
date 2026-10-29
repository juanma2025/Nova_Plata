import type { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permite llamadas sin origin (serverless interno, curl, apps móviles)
    if (!origin) return callback(null, true);

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Bloqueado por CORS: origen no permitido (${origin})`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours preflight cache
};
