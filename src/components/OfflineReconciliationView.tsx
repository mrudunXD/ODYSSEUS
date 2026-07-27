import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { FileSpreadsheet, Plus, CheckCircle2, XCircle, Clock, Building2, Search, Filter, ShieldCheck } from 'lucide-react';
import { OfflineReconciliation } from '../types';

export const OfflineReconciliationView: React.FC = () => {
  const {
    students,
    reconciliationQueue,
    recordOfflinePayment,
    updateReconciliationStatus,
    isOfflineRecOpen,
    setIsOfflineRecOpen,
  } = useFee();

  const [method, setMethod] = useState<'Cash' | 'Cheque'>('Cheque');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(12500);
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [notes, setNotes] = useState('Handed over at counter counter desk');

  const [filterStatus, setFilterStatus] = useState<string>('All');

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    recordOfflinePayment({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      method,
      amount: Number(amount),
      chequeNumber: method === 'Cheque' ? chequeNumber : undefined,
      bankName: method === 'Cheque' ? bankName : undefined,
      depositDate: new Date().toISOString().split('T')[0],
      recordedBy: 'Admin Malik',
      notes,
    });

    setIsOfflineRecOpen(false);
    // Reset
    setChequeNumber('');
  };

  const filteredQueue = reconciliationQueue.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE7DF] card-shadow">
        <div>
          <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">
            Offline Cash & Cheque Reconciliation Desk
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Log physical cash receipts, track bank cheque clearance status, and handle bounced instruments.
          </p>
        </div>
        <button
          onClick={() => setIsOfflineRecOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#FF4D00]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Counter Deposit</span>
        </button>
      </div>

      {/* Queue Filter & Stats */}
      <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#18181B]">Filter Pipeline:</span>
            {['All', 'Pending_Deposit', 'Realized', 'Bounced'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  filterStatus === st
                    ? 'bg-[#18181B] text-white'
                    : 'bg-[#FAF8F3] text-[#71717A] border border-[#EBE7DF] hover:text-[#18181B]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0ECE1] text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Instrument & Receipt</th>
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Bank / Cheque No.</th>
                <th className="pb-3 font-semibold">Deposit Date</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold pr-2">Reconcile Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EA] text-xs">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F3] transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold text-[#18181B] block">{item.method}</span>
                    <span className="text-[10px] text-[#71717A]">{item.receiptNo}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-[#18181B] block">{item.studentName}</span>
                    <span className="text-[10px] text-[#71717A]">{item.rollNo}</span>
                  </td>
                  <td className="py-3.5">
                    {item.method === 'Cheque' ? (
                      <div>
                        <span className="font-mono font-bold text-[#18181B] block">{item.chequeNumber}</span>
                        <span className="text-[10px] text-[#71717A]">{item.bankName}</span>
                      </div>
                    ) : (
                      <span className="text-[#71717A] font-semibold">Vaulted Cash</span>
                    )}
                  </td>
                  <td className="py-3.5 font-semibold text-[#18181B]">{item.depositDate}</td>
                  <td className="py-3.5 font-extrabold text-[#18181B]">${item.amount.toLocaleString()}</td>
                  <td className="py-3.5">
                    {item.status === 'Realized' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Realized
                      </span>
                    )}
                    {item.status === 'Pending_Deposit' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4D00] bg-[#FFF0EB] px-2.5 py-1 rounded-full border border-[#FF4D00]/20">
                        <Clock className="w-3 h-3" /> Pending Bank Deposit
                      </span>
                    )}
                    {item.status === 'Bounced' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3 h-3" /> Bounced
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    {item.status === 'Pending_Deposit' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateReconciliationStatus(item.id, 'Realized')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Mark Realized
                        </button>
                        <button
                          onClick={() => updateReconciliationStatus(item.id, 'Bounced')}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Bounced
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#A1A1AA] font-medium">Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit Modal */}
      {isOfflineRecOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
              <h3 className="font-extrabold text-[#18181B] text-base">Record Offline Counter Receipt</h3>
              <button onClick={() => setIsOfflineRecOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#18181B] block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('Cheque')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      method === 'Cheque'
                        ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                        : 'bg-[#FAF8F3] text-[#71717A] border-[#EBE7DF]'
                    }`}
                  >
                    Bank Cheque
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('Cash')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      method === 'Cash'
                        ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                        : 'bg-[#FAF8F3] text-[#71717A] border-[#EBE7DF]'
                    }`}
                  >
                    Physical Cash
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo} - {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              {method === 'Cheque' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#18181B] block mb-1">Cheque Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CHQ-991823"
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-mono font-bold text-[#18181B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#18181B] block mb-1">Drawee Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Remarks / Slip Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => setIsOfflineRecOpen(false)}
                  className="px-4 py-2 bg-[#FAF8F3] border border-[#EBE7DF] text-[#18181B] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF4D00] text-white font-bold rounded-xl hover:bg-[#E04400] shadow-md shadow-[#FF4D00]/20"
                >
                  Log Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
