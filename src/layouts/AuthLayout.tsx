import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from '../components/ui/Logo';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Visual side */}
      <div className="hidden md:flex flex-1 bg-[var(--panel2)] p-12 flex-col justify-between border-r border-[var(--border)] relative overflow-hidden">
        {/* Background ambient glow for less flatness */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B83A43]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF334F]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Link to="/" className="relative z-10 inline-block">
          <Logo size="sm" />
        </Link>
        
        <div className="relative z-10 flex flex-col items-start mt-[-10vh]">
          <div className="mb-10">
            <Logo size="xl" withText={false} />
          </div>
          <h1 className="font-headline text-5xl font-bold mb-6 leading-tight text-[var(--text)]">Empieza a controlar tu <br/>futuro financiero hoy.</h1>
          <p className="text-[var(--muted)] text-xl max-w-md leading-relaxed font-sans">Únete a miles de personas que han mejorado su relación con el dinero gracias a herramientas inteligentes.</p>
        </div>
        <div className="text-sm text-[var(--muted)] relative z-10 flex flex-col gap-1 font-sans">
          <span>© 2026 Nova Plata. Todos los derechos reservados.</span>
          <span>Versión 1.0.1</span>
        </div>
      </div>
      
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 animate-fade-in relative font-sans">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B83A43] via-[#FF334F] to-[#FFB8BE]" />
        <div className="w-full max-w-md">
          <div className="md:hidden mb-12 flex justify-center">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
