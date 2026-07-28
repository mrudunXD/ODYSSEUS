import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
          {isAuthenticated && <Navbar />}

          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/dashboard"
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/students"
                element={isAuthenticated ? <Students /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/students/:id"
                element={isAuthenticated ? <StudentDetail /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/fees"
                element={isAuthenticated ? <Fees /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/invoices"
                element={isAuthenticated ? <Invoices /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/payments"
                element={isAuthenticated ? <Payments /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/defaulters"
                element={isAuthenticated ? <Defaulters /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/reports"
                element={isAuthenticated ? <Reports /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/users"
                element={isAuthenticated ? <Users /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/settings"
                element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/parent-portal"
                element={isAuthenticated ? <ParentPortal /> : <Navigate to="/login" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
