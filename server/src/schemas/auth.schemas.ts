import { z } from 'zod';

// ─── Common validators ─────────────────────────────
const email = z.string().email('Correo electrónico inválido').max(255).trim().toLowerCase();
const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no debe superar 128 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

// ─── Register ───────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no debe superar 100 caracteres')
      .trim(),
  }),
});

// ─── Login ──────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'La contraseña es requerida').max(128),
  }),
});

// ─── Forgot Password ────────────────────────────────
export const forgotPasswordSchema = z.object({
  body: z.object({
    email,
  }),
});

// ─── Reset Password ────────────────────────────────
export const resetPasswordSchema = z.object({
  body: z.object({
    password,
    email: email.optional(),
    token: z.string().optional(),
  }),
});

// ─── Refresh Token ──────────────────────────────────
export const refreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'El refresh token es requerido'),
  }),
});

// ─── MFA Verify ─────────────────────────────────────
export const mfaVerifySchema = z.object({
  body: z.object({
    factorId: z.string().uuid('Factor ID inválido'),
    challengeId: z.string().uuid('Challenge ID inválido'),
    code: z
      .string()
      .length(6, 'El código TOTP debe tener 6 dígitos')
      .regex(/^\d{6}$/, 'El código debe contener solo dígitos'),
  }),
});

// ─── MFA Enroll ─────────────────────────────────────
export const mfaEnrollSchema = z.object({
  body: z.object({
    friendlyName: z
      .string()
      .min(1, 'El nombre del dispositivo es requerido')
      .max(50, 'El nombre no debe superar 50 caracteres')
      .trim()
      .optional()
      .default('Autenticador'),
  }),
});

// ─── MFA Challenge ──────────────────────────────────
export const mfaChallengeSchema = z.object({
  body: z.object({
    factorId: z.string().uuid('Factor ID inválido'),
  }),
});

// ─── MFA Unenroll ───────────────────────────────────
export const mfaUnenrollSchema = z.object({
  body: z.object({
    factorId: z.string().uuid('Factor ID inválido'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>['body'];
export type MfaEnrollInput = z.infer<typeof mfaEnrollSchema>['body'];
export type MfaChallengeInput = z.infer<typeof mfaChallengeSchema>['body'];
export type MfaUnenrollInput = z.infer<typeof mfaUnenrollSchema>['body'];
