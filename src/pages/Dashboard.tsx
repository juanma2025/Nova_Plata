import { ArrowUpRight, ArrowDownRight, Plus, Target, ArrowDownUp } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { formatMoney } from '../utils/formatters';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { transactions, goals } = useStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 14 } }
  };

  // Dynamic user financial calculations
  const incomeFromTx = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expensesFromTx = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const income = incomeFromTx > 0 ? incomeFromTx : (user?.monthly_income || 0);
  const expenses = expensesFromTx > 0 ? expensesFromTx : (user?.approximate_monthly_expenses || 0);
  const budget = user?.monthly_budget || 0;
  
  const balance = income - expenses;
  const budgetRemaining = budget - expenses;
  const budgetPercent = budget > 0 ? Math.round((budgetRemaining / budget) * 100) : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card Principal: Saldo estimado con Borde Neón Streamer */}
        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={0} className="relative overflow-hidden min-h-[145px]">
            <div className="absolute w-[110px] h-[110px] rounded-full -right-[45px] -top-[45px] bg-[#B83A43]/10 blur-xl pointer-events-none" />
            <div className="text-[13px] text-[var(--muted)] font-medium">Saldo disponible</div>
            <div className={`text-[28px] font-headline font-bold mt-3.5 tracking-tight ${balance >= 0 ? 'text-[var(--text)]' : 'text-[#FF334F]'}`}>
              {formatMoney(balance)}
            </div>
            <div className="text-xs mt-3 text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpRight size={14}/> {income > 0 ? 'Balance calculado' : 'Registra tus ingresos'}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={1} className="relative overflow-hidden min-h-[145px] h-full">
            <div className="text-[13px] text-[var(--muted)] font-medium">Ingresos mensuales</div>
            <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
              {formatMoney(income)}
            </div>
            <div className="text-xs mt-3 text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpRight size={14}/> {incomeFromTx > 0 ? `${transactions.filter(t => t.type === 'income').length} movimientos` : 'Total mensual'}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={2} className="relative overflow-hidden min-h-[145px] h-full">
            <div className="text-[13px] text-[var(--muted)] font-medium">Gastos registrados</div>
            <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
              {formatMoney(expenses)}
            </div>
            <div className="text-xs mt-3 text-[#FF334F] flex items-center gap-1 font-medium">
              <ArrowDownRight size={14}/> {expensesFromTx > 0 ? `${transactions.filter(t => t.type === 'expense').length} movimientos` : 'Sin gastos hoy'}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={0} className="relative overflow-hidden min-h-[145px] h-full">
            <div className="text-[13px] text-[var(--muted)] font-medium">Presupuesto restante</div>
            <div className="text-[28px] font-headline font-bold mt-3.5 tracking-tight text-[var(--text)]">
              {formatMoney(budgetRemaining > 0 ? budgetRemaining : 0)}
            </div>
            <div className="text-xs mt-3 text-[var(--muted)] font-medium">
              {budget > 0 ? `${budgetPercent}% disponible` : 'Configura tu presupuesto'}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">
        {/* Card Principal: Evolución financiera */}
        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={1} className="h-full">
            <CardHeader>
              <CardTitle>Evolución de movimientos</CardTitle>
              <span className="text-xs text-[var(--muted)]">Semestral</span>
            </CardHeader>
            {transactions.length === 0 ? (
              <div className="h-[245px] flex flex-col items-center justify-center text-center p-6 border-b border-[var(--border)]">
                <div className="w-12 h-12 rounded-xl bg-[#FF334F]/10 text-[#FF334F] flex items-center justify-center mb-3">
                  <ArrowDownUp size={24} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">Sin movimientos registrados</p>
                <p className="text-xs text-[var(--muted)] mt-1 max-w-xs">
                  Agrega tus ingresos y gastos para generar tus gráficos y proyecciones de gasto.
                </p>
                <button 
                  onClick={() => navigate('/app/movimientos')} 
                  className="btn-primary mt-4 py-1.5 px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Registrar movimiento
                </button>
              </div>
            ) : (
              <div className="h-[245px] flex items-end gap-2.5 pt-[25px] px-[5px] pb-[5px] border-b border-[var(--border)]">
                {[45, 58, 51, 68, 77, 88].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: "easeOut" }}
                    className={`flex-1 rounded-t-lg rounded-b-sm min-h-[12px] relative transition-all duration-300 hover:opacity-90 ${i === 5 ? 'bg-[#FF334F] shadow-[0_0_12px_rgba(255,51,79,0.35)]' : 'bg-[#B83A43]/70 hover:bg-[#B83A43]'}`} 
                  >
                    <span className="absolute -bottom-6 w-full text-center text-[var(--muted)] text-[11px] font-medium transition-colors hover:text-[var(--text)]">
                      {['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'][i]}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
        
        {/* Card Principal: Metas de ahorro */}
        <motion.div variants={itemVariants}>
          <Card neon={true} stagger={2} className="h-full">
            <CardHeader>
              <CardTitle>Metas de ahorro</CardTitle>
              <button className="text-xs text-[#B83A43] dark:text-[#FFB8BE] hover:underline transition-colors font-medium" onClick={() => navigate('/app/metas')}>Ver todas</button>
            </CardHeader>
            {goals.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-[#FF334F]/10 text-[#FF334F] flex items-center justify-center mb-3">
                  <Target size={22} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">No tienes metas activas</p>
                <p className="text-xs text-[var(--muted)] mt-1 mb-4">Crea objetivos para separar dinero virtualmente</p>
                <button onClick={() => navigate('/app/metas')} className="btn-secondary text-xs py-1.5 px-3">
                  <Plus size={14} className="mr-1 inline" /> Crear meta
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {goals.slice(0, 3).map((goal, i) => {
                  const percentage = goal.targetAmount > 0 
                    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
                    : 0;
                  return (
                    <div key={i} className="py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel2)] transition-colors px-3 -mx-3 rounded-lg cursor-pointer group" onClick={() => navigate('/app/metas')}>
                      <div className="flex justify-between gap-2.5 mb-2.5">
                        <span className="font-semibold text-sm transition-colors group-hover:text-[#FF334F] text-[var(--text)]">{goal.name}</span>
                        <b className="text-sm font-headline text-[var(--text)]">{percentage}%</b>
                      </div>
                      <div className="h-2 bg-[var(--track)] rounded-full overflow-hidden mb-2.5 border border-[var(--border)]">
                        <div className="h-full bg-gradient-to-r from-[#B83A43] to-[#FF334F] rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--muted)] font-medium">
                        <span>{formatMoney(goal.currentAmount)} ahorrados</span>
                        <span>{formatMoney(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card neon={true} stagger={0}>
          <CardHeader>
            <CardTitle>Movimientos recientes</CardTitle>
            <button className="btn-secondary text-xs font-semibold py-1.5 px-3" onClick={() => navigate('/app/movimientos')}>
              {transactions.length > 0 ? 'Ver todos' : 'Nuevo movimiento'}
            </button>
          </CardHeader>
          {transactions.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <p className="text-sm text-[var(--muted)]">No hay movimientos registrados recientemente.</p>
              <button onClick={() => navigate('/app/movimientos')} className="btn-primary mt-3 py-1.5 px-4 text-xs">
                <Plus size={14} className="mr-1 inline" /> Agregar primer movimiento
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {transactions.slice(0, 5).map((tx, i) => (
                <motion.div 
                  key={tx.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.08) }}
                  className="grid grid-cols-[42px_1fr_auto] gap-3.5 items-center py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel2)] -mx-5 px-5 transition-all duration-200 cursor-pointer rounded-lg"
                >
                  <div className="w-[42px] h-[42px] rounded-xl bg-[var(--panel2)] border border-[var(--border)] grid place-items-center shadow-sm">
                    {tx.type === 'income' ? <ArrowUpRight className="text-emerald-500 dark:text-emerald-400" size={18} /> : <ArrowDownRight className="text-[#FF334F]" size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">{tx.name}</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">{tx.category} · {tx.date}</div>
                  </div>
                  <strong className={`font-headline font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#FF334F]'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                  </strong>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
