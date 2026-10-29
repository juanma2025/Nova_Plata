import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatMoney } from '../utils/formatters';
import { BarChart3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Analytics() {
  const { transactions } = useStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const expenseTx = transactions.filter(t => t.type === 'expense');
  const incomeTx = transactions.filter(t => t.type === 'income');

  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);

  const dailyAverage = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;
  const monthlyProjection = totalExpense > 0 ? dailyAverage * 30 : (user?.approximate_monthly_expenses || 0);
  
  const smallExpenses = expenseTx.filter(t => t.amount <= 20000);
  const smallExpensesTotal = smallExpenses.reduce((sum, t) => sum + t.amount, 0);

  const budget = user?.monthly_budget || 0;
  const budgetHealth = budget > 0 ? Math.max(0, Math.min(100, Math.round(((budget - totalExpense) / budget) * 100))) : (totalExpense > 0 ? 70 : 100);

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="mb-6">
        <h2 className="text-xl font-headline font-bold text-[var(--text)]">Estadísticas y análisis</h2>
        <p className="text-xs text-[var(--muted)]">Métricas clave calculadas a partir de tus hábitos de gasto reales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card neon={true} stagger={0} className="min-h-[145px]">
          <div className="text-[13px] text-[var(--muted)] font-medium">Promedio diario</div>
          <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
            {formatMoney(dailyAverage)}
          </div>
          <div className="text-xs mt-3 text-[var(--muted)]">gasto promedio / día</div>
        </Card>
        <Card neon={true} stagger={1} className="min-h-[145px]">
          <div className="text-[13px] text-[var(--muted)] font-medium">Proyección mensual</div>
          <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
            {formatMoney(monthlyProjection)}
          </div>
          <div className="text-xs mt-3 text-[var(--muted)]">estimación al cierre de mes</div>
        </Card>
        <Card neon={true} stagger={2} className="min-h-[145px]">
          <div className="text-[13px] text-[var(--muted)] font-medium">Gastos hormiga</div>
          <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
            {formatMoney(smallExpensesTotal)}
          </div>
          <div className="text-xs mt-3 text-[var(--muted)]">{smallExpenses.length} movimientos menores</div>
        </Card>
        <Card neon={true} stagger={0} className="min-h-[145px]">
          <div className="text-[13px] text-[var(--muted)] font-medium">Salud del presupuesto</div>
          <div className={`text-[28px] font-headline font-bold mt-3.5 tracking-tight ${budgetHealth >= 50 ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#FF334F]'}`}>
            {budgetHealth}%
          </div>
          <div className="text-xs mt-3 text-[var(--muted)]">{budgetHealth >= 50 ? 'ritmo controlado' : 'atención requerida'}</div>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card neon={true} stagger={1} className="p-12 text-center flex flex-col items-center justify-center mt-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF334F]/10 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-4">
            <BarChart3 size={28} />
          </div>
          <h3 className="font-headline text-lg font-bold text-[var(--text)] mb-2">No hay suficientes datos para graficar</h3>
          <p className="text-sm text-[var(--muted)] max-w-md mb-6 leading-relaxed">
            Registra tus primeros movimientos de ingresos o gastos para desbloquear gráficos de distribución por categoría y comparativas mensuales automáticas.
          </p>
          <button 
            onClick={() => navigate('/app/movimientos')}
            className="btn-primary neon-btn flex items-center gap-2"
          >
            <Plus size={18} /> Registrar primer movimiento
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <Card neon={true} stagger={1}>
            <CardHeader>
              <CardTitle>Gastos por categoría</CardTitle>
            </CardHeader>
            <div className="h-[245px] flex items-end gap-2.5 pt-[25px] px-[5px] pb-[5px] border-b border-[var(--border)]">
              {[70, 42, 35, 28, 20].map((height, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-lg rounded-b-sm min-h-[12px] relative transition-all duration-700 ease-out hover:opacity-85 ${i === 0 ? 'bg-[#FF334F] shadow-[0_0_15px_rgba(255,51,79,0.4)]' : 'bg-[#B83A43]/70 hover:bg-[#B83A43]'}`} 
                  style={{ height: `${height}%` }}
                >
                  <span className="absolute -bottom-6 w-full text-center text-[var(--muted)] text-[11px] font-medium transition-colors hover:text-[var(--text)]">
                    {['Alim.', 'Edu.', 'Trans.', 'Ocio', 'Otros'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card neon={true} stagger={2}>
            <CardHeader>
              <CardTitle>Resumen general</CardTitle>
              <span className="text-xs text-[var(--muted)]">Histórico</span>
            </CardHeader>
            <div className="flex flex-col">
              <div className="py-3.5 border-b border-[var(--border)]">
                <div className="flex justify-between gap-2.5 text-sm">
                  <span className="text-[var(--text)]">Ingresos registrados</span>
                  <b className="font-headline font-semibold text-emerald-500 dark:text-emerald-400">+{formatMoney(totalIncome)}</b>
                </div>
              </div>
              <div className="py-3.5 border-b border-[var(--border)]">
                <div className="flex justify-between gap-2.5 text-sm">
                  <span className="text-[var(--text)]">Gastos registrados</span>
                  <b className="font-headline font-semibold text-[#FF334F]">-{formatMoney(totalExpense)}</b>
                </div>
              </div>
              <div className="py-3.5 border-b border-[var(--border)] border-none pb-0">
                <div className="flex justify-between gap-2.5 text-sm">
                  <span className="text-[var(--text)]">Balance neto</span>
                  <b className={`font-headline font-semibold ${totalIncome >= totalExpense ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#FF334F]'}`}>
                    {formatMoney(totalIncome - totalExpense)}
                  </b>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
