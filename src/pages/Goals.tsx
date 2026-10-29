import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { formatMoney } from '../utils/formatters';
import { Plus, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Goals() {
  const { goals, addGoal, deleteGoal } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    currentAmount: '',
    targetAmount: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) {
      toast.error('Completa los campos requeridos');
      return;
    }

    addGoal({
      name: newGoal.name,
      description: newGoal.description || 'Objetivo personal',
      currentAmount: Number(newGoal.currentAmount) || 0,
      targetAmount: Number(newGoal.targetAmount),
    });

    toast.success('Meta creada con éxito', {
      description: `${newGoal.name} - Objetivo: ${formatMoney(Number(newGoal.targetAmount))}`
    });

    setNewGoal({ name: '', description: '', currentAmount: '', targetAmount: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-[var(--text)]">Metas de ahorro</h2>
          <p className="text-xs text-[var(--muted)]">Planifica y haz crecer tus proyectos paso a paso</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary neon-btn flex items-center gap-2"
        >
          <Plus size={18} /> Nueva meta
        </button>
      </div>
      
      {goals.length === 0 ? (
        <Card neon={true} stagger={0} className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FF334F]/10 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-4">
            <Target size={32} />
          </div>
          <h3 className="font-headline text-xl font-bold text-[var(--text)] mb-2">No tienes metas registradas aún</h3>
          <p className="text-sm text-[var(--muted)] max-w-md mb-6 leading-relaxed">
            Establece objetivos como comprar un equipo, crear un fondo de emergencias o planificar unas vacaciones. Comienza creando tu primera meta.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary neon-btn flex items-center gap-2"
          >
            <Plus size={18} /> Crear mi primera meta
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const percentage = goal.targetAmount > 0 
              ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) 
              : 0;
            return (
              <Card 
                key={goal.id} 
                neon={true} 
                stagger={(i % 3) as 0 | 1 | 2} 
                className="animate-slide-up relative group" 
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-headline text-xl font-bold text-[var(--text)]">{goal.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-headline font-semibold text-[#FF334F] dark:text-[#FFB8BE] bg-[#FF334F]/10 dark:bg-[#FFB8BE]/10 px-2 py-0.5 rounded-full">
                      {Math.round(percentage)}%
                    </span>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--muted)] hover:text-[#FF334F]"
                      title="Eliminar meta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] my-2 mb-4">{goal.description}</p>
                
                <div className="text-[32px] md:text-[38px] font-headline font-bold tracking-tight text-[var(--text)]">
                  {formatMoney(goal.currentAmount)}
                </div>
                <p className="text-xs text-[var(--muted)] font-medium">de {formatMoney(goal.targetAmount)}</p>
                
                <div className="h-2 bg-[var(--track)] border border-[var(--border)] rounded-full overflow-hidden mt-4 group">
                  <div 
                    className="h-full bg-gradient-to-r from-[#B83A43] via-[#FF334F] to-[#FFB8BE] rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-[var(--text)]">
            <button 
              className="absolute right-5 top-5 text-[var(--muted)] hover:text-[var(--text)] transition-colors" 
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="font-headline text-xl font-bold mb-1 text-[var(--text)]">Crear nueva meta</h2>
            <p className="text-xs text-[var(--muted)] mb-5">Define tu objetivo de ahorro personal</p>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Nombre de la meta</label>
                <input 
                  type="text" 
                  placeholder="Ej. Fondo de emergencias, Viaje..."
                  required
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Descripción breve</label>
                <input 
                  type="text" 
                  placeholder="Ej. Ahorro para gastos imprevistos"
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Monto actual ($)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={e => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Meta final ($) *</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 2000000"
                    required
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
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
                  Guardar meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
