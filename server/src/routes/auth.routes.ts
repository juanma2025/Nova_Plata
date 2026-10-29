import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  mfaEnrollSchema,
  mfaChallengeSchema,
  mfaVerifySchema,
  mfaUnenrollSchema,
} from '../schemas/auth.schemas.js';

const router = Router();

// ─── Public Auth Routes (rate-limited) ──────────────
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', optionalAuth, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refreshToken);

// ─── Protected Auth Routes ──────────────────────────
router.post('/logout', requireAuth, authController.logout);

// ─── MFA Routes (all protected) ─────────────────────
router.post('/mfa/enroll', requireAuth, validate(mfaEnrollSchema), authController.mfaEnroll);
router.post('/mfa/challenge', requireAuth, validate(mfaChallengeSchema), authController.mfaChallenge);
router.post('/mfa/verify', requireAuth, validate(mfaVerifySchema), authController.mfaVerify);
router.post('/mfa/unenroll', requireAuth, validate(mfaUnenrollSchema), authController.mfaUnenroll);
router.get('/mfa/factors', requireAuth, authController.mfaListFactors);
router.get('/mfa/assurance-level', requireAuth, authController.mfaGetAssuranceLevel);

export default router;
