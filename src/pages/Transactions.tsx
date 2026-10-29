import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { formatMoney } from '../utils/formatters';
import { Search, Plus } from 'lucide-react';
import type { TransactionType } from '../types';
import { toast } from 'sonner';

export function Transactions() {
  const { transactions, addTransaction } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newTx, setNewTx] = useState({
    name: '',
    category: 'Alimentación',
    amount: '',
    type: 'expense' as TransactionType,
  });

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || tx.category === categoryFilter;
    const matchesType = typeFilter === 'Todos' || (typeFilter === 'Ingresos' && tx.type === 'income') || (typeFilter === 'Gastos' && tx.type === 'expense');
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.name || !newTx.amount) return;
    
    addTransaction({
      name: newTx.name,
      category: newTx.category,
      amount: Number(newTx.amount),
      type: newTx.type,
      date: 'Hoy'
    });
    
    setIsModalOpen(false);
    toast.success('Movimiento agregado', {
      description: `${newTx.name} - ${formatMoney(Number(newTx.amount))}`,
    });
    setNewTx({ name: '', category: 'Alimentación', amount: '', type: 'expense' });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Card>
        <CardHeader className="flex-col md:flex-row gap-4 items-start md:items-center">
          <CardTitle>Movimientos</CardTitle>
          <button className="btn-primary neon-btn flex items-center gap-2 w-full md:w-auto justify-center" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Agregar movimiento
          </button>
        </CardHeader>

        <div className="flex gap-2.5 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input 
              className="input-field w-full pl-10" 
              placeholder="Buscar movimiento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="input-field flex-1 md:flex-none min-w-[150px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>Todas</option>
            <option>Alimentación</option>
            <option>Transporte</option>
            <option>Educación</option>
            <option>Ocio</option>
            <option>Trabajo</option>
          </select>
          <select className="input-field flex-1 md:flex-none min-w-[150px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>Todos</option>
            <option>Ingresos</option>
            <option>Gastos</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          <table className="w-full border-collapse min-w-[650px]">
            <thead>
              <tr>
                <th className="text-left p-[15px_10px] border-b border-[var(--border)] text-[var(--muted)] font-medium text-[13px]">Movimiento</th>
                <th className="text-left p-[15px_10px] border-b border-[var(--border)] text-[var(--muted)] font-medium text-[13px]">Categoría</th>
                <th className="text-left p-[15px_10px] border-b border-[var(--border)] text-[var(--muted)] font-medium text-[13px]">Fecha</th>
                <th className="text-left p-[15px_10px] border-b border-[var(--border)] text-[var(--muted)] font-medium text-[13px]">Tipo</th>
                <th className="text-left p-[15px_10px] border-b border-[var(--border)] text-[var(--muted)] font-medium text-[13px]">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--panel2)] transition-colors">
                  <td className="p-[15px_10px] border-b border-[var(--border)] text-[13px]">{tx.name}</td>
                  <td className="p-[15px_10px] border-b border-[var(--border)] text-[13px]">{tx.category}</td>
                  <td className="p-[15px_10px] border-b border-[var(--border)] text-[13px] text-[var(--muted)]">{tx.date}</td>
                  <td className={`p-[15px_10px] border-b border-[var(--border)] text-[13px] font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-[#FF334F]'}`}>
                    {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </td>
                  <td className={`p-[15px_10px] border-b border-[var(--border)] text-[13px] font-headline font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-[#FF334F]'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-[var(--muted)]">No se encontraron movimientos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-in fade-in duration-300">
          <div className="w-full max-w-[480px] shadow-2xl relative animate-in zoom-in-95 duration-300 bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)]">
            <button 
              className="absolute right-5 top-5 text-[var(--muted)] hover:text-[var(--text)] transition-colors hover:rotate-90 duration-200" 
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="font-headline text-xl font-bold mb-6 text-[var(--text)]">Agregar movimiento</h2>
            <form className="grid gap-3 mt-4" onSubmit={handleAdd}>
              <label className="text-xs text-[var(--muted)]">
                Tipo
                <select className="input-field w-full mt-1.5" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}>
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </label>
              <label className="text-xs text-[var(--muted)]">
                Valor
                <input type="number" className="input-field w-full mt-1.5" placeholder="150000" required value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})}/>
              </label>
              <label className="text-xs text-[var(--muted)]">
                Categoría
                <select className="input-field w-full mt-1.5" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})}>
                  <option>Alimentación</option>
                  <option>Transporte</option>
                  <option>Educación</option>
                  <option>Ocio</option>
                  <option>Trabajo</option>
                </select>
              </label>
              <label className="text-xs text-[var(--muted)]">
                Descripción
                <input className="input-field w-full mt-1.5" placeholder="Descripción" required value={newTx.name} onChange={e => setNewTx({...newTx, name: e.target.value})}/>
              </label>
              <button type="submit" className="btn-primary mt-4 py-3 text-lg">Guardar movimiento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
