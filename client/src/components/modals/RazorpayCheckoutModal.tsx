import React, { useState } from 'react';
import { Zap, X, ArrowRight, Lock, ShieldCheck, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Student, FeeType } from '../../types';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  feeTypes: FeeType[];
  onSuccess: (txData: any) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  students,
  feeTypes,
  onSuccess,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState(feeTypes[0]?.id || '');
  const [amount, setAmount] = useState(12500);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentFee = feeTypes.find((f) => f.id === selectedFeeTypeId);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const amountInPaise = amount * 100; // Minimum 100 paise

    try {
      // STEP 1: BACKEND - Create Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create Razorpay Order on server');
      }

      const orderData = await orderRes.json(); // { order_id, amount, currency }

      // STEP 2: FRONTEND - Open Razorpay Standard Modal with order_id
      const options = {
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TIWVCWyzGuKOq8',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Springfield International School',
        description: `Fee Collection: ${currentFee?.name || 'Tuition Fee'} - ${currentStudent?.name || 'Student'}`,
        order_id: orderData.order_id,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        handler: async function (response: any) {
          try {
            // STEP 3: BACKEND - Verify Signature
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              onSuccess({
                studentId: selectedStudentId,
                studentName: currentStudent?.name || 'Student',
                rollNo: currentStudent?.studentCode,
                category: currentFee?.name || 'Tuition Fee Collection',
                amount,
                method: 'RAZORPAY',
                referenceNo: response.razorpay_payment_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              onClose();
            } else {
              alert(`Payment Signature Verification Failed: ${verifyData.error}`);
            }
          } catch (vErr: any) {
            alert(`Backend Verification Error: ${vErr.message}`);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: currentStudent?.parentName || 'Parent',
          email: currentStudent?.parentEmail || 'parent@springfield.edu',
          contact: currentStudent?.parentPhone || '+91 98765 43210',
        },
        theme: {
          color: '#E85D04',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Razorpay Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      alert(`Razorpay Checkout Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-[#E85D04]/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Razorpay Standard Checkout</h3>
              <p className="text-[11px] text-[#6B7280]">HMAC-SHA256 Backend Signature Verified</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="space-y-4 pt-4 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1">Fee Purpose</label>
              <select
                value={selectedFeeTypeId}
                onChange={(e) => setSelectedFeeTypeId(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
              >
                {feeTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
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
          </div>

          <div className="bg-[#F5F5F0] p-3 rounded-2xl border border-[#E5E7EB] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#6B7280]">
              <Lock className="w-3.5 h-3.5 text-[#E85D04]" />
              <span>Razorpay Order API Verified</span>
            </div>
            <span className="font-bold text-[#1A1A1A]">256-Bit SSL Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#E85D04]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Creating Server Order...</span>
            ) : (
              <>
                <span>Pay {formatCurrency(amount)} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
