import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { authService } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.post('/auth/login', { email, password });
      
      if (response.success) {
        const { user: authUser, session } = response.data;
        
        // Save token (if you have token management, else handled by cookies/localStorage)
        if (session?.access_token) {
          localStorage.setItem('access_token', session.access_token);
        }

        // Fetch full profile to get onboarding data
        const profileRes = await authService.get('/user/profile');
        if (profileRes.success) {
          const profile = profileRes.data;
          login({ 
            id: authUser.id,
            name: profile.name || authUser.name || 'Usuario', 
            email: authUser.email, 
            initials: (profile.name || authUser.name || 'U').substring(0, 2).toUpperCase(),
            ...profile
          });
        } else {
          login({ id: authUser.id, name: authUser.name, email: authUser.email, initials: authUser.name?.substring(0,2).toUpperCase() || 'US' });
        }
        
        toast.success('Bienvenido de nuevo');
        navigate('/app');
      } else {
        toast.error(response.error || 'Credenciales inválidas');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <h2 className="font-headline text-3xl font-bold mb-2 text-[var(--text)]">Iniciar sesión</h2>
      <p className="text-[var(--muted)] mb-8">Ingresa tus credenciales para acceder a tu cuenta.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="Correo electrónico" 
          type="email" 
          placeholder="juan@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center px-1">
            <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
              <input type="checkbox" className="accent-[#B83A43]" />
              Recordarme
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-[#B83A43] dark:text-[#FFB8BE] hover:text-[#FF334F] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        
        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Entrar a mi cuenta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        ¿No tienes una cuenta? <Link to="/register" className="text-[#B83A43] dark:text-[#FFB8BE] hover:text-[#FF334F] font-medium hover:underline">Regístrate gratis</Link>
      </p>
    </div>
  );
}
