import React from 'react';
import { useFee } from '../context/FeeContext';
import { CountUp } from './react-bits/CountUp';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { totalRevenue, netProfit, operatingExpenses, cashProjection } = useFee();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Revenue (Main Card with soft orange pill badge) */}
      <div className="bg-white rounded-2xl p-5 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-[#71717A] tracking-wider uppercase">Total Revenue</span>
          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            <CountUp
              to={totalRevenue}
              prefix="$"
              className="text-3xl lg:text-4xl font-extrabold text-[#18181B] tracking-tight"
            />
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4D00] bg-[#FFF0EB] px-2.5 py-1 rounded-full">
              Real Revenue
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Net Profit / Collected Fees */}
      <div className="bg-white rounded-2xl p-5 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#71717A] tracking-wider uppercase">Net Profit</span>
          <button className="text-[#A1A1AA] hover:text-[#18181B]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3">
          <CountUp
            to={netProfit}
            prefix="$"
            className="text-2xl lg:text-3xl font-extrabold text-[#18181B] tracking-tight"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#71717A] font-medium">Net Revenue Margin</span>
            <span className="text-[#FF4D00] font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Computed
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Operating Expenses */}
      <div className="bg-white rounded-2xl p-5 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#71717A] tracking-wider uppercase">Operating Expenses</span>
          <button className="text-[#A1A1AA] hover:text-[#18181B]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3">
          <CountUp
            to={operatingExpenses}
            prefix="$"
            className="text-2xl lg:text-3xl font-extrabold text-[#18181B] tracking-tight"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#71717A] font-medium">Outflow Expenses</span>
            <span className="text-[#71717A] font-bold flex items-center gap-0.5">
              Real Outflows
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Cash Projection */}
      <div className="bg-white rounded-2xl p-5 border border-[#EBE7DF] card-shadow card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#71717A] tracking-wider uppercase">Cash Projection</span>
          <button className="text-[#A1A1AA] hover:text-[#18181B]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3">
          <CountUp
            to={cashProjection}
            prefix="$"
            className="text-2xl lg:text-3xl font-extrabold text-[#18181B] tracking-tight"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#71717A] font-medium">Revenue + Outstanding</span>
            <span className="text-[#FF4D00] font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Dynamic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
