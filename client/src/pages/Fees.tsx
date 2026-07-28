import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Edit3, Trash2, X, Percent, Check } from 'lucide-react';
import { FeeType, FeeFrequency } from '../types';

export const Fees: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([
    {
      id: 'FEE-101',
      schoolId: 'SCH-01',
      name: 'Senior High Tuition Fee',
      description: 'Quarterly academic instruction & smart lab access',
      amount: 12500,
      frequency: 'QUARTERLY',
      isActive: true,
      lateFeePerDay: 50,
      gracePeriodDays: 5,
      applicableTo: 'ALL',
      createdAt: '2025-09-01T00:00:00Z',
    },
    {
      id: 'FEE-102',
      schoolId: 'SCH-01',
      name: 'School Bus Transport - Route A',
      description: 'AC Transport service with GPS live tracking',
      amount: 3200,
      frequency: 'MONTHLY',
      isActive: true,
      lateFeePerDay: 20,
      gracePeriodDays: 5,
      applicableTo: 'CLASS_SPECIFIC',
      createdAt: '2025-09-01T00:00:00Z',
    },
    {
      id: 'FEE-103',
      schoolId: 'SCH-01',
      name: 'Advanced STEM & AI Lab Fee',
      description: 'Robotics kits & practical lab consumables',
      amount: 1800,
      frequency: 'ANNUAL',
      isActive: true,
      lateFeePerDay: 30,
      gracePeriodDays: 10,
      applicableTo: 'ALL',
      createdAt: '2025-09-01T00:00:00Z',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(5000);
  const [frequency, setFrequency] = useState<FeeFrequency>('QUARTERLY');
  const [lateFeePerDay, setLateFeePerDay] = useState(50);
  const [gracePeriodDays, setGracePeriodDays] = useState(5);

  const handleCreateFee = (e: React.FormEvent) => {
    e.preventDefault();
    const newFee: FeeType = {
      id: `FEE-${Math.floor(100 + Math.random() * 900)}`,
      schoolId: 'SCH-01',
      name,
      amount: Number(amount),
      frequency,
      isActive: true,
      lateFeePerDay: Number(lateFeePerDay),
      gracePeriodDays: Number(gracePeriodDays),
      applicableTo: 'ALL',
      createdAt: new Date().toISOString(),
    };

    setFeeTypes((prev) => [newFee, ...prev]);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Dynamic Fee Engine & Rule Configurator
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Configure tuition, transport, lab fees, grace periods, and late penalty rules.
          </p>
        </div>

        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fee Structure</span>
          </button>
        </RoleGuard>
      </div>

      {/* Grid of Fee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeTypes.map((fee) => (
          <div
            key={fee.id}
            className="bg-white rounded-3xl p-5 border border-[#E5E7EB] card-shadow card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-[#FFF0E6] text-[#E85D04] rounded-full text-[11px] font-extrabold border border-[#E85D04]/20">
                  {fee.frequency}
                </span>
                <button
                  onClick={() => setFeeTypes((prev) => prev.filter((item) => item.id !== fee.id))}
                  className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-extrabold text-[#1A1A1A] text-base">{fee.name}</h4>
              <p className="text-xs text-[#6B7280] mt-1">{fee.description || 'Standard school fee head'}</p>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Billing Amount</span>
                  <span className="font-extrabold text-[#1A1A1A] text-lg">{formatCurrency(fee.amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Late Penalty</span>
                  <span className="font-bold text-[#E85D04]">{formatCurrency(fee.lateFeePerDay)}/day</span>
                  <span className="text-[10px] text-[#6B7280] block">Grace: {fee.gracePeriodDays} days</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Create Fee Structure</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Fee Structure Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grade 10 Robotics Lab Fee"
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FeeFrequency)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="QUARTERLY">QUARTERLY</option>
                    <option value="ANNUAL">ANNUAL</option>
                    <option value="ONE_TIME">ONE_TIME</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Late Penalty (₹/day)</label>
                  <input
                    type="number"
                    value={lateFeePerDay}
                    onChange={(e) => setLateFeePerDay(Number(e.target.value))}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-bold text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
