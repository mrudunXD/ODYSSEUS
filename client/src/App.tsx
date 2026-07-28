import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { Fees } from './pages/Fees';
import { Invoices } from './pages/Invoices';
import { Payments } from './pages/Payments';
import { Defaulters } from './pages/Defaulters';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { ParentPortal } from './pages/ParentPortal';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

// Route guard for any authenticated user
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

// Route guard: only admin roles (blocks PARENT)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role === 'PARENT') return <Navigate to="/parent-portal" replace />;
  return <>{children}</>;
};

// Route guard: only PARENT
const ParentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role !== 'PARENT') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Role-based home redirect
const RoleBasedHome: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'PARENT') return <Navigate to="/parent-portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppShell: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Don't show navbar on landing or login pages
  const hideNavbar = ['/', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
      {isAuthenticated && !hideNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === 'PARENT' ? <Navigate to="/parent-portal" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Admin Roles only */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
        <Route path="/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
        <Route path="/fees" element={<AdminRoute><Fees /></AdminRoute>} />
        <Route path="/invoices" element={<AdminRoute><Invoices /></AdminRoute>} />
        <Route path="/payments" element={<AdminRoute><Payments /></AdminRoute>} />
        <Route path="/defaulters" element={<AdminRoute><Defaulters /></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />

        {/* Parent only */}
        <Route path="/parent-portal" element={<ParentRoute><ParentPortal /></ParentRoute>} />

        {/* Authenticated any role */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<RoleBasedHome />} />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
