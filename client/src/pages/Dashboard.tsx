import React, { useEffect, useState, useCallback, useId } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Sidebar } from '../components/layout/Sidebar';
import { KPICard } from '../components/ui/KPICard';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RazorpayCheckoutModal } from '../components/modals/RazorpayCheckoutModal';
import { ZeroFeeUpiModal } from '../components/modals/ZeroFeeUpiModal';
import { OfflineRecordModal } from '../components/modals/OfflineRecordModal';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import {
  Download,
  ChevronDown,
  Search,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  TrendingUp,
  Clock,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { Student, FeeType, ChartDayPoint } from '../types';

interface DashboardStats {
  totalRevenue: number;
  netPending: number;
  totalWaivers: number;
  activeStudents: number;
  revenueDeltaPercent: number;
  pendingDeltaPercent: number;
  collectionRatePercent: number;
  aiInsight: string;
}

interface LiveTransaction {
  id: string;
  amount: number;
  method: string;
  status: string;
  referenceNo: string | null;
  createdAt: string;
  invoice: {
    invoiceNo: string;
    student: { name: string; studentCode: string };
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { push } = useToastStore();
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchInputId = useId();

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    netPending: 0,
    totalWaivers: 0,
    activeStudents: 0,
    revenueDeltaPercent: 0,
    pendingDeltaPercent: 0,
    collectionRatePercent: 0,
    aiInsight: 'Loading financial intelligence...',
  });

  const [chartData, setChartData] = useState<ChartDayPoint[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, chartRes, stuRes, feesRes, txRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/dashboard/chart-data'),
        apiClient.get('/students'),
        apiClient.get('/fees'),
        apiClient.get('/transactions'),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (chartRes.data?.data) setChartData(chartRes.data.data);
      if (stuRes.data?.data) setStudents(stuRes.data.data);
      if (feesRes.data?.data) setFeeTypes(feesRes.data.data);
      if (txRes.data?.data) setTransactions(txRes.data.data);
    } catch (err: any) {
      push('error', 'Failed to fetch dashboard data', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = () => {
    if (transactions.length === 0) {
      push('warning', 'No transactions available to export');
      return;
    }
    const csv =
      'Transaction ID,Student,Method,Amount,Status,Date\n' +
      transactions
        .map((t) =>
          `${t.id},"${t.invoice?.student?.name || ''}",${t.method},${t.amount},${t.status},${formatDate(t.createdAt)}`
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolFin_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    push('success', 'Exported transaction ledger to CSV');
  };

  const handlePaymentSuccess = () => fetchDashboardData();

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    push('info', `Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const filteredTx = transactions.filter((tx) => {
    const name = tx.invoice?.student?.name?.toLowerCase() || '';
    const ref = tx.referenceNo?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();
    return name.includes(q) || ref.includes(q);
  });

  return (
    <PageWrapper>
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-3 focus:bg-[#E85D04] focus:text-white focus:z-50 rounded-xl">
        Skip to main content
      </a>

      <main id="main-content">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {greeting()}, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-xs font-medium text-[#6B7280] mt-1">
              {formatDate(new Date())} &middot; {user?.role?.replace('_', ' ')} &middot; Springfield International School
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              aria-label="Refresh dashboard data"
              className="p-2.5 min-w-[44px] min-h-[44px] bg-white border border-[#E5E7EB] rounded-xl card-shadow hover:border-[#E85D04] active:scale-[0.98] transition-all flex items-center justify-center"
              title="Refresh live data from database"
            >
              <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                aria-haspopup="true"
                aria-expanded={isPeriodOpen}
                className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] card-shadow hover:border-[#E85D04] active:scale-[0.98] transition-all"
              >
                <span>{selectedPeriod}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {isPeriodOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                  {['Last 30 Days', 'This Month', 'Last Month', 'FY 2025-26'].map((p) => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPeriod(p); setIsPeriodOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[40px] flex items-center ${
                        selectedPeriod === p ? 'bg-[#FFF0E6] text-[#E85D04] font-bold' : 'text-[#1A1A1A] hover:bg-[#F5F5F0]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#E85D04] hover:bg-[#C44D00] active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Revenue Collected"
            value={stats.totalRevenue}
            deltaPercent={stats.revenueDeltaPercent}
          />
          <KPICard
            title="Fees Outstanding"
            value={stats.netPending}
            deltaPercent={stats.pendingDeltaPercent}
          />
          <KPICard
            title="Total Waivers Applied"
            value={stats.totalWaivers}
            deltaPercent={0}
          />
          <KPICard
            title="Active Students"
            value={stats.activeStudents}
            isCurrency={false}
            deltaPercent={0}
          />
        </div>

        {/* Chart + Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
          <div className="lg:col-span-8">
            {isLoading && chartData.length === 0 ? (
              <div className="bg-white h-72 rounded-3xl border border-[#E5E7EB] card-shadow flex items-center justify-center animate-pulse">
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E85D04]" />
                  Loading live cash flow...
                </div>
              </div>
            ) : chartData.every((d) => d.inflow === 0) ? (
              <div className="bg-white h-72 rounded-3xl border border-[#E5E7EB] card-shadow flex flex-col items-center justify-center gap-3 p-6 text-center">
                <TrendingUp className="w-10 h-10 text-[#E85D04]/30" />
                <div>
                  <p className="text-sm font-extrabold text-[#1A1A1A]">No Transaction Volume Recorded</p>
                  <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                    Record a counter payment or execute a Razorpay payment to view daily cash inflow trends.
                  </p>
                </div>
              </div>
            ) : (
              <CashFlowChart data={chartData} monthlyTotal={stats.totalRevenue} />
            )}
          </div>

          <div className="lg:col-span-4">
            <Sidebar
              totalRevenue={stats.totalRevenue}
              netProfit={stats.totalRevenue}
              operatingExpenses={0}
              collectionRatePercent={stats.collectionRatePercent}
              aiInsight={stats.aiInsight}
              onOpenRazorpay={() => setIsRazorpayOpen(true)}
              onOpenUpi={() => setIsUpiOpen(true)}
              onOpenOfflineRec={() => setIsOfflineOpen(true)}
            />
          </div>
        </div>

        {/* Live Transaction Ledger */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-extrabold text-[#1A1A1A] tracking-tight">
                Live Transaction Ledger
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {filteredTx.length} of {transactions.length} transactions displayed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <label htmlFor={searchInputId} className="sr-only">Search transactions</label>
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={searchInputId}
                  type="text"
                  placeholder="Search student or ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04] transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] active:scale-[0.98] transition-all shrink-0"
              >
                <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
                Filter
              </button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Clock className="w-10 h-10 text-[#E5E7EB]" />
              <p className="text-sm font-extrabold text-[#1A1A1A]">No transactions recorded yet</p>
              <p className="text-xs text-[#6B7280]">
                Use the payment buttons on the right panel to record your first transaction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="pb-3 pl-2 w-10">
                      <button
                        onClick={() =>
                          setSelectedIds(selectedIds.length === transactions.length ? [] : transactions.map((t) => t.id))
                        }
                        aria-label="Select all transactions"
                        className="min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        {selectedIds.length === transactions.length && transactions.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#E85D04]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Invoice No</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Transaction Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] text-xs">
                  {filteredTx.map((tx) => {
                    const isSelected = selectedIds.includes(tx.id);
                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-[#F5F5F0] transition-colors ${isSelected ? 'bg-[#FFF0E6]/40' : ''}`}
                      >
                        <td className="py-3.5 pl-2">
                          <button
                            onClick={() => toggleSelect(tx.id)}
                            aria-label={`Select transaction ${tx.id}`}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#E85D04]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#6B7280]" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-[#1A1A1A] block">
                            {tx.invoice?.student?.name || 'Unknown'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.invoice?.student?.studentCode || '', tx.id)}
                            className="text-[10px] font-mono text-[#6B7280] hover:text-[#E85D04] flex items-center gap-1 transition-colors"
                            title="Click to copy student code"
                          >
                            <span>{tx.invoice?.student?.studentCode}</span>
                            {copiedId === tx.id ? <Check className="w-2.5 h-2.5 text-[#16A34A]" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </td>
                        <td className="py-3.5 font-mono text-[#6B7280] text-[11px]">{tx.invoice?.invoiceNo}</td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 bg-[#F5F5F0] border border-[#E5E7EB] rounded-lg text-[11px] font-bold text-[#1A1A1A]">
                            {tx.method}
                          </span>
                        </td>
                        <td className="py-3.5 font-semibold text-[#1A1A1A]">{formatDate(tx.createdAt)}</td>
                        <td className="py-3.5 font-mono font-extrabold text-[#E85D04]">{formatCurrency(tx.amount)}</td>
                        <td className="py-3.5">
                          <StatusBadge status={tx.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        students={students}
        feeTypes={feeTypes}
        onSuccess={handlePaymentSuccess}
      />
      <ZeroFeeUpiModal
        isOpen={isUpiOpen}
        onClose={() => setIsUpiOpen(false)}
        students={students}
        onSuccess={handlePaymentSuccess}
      />
      <OfflineRecordModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        students={students}
        onSuccess={handlePaymentSuccess}
      />
    </PageWrapper>
  );
};
