import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { apiClient } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { RoleGuard } from '../components/layout/RoleGuard';
import { Search, Plus, FileText, Printer, X, RefreshCw } from 'lucide-react';
import { Invoice, Student, FeeType } from '../types';

export const Invoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<Invoice | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedFeeTypeIds, setSelectedFeeTypeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { push } = useToastStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invRes, stuRes, feeRes] = await Promise.all([
        apiClient.get('/invoices'),
        apiClient.get('/students'),
        apiClient.get('/fees'),
      ]);
      if (invRes.data?.data) setInvoices(invRes.data.data);
      if (stuRes.data?.data) setStudents(stuRes.data.data);
      if (feeRes.data?.data) setFeeTypes(feeRes.data.data);
    } catch (err: any) {
      push('error', 'Failed to fetch invoice data', err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || selectedFeeTypeIds.length === 0 || !dueDate) {
      push('warning', 'Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/invoices', {
        studentId: selectedStudentId,
        feeTypeIds: selectedFeeTypeIds,
        dueDate,
      });

      if (res.data?.success) {
        push('success', 'Invoice generated successfully');
        setIsCreateModalOpen(false);
        setSelectedStudentId('');
        setSelectedFeeTypeIds([]);
        setDueDate('');
        fetchData();
      }
    } catch (err: any) {
      push('error', 'Failed to create invoice', err.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeeTypeToggle = (id: string) => {
    setSelectedFeeTypeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Official Student Invoices & Digital Receipts
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Generate printable invoices with embedded UPI QR codes and track payment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                  selectedStatus === st
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F5F0] text-[#6B7280] border border-[#E5E7EB] hover:text-[#1A1A1A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Invoice No or Student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-xs text-[#6B7280]">
            <RefreshCw className="w-5 h-5 animate-spin text-[#E85D04]" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-[#1A1A1A]">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Invoice No</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Paid Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F5F5F0] transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-[#1A1A1A]">{inv.invoiceNo}</td>
                    <td className="py-3.5 font-bold text-[#1A1A1A]">{inv.student?.name}</td>
                    <td className="py-3.5 font-semibold text-[#6B7280]">{formatDate(inv.issueDate)}</td>
                    <td className="py-3.5 font-semibold text-[#6B7280]">{formatDate(inv.dueDate)}</td>
                    <td className="py-3.5 font-extrabold text-[#1A1A1A]">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3.5 font-extrabold text-[#16A34A]">{formatCurrency(inv.paidAmount)}</td>
                    <td className="py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={() => setActiveInvoiceModal(inv)}
                        className="p-1.5 text-[#6B7280] hover:text-[#E85D04] hover:bg-[#FFF0E6] rounded-lg transition-colors"
                        title="View Printable PDF Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Generate Student Invoice</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Select Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode}) - {s.class?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Select Fee Heads</label>
                <div className="max-h-36 overflow-y-auto bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 space-y-1">
                  {feeTypes.map((ft) => (
                    <label key={ft.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeeTypeIds.includes(ft.id)}
                        onChange={() => handleFeeTypeToggle(ft.id)}
                        className="rounded border-[#E5E7EB] text-[#E85D04] focus:ring-[#E85D04]"
                      />
                      <span className="font-semibold text-[#1A1A1A] flex-1">{ft.name}</span>
                      <span className="font-bold text-[#E85D04]">{formatCurrency(ft.amount)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2.5 font-semibold text-[#1A1A1A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#E85D04] text-white font-extrabold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] print:hidden">
              <span className="text-xs font-extrabold text-[#16A34A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Printable PDF Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>Print</span>
                </button>
                <button onClick={() => setActiveInvoiceModal(null)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-6 space-y-6 text-xs text-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-[#E85D04] text-white flex items-center justify-center font-bold text-sm">
                      S
                    </div>
                    <span className="font-extrabold text-base text-[#1A1A1A]">Springfield International School</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">Affiliation No: SIS-882194 | Tax ID: TAX-9912083</p>
                  <p className="text-[11px] text-[#6B7280]">104 Edu Campus Way, Financial District</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#E85D04] uppercase tracking-wider block">Official Invoice</span>
                  <span className="font-mono font-extrabold text-[#1A1A1A] text-sm">{activeInvoiceModal.invoiceNo}</span>
                  <span className="text-[11px] text-[#6B7280] block mt-1">Issue Date: {formatDate(activeInvoiceModal.issueDate)}</span>
                </div>
              </div>

              <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E7EB] grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Student Details</span>
                  <span className="font-extrabold text-sm text-[#1A1A1A] block">{activeInvoiceModal.student?.name}</span>
                  <span className="text-[11px] text-[#6B7280]">Code: {activeInvoiceModal.student?.studentCode}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Parent Contact</span>
                  <span className="font-bold text-[#1A1A1A] block">{activeInvoiceModal.student?.parentName}</span>
                  <span className="text-[11px] text-[#6B7280]">{activeInvoiceModal.student?.parentPhone}</span>
                </div>
              </div>

              <div className="border-t border-b border-[#E5E7EB] py-4 space-y-2">
                <div className="flex justify-between font-bold text-[#6B7280] text-[11px] uppercase pb-2 border-b border-[#E5E7EB]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                {activeInvoiceModal.items && activeInvoiceModal.items.length > 0 ? (
                  activeInvoiceModal.items.map((item) => (
                    <div key={item.id} className="flex justify-between font-semibold">
                      <span>{item.label}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between font-semibold">
                    <span>Tuition & General Fee Head</span>
                    <span>{formatCurrency(activeInvoiceModal.totalAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `upi://pay?pa=springfield.school@icici&pn=Springfield&am=${activeInvoiceModal.totalAmount - activeInvoiceModal.paidAmount}&tn=${activeInvoiceModal.invoiceNo}&cu=INR`
                    )}`}
                    alt="UPI QR Code"
                    className="w-16 h-16 border border-[#E5E7EB] rounded-xl p-1 bg-white"
                  />
                  <div className="text-[10px] text-[#6B7280]">
                    <span className="font-bold text-[#1A1A1A] block">Scan & Pay via Any UPI App</span>
                    <span>Zero Transaction Fee</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase block">Total Outstanding Due</span>
                  <span className="text-2xl font-extrabold text-[#E85D04] tracking-tight">
                    {formatCurrency(activeInvoiceModal.totalAmount - activeInvoiceModal.paidAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
