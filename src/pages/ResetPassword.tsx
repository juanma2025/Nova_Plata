import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { authService } from '../services/api';
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Clear any stale login session when in password recovery mode
    useAuthStore.getState().logout();

    // 1. Check query parameters
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);

    const tokenParam = searchParams.get('token');
    if (tokenParam) setToken(tokenParam);

    // 2. Check hash fragments from Supabase recovery link (#access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))));
            if (decoded.email) {
              setEmail(decoded.email);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, ingresa el correo de tu cuenta');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { password };
      if (email) payload.email = email;
      if (token) payload.token = token;

      // Pass token in headers if present
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await authService.post('/auth/reset-password', payload, { headers });

      if (response.success) {
        localStorage.removeItem('access_token');
        setIsSuccess(true);
        toast.success('¡Contraseña restablecida con éxito!', {
          description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
        });
      } else {
        toast.error(response.error || 'Error al restablecer la contraseña');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {!isSuccess ? (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[#FF334F]/10 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-5">
            <Lock size={24} />
          </div>

          <h2 className="font-headline text-3xl font-bold mb-2 text-[var(--text)]">Nueva contraseña</h2>
          <p className="text-[var(--muted)] mb-8 text-sm leading-relaxed">
            Ingresa tu nueva contraseña para proteger tu cuenta de Nova Plata.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-medium mb-1 block">Correo de tu cuenta</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="input-field w-full bg-[var(--panel2)] font-mono text-xs"
              />
            </div>

            <div>
              <div className="relative">
                <Input 
                  label="Nueva contraseña" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1.5 ml-1">
                Mínimo 6 caracteres.
              </p>
            </div>

            <div>
              <Input 
                label="Confirmar nueva contraseña" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" neon={true} className="w-full mt-3" isLoading={isLoading}>
              Actualizar contraseña
            </Button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-3 items-center">
            <Link 
              to="/login" 
              onClick={() => useAuthStore.getState().logout()}
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Cancelar y volver al inicio de sesión
            </Link>
            <Link 
              to="/" 
              onClick={() => useAuthStore.getState().logout()}
              className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors opacity-75"
            >
              Volver a la página principal
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={36} />
          </div>

          <h2 className="font-headline text-2xl font-bold mb-2 text-[var(--text)]">¡Contraseña actualizada!</h2>
          <p className="text-[var(--muted)] mb-8 text-sm leading-relaxed">
            Tu contraseña ha sido actualizada correctamente en el sistema de seguridad de Nova Plata.
          </p>

          <Button 
            type="button" 
            variant="primary" 
            neon={true}
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Iniciar sesión con nueva contraseña
          </Button>
        </div>
      )}
    </div>
  );
}
