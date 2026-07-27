export type FeeCategory = 'Tuition' | 'Transport' | 'Laboratory' | 'Late Fee' | 'Subscription' | 'Sports' | 'Admission';

export type PaymentMethod = 'Razorpay' | 'UPI_QR' | 'Cash' | 'Cheque';

export type TransactionStatus = 'Completed' | 'Pending' | 'Under_Reconciliation' | 'Failed';

export type ReconciliationStatus = 'Pending_Deposit' | 'Realized' | 'Bounced';

export interface FeeStructure {
  id: string;
  title: string;
  category: FeeCategory;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time';
  dueDateDay: number; // e.g. 5th of every month
  lateFeePerDay: number; // e.g. $10 or ₹50 per day
  grades: string[]; // e.g. ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  description?: string;
  active: boolean;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  parentName: string;
  email: string;
  phone: string;
  totalFeeAssigned: number;
  paidAmount: number;
  waiverAmount: number;
  waiverReason?: string;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Defaulter';
  overdueDays: number;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  category: string;
  amount: number;
  type: 'Inflow' | 'Outflow';
  date: string; // ISO format or formatted string
  method: PaymentMethod;
  status: TransactionStatus;
  referenceNo: string;
  receiptNo: string;
  notes?: string;
}

export interface OfflineReconciliation {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  method: 'Cash' | 'Cheque';
  amount: number;
  chequeNumber?: string;
  bankName?: string;
  depositDate: string;
  status: ReconciliationStatus;
  receiptNo: string;
  recordedBy: string;
  notes?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  suggestedAction: string;
  potentialImpact: string;
}
