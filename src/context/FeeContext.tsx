import React, { createContext, useContext, useState } from 'react';
import {
  FeeStructure,
  Student,
  Transaction,
  OfflineReconciliation,
  AIInsight,
  PaymentMethod
} from '../types';

interface FeeContextType {
  // Navigation State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currencySymbol: string;

  // Domain State
  feeStructures: FeeStructure[];
  students: Student[];
  transactions: Transaction[];
  reconciliationQueue: OfflineReconciliation[];
  aiInsights: AIInsight[];

  // Metrics
  totalRevenue: number;
  netProfit: number;
  operatingExpenses: number;
  cashProjection: number;
  monthlyCashFlow: number;

  // Actions
  addFeeStructure: (fee: Omit<FeeStructure, 'id'>) => void;
  updateFeeStructure: (id: string, fee: Partial<FeeStructure>) => void;
  deleteFeeStructure: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id' | 'receiptNo'>) => Transaction;
  applyWaiver: (studentId: string, amount: number, reason: string) => void;
  recordOfflinePayment: (rec: Omit<OfflineReconciliation, 'id' | 'receiptNo' | 'status'>) => void;
  updateReconciliationStatus: (id: string, status: 'Realized' | 'Bounced') => void;
  sendDefaulterReminder: (studentId: string) => void;
  
  // Modals & UI Triggers
  selectedStudentForPayment: Student | null;
  setSelectedStudentForPayment: (student: Student | null) => void;
  isRazorpayOpen: boolean;
  setIsRazorpayOpen: (open: boolean) => void;
  isUpiOpen: boolean;
  setIsUpiOpen: (open: boolean) => void;
  isFeeEngineOpen: boolean;
  setIsFeeEngineOpen: (open: boolean) => void;
  isOfflineRecOpen: boolean;
  setIsOfflineRecOpen: (open: boolean) => void;
  activeReceiptTx: Transaction | null;
  setActiveReceiptTx: (tx: Transaction | null) => void;
  
  // Razorpay Handler
  processRazorpayPayment: (studentId: string, amount: number, category: string) => Promise<void>;
}

const FeeContext = createContext<FeeContextType | undefined>(undefined);

// Initial Mock Data matching screenshot precisely
const initialFeeStructures: FeeStructure[] = [
  {
    id: 'FEE-101',
    title: 'Senior High Tuition Fee',
    category: 'Tuition',
    amount: 12500,
    frequency: 'Quarterly',
    dueDateDay: 10,
    lateFeePerDay: 50,
    grades: ['Grade 10', 'Grade 11', 'Grade 12'],
    description: 'Quarterly academic instruction & smart lab access',
    active: true,
  },
  {
    id: 'FEE-102',
    title: 'School Bus Transport - Route A',
    category: 'Transport',
    amount: 3200,
    frequency: 'Monthly',
    dueDateDay: 5,
    lateFeePerDay: 20,
    grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 10', 'Grade 11'],
    description: 'AC Transport service with GPS live tracking',
    active: true,
  },
  {
    id: 'FEE-103',
    title: 'Advanced STEM & AI Lab Fee',
    category: 'Laboratory',
    amount: 1800,
    frequency: 'Annual',
    dueDateDay: 15,
    lateFeePerDay: 30,
    grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    description: 'Robotics kits, software licenses & practical lab consumables',
    active: true,
  },
  {
    id: 'FEE-104',
    title: 'Overdue Term Fine',
    category: 'Late Fee',
    amount: 500,
    frequency: 'One-Time',
    dueDateDay: 1,
    lateFeePerDay: 50,
    grades: ['All Grades'],
    description: 'Automated penalty accrued after grace period expiry',
    active: true,
  },
];

