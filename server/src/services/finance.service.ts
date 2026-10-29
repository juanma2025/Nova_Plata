import { createUserClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import type { 
  CreateTransactionInput, UpdateTransactionInput,
  CreateBudgetInput, UpdateBudgetInput,
  CreateGoalInput, UpdateGoalInput
} from '../schemas/finance.schemas.js';

// ─── TRANSACTIONS ───────────────────────────────────

export async function getTransactions(accessToken: string, userId: string, limit = 50, offset = 0) {
  const client = createUserClient(accessToken);
  const { data, error, count } = await client
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Finance: Get transactions failed', { userId, error: error.message });
    throw new Error('Error al obtener transacciones');
  }

  return { transactions: data || [], total: count || 0 };
}

export async function createTransaction(accessToken: string, userId: string, input: CreateTransactionInput) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('transactions')
    .insert([{ ...input, user_id: userId }])
    .select()
    .single();

  if (error) {
    logger.error('Finance: Create transaction failed', { userId, error: error.message });
    throw new Error('Error al crear transacción: ' + error.message);
  }

  return data;
}

export async function updateTransaction(accessToken: string, userId: string, id: string, input: UpdateTransactionInput) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('transactions')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Finance: Update transaction failed', { userId, id, error: error.message });
    throw new Error('Error al actualizar transacción');
  }

  return data;
}

export async function deleteTransaction(accessToken: string, userId: string, id: string) {
  const client = createUserClient(accessToken);
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    logger.error('Finance: Delete transaction failed', { userId, id, error: error.message });
    throw new Error('Error al eliminar transacción');
  }
}

// ─── BUDGETS ────────────────────────────────────────

export async function getBudgets(accessToken: string, userId: string, month: string) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Finance: Get budgets failed', { userId, error: error.message });
    throw new Error('Error al obtener presupuestos');
  }

  return data || [];
}

export async function createBudget(accessToken: string, userId: string, input: CreateBudgetInput) {
  const client = createUserClient(accessToken);
  
  const { data, error } = await client
    .from('budgets')
    .insert([{ ...input, user_id: userId }])
    .select()
    .single();

  if (error) {
    logger.error('Finance: Create budget failed', { userId, error: error.message });
    if (error.code === '23505') {
      throw new Error('Ya existe un presupuesto para esta categoría en este mes');
    }
    throw new Error('Error al crear presupuesto: ' + error.message);
  }

  return data;
}

export async function updateBudget(accessToken: string, userId: string, id: string, input: UpdateBudgetInput) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('budgets')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Finance: Update budget failed', { userId, id, error: error.message });
    throw new Error('Error al actualizar presupuesto');
  }

  return data;
}

export async function deleteBudget(accessToken: string, userId: string, id: string) {
  const client = createUserClient(accessToken);
  const { error } = await client
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    logger.error('Finance: Delete budget failed', { userId, id, error: error.message });
    throw new Error('Error al eliminar presupuesto');
  }
}

// ─── GOALS ──────────────────────────────────────────

export async function getGoals(accessToken: string, userId: string) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Finance: Get goals failed', { userId, error: error.message });
    throw new Error('Error al obtener metas');
  }

  return data || [];
}

export async function createGoal(accessToken: string, userId: string, input: CreateGoalInput) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('goals')
    .insert([{ ...input, user_id: userId }])
    .select()
    .single();

  if (error) {
    logger.error('Finance: Create goal failed', { userId, error: error.message });
    throw new Error('Error al crear meta: ' + error.message);
  }

  return data;
}

export async function updateGoal(accessToken: string, userId: string, id: string, input: UpdateGoalInput) {
  const client = createUserClient(accessToken);
  const { data, error } = await client
    .from('goals')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Finance: Update goal failed', { userId, id, error: error.message });
    throw new Error('Error al actualizar meta');
  }

  return data;
}

export async function deleteGoal(accessToken: string, userId: string, id: string) {
  const client = createUserClient(accessToken);
  const { error } = await client
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    logger.error('Finance: Delete goal failed', { userId, id, error: error.message });
    throw new Error('Error al eliminar meta');
  }
}
