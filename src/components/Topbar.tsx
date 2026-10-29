import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, AlertCircle, CheckCircle2, Sparkles, X, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 5 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
  
  const firstName = name.split(' ')[0] || 'Usuario';
  return `${greeting}, ${firstName}`;
};

const getPageInfo = (pathname: string, userName: string) => {
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  
  switch (pathname) {
    case '/app': return { title: getGreeting(userName), eyebrow: currentDate };
    case '/app/movimientos': return { title: 'Movimientos', eyebrow: 'HISTORIAL' };
    case '/app/presupuesto': return { title: 'Presupuesto', eyebrow: 'CONTROL MENSUAL' };
    case '/app/metas': return { title: 'Mis metas', eyebrow: 'AHORRO' };
    case '/app/estadisticas': return { title: 'Estadísticas', eyebrow: 'ANÁLISIS' };
    case '/app/nova-ia':
    case '/app/plata-ia': return { title: '✦ Nova IA', eyebrow: 'ASISTENTE FINANCIERO' };
    case '/app/perfil': return { title: 'Mi perfil', eyebrow: 'CONFIGURACIÓN' };
    default: return { title: 'Nova Plata', eyebrow: 'BIENVENIDO' };
  }
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'success' | 'ai';
  read: boolean;
}

export function Topbar() {
  const { user, theme, setTheme } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { title, eyebrow } = getPageInfo(location.pathname, user?.name || '');

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Alerta de presupuesto',
      description: 'Has alcanzado el 70% de tu límite presupuestario estimado este mes.',
      time: 'Hace 2 horas',
      type: 'alert',
      read: false,
    },
    {
      id: '2',
      title: 'Meta de ahorro',
      description: '¡Buen momento para ahorrar! Revisa tus metas activas y agrega un nuevo aporte.',
      time: 'Ayer',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      title: 'Recomendación de Nova IA',
      description: 'Nova IA tiene un consejo para optimizar tus gastos de fin de mes.',
      time: 'Hace 2 días',
      type: 'ai',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <header className="flex flex-col md:flex-row justify-between md:items-center mb-7 gap-5 font-sans relative z-30">
      <div>
        <div className="text-[var(--muted)] text-[12px] mb-[4px] uppercase tracking-wider font-semibold font-sans">
          {eyebrow}
        </div>
        <h1 className="text-2xl md:text-[30px] font-headline font-bold tracking-tight text-[var(--text)]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Style guide search box */}
        <div className="relative hidden md:flex items-center">
          <Search size={16} className="absolute left-3.5 text-[var(--muted)] pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-[200px] lg:w-[260px] pl-9 pr-4 py-2 bg-[var(--panel)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all focus:border-[#B83A43] focus:ring-1 focus:ring-[#B83A43]/30 hover:border-[var(--muted)] shadow-sm"
          />
        </div>

        {/* Theme toggle switch with smooth transition */}
        <button 
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="btn-icon"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon size={18} className="text-[#B83A43] transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notification Bell with Badge & Interactive Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="btn-icon relative" 
            aria-label="Notificaciones"
            title="Ver notificaciones y alertas"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF334F] ring-2 ring-[var(--panel)] animate-pulse" />
            )}
          </button>

          {/* Floating Notification Card */}
          {isOpen && (
            <div className="absolute right-0 top-12 w-[340px] sm:w-[380px] bg-[var(--panel)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 text-[var(--text)] animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border)] mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-[var(--text)]">Notificaciones y alertas</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF334F]/15 text-[#FF334F]">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] text-[var(--muted)] hover:text-[#FF334F] transition-colors flex items-center gap-1 font-medium"
                  >
                    <Check size={12} /> Leídas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-[var(--muted)] text-xs">
                  No tienes notificaciones pendientes.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 rounded-xl border transition-all relative group flex gap-3 items-start ${
                        n.read 
                          ? 'bg-[var(--panel)] border-[var(--border)] opacity-75' 
                          : 'bg-[var(--panel2)] border-[#FF334F]/30 shadow-sm'
                      }`}
                    >
                      <div className="p-2 rounded-lg shrink-0 mt-0.5">
                        {n.type === 'alert' && (
                          <div className="text-[#FF334F] bg-[#FF334F]/10 p-1.5 rounded-lg">
                            <AlertCircle size={16} />
                          </div>
                        )}
                        {n.type === 'success' && (
                          <div className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        {n.type === 'ai' && (
                          <div className="text-[#FFB8BE] bg-[#B83A43]/20 p-1.5 rounded-lg">
                            <Sparkles size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-[var(--text)] truncate">{n.title}</h4>
                          <span className="text-[10px] text-[var(--muted)] shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                          {n.description}
                        </p>
                      </div>

                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--muted)] hover:text-[#FF334F]"
                        title="Eliminar notificación"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-[var(--border)] text-center">
                <button 
                  onClick={() => { setIsOpen(false); navigate('/app/nova-ia'); }}
                  className="text-xs text-[#FF334F] hover:underline font-semibold"
                >
                  Consultar copiloto Nova IA →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar pill adaptive to Light and Dark mode */}
        <button 
          onClick={() => navigate('/app/perfil')}
          className="w-[40px] h-[40px] rounded-xl grid place-items-center font-bold text-sm bg-[#B83A43] text-white dark:bg-[#FFB8BE] dark:text-[#3D0A10] transition-all hover:scale-105 active:scale-95 shadow-sm overflow-hidden"
          title="Ir a mi perfil"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user?.name || 'Perfil'} className="w-full h-full object-cover" />
          ) : (
            user?.initials || 'U'
          )}
        </button>
      </div>
    </header>
  );
}
