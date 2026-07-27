import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { ShieldCheck, CreditCard, ArrowRight, X, Check, Lock, Sparkles, Building2, QrCode } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const {
    students,
    feeStructures,
    isRazorpayOpen,
    setIsRazorpayOpen,
    processRazorpayPayment,
    selectedStudentForPayment,
  } = useFee();

  const [selectedStudentId, setSelectedStudentId] = useState(
    selectedStudentForPayment?.id || students[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(feeStructures[0]?.title || 'Tuition Fee');
  const [amount, setAmount] = useState(12500);
  const [payMethod, setPayMethod] = useState<'Card' | 'UPI' | 'Netbanking'>('Card');

  // Form inputs
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [upiVpa, setUpiVpa] = useState('parent@upi');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isRazorpayOpen) return null;

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await processRazorpayPayment(selectedStudentId, Number(amount), selectedCategory, payMethod);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsProcessing(false);
        setIsRazorpayOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#EBE7DF] shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Razorpay Brand Header Bar */}
        <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
              RZP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Razorpay</span>
                <span className="text-[10px] font-bold bg-[#FF4D00] text-white px-2 py-0.5 rounded-full uppercase">
                  Checkout
                </span>
              </div>
              <span className="text-[11px] text-[#94A3B8] block mt-0.5">Nueansa International School</span>
            </div>
          </div>
          <button
            onClick={() => setIsRazorpayOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl animate-in zoom-in">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-[#18181B]">Payment Successful!</h3>
            <p className="text-xs text-[#71717A]">Transaction settled via Razorpay. Generating official receipt...</p>
          </div>
        ) : (
          <form onSubmit={handlePaySubmit} className="p-6 space-y-4 text-xs">
            {/* Student & Fee Selection */}
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

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="font-bold text-[#18181B] block mb-1.5">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Card', label: 'Cards', icon: CreditCard },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Netbanking', label: 'NetBanking', icon: Building2 },
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = payMethod === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPayMethod(item.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF4D00] text-white shadow-xs'
                          : 'bg-[#FAF8F3] border border-[#EBE7DF] text-[#71717A] hover:text-[#18181B]'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {payMethod === 'Card' && (
              <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EBE7DF] space-y-2.5">
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
              <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EBE7DF]">
                <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Virtual Payment Address (UPI VPA)</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="parent@okhdfcbank"
                  className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-mono font-bold text-[#18181B]"
                />
              </div>
            )}

            {payMethod === 'Netbanking' && (
              <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EBE7DF]">
                <label className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">Select Bank</label>
                <select className="w-full bg-white border border-[#EBE7DF] rounded-xl p-2 font-bold text-[#18181B]">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <span className="font-bold text-[#18181B]">Razorpay Trusted Merchant</span>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#FF4D00] hover:bg-[#E04400] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#FF4D00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <span>Pay ${amount.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
