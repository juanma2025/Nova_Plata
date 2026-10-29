import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'crimson' | 'tertiary' | 'secondary' | 'inverted' | 'outline' | 'ghost';
  isLoading?: boolean;
  neon?: boolean;
  stagger?: 0 | 1 | 2 | 3 | 4;
}

export function Button({ 
  className, 
  variant = 'primary', 
  isLoading, 
  neon, 
  stagger, 
  children, 
  disabled, 
  ...props 
}: ButtonProps) {
  const isNeon = neon ?? (variant === 'primary' || variant === 'crimson' || variant === 'tertiary');
  const base = 'inline-flex items-center justify-center rounded-xl font-medium tracking-tight active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none relative isolate';
  
  const variants = {
    // Adaptive Primary: Crisp crimson in Light mode, Dark sleek surface with neon streamer in Dark mode
    primary: 'neon-btn font-semibold',
    // Solid crimson with neon streamer
    crimson: 'neon-btn font-semibold',
    // Tertiary neon
    tertiary: 'neon-btn font-semibold',
    // Adaptive Secondary: Clean Panel in Light, Dark Surface in Dark
    secondary: 'btn-secondary',
    // Inverted
    inverted: 'bg-white text-[#090A0C] border border-[#E0DDD5] hover:bg-[#F5F4F0] font-semibold shadow-sm',
    // Outline with crimson touch
    outline: 'border border-[#B83A43]/50 text-[#B83A43] dark:text-[#FFB8BE] hover:border-[#FF334F] hover:text-[#FF334F] hover:bg-[#B83A43]/10',
    // Ghost
    ghost: 'text-[var(--text)] hover:bg-[var(--panel2)]'
  };
  const sizes = 'px-5 py-2.5 text-sm';
  const staggerClass = stagger !== undefined ? `neon-stagger-${stagger}` : 'neon-stagger-0';

  return (
    <button 
      className={cn(
        base, 
        variants[variant], 
        sizes, 
        isNeon && 'neon-btn',
        isNeon && staggerClass,
        className
      )} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} 
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
