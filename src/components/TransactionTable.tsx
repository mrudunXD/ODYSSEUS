import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Search, Filter, MoreHorizontal, FileText, ArrowUpRight, ArrowDownLeft, CheckSquare, Square, Plus, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';

export const TransactionTable: React.FC = () => {
  const { transactions, setActiveReceiptTx, addTransaction, deleteTransaction, students } = useFee();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'Inflow' | 'Outflow'>('Inflow');
  const [txCategory, setTxCategory] = useState('Tuition Fee Collection');
  const [txAmount, setTxAmount] = useState(5000);
  const [txStudentId, setTxStudentId] = useState(students[0]?.id || '');
  const [txMethod, setTxMethod] = useState<'Razorpay' | 'UPI_QR' | 'Cash' | 'Cheque'>('Razorpay');
  const [txNotes, setTxNotes] = useState('');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    return matchesSearch;
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

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === txStudentId);
    
    addTransaction({
      studentId: txType === 'Inflow' ? student?.id : undefined,
      studentName: txType === 'Inflow' && student ? student.name : 'Operational Vendor',
      rollNo: txType === 'Inflow' && student ? student.rollNo : undefined,
      category: txCategory,
      amount: Number(txAmount),
      type: txType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      method: txMethod,
      status: 'Completed',
      referenceNo: `REF_${Math.floor(100000 + Math.random() * 900000)}`,
      notes: txNotes,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow">
      {/* Header with Search, Filter and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-base font-bold text-[#18181B]">Transaction History & Ledger</h3>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Field */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name or Amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF4D00] transition-colors"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF4D00] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#E04400] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
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
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 text-right pr-2 font-semibold">Actions</th>
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

                  {/* Categories Pill Badge */}
                  <td className="py-3.5">
                    <span className="inline-block px-3 py-1 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-[11px] font-bold text-[#18181B]">
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 font-semibold text-[#18181B]">{tx.date}</td>

                  {/* Amount */}
                  <td className="py-3.5">
                    <span
                      className={`font-extrabold ${
                        isOutflow ? 'text-[#18181B]' : 'text-[#FF4D00]'
                      }`}
                    >
                      {isOutflow ? '-' : '+'}${tx.amount.toLocaleString('en-US')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setActiveReceiptTx(tx)}
                        className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF4D00] hover:bg-[#FFF0EB] transition-colors"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg text-[#71717A] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
              <h3 className="font-extrabold text-[#18181B] text-base">Record Financial Transaction</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#18181B] block mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('Inflow')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      txType === 'Inflow'
                        ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                        : 'bg-[#FAF8F3] text-[#71717A] border-[#EBE7DF]'
                    }`}
                  >
                    Fee Collection (Inflow)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('Outflow')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      txType === 'Outflow'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-[#FAF8F3] text-[#71717A] border-[#EBE7DF]'
                    }`}
                  >
                    Operational Expense (Outflow)
                  </button>
                </div>
              </div>

              {txType === 'Inflow' && (
                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Student</label>
                  <select
                    value={txStudentId}
                    onChange={(e) => setTxStudentId(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo} - {s.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Category / Purpose</label>
                <input
                  type="text"
                  required
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="e.g. Tuition Fee Collection / Sports Equipment"
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-bold text-[#18181B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Method</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="UPI_QR">UPI QR</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Notes</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF8F3] border border-[#EBE7DF] text-[#18181B] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF4D00] text-white font-bold rounded-xl hover:bg-[#E04400] shadow-md shadow-[#FF4D00]/20"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
