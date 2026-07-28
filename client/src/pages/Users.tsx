import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { UserPlus, ShieldCheck, Trash2, X, Check } from 'lucide-react';
import { User, Role } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'USR-01',
      schoolId: 'SCH-01',
      name: 'Malik',
      email: 'malik@springfield.edu',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
    },
    {
      id: 'USR-02',
      schoolId: 'SCH-01',
      name: 'Elena Martinez',
      email: 'accountant@springfield.edu',
      role: 'ACCOUNTANT',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
    },
    {
      id: 'USR-03',
      schoolId: 'SCH-01',
      name: 'Dr. Vikram Kapoor',
      email: 'principal@springfield.edu',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('ACCOUNTANT');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      schoolId: 'SCH-01',
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <PageWrapper>
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              User Management & RBAC Role Assignment
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Manage system access permissions for Administrators, Accountants, Teachers, and Parents.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff User</span>
          </button>
        </div>

        {/* User Data Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
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
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={() => setUsers((prev) => prev.filter((item) => item.id !== u.id))}
                        className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
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
                    className="px-5 py-2 bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20"
                  >
                    Create User
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
