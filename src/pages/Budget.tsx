import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatMoney } from '../utils/formatters';
import { Plus, PieChart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Budget() {
  const { budgets, addBudget, deleteBudget } = useStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'Alimentación',
    total: '',
  });

  const totalBudget = budgets.length > 0
    ? budgets.reduce((acc, b) => acc + b.total, 0)
    : (user?.monthly_budget || 0);

  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const available = totalBudget - totalSpent;

  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const formattedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.total) {
      toast.error('Completa los campos');
      return;
    }

    addBudget({
      category: newBudget.category,
      spent: 0,
      total: Number(newBudget.total),
    });

    toast.success('Presupuesto asignado', {
      description: `${newBudget.category}: ${formatMoney(Number(newBudget.total))}`
    });

    setNewBudget({ category: 'Alimentación', total: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-[var(--text)]">Control de presupuesto</h2>
          <p className="text-xs text-[var(--muted)]">Supervisa tus límites y gastos por categoría en {formattedMonth}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary neon-btn flex items-center gap-2"
        >
          <Plus size={18} /> Asignar presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card neon={true} stagger={0}>
          <div className="text-xs text-[var(--muted)] font-medium">Presupuesto mensual</div>
          <div className="text-[32px] md:text-[38px] font-headline font-bold tracking-tight mt-2 text-[var(--text)]">
            {formatMoney(totalBudget)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">Límite programado</div>
        </Card>
        <Card neon={true} stagger={1}>
          <div className="text-xs text-[var(--muted)] font-medium">Gastado acumulado</div>
          <div className="text-[32px] md:text-[38px] font-headline font-bold tracking-tight mt-2 text-[#FF334F]">
            {formatMoney(totalSpent)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% consumido` : 'Sin gastos'}
          </div>
        </Card>
        <Card neon={true} stagger={2}>
          <div className="text-xs text-[var(--muted)] font-medium">Disponible restante</div>
          <div className={`text-[32px] md:text-[38px] font-headline font-bold tracking-tight mt-2 ${available >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#FF334F]'}`}>
            {formatMoney(available)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">Para el resto del mes</div>
        </Card>
      </div>

      <Card neon={true} stagger={0} className="mt-4">
        <CardHeader>
          <CardTitle>Presupuesto por categoría</CardTitle>
          <span className="text-xs text-[var(--muted)]">{formattedMonth}</span>
        </CardHeader>
        
        {budgets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#B83A43]/10 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-4">
              <PieChart size={28} />
            </div>
            <h3 className="font-headline text-lg font-bold text-[var(--text)] mb-2">No has definido presupuestos por categoría</h3>
            <p className="text-sm text-[var(--muted)] max-w-md mb-6 leading-relaxed">
              Asigna topes de gasto a categorías como Alimentación, Transporte, Ocio o Educación para recibir alertas antes de sobrepasar tus límites.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary neon-btn flex items-center gap-2"
            >
              <Plus size={18} /> Asignar primera categoría
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {budgets.map((budget, i) => {
              const percentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
              return (
                <div key={i} className="py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel2)] transition-colors px-3 -mx-3 rounded-lg group">
                  <div className="flex justify-between items-center gap-2.5 mb-2.5 text-sm">
                    <span className="font-medium text-[var(--text)]">{budget.category}</span>
                    <div className="flex items-center gap-3">
                      <b className="font-headline font-semibold text-[var(--text)]">
                        {formatMoney(budget.spent)} / {formatMoney(budget.total)}
                      </b>
                      <button 
                        onClick={() => deleteBudget(budget.category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--muted)] hover:text-[#FF334F]"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--track)] border border-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#B83A43] to-[#FF334F] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Asignar Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-[var(--text)]">
            <button 
              className="absolute right-5 top-5 text-[var(--muted)] hover:text-[var(--text)] transition-colors" 
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="font-headline text-xl font-bold mb-1 text-[var(--text)]">Asignar presupuesto por categoría</h2>
            <p className="text-xs text-[var(--muted)] mb-5">Establece el tope de dinero mensual para esta categoría</p>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Categoría</label>
                <select 
                  value={newBudget.category}
                  onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="input-field w-full"
                >
                  <option>Alimentación</option>
                  <option>Transporte</option>
                  <option>Vivienda</option>
                  <option>Educación</option>
                  <option>Ocio</option>
                  <option>Salud</option>
                  <option>Suscripciones</option>
                  <option>Otros</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Límite mensual ($)</label>
                <input 
                  type="number" 
                  placeholder="Ej. 600000"
                  required
                  value={newBudget.total}
                  onChange={e => setNewBudget({ ...newBudget, total: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="flex gap-2.5 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  Guardar presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
