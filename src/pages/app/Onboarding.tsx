import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { DollarSign, Wallet, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/api';

const STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Nova Plata!',
    subtitle: 'Para personalizar tu experiencia, necesitamos conocer un poco sobre tus finanzas.',
    icon: <Logo size="lg" withText={false} />,
  },
  {
    id: 'income',
    title: 'Tus Ingresos',
    subtitle: '¿Cuánto ganas aproximadamente al mes y de dónde provienen?',
    icon: <DollarSign className="w-12 h-12 text-[var(--primary)]" />,
  },
  {
    id: 'expenses',
    title: 'Tus Gastos',
    subtitle: '¿Cuánto sueles gastar al mes y en qué categorías?',
    icon: <Wallet className="w-12 h-12 text-[var(--primary)]" />,
  },
  {
    id: 'goals',
    title: 'Tus Metas',
    subtitle: 'Define tu presupuesto mensual y tu objetivo de ahorro.',
    icon: <Target className="w-12 h-12 text-[var(--primary)]" />,
  }
];

const CATEGORIES = ['Alimentación', 'Vivienda', 'Transporte', 'Educación', 'Ocio', 'Salud', 'Ahorro', 'Deudas', 'Otros'];
const INCOME_SOURCES = ['Salario', 'Freelance', 'Negocio propio', 'Inversiones', 'Otros'];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    monthly_income: '',
    main_income_source: '',
    approximate_monthly_expenses: '',
    main_expense_categories: [] as string[],
    monthly_budget: '',
    savings_goal: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.onboarding_completed) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      main_expense_categories: prev.main_expense_categories.includes(cat)
        ? prev.main_expense_categories.filter(c => c !== cat)
        : [...prev.main_expense_categories, cat]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        monthly_income: Number(formData.monthly_income),
        main_income_source: formData.main_income_source,
        approximate_monthly_expenses: Number(formData.approximate_monthly_expenses),
        main_expense_categories: formData.main_expense_categories,
        monthly_budget: Number(formData.monthly_budget),
        savings_goal: Number(formData.savings_goal)
      };

      const response = await authService.post('/user/onboarding', payload);
      
      if (response.success) {
        updateUser({ ...payload, onboarding_completed: true });
        navigate('/app');
      } else {
        setError(response.error || 'Error al guardar la configuración');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    if (STEPS[currentStep].id === 'income') {
      return formData.monthly_income && formData.main_income_source;
    }
    if (STEPS[currentStep].id === 'expenses') {
      return formData.approximate_monthly_expenses && formData.main_expense_categories.length > 0;
    }
    if (STEPS[currentStep].id === 'goals') {
      return formData.monthly_budget && formData.savings_goal;
    }
    return true; // welcome
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-[#FF334F]' : 'bg-[var(--track)]'}`} 
            />
          ))}
        </div>

        <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col font-sans transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-4 p-4 bg-[var(--panel2)] border border-[var(--border)] rounded-full">
                  {STEPS[currentStep].icon}
                </div>
                <h1 className="font-headline text-2xl font-bold mb-2 text-[var(--text)]">{STEPS[currentStep].title}</h1>
                <p className="text-[var(--muted)] text-sm">{STEPS[currentStep].subtitle}</p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                {STEPS[currentStep].id === 'welcome' && (
                  <div className="text-center text-[var(--muted)]">
                    <p className="mb-4">Hola {user?.name},</p>
                    <p>Esta configuración tomará menos de 2 minutos y nos ayudará a crear un tablero financiero adaptado completamente a ti.</p>
                  </div>
                )}

                {STEPS[currentStep].id === 'income' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text)]">Ingreso mensual aproximado ($)</label>
                      <input 
                        type="number" 
                        value={formData.monthly_income}
                        onChange={e => setFormData({...formData, monthly_income: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                        placeholder="Ej. 2000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--text)]">Fuente principal</label>
                      <div className="grid grid-cols-2 gap-2">
                        {INCOME_SOURCES.map(source => (
                          <button
                            key={source}
                            onClick={() => setFormData({...formData, main_income_source: source})}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                              formData.main_income_source === source 
                                ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)]'
                            }`}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {STEPS[currentStep].id === 'expenses' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text)]">Gasto mensual aproximado ($)</label>
                      <input 
                        type="number" 
                        value={formData.approximate_monthly_expenses}
                        onChange={e => setFormData({...formData, approximate_monthly_expenses: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                        placeholder="Ej. 1200000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--text)]">Principales categorías de gasto</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1 text-sm rounded-full border transition-all ${
                              formData.main_expense_categories.includes(cat)
                                ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {STEPS[currentStep].id === 'goals' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text)]">Presupuesto límite mensual ($)</label>
                      <input 
                        type="number" 
                        value={formData.monthly_budget}
                        onChange={e => setFormData({...formData, monthly_budget: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                        placeholder="Ej. 1500000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text)]">Objetivo de ahorro mensual ($)</label>
                      <input 
                        type="number" 
                        value={formData.savings_goal}
                        onChange={e => setFormData({...formData, savings_goal: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                        placeholder="Ej. 500000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} disabled={isLoading} className="px-3">
                <ChevronLeft size={20} />
              </Button>
            )}
            <Button 
              className="flex-1" 
              onClick={handleNext} 
              disabled={!isStepValid() || isLoading}
            >
              {isLoading ? 'Guardando...' : currentStep === STEPS.length - 1 ? 'Finalizar' : 'Continuar'}
              {currentStep < STEPS.length - 1 && <ChevronRight size={18} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
