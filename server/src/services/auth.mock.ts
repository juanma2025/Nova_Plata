/**
 * Mock Auth Service — simulates Supabase Auth for demo/testing purposes.
 * No real credentials or database required.
 */
import { randomUUID } from 'crypto';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
  MfaEnrollInput,
  MfaChallengeInput,
  MfaVerifyInput,
  MfaUnenrollInput,
} from '../schemas/auth.schemas.js';
import { logger } from '../utils/logger.js';

// In-memory user store for demo
const demoUsers = new Map<string, {
  id: string;
  email: string;
  password: string;
  name: string;
  email_confirmed: boolean;
  created_at: string;
  mfaFactors: Array<{ id: string; friendlyName: string; status: string }>;
}>();

// Seed a demo user
const demoUserId = '00000000-0000-0000-0000-000000000001';
const demoUserData = {
  id: demoUserId,
  email: 'demo@novaplata.com',
  password: 'Demo1234',
  name: 'Usuario Demo',
  email_confirmed: true,
  created_at: new Date().toISOString(),
  mfaFactors: [],
};
demoUsers.set('demo@novaplata.com', demoUserData);
demoUsers.set('demo@miplata.com', demoUserData); // Fallback alias


function generateToken(): string {
  return `demo_token_${randomUUID()}`;
}

export async function register(input: RegisterInput) {
  if (demoUsers.has(input.email)) {
    throw new Error('Este correo ya está registrado');
  }

  const userId = randomUUID();
  demoUsers.set(input.email, {
    id: userId,
    email: input.email,
    password: input.password,
    name: input.name,
    email_confirmed: false,
    created_at: new Date().toISOString(),
    mfaFactors: [],
  });

  logger.info('Mock Auth: User registered', { userId });

  return {
    user: {
      id: userId,
      email: input.email,
      name: input.name,
      email_confirmed: false,
    },
    session: {
      access_token: generateToken(),
      refresh_token: generateToken(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  };
}

export async function login(input: LoginInput) {
  const user = demoUsers.get(input.email);

  if (!user || user.password !== input.password) {
    throw new Error('Credenciales inválidas');
  }

  logger.info('Mock Auth: User logged in', { userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      email_confirmed: user.email_confirmed,
    },
    session: {
      access_token: generateToken(),
      refresh_token: generateToken(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  };
}

export async function logout(_accessToken: string) {
  logger.info('Mock Auth: User logged out');
}

export async function forgotPassword(input: ForgotPasswordInput) {
  logger.info('Mock Auth: Password reset requested', { email: input.email });
}

export async function resetPassword(input: ResetPasswordInput & { email?: string }, _accessToken?: string) {
  if (input.email && demoUsers.has(input.email)) {
    const user = demoUsers.get(input.email)!;
    user.password = input.password;
    demoUsers.set(input.email, user);
    logger.info('Mock Auth: Password updated for user', { email: input.email });
    return;
  }
  const defaultDemo = demoUsers.get('demo@novaplata.com');
  if (defaultDemo) defaultDemo.password = input.password;
  logger.info('Mock Auth: Password reset successful');
}

export async function refreshToken(_input: RefreshTokenInput) {
  return {
    session: {
      access_token: generateToken(),
      refresh_token: generateToken(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  };
}

export async function mfaEnroll(_accessToken: string, input: MfaEnrollInput) {
  const factorId = randomUUID();
  logger.info('Mock MFA: Factor enrolled');

  return {
    id: factorId,
    type: 'totp' as const,
    totp: {
      qr_code: 'data:image/png;base64,DEMO_QR_CODE',
      secret: 'DEMO_SECRET_BASE32',
      uri: `otpauth://totp/NovaPlata:demo@novaplata.com?secret=DEMO_SECRET_BASE32&issuer=NovaPlata`,
    },
  };
}

export async function mfaChallenge(_accessToken: string, input: MfaChallengeInput) {
  return {
    id: randomUUID(),
    factorId: input.factorId,
  };
}

export async function mfaVerify(_accessToken: string, _input: MfaVerifyInput) {
  logger.info('Mock MFA: Verification successful');
  return {
    access_token: generateToken(),
    refresh_token: generateToken(),
  };
}

export async function mfaUnenroll(_accessToken: string, _input: MfaUnenrollInput) {
  logger.info('Mock MFA: Factor unenrolled');
  return { id: _input.factorId };
}

export async function mfaListFactors(_accessToken: string) {
  return {
    totp: [],
    all: [],
  };
}

export async function mfaGetAssuranceLevel(_accessToken: string) {
  return {
    currentLevel: 'aal1',
    nextLevel: 'aal1',
    currentAuthenticationMethods: [{ method: 'password', timestamp: Date.now() }],
  };
}
