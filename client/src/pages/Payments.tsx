import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { CheckCircle2, XCircle, Clock, Zap, CreditCard, FileSpreadsheet, Plus } from 'lucide-react';
import { OfflineReconciliation } from '../types';

export const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Record' | 'Reconciliation'>('Record');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [queue, setQueue] = useState<OfflineReconciliation[]>([
    {
      id: 'REC-OFF-01',
      studentId: 'STU-102',
      studentName: 'Sofia Martinez',
      rollNo: '2025-102',
      method: 'Cheque',
      amount: 10000,
      chequeNumber: 'CHQ-778901',
      bankName: 'HDFC Bank',
      depositDate: '2025-12-07',
      status: 'Pending_Deposit',
      receiptNo: 'REC-2025-002',
      recordedBy: 'Accountant Malik',
      notes: 'Cheque handed at desk 2',
    },
    {
      id: 'REC-OFF-02',
      studentId: 'STU-101',
      studentName: 'Aarav Sharma',
      rollNo: '2025-101',
      method: 'Cash',
      amount: 17500,
      depositDate: '2025-12-05',
      status: 'Realized',
      receiptNo: 'REC-2025-001',
      recordedBy: 'Accountant Malik',
      notes: 'Vaulted cash verified',
    },
  ]);

  const updateStatus = (id: string, status: 'Realized' | 'Bounced') => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Omnichannel Payment Desk & Cheque Reconciliation
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Record counter cash/cheques, manage Razorpay online gateway, and process cheque clearances.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] mb-6">
        <button
          onClick={() => setActiveTab('Record')}
          className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'Record'
              ? 'text-[#E85D04] border-[#E85D04]'
              : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
          }`}
        >
          Record Payment Desk
        </button>
        <button
          onClick={() => setActiveTab('Reconciliation')}
          className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'Reconciliation'
              ? 'text-[#E85D04] border-[#E85D04]'
              : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
          }`}
        >
          Cheque Reconciliation Queue ({queue.filter((q) => q.status === 'Pending_Deposit').length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'Record' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center mx-auto shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A]">Razorpay Standard Gateway</h3>
            <p className="text-xs text-[#6B7280]">
              Instant online payment with backend HMAC-SHA256 signature verification.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center mx-auto shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A]">Zero-Fee UPI QR Payment</h3>
            <p className="text-xs text-[#6B7280]">
              Direct bank settlement using scannable UPI QR and 12-digit UTR reference entry.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#E85D04] border border-[#E5E7EB] flex items-center justify-center mx-auto shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A]">Counter Cash & Cheque Desk</h3>
            <p className="text-xs text-[#6B7280]">
              Record counter cash or bank cheque deposits into the reconciliation queue.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'Reconciliation' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase">UNDER_REVIEW Instrument Queue</h3>
            <div className="flex items-center gap-2">
              {['ALL', 'Pending_Deposit', 'Realized', 'Bounced'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    filterStatus === st
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-[#F5F5F0] text-[#6B7280] border border-[#E5E7EB]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                  <th className="pb-2">Receipt & Method</th>
                  <th className="pb-2">Student Name</th>
                  <th className="pb-2">Bank / Cheque No</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Reconcile Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {queue
                  .filter((item) => filterStatus === 'ALL' || item.status === filterStatus)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3 font-bold text-[#1A1A1A]">{item.method} ({item.receiptNo})</td>
                      <td className="py-3 font-bold text-[#1A1A1A]">{item.studentName}</td>
                      <td className="py-3 font-mono">{item.chequeNumber || 'Vault Cash'}</td>
                      <td className="py-3 font-extrabold text-[#E85D04]">{formatCurrency(item.amount)}</td>
                      <td className="py-3"><StatusBadge status={item.status} /></td>
                      <td className="py-3 text-right">
                        {item.status === 'Pending_Deposit' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateStatus(item.id, 'Realized')}
                              className="px-3 py-1 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg"
                            >
                              Mark Realized
                            </button>
                            <button
                              onClick={() => updateStatus(item.id, 'Bounced')}
                              className="px-3 py-1 bg-[#DC2626] hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg"
                            >
                              Bounced
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#6B7280]">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
