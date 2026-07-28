import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Zap, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { RazorpayCheckoutModal } from '../components/modals/RazorpayCheckoutModal';

export const ParentPortal: React.FC = () => {
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const student = {
    id: 'STU-101',
    studentCode: '2025-101',
    name: 'Aarav Sharma',
    grade: 'Class 11',
    section: 'A',
    parentName: 'Rajesh Sharma',
    totalAssigned: 17500,
    paidAmount: 12500,
    balanceDue: 5000,
    status: 'PARTIAL',
  };

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E85D04] uppercase tracking-wider block mb-1">
            Parent Fee Dashboard
          </span>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">Child: {student.name} ({student.grade})</h2>
          <p className="text-xs text-[#6B7280]">
            Springfield International School | Student Code: <span className="font-mono font-bold text-[#1A1A1A]">{student.studentCode}</span>
          </p>
        </div>

        <button
          onClick={() => setIsRazorpayOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-[#E85D04]/25 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Pay Outstanding {formatCurrency(student.balanceDue)} Now</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-xs font-semibold text-[#6B7280] uppercase">Total Term Fee</span>
          <div className="text-2xl font-extrabold text-[#1A1A1A] mt-2">{formatCurrency(student.totalAssigned)}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-xs font-semibold text-[#6B7280] uppercase">Paid Till Date</span>
          <div className="text-2xl font-extrabold text-[#16A34A] mt-2">{formatCurrency(student.paidAmount)}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
          <span className="text-xs font-semibold text-[#6B7280] uppercase">Balance Due</span>
          <div className="text-2xl font-extrabold text-[#E85D04] mt-2">{formatCurrency(student.balanceDue)}</div>
        </div>
      </div>

      {/* Payment Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        students={[student as any]}
        feeTypes={[{ id: 'FEE-01', schoolId: 'SCH-01', name: 'Tuition Fee Balance', amount: 5000, frequency: 'QUARTERLY', isActive: true, lateFeePerDay: 50, gracePeriodDays: 5, applicableTo: 'ALL', createdAt: '' }]}
        onSuccess={() => alert('Payment completed successfully!')}
      />
    </PageWrapper>
  );
};
