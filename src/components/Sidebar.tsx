import { NavLink, Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { Home, ArrowDownUp, PieChart, Target, BarChart2, MessageSquare, User } from 'lucide-react';
import { Logo } from './ui/Logo';

const navItems = [
  { path: '/app', label: 'Inicio', icon: Home },
  { path: '/app/movimientos', label: 'Movimientos', icon: ArrowDownUp },
  { path: '/app/presupuesto', label: 'Presupuesto', icon: PieChart },
  { path: '/app/metas', label: 'Metas', icon: Target },
  { path: '/app/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { path: '/app/nova-ia', label: 'Nova IA', icon: MessageSquare },
  { path: '/app/perfil', label: 'Perfil', icon: User },
];

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[250px] bg-[var(--panel)] border-r border-[var(--border)] p-[26px_16px] fixed inset-y-0 left-0 z-20 font-sans transition-colors duration-300">
        <div className="px-3 pb-[28px]">
          <Link to="/app" className="inline-block">
            <Logo size="sm" />
          </Link>
        </div>
        <nav className="grid gap-[6px]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "text-[var(--muted)] text-left px-3.5 py-[12px] rounded-xl flex gap-3 items-center text-sm font-medium transition-all duration-200 relative group overflow-hidden",
                isActive 
                  ? "bg-[var(--panel2)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-sm before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-[#FF334F] before:rounded-r-full" 
                  : "hover:bg-[var(--panel2)] hover:text-[var(--text)] hover:translate-x-1"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={cn("transition-transform duration-200", isActive ? "text-[#FF334F] dark:text-[#FFB8BE]" : "group-hover:scale-110 group-hover:text-[var(--text)]")} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Floating Capsule Dock */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto bg-[var(--panel)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center gap-1 transition-colors duration-300">
          {navItems.filter(i => ['/app', '/app/movimientos', '/app/presupuesto', '/app/metas', '/app/perfil'].includes(i.path)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center",
                isActive 
                  ? "bg-[#B83A43] text-white dark:bg-[#FFB8BE] dark:text-[#3A090F] shadow-md scale-105" 
                  : "text-[var(--muted)] hover:text-[var(--text)] active:scale-95"
              )}
              aria-label={item.label}
            >
              <item.icon size={20} />
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
