/**
 * Nova IA — Modelos estadísticos (Fase 3).
 *
 * Funciones puras (sin I/O) que se ejecutan sobre los movimientos de UN solo
 * usuario. No hay entrenamiento global: cada usuario solo "entrena" con sus
 * propios datos, por lo que no existe fuga de información entre cuentas.
 *
 * - detectAnomalies: z-score robusto (mediana + MAD) por categoría.
 * - detectCategorySpikes: gasto del mes vs. promedio histórico por categoría.
 * - forecastMonth: proyección de gasto de fin de mes (run-rate + histórico) y
 *   tendencia con regresión lineal sobre los totales mensuales.
 * - assessBudgets: riesgo de exceder cada presupuesto.
 * - detectRecurring: gastos recurrentes / suscripciones.
 */

export interface TxLite {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
}

export interface Anomaly {
  transactionId: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  typicalAmount: number | null;
  severity: 'alta' | 'media';
  reason: string;
}

export interface CategorySpike {
  category: string;
  currentMonth: number;
  averagePrevious: number;
  ratio: number;
}

export interface Forecast {
  month: string;
  daysElapsed: number;
  daysInMonth: number;
  spentToDate: number;
  incomeToDate: number;
  projectedExpenses: number;
  expectedIncome: number;
  projectedBalance: number;
  historicalMonthlyAverage: number | null;
  trendPctPerMonth: number | null;
  confidence: 'baja' | 'media' | 'alta';
}

export interface BudgetRisk {
  category: string;
  limit: number;
  spent: number;
  pctUsed: number;
  projected: number;
  status: 'excedido' | 'en_riesgo' | 'ok';
}

export interface RecurringExpense {
  name: string;
  category: string;
  averageAmount: number;
  months: number;
  lastDate: string;
}

// ─── Helpers ────────────────────────────────────────

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function medianAbsoluteDeviation(values: number[], med: number): number {
  return median(values.map((v) => Math.abs(v - med)));
}

