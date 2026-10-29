import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../../utils/cn';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  stagger?: 0 | 1 | 2 | 3 | 4;
  speed?: number; // duration in seconds
  activeInLight?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export function NeonCard({
  children,
  className,
  stagger = 0,
  speed,
  activeInLight = false,
  style,
  onClick,
}: NeonCardProps) {
  const staggerClass = `neon-stagger-${stagger}`;
  const customStyle: CSSProperties = {
    ...style,
    ...(speed ? ({ '--neon-duration': `${speed}s` } as CSSProperties) : {}),
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'neon-border rounded-[var(--radius)] p-5 relative overflow-hidden',
        staggerClass,
        activeInLight && 'neon-active',
        className
      )}
      style={customStyle}
    >
      {/* Content wrapper with isolation to guarantee crisp rendering above the beam */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
