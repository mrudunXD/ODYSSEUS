import React, { useState } from 'react';
import { SplitText } from './react-bits/SplitText';
import { ChevronDown, Download } from 'lucide-react';
import { useFee } from '../context/FeeContext';

export const HeaderBanner: React.FC = () => {
  const { currencySymbol } = useFee();
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = ['This Term', 'Last Month', 'FY 2025-26', 'All Time'];

  const handleExport = () => {
    // Generate CSV report download
    const csvContent =
      'data:text/csv;charset=utf-8,Category,Amount,Date,Status\nTuition Fee,12500,Dec 05 2025,Completed\nTransport Fee,3200,Dec 07 2025,Completed\nLate Penalty,500,Dec 08 2025,Pending';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nueansa_Fee_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Left Greeting & Date */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18181B] tracking-tight">
          <SplitText text="Good Afternoon, Malik!" />
        </h1>
        <p className="text-sm font-medium text-[#71717A] mt-1">
          Today is Saturday, December 25th, 2025
        </p>
      </div>

      {/* Right Controls: Period Selector & Export Button */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] shadow-xs hover:border-[#FF4D00] transition-colors"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#EBE7DF] rounded-xl shadow-lg p-1 z-30 animate-in fade-in">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedPeriod === p ? 'bg-[#FFF0EB] text-[#FF4D00]' : 'text-[#18181B] hover:bg-[#F8F6F0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orange Export Button matching screenshot */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF4D00]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
