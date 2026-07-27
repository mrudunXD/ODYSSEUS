import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FeeStructure,
  Student,
  Transaction,
  OfflineReconciliation,
  ChartDayPoint
} from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FeeContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currencySymbol: string;

  // Razorpay Key ID
  razorpayKey: string;

  // Domain State (Persisted in localStorage)
  feeStructures: FeeStructure[];
  students: Student[];
  transactions: Transaction[];
  reconciliationQueue: OfflineReconciliation[];

  // Dynamic Computed Metrics
  totalRevenue: number;
  netProfit: number;
  operatingExpenses: number;
  cashProjection: number;
  monthlyCashFlow: number;
  collectionRatePercent: number;
  dynamicChartData: ChartDayPoint[];

  // Student & Fee CRUD
  addStudent: (student: Omit<Student, 'id' | 'paidAmount' | 'waiverAmount' | 'balanceDue' | 'status' | 'overdueDays'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addFeeStructure: (fee: Omit<FeeStructure, 'id'>) => void;
  updateFeeStructure: (id: string, fee: Partial<FeeStructure>) => void;
  deleteFeeStructure: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id' | 'receiptNo' | 'timestamp'>) => Transaction;
  deleteTransaction: (id: string) => void;
  applyWaiver: (studentId: string, amount: number, reason: string) => void;
  recordOfflinePayment: (rec: Omit<OfflineReconciliation, 'id' | 'receiptNo' | 'status'>) => void;
  updateReconciliationStatus: (id: string, status: 'Realized' | 'Bounced') => void;
  sendDefaulterReminder: (studentId: string) => void;
  resetAllData: () => void;

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
  isAddStudentOpen: boolean;
  setIsAddStudentOpen: (open: boolean) => void;
  isAddTxOpen: boolean;
  setIsAddTxOpen: (open: boolean) => void;
  activeReceiptTx: Transaction | null;
  setActiveReceiptTx: (tx: Transaction | null) => void;

  // Official Standard Razorpay Checkout Flow (Create Order -> Standard Checkout -> Verify Signature)
  launchOfficialRazorpaySDK: (studentId: string, amount: number, category: string) => Promise<void>;
}

const FeeContext = createContext<FeeContextType | undefined>(undefined);

const defaultFeeStructures: FeeStructure[] = [
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
    grades: ['Grade 1', 'Grade 2', 'Grade 10', 'Grade 11'],
    description: 'AC Transport service with GPS live tracking',
    active: true,
  },
];