export function monthKey(date: string): string {
  return date.substring(0, 7);
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Totales de gasto por mes (YYYY-MM → total). */
function monthlyExpenseTotals(txs: TxLite[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const tx of txs) {
    if (tx.type !== 'expense') continue;
    const key = monthKey(tx.date);
    totals.set(key, (totals.get(key) ?? 0) + tx.amount);
  }
  return totals;
}

/** Meses completos anteriores al actual que tienen datos (máx. `limit`, del más reciente al más antiguo). */
function previousMonthsWithData(totals: Map<string, number>, currentMonth: string, limit: number): string[] {
  return [...totals.keys()]
    .filter((m) => m < currentMonth)
    .sort()
    .reverse()
    .slice(0, limit);
}

// ─── Anomalías ──────────────────────────────────────

export function detectAnomalies(
  txs: TxLite[],
  opts: { today: string; alertThreshold?: number; lookbackDays?: number },
): Anomaly[] {
  const lookbackDays = opts.lookbackDays ?? 45;
  const expenses = txs.filter((t) => t.type === 'expense' && t.amount > 0);
  const byCategory = new Map<string, TxLite[]>();
  for (const tx of expenses) {
    const list = byCategory.get(tx.category) ?? [];
    list.push(tx);
    byCategory.set(tx.category, list);
  }

  const anomalies: Anomaly[] = [];
  for (const tx of expenses) {
    const age = daysBetween(tx.date, opts.today);
    if (age < 0 || age > lookbackDays) continue;

    const peers = (byCategory.get(tx.category) ?? []).filter((p) => p.id !== tx.id).map((p) => p.amount);
    const typical = peers.length > 0 ? median(peers) : null;

    if (opts.alertThreshold && opts.alertThreshold > 0 && tx.amount >= opts.alertThreshold) {
      anomalies.push({
        transactionId: tx.id,
        name: tx.name,
        category: tx.category,
        amount: tx.amount,
        date: tx.date,
        typicalAmount: typical,
        severity: 'alta',
        reason: 'Supera tu umbral personal de alerta de gasto',
      });
      continue;
    }

    // Se necesitan al menos 4 movimientos de referencia en la categoría
    if (peers.length < 4 || typical === null || typical <= 0) continue;

    const mad = medianAbsoluteDeviation(peers, typical);
    // Si todos los valores son iguales (MAD = 0), usamos una escala del 10 % de la mediana
    const scale = mad > 0 ? mad : typical * 0.1;
    const robustZ = (0.6745 * (tx.amount - typical)) / scale;
    const ratio = tx.amount / typical;

    if (robustZ > 3.5 && ratio >= 1.5) {
      anomalies.push({
        transactionId: tx.id,
        name: tx.name,
        category: tx.category,
        amount: tx.amount,
        date: tx.date,
        typicalAmount: typical,
        severity: robustZ > 6 || ratio >= 3 ? 'alta' : 'media',
        reason: `Es ${ratio.toFixed(1)}x lo que sueles gastar en ${tx.category}`,
      });
    }
  }

  return anomalies.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
}

// ─── Picos por categoría ────────────────────────────

export function detectCategorySpikes(txs: TxLite[], today: string): CategorySpike[] {
  const currentMonth = monthKey(today);
  const expenses = txs.filter((t) => t.type === 'expense');
  const totals = monthlyExpenseTotals(expenses);
  const prevMonths = previousMonthsWithData(totals, currentMonth, 3);
  if (prevMonths.length < 2) return [];

  const avgMonthlyTotal = sum(prevMonths.map((m) => totals.get(m) ?? 0)) / prevMonths.length;
  const categories = new Set(expenses.map((t) => t.category));
  const spikes: CategorySpike[] = [];

  for (const category of categories) {
    const inCategory = expenses.filter((t) => t.category === category);
    const current = sum(inCategory.filter((t) => monthKey(t.date) === currentMonth).map((t) => t.amount));
    if (current <= 0) continue;
    const prevTotals = prevMonths.map((m) => sum(inCategory.filter((t) => monthKey(t.date) === m).map((t) => t.amount)));
    const avgPrev = sum(prevTotals) / prevMonths.length;
    if (avgPrev <= 0) continue;

    const ratio = current / avgPrev;
    // Pico relevante: ya superó en 30 % su promedio mensual completo y la diferencia pesa ≥ 5 % del gasto mensual típico
    if (ratio >= 1.3 && current - avgPrev >= avgMonthlyTotal * 0.05) {
      spikes.push({ category, currentMonth: current, averagePrevious: avgPrev, ratio });
    }
  }

  return spikes.sort((a, b) => b.ratio - a.ratio).slice(0, 5);
}

// ─── Proyección de fin de mes ───────────────────────

function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = sum(values) / n;
  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  return den === 0 ? 0 : num / den;
}

