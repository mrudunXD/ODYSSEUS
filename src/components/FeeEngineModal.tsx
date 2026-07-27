import React, { useState } from 'react';
import { useFee } from '../context/FeeContext';
import { Plus, Trash2, Edit3, ShieldAlert, Check, X, Layers, Percent } from 'lucide-react';
import { FeeCategory, FeeStructure } from '../types';

export const FeeEngineModal: React.FC = () => {
  const {
    feeStructures,
    addFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    students,
    applyWaiver,
  } = useFee();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeeCategory>('Tuition');
  const [amount, setAmount] = useState(5000);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Annual' | 'One-Time'>('Quarterly');
  const [dueDateDay, setDueDateDay] = useState(10);
  const [lateFeePerDay, setLateFeePerDay] = useState(50);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['Grade 10', 'Grade 11']);
  const [description, setDescription] = useState('');

  // Waiver Form State
  const [selectedStudentForWaiver, setSelectedStudentForWaiver] = useState(students[0]?.id || '');
  const [waiverAmount, setWaiverAmount] = useState(2500);
  const [waiverReason, setWaiverReason] = useState('Academic Scholarship 15%');
  const [waiverSuccessMsg, setWaiverSuccessMsg] = useState('');

  const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 5', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingId) {
      updateFeeStructure(editingId, {
        title,
        category,
        amount: Number(amount),
        frequency,
        dueDateDay: Number(dueDateDay),
        lateFeePerDay: Number(lateFeePerDay),
        grades: selectedGrades,
        description,
      });
      setEditingId(null);
    } else {
      addFeeStructure({
        title,
        category,
        amount: Number(amount),
        frequency,
        dueDateDay: Number(dueDateDay),
        lateFeePerDay: Number(lateFeePerDay),
        grades: selectedGrades,
        description,
        active: true,
      });
      setIsAdding(false);
    }

    // Reset
    setTitle('');
    setAmount(5000);
    setDescription('');
  };

  const startEdit = (fee: FeeStructure) => {
    setEditingId(fee.id);
    setTitle(fee.title);
    setCategory(fee.category);
    setAmount(fee.amount);
    setFrequency(fee.frequency);
    setDueDateDay(fee.dueDateDay);
    setLateFeePerDay(fee.lateFeePerDay);
    setSelectedGrades(fee.grades);
    setDescription(fee.description || '');
    setIsAdding(true);
  };

  const toggleGrade = (g: string) => {
    if (selectedGrades.includes(g)) {
      setSelectedGrades(selectedGrades.filter((item) => item !== g));
    } else {
      setSelectedGrades([...selectedGrades, g]);
    }
  };

  const handleGrantWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForWaiver || !waiverAmount) return;

    applyWaiver(selectedStudentForWaiver, Number(waiverAmount), waiverReason);
    setWaiverSuccessMsg(`Successfully granted $${waiverAmount} waiver!`);
    setTimeout(() => setWaiverSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE7DF] card-shadow">
        <div>
          <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">Dynamic Fee Engine & Rule Configurator</h2>
          <p className="text-xs text-[#71717A] mt-1">Create, modify, and assign tuition, transport, lab fees, and penalty rules.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setTitle('');
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#FF4D00]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Fee Structure</span>
        </button>
      </div>

      {/* Main Grid: Fee List & Waiver Grant Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Fee Structures */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[#18181B] tracking-wider uppercase">Active School Fee Structures</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeStructures.map((fee) => (
              <div key={fee.id} className="bg-white rounded-3xl p-5 border border-[#EBE7DF] card-shadow card-hover relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-[#FFF0EB] text-[#FF4D00] rounded-xl text-[11px] font-bold">
                      {fee.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(fee)} className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F3] rounded-lg">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteFeeStructure(fee.id)} className="p-1.5 text-[#71717A] hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-[#18181B] text-base">{fee.title}</h4>
                  <p className="text-xs text-[#71717A] mt-1">{fee.description}</p>

                  <div className="mt-4 pt-3 border-t border-[#F0ECE1] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Amount & Billing</span>
                      <span className="font-extrabold text-[#18181B] text-lg">${fee.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-[#71717A]"> / {fee.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Late Penalty</span>
                      <span className="font-bold text-[#FF4D00]">${fee.lateFeePerDay}/day</span>
                      <span className="text-[10px] text-[#71717A] block">after {fee.dueDateDay}th</span>
                    </div>
                  </div>
                </div>

                {/* Applicable Grades */}
                <div className="mt-4 pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A] font-semibold">Grades:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {fee.grades.map((g) => (
                      <span key={g} className="px-2 py-0.5 bg-[#FAF8F3] border border-[#EBE7DF] rounded-md text-[10px] font-bold text-[#18181B]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Grant Waiver / Scholarship Form */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE7DF] card-shadow h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-[#FF4D00] text-white flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-sm">Waiver & Scholarship Engine</h3>
              <p className="text-[11px] text-[#71717A]">Apply merit discounts or financial aid</p>
            </div>
          </div>

          {waiverSuccessMsg && (
            <div className="mb-4 p-3 bg-[#FFF0EB] border border-[#FF4D00]/30 rounded-xl text-xs font-bold text-[#FF4D00] flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{waiverSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleGrantWaiver} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#18181B] block mb-1">Select Student</label>
              <select
                value={selectedStudentForWaiver}
                onChange={(e) => setSelectedStudentForWaiver(e.target.value)}
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
              <label className="font-bold text-[#18181B] block mb-1">Waiver Amount ($)</label>
              <input
                type="number"
                value={waiverAmount}
                onChange={(e) => setWaiverAmount(Number(e.target.value))}
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
              />
            </div>

            <div>
              <label className="font-bold text-[#18181B] block mb-1">Waiver Reason / Category</label>
              <input
                type="text"
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                placeholder="e.g. Merit Scholarship 20%"
                className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#18181B] hover:bg-black text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Grant Waiver & Log Approval
            </button>
          </form>
        </div>
      </div>

      {/* Add / Edit Fee Structure Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#EBE7DF] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
              <h3 className="font-extrabold text-base text-[#18181B]">
                {editingId ? 'Edit Fee Structure' : 'Create New School Fee Structure'}
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#18181B] block mb-1">Fee Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grade 10 Robotics & Science Lab Fee"
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeeCategory)}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Transport">Transport</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Late Fee">Late Fee</option>
                    <option value="Sports">Sports</option>
                    <option value="Admission">Admission</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#18181B] block mb-1">Late Penalty ($/day)</label>
                  <input
                    type="number"
                    value={lateFeePerDay}
                    onChange={(e) => setLateFeePerDay(Number(e.target.value))}
                    className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#18181B] block mb-1.5">Applicable Grades</label>
                <div className="flex flex-wrap gap-2">
                  {gradeOptions.map((g) => {
                    const isSelected = selectedGrades.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleGrade(g)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#FF4D00] text-white'
                            : 'bg-[#FAF8F3] text-[#71717A] border border-[#EBE7DF]'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#18181B] block mb-1">Description / Internal Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#FAF8F3] border border-[#EBE7DF] rounded-xl p-2.5 font-semibold text-[#18181B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-[#FAF8F3] border border-[#EBE7DF] text-[#18181B] font-bold rounded-xl hover:bg-[#F0ECE1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF4D00] text-white font-bold rounded-xl hover:bg-[#E04400] shadow-md shadow-[#FF4D00]/20"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
