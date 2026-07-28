import React, { useState } from 'react';
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
import {
  Download,
  ChevronDown,
  Search,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Student, FeeType, Transaction, ChartDayPoint } from '../types';

export const Dashboard: React.FC = () => {
  // State for Modals
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Realistic Domain Data
  const [students] = useState<Student[]>([
    {
      id: 'STU-101',
      schoolId: 'SCH-01',
      classId: 'CLS-11A',
      studentCode: '2025-101',
      name: 'Aarav Sharma',
      parentName: 'Rajesh Sharma',
      parentEmail: 'rajesh.sharma@example.com',
      parentPhone: '+91 98765 43210',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-11A', schoolId: 'SCH-01', name: 'Class 11', section: 'A' },
      totalAssigned: 17500,
      paidAmount: 17500,
      balanceDue: 0,
      status: 'PAID',
    },
    {
      id: 'STU-102',
      schoolId: 'SCH-01',
      classId: 'CLS-12B',
      studentCode: '2025-102',
      name: 'Sofia Martinez',
      parentName: 'Elena Martinez',
      parentEmail: 'elena.m@example.com',
      parentPhone: '+91 98123 45678',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-12B', schoolId: 'SCH-01', name: 'Class 12', section: 'B' },
      totalAssigned: 17500,
      paidAmount: 10000,
      balanceDue: 5000,
      status: 'PARTIAL',
    },
    {
      id: 'STU-103',
      schoolId: 'SCH-01',
      classId: 'CLS-10C',
      studentCode: '2025-103',
      name: 'Rohan Verma',
      parentName: 'Vikram Verma',
      parentEmail: 'vikram.v@example.com',
      parentPhone: '+91 99887 76655',
      isActive: true,
      createdAt: '2025-09-01T00:00:00Z',
      class: { id: 'CLS-10C', schoolId: 'SCH-01', name: 'Class 10', section: 'C' },
      totalAssigned: 15700,
      paidAmount: 0,
      balanceDue: 15700,
      status: 'OVERDUE',
      overdueDays: 42,
    },
  ]);

  const [feeTypes] = useState<FeeType[]>([
    {
      id: 'FEE-101',
      schoolId: 'SCH-01',
      name: 'Senior High Tuition Fee',
      amount: 12500,
      frequency: 'QUARTERLY',
      isActive: true,
      lateFeePerDay: 50,
      gracePeriodDays: 5,
      applicableTo: 'ALL',
      createdAt: '2025-09-01T00:00:00Z',
    },
    {
      id: 'FEE-102',
      schoolId: 'SCH-01',
      name: 'School Bus Transport - Route A',
      amount: 3200,
      frequency: 'MONTHLY',
      isActive: true,
      lateFeePerDay: 20,
      gracePeriodDays: 5,
      applicableTo: 'CLASS_SPECIFIC',
      createdAt: '2025-09-01T00:00:00Z',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-9901',
      schoolId: 'SCH-01',
      invoiceId: 'INV-1001',
      studentName: 'Aarav Sharma',
      amount: 17500,
      method: 'RAZORPAY',
      status: 'SUCCESS',
      referenceNo: 'pay_rzp_948271',
      razorpayPaymentId: 'pay_rzp_948271',
      createdAt: '2025-12-05T00:00:00Z',
    },
    {
      id: 'TXN-9902',
      schoolId: 'SCH-01',
      invoiceId: 'INV-1002',
      studentName: 'Sofia Martinez',
      amount: 10000,
      method: 'CASH',
      status: 'SUCCESS',
      referenceNo: 'CSH_CNTR_441',
      createdAt: '2025-12-07T00:00:00Z',
    },
    {
      id: 'TXN-9903',
      schoolId: 'SCH-01',
      invoiceId: 'INV-EXP-01',
      studentName: 'Lab Robotics Consumables',
      amount: 4200,
      method: 'CHEQUE',
      status: 'SUCCESS',
      referenceNo: 'CHQ_VENDOR_881',
      createdAt: '2025-12-08T00:00:00Z',
    },
  ]);

  const chartData: ChartDayPoint[] = [
    { date: 'Dec 01', fullDate: '01 Dec 2025', inflow: 4800, outflow: 4200 },
    { date: 'Dec 02', fullDate: '02 Dec 2025', inflow: 2400, outflow: 5800 },
    { date: 'Dec 03', fullDate: '03 Dec 2025', inflow: 6200, outflow: 3100 },
    { date: 'Dec 04', fullDate: '04 Dec 2025', inflow: 3900, outflow: 1800 },
    { date: 'Dec 05', fullDate: '05 Dec 2025', inflow: 17500, outflow: 2110 },
    { date: 'Dec 06', fullDate: '06 Dec 2025', inflow: 5800, outflow: 3800 },
    { date: 'Dec 07', fullDate: '07 Dec 2025', inflow: 10000, outflow: 1200 },
    { date: 'Dec 08', fullDate: '08 Dec 2025', inflow: 1800, outflow: 4200 },
    { date: 'Dec 09', fullDate: '09 Dec 2025', inflow: 3900, outflow: 3200 },
  ];

  // Dynamic Metrics
  const totalRevenue = transactions.filter((t) => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
  const netPending = students.reduce((s, st) => s + (st.balanceDue || 0), 0);
  const totalWaivers = 2500;
  const activeStudents = 100;
  const netProfit = totalRevenue - 4200;

  const handleExport = () => {
    const csv =
      'Transaction ID,Student Name,Method,Amount,Status,Date\n' +
      transactions.map((t) => `${t.id},${t.studentName},${t.method},${t.amount},${t.status},${formatDate(t.createdAt)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolFin_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const handleAddPaymentSuccess = (txData: any) => {
    const newTx: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      schoolId: 'SCH-01',
      invoiceId: 'INV-2025',
      studentName: txData.studentName,
      amount: txData.amount,
      method: txData.method,
      status: 'SUCCESS',
      referenceNo: txData.referenceNo,
      razorpayPaymentId: txData.razorpayPaymentId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <PageWrapper>
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Good Morning, Malik!
          </h1>
          <p className="text-xs font-medium text-[#6B7280] mt-1">
            Today is {formatDate(new Date())} | Springfield International School
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] card-shadow hover:border-[#E85D04] transition-colors"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1 z-30 animate-in fade-in">
                {['This Month', 'Last Month', 'FY 2025-26', 'All Time'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedPeriod === p ? 'bg-[#FFF0E6] text-[#E85D04]' : 'text-[#1A1A1A] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (4 cards with clean percentage growth deltas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Revenue"
          value={totalRevenue}
          deltaPercent={9.5}
        />
        <KPICard
          title="Net Fees Pending"
          value={netPending}
          deltaPercent={-4.2}
        />
        <KPICard
          title="Total Waivers"
          value={totalWaivers}
          deltaPercent={12.4}
        />
        <KPICard
          title="Active Students"
          value={activeStudents}
          isCurrency={false}
          deltaPercent={5.1}
        />
      </div>

      {/* Main 70/30 Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Left 8 Cols: Recharts Cash Flow Dual Bar Chart */}
        <div className="lg:col-span-8">
          <CashFlowChart data={chartData} monthlyTotal={totalRevenue} />
        </div>

        {/* Right 4 Cols: Financial Sidebar Panel */}
        <div className="lg:col-span-4">
          <Sidebar
            totalRevenue={totalRevenue}
            netProfit={netProfit}
            operatingExpenses={4200}
            collectionRatePercent={78}
            onOpenRazorpay={() => setIsRazorpayOpen(true)}
            onOpenUpi={() => setIsUpiOpen(true)}
            onOpenOfflineRec={() => setIsOfflineOpen(true)}
          />
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Transaction History & Ledger
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Name or Amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
              />
            </div>

            <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] transition-colors">
              <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="pb-3 pl-2 w-10">
                  <button
                    onClick={() =>
                      setSelectedIds(selectedIds.length === transactions.length ? [] : transactions.map((t) => t.id))
                    }
                    className="text-[#6B7280]"
                  >
                    {selectedIds.length === transactions.length ? (
                      <CheckSquare className="w-4 h-4 text-[#E85D04]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="pb-3 font-semibold">Transaction</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-xs">
              {transactions
                .filter((tx) => tx.studentName?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-[#F5F5F0] transition-colors ${
                        isSelected ? 'bg-[#FFF0E6]/50' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-2">
                        <button onClick={() => toggleSelect(tx.id)} className="text-[#6B7280]">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#E85D04]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 font-bold text-[#1A1A1A]">{tx.studentName}</td>

                      <td className="py-3.5">
                        <span className="px-3 py-1 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-[11px] font-bold text-[#1A1A1A]">
                          {tx.method}
                        </span>
                      </td>

                      <td className="py-3.5 font-semibold text-[#1A1A1A]">{formatDate(tx.createdAt)}</td>

                      <td className="py-3.5 font-extrabold text-[#E85D04]">
                        {formatCurrency(tx.amount)}
                      </td>

                      <td className="py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Modals */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        students={students}
        feeTypes={feeTypes}
        onSuccess={handleAddPaymentSuccess}
      />

      <ZeroFeeUpiModal
        isOpen={isUpiOpen}
        onClose={() => setIsUpiOpen(false)}
        students={students}
        onSuccess={handleAddPaymentSuccess}
      />

      <OfflineRecordModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        students={students}
        onSuccess={handleAddPaymentSuccess}
      />
    </PageWrapper>
  );
};
