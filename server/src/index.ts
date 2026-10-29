import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

const app = express();

// ─── Security Headers ───────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ───────────────────────────────────────────
app.use(cors(corsOptions));

// ─── Body Parsing ───────────────────────────────────
app.use(express.json({ limit: '10kb' }));  // Prevent large payload attacks
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── General Rate Limiting ──────────────────────────
app.use(generalLimiter);

// ─── Trust Proxy (for rate limiting behind reverse proxy) ──
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── API Routes ─────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ───────────────────────────
app.use(errorHandler);

// ─── Start Server (Only for local dev or traditional hosting) ───
if (process.env.NODE_ENV !== 'production' || process.env.IS_LOCAL) {
  app.listen(env.PORT, () => {
    logger.info(`🚀 Nova Plata Server running`, {
      port: env.PORT,
      environment: env.NODE_ENV,
      cors: env.CORS_ORIGIN,
    });
    logger.info('📡 API available at: /api/v1');
  });
}

export default app;
