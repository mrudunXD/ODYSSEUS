import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('accountant@springfield.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);

        if (res.data.user.role === 'PARENT') {
          navigate('/parent-portal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E7EB] shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-[#E85D04]/20">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Sign In to SchoolFin</h1>
          <p className="text-xs text-[#6B7280]">Production-Grade School Fee Operations System</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-[#DC2626] border border-rose-200 rounded-xl font-bold text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-3 font-semibold text-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-3 font-semibold text-[#1A1A1A]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold rounded-2xl shadow-lg shadow-[#E85D04]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Verifying Password Hash...</span>
            ) : (
              <>
                <span>Sign In with Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="bg-[#F5F5F0] p-3.5 rounded-2xl border border-[#E5E7EB] text-[11px] space-y-1">
          <span className="font-bold text-[#1A1A1A] block">Seeded Demo Credentials (Bcrypt Hashed):</span>
          <p className="text-[#6B7280]">Accountant: <span className="font-mono font-bold text-[#1A1A1A]">accountant@springfield.edu</span> / password123</p>
          <p className="text-[#6B7280]">Super Admin: <span className="font-mono font-bold text-[#1A1A1A]">malik@springfield.edu</span> / password123</p>
          <p className="text-[#6B7280]">Parent: <span className="font-mono font-bold text-[#1A1A1A]">parent@springfield.edu</span> / password123</p>
        </div>
      </div>
    </div>
  );
};
