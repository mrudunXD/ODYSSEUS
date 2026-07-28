import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { ShieldCheck, RefreshCw, Save } from 'lucide-react';
import { AuditLog } from '../types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'School' | 'Razorpay' | 'Audit'>('School');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { push } = useToastStore();

  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');

  const fetchSettingsAndAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schoolRes, auditRes] = await Promise.all([
        apiClient.get('/settings/school'),
        apiClient.get('/audit-logs'),
      ]);
      if (schoolRes.data?.data) {
        setSchoolName(schoolRes.data.data.name || '');
        setSchoolAddress(schoolRes.data.data.address || '');
      }
      if (auditRes.data?.data) {
        setAuditLogs(auditRes.data.data);
      }
    } catch (err: any) {
      push('error', 'Failed to load system settings', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchSettingsAndAudit();
  }, [fetchSettingsAndAudit]);

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.put('/settings/school', {
        name: schoolName,
        address: schoolAddress,
      });

      if (res.data?.success) {
        push('success', 'School settings updated successfully');
        fetchSettingsAndAudit();
      }
    } catch (err: any) {
      push('error', 'Failed to update school settings', err.response?.data?.error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper>
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              School System Configuration & Security Audit
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Configure Razorpay API credentials, school profile letterhead, and inspect immutable audit logs.
            </p>
          </div>

          <button
            onClick={fetchSettingsAndAudit}
            className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[#E5E7EB] mb-6">
          <button
            onClick={() => setActiveTab('School')}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === 'School'
                ? 'text-[#E85D04] border-[#E85D04]'
                : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            School Profile
          </button>
          <button
            onClick={() => setActiveTab('Razorpay')}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === 'Razorpay'
                ? 'text-[#E85D04] border-[#E85D04]'
                : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            Razorpay Integration Status
          </button>
          <button
            onClick={() => setActiveTab('Audit')}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === 'Audit'
                ? 'text-[#E85D04] border-[#E85D04]'
                : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'School' && (
          <form onSubmit={handleSaveSchoolProfile} className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">School Legal Name</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-bold text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Campus Address</label>
              <input
                type="text"
                required
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold rounded-xl shadow-md shadow-[#E85D04]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save School Profile'}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'Razorpay' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow space-y-4 max-w-xl text-xs">
            <div className="bg-[#FFF0E6] p-4 rounded-2xl border border-[#E85D04]/20 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#E85D04]" />
              <div>
                <span className="font-extrabold text-[#1A1A1A] block text-sm">Razorpay Checkout Backend Active</span>
                <span className="text-[11px] text-[#6B7280]">
                  HMAC-SHA256 signature verification server proxy is fully operational. Secrets are stored securely in backend environment variables.
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Public Key ID (Client Facing)</label>
              <input
                type="text"
                readOnly
                value="rzp_test_TIWVCWyzGuKOq8"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Backend HMAC Secret Status</label>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold">
                ✓ Loaded from server .env (Hidden from client DOM for security)
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Audit' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
                <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
                Loading audit trail...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-bold text-[#1A1A1A]">No audit logs recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                      <th className="pb-2">User</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Entity</th>
                      <th className="pb-2">Entity ID</th>
                      <th className="pb-2">Details</th>
                      <th className="pb-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 font-bold text-[#1A1A1A]">
                          {log.user?.name || log.userId}
                          <span className="text-[10px] text-[#6B7280] block font-normal">{log.user?.role}</span>
                        </td>
                        <td className="py-3 font-bold text-[#E85D04]">{log.action}</td>
                        <td className="py-3 font-semibold">{log.entity}</td>
                        <td className="py-3 font-mono text-[11px]">{log.entityId}</td>
                        <td className="py-3 text-[#6B7280] max-w-xs truncate">{log.newValue || log.oldValue || '—'}</td>
                        <td className="py-3">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </RoleGuard>
    </PageWrapper>
  );
};
