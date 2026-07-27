import React from 'react';
import { FeeProvider, useFee } from './context/FeeContext';
import { Navbar } from './components/Navbar';
import { HeaderBanner } from './components/HeaderBanner';
import { StatCards } from './components/StatCards';
import { CashFlowChart } from './components/CashFlowChart';
import { FinancialGauge } from './components/FinancialGauge';
import { TransactionTable } from './components/TransactionTable';
import { MyCardQuickActions } from './components/MyCardQuickActions';
import { FeeEngineModal } from './components/FeeEngineModal';
import { OfflineReconciliationView } from './components/OfflineReconciliationView';
import { DefaulterTrackerView } from './components/DefaulterTrackerView';
import { RazorpayModal } from './components/RazorpayModal';
import { ZeroFeeUpiModal } from './components/ZeroFeeUpiModal';
import { ReceiptInvoiceModal } from './components/ReceiptInvoiceModal';

const DashboardContent: React.FC = () => {
  const { activeTab } = useFee();

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
      {activeTab === 'Dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Greeting Hero */}
          <HeaderBanner />

          {/* Top 4 Stat Metric Cards */}
          <StatCards />

          {/* Main 2 Column Layout (matching screenshot 8-col left, 4-col right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Columns: Cash Flow Dual Bar Chart */}
            <div className="lg:col-span-8">
              <CashFlowChart />
            </div>

            {/* Right 4 Columns: Financial Gauge & AI Insights */}
            <div className="lg:col-span-4">
              <FinancialGauge />
            </div>
          </div>

          {/* Bottom Row (8-col Transaction Table, 4-col My Card & Quick Actions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Columns: Transaction History */}
            <div className="lg:col-span-8">
              <TransactionTable />
            </div>

            {/* Right 4 Columns: My Card & Quick Action Buttons */}
            <div className="lg:col-span-4">
              <MyCardQuickActions />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FeeEngine' && (
        <div className="animate-in fade-in duration-300">
          <FeeEngineModal />
        </div>
      )}

      {activeTab === 'Transactions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl border border-[#EBE7DF] card-shadow">
            <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight mb-1">Omnichannel Financial Transactions</h2>
            <p className="text-xs text-[#71717A]">Complete audit trail of Razorpay, UPI QR, Cash, and Cheque entries.</p>
          </div>
          <TransactionTable />
        </div>
      )}

      {activeTab === 'OfflineRec' && (
        <div className="animate-in fade-in duration-300">
          <OfflineReconciliationView />
        </div>
      )}

      {activeTab === 'Defaulters' && (
        <div className="animate-in fade-in duration-300">
          <DefaulterTrackerView />
        </div>
      )}

      {activeTab === 'Invoices' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl border border-[#EBE7DF] card-shadow">
            <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight mb-1">Official Student Invoices & Fee Ledger</h2>
            <p className="text-xs text-[#71717A]">Download verified digital receipts with embedded tamper-proof QR codes.</p>
          </div>
          <TransactionTable />
        </div>
      )}
    </main>
  );
};

export function App() {
  return (
    <FeeProvider>
      <div className="min-h-screen bg-[#F8F6F0] text-[#18181B] pb-12">
        <Navbar />
        <DashboardContent />
        <RazorpayModal />
        <ZeroFeeUpiModal />
        <ReceiptInvoiceModal />
      </div>
    </FeeProvider>
  );
}

export default App;
