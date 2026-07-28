import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('malik@springfield.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<Role>('SUPER_ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      {
        id: 'USR-01',
        schoolId: 'SCH-01',
        name: email.split('@')[0] || 'User',
        email,
        role: selectedRole,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      'jwt_mock_token_2026'
    );

    if (selectedRole === 'PARENT') {
      navigate('/parent-portal');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E7EB] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-[#E85D04]/20">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Sign In to SchoolFin</h1>
          <p className="text-xs text-[#6B7280]">Production-Grade School Fee Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Select Active Role (RBAC)</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-3 font-semibold text-[#1A1A1A]"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrator)</option>
              <option value="ADMIN">ADMIN (School Administrator)</option>
              <option value="ACCOUNTANT">ACCOUNTANT (Accountant & Bursar)</option>
              <option value="TEACHER">TEACHER (Teacher / Staff)</option>
              <option value="PARENT">PARENT (Parent / Guardian)</option>
            </select>
          </div>

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
            className="w-full py-3.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold rounded-2xl shadow-lg shadow-[#E85D04]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sign In to System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
