import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { UserPlus, Trash2, X, RefreshCw, Lock } from 'lucide-react';
import { User, Role } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { push } = useToastStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ACCOUNTANT');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      push('error', 'Failed to load user accounts', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      push('warning', 'Please fill all required user fields');
      return;
    }
    if (password.length < 8) {
      push('warning', 'Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/users', {
        name,
        email,
        password,
        role,
      });

      if (res.data?.success) {
        push('success', `User account created for ${email}`);
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (err: any) {
      push('error', 'Failed to create user account', err.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      const res = await apiClient.put(`/users/${id}/toggle`);
      if (res.data?.success) {
        push('success', `User account status updated`);
        fetchUsers();
      }
    } catch (err: any) {
      push('error', 'Failed to update user account', err.response?.data?.error);
    }
  };

  return (
    <PageWrapper>
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              User Management & RBAC Role Assignment
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Manage system access permissions for Administrators, Accountants, Teachers, and Parents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
            >
              <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff User</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
              Loading staff accounts from database...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-bold text-[#1A1A1A]">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                    <th className="pb-3 pl-2">User Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Assigned RBAC Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3.5 pl-2 font-bold text-[#1A1A1A]">{u.name}</td>
                      <td className="py-3.5 text-[#6B7280]">{u.email}</td>
                      <td className="py-3.5">
                        <span className="px-3 py-1 bg-[#FFF0E6] text-[#E85D04] border border-[#E85D04]/20 rounded-full font-extrabold text-[11px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            u.isActive
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="px-3 py-1 text-xs font-bold bg-[#F5F5F0] border border-[#E5E7EB] hover:border-[#E85D04] rounded-lg transition-colors"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="font-extrabold text-[#1A1A1A] text-base">Add Staff User</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Suresh Menon"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="suresh@springfield.edu"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters (bcrypt hashed)"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Assign Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                    <option value="TEACHER">TEACHER</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </RoleGuard>
    </PageWrapper>
  );
};
