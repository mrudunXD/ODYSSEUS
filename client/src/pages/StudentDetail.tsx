import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { ArrowLeft, User, FileText, CreditCard, ShieldCheck, Plus, Check } from 'lucide-react';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Summary' | 'Invoices' | 'Transactions' | 'Waivers'>('Summary');

  // Realistic Student Ledger State
  const student = {
    id: id || 'STU-101',
    studentCode: '2025-101',
    name: 'Aarav Sharma',
    grade: 'Class 11',
    section: 'A',
    parentName: 'Rajesh Sharma',
    parentEmail: 'rajesh.sharma@example.com',
    parentPhone: '+91 98765 43210',
    totalAssigned: 17500,
    paidAmount: 12500,
    waiverAmount: 2500,
    balanceDue: 2500,
    status: 'PARTIAL',
    overdueDays: 12,
  };

  const invoices = [
    {
      id: 'INV-1001',
      invoiceNo: 'INV-2025-001',
      issueDate: '2025-09-01',
      dueDate: '2025-09-10',
      totalAmount: 12500,
      paidAmount: 12500,
      status: 'PAID',
    },
    {
      id: 'INV-1002',
      invoiceNo: 'INV-2025-002',
      issueDate: '2025-12-01',
      dueDate: '2025-12-10',
      totalAmount: 5000,
      paidAmount: 2500,
      status: 'PARTIAL',
    },
  ];

  const transactions = [
    {
      id: 'TXN-9901',
      amount: 12500,
      method: 'RAZORPAY',
      status: 'SUCCESS',
      referenceNo: 'pay_rzp_948271',
      date: '2025-09-05',
    },
  ];

  const waivers = [
    {
      id: 'WVR-01',
      amount: 2500,
      reason: 'Academic Merit Scholarship 15%',
      approvedBy: 'Principal Dr. Kapoor',
      date: '2025-09-02',
    },
  ];

  return (
    <PageWrapper>
      {/* Back Button */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#E85D04] mb-4 cursor-pointer"
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
              <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{student.name}</h2>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Code: <span className="font-mono font-bold text-[#1A1A1A]">{student.studentCode}</span> | {student.grade} - Sec {student.section}
            </p>
            <p className="text-xs text-[#6B7280]">
              Parent: {student.parentName} ({student.parentPhone})
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04]"
          >
            Generate Invoice
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="px-4 py-2 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-xs font-semibold text-[#6B7280] uppercase">Total Fee Assigned</span>
            <div className="text-2xl font-extrabold text-[#1A1A1A] mt-2">
              {formatCurrency(student.totalAssigned)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-xs font-semibold text-[#6B7280] uppercase">Total Paid</span>
            <div className="text-2xl font-extrabold text-[#16A34A] mt-2">
              {formatCurrency(student.paidAmount)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
            <span className="text-xs font-semibold text-[#6B7280] uppercase">Outstanding Balance</span>
            <div className="text-2xl font-extrabold text-[#DC2626] mt-2">
              {formatCurrency(student.balanceDue)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase">
                <th className="pb-2">Invoice No</th>
                <th className="pb-2">Issue Date</th>
                <th className="pb-2">Due Date</th>
                <th className="pb-2">Total Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 font-mono font-bold text-[#1A1A1A]">{inv.invoiceNo}</td>
                  <td className="py-3">{formatDate(inv.issueDate)}</td>
                  <td className="py-3">{formatDate(inv.dueDate)}</td>
                  <td className="py-3 font-extrabold">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Transactions' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-bold text-[#6B7280] uppercase">
                <th className="pb-2">Ref ID</th>
                <th className="pb-2">Method</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 font-mono font-bold text-[#1A1A1A]">{tx.referenceNo}</td>
                  <td className="py-3 font-semibold">{tx.method}</td>
                  <td className="py-3">{formatDate(tx.date)}</td>
                  <td className="py-3 font-extrabold text-[#E85D04]">{formatCurrency(tx.amount)}</td>
                  <td className="py-3"><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Waivers' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-bold text-[#6B7280] uppercase">
                <th className="pb-2">Waiver ID</th>
                <th className="pb-2">Reason</th>
                <th className="pb-2">Approved By</th>
                <th className="pb-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {waivers.map((w) => (
                <tr key={w.id}>
                  <td className="py-3 font-mono font-bold text-[#1A1A1A]">{w.id}</td>
                  <td className="py-3 font-semibold">{w.reason}</td>
                  <td className="py-3 text-[#6B7280]">{w.approvedBy}</td>
                  <td className="py-3 font-extrabold text-[#16A34A]">{formatCurrency(w.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
};
