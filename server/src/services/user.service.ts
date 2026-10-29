import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import type { UpdateProfileInput } from '../schemas/user.schemas.js';
import type { User } from '@supabase/supabase-js';

// ─── Helper: Save Base64 Avatar to Disk ─────────────
function processAvatar(userId: string, avatarUrl?: string | null): string | null {
  if (!avatarUrl) return null;
  if (!avatarUrl.startsWith('data:')) return avatarUrl;

  try {
    const rawMatches = avatarUrl.split(',');
    if (rawMatches.length !== 2) return null;
    const isPng = avatarUrl.includes('image/png');
    const ext = isPng ? 'png' : 'jpg';
    const buffer = Buffer.from(rawMatches[1], 'base64');
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `${userId}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/avatars/${fileName}?t=${Date.now()}`;
  } catch (err) {
    logger.error('Failed to save avatar image to disk', { userId, error: (err as Error).message });
    return null;
  }
}

// ─── Get Profile ────────────────────────────────────
export async function getProfile(user: User, accessToken: string) {
  let profileData: any = null;

  try {
    const { createUserClient } = await import('../config/supabase.js');
    const client = createUserClient(accessToken);
    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!error && data) {
      profileData = data;
    }
  } catch {
    // profiles table may not exist
  }

  const meta = user.user_metadata || {};
  let avatarUrl = profileData?.avatar_url || meta.avatar_url || null;
  if (avatarUrl && avatarUrl.startsWith('data:')) {
    avatarUrl = processAvatar(user.id, avatarUrl);
  }

  return {
    id: user.id,
    email: user.email || meta.email || '',
    name: profileData?.full_name || meta.name || meta.full_name || 'Usuario',
    avatar_url: avatarUrl,
    phone: profileData?.phone || meta.phone || '',
    phone_prefix: profileData?.phone_prefix || meta.phone_prefix || '+57',
    document_id: profileData?.document_id || meta.document_id || '',
    occupation: profileData?.occupation || meta.occupation || '',
    currency: profileData?.currency || meta.currency || 'COP - Peso Colombiano',
    tax_regime: profileData?.tax_regime || meta.tax_regime || 'Persona Natural - No Declarante',
    anomaly_alert_threshold: profileData?.anomaly_alert_threshold ?? meta.anomaly_alert_threshold ?? 2000000,
    ai_copilot_proactive: profileData?.ai_copilot_proactive ?? meta.ai_copilot_proactive ?? true,
    ai_weekly_audit: profileData?.ai_weekly_audit ?? meta.ai_weekly_audit ?? true,
    ai_subscription_detection: profileData?.ai_subscription_detection ?? meta.ai_subscription_detection ?? true,
    ai_risk_profile: profileData?.ai_risk_profile || meta.ai_risk_profile || 'Moderado',
    sessions: meta.sessions || [],
    
    // Onboarding Data
    monthly_income: profileData?.monthly_income ?? meta.monthly_income ?? 0,
    main_income_source: profileData?.main_income_source || meta.main_income_source || meta.income_source || '',
    approximate_monthly_expenses: profileData?.approximate_monthly_expenses ?? meta.approximate_monthly_expenses ?? meta.monthly_expenses ?? 0,
    monthly_budget: profileData?.monthly_budget ?? meta.monthly_budget ?? 0,
    savings_goal: profileData?.savings_goal ?? meta.savings_goal ?? 0,
    main_expense_categories: profileData?.main_expense_categories || meta.main_expense_categories || meta.top_categories || [],
    onboarding_completed: Boolean(profileData?.onboarding_completed ?? meta.onboarding_completed ?? false),

    created_at: profileData?.created_at || user.created_at,
    updated_at: profileData?.updated_at || user.updated_at || user.created_at,
  };
}

// ─── Update Profile ─────────────────────────────────
export async function updateProfile(userId: string, input: UpdateProfileInput, accessToken: string) {
  const { data: userData, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (getUserErr) {
    logger.warn('User: Get user by ID failed in updateProfile', { userId, error: getUserErr.message });
  }

  const existingMeta = userData?.user?.user_metadata || {};
  let avatarUrl = input.avatar_url !== undefined ? input.avatar_url : existingMeta.avatar_url;
  if (avatarUrl && avatarUrl.startsWith('data:')) {
    avatarUrl = processAvatar(userId, avatarUrl);
  }

  const updatedMeta = {
    ...existingMeta,
    ...input,
    avatar_url: avatarUrl || null,
    name: input.name || input.full_name || existingMeta.name || existingMeta.full_name || 'Usuario',
  };

  const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: updatedMeta,
  });

  if (authErr) {
    logger.error('User: Profile update failed', { userId, error: authErr.message });
    throw new Error('Error al actualizar el perfil: ' + authErr.message);
  }

  // Gracefully try profiles table
  try {
    const { createUserClient } = await import('../config/supabase.js');
    const client = createUserClient(accessToken);
    await client
      .from('profiles')
      .upsert({
        id: userId,
        full_name: updatedMeta.name,
        ...input,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      });
  } catch {
    // ignore if table doesn't exist
  }

  logger.info('User: Profile updated successfully', { userId });
  return updatedMeta;
}

// ─── Save Onboarding ────────────────────────────────
export async function saveOnboarding(userId: string, input: any, accessToken: string) {
  // 1. Always update user_metadata in Supabase Auth (always available and persistent)
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const existingMeta = userData?.user?.user_metadata || {};

  const updatedMeta = {
    ...existingMeta,
    ...input,
    income_source: input.main_income_source || existingMeta.income_source,
    monthly_expenses: input.approximate_monthly_expenses ?? existingMeta.monthly_expenses,
    top_categories: input.main_expense_categories || existingMeta.top_categories,
    onboarding_completed: true,
  };

  const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: updatedMeta,
  });

  if (authErr) {
    logger.warn('User: Auth metadata update warning', { userId, error: authErr.message });
  }

  // 2. Also try updating or upserting into public.profiles if the table exists
  try {
    const { createUserClient } = await import('../config/supabase.js');
    const client = createUserClient(accessToken);
    await client
      .from('profiles')
      .upsert({
        id: userId,
        email: userData?.user?.email,
        full_name: updatedMeta.name,
        monthly_income: input.monthly_income,
        main_income_source: input.main_income_source,
        approximate_monthly_expenses: input.approximate_monthly_expenses,
        monthly_budget: input.monthly_budget,
        savings_goal: input.savings_goal,
        main_expense_categories: input.main_expense_categories,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });
  } catch {
    // profiles table might not exist in Supabase yet; user_metadata is safely stored
  }

  logger.info('User: Onboarding completed successfully', { userId });
  return {
    ...input,
    onboarding_completed: true,
  };
}

// ─── Delete Account ─────────────────────────────────
export async function deleteAccount(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    logger.error('User: Account deletion failed', { userId, error: error.message });
    throw new Error('Error al eliminar la cuenta');
  }

  logger.info('User: Account deleted', { userId });
}