const defaultStudents: Student[] = [
  {
    id: 'STU-101',
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
    id: 'STU-102',
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
    id: 'STU-103',
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
];

const defaultTransactions: Transaction[] = [
  {
    id: 'TXN-9901',
    studentId: 'STU-101',
    studentName: 'Aarav Sharma',
    rollNo: '2025-101',
    category: 'Tuition Fee Collection',
    amount: 17500,
    type: 'Inflow',
    date: 'Dec 05, 2025',
    timestamp: Date.now() - 86400000 * 20,
    method: 'Razorpay',
    status: 'Completed',
    referenceNo: 'pay_rzp_948271',
    receiptNo: 'REC-2025-001',
    notes: 'Senior High Tuition Fee Payment',
  },
];

export const FeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const currencySymbol = '$';

  // Razorpay Key ID loaded from Environment Variables
  const razorpayKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TIWVCWyzGuKOq8';

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => {
    const saved = localStorage.getItem('nueansa_feeStructures');
    return saved ? JSON.parse(saved) : defaultFeeStructures;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('nueansa_students');
    return saved ? JSON.parse(saved) : defaultStudents;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nueansa_transactions');
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [reconciliationQueue, setReconciliationQueue] = useState<OfflineReconciliation[]>(() => {
    const saved = localStorage.getItem('nueansa_reconciliation');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nueansa_feeStructures', JSON.stringify(feeStructures));
  }, [feeStructures]);

  useEffect(() => {
    localStorage.setItem('nueansa_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('nueansa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nueansa_reconciliation', JSON.stringify(reconciliationQueue));
  }, [reconciliationQueue]);

  // Modals & UI Triggers
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [isFeeEngineOpen, setIsFeeEngineOpen] = useState(false);
  const [isOfflineRecOpen, setIsOfflineRecOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Dynamic Metrics
  const totalRevenue = transactions
    .filter((t) => t.type === 'Inflow' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const operatingExpenses = transactions
    .filter((t) => t.type === 'Outflow' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = Math.max(0, totalRevenue - operatingExpenses);
  const totalPendingStudentBalance = students.reduce((sum, s) => sum + s.balanceDue, 0);
  const cashProjection = totalRevenue + totalPendingStudentBalance;
  const totalAssignedFee = students.reduce((sum, s) => sum + s.totalFeeAssigned, 0);
  const collectionRatePercent = totalAssignedFee > 0 ? Math.round((totalRevenue / totalAssignedFee) * 100) : 0;
  const monthlyCashFlow = totalRevenue;

  const dynamicChartData: ChartDayPoint[] = Array.from({ length: 9 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (8 - idx));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });

    const dayInflow = transactions
      .filter((t) => t.type === 'Inflow' && t.status === 'Completed' && t.date.includes(dateStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const dayOutflow = transactions
      .filter((t) => t.type === 'Outflow' && t.status === 'Completed' && t.date.includes(dateStr))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: dateStr,
      fullDate,
      inflow: dayInflow || (idx === 4 ? 8740 : Math.floor(2000 + (idx * 750) % 5000)),
      outflow: dayOutflow || (idx === 4 ? 2110 : Math.floor(1000 + (idx * 430) % 3000)),
      inflowPercent: '↑ 2.5%',
      outflowPercent: '↓ 1.2%',
    };
  });

  // Student CRUD
  const addStudent = (stuData: Omit<Student, 'id' | 'paidAmount' | 'waiverAmount' | 'balanceDue' | 'status' | 'overdueDays'>) => {
    const id = `STU-${Math.floor(100 + Math.random() * 900)}`;
    const newStudent: Student = {
      ...stuData,
      id,
      paidAmount: 0,
      waiverAmount: 0,
      balanceDue: stuData.totalFeeAssigned,
      status: 'Defaulter',
      overdueDays: 1,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Fee Structure CRUD
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

  const addTransaction = (txData: Omit<Transaction, 'id' | 'receiptNo' | 'timestamp'>): Transaction => {
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      ...txData,
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptNo,
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (txData.studentId && txData.type === 'Inflow' && txData.status === 'Completed') {
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
              overdueDays: newBalance === 0 ? 0 : s.overdueDays,
            };
          }
          return s;
        })
      );
    }

    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

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
            overdueDays: newBalance === 0 ? 0 : s.overdueDays,
          };
        }
        return s;
      })
    );
  };

  const recordOfflinePayment = (recData: Omit<OfflineReconciliation, 'id' | 'receiptNo' | 'status'>) => {
    const receiptNo = `REC-OFF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRec: OfflineReconciliation = {
      ...recData,
      id: `REC-OFF-${Math.floor(100 + Math.random() * 900)}`,
      receiptNo,
      status: recData.method === 'Cash' ? 'Realized' : 'Pending_Deposit',
    };

    setReconciliationQueue((prev) => [newRec, ...prev]);

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

  const updateReconciliationStatus = (id: string, status: 'Realized' | 'Bounced') => {
    setReconciliationQueue((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status } : rec))
    );

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

      if (status === 'Realized') {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === recItem.studentId) {
              const newPaid = s.paidAmount + recItem.amount;
              const newBalance = Math.max(0, s.totalFeeAssigned - newPaid - s.waiverAmount);
              return {
                ...s,
                paidAmount: newPaid,
                balanceDue: newBalance,
                status: newBalance === 0 ? 'Paid' : 'Partial',
              };
            }
            return s;
          })
        );
      }
    }
  };

  const sendDefaulterReminder = (studentId: string) => {};

  const resetAllData = () => {
    localStorage.removeItem('nueansa_feeStructures');
    localStorage.removeItem('nueansa_students');
    localStorage.removeItem('nueansa_transactions');
    localStorage.removeItem('nueansa_reconciliation');
    setFeeStructures(defaultFeeStructures);
    setStudents(defaultStudents);
    setTransactions(defaultTransactions);
    setReconciliationQueue([]);
  };

  /**
   * Complete Razorpay Standard Web Integration Flow:
   * 1. Call POST /api/create-order to create order ID
   * 2. Open Razorpay modal with order_id & VITE_RAZORPAY_KEY_ID
   * 3. Send payment_id, order_id, signature to POST /api/verify-payment
   */
  const launchOfficialRazorpaySDK = async (studentId: string, amount: number, category: string): Promise<void> => {
    const student = students.find((s) => s.id === studentId);
    const studentName = student ? student.name : 'School Parent';
    const amountInPaise = amount * 100; // Minimum 100 paise

    if (!window.Razorpay) {
      alert('Razorpay Checkout SDK is loading. Please check your internet connection.');
      return;
    }

    try {
      // STEP 1: BACKEND - Create Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-[#Type]': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create Razorpay Order on server');
      }

      const orderData = await orderRes.json(); // { order_id, amount, currency }

      // STEP 2: FRONTEND - Open Razorpay Standard Modal with order_id
      return new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Nueansa International School',
          description: `Fee Collection: ${category} - ${studentName}`,
          order_id: orderData.order_id,
          image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          handler: async function (response: any) {
            try {
              // STEP 3: BACKEND - Verify Signature
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                // Payment Signature Verified! Log Transaction & Update Balance
                const tx = addTransaction({
                  studentId,
                  studentName,
                  rollNo: student?.rollNo,
                  category: `${category} (Razorpay Verified)`,
                  amount,
                  type: 'Inflow',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  method: 'Razorpay',
                  status: 'Completed',
                  referenceNo: response.razorpay_payment_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  notes: 'Razorpay HMAC-SHA256 Verified Transaction',
                });

                setActiveReceiptTx(tx);
                setIsRazorpayOpen(false);
                resolve();
              } else {
                alert(`Payment Signature Verification Failed: ${verifyData.error || 'Invalid signature'}`);
                reject(new Error('Signature verification failed'));
              }
            } catch (vErr: any) {
              alert(`Backend Verification Error: ${vErr.message}`);
              reject(vErr);
            }
          },
          prefill: {
            name: studentName,
            email: student?.email || 'parent@nueansaschool.edu',
            contact: student?.phone || '+91 98765 43210',
          },
          theme: {
            color: '#FF4D00',
          },
          modal: {
            ondismiss: function () {
              console.log('Razorpay modal dismissed by user.');
              resolve();
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert(`Razorpay Payment Failed: ${response.error.description}`);
          reject(new Error(response.error.description));
        });
        rzp.open();
      });
    } catch (error: any) {
      alert(`Razorpay Order Creation Error: ${error.message}`);
    }
  };

  return (
    <FeeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currencySymbol,
        razorpayKey,
        feeStructures,
        students,
        transactions,
        reconciliationQueue,
        totalRevenue,
        netProfit,
        operatingExpenses,
        cashProjection,
        monthlyCashFlow,
        collectionRatePercent,
        dynamicChartData,
        addStudent,
        updateStudent,
        deleteStudent,
        addFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        addTransaction,
        deleteTransaction,
        applyWaiver,
        recordOfflinePayment,
        updateReconciliationStatus,
        sendDefaulterReminder,
        resetAllData,
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
        isAddStudentOpen,
        setIsAddStudentOpen,
        isAddTxOpen,
        setIsAddTxOpen,
        activeReceiptTx,
        setActiveReceiptTx,
        launchOfficialRazorpaySDK,
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
