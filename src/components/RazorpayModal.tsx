import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Zap, X, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const {
    students,
    feeStructures,
    isRazorpayOpen,
    setIsRazorpayOpen,
    processRazorpayPayment,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedFeeCategory, setSelectedFeeCategory] = useState(feeStructures[0]?.title || 'Tuition Fee');
  const [amount, setAmount] = useState(12500);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isRazorpayOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await processRazorpayPayment(selectedStudentId, Number(amount), selectedFeeCategory);
      setIsRazorpayOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base">Razorpay Online Gateway</h3>
              <p className="text-[11px] text-[#71717A]">Instant zero-friction online collection</p>
            </div>
          </div>
          <button onClick={() => setIsRazorpayOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-[#18181B] block mb-1">Student Account</label>
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
            <label className="font-bold text-[#18181B] block mb-1">Fee Item / Purpose</label>
            <select
              value={selectedFeeCategory}
              onChange={(e) => setSelectedFeeCategory(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
            >
              {feeStructures.map((f) => (
                <option key={f.id} value={f.title}>
                  {f.title} (${f.amount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#18181B] block mb-1">Payment Amount ($)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
            />
          </div>

          <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EBE7DF] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#71717A]">
              <ShieldCheck className="w-4 h-4 text-[#FF4D00]" />
              <span>Razorpay 256-Bit SSL Secured</span>
            </div>
            <span className="font-bold text-[#18181B]">Test Gateway Mode</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-[#FF4D00] hover:bg-[#E04400] text-white font-bold rounded-xl shadow-md shadow-[#FF4D00]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Launching Razorpay SDK...</span>
            ) : (
              <>
                <span>Launch Razorpay Gateway</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
