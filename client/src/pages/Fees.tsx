import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { FeeType, FeeFrequency } from '../types';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';

export const Fees: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { push } = useToastStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(5000);
  const [frequency, setFrequency] = useState<FeeFrequency>('QUARTERLY');
  const [lateFeePerDay, setLateFeePerDay] = useState(50);
  const [gracePeriodDays, setGracePeriodDays] = useState(5);

  const fetchFeeTypes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/fees');
      if (res.data?.data) setFeeTypes(res.data.data);
    } catch (err: any) {
      push('error', 'Failed to load fee structures', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFeeTypes();
  }, []);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/fees', {
        name,
        description,
        amount: Number(amount),
        frequency,
        lateFeePerDay: Number(lateFeePerDay),
        gracePeriodDays: Number(gracePeriodDays),
      });

      if (res.data?.success) {
        push('success', 'Fee structure created successfully');
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchFeeTypes();
      }
    } catch (err: any) {
      push('error', 'Failed to create fee structure', err.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/fees/${deletingId}`);
      push('success', 'Fee structure deactivated');
      setDeletingId(null);
      fetchFeeTypes();
    } catch (err: any) {
      push('error', 'Failed to deactivate fee structure', err.response?.data?.error);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Dynamic Fee Engine & Rule Configurator
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Configure tuition, transport, lab fees, grace periods, and late penalty rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeeTypes}
            aria-label="Refresh fee structures"
            className="p-2.5 min-w-[44px] min-h-[44px] bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04] active:scale-[0.98] transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#E85D04] hover:bg-[#C44D00] active:scale-[0.98] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Structure</span>
            </button>
          </RoleGuard>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
          Loading fee structures...
        </div>
      ) : feeTypes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB]">
          <p className="text-sm font-bold text-[#1A1A1A]">No fee structures configured</p>
          <p className="text-xs text-[#6B7280] mt-1">Click "Create Fee Structure" to add your first billing rule.</p>
        </div>
      ) : (
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
                  <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <button
                      onClick={() => setDeletingId(fee.id)}
                      aria-label={`Deactivate fee ${fee.name}`}
                      className="p-2 min-w-[36px] min-h-[36px] text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </RoleGuard>
                </div>

                <h2 className="font-extrabold text-[#1A1A1A] text-base">{fee.name}</h2>
                <p className="text-xs text-[#6B7280] mt-1">{fee.description || 'Standard school fee head'}</p>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Billing Amount</span>
                    <span className="font-mono font-extrabold text-[#1A1A1A] text-lg">{formatCurrency(fee.amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Late Penalty</span>
                    <span className="font-mono font-bold text-[#E85D04]">{formatCurrency(fee.lateFeePerDay || 50)}/day</span>
                    <span className="text-[10px] text-[#6B7280] block">Grace: {fee.gracePeriodDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Styled Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E5E7EB] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#DC2626] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A1A1A]">Deactivate Fee Structure?</h3>
              <p className="text-xs text-[#6B7280] mt-1">This will stop new invoices from attaching this fee rule.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold text-xs rounded-xl hover:bg-[#E5E7EB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-[#DC2626] text-white font-extrabold text-xs rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Create Fee Structure</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6B7280] hover:text-[#1A1A1A] p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close modal"
              >
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
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lab consumables & practical instruction"
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-extrabold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FeeFrequency)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
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
                    min="0"
                    value={lateFeePerDay}
                    onChange={(e) => setLateFeePerDay(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 min-h-[40px] bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl hover:bg-[#E5E7EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 min-h-[40px] bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
