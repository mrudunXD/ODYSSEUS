import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { ArrowRight, Eye, EyeOff, AlertCircle, Chrome } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        login(res.data.user, res.data.token, res.data.refreshToken);
        if (res.data.user.role === 'PARENT') {
          navigate('/parent-portal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google OAuth setup required.\n\nAdd GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.\nVisit: https://console.cloud.google.com/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E7EB] shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/">
            <div className="w-14 h-14 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-[#E85D04]/20 cursor-pointer">
              S
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Sign in to SchoolFin</h1>
            <p className="text-xs text-[#6B7280] mt-1">School Fee Management Platform</p>
          </div>
        </div>

        {/* Google Login (stub) */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
        >
          <Chrome className="w-4 h-4 text-[#E85D04]" />
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">or email</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#DC2626]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1.5">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@springfield.edu"
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1.5">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 pr-10 font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            id="login-submit"
            className="w-full py-3.5 bg-[#E85D04] hover:bg-[#C44D00] disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg shadow-[#E85D04]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-[#F5F5F0] rounded-2xl border border-[#E5E7EB] p-4 space-y-1.5">
          <p className="text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-2">
            Demo Credentials (bcrypt hashed)
          </p>
          {[
            { role: 'Super Admin', email: 'malik@springfield.edu' },
            { role: 'Accountant', email: 'accountant@springfield.edu' },
            { role: 'Admin', email: 'admin@springfield.edu' },
            { role: 'Parent', email: 'parent@springfield.edu' },
          ].map((cred) => (
            <button
              key={cred.email}
              type="button"
              onClick={() => { setEmail(cred.email); setPassword('password123'); }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-colors group"
            >
              <span className="text-[10px] font-bold text-[#E85D04] block">{cred.role}</span>
              <span className="text-[11px] font-mono text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors">
                {cred.email}
              </span>
            </button>
          ))}
          <p className="text-[10px] text-[#6B7280] pt-1">All demo passwords: <span className="font-mono font-bold text-[#1A1A1A]">password123</span></p>
        </div>
      </div>
    </div>
  );
};
