import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
}

export function Logo({ className, size = 'md', withText = true }: LogoProps) {
  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 58,
    xl: 104,
  };

  const s = iconSizes[size];

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -6, 0]
        }}
        transition={{
          scale: { type: "spring", stiffness: 320, damping: 22 },
          opacity: { duration: 0.4 },
          y: {
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }
        }}
        whileHover={{ scale: 1.06, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer filter drop-shadow-[0_0_16px_rgba(255,51,79,0.35)] shrink-0"
      >
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Squircle Container */}
          <rect x="4" y="4" width="92" height="92" rx="26" fill="#090A0C" stroke="#B83A43" strokeWidth="4.5" strokeOpacity="0.9"/>
          
          {/* Subtle Accent Glow Ring */}
          <rect x="7" y="7" width="86" height="86" rx="23" stroke="#FF334F" strokeWidth="1" strokeOpacity="0.25"/>

          {/* Nova 4-Point Financial Spark / Star */}
          <path 
            d="M50 18 C50 35 65 50 82 50 C65 50 50 65 50 82 C50 65 35 50 18 50 C35 50 50 35 50 18 Z" 
            fill="url(#nova-gradient)"
          />

          {/* Central Bright Core Diamond */}
          <path 
            d="M50 39 L61 50 L50 61 L39 50 Z" 
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Diagonal Growth Accent Rays */}
          <circle cx="68" cy="32" r="3" fill="#FF334F" />
          <circle cx="32" cy="68" r="2" fill="#FFB8BE" fillOpacity="0.8" />

          <defs>
            <linearGradient id="nova-gradient" x1="18" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF4D63"/>
              <stop offset="50%" stopColor="#FF334F"/>
              <stop offset="100%" stopColor="#B83A43"/>
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {withText && (
        <motion.div 
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          className={cn('font-headline font-bold tracking-tight text-[var(--text)] flex items-center leading-none', 
            size === 'sm' && 'text-xl',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-4xl',
            size === 'xl' && 'text-6xl',
          )}
        >
          <span>Nova</span>
          <span className="text-[#FF334F] ml-1.5 font-extrabold tracking-tighter">Plata</span>
        </motion.div>
      )}
    </div>
  );
}
