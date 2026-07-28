export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ACCOUNTANT' | 'TEACHER' | 'PARENT';

export const ROLE_PERMISSIONS: Record<Role, {
  manageUsers: boolean;
  createEditFeeTypes: boolean;
  generateInvoices: boolean;
  recordCashCheque: boolean;
  approveWaivers: boolean;
  viewAllStudents: boolean;
  viewOwnChildOnly: boolean;
  exportReports: boolean;
  manageSchoolConfig: boolean;
  reconcilePayments: boolean;
}> = {
  SUPER_ADMIN: {
    manageUsers: true,
    createEditFeeTypes: true,
    generateInvoices: true,
    recordCashCheque: true,
    approveWaivers: true,
    viewAllStudents: true,
    viewOwnChildOnly: false,
    exportReports: true,
    manageSchoolConfig: true,
    reconcilePayments: true,
  },
  ADMIN: {
    manageUsers: true,
    createEditFeeTypes: true,
    generateInvoices: true,
    recordCashCheque: true,
    approveWaivers: true,
    viewAllStudents: true,
    viewOwnChildOnly: false,
    exportReports: true,
    manageSchoolConfig: false,
    reconcilePayments: true,
  },
  ACCOUNTANT: {
    manageUsers: false,
    createEditFeeTypes: false,
    generateInvoices: true,
    recordCashCheque: true,
    approveWaivers: false,
    viewAllStudents: true,
    viewOwnChildOnly: false,
    exportReports: true,
    manageSchoolConfig: false,
    reconcilePayments: true,
  },
  TEACHER: {
    manageUsers: false,
    createEditFeeTypes: false,
    generateInvoices: false,
    recordCashCheque: false,
    approveWaivers: false,
    viewAllStudents: true,
    viewOwnChildOnly: false,
    exportReports: false,
    manageSchoolConfig: false,
    reconcilePayments: false,
  },
  PARENT: {
    manageUsers: false,
    createEditFeeTypes: false,
    generateInvoices: false,
    recordCashCheque: false,
    approveWaivers: false,
    viewAllStudents: false,
    viewOwnChildOnly: true,
    exportReports: false,
    manageSchoolConfig: false,
    reconcilePayments: false,
  },
};
