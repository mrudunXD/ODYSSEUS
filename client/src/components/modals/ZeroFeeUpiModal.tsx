import React, { useState } from 'react';
import { QrCode, X, Check, Copy, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Student } from '../../types';

interface ZeroFeeUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSuccess: (txData: any) => void;
}

export const ZeroFeeUpiModal: React.FC<ZeroFeeUpiModalProps> = ({
  isOpen,
  onClose,
  students,
  onSuccess,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(12500);
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const upiVpa = 'springfield.school@icici';
  const upiDeeplink = `upi://pay?pa=${upiVpa}&pn=Springfield%20International%20School&am=${amount}&tn=FeePayment-${currentStudent?.studentCode || 'INV'}&cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber) return;

    onSuccess({
      studentId: selectedStudentId,
      studentName: currentStudent?.name || 'Student',
      rollNo: currentStudent?.studentCode,
      category: 'Tuition Fee (Zero-Fee UPI)',
      amount,
      method: 'UPI',
      referenceNo: utrNumber,
      upiRef: utrNumber,
    });

    onClose();
    setUtrNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-bold">
              <QrCode className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Zero-Fee UPI Collection</h3>
              <p className="text-[11px] text-[#6B7280]">Direct bank settlement via UPI QR</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-[#1A1A1A] block mb-1">Select Student</label>
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
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-extrabold text-[#1A1A1A]"
            />
          </div>

          {/* Dynamic QR Display */}
          <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E7EB] text-center space-y-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Scan with BHIM / GPay / PhonePe / Paytm
            </span>
            <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto border border-[#E5E7EB] flex items-center justify-center shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiDeeplink)}`}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs pt-1">
              <span className="font-mono text-[#1A1A1A] font-bold">{upiVpa}</span>
              <button
                type="button"
                onClick={copyUpi}
                className="p-1 text-[#E85D04] hover:bg-[#FFF0E6] rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* UTR Form */}
          <form onSubmit={handleSubmitUtr} className="space-y-3">
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Enter 12-Digit UPI Reference (UTR No.)</label>
              <input
                type="text"
                required
                placeholder="e.g. 428910293812"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono text-xs font-bold text-[#1A1A1A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold rounded-2xl shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              Verify UPI UTR & Confirm Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
