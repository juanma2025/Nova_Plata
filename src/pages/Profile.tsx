import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/api';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  Landmark, 
  Sparkles, 
  Bell, 
  Camera, 
  CheckCircle2, 
  Lock, 
  Laptop, 
  Smartphone, 
  Check, 
  RotateCcw,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  LogOut
} from 'lucide-react';
import type { ActiveSession } from '../types';

export function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active tab state: 'personal' | 'accounts' | 'ai' | 'notifications'
  const [activeTab, setActiveTab] = useState<'personal' | 'accounts' | 'ai' | 'notifications'>('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized from user or defaults
  const [formData, setFormData] = useState({
    name: user?.name || 'Mateo Silva Restrepo',
    email: user?.email || 'mateo.silva@platafinance.io',
    phone: user?.phone || '310 845 9210',
    phone_prefix: user?.phone_prefix || '+57',
    document_id: user?.document_id || 'CC 1.020.482.910',
    occupation: user?.occupation || 'Senior Financial Engineer & Angel Investor',
    avatar_url: user?.avatar_url || '',
    currency: user?.currency || 'COP - Peso Colombiano',
    tax_regime: user?.tax_regime || 'Persona Natural - Declarante',
    anomaly_alert_threshold: user?.anomaly_alert_threshold || 2000000,
    ai_copilot_proactive: user?.ai_copilot_proactive ?? true,
    ai_weekly_audit: user?.ai_weekly_audit ?? true,
    ai_subscription_detection: user?.ai_subscription_detection ?? true,
    ai_risk_profile: (user?.ai_risk_profile || 'Moderado') as 'Conservador' | 'Moderado' | 'Agresivo',
  });

  // Active Sessions State
  const [sessions, setSessions] = useState<ActiveSession[]>(user?.sessions || [
    {
      id: 'sess-1',
      device: 'MacBook Pro 16"',
      type: 'laptop',
      location: 'Bogotá · 186.28.12.94',
      ip: '186.28.12.94',
      lastActive: 'Actual',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro',
      type: 'mobile',
      location: 'Bogotá · Hace 25m',
      ip: '186.28.14.12',
      lastActive: 'Hace 25m',
      isCurrent: false,
    },
  ]);

  // Connected accounts mock state for Cuentas Contables tab
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: '1', name: 'Bancolombia Ahorros', number: '•••• 4921', balance: '$ 8.450.000', status: 'Sincronizado' },
    { id: '2', name: 'Nequi', number: '•••• 9210', balance: '$ 1.250.000', status: 'Sincronizado' },
    { id: '3', name: 'Nu Tarjeta de Crédito', number: '•••• 1042', balance: '-$ 620.000', status: 'Al día' },
  ]);

  // Notification preferences
  const [notifPreferences, setNotifPreferences] = useState({
    pushAlerts: true,
    emailWeekly: true,
    anomalySms: false,
    aiInsights: true,
  });

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, avatar_url: base64 }));
      toast.success('Foto cargada correctamente', {
        description: 'Recuerda hacer clic en "Guardar Cambios" para confirmar.',
      });
    };
    reader.readAsDataURL(file);
  };

  // Close Session handler
  const handleCloseSession = (sessionId: string, deviceName: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success(`Sesión cerrada en ${deviceName}`, {
      description: 'El dispositivo requerirá autenticación para volver a ingresar.',
    });
  };

  // Save changes to store and backend
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        avatar_url: formData.avatar_url,
        phone: formData.phone.trim(),
        phone_prefix: formData.phone_prefix,
        document_id: formData.document_id.trim(),
        occupation: formData.occupation.trim(),
        currency: formData.currency,
        tax_regime: formData.tax_regime,
        anomaly_alert_threshold: Number(formData.anomaly_alert_threshold) || 2000000,
        ai_copilot_proactive: formData.ai_copilot_proactive,
        ai_weekly_audit: formData.ai_weekly_audit,
        ai_subscription_detection: formData.ai_subscription_detection,
        ai_risk_profile: formData.ai_risk_profile,
        sessions: sessions,
      };

      // Call backend API
      await authService.patch('/user/profile', payload);

      // Compute initials
      const newInitials = (formData.name.split(' ').map(n => n[0]).join('').substring(0, 2)).toUpperCase() || 'MS';

      // Update Zustand Auth Store (persisted to localStorage)
      updateUser({ ...payload, initials: newInitials });

      toast.success('Cambios guardados con éxito', {
        description: 'Tu perfil y parámetros del motor algorítmico han sido actualizados.',
      });
    } catch {
      // Offline / fallback save
      const newInitials = (formData.name.split(' ').map(n => n[0]).join('').substring(0, 2)).toUpperCase() || 'MS';
      updateUser({
        name: formData.name.trim(),
        avatar_url: formData.avatar_url,
        phone: formData.phone.trim(),
        phone_prefix: formData.phone_prefix,
        document_id: formData.document_id.trim(),
        occupation: formData.occupation.trim(),
        currency: formData.currency,
        tax_regime: formData.tax_regime,
        anomaly_alert_threshold: Number(formData.anomaly_alert_threshold) || 2000000,
        ai_copilot_proactive: formData.ai_copilot_proactive,
        ai_weekly_audit: formData.ai_weekly_audit,
        ai_subscription_detection: formData.ai_subscription_detection,
        ai_risk_profile: formData.ai_risk_profile,
        sessions: sessions,
        initials: newInitials,
      });
      toast.success('Perfil actualizado localmente');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setFormData({
      name: user?.name || 'Mateo Silva Restrepo',
      email: user?.email || 'mateo.silva@platafinance.io',
      phone: user?.phone || '310 845 9210',
      phone_prefix: user?.phone_prefix || '+57',
      document_id: user?.document_id || 'CC 1.020.482.910',
      occupation: user?.occupation || 'Senior Financial Engineer & Angel Investor',
      avatar_url: user?.avatar_url || '',
      currency: user?.currency || 'COP - Peso Colombiano',
      tax_regime: user?.tax_regime || 'Persona Natural - Declarante',
      anomaly_alert_threshold: user?.anomaly_alert_threshold || 2000000,
      ai_copilot_proactive: user?.ai_copilot_proactive ?? true,
      ai_weekly_audit: user?.ai_weekly_audit ?? true,
      ai_subscription_detection: user?.ai_subscription_detection ?? true,
      ai_risk_profile: (user?.ai_risk_profile || 'Moderado') as 'Conservador' | 'Moderado' | 'Agresivo',
    });
    toast.info('Cambios descartados');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Sesión cerrada correctamente');
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'Conservador': return 'Conservador (Preservación)';
      case 'Moderado': return 'Moderado (Crecimiento)';
      case 'Agresivo': return 'Agresivo (Rendimiento Alto)';
      default: return 'Moderado';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--muted)] mb-1 flex items-center gap-1.5">
            <span>CONFIGURACIÓN</span>
            <span>/</span>
            <span className="text-[#FF334F]">PERFIL INSTITUCIONAL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-[var(--text)] tracking-tight">
            Perfil y Configuración
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Administra tu identidad patrimonial, seguridad biométrica y parámetros del motor algorítmico.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleDiscard}
            className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Descartar
          </button>
          <button 
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="btn-crimson neon-btn py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg"
          >
            <Check size={14} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-[#FF334F] text-white shadow-md shadow-[#FF334F]/20'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)]'
          }`}
        >
          <UserIcon size={15} /> Perfil Personal
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-[#FF334F] text-white shadow-md shadow-[#FF334F]/20'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)]'
          }`}
        >
          <Landmark size={15} /> Cuentas Contables
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-[#FF334F] text-white shadow-md shadow-[#FF334F]/20'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)]'
          }`}
        >
          <Sparkles size={15} /> Preferencias IA
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#FF334F] text-white shadow-md shadow-[#FF334F]/20'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)]'
          }`}
        >
          <Bell size={15} /> Notificaciones
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-5 items-start">
        
        {/* LEFT COLUMN: Identity Card & Active Sessions */}
        <div className="flex flex-col gap-4">
          
          {/* Card: Identidad y Foto de Perfil */}
          <Card neon={true} stagger={0} className="p-5 flex flex-col items-center text-center">
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Avatar with Camera Overlay */}
            <div className="relative group cursor-pointer mt-2 mb-4" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#FF334F]/40 shadow-xl bg-[var(--panel2)] relative flex items-center justify-center">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt={formData.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1E1F24] via-[#2A181C] to-[#121316] flex items-center justify-center text-3xl font-headline font-bold text-[#FF334F]">
                    {formData.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={22} className="text-white" />
                </div>
              </div>

              {/* Camera Icon Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute -bottom-2 -right-2 p-2 bg-[#FF334F] text-white rounded-xl shadow-lg hover:bg-[#E02640] transition-transform hover:scale-110 active:scale-95"
                title="Cambiar foto de perfil"
              >
                <Camera size={14} />
              </button>
            </div>

            <h2 className="font-headline text-lg font-bold text-[var(--text)] tracking-tight">
              {formData.name}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5 break-all">
              {formData.email}
            </p>

            {/* Verification Pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#FF334F] bg-[#FF334F]/10 border border-[#FF334F]/30 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF334F] animate-pulse" />
              PLAN PREMIUM • VERIFICADO
            </div>

            {/* Client ID & KYC Stats */}
            <div className="grid grid-cols-2 gap-3 w-full mt-5 pt-4 border-t border-[var(--border)] text-left">
              <div className="bg-[var(--panel2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-[var(--muted)]">ID CLIENTE</div>
                <div className="font-mono text-xs font-bold text-[var(--text)] mt-0.5">
                  {user?.id ? `NP-${user.id.substring(0, 6).toUpperCase()}` : 'NP-8942-X'}
                </div>
              </div>
              <div className="bg-[var(--panel2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-[var(--muted)]">VALIDACIÓN KYC</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Nivel 3
                </div>
              </div>
            </div>

            {/* Profile Completion Bar */}
            <div className="w-full mt-4 text-left">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[var(--muted)] font-medium text-[11px]">Completitud del perfil</span>
                <span className="font-headline font-bold text-[#FF334F] text-[11px]">95%</span>
              </div>
              <div className="h-1.5 bg-[var(--track)] rounded-full overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-gradient-to-r from-[#B83A43] via-[#FF334F] to-[#FFB8BE] rounded-full w-[95%]" />
              </div>
            </div>

            {/* Cerrar Sesión Button */}
            <div className="w-full mt-4 pt-3.5 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl border border-[#FF334F]/30 bg-[#FF334F]/10 text-[#FF334F] hover:bg-[#FF334F]/20 hover:border-[#FF334F]/50 transition-all text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </Card>

          {/* Card: Sesiones Activas */}
          <Card neon={true} stagger={1} className="p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#FF334F]" />
                <h3 className="font-headline font-bold text-sm text-[var(--text)]">Sesiones Activas</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {sessions.length} activas
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {sessions.map((sess) => (
                <div 
                  key={sess.id}
                  className="p-3 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] shrink-0">
                      {sess.type === 'laptop' ? <Laptop size={16} /> : <Smartphone size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text)] truncate">{sess.device}</div>
                      <div className="text-[10px] text-[var(--muted)] truncate">{sess.location}</div>
                    </div>
                  </div>

                  {sess.isCurrent ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF334F]/15 text-[#FF334F] shrink-0">
                      Actual
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCloseSession(sess.id, sess.device)}
                      className="text-[11px] font-semibold text-[var(--muted)] hover:text-[#FF334F] transition-colors px-2 py-1 rounded-lg hover:bg-[#FF334F]/10 shrink-0"
                    >
                      Cerrar
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => {
                setSessions(prev => prev.filter(s => s.isCurrent));
                toast.success('Todas las demás sesiones han sido cerradas.');
              }}
              className="w-full mt-3.5 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)] rounded-xl transition-all border border-[var(--border)]"
            >
              Cerrar todas las demás sesiones
            </button>
          </Card>
        </div>

        {/* RIGHT COLUMN: Form Sections */}
        <div className="flex flex-col gap-5">
          
          {activeTab === 'personal' && (
            <>
              {/* SECTION 1: Datos Personales */}
              <Card neon={true} stagger={0} className="p-6">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-[#FF334F]" />
                    <h3 className="font-headline font-bold text-sm text-[var(--text)]">Datos Personales</h3>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    Sincronizado DIAN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre Completo */}
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full font-medium"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Correo Electrónico</label>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verificado
                      </span>
                    </div>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="input-field w-full opacity-80 cursor-not-allowed bg-[var(--panel2)]"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Teléfono</label>
                    <div className="flex gap-2">
                      <select 
                        value={formData.phone_prefix}
                        onChange={e => setFormData({ ...formData, phone_prefix: e.target.value })}
                        className="input-field w-[80px] shrink-0 text-xs font-mono font-semibold"
                      >
                        <option value="+57">co +57</option>
                        <option value="+1">us +1</option>
                        <option value="+34">es +34</option>
                        <option value="+52">mx +52</option>
                      </select>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field flex-1 font-mono"
                        placeholder="310 845 9210"
                      />
                    </div>
                  </div>

                  {/* Documento de Identidad */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Documento de Identidad</label>
                      <span className="text-[10px] text-[var(--muted)] font-medium flex items-center gap-1">
                        Biometría OK <Lock size={10} className="text-[#FF334F]" />
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.document_id}
                        onChange={e => setFormData({ ...formData, document_id: e.target.value })}
                        className="input-field w-full font-mono pr-8"
                        placeholder="CC 1.020.482.910"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    </div>
                  </div>

                  {/* Ocupación / Rol Profesional */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Ocupación / Rol Profesional</label>
                    <input 
                      type="text" 
                      value={formData.occupation}
                      onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                      className="input-field w-full"
                      placeholder="Senior Financial Engineer & Angel Investor"
                    />
                  </div>
                </div>
              </Card>

              {/* SECTION 2: Preferencias Financieras */}
              <Card neon={true} stagger={1} className="p-6">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#FF334F]" />
                    <h3 className="font-headline font-bold text-sm text-[var(--text)]">Preferencias Financieras</h3>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    Liquidación y Alertas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Moneda Base */}
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Moneda Base</label>
                    <select 
                      value={formData.currency}
                      onChange={e => setFormData({ ...formData, currency: e.target.value })}
                      className="input-field w-full text-xs font-medium"
                    >
                      <option value="COP - Peso Colombiano">COP - Peso Colombiano</option>
                      <option value="USD - Dólar Estadounidense">USD - Dólar Estadounidense</option>
                      <option value="EUR - Euro">EUR - Euro</option>
                    </select>
                  </div>

                  {/* Régimen Tributario */}
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Régimen Tributario</label>
                    <select 
                      value={formData.tax_regime}
                      onChange={e => setFormData({ ...formData, tax_regime: e.target.value })}
                      className="input-field w-full text-xs font-medium"
                    >
                      <option value="Persona Natural - Declarante">Persona Natural - Declarante</option>
                      <option value="Persona Natural - No Declarante">Persona Natural - No Declarante</option>
                      <option value="Persona Jurídica - Régimen Simple">Persona Jurídica - Régimen Simple</option>
                    </select>
                  </div>

                  {/* Alerta Gasto Anómalo */}
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium mb-1.5 block">Alerta Gasto Anómalo</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.anomaly_alert_threshold}
                        onChange={e => setFormData({ ...formData, anomaly_alert_threshold: Number(e.target.value) })}
                        className="input-field w-full font-mono text-xs font-bold text-[var(--text)]"
                        placeholder="2000000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)]">
                        COP
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* SECTION 3: Motor Nova IA */}
              <Card neon={true} stagger={2} className="p-6">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FF334F]" />
                    <h3 className="font-headline font-bold text-sm text-[var(--text)]">Motor Nova IA</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF334F]/10 text-[#FF334F] border border-[#FF334F]/20">
                    • v3.2 QUANT • 42ms
                  </span>
                </div>

                {/* 3 Switches */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Copilot Proactivo */}
                  <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[var(--text)]">Copilot Proactivo</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Simulación de liquidez</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ai_copilot_proactive: !formData.ai_copilot_proactive })}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        formData.ai_copilot_proactive ? 'bg-[#FF334F]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.ai_copilot_proactive ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Auditoría Semanal */}
                  <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[var(--text)]">Auditoría Semanal</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Resumen cada lunes</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ai_weekly_audit: !formData.ai_weekly_audit })}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        formData.ai_weekly_audit ? 'bg-[#FF334F]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.ai_weekly_audit ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Detección de Suscripciones */}
                  <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[var(--text)]">Detección de Suscripciones</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Alerta cobros recurrentes</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ai_subscription_detection: !formData.ai_subscription_detection })}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        formData.ai_subscription_detection ? 'bg-[#FF334F]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.ai_subscription_detection ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Perfil de Riesgo para Sugerencias */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs text-[var(--muted)] font-medium">Perfil de Riesgo para Sugerencias</label>
                    <span className="text-xs font-bold text-[#FF334F]">
                      {getRiskLabel(formData.ai_risk_profile)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[var(--panel2)] p-1 rounded-xl border border-[var(--border)]">
                    {(['Conservador', 'Moderado', 'Agresivo'] as const).map((risk) => (
                      <button
                        key={risk}
                        type="button"
                        onClick={() => setFormData({ ...formData, ai_risk_profile: risk })}
                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                          formData.ai_risk_profile === risk
                            ? 'bg-[#FF334F] text-white shadow-md shadow-[#FF334F]/30'
                            : 'text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: Cuentas Contables */}
          {activeTab === 'accounts' && (
            <Card neon={true} className="p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-headline font-bold text-base text-[var(--text)]">Cuentas Contables y Bancos</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Entidades financieras vinculadas con conciliación en tiempo real</p>
                </div>
                <button 
                  onClick={() => toast.info('Integración Open Banking activa para entidades colombianas.')}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Plus size={14} /> Vincular cuenta
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {connectedAccounts.map((acc) => (
                  <div key={acc.id} className="p-4 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF334F]/10 text-[#FF334F] flex items-center justify-center font-bold">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--text)]">{acc.name}</div>
                        <div className="text-xs text-[var(--muted)] font-mono">{acc.number} · {acc.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-headline font-bold text-sm text-[var(--text)]">{acc.balance}</div>
                      <button 
                        onClick={() => {
                          setConnectedAccounts(prev => prev.filter(a => a.id !== acc.id));
                          toast.success(`Cuenta ${acc.name} desvinculada`);
                        }}
                        className="text-[11px] text-[var(--muted)] hover:text-[#FF334F] transition-colors mt-1"
                      >
                        Desconectar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Preferencias IA */}
          {activeTab === 'ai' && (
            <Card neon={true} className="p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-headline font-bold text-base text-[var(--text)]">Parámetros de Nova IA</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Configuración de análisis predictivo, memoria FIFO y modelo neuronal</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Gemini 2.5 Activo
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--panel2)] border border-[var(--border)]">
                  <div className="font-bold text-sm text-[var(--text)] mb-1">Memoria de Conversación (FIFO)</div>
                  <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
                    Nova IA conserva hasta 15 mensajes en contexto activo, descartando de forma automática los más antiguos para proteger tu privacidad y mantener alta velocidad de respuesta.
                  </p>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('nova_ia_chat_history');
                      toast.success('Memoria de Nova IA liberada');
                    }}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-[#FF334F] hover:bg-[#FF334F]/10 border-[#FF334F]/20"
                  >
                    <Trash2 size={13} /> Vaciar memoria de contexto
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[var(--panel2)] border border-[var(--border)]">
                  <div className="font-bold text-sm text-[var(--text)] mb-1">Modo de Aprendizaje de Gastos</div>
                  <p className="text-xs text-[var(--muted)]">Analiza gastos recurrentes y genera proyecciones automáticas cada fin de mes.</p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: Notificaciones */}
          {activeTab === 'notifications' && (
            <Card neon={true} className="p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-headline font-bold text-base text-[var(--text)]">Canales de Notificación y Alertas</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Decide cómo y cuándo recibir reportes de gastos y recomendaciones</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">Alertas Push en Navegador</div>
                    <div className="text-[10px] text-[var(--muted)]">Notificaciones instantáneas de movimientos</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifPreferences(p => ({ ...p, pushAlerts: !p.pushAlerts }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notifPreferences.pushAlerts ? 'bg-[#FF334F]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifPreferences.pushAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">Resumen Semanal por Correo</div>
                    <div className="text-[10px] text-[var(--muted)]">Estado financiero consolidado cada lunes</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifPreferences(p => ({ ...p, emailWeekly: !p.emailWeekly }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notifPreferences.emailWeekly ? 'bg-[#FF334F]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifPreferences.emailWeekly ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--panel2)] border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">Alertas de Gastos Anómalos por SMS</div>
                    <div className="text-[10px] text-[var(--muted)]">Mensajes de texto urgentes si se detecta un cobro fuera de rango</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifPreferences(p => ({ ...p, anomalySms: !p.anomalySms }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notifPreferences.anomalySms ? 'bg-[#FF334F]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifPreferences.anomalySms ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
