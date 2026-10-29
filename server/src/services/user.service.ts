import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import type { UpdateProfileInput } from '../schemas/user.schemas.js';
import type { User } from '@supabase/supabase-js';

// ─── Get Profile ────────────────────────────────────
export async function getProfile(user: User, accessToken: string) {
  const { createUserClient } = await import('../config/supabase.js');
  const client = createUserClient(accessToken);
  const { data, error } = await client.from('profiles').select('*').eq('id', user.id).single();

  if (error && error.code !== 'PGRST116') {
    logger.error('User: Fetch profile failed', { error: error.message });
  }

  return {
    id: user.id,
    email: user.email ?? '',
    name: data?.full_name || user.user_metadata?.name || '',
    avatar_url: user.user_metadata?.avatar_url ?? null,
    
    // Onboarding Data
    monthly_income: data?.monthly_income || 0,
    main_income_source: data?.main_income_source || '',
    approximate_monthly_expenses: data?.approximate_monthly_expenses || 0,
    monthly_budget: data?.monthly_budget || 0,
    savings_goal: data?.savings_goal || 0,
    main_expense_categories: data?.main_expense_categories || [],
    onboarding_completed: data?.onboarding_completed || false,

    created_at: data?.created_at || user.created_at,
    updated_at: (data?.updated_at || user.updated_at) ?? user.created_at,
  };
}

// ─── Update Profile ─────────────────────────────────
export async function updateProfile(userId: string, input: UpdateProfileInput, accessToken: string) {
  const { createUserClient } = await import('../config/supabase.js');
  const client = createUserClient(accessToken);
  
  const { data, error } = await client
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    logger.error('User: Profile update failed', { userId, error: error.message });
    throw new Error('Error al actualizar el perfil');
  }

  logger.info('User: Profile updated', { userId });
  return data;
}

// ─── Save Onboarding ────────────────────────────────
export async function saveOnboarding(userId: string, input: any, accessToken: string) {
  const { createUserClient } = await import('../config/supabase.js');
  const client = createUserClient(accessToken);

  const { data, error } = await client
    .from('profiles')
    .update({ ...input, onboarding_completed: true })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    logger.error('User: Onboarding update failed', { userId, error: error.message });
    throw new Error('Error al guardar onboarding');
  }

  logger.info('User: Onboarding completed', { userId });
  return data;
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
