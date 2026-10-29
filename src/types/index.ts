export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  type: TransactionType;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
}

export interface Budget {
  category: string;
  spent: number;
  total: number;
}

export interface ActiveSession {
  id: string;
  device: string;
  type: 'laptop' | 'mobile';
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  initials?: string;
  avatar_url?: string;
  phone?: string;
  phone_prefix?: string;
  document_id?: string;
  occupation?: string;
  currency?: string;
  tax_regime?: string;
  anomaly_alert_threshold?: number;
  ai_copilot_proactive?: boolean;
  ai_weekly_audit?: boolean;
  ai_subscription_detection?: boolean;
  ai_risk_profile?: 'Conservador' | 'Moderado' | 'Agresivo';
  monthly_income?: number;
  main_income_source?: string;
  approximate_monthly_expenses?: number;
  monthly_budget?: number;
  savings_goal?: number;
  main_expense_categories?: string[];
  onboarding_completed?: boolean;
  sessions?: ActiveSession[];
}
