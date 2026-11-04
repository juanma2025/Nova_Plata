/**
 * Nova IA — Contexto financiero del usuario (Fase 1).
 *
 * Carga los datos del usuario autenticado (cliente con su JWT => RLS activo),
 * calcula métricas de forma determinista y las convierte en un bloque de texto
 * compacto que se envía al modelo como instrucción de sistema. Así el modelo
 * cita cifras reales en vez de inventarlas.
 */
import type { User } from '@supabase/supabase-js';
import { createUserClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import {
  assessBudgets,
  detectAnomalies,
  detectCategorySpikes,
  detectRecurring,
  forecastMonth,
  monthKey,
  type Anomaly,
  type BudgetRisk,
  type CategorySpike,
  type Forecast,
  type RecurringExpense,
  type TxLite,
} from './ml.service.js';

const TIME_ZONE = 'America/Bogota';
const HISTORY_MONTHS = 6;
const MAX_TRANSACTIONS = 800;

export interface GoalLite {
  name: string;
  target: number;
  saved: number;
  deadline: string | null;
}

export interface FinancialInsights {
  today: string;
  currency: string;
  hasData: boolean;
  forecast: Forecast;
  anomalies: Anomaly[];
  spikes: CategorySpike[];
  budgets: BudgetRisk[];
  recurring: RecurringExpense[];
  goals: GoalLite[];
  safeDailySpend: number | null;
}

export interface FinancialSnapshot {
  insights: FinancialInsights;
  text: string;
}

export function todayInBogota(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
}

function currencyCode(user: User): string {
  const raw = String(user.user_metadata?.currency ?? 'COP');
  const code = raw.substring(0, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : 'COP';
}

function makeFormatter(currency: string) {
  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  });
  return (value: number) => fmt.format(Math.round(value * 100) / 100);
}

function startOfHistory(today: string): string {
  const [y, m] = today.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 - (HISTORY_MONTHS - 1), 1));
  return d.toISOString().substring(0, 10);
}

/** Recorta texto controlado por el usuario para que no pueda inflar el prompt. */
function clip(text: string, max = 60): string {
  const clean = text.replace(/[\r\n<>]/g, ' ').trim();
  return clean.length > max ? `${clean.substring(0, max)}…` : clean;
}

// ─── Carga de datos ─────────────────────────────────

async function loadFinancialData(accessToken: string, userId: string, today: string) {
  const client = createUserClient(accessToken);
  const month = monthKey(today);

  const [txRes, budgetRes, goalRes] = await Promise.all([
    client
      .from('transactions')
      .select('id, name, amount, type, category, date')
      .eq('user_id', userId)
      .gte('date', startOfHistory(today))
      .order('date', { ascending: false })
      .limit(MAX_TRANSACTIONS),
    client.from('budgets').select('category, limit_amount').eq('user_id', userId).eq('month', month),
    client.from('goals').select('name, target_amount, saved_amount, deadline').eq('user_id', userId),
  ]);

  if (txRes.error) logger.warn('AI context: transactions query failed', { error: txRes.error.message });
  if (budgetRes.error) logger.warn('AI context: budgets query failed', { error: budgetRes.error.message });
  if (goalRes.error) logger.warn('AI context: goals query failed', { error: goalRes.error.message });

  const transactions: TxLite[] = (txRes.data ?? []).map((t: any) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
    amount: Number(t.amount) || 0,
    type: t.type === 'income' ? 'income' : 'expense',
    category: String(t.category ?? 'Otros'),
    date: String(t.date).substring(0, 10),
  }));

  const budgets = (budgetRes.data ?? []).map((b: any) => ({
    category: String(b.category),
    limit: Number(b.limit_amount) || 0,
  }));

  const goals: GoalLite[] = (goalRes.data ?? []).map((g: any) => ({
    name: String(g.name ?? ''),
    target: Number(g.target_amount) || 0,
    saved: Number(g.saved_amount) || 0,
    deadline: g.deadline ? String(g.deadline).substring(0, 10) : null,
  }));

  return { transactions, budgets, goals };
}

// ─── Insights (usados por el chat y por /ai/insights) ─

