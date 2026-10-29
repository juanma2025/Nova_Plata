import { Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';

export function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      useStore.getState().fetchFinancialData();
    }
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.onboarding_completed === false) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="flex-1 md:ml-[250px] w-full md:w-[calc(100%-250px)] p-5 md:p-[30px] pb-[90px] md:pb-[30px] max-w-[1700px] mx-auto animate-fade-in">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
