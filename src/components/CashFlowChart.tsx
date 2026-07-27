import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CountUp } from './react-bits/CountUp';

interface DayData {
  date: string;
  fullDate: string;
  inflow: number;
  outflow: number;
  inflowPercent: string;
  outflowPercent: string;
  highlighted?: boolean;
}

const mockChartData: DayData[] = [
  { date: 'Dec 01', fullDate: 'December 01, 2025', inflow: 4800, outflow: 4200, inflowPercent: '↑ 1.8%', outflowPercent: '↓ 1.2%' },
  { date: 'Dec 02', fullDate: 'December 02, 2025', inflow: 2400, outflow: 5800, inflowPercent: '↓ 0.5%', outflowPercent: '↑ 3.1%' },
  { date: 'Dec 03', fullDate: 'December 03, 2025', inflow: 6200, outflow: 3100, inflowPercent: '↑ 4.2%', outflowPercent: '↓ 0.9%' },
  { date: 'Dec 04', fullDate: 'December 04, 2025', inflow: 3900, outflow: 1800, inflowPercent: '↑ 2.1%', outflowPercent: '↓ 2.0%' },
  { date: 'Dec 05', fullDate: 'December 05, 2025', inflow: 8740, outflow: 2110, inflowPercent: '↑ 2.5%', outflowPercent: '↓ 2.5%', highlighted: true },
  { date: 'Dec 06', fullDate: 'December 06, 2025', inflow: 5800, outflow: 3800, inflowPercent: '↑ 3.0%', outflowPercent: '↑ 1.1%' },
  { date: 'Dec 07', fullDate: 'December 07, 2025', inflow: 4800, outflow: 1200, inflowPercent: '↑ 1.5%', outflowPercent: '↓ 4.0%' },
  { date: 'Dec 08', fullDate: 'December 08, 2025', inflow: 1800, outflow: 6100, inflowPercent: '↓ 1.0%', outflowPercent: '↑ 5.2%' },
  { date: 'Dec 09', fullDate: 'December 09, 2025', inflow: 3900, outflow: 3200, inflowPercent: '↑ 0.8%', outflowPercent: '↓ 1.5%' },
];

export const CashFlowChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(4); // Default Dec 05 highlighted

  const activeData = hoveredIdx !== null ? mockChartData[hoveredIdx] : mockChartData[4];

  // Max value for scaling heights
  const maxVal = 9000;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#71717A]">Monthly Cash Flow</span>
          <div className="flex items-baseline gap-3 mt-1">
            <CountUp to={104627} prefix="$" className="text-2xl lg:text-3xl font-extrabold text-[#18181B]" />
            <span className="text-xs font-bold text-[#FF4D00]">+18% from last month</span>
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
            <span>Dec 01 - Dec 09</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none text-[10px] text-[#A1A1AA]">
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">$65</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">$45</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">$25</span>
          </div>
          <div className="flex items-center gap-2 border-b border-2 border-dashed border-[#18181B]/20 pb-1 z-10">
            <span className="w-8 font-bold text-[#18181B]">$0</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">-$25</span>
          </div>
          <div className="flex items-center gap-2 border-b border-dashed border-[#F0ECE1] pb-1">
            <span className="w-8">-$45</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8">-$65</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="pl-10 grid grid-cols-9 gap-2 lg:gap-4 h-64 relative items-center">
          {mockChartData.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const inflowHeight = (item.inflow / maxVal) * 100;
            const outflowHeight = (item.outflow / maxVal) * 80;

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="relative h-full flex flex-col items-center justify-center cursor-pointer group z-20"
              >
                {/* Dotted Vertical Guide Line when active */}
                {isHovered && (
                  <div className="absolute inset-y-0 w-px border-r-2 border-dashed border-[#18181B]/40 pointer-events-none" />
                )}

                {/* Tooltip Card matching screenshot */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 bg-white border border-[#EBE7DF] rounded-2xl p-3 shadow-xl text-xs w-48 animate-in fade-in zoom-in-95 pointer-events-none">
                    <span className="text-[10px] font-bold text-[#71717A] block mb-1.5">{item.fullDate}</span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-[#FF4D00]">
                          <span className="w-2 h-2 rounded-xs bg-[#FF4D00]" />
                          ${item.inflow.toLocaleString('en-US')}.00
                        </span>
                        <span className="text-[10px] text-[#FF4D00] flex items-center">{item.inflowPercent}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-[#18181B]">
                          <span className="w-2 h-2 rounded-xs bg-[#18181B]" />
                          -${item.outflow.toLocaleString('en-US')}.00
                        </span>
                        <span className="text-[10px] text-[#71717A] flex items-center">{item.outflowPercent}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inflow Top Bar (Orange) */}
                <div className="w-full flex justify-center items-end h-1/2 pb-0.5">
                  <div
                    style={{ height: `${inflowHeight}%` }}
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#FF4D00] shadow-md shadow-[#FF4D00]/30 scale-105'
                        : 'bg-gradient-to-t from-[#FF4D00] to-[#FF8850] opacity-80 hover:opacity-100'
                    }`}
                  />
                </div>

                {/* Outflow Bottom Bar (Dark Slate) */}
                <div className="w-full flex justify-center items-start h-1/2 pt-0.5">
                  <div
                    style={{ height: `${outflowHeight}%` }}
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
