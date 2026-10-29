import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function PublicNavbar() {
  const { theme, setTheme, isAuthenticated } = useAuthStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-8'>
          <Link to='/' className='inline-block'>
            <Logo size="sm" />
          </Link>
          <nav className='hidden md:flex gap-6 text-sm font-medium'>
            <a href='#features' className='text-[var(--muted)] hover:text-[var(--text)] transition-colors'>Características</a>
            <a href='#ia' className='text-[var(--muted)] hover:text-[var(--text)] transition-colors'>Nova IA</a>
          </nav>
        </div>
        <div className='flex items-center gap-3'>
          <button 
            onClick={toggleTheme} 
            className='p-2 rounded-xl hover:bg-[var(--panel2)] transition-colors text-[var(--muted)] hover:text-[var(--text)]'
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={18} className="text-[#B83A43] transition-transform hover:-rotate-12" />
            )}
          </button>
          {isAuthenticated ? (
            <Link to='/app'><Button variant="primary" neon={true}>Ir a mi panel</Button></Link>
          ) : (
            <>
              <Link to='/login'><Button variant='ghost'>Iniciar sesión</Button></Link>
              <Link to='/register'><Button variant="primary" neon={true}>Crear cuenta</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
