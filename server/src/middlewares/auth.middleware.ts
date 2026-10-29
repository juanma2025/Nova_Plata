import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Middleware that verifies the JWT from the Authorization header.
 * In demo mode, accepts any Bearer token and creates a mock user.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Token de autenticación requerido', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 'Token de autenticación inválido', 401);
      return;
    }

    if (env.DEMO_MODE) {
      // In demo mode, accept any token and create a mock user
      (req as AuthenticatedRequest).user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@novaplata.com',
        user_metadata: { name: 'Usuario Demo' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any;
      (req as AuthenticatedRequest).accessToken = token;
      next();
      return;
    }

    // Production: Verify the JWT using Supabase Admin
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('Auth: Token verification failed', { error: error?.message });
      sendError(res, 'Token inválido o expirado', 401);
      return;
    }

    (req as AuthenticatedRequest).user = data.user;
    (req as AuthenticatedRequest).accessToken = token;

    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: (err as Error).message });
    sendError(res, 'Error de autenticación', 500);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        (req as AuthenticatedRequest).accessToken = token;
        const { supabaseAdmin } = await import('../config/supabase.js');
        const { data } = await supabaseAdmin.auth.getUser(token);
        if (data?.user) {
          (req as AuthenticatedRequest).user = data.user;
        }
      }
    }
    next();
  } catch {
    next();
  }
}

/**
 * Middleware that checks if the user has completed MFA verification.
 * In demo mode, always passes.
 */
export async function requireMfa(req: Request, res: Response, next: NextFunction) {
  if (env.DEMO_MODE) {
    next();
    return;
  }

  try {
    const authReq = req as AuthenticatedRequest;
    const token = authReq.accessToken;

    const { createClient } = await import('@supabase/supabase-js');
    const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await userClient.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
      logger.warn('MFA: Failed to get AAL', { error: error.message });
      sendError(res, 'Error al verificar MFA', 500);
      return;
    }

    if (data.nextLevel === 'aal2' && data.currentLevel !== 'aal2') {
      sendError(res, 'Se requiere verificación de segundo factor (MFA)', 403);
      return;
    }

    next();
  } catch (err) {
    logger.error('MFA middleware error', { error: (err as Error).message });
    sendError(res, 'Error al verificar MFA', 500);
  }
}
