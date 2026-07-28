import { create } from 'zustand';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

const initialUser: User = {
  id: 'USR-ADMIN-01',
  schoolId: 'SCH-SPRINGFIELD-01',
  name: 'Malik',
  email: 'malik@springfield.edu',
  role: 'SUPER_ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: 'jwt_mock_token_super_admin_2026',
  isAuthenticated: true,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));
