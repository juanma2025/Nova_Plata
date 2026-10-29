import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Goal, Budget, User } from '../types';

interface StoreState {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  addBudget: (budget: Budget) => void;
  deleteBudget: (category: string) => void;
  clearAllData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: {
        name: 'Usuario',
        email: 'usuario@novaplata.com',
        initials: 'NP',
      },
      transactions: [],
      goals: [],
      budgets: [],
      addTransaction: (tx) => set((state) => ({ 
        transactions: [{ ...tx, id: Math.random().toString(36).substring(2, 9) }, ...state.transactions] 
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: Math.random().toString(36).substring(2, 9) }]
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),
      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets.filter(b => b.category !== budget.category), budget]
      })),
      deleteBudget: (category) => set((state) => ({
        budgets: state.budgets.filter(b => b.category !== category)
      })),
      clearAllData: () => set({ transactions: [], goals: [], budgets: [] }),
    }),
    { name: 'nova-plata-finances' }
  )
);

