import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Zap, X, ShieldCheck, CreditCard, ArrowRight, Key, Check, AlertCircle } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const {
    students,
    feeStructures,
    isRazorpayOpen,
    setIsRazorpayOpen,
    processRazorpayPayment,
    selectedStudentForPayment,
    razorpayKey,
    setRazorpayKey,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(
    selectedStudentForPayment?.id || students[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(feeStructures[0]?.title || 'Tuition Fee');
  const [amount, setAmount] = useState(12500);
  const [payMethod, setPayMethod] = useState<'Card' | 'UPI' | 'Netbanking'>('Card');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [upiId, setUpiId] = useState('parent@upi');

  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  if (!isRazorpayOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await processRazorpayPayment(selectedStudentId, Number(amount), selectedCategory);
      setIsRazorpayOpen(false);
    } catch (err) {
      console.error('Payment Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center shadow-md shadow-[#FF4D00]/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base">Razorpay Payment Gateway</h3>
              <p className="text-[11px] text-[#71717A]">Official online fee collection desk</p>
            </div>
          </div>
          <button onClick={() => setIsRazorpayOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Razorpay Key Configuration Banner */}
        <div className="mt-3 bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#EBE7DF] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#71717A]">
            <ShieldCheck className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-semibold text-[#18181B]">256-Bit Encrypted</span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="text-[#FF4D00] font-bold hover:underline flex items-center gap-1 text-[11px]"
          >
            <Key className="w-3 h-3" />
            <span>API Key Setup</span>
          </button>
        </div>

        {showKeyConfig && (
          <div className="mt-2 p-3 bg-[#FFF0EB] rounded-2xl border border-[#FF4D00]/20 space-y-2 text-xs">
            <label className="font-bold text-[#18181B] block">Razorpay Key ID (Live / Test)</label>
            <input
              type="text"
              value={razorpayKey}
              onChange={(e) => setRazorpayKey(e.target.value)}
              placeholder="rzp_test_1234567890"
              className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono text-xs font-bold text-[#18181B]"
            />
            <span className="text-[10px] text-[#71717A] block">
              Enter your official Razorpay Key ID or leave default for test checkout.
            </span>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4 pt-4 text-xs">
          {/* Select Student */}
          <div>
            <label className="font-bold text-[#18181B] block mb-1">Select Student</label>
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
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-bold text-[#18181B]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-bold text-[#18181B] block mb-1.5">Payment Instrument</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Card', 'UPI', 'Netbanking'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    payMethod === m
                      ? 'bg-[#18181B] text-white shadow-xs'
                      : 'bg-[#FAF8F3] border border-[#EBE7DF] text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Method Fields */}
          {payMethod === 'Card' && (
            <div className="space-y-2.5 bg-[#FAF8F3] p-3 rounded-2xl border border-[#EBE7DF]">
              <div>
                <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono font-bold text-[#18181B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono font-bold text-[#18181B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono font-bold text-[#18181B]"
                  />
                </div>
              </div>
            </div>
          )}

          {payMethod === 'UPI' && (
            <div className="bg-[#FAF8F3] p-3 rounded-2xl border border-[#EBE7DF]">
              <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Enter UPI VPA ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono font-bold text-[#18181B]"
              />
            </div>
          )}

          {payMethod === 'Netbanking' && (
            <div className="bg-[#FAF8F3] p-3 rounded-2xl border border-[#EBE7DF]">
              <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Select Bank</label>
              <select className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-bold text-[#18181B]">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-[#FF4D00] hover:bg-[#E04400] text-white font-bold rounded-xl shadow-md shadow-[#FF4D00]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Processing Razorpay Checkout...</span>
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
