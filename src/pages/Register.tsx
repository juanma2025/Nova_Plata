import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { authService } from '../services/api';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.post('/auth/register', { name, email, password });

      if (response.success) {
        const { user: authUser, session } = response.data;

        if (session?.access_token) {
          localStorage.setItem('access_token', session.access_token);
        }

        // On register, onboarding_completed is false by default
        login({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          initials: authUser.name?.substring(0, 2).toUpperCase() || 'US',
          onboarding_completed: false
        });

        toast.success('Cuenta creada exitosamente');
        navigate('/app/onboarding');
      } else {
        toast.error(response.error || 'Error al crear la cuenta');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <h2 className="font-headline text-3xl font-bold mb-2 text-[var(--text)]">Crear cuenta</h2>
      <p className="text-[var(--muted)] mb-8">Únete a Nova Plata y toma el control de tus finanzas.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Nombre completo"
          placeholder="Nombre de usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-[var(--muted)] mt-1.5 ml-1">
            Mínimo 8 caracteres (al menos 1 mayúscula, 1 minúscula y 1 número).
          </p>
        </div>

        <Button type="submit" variant="primary" neon={true} className="w-full mt-4" isLoading={isLoading}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        ¿Ya tienes una cuenta? <Link to="/login" className="text-[#B83A43] dark:text-[#FFB8BE] hover:text-[#FF334F] font-medium hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
