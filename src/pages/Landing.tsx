import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, BarChart2, PieChart, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

export function Landing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)] to-[var(--panel2)] relative overflow-hidden transition-colors duration-300">
        {/* Ambient brand glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#B83A43]/10 dark:bg-[#B83A43]/15 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B83A43]/10 dark:bg-[#B83A43]/15 text-[#B83A43] dark:text-[#FFB8BE] border border-[#B83A43]/20 dark:border-[#B83A43]/30 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in z-10">
          <Zap size={14} className="text-[#FF334F]" />
          <span>El futuro de tus finanzas personales</span>
        </div>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-[var(--text)] z-10"
        >
          Controla tu dinero. Entiende tus hábitos. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF334F] to-[#B83A43] dark:to-[#FFB8BE]">Construye tus metas.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-2xl z-10"
        >
          Nova Plata es la plataforma financiera definitiva para gestionar tu presupuesto, rastrear gastos y planificar tu futuro con el poder de la Inteligencia Artificial.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 z-10"
        >
          {isAuthenticated ? (
            <Link to="/app">
              <Button variant="primary" neon={true} className="h-12 px-8 text-base font-semibold w-full sm:w-auto">Ir a mi panel <ArrowRight className="ml-2" size={18} /></Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button variant="primary" neon={true} className="h-12 px-8 text-base font-semibold w-full sm:w-auto">Comenzar ahora <ArrowRight className="ml-2" size={18} /></Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="h-12 px-8 text-base font-semibold w-full sm:w-auto">Iniciar sesión</Button>
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[var(--bg)] px-4 transition-colors duration-300">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-[var(--text)]">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-[var(--muted)] text-base max-w-xl mx-auto">Herramientas profesionales diseñadas para potenciar tu salud financiera con precisión.</p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 14 } }
              }}
              whileHover={{ scale: 1.02, y: -6 }}
              className="neon-border neon-stagger-0 p-8 rounded-3xl cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B83A43]/10 dark:bg-[#FFB8BE]/15 text-[#B83A43] dark:text-[#FFB8BE] border border-[#B83A43]/20 dark:border-[#FFB8BE]/20 flex items-center justify-center mb-6">
                <PieChart size={26} />
              </div>
              <h3 className="font-headline text-xl font-bold mb-3 text-[var(--text)]">Control de Presupuestos</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">Establece límites mensuales por categoría y recibe alertas cuando estés cerca de excederlos.</p>
            </motion.div>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 14 } }
              }}
              whileHover={{ scale: 1.02, y: -6 }}
              className="neon-border neon-stagger-1 p-8 rounded-3xl cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FF334F]/10 dark:bg-[#FF334F]/15 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-6">
                <Target size={26} />
              </div>
              <h3 className="font-headline text-xl font-bold mb-3 text-[var(--text)]">Metas de Ahorro</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">Define objetivos claros, separa el dinero virtualmente y observa cómo crece tu progreso mes a mes.</p>
            </motion.div>

            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 14 } }
              }}
              whileHover={{ scale: 1.02, y: -6 }}
              className="neon-border neon-stagger-2 p-8 rounded-3xl cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B83A43]/10 dark:bg-[#B83A43]/20 text-[#B83A43] dark:text-[#FFB8BE] border border-[#B83A43]/20 dark:border-[#B83A43]/30 flex items-center justify-center mb-6">
                <BarChart2 size={26} />
              </div>
              <h3 className="font-headline text-xl font-bold mb-3 text-[var(--text)]">Análisis Profundo</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">Visualiza tus hábitos con gráficos detallados, identifica gastos hormiga y proyecta tu futuro financiero.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
