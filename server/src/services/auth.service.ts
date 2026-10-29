import { supabasePublic, supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
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
import { env } from '../config/env.js';
import { createClient } from '@supabase/supabase-js';

// ─── Registration ───────────────────────────────────
export async function register(input: RegisterInput) {
  const { data, error } = await supabasePublic.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
      },
    },
  });

  if (error) {
    logger.warn('Auth: Registration failed', { email: input.email, error: error.message });
    throw new Error(mapAuthError(error.message));
  }

  logger.info('Auth: User registered', { userId: data.user?.id });

  return {
    user: data.user ? {
      id: data.user.id,
      email: data.user.email,
      name: input.name,
      email_confirmed: !!data.user.email_confirmed_at,
    } : null,
    session: data.session ? {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    } : null,
  };
}

// ─── Login ──────────────────────────────────────────
export async function login(input: LoginInput) {
  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    logger.warn('Auth: Login failed', { email: input.email, error: error.message });
    throw new Error(mapAuthError(error.message));
  }

  logger.info('Auth: User logged in', { userId: data.user.id });

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name ?? '',
      email_confirmed: !!data.user.email_confirmed_at,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  };
}

// ─── Logout ─────────────────────────────────────────
export async function logout(accessToken: string) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { error } = await userClient.auth.signOut();

  if (error) {
    logger.warn('Auth: Logout failed', { error: error.message });
    throw new Error('Error al cerrar sesión');
  }

  logger.info('Auth: User logged out');
}

// ─── Forgot Password ────────────────────────────────
export async function forgotPassword(input: ForgotPasswordInput) {
  const { error } = await supabasePublic.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${env.CORS_ORIGIN}/reset-password`,
  });

  if (error) {
    logger.warn('Auth: Password reset request failed', { error: error.message });
    // Don't reveal whether the email exists
  }

  // Always return success to prevent email enumeration
  logger.info('Auth: Password reset requested');
}

// ─── Reset Password ────────────────────────────────
export async function resetPassword(input: ResetPasswordInput & { email?: string }, accessToken?: string) {
  if (accessToken && accessToken !== 'demo-token') {
    const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { error } = await userClient.auth.updateUser({
      password: input.password,
    });

    if (!error) {
      logger.info('Auth: Password reset successful via token');
      return;
    }
  }

  // Admin fallback via email lookup
  if (input.email) {
    const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (!listErr && data.users) {
      const targetUser = data.users.find(u => u.email?.toLowerCase() === input.email?.toLowerCase());
      if (targetUser) {
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
          password: input.password,
        });
        if (updateErr) {
          throw new Error('Error al actualizar contraseña: ' + updateErr.message);
        }
        logger.info('Auth: Password reset successful via admin for', { email: input.email });
        return;
      }
    }
  }

  throw new Error('No se pudo verificar el token o usuario para restablecer la contraseña');
}

// ─── Refresh Token ──────────────────────────────────
export async function refreshToken(input: RefreshTokenInput) {
  const { data, error } = await supabasePublic.auth.refreshSession({
    refresh_token: input.refresh_token,
  });

  if (error || !data.session) {
    logger.warn('Auth: Token refresh failed', { error: error?.message });
    throw new Error('No se pudo renovar la sesión');
  }

  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  };
}

// ─── MFA: Enroll ────────────────────────────────────
export async function mfaEnroll(accessToken: string, input: MfaEnrollInput) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: input.friendlyName,
  });

  if (error) {
    logger.warn('MFA: Enrollment failed', { error: error.message });
    throw new Error('Error al registrar el segundo factor');
  }

  logger.info('MFA: Factor enrolled');

  return {
    id: data.id,
    type: data.type,
    totp: {
      qr_code: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    },
  };
}

// ─── MFA: Challenge ─────────────────────────────────
export async function mfaChallenge(accessToken: string, input: MfaChallengeInput) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.challenge({
    factorId: input.factorId,
  });

  if (error) {
    logger.warn('MFA: Challenge creation failed', { error: error.message });
    throw new Error('Error al crear el desafío MFA');
  }

  return {
    id: data.id,
    factorId: input.factorId,
  };
}

// ─── MFA: Verify ────────────────────────────────────
export async function mfaVerify(accessToken: string, input: MfaVerifyInput) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.verify({
    factorId: input.factorId,
    challengeId: input.challengeId,
    code: input.code,
  });

  if (error) {
    logger.warn('MFA: Verification failed', { error: error.message });
    throw new Error('Código de verificación inválido');
  }

  logger.info('MFA: Verification successful');

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

// ─── MFA: Unenroll ──────────────────────────────────
export async function mfaUnenroll(accessToken: string, input: MfaUnenrollInput) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.unenroll({
    factorId: input.factorId,
  });

  if (error) {
    logger.warn('MFA: Unenrollment failed', { error: error.message });
    throw new Error('Error al desactivar el segundo factor');
  }

  logger.info('MFA: Factor unenrolled');

  return data;
}

// ─── MFA: List Factors ──────────────────────────────
export async function mfaListFactors(accessToken: string) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.listFactors();

  if (error) {
    logger.warn('MFA: List factors failed', { error: error.message });
    throw new Error('Error al obtener los factores MFA');
  }

  return {
    totp: data.totp,
    all: data.all,
  };
}

// ─── MFA: Get Assurance Level ───────────────────────
export async function mfaGetAssuranceLevel(accessToken: string) {
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data, error } = await userClient.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    logger.warn('MFA: Get assurance level failed', { error: error.message });
    throw new Error('Error al obtener el nivel de seguridad');
  }

  return data;
}

// ─── Error Mapping ──────────────────────────────────
function mapAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Credenciales inválidas',
    'Email not confirmed': 'Debes confirmar tu correo electrónico',
    'User already registered': 'Este correo ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
    'Signup requires a valid password': 'La contraseña no es válida',
    'Email rate limit exceeded': 'Demasiados intentos. Intenta más tarde',
    'For security purposes, you can only request this after': 'Demasiadas solicitudes. Espera un momento',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) return value;
  }

  return 'Error de autenticación. Intenta de nuevo';
}
