import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { formatCurrency } from '../utils/formatCurrency';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { Download, PieChart as PieIcon, BarChart3, LineChart as LineIcon, RefreshCw } from 'lucide-react';
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

interface ReportData {
  totalRevenue: number;
  pendingAmount: number;
  overdueCount: number;
  paidCount: number;
  totalStudents: number;
  byMethod: { method: string; total: number; count: number }[];
}

export const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [chartPoints, setChartPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useToastStore();

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, chartRes] = await Promise.all([
        apiClient.get('/reports/summary'),
        apiClient.get('/dashboard/chart-data'),
      ]);
      if (summaryRes.data?.data) setData(summaryRes.data.data);
      if (chartRes.data?.data) setChartPoints(chartRes.data.data);
    } catch (err: any) {
      push('error', 'Failed to load report aggregations', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const methodColors: Record<string, string> = {
    RAZORPAY: '#E85D04',
    UPI: '#16A34A',
    CASH: '#1A1A1A',
    CHEQUE: '#D97706',
    BANK_TRANSFER: '#2563EB',
  };

  const pieData = data?.byMethod.map((m) => ({
    name: m.method,
    value: m.total,
    color: methodColors[m.method] || '#6B7280',
  })) || [];

  const handleExportCSV = () => {
    if (!data) return;
    const csv =
      'Method,Total Amount,Transaction Count\n' +
      data.byMethod.map((m) => `${m.method},${m.total},${m.count}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolFin_Financial_Report.csv`;
    a.click();
    push('success', 'Exported financial summary to CSV');
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Financial Reports & Live Analytics Visualizations
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Real DB aggregations of payment methods, monthly collection trends, and invoice metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Financial Report</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
          Aggregating financial ledger data from database...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">Total Revenue</span>
              <span className="text-2xl font-extrabold text-[#16A34A]">{formatCurrency(data?.totalRevenue || 0)}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">Pending Due</span>
              <span className="text-2xl font-extrabold text-[#E85D04]">{formatCurrency(data?.pendingAmount || 0)}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">Paid Invoices</span>
              <span className="text-2xl font-extrabold text-[#1A1A1A]">{data?.paidCount || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] card-shadow">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">Overdue Invoices</span>
              <span className="text-2xl font-extrabold text-[#DC2626]">{data?.overdueCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#E85D04]" />
                  <span>Revenue Share by Payment Gateway / Channel</span>
                </h3>
              </div>

              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-[#6B7280]">
                  No transaction data available yet.
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          dataKey="value"
                          paddingAngle={5}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E5E7EB] text-xs font-semibold">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}: {formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-[#1A1A1A] text-sm uppercase flex items-center gap-2">
                  <LineIcon className="w-4 h-4 text-[#E85D04]" />
                  <span>30-Day Daily Collection Inflow</span>
                </h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={10} />
                    <YAxis stroke="#6B7280" fontSize={10} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="inflow" stroke="#E85D04" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
};
