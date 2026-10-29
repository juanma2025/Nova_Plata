import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  neon?: boolean;
  stagger?: 0 | 1 | 2 | 3 | 4;
}

export function Card({ children, className, style, neon = true, stagger = 0 }: CardProps) {
  const neonClasses = neon ? cn('neon-border', `neon-stagger-${stagger}`) : 'bg-[var(--panel)] border border-[var(--border)] shadow-[var(--card-shadow)]';

  return (
    <div 
      className={cn(
        "rounded-[var(--radius)] p-5 transition-all duration-200",
        neonClasses,
        className
      )} 
      style={style}
    >
      {neon ? (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      ) : children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("flex justify-between items-center mb-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <span className={cn("font-headline font-bold text-base text-[var(--text)] tracking-tight", className)}>
      {children}
    </span>
  );
}
