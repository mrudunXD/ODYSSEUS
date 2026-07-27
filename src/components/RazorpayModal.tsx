import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Zap, X, ShieldCheck, ArrowRight, Key, ExternalLink } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const {
    students,
    feeStructures,
    isRazorpayOpen,
    setIsRazorpayOpen,
    launchOfficialRazorpaySDK,
    selectedStudentForPayment,
    razorpayKey,
    setRazorpayKey,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(
    selectedStudentForPayment?.id || students[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(feeStructures[0]?.title || 'Tuition Fee');
  const [amount, setAmount] = useState(12500);
  const [keyInput, setKeyInput] = useState(razorpayKey || '');
  const [isLaunching, setIsLaunching] = useState(false);

  if (!isRazorpayOpen) return null;

  const handleLaunchOfficialRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      alert('Please enter your Razorpay Key ID (e.g. rzp_test_...) to launch the official Razorpay SDK.');
      return;
    }

    setRazorpayKey(keyInput.trim());
    setIsLaunching(true);

    try {
      await launchOfficialRazorpaySDK(selectedStudentId, Number(amount), selectedCategory, keyInput.trim());
    } catch (err: any) {
      console.warn('Razorpay SDK closed or cancelled:', err);
    } finally {
      setIsLaunching(false);
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
              <h3 className="font-extrabold text-[#18181B] text-base">Official Razorpay Gateway</h3>
              <p className="text-[11px] text-[#71717A]">Official SDK Integration (checkout.js)</p>
            </div>
          </div>
          <button onClick={() => setIsRazorpayOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLaunchOfficialRazorpay} className="space-y-4 pt-4 text-xs">
          {/* Razorpay Key ID Field */}
          <div className="bg-[#FFF0EB] p-3.5 rounded-2xl border border-[#FF4D00]/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-[#FF4D00] flex items-center gap-1.5 text-xs">
                <Key className="w-4 h-4" />
                <span>Razorpay Key ID (Test / Live)</span>
              </label>
              <a
                href="https://dashboard.razorpay.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#71717A] hover:text-[#FF4D00] font-bold flex items-center gap-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. rzp_test_1234567890"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2.5 font-mono text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#FF4D00]"
            />
            <span className="text-[10px] text-[#71717A] block">
              Enter your official Razorpay Key ID to invoke the native Razorpay payment iframe popup.
            </span>
          </div>

          {/* Student Selection */}
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

          {/* Fee Category & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#18181B] block mb-1">Fee Category</label>
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

          {/* Security Badge */}
          <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF4D00]" />
              <span>Razorpay Official SDK (checkout.js)</span>
            </div>
            <span className="font-bold text-[#18181B]">PCI-DSS Compliant</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLaunching}
            className="w-full py-3.5 bg-[#FF4D00] hover:bg-[#E04400] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#FF4D00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLaunching ? (
              <span>Opening Official Razorpay Iframe...</span>
            ) : (
              <>
                <span>Launch Official Razorpay Popup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
