import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { sendSuccess, sendError, sendCreated } from '../utils/apiResponse.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Dynamic service import based on demo mode
async function getAuthService() {
  if (env.DEMO_MODE) {
    return import('../services/auth.mock.js');
  }
  return import('../services/auth.service.js');
}

// ─── POST /auth/register ────────────────────────────
export async function register(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/login ───────────────────────────────
export async function login(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Inicio de sesión exitoso');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
}

// ─── POST /auth/logout ──────────────────────────────
export async function logout(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    await authService.logout(authReq.accessToken);
    sendSuccess(res, null, 'Sesión cerrada exitosamente');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/forgot-password ─────────────────────
export async function forgotPassword(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    await authService.forgotPassword(req.body);
    sendSuccess(res, null, 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
  } catch {
    sendSuccess(res, null, 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
  }
}

// ─── POST /auth/reset-password ──────────────────────
export async function resetPassword(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const token = authReq.accessToken || req.body.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const email = req.body.email || authReq.user?.email;
    await authService.resetPassword({ ...req.body, email }, token);
    sendSuccess(res, null, 'Contraseña restablecida exitosamente');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/refresh ─────────────────────────────
export async function refreshToken(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const result = await authService.refreshToken(req.body);
    sendSuccess(res, result, 'Token renovado exitosamente');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
}

// ─── POST /auth/mfa/enroll ──────────────────────────
export async function mfaEnroll(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaEnroll(authReq.accessToken, req.body);
    sendSuccess(res, result, 'Factor de autenticación registrado');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/mfa/challenge ───────────────────────
export async function mfaChallenge(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaChallenge(authReq.accessToken, req.body);
    sendSuccess(res, result, 'Desafío MFA creado');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/mfa/verify ──────────────────────────
export async function mfaVerify(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaVerify(authReq.accessToken, req.body);
    sendSuccess(res, result, 'Verificación MFA exitosa');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── POST /auth/mfa/unenroll ────────────────────────
export async function mfaUnenroll(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaUnenroll(authReq.accessToken, req.body);
    sendSuccess(res, result, 'Factor de autenticación eliminado');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── GET /auth/mfa/factors ──────────────────────────
export async function mfaListFactors(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaListFactors(authReq.accessToken);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

// ─── GET /auth/mfa/assurance-level ──────────────────
export async function mfaGetAssuranceLevel(req: Request, res: Response) {
  try {
    const authService = await getAuthService();
    const authReq = req as AuthenticatedRequest;
    const result = await authService.mfaGetAssuranceLevel(authReq.accessToken);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
