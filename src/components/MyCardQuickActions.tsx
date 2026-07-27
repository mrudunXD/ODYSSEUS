import React from 'react';
import { useFee } from '../context/FeeContext';
import { MoreHorizontal, CreditCard, Zap, FileSpreadsheet, BellRing } from 'lucide-react';

export const MyCardQuickActions: React.FC = () => {
  const {
    setIsRazorpayOpen,
    setIsUpiOpen,
    setIsOfflineRecOpen,
    setActiveTab,
  } = useFee();

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#18181B]">My Card</h3>
          <button className="text-[#A1A1AA] hover:text-[#18181B]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs font-semibold text-[#71717A] block mb-4">
          Primary Business Account
        </span>

        {/* Sleek Dark Card matching screenshot */}
        <div className="bg-[#18181B] text-white rounded-2xl p-4 flex items-center justify-between mb-6 shadow-md shadow-[#18181B]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-[#27272A] rounded-lg border border-[#3F3F46] flex items-center justify-center font-bold text-[10px] text-white tracking-widest">
              VISA
            </div>
            <div>
              <span className="text-xs font-bold text-[#A1A1AA] block">Visa</span>
              <span className="text-xs tracking-wider font-mono text-[#D4D4D8]">**** **** 4219</span>
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight">$39,219.00</span>
        </div>

        {/* Quick Contextual Action Buttons */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Razorpay Online Collection */}
            <button
              onClick={() => setIsRazorpayOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-[#FFF0EB] border border-[#FF4D00]/20 rounded-xl text-xs font-bold text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all cursor-pointer group"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Razorpay Collect</span>
            </button>

            {/* Zero-Fee UPI Collection */}
            <button
              onClick={() => setIsUpiOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] hover:border-[#FF4D00] hover:bg-white transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span>UPI QR (0 Fee)</span>
            </button>

            {/* Offline Cash/Cheque */}
            <button
              onClick={() => setIsOfflineRecOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] hover:border-[#FF4D00] hover:bg-white transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Record Cash</span>
            </button>

            {/* Defaulter Tracking */}
            <button
              onClick={() => setActiveTab('Defaulters')}
              className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] hover:border-[#FF4D00] hover:bg-white transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Defaulters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
