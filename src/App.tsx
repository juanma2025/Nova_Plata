import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';
import { AI } from './pages/AI';
import { Profile } from './pages/Profile';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Onboarding } from './pages/app/Onboarding';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

function AppRoot() {
  const { theme } = useAuthStore();
  
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Onboarding Route (Protected but isolated) */}
        <Route path="/app/onboarding" element={<Onboarding />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="movimientos" element={<Transactions />} />
          <Route path="presupuesto" element={<Budget />} />
          <Route path="metas" element={<Goals />} />
          <Route path="estadisticas" element={<Analytics />} />
          <Route path="nova-ia" element={<AI />} />
          <Route path="plata-ia" element={<Navigate to="/app/nova-ia" replace />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster 
        theme={theme === 'system' ? 'system' : theme} 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          },
          className: 'class',
        }}
      />
    </BrowserRouter>
  );
}

export default AppRoot;
