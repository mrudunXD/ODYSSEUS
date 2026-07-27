import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Search, Filter, MoreHorizontal, FileText, ArrowUpRight, ArrowDownLeft, CheckSquare, Square } from 'lucide-react';
import { Transaction } from '../types';

export const TransactionTable: React.FC = () => {
  const { transactions, setActiveReceiptTx } = useFee();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || tx.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow">
      {/* Header with Search and Filter matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-base font-bold text-[#18181B]">Transaction History</h3>

        <div className="flex items-center gap-3">
          {/* Search Field matching screenshot */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name or Amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF4D00] transition-colors"
            />
          </div>

          {/* Filter Button matching screenshot */}
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] hover:border-[#FF4D00] transition-colors cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F0ECE1] text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
              <th className="pb-3 pl-2 w-10">
                <button onClick={toggleAll} className="text-[#A1A1AA] hover:text-[#18181B]">
                  {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#FF4D00]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="pb-3 font-semibold">Transaction</th>
              <th className="pb-3 font-semibold">Categories</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 text-right pr-2 font-semibold">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F2EA] text-xs">
            {filteredTransactions.map((tx) => {
              const isSelected = selectedIds.includes(tx.id);
              const isOutflow = tx.type === 'Outflow';

              return (
                <tr
                  key={tx.id}
                  className={`group hover:bg-[#FAF8F3] transition-colors ${
                    isSelected ? 'bg-[#FFF0EB]/50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 pl-2">
                    <button onClick={() => toggleSelect(tx.id)} className="text-[#A1A1AA]">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#FF4D00]" />
                      ) : (
                        <Square className="w-4 h-4 group-hover:text-[#71717A]" />
                      )}
                    </button>
                  </td>

                  {/* Transaction Name & Icon */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isOutflow
                            ? 'bg-[#18181B] text-white'
                            : 'bg-[#FFF0EB] text-[#FF4D00] border border-[#FF4D00]/20'
                        }`}
                      >
                        {isOutflow ? (
                          <ArrowDownLeft className="w-4 h-4 text-white" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-[#FF4D00]" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#18181B] block">{tx.studentName}</span>
                        {tx.rollNo && <span className="text-[10px] text-[#71717A]">{tx.rollNo}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Categories Pill Badge matching screenshot */}
                  <td className="py-3.5">
                    <span className="inline-block px-3 py-1 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-[11px] font-bold text-[#18181B]">
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 font-semibold text-[#18181B]">{tx.date}</td>

                  {/* Amount matching screenshot format */}
                  <td className="py-3.5">
                    <span
                      className={`font-extrabold ${
                        isOutflow ? 'text-[#18181B]' : 'text-[#FF4D00]'
                      }`}
                    >
                      {isOutflow ? '-' : '+'}${tx.amount.toLocaleString('en-US')}
                    </span>
                  </td>

                  {/* Receipt Action */}
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => setActiveReceiptTx(tx)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF4D00] hover:bg-[#FFF0EB] transition-colors"
                      title="View Digital Receipt"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
