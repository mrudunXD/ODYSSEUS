import React, { useEffect, useState, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { RazorpayCheckoutModal } from '../components/modals/RazorpayCheckoutModal';
import {
  Zap, User, BookOpen, RefreshCw, ChevronDown, AlertCircle, CheckCircle, Clock
} from 'lucide-react';

interface ChildData {
  id: string;
  studentCode: string;
  name: string;
  class: { name: string; section: string };
  parentName: string;
  totalAssigned: number;
  paidAmount: number;
  balanceDue: number;
  invoices: {
    id: string;
    invoiceNo: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate: string;
    lateFeeAccrued?: number;
    items: { label: string; amount: number }[];
    transactions: { id: string; amount: number; method: string; createdAt: string }[];
  }[];
}

export const ParentPortal: React.FC = () => {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/parent/my-children');
      if (res.data?.data) {
        setChildren(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh] gap-3 text-xs text-[#6B7280]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
          Loading your children's fee records from database...
        </div>
      </PageWrapper>
    );
  }

  if (children.length === 0) {
    return (
      <PageWrapper>
        <div className="bg-white rounded-3xl p-12 border border-[#E5E7EB] card-shadow text-center max-w-md mx-auto mt-12">
          <User className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">No Students Linked</h2>
          <p className="text-xs text-[#6B7280] mt-2">
            No students are linked to <span className="font-bold text-[#1A1A1A]">{user?.email}</span>.
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Contact your school administrator to link your child's account.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const child = children[selectedChildIdx];
  const pendingInvoices = child.invoices.filter((i) => ['UNPAID', 'PARTIAL', 'OVERDUE'].includes(i.status));
  const paidInvoices = child.invoices.filter((i) => i.status === 'PAID');

  return (
    <PageWrapper>
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] border border-[#E85D04]/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#E85D04]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#E85D04] uppercase tracking-wider block">
                Parent Fee Portal
              </span>
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">Welcome, {user?.name}</h2>
              <p className="text-xs text-[#6B7280]">Springfield International School</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-child toggle */}
            {children.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] transition-colors"
                >
                  <span>{child.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                </button>
                {isChildDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1 z-30">
                    {children.map((c, idx) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedChildIdx(idx); setIsChildDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          idx === selectedChildIdx ? 'bg-[#FFF0E6] text-[#E85D04]' : 'text-[#1A1A1A] hover:bg-[#F5F5F0]'
                        }`}
                      >
                        <span className="block font-bold">{c.name}</span>
                        <span className="text-[10px] text-[#6B7280]">{c.class?.name} – {c.class?.section}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={fetchChildren}
              className="p-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
            >
              <RefreshCw className="w-4 h-4 text-[#6B7280]" />
            </button>

            {child.balanceDue > 0 && (
              <button
                onClick={() => setIsRazorpayOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-[#E85D04]/25 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Pay {formatCurrency(child.balanceDue)} Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Child Info + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">Student</span>
          <span className="text-base font-extrabold text-[#1A1A1A] block">{child.name}</span>
          <span className="text-xs text-[#6B7280]">{child.class?.name} – {child.class?.section}</span>
          <span className="block font-mono text-[10px] text-[#6B7280] mt-1">{child.studentCode}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">Total Fees</span>
          <span className="text-2xl font-extrabold text-[#1A1A1A]">{formatCurrency(child.totalAssigned)}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">Amount Paid</span>
          <span className="text-2xl font-extrabold text-[#16A34A]">{formatCurrency(child.paidAmount)}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1">Balance Due</span>
          <span className={`text-2xl font-extrabold ${child.balanceDue > 0 ? 'text-[#E85D04]' : 'text-[#16A34A]'}`}>
            {formatCurrency(child.balanceDue)}
          </span>
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow mb-6">
          <h3 className="text-sm font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E85D04]" />
            Pending & Overdue Invoices
          </h3>
          <div className="space-y-3">
            {pendingInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-[#F5F5F0] rounded-2xl border border-[#E5E7EB]">
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A] text-xs block">{inv.invoiceNo}</span>
                  <span className="text-[10px] text-[#6B7280]">Due: {formatDate(inv.dueDate)}</span>
                  {inv.lateFeeAccrued && inv.lateFeeAccrued > 0 && (
                    <span className="text-[10px] text-[#DC2626] block font-semibold">
                      + Late Fee: {formatCurrency(inv.lateFeeAccrued)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#E85D04] block">
                    {formatCurrency(inv.totalAmount - inv.paidAmount)}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
        <h3 className="text-sm font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          Payment History
        </h3>

        {child.invoices.flatMap((inv) => inv.transactions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Clock className="w-10 h-10 text-[#E5E7EB]" />
            <p className="text-sm font-bold text-[#1A1A1A]">No payments recorded yet</p>
            <p className="text-xs text-[#6B7280]">Payments made online or at the counter will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0] text-xs">
                {child.invoices.flatMap((inv) =>
                  inv.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F5F5F0] transition-colors">
                      <td className="py-3 font-semibold text-[#1A1A1A]">{formatDate(tx.createdAt)}</td>
                      <td className="py-3 font-mono text-[#6B7280]">{inv.invoiceNo}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 bg-[#F5F5F0] border border-[#E5E7EB] rounded-lg font-bold text-[11px] text-[#1A1A1A]">
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-[#16A34A]">{formatCurrency(tx.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Razorpay modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        students={[child as any]}
        feeTypes={child.invoices
          .filter((i) => ['UNPAID', 'PARTIAL', 'OVERDUE'].includes(i.status))
          .flatMap((i) =>
            i.items.map((item) => ({
              id: i.id,
              schoolId: '',
              name: item.label,
              amount: item.amount,
              frequency: 'ONE_TIME',
              isActive: true,
              lateFeePerDay: 50,
              gracePeriodDays: 5,
              applicableTo: 'ALL',
              createdAt: i.dueDate,
            }))
          )}
        onSuccess={fetchChildren}
      />
    </PageWrapper>
  );
};
