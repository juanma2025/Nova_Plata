import { cn } from '../../utils/cn';

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'primary' | 'crimson' | 'tertiary' | 'success' | 'danger' | 'warning', className?: string }) {
  const variants = {
    default: 'bg-[var(--panel2)] text-[var(--text)] border-[var(--border)]',
    primary: 'bg-[#FFB8BE]/15 text-[#FFB8BE] border-[#FFB8BE]/30',
    crimson: 'bg-[#B83A43] text-white border-transparent font-semibold shadow-sm',
    tertiary: 'bg-[#FF334F]/15 text-[#FF334F] border-[#FF334F]/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger: 'bg-[#FF334F]/15 text-[#FF334F] border-[#FF334F]/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };
  return <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 font-sans', variants[variant], className)}>{children}</span>;
}
