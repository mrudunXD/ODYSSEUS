import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { User, Lock, Check, ShieldCheck, ArrowRight } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, login } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const res = await apiClient.put('/auth/profile', {
        name,
        avatarUrl,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.data.success) {
        setMessage('Profile and security credentials updated successfully!');
        if (res.data.user) {
          login(res.data.user, useAuthStore.getState().token || '');
        }
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB]">
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xl overflow-hidden border border-[#E5E7EB] shadow-xs">
              <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">{user?.name}</h2>
              <span className="text-xs text-[#6B7280]">{user?.email}</span>
              <div className="mt-1">
                <span className="px-2.5 py-0.5 bg-[#FFF0E6] text-[#E85D04] rounded-full text-[10px] font-extrabold border border-[#E85D04]/20">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            {message && (
              <div className="p-3 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 text-[#DC2626] border border-rose-200 rounded-xl font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] space-y-3">
              <span className="font-extrabold text-xs text-[#1A1A1A] block">Change Account Password (Bcrypt Hashed)</span>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold rounded-2xl shadow-md shadow-[#E85D04]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSaving ? (
                <span>Saving Credentials...</span>
              ) : (
                <>
                  <span>Save Profile Updates</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};
