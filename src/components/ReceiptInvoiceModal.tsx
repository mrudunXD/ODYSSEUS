import React from 'react';
import { useFee } from '../context/FeeContext';
import { Printer, Download, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const ReceiptInvoiceModal: React.FC = () => {
  const { activeReceiptTx, setActiveReceiptTx } = useFee();

  if (!activeReceiptTx) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptQr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFIED_${activeReceiptTx.receiptNo}_${activeReceiptTx.amount}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95 print:p-0 print:border-none print:shadow-none">
        {/* Top Controls (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1] print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Digital Receipt Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl text-xs font-bold text-[#18181B] hover:border-[#FF4D00] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveReceiptTx(null)}
              className="p-1.5 text-[#A1A1AA] hover:text-[#18181B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="pt-6 space-y-6 text-xs text-[#18181B]">
          {/* School Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-[#FF4D00] text-white flex items-center justify-center font-bold text-sm">
                  N
                </div>
                <span className="font-extrabold text-base text-[#18181B]">Nueansa International School</span>
              </div>
              <p className="text-[11px] text-[#71717A]">Affiliation No: NIS-882194 | Tax ID: TAX-9912083</p>
              <p className="text-[11px] text-[#71717A]">104 Edu Campus Way, Financial District</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#FF4D00] uppercase tracking-wider block">Official Receipt</span>
              <span className="font-mono font-extrabold text-[#18181B] text-sm">{activeReceiptTx.receiptNo}</span>
              <span className="text-[11px] text-[#71717A] block mt-1">Date: {activeReceiptTx.date}</span>
            </div>
          </div>

          {/* Student & Transaction Info Grid */}
          <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#EBE7DF] grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-bold block">Payer / Student</span>
              <span className="font-extrabold text-sm text-[#18181B] block">{activeReceiptTx.studentName}</span>
              {activeReceiptTx.rollNo && (
                <span className="text-[11px] text-[#71717A]">Roll No: {activeReceiptTx.rollNo}</span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-bold block">Payment Gateway / Method</span>
              <span className="font-extrabold text-sm text-[#FF4D00] block">{activeReceiptTx.method}</span>
              <span className="text-[11px] text-[#71717A]">Ref: {activeReceiptTx.referenceNo}</span>
            </div>
          </div>

          {/* Line Item Breakdown */}
          <div className="border-t border-b border-[#F0ECE1] py-4 space-y-2">
            <div className="flex justify-between font-bold text-[#71717A] text-[11px] uppercase tracking-wider pb-2 border-b border-[#F0ECE1]">
              <span>Description / Fee Category</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{activeReceiptTx.category}</span>
              <span>${activeReceiptTx.amount.toLocaleString()}.00</span>
            </div>
            {activeReceiptTx.notes && (
              <div className="text-[11px] text-[#71717A] pt-1">Note: {activeReceiptTx.notes}</div>
            )}
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <img src={receiptQr} alt="QR Verification" className="w-16 h-16 border border-[#EBE7DF] rounded-xl p-1 bg-white" />
              <div className="text-[10px] text-[#71717A]">
                <span className="font-bold text-[#18181B] block">Digital Tamper-Proof Stamp</span>
                <span>Verified by Nueansa Ledger SDK</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#71717A] uppercase block">Total Amount Paid</span>
              <span className="text-2xl font-extrabold text-[#FF4D00] tracking-tight">${activeReceiptTx.amount.toLocaleString()}.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
