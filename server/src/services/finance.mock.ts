import { randomUUID } from 'crypto';
import type { 
  CreateTransactionInput, UpdateTransactionInput,
  CreateBudgetInput, UpdateBudgetInput,
  CreateGoalInput, UpdateGoalInput
} from '../schemas/finance.schemas.js';

// In-memory data stores for demo mode (starts clean for user to populate)
const transactions: any[] = [];
const budgets: any[] = [];
const goals: any[] = [];

// ─── TRANSACTIONS ───────────────────────────────────

export async function getTransactions(_accessToken: string, userId: string, limit = 50, offset = 0) {
  const userTxs = transactions.filter(t => t.user_id === userId);
  const data = [...userTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { transactions: data.slice(offset, offset + limit), total: data.length };
}

export async function createTransaction(_accessToken: string, userId: string, input: CreateTransactionInput) {
  const tx = { id: randomUUID(), user_id: userId, ...input, created_at: new Date().toISOString() };
  transactions.push(tx);
  return tx;
}

export async function updateTransaction(_accessToken: string, userId: string, id: string, input: UpdateTransactionInput) {
  const idx = transactions.findIndex(t => t.id === id && t.user_id === userId);
  if (idx === -1) throw new Error('Transacción no encontrada');
  transactions[idx] = { ...transactions[idx], ...input, updated_at: new Date().toISOString() };
  return transactions[idx];
}

export async function deleteTransaction(_accessToken: string, userId: string, id: string) {
  const idx = transactions.findIndex(t => t.id === id && t.user_id === userId);
  if (idx !== -1) transactions.splice(idx, 1);
}

// ─── BUDGETS ────────────────────────────────────────

export async function getBudgets(_accessToken: string, userId: string, month: string) {
  return budgets.filter(b => b.month === month && b.user_id === userId);
}

export async function createBudget(_accessToken: string, userId: string, input: CreateBudgetInput) {
  if (budgets.some(b => b.category === input.category && b.month === input.month && b.user_id === userId)) {
    throw new Error('Ya existe un presupuesto para esta categoría en este mes');
  }
  const budget = { id: randomUUID(), user_id: userId, spent_amount: 0, ...input, created_at: new Date().toISOString() };
  budgets.push(budget);
  return budget;
}

export async function updateBudget(_accessToken: string, userId: string, id: string, input: UpdateBudgetInput) {
  const idx = budgets.findIndex(b => b.id === id && b.user_id === userId);
  if (idx === -1) throw new Error('Presupuesto no encontrado');
  budgets[idx] = { ...budgets[idx], ...input, updated_at: new Date().toISOString() };
  return budgets[idx];
}

export async function deleteBudget(_accessToken: string, userId: string, id: string) {
  const idx = budgets.findIndex(b => b.id === id && b.user_id === userId);
  if (idx !== -1) budgets.splice(idx, 1);
}

// ─── GOALS ──────────────────────────────────────────

export async function getGoals(_accessToken: string, userId: string) {
  return goals.filter(g => g.user_id === userId);
}

export async function createGoal(_accessToken: string, userId: string, input: CreateGoalInput) {
  const goal = { id: randomUUID(), user_id: userId, saved_amount: 0, ...input, created_at: new Date().toISOString() };
  goals.push(goal);
  return goal;
}

export async function updateGoal(_accessToken: string, userId: string, id: string, input: UpdateGoalInput) {
  const idx = goals.findIndex(g => g.id === id && g.user_id === userId);
  if (idx === -1) throw new Error('Meta no encontrada');
  goals[idx] = { ...goals[idx], ...input, updated_at: new Date().toISOString() };
  return goals[idx];
}

export async function deleteGoal(_accessToken: string, userId: string, id: string) {
  const idx = goals.findIndex(g => g.id === id && g.user_id === userId);
  if (idx !== -1) goals.splice(idx, 1);
}