export function forecastMonth(txs: TxLite[], today: string, opts: { monthlyIncomeHint?: number } = {}): Forecast {
  const currentMonth = monthKey(today);
  const totalDays = daysInMonth(currentMonth);
  const daysElapsed = Number(today.substring(8, 10));
  const elapsedShare = daysElapsed / totalDays;

  const thisMonth = txs.filter((t) => monthKey(t.date) === currentMonth);
  const spentToDate = sum(thisMonth.filter((t) => t.type === 'expense').map((t) => t.amount));
  const incomeToDate = sum(thisMonth.filter((t) => t.type === 'income').map((t) => t.amount));

  const totals = monthlyExpenseTotals(txs);
  const prevMonths = previousMonthsWithData(totals, currentMonth, 3);
  const historicalMonthlyAverage =
    prevMonths.length > 0 ? sum(prevMonths.map((m) => totals.get(m) ?? 0)) / prevMonths.length : null;

  const runRate = daysElapsed > 0 ? (spentToDate / daysElapsed) * totalDays : spentToDate;
  // Mezcla: al inicio del mes pesa más el histórico; al final, el ritmo real del mes
  const blended =
    historicalMonthlyAverage !== null
      ? elapsedShare * runRate + (1 - elapsedShare) * historicalMonthlyAverage
      : runRate;
  const projectedExpenses = Math.max(spentToDate, Math.round(blended));

  // Tendencia: regresión lineal sobre los últimos (hasta 6) meses completos en orden cronológico
  const trendMonths: string[] = [];
  for (let i = 6; i >= 1; i--) trendMonths.push(shiftMonth(currentMonth, -i));
  const trendValues = trendMonths.map((m) => totals.get(m)).filter((v): v is number => v !== undefined);
  let trendPctPerMonth: number | null = null;
  if (trendValues.length >= 3) {
    const mean = sum(trendValues) / trendValues.length;
    if (mean > 0) trendPctPerMonth = Math.round((linearRegressionSlope(trendValues) / mean) * 1000) / 10;
  }

  // Ingreso esperado: el mayor entre lo recibido, el promedio histórico y el ingreso declarado en el onboarding
  const incomeByMonth = new Map<string, number>();
  for (const tx of txs) {
    if (tx.type !== 'income') continue;
    const key = monthKey(tx.date);
    incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + tx.amount);
  }
  const prevIncomeMonths = [...incomeByMonth.keys()].filter((m) => m < currentMonth).sort().reverse().slice(0, 3);
  const avgIncome =
    prevIncomeMonths.length > 0 ? sum(prevIncomeMonths.map((m) => incomeByMonth.get(m) ?? 0)) / prevIncomeMonths.length : 0;
  const expectedIncome = Math.max(incomeToDate, avgIncome, opts.monthlyIncomeHint ?? 0);

  let confidence: Forecast['confidence'] = 'baja';
  if (prevMonths.length >= 2 && daysElapsed >= 7) confidence = 'alta';
  else if (prevMonths.length >= 1 || daysElapsed >= 10) confidence = 'media';

  return {
    month: currentMonth,
    daysElapsed,
    daysInMonth: totalDays,
    spentToDate,
    incomeToDate,
    projectedExpenses,
    expectedIncome,
    projectedBalance: expectedIncome - projectedExpenses,
    historicalMonthlyAverage,
    trendPctPerMonth,
    confidence,
  };
}

// ─── Riesgo de presupuestos ─────────────────────────

export function assessBudgets(budgets: { category: string; limit: number }[], txs: TxLite[], today: string): BudgetRisk[] {
  const currentMonth = monthKey(today);
  const elapsedShare = Number(today.substring(8, 10)) / daysInMonth(currentMonth);

  return budgets
    .filter((b) => b.limit > 0)
    .map((b) => {
      const spent = sum(
        txs
          .filter((t) => t.type === 'expense' && t.category === b.category && monthKey(t.date) === currentMonth)
          .map((t) => t.amount),
      );
      // Con menos del 20 % del mes transcurrido la extrapolación es poco fiable
      const projected = elapsedShare >= 0.2 ? Math.round(spent / elapsedShare) : spent;
      const pctUsed = Math.round((spent / b.limit) * 100);
      let status: BudgetRisk['status'] = 'ok';
      if (spent > b.limit) status = 'excedido';
      else if (pctUsed >= 80 || projected > b.limit * 1.05) status = 'en_riesgo';
      return { category: b.category, limit: b.limit, spent, pctUsed, projected, status };
    })
    .sort((a, b) => b.pctUsed - a.pctUsed);
}

// ─── Gastos recurrentes / suscripciones ─────────────

export function detectRecurring(txs: TxLite[]): RecurringExpense[] {
  const groups = new Map<string, TxLite[]>();
  for (const tx of txs) {
    if (tx.type !== 'expense') continue;
    const key = normalizeText(tx.name);
    if (key.length < 3) continue;
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  const recurring: RecurringExpense[] = [];
  for (const list of groups.values()) {
    const months = new Set(list.map((t) => monthKey(t.date)));
    if (months.size < 2) continue;
    const amounts = list.map((t) => t.amount);
    const med = median(amounts);
    // Montos estables (±20 % de la mediana) => cargo recurrente
    const stable = amounts.every((a) => Math.abs(a - med) <= med * 0.2);
    if (!stable) continue;
    const latest = [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
    recurring.push({
      name: latest.name,
      category: latest.category,
      averageAmount: Math.round(sum(amounts) / amounts.length),
      months: months.size,
      lastDate: latest.date,
    });
  }

  return recurring.sort((a, b) => b.averageAmount - a.averageAmount).slice(0, 10);
}

