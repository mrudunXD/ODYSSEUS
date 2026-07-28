import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Search, Plus, FileText, Printer, X, QrCode } from 'lucide-react';
import { Invoice } from '../types';

export const Invoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<Invoice | null>(null);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-1001',
      schoolId: 'SCH-01',
      studentId: 'STU-101',
      student: {
        id: 'STU-101',
        schoolId: 'SCH-01',
        classId: 'CLS-11A',
        studentCode: '2025-101',
        name: 'Aarav Sharma',
        parentName: 'Rajesh Sharma',
        parentEmail: 'rajesh.sharma@example.com',
        parentPhone: '+91 98765 43210',
        isActive: true,
        createdAt: '2025-09-01T00:00:00Z',
        class: { id: 'CLS-11A', schoolId: 'SCH-01', name: 'Class 11', section: 'A' },
      },
      invoiceNo: 'INV-2025-001',
      issueDate: '2025-12-01T00:00:00Z',
      dueDate: '2025-12-10T00:00:00Z',
      totalAmount: 17500,
      paidAmount: 17500,
      status: 'PAID',
      createdAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'INV-1002',
      schoolId: 'SCH-01',
      studentId: 'STU-102',
      student: {
        id: 'STU-102',
        schoolId: 'SCH-01',
        classId: 'CLS-12B',
        studentCode: '2025-102',
        name: 'Sofia Martinez',
        parentName: 'Elena Martinez',
        parentEmail: 'elena.m@example.com',
        parentPhone: '+91 98123 45678',
        isActive: true,
        createdAt: '2025-09-01T00:00:00Z',
        class: { id: 'CLS-12B', schoolId: 'SCH-01', name: 'Class 12', section: 'B' },
      },
      invoiceNo: 'INV-2025-002',
      issueDate: '2025-12-01T00:00:00Z',
      dueDate: '2025-12-10T00:00:00Z',
      totalAmount: 17500,
      paidAmount: 10000,
      status: 'PARTIAL',
      createdAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'INV-1003',
      schoolId: 'SCH-01',
      studentId: 'STU-103',
      student: {
        id: 'STU-103',
        schoolId: 'SCH-01',
        classId: 'CLS-10C',
        studentCode: '2025-103',
        name: 'Rohan Verma',
        parentName: 'Vikram Verma',
        parentEmail: 'vikram.v@example.com',
        parentPhone: '+91 99887 76655',
        isActive: true,
        createdAt: '2025-09-01T00:00:00Z',
        class: { id: 'CLS-10C', schoolId: 'SCH-01', name: 'Class 10', section: 'C' },
      },
      invoiceNo: 'INV-2025-003',
      issueDate: '2025-11-01T00:00:00Z',
      dueDate: '2025-11-10T00:00:00Z',
      totalAmount: 15700,
      paidAmount: 0,
      status: 'OVERDUE',
      createdAt: '2025-11-01T00:00:00Z',
    },
  ]);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Official Student Invoices & Digital Receipts
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Generate printable invoices with embedded UPI QR codes and track payment status.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Filters */}
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
      </div>

      {/* Printable Invoice Modal with Scannable UPI QR */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
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
                <div className="flex justify-between font-semibold">
                  <span>Tuition & Smart Lab Quarterly Fee</span>
                  <span>{formatCurrency(activeInvoiceModal.totalAmount)}</span>
                </div>
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