const initialStudents: Student[] = [
  {
    id: 'STU-001',
    name: 'Aarav Sharma',
    rollNo: '2025-101',
    grade: 'Grade 11',
    section: 'A',
    parentName: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43210',
    totalFeeAssigned: 17500,
    paidAmount: 17500,
    waiverAmount: 0,
    balanceDue: 0,
    status: 'Paid',
    overdueDays: 0,
  },
  {
    id: 'STU-002',
    name: 'Sofia Martinez',
    rollNo: '2025-102',
    grade: 'Grade 12',
    section: 'B',
    parentName: 'Elena Martinez',
    email: 'elena.m@example.com',
    phone: '+91 98123 45678',
    totalFeeAssigned: 17500,
    paidAmount: 10000,
    waiverAmount: 2500,
    waiverReason: 'Merit Scholarship 15%',
    balanceDue: 5000,
    status: 'Partial',
    overdueDays: 14,
  },
  {
    id: 'STU-003',
    name: 'Rohan Verma',
    rollNo: '2025-103',
    grade: 'Grade 10',
    section: 'C',
    parentName: 'Vikram Verma',
    email: 'vikram.v@example.com',
    phone: '+91 99887 76655',
    totalFeeAssigned: 15700,
    paidAmount: 0,
    waiverAmount: 0,
    balanceDue: 15700,
    status: 'Defaulter',
    overdueDays: 42,
  },
  {
    id: 'STU-004',
    name: 'Ananya Patel',
    rollNo: '2025-104',
    grade: 'Grade 11',
    section: 'A',
    parentName: 'Suresh Patel',
    email: 'suresh.p@example.com',
    phone: '+91 97654 32109',
    totalFeeAssigned: 17500,
    paidAmount: 12500,
    waiverAmount: 0,
    balanceDue: 5000,
    status: 'Partial',
    overdueDays: 7,
  },
  {
    id: 'STU-005',
    name: 'David Chen',
    rollNo: '2025-105',
    grade: 'Grade 9',
    section: 'A',
    parentName: 'Michael Chen',
    email: 'mchen@example.com',
    phone: '+91 95432 10987',
    totalFeeAssigned: 14300,
    paidAmount: 0,
    waiverAmount: 0,
    balanceDue: 14300,
    status: 'Defaulter',
    overdueDays: 35,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'TXN-9901',
    studentId: 'STU-99',
    studentName: 'Adobe Creative Cloud',
    category: 'Subscription',
    amount: 8200,
    type: 'Outflow',
    date: 'Nov 21, 2025',
    method: 'Razorpay',
    status: 'Completed',
    referenceNo: 'RZP_SUB_88291',
    receiptNo: 'REC-2025-001',
    notes: 'Design department software licenses',
  },
  {
    id: 'TXN-9902',
    studentId: 'STU-98',
    studentName: 'Payment from Client ABC',
    category: 'Revenue',
    amount: 12450,
    type: 'Inflow',
    date: 'Nov 29, 2025',
    method: 'UPI_QR',
    status: 'Completed',
    referenceNo: 'UPI_REF_991823',
    receiptNo: 'REC-2025-002',
    notes: 'Sponsorship revenue for sports event',
  },
  {
    id: 'TXN-9903',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    rollNo: '2025-101',
    category: 'Tuition Fee',
    amount: 12500,
    type: 'Inflow',
    date: 'Dec 05, 2025',
    method: 'Razorpay',
    status: 'Completed',
    referenceNo: 'RZP_PAY_948271',
    receiptNo: 'REC-2025-003',
    notes: 'Quarterly Tuition Payment',
  },
  {
    id: 'TXN-9904',
    studentId: 'STU-002',
    studentName: 'Sofia Martinez',
    rollNo: '2025-102',
    category: 'Transport Fee',
    amount: 3200,
    type: 'Inflow',
    date: 'Dec 07, 2025',
    method: 'Cash',
    status: 'Completed',
    referenceNo: 'CSH_CNTR_441',
    receiptNo: 'REC-2025-004',
    notes: 'Counter Cash Deposit',
  },
  {
    id: 'TXN-9905',
    studentId: 'STU-004',
    studentName: 'Ananya Patel',
    rollNo: '2025-104',
    category: 'Tuition Fee',
    amount: 12500,
    type: 'Inflow',
    date: 'Dec 08, 2025',
    method: 'Cheque',
    status: 'Under_Reconciliation',
    referenceNo: 'CHQ_HDFC_00912',
    receiptNo: 'REC-2025-005',
    notes: 'HDFC Bank Cheque under clear processing',
  },
];

const initialReconciliation: OfflineReconciliation[] = [
  {
    id: 'REC-OFF-01',
    studentId: 'STU-004',
    studentName: 'Ananya Patel',
    rollNo: '2025-104',
    method: 'Cheque',
    amount: 12500,
    chequeNumber: 'CHQ-778901',
    bankName: 'HDFC Bank',
    depositDate: '2025-12-08',
    status: 'Pending_Deposit',
    receiptNo: 'REC-2025-005',
    recordedBy: 'Admin Malik',
    notes: 'Cheque handed at counter desk 2',
  },
  {
    id: 'REC-OFF-02',
    studentId: 'STU-002',
    studentName: 'Sofia Martinez',
    rollNo: '2025-102',
    method: 'Cash',
    amount: 3200,
    depositDate: '2025-12-07',
    status: 'Realized',
    receiptNo: 'REC-2025-004',
    recordedBy: 'Admin Malik',
    notes: 'Cash verified & vaulted',
  },
];

