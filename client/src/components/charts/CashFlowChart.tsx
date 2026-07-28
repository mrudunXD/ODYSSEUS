import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { ChevronDown } from 'lucide-react';
import { ChartDayPoint } from '../../types';

interface CashFlowChartProps {
  data: ChartDayPoint[];
  monthlyTotal: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, monthlyTotal }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');

  // Custom Recharts Tooltip matching screenshot
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-xl text-xs w-48 animate-in fade-in zoom-in-95 pointer-events-none">
          <span className="text-[10px] font-bold text-[#6B7280] block mb-1.5">{label}</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-[#E85D04]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#E85D04]" />
                Inflow: {formatCurrency(payload[0]?.value || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-[#1A1A1A]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1A1A1A]" />
                Outflow: {formatCurrency(payload[1]?.value || 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Monthly Cash Flow
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-[#1A1A1A]">
              {formatCurrency(monthlyTotal)}
            </span>
            <span className="text-xs font-bold text-[#E85D04]">+18% from last month</span>
          </div>
        </div>

        {/* Legend Controls */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-4 font-semibold text-[#1A1A1A]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E85D04]" />
              <span>Revenue Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1A1A1A]" />
              <span>Expense Outflow</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl font-bold text-[#1A1A1A] text-xs">
            <span>Dec 01 - Dec 09</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="inflow" name="Revenue Inflow" fill="#E85D04" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="outflow" name="Expense Outflow" fill="#1A1A1A" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
