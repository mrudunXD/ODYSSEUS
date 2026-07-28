import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { RoleGuard } from '../components/layout/RoleGuard';
import { OfflineRecordModal } from '../components/modals/OfflineRecordModal';
import { Zap, CreditCard, FileSpreadsheet, RefreshCw, Plus } from 'lucide-react';
import { Transaction, Student } from '../types';

export const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Record' | 'Transactions'>('Transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const { push } = useToastStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txRes, stuRes] = await Promise.all([
        apiClient.get('/transactions'),
        apiClient.get('/students'),
      ]);
      if (txRes.data?.data) setTransactions(txRes.data.data);
      if (stuRes.data?.data) setStudents(stuRes.data.data);
    } catch (err: any) {
      push('error', 'Failed to fetch payment records', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransactions = transactions.filter(
    (t) => filterMethod === 'ALL' || t.method === filterMethod
  );

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Omnichannel Payment Desk & Audit Ledger
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Record counter cash/cheques, manage Razorpay online gateway, and process transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']}>
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Counter Payment</span>
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#E5E7EB] mb-6">
        <button
          onClick={() => setActiveTab('Transactions')}
          className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'Transactions'
              ? 'text-[#E85D04] border-[#E85D04]'
              : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
          }`}
        >
          Transaction History ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('Record')}
          className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'Record'
              ? 'text-[#E85D04] border-[#E85D04]'
              : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
          }`}
        >
          Payment Method Overview
        </button>
      </div>

      {activeTab === 'Record' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center mx-auto shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A]">Razorpay Gateway</h3>
            <p className="text-xs text-[#6B7280]">
              Instant online payment with backend HMAC-SHA256 signature verification.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center mx-auto shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A]">Zero-Fee UPI QR</h3>
            <p className="text-xs text-[#6B7280]">
              Direct bank settlement using scannable UPI QR and UTR reference entry.
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

      {activeTab === 'Transactions' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase">Transaction Audit Ledger</h3>
            <div className="flex items-center gap-2">
              {['ALL', 'RAZORPAY', 'UPI', 'CASH', 'CHEQUE'].map((method) => (
                <button
                  key={method}
                  onClick={() => setFilterMethod(method)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    filterMethod === method
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-[#F5F5F0] text-[#6B7280] border border-[#E5E7EB]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
              Loading transaction history...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-bold text-[#1A1A1A]">No transactions recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                    <th className="pb-2">Reference / ID</th>
                    <th className="pb-2">Student / Invoice</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3 font-mono font-bold text-[#1A1A1A]">
                        {tx.referenceNo || tx.razorpayPaymentId || tx.id}
                      </td>
                      <td className="py-3 font-bold text-[#1A1A1A]">
                        {tx.invoice?.student?.name || 'Counter Payment'}
                        <span className="text-[10px] text-[#6B7280] block font-mono">
                          {tx.invoice?.invoiceNo}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-md font-extrabold text-[10px]">
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-[#16A34A]">{formatCurrency(tx.amount)}</td>
                      <td className="py-3 text-[#6B7280]">{formatDate(tx.createdAt)}</td>
                      <td className="py-3"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <OfflineRecordModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        students={students}
        onSuccess={fetchData}
      />
    </PageWrapper>
  );
};
