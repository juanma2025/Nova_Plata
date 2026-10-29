/**
 * Mock User Service — simulates user operations for demo/testing.
 */
import { logger } from '../utils/logger.js';
import type { UpdateProfileInput } from '../schemas/user.schemas.js';

// In-memory profile store
const profiles = new Map<string, {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}>();

export async function getProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }, accessToken?: string) {
  const existing = profiles.get(user.id);
  if (existing) return existing;

  const profile = {
    id: user.id,
    email: user.email ?? 'demo@novaplata.com',
    name: (user.user_metadata?.name as string) ?? 'Usuario Demo',
    avatar_url: null,
    monthly_income: 0,
    main_income_source: '',
    approximate_monthly_expenses: 0,
    monthly_budget: 0,
    savings_goal: 0,
    main_expense_categories: [],
    onboarding_completed: false,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  profiles.set(user.id, profile);
  return profile;
}

export async function updateProfile(userId: string, input: any, accessToken?: string) {
  const profile = await getProfile({ id: userId });

  if (input.full_name !== undefined) profile.name = input.full_name;
  if (input.name !== undefined) profile.name = input.name;
  Object.assign(profile, input, { updated_at: new Date().toISOString() });

  profiles.set(userId, profile);
  logger.info('Mock User: Profile updated', { userId });

  return profile;
}

export async function saveOnboarding(userId: string, input: any, accessToken?: string) {
  const profile = await getProfile({ id: userId });
  Object.assign(profile, input, { onboarding_completed: true, updated_at: new Date().toISOString() });
  profiles.set(userId, profile);
  logger.info('Mock User: Onboarding saved', { userId });
  return profile;
}

export async function deleteAccount(userId: string) {
  profiles.delete(userId);
  logger.info('Mock User: Account deleted', { userId });
}