export async function computeInsights(user: User, accessToken: string): Promise<{
  insights: FinancialInsights;
  transactions: TxLite[];
}> {
  const today = todayInBogota();
  const meta = user.user_metadata ?? {};
  const { transactions, budgets, goals } = await loadFinancialData(accessToken, user.id, today);

  const forecast = forecastMonth(transactions, today, { monthlyIncomeHint: Number(meta.monthly_income) || 0 });
  const budgetRisks = assessBudgets(budgets, transactions, today);

  // Cuánto puede gastar por día sin pasarse de su tope mensual
  const monthlyCap =
    Number(meta.monthly_budget) > 0
      ? Number(meta.monthly_budget)
      : budgets.length > 0
        ? budgets.reduce((acc, b) => acc + b.limit, 0)
        : forecast.expectedIncome > 0
          ? forecast.expectedIncome - (Number(meta.savings_goal) || 0)
          : 0;
  const remainingDays = forecast.daysInMonth - forecast.daysElapsed + 1;
  const safeDailySpend = monthlyCap > 0 ? Math.max(0, Math.floor((monthlyCap - forecast.spentToDate) / remainingDays)) : null;

  return {
    transactions,
    insights: {
      today,
      currency: currencyCode(user),
      hasData: transactions.length > 0,
      forecast,
      anomalies: detectAnomalies(transactions, {
        today,
        alertThreshold: Number(meta.anomaly_alert_threshold) || undefined,
      }),
      spikes: detectCategorySpikes(transactions, today),
      budgets: budgetRisks,
      recurring: detectRecurring(transactions),
      goals,
      safeDailySpend,
    },
  };
}

// ─── Texto para el modelo ───────────────────────────

function categoryBreakdown(txs: TxLite[], month: string): { category: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const tx of txs) {
    if (tx.type !== 'expense' || monthKey(tx.date) !== month) continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
  }
  return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().substring(0, 7);
}

