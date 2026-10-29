import { create } from 'zustand';
import type { Transaction, Goal, Budget } from '../types';
import { authService } from '../services/api';

interface StoreState {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchFinancialData: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (category: string) => Promise<void>;
  clearAllData: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  transactions: [],
  goals: [],
  budgets: [],
  isLoading: false,
  error: null,

  fetchFinancialData: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ transactions: [], goals: [], budgets: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // 1. Fetch transactions
      const txRes = await authService.get('/finance/transactions?limit=100');
      const rawTxs = txRes.data?.transactions || [];
      const mappedTxs: Transaction[] = rawTxs.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        amount: Number(t.amount),
        type: t.type,
        date: t.date,
      }));

      // 2. Fetch goals
      const goalsRes = await authService.get('/finance/goals');
      const rawGoals = goalsRes.data || [];
      const mappedGoals: Goal[] = rawGoals.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.notes || 'Objetivo personal',
        currentAmount: Number(g.saved_amount) || 0,
        targetAmount: Number(g.target_amount) || 0,
      }));

      // 3. Fetch budgets
      const currentMonth = new Date().toISOString().substring(0, 7);
      const budgetsRes = await authService.get(`/finance/budgets?month=${currentMonth}`);
      const rawBudgets = budgetsRes.data || [];
      const mappedBudgets: Budget[] = rawBudgets.map((b: any) => ({
        id: b.id,
        category: b.category,
        spent: Number(b.spent_amount) || 0,
        total: Number(b.limit_amount) || 0,
      }));

      set({
        transactions: mappedTxs,
        goals: mappedGoals,
        budgets: mappedBudgets,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  addTransaction: async (tx) => {
    const today = new Date().toISOString().substring(0, 10);
    const date = tx.date && /^\d{4}-\d{2}-\d{2}$/.test(tx.date) ? tx.date : today;

    try {
      const response = await authService.post('/finance/transactions', {
        name: tx.name,
        amount: Number(tx.amount),
        type: tx.type,
        category: tx.category,
        date,
      });

      if (response.success && response.data) {
        const created: Transaction = {
          id: response.data.id,
          name: response.data.name,
          amount: Number(response.data.amount),
          type: response.data.type,
          category: response.data.category,
          date: response.data.date,
        };
        set((state) => ({ transactions: [created, ...state.transactions] }));
        return;
      }
    } catch {
      // Local fallback if offline
    }

    const localTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(2, 9),
      date,
    };
    set((state) => ({ transactions: [localTx, ...state.transactions] }));
  },

  deleteTransaction: async (id: string) => {
    try {
      await authService.delete(`/finance/transactions/${id}`);
    } catch {
      // ignore
    }
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  addGoal: async (goal) => {
    try {
      const response = await authService.post('/finance/goals', {
        name: goal.name,
        target_amount: Number(goal.targetAmount),
      });

      if (response.success && response.data) {
        const created: Goal = {
          id: response.data.id,
          name: response.data.name,
          description: goal.description || 'Objetivo personal',
          currentAmount: Number(response.data.saved_amount) || 0,
          targetAmount: Number(response.data.target_amount),
        };
        set((state) => ({ goals: [...state.goals, created] }));
        return;
      }
    } catch {
      // Local fallback
    }

    const localGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
    };
    set((state) => ({ goals: [...state.goals, localGoal] }));
  },

  deleteGoal: async (id: string) => {
    try {
      await authService.delete(`/finance/goals/${id}`);
    } catch {
      // ignore
    }
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  addBudget: async (budget) => {
    const month = new Date().toISOString().substring(0, 7);
    try {
      const response = await authService.post('/finance/budgets', {
        category: budget.category,
        limit_amount: Number(budget.total),
        month,
      });

      if (response.success && response.data) {
        const created: Budget = {
          category: response.data.category,
          spent: Number(response.data.spent_amount) || 0,
          total: Number(response.data.limit_amount),
        };
        set((state) => ({
          budgets: [...state.budgets.filter((b) => b.category !== created.category), created],
        }));
        return;
      }
    } catch {
      // Local fallback
    }

    set((state) => ({
      budgets: [...state.budgets.filter((b) => b.category !== budget.category), budget],
    }));
  },

  deleteBudget: async (category: string) => {
    const budgetToDelete = get().budgets.find((b: any) => b.category === category);
    if ((budgetToDelete as any)?.id) {
      try {
        await authService.delete(`/finance/budgets/${(budgetToDelete as any).id}`);
      } catch {
        // ignore
      }
    }
    set((state) => ({
      budgets: state.budgets.filter((b) => b.category !== category),
    }));
  },

  clearAllData: () => {
    try {
      localStorage.removeItem('nova-plata-finances');
    } catch {
      // ignore
    }
    set({ transactions: [], goals: [], budgets: [], error: null });
  },
}));

