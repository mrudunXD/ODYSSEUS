import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { formatDate } from '../utils/formatDate';
import { Settings as SettingsIcon, ShieldCheck, Lock, Mail, Building, History } from 'lucide-react';
import { AuditLog } from '../types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'School' | 'Razorpay' | 'Audit'>('School');

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'AUD-01',
      userId: 'USR-01',
      action: 'PAYMENT_VERIFIED',
      entity: 'Transaction',
      entityId: 'TXN-9901',
      newValue: 'Razorpay HMAC-SHA256 Signature Verified (pay_rzp_948271)',
      createdAt: '2025-12-05T00:00:00Z',
    },
    {
      id: 'AUD-02',
      userId: 'USR-01',
      action: 'WAIVER_APPROVED',
      entity: 'Waiver',
      entityId: 'WVR-01',
      newValue: 'Approved ₹2,500 Academic Merit Waiver',
      createdAt: '2025-12-02T00:00:00Z',
    },
  ]);

  return (
    <PageWrapper>
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              School System Configuration & Security Audit
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Configure Razorpay API credentials, school profile letterhead, and inspect immutable audit logs.
            </p>
          </div>
        </div>

        {/* Tabs Row */}
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
            Razorpay API Credentials
          </button>
          <button
            onClick={() => setActiveTab('Audit')}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === 'Audit'
                ? 'text-[#E85D04] border-[#E85D04]'
                : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'School' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">School Legal Name</label>
              <input
                type="text"
                readOnly
                value="Springfield International School"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-bold text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Campus Address</label>
              <input
                type="text"
                readOnly
                value="104 Edu Campus Way, Financial District"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
              />
            </div>
          </div>
        )}

        {activeTab === 'Razorpay' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow space-y-4 max-w-xl text-xs">
            <div className="bg-[#FFF0E6] p-3 rounded-2xl border border-[#E85D04]/20 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E85D04]" />
              <div>
                <span className="font-extrabold text-[#1A1A1A] block">Razorpay Standard Checkout Active</span>
                <span className="text-[11px] text-[#6B7280]">Live Backend HMAC Order Proxy Connected</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Razorpay Key ID</label>
              <input
                type="text"
                readOnly
                value="rzp_test_TIWVCWyzGuKOq8"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Razorpay Key Secret (Masked)</label>
              <input
                type="password"
                readOnly
                value="yQ1CqeJoYcf07z80S2wLlKAm"
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A]"
              />
            </div>
          </div>
        )}

        {activeTab === 'Audit' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                  <th className="pb-2">Audit ID</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Entity</th>
                  <th className="pb-2">Log Details</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 font-mono font-bold text-[#1A1A1A]">{log.id}</td>
                    <td className="py-3 font-bold text-[#E85D04]">{log.action}</td>
                    <td className="py-3 font-semibold">{log.entity}</td>
                    <td className="py-3 text-[#6B7280]">{log.newValue}</td>
                    <td className="py-3">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RoleGuard>
    </PageWrapper>
  );
};
