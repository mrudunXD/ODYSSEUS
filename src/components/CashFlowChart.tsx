import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CountUp } from './react-bits/CountUp';
import { useFee } from '../context/FeeContext';

export const CashFlowChart: React.FC = () => {
  const { monthlyCashFlow, dynamicChartData } = useFee();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(4);

  const maxVal = Math.max(
    10000,
    ...dynamicChartData.map((d) => Math.max(d.inflow, d.outflow))
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#71717A]">Monthly Cash Flow</span>
          <div className="flex items-baseline gap-3 mt-1">
            <CountUp to={monthlyCashFlow} prefix="$" className="text-2xl lg:text-3xl font-extrabold text-[#18181B]" />
            <span className="text-xs font-bold text-[#FF4D00]">Dynamic Cash Ledger</span>
          </div>
        </div>

        {/* Right Controls: Legend & Date Range */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-4 font-semibold text-[#18181B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D00]" />
              <span>Revenue Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#18181B]" />
              <span>Expense Outflow</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl font-bold text-[#18181B]">
            <span>Recent Ledger</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none text-[10px] text-[#A1A1AA]">
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">${Math.round(maxVal / 1000)}k</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">${Math.round((maxVal * 0.6) / 1000)}k</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">${Math.round((maxVal * 0.3) / 1000)}k</span>
          </div>
          <div className="flex items-center gap-2 border-b border-2 border-dashed border-[#18181B]/20 pb-1 z-10">
            <span className="w-8 font-bold text-[#18181B]">$0</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">-${Math.round((maxVal * 0.3) / 1000)}k</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">-${Math.round((maxVal * 0.6) / 1000)}k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8">-${Math.round(maxVal / 1000)}k</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="pl-10 grid grid-cols-9 gap-2 lg:gap-4 h-64 relative items-center">
          {dynamicChartData.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const inflowHeight = (item.inflow / maxVal) * 100;
            const outflowHeight = (item.outflow / maxVal) * 80;

            return (
              <div
                key={item.date + idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="relative h-full flex flex-col items-center justify-center cursor-pointer group z-20"
              >
                {/* Dotted Vertical Guide Line */}
                {isHovered && (
                  <div className="absolute inset-y-0 w-px border-r-2 border-dashed border-[#18181B]/40 pointer-events-none" />
                )}

                {/* Tooltip Card */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 bg-white border border-[#EBE7DF] rounded-2xl p-3 shadow-xl text-xs w-48 animate-in fade-in zoom-in-95 pointer-events-none">
                    <span className="text-[10px] font-bold text-[#71717A] block mb-1.5">{item.fullDate}</span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-[#FF4D00]">
                          <span className="w-2 h-2 rounded-xs bg-[#FF4D00]" />
                          ${item.inflow.toLocaleString('en-US')}.00
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-[#18181B]">
                          <span className="w-2 h-2 rounded-xs bg-[#18181B]" />
                          -${item.outflow.toLocaleString('en-US')}.00
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inflow Top Bar */}
                <div className="w-full flex justify-center items-end h-1/2 pb-0.5">
                  <div
                    style={{ height: `${Math.max(6, inflowHeight)}%` }}
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#FF4D00] shadow-md shadow-[#FF4D00]/30 scale-105'
                        : 'bg-gradient-to-t from-[#FF4D00] to-[#FF8850] opacity-80 hover:opacity-100'
                    }`}
                  />
                </div>

                {/* Outflow Bottom Bar */}
                <div className="w-full flex justify-center items-start h-1/2 pt-0.5">
                  <div
                    style={{ height: `${Math.max(6, outflowHeight)}%` }}
                    className={`w-full max-w-[36px] rounded-b-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#18181B] shadow-md scale-105'
                        : 'bg-gradient-to-b from-[#18181B] to-[#3F3F46] opacity-85 hover:opacity-100'
                    }`}
                  />
                </div>

                {/* Date Label */}
                <span
                  className={`mt-2 text-[11px] font-bold transition-colors ${
                    isHovered ? 'text-[#FF4D00]' : 'text-[#71717A]'
                  }`}
                >
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