const initialAIInsights: AIInsight[] = [
  {
    id: 'AI-01',
    title: 'Tuition Collection Trend',
    summary: '92% of Grade 11 fees collected on time. Grade 10 shows 18% delayed payments due to late transport slips.',
    suggestedAction: 'Send automated WhatsApp payment reminders with instant 0-fee UPI QR links to Grade 10 parents.',
    potentialImpact: 'Estimated +$14,200 revenue recovery within 48 hours.',
  },
  {
    id: 'AI-02',
    title: 'Cheque Realization Speed',
    summary: 'Average cheque clearance duration is 3.2 days. ICICI clearing batch at 4:00 PM today.',
    suggestedAction: 'Deposit 4 pending cheques worth $18,400 before 3:30 PM.',
    potentialImpact: 'Maintains optimal liquidity projection for weekend operational expense payroll.',
  },
];

export const FeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const currencySymbol = '$';

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(initialFeeStructures);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [reconciliationQueue, setReconciliationQueue] = useState<OfflineReconciliation[]>(initialReconciliation);
  const [aiInsights] = useState<AIInsight[]>(initialAIInsights);

  // Screenshot Exact Metrics
  const [totalRevenue] = useState(210550);
  const [netProfit] = useState(155200);
  const [operatingExpenses] = useState(120450);
  const [cashProjection] = useState(188000);
  const [monthlyCashFlow] = useState(104627);

  // Modals & Active UI Selection
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [isFeeEngineOpen, setIsFeeEngineOpen] = useState(false);
  const [isOfflineRecOpen, setIsOfflineRecOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // CRUD Fee Structures
  const addFeeStructure = (feeData: Omit<FeeStructure, 'id'>) => {
    const newFee: FeeStructure = {
      ...feeData,
      id: `FEE-${Math.floor(100 + Math.random() * 900)}`,
    };
    setFeeStructures((prev) => [newFee, ...prev]);
  };

  const updateFeeStructure = (id: string, updated: Partial<FeeStructure>) => {
    setFeeStructures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteFeeStructure = (id: string) => {
    setFeeStructures((prev) => prev.filter((item) => item.id !== id));
  };

  // Add Transaction & Update Student Ledger
  const addTransaction = (txData: Omit<Transaction, 'id' | 'receiptNo'>): Transaction => {
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      ...txData,
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptNo,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update Student state if associated
    if (txData.studentId) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === txData.studentId) {
            const newPaid = s.paidAmount + txData.amount;
            const newBalance = Math.max(0, s.totalFeeAssigned - newPaid - s.waiverAmount);
            const newStatus = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Defaulter';
            return {
              ...s,
              paidAmount: newPaid,
              balanceDue: newBalance,
              status: newStatus,
            };
          }
          return s;
        })
      );
    }

    return newTx;
  };

  // Grant Fee Waiver / Scholarship
  const applyWaiver = (studentId: string, amount: number, reason: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newWaiver = s.waiverAmount + amount;
          const newBalance = Math.max(0, s.totalFeeAssigned - s.paidAmount - newWaiver);
          const newStatus = newBalance === 0 ? 'Paid' : s.paidAmount > 0 ? 'Partial' : 'Defaulter';
          return {
            ...s,
            waiverAmount: newWaiver,
            waiverReason: reason,
            balanceDue: newBalance,
            status: newStatus,
          };
        }
        return s;
      })
    );
  };

  // Record Offline Payment (Cash or Cheque)
  const recordOfflinePayment = (recData: Omit<OfflineReconciliation, 'id' | 'receiptNo' | 'status'>) => {
    const receiptNo = `REC-OFF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRec: OfflineReconciliation = {
      ...recData,
      id: `REC-OFF-${Math.floor(100 + Math.random() * 900)}`,
      receiptNo,
      status: recData.method === 'Cash' ? 'Realized' : 'Pending_Deposit',
    };

    setReconciliationQueue((prev) => [newRec, ...prev]);

    // Create corresponding transaction log
    addTransaction({
      studentId: recData.studentId,
      studentName: recData.studentName,
      rollNo: recData.rollNo,
      category: recData.method === 'Cash' ? 'Cash Counter Deposit' : 'Cheque Submission',
      amount: recData.amount,
      type: 'Inflow',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      method: recData.method,
      status: recData.method === 'Cash' ? 'Completed' : 'Under_Reconciliation',
      referenceNo: recData.chequeNumber || `CSH_${Math.floor(1000 + Math.random() * 9000)}`,
      notes: recData.notes || `Recorded by ${recData.recordedBy}`,
    });
  };

  // Update Cheque / Cash Reconciliation status
  const updateReconciliationStatus = (id: string, status: 'Realized' | 'Bounced') => {
    setReconciliationQueue((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return { ...rec, status };
        }
        return rec;
      })
    );

    // Also update matching transaction log
    const recItem = reconciliationQueue.find((r) => r.id === id);
    if (recItem) {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.studentId === recItem.studentId && tx.receiptNo === recItem.receiptNo) {
            return {
              ...tx,
              status: status === 'Realized' ? 'Completed' : 'Failed',
            };
          }
          return tx;
        })
      );
    }
  };

  // Send Defaulter Reminder (SMS / Email)
  const sendDefaulterReminder = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return { ...s };
        }
        return s;
      })
    );
  };

  // Razorpay Gateway Checkout Invoker
  const processRazorpayPayment = async (studentId: string, amount: number, category: string) => {
    const student = students.find((s) => s.id === studentId);
    const studentName = student ? student.name : 'School Parent / Student';

    return new Promise<void>((resolve) => {
      // Check if Razorpay SDK script loaded in window
      if ((window as any).Razorpay) {
        const options = {
          key: 'rzp_test_nueansaschool', // Test mode key
          amount: amount * 100, // Amount in paise
          currency: 'USD',
          name: 'Nueansa International School',
          description: `Fee Payment for ${category} - ${studentName}`,
          image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          handler: function (response: any) {
            const tx = addTransaction({
              studentId,
              studentName,
              rollNo: student?.rollNo,
              category: `${category} (Razorpay)`,
              amount,
              type: 'Inflow',
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              method: 'Razorpay',
              status: 'Completed',
              referenceNo: response.razorpay_payment_id || `RZP_${Math.floor(100000 + Math.random() * 900000)}`,
              notes: 'Online payment via Razorpay Gateway SDK',
            });
            setActiveReceiptTx(tx);
            resolve();
          },
          prefill: {
            name: studentName,
            email: student?.email || 'parent@nueansaschool.edu',
            contact: student?.phone || '+91 98765 43210',
          },
          theme: {
            color: '#FF4D00',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation if offline
        setTimeout(() => {
          const tx = addTransaction({
            studentId,
            studentName,
            rollNo: student?.rollNo,
            category: `${category} (Razorpay Direct)`,
            amount,
            type: 'Inflow',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            method: 'Razorpay',
            status: 'Completed',
            referenceNo: `RZP_SIM_${Math.floor(100000 + Math.random() * 900000)}`,
            notes: 'Simulated Razorpay Gateway Checkout',
          });
          setActiveReceiptTx(tx);
          resolve();
        }, 800);
      }
    });
  };

  return (
    <FeeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currencySymbol,
        feeStructures,
        students,
        transactions,
        reconciliationQueue,
        aiInsights,
        totalRevenue,
        netProfit,
        operatingExpenses,
        cashProjection,
        monthlyCashFlow,
        addFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        addTransaction,
        applyWaiver,
        recordOfflinePayment,
        updateReconciliationStatus,
        sendDefaulterReminder,
        selectedStudentForPayment,
        setSelectedStudentForPayment,
        isRazorpayOpen,
        setIsRazorpayOpen,
        isUpiOpen,
        setIsUpiOpen,
        isFeeEngineOpen,
        setIsFeeEngineOpen,
        isOfflineRecOpen,
        setIsOfflineRecOpen,
        activeReceiptTx,
        setActiveReceiptTx,
        processRazorpayPayment,
      }}
    >
      {children}
    </FeeContext.Provider>
  );
};

export const useFee = () => {
  const context = useContext(FeeContext);
  if (!context) {
    throw new Error('useFee must be used within a FeeProvider');
  }
  return context;
};