export async function buildFinancialSnapshot(user: User, accessToken: string): Promise<FinancialSnapshot> {
  const { insights, transactions } = await computeInsights(user, accessToken);
  const money = makeFormatter(insights.currency);
  const meta = user.user_metadata ?? {};
  const f = insights.forecast;
  const lines: string[] = [];

  lines.push(`Fecha de hoy: ${insights.today} (día ${f.daysElapsed} de ${f.daysInMonth} del mes). Moneda: ${insights.currency}.`);
  lines.push(`Nombre: ${clip(String(meta.name ?? 'Usuario'), 40)}. Perfil de riesgo: ${meta.ai_risk_profile ?? 'Moderado'}.`);

  const declared: string[] = [];
  if (Number(meta.monthly_income) > 0) declared.push(`ingreso mensual ${money(Number(meta.monthly_income))}`);
  if (meta.main_income_source) declared.push(`fuente de ingreso: ${clip(String(meta.main_income_source), 40)}`);
  if (Number(meta.monthly_budget) > 0) declared.push(`presupuesto mensual objetivo ${money(Number(meta.monthly_budget))}`);
  if (Number(meta.savings_goal) > 0) declared.push(`meta de ahorro mensual ${money(Number(meta.savings_goal))}`);
  if (declared.length > 0) lines.push(`Datos declarados en el onboarding: ${declared.join('; ')}.`);

  if (!insights.hasData) {
    lines.push('El usuario AÚN NO tiene movimientos registrados en los últimos 6 meses.');
  } else {
    const month = monthKey(insights.today);
    const prev = previousMonth(month);
    const prevSpent = transactions.filter((t) => t.type === 'expense' && monthKey(t.date) === prev).reduce((a, t) => a + t.amount, 0);
    const savingsRate = f.incomeToDate > 0 ? Math.round(((f.incomeToDate - f.spentToDate) / f.incomeToDate) * 100) : null;

    lines.push('');
    lines.push('## Mes actual');
    lines.push(`- Ingresos registrados: ${money(f.incomeToDate)}`);
    lines.push(`- Gastos registrados: ${money(f.spentToDate)}`);
    lines.push(`- Balance: ${money(f.incomeToDate - f.spentToDate)}${savingsRate !== null ? ` (tasa de ahorro ${savingsRate}%)` : ''}`);
    if (prevSpent > 0) lines.push(`- Gasto total del mes anterior: ${money(prevSpent)}`);
    if (insights.safeDailySpend !== null) lines.push(`- Puede gastar hasta ${money(insights.safeDailySpend)} por día el resto del mes sin pasarse de su tope.`);

    const breakdown = categoryBreakdown(transactions, month);
    if (breakdown.length > 0) {
      lines.push('');
      lines.push('## Gasto por categoría (mes actual)');
      for (const c of breakdown) {
        const pct = f.spentToDate > 0 ? Math.round((c.total / f.spentToDate) * 100) : 0;
        lines.push(`- ${clip(c.category, 30)}: ${money(c.total)} (${pct}%)`);
      }
    }

    lines.push('');
    lines.push('## Proyección de fin de mes (modelo estadístico)');
    lines.push(`- Gasto proyectado: ${money(f.projectedExpenses)} (confianza ${f.confidence})`);
    lines.push(`- Ingreso esperado: ${money(f.expectedIncome)} → balance proyectado ${money(f.projectedBalance)}`);
    if (f.historicalMonthlyAverage !== null) lines.push(`- Promedio de gasto mensual reciente: ${money(f.historicalMonthlyAverage)}`);
    if (f.trendPctPerMonth !== null) lines.push(`- Tendencia del gasto: ${f.trendPctPerMonth > 0 ? '+' : ''}${f.trendPctPerMonth}% por mes`);

    if (insights.anomalies.length > 0) {
      lines.push('');
      lines.push('## Gastos inusuales detectados (últimos 45 días)');
      for (const a of insights.anomalies.slice(0, 5)) {
        lines.push(`- ${a.date} · ${clip(a.name)} · ${money(a.amount)} en ${clip(a.category, 30)} — ${a.reason}${a.typicalAmount ? ` (normal: ${money(a.typicalAmount)})` : ''}`);
      }
    }

    if (insights.spikes.length > 0) {
      lines.push('');
      lines.push('## Categorías por encima de su promedio');
      for (const s of insights.spikes) {
        lines.push(`- ${clip(s.category, 30)}: ${money(s.currentMonth)} este mes vs ${money(s.averagePrevious)} de promedio (${s.ratio.toFixed(1)}x)`);
      }
    }

    if (insights.recurring.length > 0) {
      lines.push('');
      lines.push('## Gastos recurrentes / suscripciones detectadas');
      for (const r of insights.recurring.slice(0, 6)) {
        lines.push(`- ${clip(r.name)} (${clip(r.category, 30)}): ~${money(r.averageAmount)} durante ${r.months} meses`);
      }
    }

    const recent = transactions.slice(0, 20);
    lines.push('');
    lines.push('## Últimos movimientos');
    for (const t of recent) {
      lines.push(`- ${t.date} · ${t.type === 'income' ? 'Ingreso' : 'Gasto'} · ${clip(t.name)} · ${clip(t.category, 30)} · ${money(t.amount)}`);
    }
  }

  if (insights.budgets.length > 0) {
    lines.push('');
    lines.push('## Presupuestos del mes');
    for (const b of insights.budgets) {
      const status = b.status === 'excedido' ? 'EXCEDIDO' : b.status === 'en_riesgo' ? 'en riesgo' : 'ok';
      lines.push(`- ${clip(b.category, 30)}: ${money(b.spent)} de ${money(b.limit)} (${b.pctUsed}%), proyectado ${money(b.projected)} — ${status}`);
    }
  } else {
    lines.push('');
    lines.push('No tiene presupuestos definidos para este mes.');
  }

  if (insights.goals.length > 0) {
    lines.push('');
    lines.push('## Metas de ahorro');
    for (const g of insights.goals) {
      const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
      const remaining = Math.max(0, g.target - g.saved);
      let monthly = '';
      if (g.deadline && remaining > 0) {
        const monthsLeft = Math.max(
          1,
          (Number(g.deadline.substring(0, 4)) - Number(insights.today.substring(0, 4))) * 12 +
            (Number(g.deadline.substring(5, 7)) - Number(insights.today.substring(5, 7))),
        );
        monthly = `, necesita ~${money(remaining / monthsLeft)}/mes hasta ${g.deadline}`;
      }
      lines.push(`- ${clip(g.name)}: ${money(g.saved)} de ${money(g.target)} (${pct}%), faltan ${money(remaining)}${monthly}`);
    }
  } else {
    lines.push('No tiene metas de ahorro creadas.');
  }

  return { insights, text: lines.join('\n') };
}

