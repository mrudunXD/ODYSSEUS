import React, { useState } from 'react';
import { MoreHorizontal, Sparkles, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useFee } from '../context/FeeContext';

export const FinancialGauge: React.FC = () => {
  const { aiInsights } = useFee();
  const [activeInsightIdx, setActiveInsightIdx] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);

  const currentInsight = aiInsights[activeInsightIdx];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#18181B]">Financial Overview</h3>
          <button className="text-[#A1A1AA] hover:text-[#18181B]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* AI Finance Insight Banner matching screenshot */}
        <div className="bg-[#FAF8F3] border border-[#EBE7DF] rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF4D00] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#18181B] block">AI Finance Insight</span>
              <span className="text-[11px] text-[#71717A]">Smart insights from your weekly data</span>
            </div>
          </div>
          <button
            onClick={() => setShowAiModal(true)}
            className="w-8 h-8 rounded-xl bg-white border border-[#EBE7DF] flex items-center justify-center text-[#18181B] hover:border-[#FF4D00] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Semi-circular Radial Donut Gauge matching screenshot */}
        <div className="relative flex flex-col items-center justify-center py-4">
          <svg className="w-48 h-28 transform" viewBox="0 0 100 50">
            {/* Background Ring Track */}
            <path
              d="M 10,50 A 40,40 0 0,1 90,50"
              fill="none"
              stroke="#F0ECE1"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Active Orange Progress Ring (78% filled) */}
            <path
              d="M 10,50 A 40,40 0 0,1 82,24"
              fill="none"
              stroke="#FF4D00"
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Gauge Text matching screenshot */}
          <div className="absolute top-12 text-center">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="text-xl font-extrabold text-[#18181B] tracking-tight">$10,500</span>
          </div>
        </div>

        {/* Metrics Row at Bottom matching screenshot */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0ECE1]">
          <div className="border-r border-[#F0ECE1] pr-2">
            <span className="text-base font-extrabold text-[#18181B] flex items-center gap-1">
              $5,400 <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A]" />
            </span>
            <span className="text-[11px] text-[#71717A] font-medium block">Earnings</span>
          </div>

          <div className="pl-2">
            <span className="text-base font-extrabold text-[#18181B] flex items-center gap-1">
              $5,400 <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A]" />
            </span>
            <span className="text-[11px] text-[#71717A] font-medium block">AI Suggested Save</span>
          </div>
        </div>
      </div>

      {/* AI Insight Dialog Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#18181B]">AI Strategic Fee Recommendations</h4>
                <p className="text-xs text-[#71717A]">Generated from real-time school fee analytics</p>
              </div>
            </div>

            <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#EBE7DF] mb-4 space-y-2">
              <h5 className="font-bold text-sm text-[#18181B]">{currentInsight.title}</h5>
              <p className="text-xs text-[#71717A]">{currentInsight.summary}</p>
              <div className="pt-2 border-t border-[#EBE7DF]">
                <span className="text-[11px] font-bold text-[#FF4D00]">Action: </span>
                <span className="text-xs text-[#18181B]">{currentInsight.suggestedAction}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
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
