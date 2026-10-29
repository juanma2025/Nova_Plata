import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className='flex flex-col gap-1.5 w-full font-sans'>
      {label && <label className='text-xs uppercase tracking-wider font-semibold text-[var(--muted)]'>{label}</label>}
      <input 
        ref={ref} 
        className={cn(
          'bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#B83A43] focus:ring-2 focus:ring-[#B83A43]/20 hover:border-[#3A3D47] placeholder:text-[var(--muted)]', 
          error && 'border-[#FF334F] focus:border-[#FF334F] focus:ring-[#FF334F]/20', 
          className
        )} 
        {...props} 
      />
      {error && <span className='text-xs text-[#FF334F]'>{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
