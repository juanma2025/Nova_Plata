import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { authService } from '../services/api';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.post('/auth/forgot-password', { email });
      if (response.success) {
        setIsSubmitted(true);
        toast.success('Solicitud enviada', {
          description: 'Si el correo está registrado, recibirás un enlace de recuperación.',
        });
      } else {
        toast.error(response.error || 'Error al solicitar recuperación');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {!isSubmitted ? (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[#FF334F]/10 text-[#FF334F] border border-[#FF334F]/20 flex items-center justify-center mb-5">
            <KeyRound size={24} />
          </div>

          <h2 className="font-headline text-3xl font-bold mb-2 text-[var(--text)]">Recuperar contraseña</h2>
          <p className="text-[var(--muted)] mb-8 text-sm leading-relaxed">
            Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer el acceso a tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              label="Correo electrónico" 
              type="email" 
              placeholder="juan@email.com" 
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" variant="primary" neon={true} className="w-full mt-2" isLoading={isLoading}>
              Enviar enlace de recuperación
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Volver a iniciar sesión
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="font-headline text-2xl font-bold mb-2 text-[var(--text)]">¡Correo enviado!</h2>
          <p className="text-[var(--muted)] mb-6 text-sm leading-relaxed">
            Hemos enviado un enlace de recuperación a <strong className="text-[var(--text)]">{email}</strong>. Revisa tu bandeja de entrada o carpeta de spam.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              type="button" 
              variant="primary" 
              neon={true}
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full"
            >
              Continuar a restablecer contraseña
            </Button>

            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text)] font-medium transition-colors py-2"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
