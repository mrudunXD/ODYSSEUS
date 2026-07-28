import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, LogOut, ShieldCheck, User, Lock, AlertCircle, Camera } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, login, logout, token, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', {
        name,
        avatarUrl: avatarUrl || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.data.success) {
        login(res.data.user, token || '', refreshToken || undefined);
        setMessage('Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (_) { /* non-blocking */ }
    logout();
    navigate('/login');
  };

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCOUNTANT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    TEACHER: 'bg-amber-50 text-amber-700 border-amber-200',
    PARENT: 'bg-[#FFF0E6] text-[#E85D04] border-[#E85D04]/20',
  };
  const roleBadgeColor = roleBadgeColors[user?.role || ''] || 'bg-[#F5F5F0] text-[#6B7280] border-[#E5E7EB]';

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto space-y-5">
        {/* Account Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow">
          <div className="flex items-center gap-4 pb-5 border-b border-[#E5E7EB]">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#E5E7EB]"
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-extrabold text-lg border-2 border-[#E5E7EB]">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-[#1A1A1A]">{user?.name}</h2>
              <p className="text-xs text-[#6B7280]">{user?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleBadgeColor}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-[10px] text-[#16A34A] font-bold">Active Session</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-5 text-xs">
            {message && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#16A34A] font-bold">
                <Check className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[#DC2626] font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-[#6B7280]" />
              <span className="font-extrabold text-[#1A1A1A] text-xs uppercase tracking-wider">Profile Info</span>
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Avatar Image URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
                />
                <Camera className="w-4 h-4 text-[#6B7280] shrink-0" />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-[#6B7280]" />
                <span className="font-extrabold text-[#1A1A1A] text-xs uppercase tracking-wider">Change Password</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1A1A1A] block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1A1A1A] block mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-[#E85D04] hover:bg-[#C44D00] disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-md shadow-[#E85D04]/20 flex items-center justify-center gap-2 transition-all"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving to Database...
                </span>
              ) : (
                <>Save Profile<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Session & Security Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow">
          <h3 className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-4">Session & Security</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[#F5F5F0]">
              <span className="text-[#6B7280] font-semibold">Authentication</span>
              <span className="font-bold text-[#1A1A1A]">bcrypt + JWT (15m) + Refresh Token (7d)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F5F5F0]">
              <span className="text-[#6B7280] font-semibold">Session Storage</span>
              <span className="font-bold text-[#1A1A1A]">localStorage (encrypted via Zustand persist)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F5F5F0]">
              <span className="text-[#6B7280] font-semibold">Role</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleBadgeColor}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B7280] font-semibold">Account Created</span>
              <span className="font-bold text-[#1A1A1A]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200 font-extrabold rounded-2xl text-xs transition-all"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Signing out...' : 'Sign Out of All Sessions'}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};
