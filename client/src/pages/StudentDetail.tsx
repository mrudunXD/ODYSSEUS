import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { ArrowLeft, RefreshCw, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { Student } from '../types';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Summary' | 'Invoices' | 'Transactions' | 'Waivers'>('Summary');
  const { push } = useToastStore();

  const fetchStudentDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/students/${id}`);
      if (res.data?.data) {
        setStudent(res.data.data);
      }
    } catch (err: any) {
      push('error', 'Failed to fetch student details', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [id, push]);

  useEffect(() => {
    fetchStudentDetail();
  }, [fetchStudentDetail]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh] gap-3 text-xs text-[#6B7280]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
          Loading student financial profile...
        </div>
      </PageWrapper>
    );
  }

  if (!student) {
    return (
      <PageWrapper>
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB] max-w-md mx-auto mt-12 space-y-4">
          <p className="text-sm font-bold text-[#1A1A1A]">Student Record Not Found</p>
          <button
            onClick={() => navigate('/students')}
            className="px-5 py-2.5 bg-[#E85D04] text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-[#C44D00]"
          >
            Back to Student Roster
          </button>
        </div>
      </PageWrapper>
    );
  }

  const invoices = student.invoices || [];
  const transactions = invoices.flatMap((inv: any) => inv.transactions || []);
  const waivers = student.waivers || [];

  const totalAssigned = invoices.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
  const paidAmount = invoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
  const waiverAmount = waivers.reduce((acc: number, w: any) => acc + w.amount, 0);
  const balanceDue = Math.max(0, totalAssigned - paidAmount);

  let status = 'UNPAID';
  if (totalAssigned > 0 && paidAmount >= totalAssigned) status = 'PAID';
  else if (paidAmount > 0) status = 'PARTIAL';

  return (
    <PageWrapper>
      {/* Back Button */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#E85D04] mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Directory</span>
      </button>

      {/* Student Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{student.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Code: <span className="font-mono font-bold text-[#1A1A1A]">{student.studentCode}</span> | {student.class?.name} - Sec {student.class?.section}
            </p>
            <p className="text-xs text-[#6B7280]">
              Parent: {student.parentName} ({student.parentPhone}) &middot; <a href={`mailto:${student.parentEmail}`} className="hover:text-[#E85D04]">{student.parentEmail}</a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/invoices')}
            className="px-4 py-2.5 min-h-[40px] bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] transition-colors"
          >
            Generate Invoice
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="px-4 py-2.5 min-h-[40px] bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-colors"
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] mb-6">
        {(['Summary', 'Invoices', 'Transactions', 'Waivers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === tab
                ? 'text-[#E85D04] border-[#E85D04]'
                : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase">Total Fee Assigned</span>
            <div className="text-2xl font-mono font-extrabold text-[#1A1A1A] mt-2">
              {formatCurrency(totalAssigned)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase">Total Paid</span>
            <div className="text-2xl font-mono font-extrabold text-[#16A34A] mt-2">
              {formatCurrency(paidAmount)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase">Total Waivers</span>
            <div className="text-2xl font-mono font-extrabold text-[#E85D04] mt-2">
              {formatCurrency(waiverAmount)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase">Balance Due</span>
            <div className={`text-2xl font-mono font-extrabold mt-2 ${balanceDue > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
              {formatCurrency(balanceDue)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          {invoices.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-8">No invoices assigned to this student.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                    <th className="pb-3 pl-2">Invoice No</th>
                    <th className="pb-3">Issue Date</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Paid Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3.5 pl-2 font-mono font-bold text-[#1A1A1A]">{inv.invoiceNo}</td>
                      <td className="py-3.5 text-[#6B7280]">{formatDate(inv.issueDate)}</td>
                      <td className="py-3.5 text-[#6B7280]">{formatDate(inv.dueDate)}</td>
                      <td className="py-3.5 font-mono font-extrabold text-[#1A1A1A]">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3.5 font-mono font-extrabold text-[#16A34A]">{formatCurrency(inv.paidAmount)}</td>
                      <td className="py-3.5"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Transactions' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          {transactions.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-8">No payments recorded for this student.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                    <th className="pb-3 pl-2">Reference</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3.5 pl-2 font-mono font-bold text-[#1A1A1A]">{tx.referenceNo || tx.id}</td>
                      <td className="py-3.5 font-bold text-[#1A1A1A]">{tx.method}</td>
                      <td className="py-3.5 font-mono font-extrabold text-[#16A34A]">{formatCurrency(tx.amount)}</td>
                      <td className="py-3.5 text-[#6B7280]">{formatDate(tx.createdAt)}</td>
                      <td className="py-3.5"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Waivers' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          {waivers.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-8">No waivers or discounts applied.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                    <th className="pb-3 pl-2">Waiver ID</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Approved By</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {waivers.map((w: any) => (
                    <tr key={w.id} className="hover:bg-[#F5F5F0]">
                      <td className="py-3.5 pl-2 font-mono font-bold text-[#1A1A1A]">{w.id}</td>
                      <td className="py-3.5 font-semibold text-[#1A1A1A]">{w.reason}</td>
                      <td className="py-3.5 text-[#6B7280]">{w.approvedBy}</td>
                      <td className="py-3.5 font-mono font-extrabold text-[#E85D04]">{formatCurrency(w.amount)}</td>
                      <td className="py-3.5 text-[#6B7280]">{formatDate(w.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};
