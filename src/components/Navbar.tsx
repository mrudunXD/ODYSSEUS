import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Bell, Search, Layers, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useFee();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'FeeEngine', label: 'Fee Engine' },
    { id: 'Transactions', label: 'Transactions' },
    { id: 'OfflineRec', label: 'Offline Reconciliation' },
    { id: 'Defaulters', label: 'Defaulters & Reports' },
    { id: 'Invoices', label: 'Invoices' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#EBE7DF] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-[#FF4D00] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <span className="font-extrabold tracking-wider">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#18181B]">
            Nueansa <span className="text-[#71717A] text-sm font-medium">EduPay</span>
          </span>
        </div>

        {/* Center: Navigation Tabs matching exact image underline style */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F0ECE1]/50 p-1 rounded-full border border-[#E4E0D5]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-1.5 text-sm font-semibold transition-all rounded-full ${
                  isActive
                    ? 'text-[#18181B] bg-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-white/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-[#FF4D00] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full bg-white border border-[#EBE7DF] flex items-center justify-center text-[#18181B] hover:border-[#FF4D00] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D00] rounded-full ring-2 ring-white" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EBE7DF] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                  <span className="font-bold text-sm text-[#18181B]">Financial Alerts</span>
                  <span className="text-xs bg-[#FFF0EB] text-[#FF4D00] px-2 py-0.5 rounded-full font-semibold">2 New</span>
                </div>
                <div className="divide-y divide-[#F5F2EA] text-xs">
                  <div className="py-3">
                    <p className="font-semibold text-[#18181B]">Cheque Cleared</p>
                    <p className="text-[#71717A] mt-0.5">HDFC Cheque CHQ-778901 ($12,500) realized successfully.</p>
                    <span className="text-[10px] text-[#A1A1AA] mt-1 block">10 mins ago</span>
                  </div>
                  <div className="py-3">
                    <p className="font-semibold text-[#18181B]">Late Fee Auto-Applied</p>
                    <p className="text-[#71717A] mt-0.5">$50 penalty added to 5 overdue Grade 10 accounts.</p>
                    <span className="text-[10px] text-[#A1A1AA] mt-1 block">1 hour ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Button */}
          <button className="w-10 h-10 rounded-full bg-white border border-[#EBE7DF] flex items-center justify-center text-[#18181B] hover:border-[#FF4D00] transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* User Profile matching image (Avatar + Name "Malik") */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#EBE7DF]">
            <div className="w-9 h-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-white shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Malik"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-bold text-[#18181B] hidden sm:inline-block">Malik</span>
          </div>
        </div>
      </div>
    </header>
  );
};
