import React, { useState } from 'react';
import { MoreHorizontal, Sparkles, MessageSquare, ArrowUpRight, Zap, CreditCard, FileSpreadsheet, BellRing } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  totalRevenue: number;
  netProfit: number;
  operatingExpenses: number;
  collectionRatePercent: number;
  aiInsight?: string;
  onOpenRazorpay?: () => void;
  onOpenUpi?: () => void;
  onOpenOfflineRec?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  totalRevenue,
  netProfit,
  operatingExpenses,
  collectionRatePercent,
  aiInsight = 'Term collection target is 88%. Recommend sending 0-fee UPI QR payment reminders to overdue Grade 10 parents.',
  onOpenRazorpay,
  onOpenUpi,
  onOpenOfflineRec,
}) => {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);

  // Compute gauge stroke-dasharray based on collection percentage
  const strokeDashoffset = Math.max(0, 125 - (125 * collectionRatePercent) / 100);

  return (
    <div className="space-y-6">
      {/* Card 1: Financial Overview & Radial Gauge */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1A1A1A]">Financial Overview</h3>
            <button className="text-[#6B7280] hover:text-[#1A1A1A]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* AI Finance Insight Banner */}
          <div className="bg-[#FFF0E6] border border-[#E85D04]/20 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E85D04] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#1A1A1A] block">AI Finance Insight</span>
                <span className="text-[11px] text-[#6B7280]">Smart tips from weekly collection analytics</span>
              </div>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A] hover:border-[#E85D04] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Semi-circular Radial Donut Gauge */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <svg className="w-48 h-28 transform" viewBox="0 0 100 50">
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#E85D04"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="125"
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute top-12 text-center">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                Available Balance
              </span>
              <span className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>

          {/* Metrics Row at Bottom */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5E7EB]">
            <div className="border-r border-[#E5E7EB] pr-2">
              <span className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-1">
                {formatCurrency(totalRevenue)} <ArrowUpRight className="w-3.5 h-3.5 text-[#16A34A]" />
              </span>
              <span className="text-[11px] text-[#6B7280] font-medium block">Total Collection</span>
            </div>

            <div className="pl-2">
              <span className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-1">
                {formatCurrency(operatingExpenses)} <ArrowUpRight className="w-3.5 h-3.5 text-[#6B7280]" />
              </span>
              <span className="text-[11px] text-[#6B7280] font-medium block">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: My Card & Quick Financial Action Buttons */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#1A1A1A]">My Card</h3>
            <button className="text-[#6B7280] hover:text-[#1A1A1A]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-semibold text-[#6B7280] block mb-4">
            Primary Business Account
          </span>

          {/* Sleek Dark Business Card */}
          <div className="bg-[#1A1A1A] text-white rounded-2xl p-4 flex items-center justify-between mb-6 shadow-md shadow-[#1A1A1A]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-[#2D3748] rounded-lg border border-[#4A5568] flex items-center justify-center font-bold text-[10px] text-white tracking-widest">
                VISA
              </div>
              <div>
                <span className="text-xs font-bold text-[#A0AEC0] block">Visa Business</span>
                <span className="text-xs tracking-wider font-mono text-[#E2E8F0]">**** **** 4219</span>
              </div>
            </div>
            <span className="text-sm font-extrabold tracking-tight">{formatCurrency(totalRevenue * 0.4)}</span>
          </div>

          {/* Quick Contextual Actions */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenRazorpay}
                className="flex items-center gap-2 p-2.5 bg-[#FFF0E6] border border-[#E85D04]/30 rounded-xl text-xs font-bold text-[#E85D04] hover:bg-[#E85D04] hover:text-white transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Razorpay Pay</span>
              </button>

              <button
                onClick={onOpenUpi}
                className="flex items-center gap-2 p-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] hover:bg-white transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>UPI QR (0 Fee)</span>
              </button>

              <button
                onClick={onOpenOfflineRec}
                className="flex items-center gap-2 p-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] hover:bg-white transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Record Cash</span>
              </button>

              <button
                onClick={() => navigate('/defaulters')}
                className="flex items-center gap-2 p-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] hover:bg-white transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Defaulters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Dialog Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1A1A1A]">AI Strategic Analytics</h4>
                <p className="text-xs text-[#6B7280]">Generated from real-time school fee ledger</p>
              </div>
            </div>

            <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E7EB] mb-4 space-y-2 text-xs">
              <h5 className="font-bold text-[#1A1A1A]">Strategic Recommendation</h5>
              <p className="text-[#6B7280]">{aiInsight}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
