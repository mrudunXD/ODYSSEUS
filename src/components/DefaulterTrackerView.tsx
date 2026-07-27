import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { ShieldAlert, Bell, Send, Check, DollarSign, Calendar, Filter, UserX } from 'lucide-react';

export const DefaulterTrackerView: React.FC = () => {
  const { students, sendDefaulterReminder, setIsRazorpayOpen, setSelectedStudentForPayment } = useFee();
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const defaulters = students.filter((s) => s.status === 'Defaulter' || s.status === 'Partial');

  const handleSendReminder = (studentId: string) => {
    sendDefaulterReminder(studentId);
    setSentMap((prev) => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setSentMap((prev) => ({ ...prev, [studentId]: false }));
    }, 3000);
  };

  const handlePayOnBehalf = (student: any) => {
    setSelectedStudentForPayment(student);
    setIsRazorpayOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE7DF] card-shadow">
        <div>
          <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">Prioritized Defaulter & Collection Tracker</h2>
          <p className="text-xs text-[#71717A] mt-1">Real-time risk scoring, overdue days tracking, and automated reminder broadcasts.</p>
        </div>
        <button
          onClick={() => defaulters.forEach((d) => handleSendReminder(d.id))}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#FF4D00]/20 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast All Defaulter Reminders</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaulters.map((s) => {
          const isCritical = s.overdueDays >= 30;
          const latePenalty = s.overdueDays * 50; // $50/day rule
          const totalPayable = s.balanceDue + latePenalty;
          const isSent = sentMap[s.id];

          return (
            <div
              key={s.id}
              className={`bg-white rounded-3xl p-5 border card-shadow card-hover flex flex-col justify-between ${
                isCritical ? 'border-rose-300 bg-rose-50/10' : 'border-[#EBE7DF]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-[#FFF0EB] text-[#FF4D00]'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    {isCritical ? 'Critical Defaulter (>30 Days)' : 'Overdue Grace Period'}
                  </span>
                  <span className="text-xs font-bold text-[#71717A]">{s.grade} - Sec {s.section}</span>
                </div>

                <h4 className="font-extrabold text-[#18181B] text-base">{s.name}</h4>
                <p className="text-xs text-[#71717A] mt-0.5">Roll: {s.rollNo} | Parent: {s.parentName}</p>

                <div className="mt-4 pt-3 border-t border-[#F0ECE1] space-y-2 text-xs">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Days Overdue:</span>
                    <span className="font-bold text-[#18181B]">{s.overdueDays} Days</span>
                  </div>
                  <div className="flex justify-between text-[#71717A]">
                    <span>Base Fee Unpaid:</span>
                    <span className="font-bold text-[#18181B]">${s.balanceDue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#71717A]">
                    <span>Accrued Late Penalty ($50/day):</span>
                    <span className="font-bold text-[#FF4D00]">+${latePenalty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#18181B] font-extrabold text-sm pt-2 border-t border-[#F0ECE1]">
                    <span>Total Outstanding:</span>
                    <span className="text-[#FF4D00]">${totalPayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#F0ECE1] grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendReminder(s.id)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAF8F3] border border-[#EBE7DF] text-[#18181B] hover:border-[#FF4D00]'
                  }`}
                >
                  {isSent ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5 text-[#FF4D00]" />}
                  <span>{isSent ? 'Sent!' : 'Send Notice'}</span>
                </button>

                <button
                  onClick={() => handlePayOnBehalf(s)}
                  className="py-2 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Collect Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
