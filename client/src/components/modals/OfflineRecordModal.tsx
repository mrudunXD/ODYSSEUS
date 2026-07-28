import React, { useState } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { Student } from '../../types';

interface OfflineRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSuccess: (recData: any) => void;
}

export const OfflineRecordModal: React.FC<OfflineRecordModalProps> = ({
  isOpen,
  onClose,
  students,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'CASH' | 'CHEQUE'>('CHEQUE');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(12500);
  const [chequeNo, setChequeNo] = useState('');
  const [chequeBank, setChequeBank] = useState('HDFC Bank');
  const [notes, setNotes] = useState('Counter deposit receipt');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    onSuccess({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      rollNo: currentStudent.studentCode,
      method,
      amount: Number(amount),
      chequeNo: method === 'CHEQUE' ? chequeNo : undefined,
      chequeBank: method === 'CHEQUE' ? chequeBank : undefined,
      depositDate: new Date().toISOString().split('T')[0],
      recordedBy: 'Accountant Malik',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Record Counter Deposit</h3>
              <p className="text-[11px] text-[#6B7280]">Cash or Cheque Reconciliation Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Instrument Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('CHEQUE')}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  method === 'CHEQUE'
                    ? 'bg-[#E85D04] text-white border-[#E85D04]'
                    : 'bg-[#F5F5F0] text-[#6B7280] border-[#E5E7EB]'
                }`}
              >
                Bank Cheque
              </button>
              <button
                type="button"
                onClick={() => setMethod('CASH')}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  method === 'CASH'
                    ? 'bg-[#E85D04] text-white border-[#E85D04]'
                    : 'bg-[#F5F5F0] text-[#6B7280] border-[#E5E7EB]'
                }`}
              >
                Counter Cash
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentCode} - {s.class?.name || 'Class 10'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-extrabold text-[#1A1A1A]"
            />
          </div>

          {method === 'CHEQUE' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Cheque No.</label>
                <input
                  type="text"
                  required
                  placeholder="CHQ-778901"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={chequeBank}
                  onChange={(e) => setChequeBank(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Notes / Counter Slip Details</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20"
            >
              Log Counter Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
