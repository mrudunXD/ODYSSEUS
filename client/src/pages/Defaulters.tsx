import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AnimatedCounter } from '../components/react-bits/AnimatedCounter';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { ShieldAlert, Send, Check, MessageCircle, DollarSign, Calendar, Filter } from 'lucide-react';
import { Student } from '../types';

export const Defaulters: React.FC = () => {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const [defaulters] = useState<Student[]>([
    {
      id: 'STU-103',
      schoolId: 'SCH-01',
      classId: 'CLS-10C',
      studentCode: '2025-103',
      name: 'Rohan Verma',
      parentName: 'Vikram Verma',
      parentEmail: 'vikram.v@example.com',
      parentPhone: '+91 99887 76655',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-10C', schoolId: 'SCH-01', name: 'Class 10', section: 'C' },
      totalAssigned: 15700,
      paidAmount: 0,
      balanceDue: 15700,
      status: 'OVERDUE',
      overdueDays: 42,
    },
    {
      id: 'STU-104',
      schoolId: 'SCH-01',
      classId: 'CLS-11A',
      studentCode: '2025-104',
      name: 'Ananya Patel',
      parentName: 'Suresh Patel',
      parentEmail: 'suresh.p@example.com',
      parentPhone: '+91 97654 32109',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-11A', schoolId: 'SCH-01', name: 'Class 11', section: 'A' },
      totalAssigned: 17500,
      paidAmount: 12500,
      balanceDue: 5000,
      status: 'PARTIAL',
      overdueDays: 14,
    },
    {
      id: 'STU-105',
      schoolId: 'SCH-01',
      classId: 'CLS-09A',
      studentCode: '2025-105',
      name: 'David Chen',
      parentName: 'Michael Chen',
      parentEmail: 'mchen@example.com',
      parentPhone: '+91 95432 10987',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-09A', schoolId: 'SCH-01', name: 'Class 9', section: 'A' },
      totalAssigned: 14300,
      paidAmount: 0,
      balanceDue: 14300,
      status: 'OVERDUE',
      overdueDays: 28,
    },
  ]);

  const totalOutstanding = defaulters.reduce((sum, d) => sum + (d.balanceDue || 0), 0);
  const criticalCount = defaulters.filter((d) => (d.overdueDays || 0) >= 30).length;

  const handleSendEmailReminder = (id: string) => {
    setSentMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSentMap((prev) => ({ ...prev, [id]: false }));
    }, 3000);
  };

  const getWhatsAppLink = (d: Student, totalPayable: number) => {
    const phone = d.parentPhone.replace(/[^0-9]/g, '');
    const message = `Dear ${d.parentName}, this is an overdue fee notice for ${d.name} (${d.studentCode}) from Springfield International School. Outstanding Balance: ${formatCurrency(totalPayable)}. Please settle via UPI QR or Razorpay link.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <PageWrapper>
      {/* Banner KPI Section */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block mb-1">
            Defaulter Priority Control Center
          </span>
          <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            <AnimatedCounter to={totalOutstanding} prefix="₹" />
          </div>
          <p className="text-xs text-[#A0AEC0] mt-1">
            Total Outstanding Overdue Balance across {defaulters.length} accounts
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-[#2D3748] px-4 py-3 rounded-2xl border border-[#4A5568]">
            <span className="text-xs text-[#A0AEC0] block">Critical Overdue (&gt;30 Days)</span>
            <span className="text-xl font-extrabold text-[#DC2626]">{criticalCount} Students</span>
          </div>

          <button
            onClick={() => defaulters.forEach((d) => handleSendEmailReminder(d.id))}
            className="flex items-center gap-2 px-5 py-3 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-[#E85D04]/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast All Email Reminders</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaulters.map((d) => {
          const days = d.overdueDays || 0;
          const latePenalty = days * 50; // ₹50/day rule
          const totalPayable = (d.balanceDue || 0) + latePenalty;
          const isSent = sentMap[d.id];

          let colorBadge = 'bg-amber-100 text-[#D97706]';
          if (days > 30) colorBadge = 'bg-rose-100 text-[#DC2626]';
          else if (days > 15) colorBadge = 'bg-[#FFF0E6] text-[#E85D04]';

          return (
            <div
              key={d.id}
              className={`bg-white rounded-3xl p-5 border card-shadow card-hover flex flex-col justify-between ${
                days > 30 ? 'border-rose-300' : 'border-[#E5E7EB]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${colorBadge}`}>
                    {days} Days Overdue
                  </span>
                  <span className="text-xs font-bold text-[#6B7280]">
                    {d.class?.name} - {d.class?.section}
                  </span>
                </div>

                <h4 className="font-extrabold text-[#1A1A1A] text-base">{d.name}</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Code: <span className="font-mono font-bold">{d.studentCode}</span> | Parent: {d.parentName}
                </p>

                {/* Late Fee Calculation Breakdown */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Base Balance Unpaid:</span>
                    <span className="font-bold text-[#1A1A1A]">{formatCurrency(d.balanceDue || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Accrued Penalty (₹50/day):</span>
                    <span className="font-bold text-[#E85D04]">+{formatCurrency(latePenalty)}</span>
                  </div>
                  <div className="flex justify-between text-[#1A1A1A] font-extrabold text-sm pt-2 border-t border-[#E5E7EB]">
                    <span>Total Outstanding:</span>
                    <span className="text-[#DC2626]">{formatCurrency(totalPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendEmailReminder(d.id)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSent
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] hover:border-[#E85D04]'
                  }`}
                >
                  {isSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5 text-[#E85D04]" />}
                  <span>{isSent ? 'Sent!' : 'Email Notice'}</span>
                </button>

                <a
                  href={getWhatsAppLink(d, totalPayable)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};
