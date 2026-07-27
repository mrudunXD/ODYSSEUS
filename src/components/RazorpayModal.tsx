import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Zap, X, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const {
    students,
    feeStructures,
    isRazorpayOpen,
    setIsRazorpayOpen,
    launchOfficialRazorpaySDK,
    selectedStudentForPayment,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(
    selectedStudentForPayment?.id || students[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(feeStructures[0]?.title || 'Tuition Fee');
  const [amount, setAmount] = useState(12500);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isRazorpayOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await launchOfficialRazorpaySDK(selectedStudentId, Number(amount), selectedCategory);
    } catch (err: any) {
      console.warn('Checkout closed or failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-[#FF4D00]/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base">Razorpay Standard Checkout</h3>
              <p className="text-[11px] text-[#71717A]">Backend HMAC Signature Verified</p>
            </div>
          </div>
          <button onClick={() => setIsRazorpayOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="space-y-4 pt-4 text-xs">
          {/* Select Student */}
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

          {/* Fee Item */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#18181B] block mb-1">Fee Purpose</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
              >
                {feeStructures.map((f) => (
                  <option key={f.id} value={f.title}>
                    {f.title}
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
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-extrabold text-[#18181B]"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-2xl border border-[#EBE7DF] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#71717A]">
              <Lock className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span>HMAC-SHA256 Server Signature</span>
            </div>
            <span className="font-bold text-[#18181B]">Live Backend Proxy</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-[#FF4D00] hover:bg-[#E04400] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#FF4D00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Creating Server Order...</span>
            ) : (
              <>
                <span>Pay ${amount.toLocaleString()} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
