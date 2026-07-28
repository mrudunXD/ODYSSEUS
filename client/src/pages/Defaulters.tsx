import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { AnimatedCounter } from '../components/react-bits/AnimatedCounter';
import { formatCurrency } from '../utils/formatCurrency';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { Send, Check, MessageCircle, RefreshCw, Search } from 'lucide-react';

interface Defaulter {
  invoiceId: string;
  invoiceNo: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  overdueDays: number;
  lateFeeAccrued: number;
  status: string;
}

export const Defaulters: React.FC = () => {
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const { push } = useToastStore();

  const fetchDefaulters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/defaulters');
      if (res.data?.data) {
        setDefaulters(res.data.data);
      }
    } catch (err: any) {
      push('error', 'Failed to fetch defaulters list', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchDefaulters();
  }, [fetchDefaulters]);

  const totalOutstanding = defaulters.reduce((sum, d) => sum + (d.balanceDue + d.lateFeeAccrued), 0);
  const criticalCount = defaulters.filter((d) => d.overdueDays >= 30).length;

  const handleSendEmailReminder = (id: string, email: string) => {
    setSentMap((prev) => ({ ...prev, [id]: true }));
    push('success', `Notice dispatched to ${email}`);
    setTimeout(() => {
      setSentMap((prev) => ({ ...prev, [id]: false }));
    }, 4000);
  };

  const getWhatsAppLink = (d: Defaulter, totalPayable: number) => {
    const phone = d.parentPhone ? d.parentPhone.replace(/[^0-9]/g, '') : '';
    const message = `Dear ${d.parentName}, this is an overdue fee notice for ${d.studentName} (${d.studentCode}) from Springfield International School. Invoice: ${d.invoiceNo}. Total Payable: ${formatCurrency(totalPayable)}. Please settle at your earliest convenience.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const filteredDefaulters = defaulters.filter((d) =>
    d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
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
          <button
            onClick={fetchDefaulters}
            className="p-3 bg-[#2D3748] rounded-2xl border border-[#4A5568] hover:border-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-[#2D3748] px-4 py-3 rounded-2xl border border-[#4A5568]">
            <span className="text-xs text-[#A0AEC0] block">Critical Overdue (&gt;30 Days)</span>
            <span className="text-xl font-extrabold text-[#DC2626]">{criticalCount} Accounts</span>
          </div>

          <button
            onClick={() => {
              defaulters.forEach((d) => handleSendEmailReminder(d.invoiceId, d.parentEmail));
              push('success', `Broadcasted email notices to ${defaulters.length} parents`);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-[#E85D04]/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast All Email Reminders</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E5E7EB]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defaulter by student name, code, or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
          />
        </div>
        <span className="text-xs font-bold text-[#6B7280]">
          Showing {filteredDefaulters.length} of {defaulters.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
          Computing overdue penalties and loading defaulter roster...
        </div>
      ) : filteredDefaulters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB]">
          <p className="text-sm font-bold text-[#1A1A1A]">No defaulters found</p>
          <p className="text-xs text-[#6B7280] mt-1">All accounts are currently up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDefaulters.map((d) => {
            const totalPayable = d.balanceDue + d.lateFeeAccrued;
            const isSent = sentMap[d.invoiceId];

            let colorBadge = 'bg-amber-100 text-[#D97706]';
            if (d.overdueDays > 30) colorBadge = 'bg-rose-100 text-[#DC2626]';
            else if (d.overdueDays > 15) colorBadge = 'bg-[#FFF0E6] text-[#E85D04]';

            return (
              <div
                key={d.invoiceId}
                className={`bg-white rounded-3xl p-5 border card-shadow flex flex-col justify-between ${
                  d.overdueDays > 30 ? 'border-rose-300' : 'border-[#E5E7EB]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${colorBadge}`}>
                      {d.overdueDays} Days Overdue
                    </span>
                    <span className="text-xs font-bold text-[#6B7280]">
                      {d.className || 'General'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-[#1A1A1A] text-base">{d.studentName}</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Code: <span className="font-mono font-bold">{d.studentCode}</span> | Parent: {d.parentName}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-2 text-xs">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Invoice Number:</span>
                      <span className="font-mono font-bold text-[#1A1A1A]">{d.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Base Unpaid Due:</span>
                      <span className="font-bold text-[#1A1A1A]">{formatCurrency(d.balanceDue)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Late Penalty Accrued:</span>
                      <span className="font-bold text-[#E85D04]">+{formatCurrency(d.lateFeeAccrued)}</span>
                    </div>
                    <div className="flex justify-between text-[#1A1A1A] font-extrabold text-sm pt-2 border-t border-[#E5E7EB]">
                      <span>Total Payable:</span>
                      <span className="text-[#DC2626]">{formatCurrency(totalPayable)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendEmailReminder(d.invoiceId, d.parentEmail)}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSent
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] hover:border-[#E85D04]'
                    }`}
                  >
                    {isSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5 text-[#E85D04]" />}
                    <span>{isSent ? 'Dispatched' : 'Email Notice'}</span>
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
      )}
    </PageWrapper>
  );
};
