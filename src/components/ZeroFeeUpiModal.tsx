import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { QrCode, X, Check, Copy, ShieldCheck } from 'lucide-react';

export const ZeroFeeUpiModal: React.FC = () => {
  const {
    students,
    isUpiOpen,
    setIsUpiOpen,
    addTransaction,
    setActiveReceiptTx,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(12500);
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isUpiOpen) return null;

  const student = students.find((s) => s.id === selectedStudentId);
  const upiVpa = 'nueansa.school@icici';
  const upiLink = `upi://pay?pa=${upiVpa}&pn=Nueansa%20School&am=${amount}&cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber) return;

    const tx = addTransaction({
      studentId: selectedStudentId,
      studentName: student?.name || 'Student Parent',
      rollNo: student?.rollNo,
      category: 'Tuition Fee (Zero-Fee UPI)',
      amount,
      type: 'Inflow',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      method: 'UPI_QR',
      status: 'Completed',
      referenceNo: utrNumber,
      notes: `Verified zero-fee UPI collection. VPA: ${upiVpa}`,
    });

    setSubmitted(true);
    setTimeout(() => {
      setIsUpiOpen(false);
      setSubmitted(false);
      setActiveReceiptTx(tx);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base">Zero-Fee UPI Instant Payment</h3>
              <p className="text-[11px] text-[#71717A]">Direct bank settlement via UPI QR</p>
            </div>
          </div>
          <button onClick={() => setIsUpiOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold text-xl">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#18181B]">UPI Payment Verified!</h4>
            <p className="text-xs text-[#71717A]">Generating official receipt...</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 text-xs">
            <div>
              <label className="font-bold text-[#18181B] block mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2 font-semibold text-[#18181B]"
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
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2 font-semibold text-[#18181B]"
              />
            </div>

            {/* Dynamic QR Display */}
            <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#EBE7DF] text-center space-y-2">
              <span className="text-[10px] font-bold text-[#71717A] tracking-wider uppercase block">
                Scan with BHIM / GPay / PhonePe / Paytm
              </span>
              <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto border border-[#EBE7DF] flex items-center justify-center shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs pt-1">
                <span className="font-mono text-[#18181B] font-bold">{upiVpa}</span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="p-1 text-[#FF4D00] hover:bg-[#FFF0EB] rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* UTR Form */}
            <form onSubmit={handleSubmitUtr} className="space-y-3">
              <div>
                <label className="font-bold text-[#18181B] block mb-1">Enter 12-Digit UPI Reference (UTR No.)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 428910293812"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-mono text-xs font-bold text-[#18181B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF4D00] hover:bg-[#E04400] text-white font-bold rounded-xl shadow-md shadow-[#FF4D00]/20 transition-all cursor-pointer"
              >
                Confirm UPI Payment & Issue Receipt
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
