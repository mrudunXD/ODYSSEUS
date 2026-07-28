import { Role } from '../utils/rolePermissions';

export type { Role };

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  section: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  class?: Class;
  studentCode: string;
  name: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address?: string;
  dob?: string;
  isActive: boolean;
  createdAt: string;
  totalAssigned?: number;
  paidAmount?: number;
  balanceDue?: number;
  status?: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  overdueDays?: number;
}

export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type ApplicableTo = 'ALL' | 'CLASS_SPECIFIC' | 'STUDENT_SPECIFIC';

export interface FeeType {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  amount: number;
  frequency: FeeFrequency;
  isActive: boolean;
  lateFeePerDay: number;
  gracePeriodDays: number;
  applicableTo: ApplicableTo;
  createdAt: string;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  feeTypeId: string;
  feeType?: FeeType;
  label: string;
  amount: number;
  lateFee: number;
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  student?: Student;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  transactions?: Transaction[];
  waivers?: Waiver[];
  createdAt: string;
}

export type PaymentMethod = 'UPI' | 'CASH' | 'CHEQUE' | 'RAZORPAY' | 'BANK_TRANSFER';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'UNDER_REVIEW';

export interface Transaction {
  id: string;
  schoolId: string;
  invoiceId: string;
  invoice?: Invoice;
  studentName?: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  referenceNo?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  chequeNo?: string;
  chequeBank?: string;
  chequeDate?: string;
  chequeImageUrl?: string;
  upiRef?: string;
  cashReceivedBy?: string;
  notes?: string;
  createdAt: string;
  reconciledAt?: string;
  reconciledBy?: string;
}

export interface OfflineReconciliation {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  method: string;
  amount: number;
  chequeNumber?: string;
  bankName?: string;
  depositDate: string;
  status: 'Pending_Deposit' | 'Realized' | 'Bounced';
  receiptNo: string;
  recordedBy: string;
  notes: string;
}

export interface Waiver {
  id: string;
  studentId: string;
  student?: Student;
  invoiceId: string;
  amount: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PAYMENT_RECEIVED' | 'INVOICE_OVERDUE' | 'WAIVER_APPROVED' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  netPending: number;
  totalWaivers: number;
  activeStudents: number;
  revenueDeltaPercent: number;
  pendingDeltaPercent: number;
  aiInsight: string;
}

export interface ChartDayPoint {
  date: string;
  fullDate: string;
  inflow: number;
  outflow: number;
}
