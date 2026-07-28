import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Springfield International School production database...');

  // Password hash for 'password123' (cost factor 12)
  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Create School
  const school = await prisma.school.upsert({
    where: { id: 'SCH-SPRINGFIELD-01' },
    update: {},
    create: {
      id: 'SCH-SPRINGFIELD-01',
      name: 'Springfield International School',
      address: '104 Edu Campus Way, Financial District',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
  });

  // 2. Create Users with Bcrypt Hashed Passwords
  const usersData = [
    {
      id: 'USR-SUPERADMIN-01',
      email: 'malik@springfield.edu',
      name: 'Malik',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    },
    {
      id: 'USR-ADMIN-01',
      email: 'admin@springfield.edu',
      name: 'Dr. Vikram Kapoor',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    },
    {
      id: 'USR-ACCOUNTANT-01',
      email: 'accountant@springfield.edu',
      name: 'Elena Martinez',
      role: 'ACCOUNTANT',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    },
    {
      id: 'USR-PARENT-01',
      email: 'parent@springfield.edu',
      name: 'Rajesh Sharma',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: {
        id: u.id,
        schoolId: school.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        avatarUrl: u.avatarUrl,
      },
    });
  }

  // 3. Create Classes
  const class11A = await prisma.class.upsert({
    where: { id: 'CLS-11A' },
    update: {},
    create: {
      id: 'CLS-11A',
      schoolId: school.id,
      name: 'Class 11',
      section: 'A',
    },
  });

  const class12B = await prisma.class.upsert({
    where: { id: 'CLS-12B' },
    update: {},
    create: {
      id: 'CLS-12B',
      schoolId: school.id,
      name: 'Class 12',
      section: 'B',
    },
  });

  const class10C = await prisma.class.upsert({
    where: { id: 'CLS-10C' },
    update: {},
    create: {
      id: 'CLS-10C',
      schoolId: school.id,
      name: 'Class 10',
      section: 'C',
    },
  });

  // 4. Create Students
  const aarav = await prisma.student.upsert({
    where: { studentCode: '2025-101' },
    update: {},
    create: {
      id: 'STU-101',
      schoolId: school.id,
      classId: class11A.id,
      studentCode: '2025-101',
      name: 'Aarav Sharma',
      parentName: 'Rajesh Sharma',
      parentEmail: 'parent@springfield.edu',
      parentPhone: '+91 98765 43210',
    },
  });

  const sofia = await prisma.student.upsert({
    where: { studentCode: '2025-102' },
    update: {},
    create: {
      id: 'STU-102',
      schoolId: school.id,
      classId: class12B.id,
      studentCode: '2025-102',
      name: 'Sofia Martinez',
      parentName: 'Elena Martinez',
      parentEmail: 'elena.m@example.com',
      parentPhone: '+91 98123 45678',
    },
  });

  const rohan = await prisma.student.upsert({
    where: { studentCode: '2025-103' },
    update: {},
    create: {
      id: 'STU-103',
      schoolId: school.id,
      classId: class10C.id,
      studentCode: '2025-103',
      name: 'Rohan Verma',
      parentName: 'Vikram Verma',
      parentEmail: 'vikram.v@example.com',
      parentPhone: '+91 99887 76655',
    },
  });

  // 5. Create Fee Structures
  const tuitionFee = await prisma.feeType.upsert({
    where: { id: 'FEE-101' },
    update: {},
    create: {
      id: 'FEE-101',
      schoolId: school.id,
      name: 'Senior High Tuition Fee',
      description: 'Quarterly academic instruction & smart lab access',
      amount: 12500,
      frequency: 'QUARTERLY',
      lateFeePerDay: 50,
      gracePeriodDays: 5,
    },
  });

  const busFee = await prisma.feeType.upsert({
    where: { id: 'FEE-102' },
    update: {},
    create: {
      id: 'FEE-102',
      schoolId: school.id,
      name: 'School Bus Transport - Route A',
      description: 'AC Transport service with GPS live tracking',
      amount: 3200,
      frequency: 'MONTHLY',
      lateFeePerDay: 20,
      gracePeriodDays: 5,
    },
  });

  // 6. Create Invoices
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2025-001' },
    update: {},
    create: {
      id: 'INV-1001',
      schoolId: school.id,
      studentId: aarav.id,
      invoiceNo: 'INV-2025-001',
      issueDate: new Date('2025-12-01'),
      dueDate: new Date('2025-12-10'),
      totalAmount: 17500,
      paidAmount: 17500,
      status: 'PAID',
    },
  });

  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2025-002' },
    update: {},
    create: {
      id: 'INV-1002',
      schoolId: school.id,
      studentId: sofia.id,
      invoiceNo: 'INV-2025-002',
      issueDate: new Date('2025-12-01'),
      dueDate: new Date('2025-12-10'),
      totalAmount: 17500,
      paidAmount: 10000,
      status: 'PARTIAL',
    },
  });

  const inv3 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2025-003' },
    update: {},
    create: {
      id: 'INV-1003',
      schoolId: school.id,
      studentId: rohan.id,
      invoiceNo: 'INV-2025-003',
      issueDate: new Date('2025-11-01'),
      dueDate: new Date('2025-11-10'),
      totalAmount: 15700,
      paidAmount: 0,
      status: 'OVERDUE',
    },
  });

  // 7. Create Transactions
  await prisma.transaction.upsert({
    where: { id: 'TXN-9901' },
    update: {},
    create: {
      id: 'TXN-9901',
      schoolId: school.id,
      invoiceId: inv1.id,
      amount: 17500,
      method: 'RAZORPAY',
      status: 'SUCCESS',
      referenceNo: 'pay_rzp_948271',
      razorpayPaymentId: 'pay_rzp_948271',
      createdAt: new Date('2025-12-05'),
    },
  });

  await prisma.transaction.upsert({
    where: { id: 'TXN-9902' },
    update: {},
    create: {
      id: 'TXN-9902',
      schoolId: school.id,
      invoiceId: inv2.id,
      amount: 10000,
      method: 'CASH',
      status: 'SUCCESS',
      referenceNo: 'CSH_CNTR_441',
      createdAt: new Date('2025-12-07'),
    },
  });

  // 8. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: 'USR-SUPERADMIN-01',
      action: 'SYSTEM_INITIALIZED',
      entity: 'School',
      entityId: school.id,
      newValue: 'Springfield International School production DB seeded with bcrypt passwords',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
