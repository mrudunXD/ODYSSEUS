import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { formatCurrency } from '../utils/formatCurrency';
import { Download, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Filter } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2025-26');

  // Donut Chart Data
  const revenueBreakdown = [
    { name: 'Tuition Fees', value: 145000, color: '#E85D04' },
    { name: 'Transport Fees', value: 38000, color: '#1A1A1A' },
    { name: 'Laboratory & STEM', value: 22000, color: '#16A34A' },
    { name: 'Late Penalty Fees', value: 5500, color: '#D97706' },
  ];

  // Line Chart Data
  const monthlyTrend = [
    { month: 'Jul', collection: 180000 },
    { month: 'Aug', collection: 195000 },
    { month: 'Sep', collection: 210000 },
    { month: 'Oct', collection: 188000 },
    { month: 'Nov', collection: 205000 },
    { month: 'Dec', collection: 210550 },
  ];

  // Bar Chart Data
  const classCollection = [
    { class: 'Class 1', collected: 28000, target: 30000 },
    { class: 'Class 2', collected: 32000, target: 32000 },
    { class: 'Class 5', collected: 34000, target: 36000 },
    { class: 'Class 9', collected: 39000, target: 42000 },
    { class: 'Class 10', collected: 45000, target: 50000 },
    { class: 'Class 11', collected: 48000, target: 48000 },
    { class: 'Class 12', collected: 52000, target: 55000 },
  ];

  const handleExportCSV = () => {
    const csv =
      'Category,Amount\n' +
      revenueBreakdown.map((r) => `${r.name},${r.value}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolFin_Financial_Report.csv`;
    a.click();
  };

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Financial Reports & Analytics Visualizations
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Revenue breakdown, monthly collection trends, class-wise targets, and defaulter aging charts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial Report</span>
        </button>
      </div>

      {/* Grid of Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Breakdown Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#E85D04]" />
              <span>Revenue Breakdown by Fee Head</span>
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={5}
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E5E7EB] text-xs font-semibold">
            {revenueBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Collection Trend Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-[#E85D04]" />
              <span>Monthly Collection Trend (12 Months)</span>
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={10} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Line type="monotone" dataKey="collection" stroke="#E85D04" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Class-wise Collection Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#E85D04]" />
            <span>Class-wise Collection vs Target Progress</span>
          </h3>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classCollection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="class" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={10} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="collected" name="Collected Amount" fill="#E85D04" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target Amount" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageWrapper>
  );
};
