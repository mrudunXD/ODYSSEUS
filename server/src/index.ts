import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import winston from 'winston';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { generateInvoicePDF } from './pdfGenerator.js';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || 'schoolfin_jwt_secret_key_2026_super_secure';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TIWVCWyzGuKOq8';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'yQ1CqeJoYcf07z80S2wLlKAm';

const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP.' },
});

app.use('/api/', apiLimiter);

const sanitizeInputs = (req: any, _res: any, next: any) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], { allowedTags: [], allowedAttributes: {} }).trim();
      }
    }
  }
  next();
};

app.use(sanitizeInputs);

const issueAccessToken = (user: { id: string; email: string; role: string; name: string }) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

const createRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  return token;
};

const createLedgerEntries = async (
  tx: any,
  transactionId: string,
  schoolId: string,
  amount: number,
  method: string,
  description: string
) => {
  const debitAccount = method === 'CASH' ? 'CASH' : method === 'WALLET' ? 'WALLET' : 'BANK';
  await tx.ledgerEntry.createMany({
    data: [
      {
        schoolId,
        transactionId,
        account: debitAccount,
        type: 'DEBIT',
        amount,
        description: `Debit ${debitAccount} for ${description}`,
      },
      {
        schoolId,
        transactionId,
        account: 'ACCOUNTS_RECEIVABLE',
        type: 'CREDIT',
        amount,
        description: `Credit Accounts Receivable for ${description}`,
      },
    ],
  });
};

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired access token' });
    req.user = user;
    next();
  });
};

const requireRole = (...roles: string[]) =>
  (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };

const writeAudit = async (userId: string, action: string, entity: string, entityId: string, oldValue?: any, newValue?: any) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      },
    });
  } catch (_) {}
};

app.get('/healthz', (_req, res) => res.json({ status: 'UP', timestamp: new Date() }));
app.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'READY', db: 'CONNECTED' });
  } catch (err) {
    res.status(503).json({ status: 'UNREADY', db: 'DISCONNECTED' });
  }
});

// AUTH
app.post('/api/auth/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid email or password format' });

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'Invalid credentials or account disabled' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = issueAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    await writeAudit(user.id, 'USER_LOGIN', 'User', user.id, null, { role: user.role });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        schoolId: user.schoolId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored || stored.expiresAt < new Date())
      return res.status(401).json({ error: 'Invalid or expired refresh token' });

    if (!stored.user.isActive)
      return res.status(401).json({ error: 'Account has been disabled' });

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const newRefreshToken = await createRefreshToken(stored.user.id);
    const accessToken = issueAccessToken(stored.user);

    res.json({ success: true, token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    await writeAudit(req.user.id, 'USER_LOGOUT', 'User', req.user.id);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (_) {
    res.json({ success: true });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { school: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      user: {
        id: user.id,
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
  try {
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: 'Current password required to change password' });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid)
        return res.status(400).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 8)
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({ where: { id: req.user.id }, data: updateData });
    await writeAudit(req.user.id, 'PROFILE_UPDATED', 'User', req.user.id, { name: user.name }, { name: updated.name });

    res.json({
      success: true,
      user: {
        id: updated.id,
        schoolId: updated.schoolId,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DASHBOARD
app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthRev, lastMonthRev, totalRevAgg, pendingAgg, waiversAgg, activeStudents] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startOfThisMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.invoice.aggregate({
        where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
        _sum: { totalAmount: true },
      }),
      prisma.waiver.aggregate({ _sum: { amount: true } }),
      prisma.student.count({ where: { isActive: true } }),
    ]);

    const totalRevenue = totalRevAgg._sum.amount ?? 0;
    const netPending = (pendingAgg._sum as any).totalAmount ?? 0;
    const totalWaivers = waiversAgg._sum.amount ?? 0;

    const thisRev = thisMonthRev._sum.amount ?? 0;
    const lastRev = lastMonthRev._sum.amount ?? 0;
    const revenueDeltaPercent = lastRev > 0 ? parseFloat(((thisRev - lastRev) / lastRev * 100).toFixed(1)) : 0;

    const [thisMonthPending, lastMonthPending] = await Promise.all([
      prisma.invoice.count({ where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, createdAt: { gte: startOfThisMonth } } }),
      prisma.invoice.count({ where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    const pendingDeltaPercent = lastMonthPending > 0
      ? parseFloat(((thisMonthPending - lastMonthPending) / lastMonthPending * 100).toFixed(1))
      : 0;

    const [totalInvoices, paidInvoices] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'PAID' } }),
    ]);
    const collectionRatePercent = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

    const overdueCount = await prisma.invoice.count({ where: { status: 'OVERDUE' } });
    const aiInsight = overdueCount > 0
      ? `${overdueCount} invoices are overdue. Collection rate is ${collectionRatePercent}%. Consider sending UPI QR reminders to defaulters.`
      : collectionRatePercent < 80
      ? `Collection rate is ${collectionRatePercent}%. ${activeStudents} active students enrolled. Generate term invoices to improve tracking.`
      : `Collection rate is ${collectionRatePercent}%. All caught up — ${paidInvoices} invoices paid this period.`;

    res.json({
      success: true,
      data: {
        totalRevenue,
        netPending,
        totalWaivers,
        activeStudents,
        revenueDeltaPercent,
        pendingDeltaPercent,
        collectionRatePercent,
        aiInsight,
      },
    });
  } catch (err: any) {
    logger.error('Dashboard stats error', { error: err.message });
    res.status(500).json({ error: 'Failed to compute dashboard statistics' });
  }
});

app.get('/api/dashboard/chart-data', authenticateToken, async (_req, res) => {
  try {
    const days = 30;
    const result: { date: string; fullDate: string; inflow: number; outflow: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const agg = await prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });

      const inflow = agg._sum.amount ?? 0;
      const label = `${d.toLocaleString('en-IN', { month: 'short' })} ${String(d.getDate()).padStart(2, '0')}`;
      const fullLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      result.push({ date: label, fullDate: fullLabel, inflow, outflow: 0 });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute chart data' });
  }
});

// REAL PDF INVOICE DOWNLOAD
app.get('/api/invoices/:id/pdf', authenticateToken, async (req: any, res: any) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { student: true, items: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const pdfBuffer = await generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNo}.pdf`);
    res.send(pdfBuffer);
  } catch (err: any) {
    logger.error('PDF Generation Error', { error: err.message });
    res.status(500).json({ error: 'Failed to generate PDF receipt' });
  }
});

// ENTERPRISE MODULES (RFID POS, WALLET, INVENTORY, TRANSPORT)
app.get('/api/pos/student-wallet/:rfidOrCode', authenticateToken, async (req: any, res: any) => {
  try {
    const { rfidOrCode } = req.params;
    const student = await prisma.student.findFirst({
      where: { OR: [{ rfidTag: rfidOrCode }, { studentCode: rfidOrCode }] },
      include: { class: true },
    });
    if (!student) return res.status(404).json({ error: 'Student card/code not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lookup student wallet' });
  }
});

app.post('/api/pos/cafeteria-checkout', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'TEACHER'), async (req: any, res: any) => {
  try {
    const { studentId, itemLabel, amount } = req.body;
    if (!studentId || !amount) return res.status(400).json({ error: 'Student ID and amount required' });

    const school = await prisma.school.findFirst();
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!school || !student) return res.status(404).json({ error: 'Student not found' });

    if (student.walletBal < Number(amount))
      return res.status(400).json({ error: `Insufficient campus wallet balance. Available: ₹${student.walletBal}` });

    const result = await prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: { walletBal: { decrement: Number(amount) } },
      });

      const cafeteriaTx = await tx.cafeteriaTx.create({
        data: {
          schoolId: school.id,
          studentId,
          itemLabel: itemLabel || 'Cafeteria Order',
          amount: Number(amount),
        },
      });

      return { updatedStudent, cafeteriaTx };
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: 'Cafeteria transaction failed' });
  }
});

app.post('/api/pos/topup-wallet', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res: any) => {
  try {
    const { studentId, amount } = req.body;
    if (!studentId || !amount || Number(amount) <= 0)
      return res.status(400).json({ error: 'Valid student ID and positive topup amount required' });

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { walletBal: { increment: Number(amount) } },
    });

    await writeAudit(req.user.id, 'WALLET_TOPUP', 'Student', studentId, null, { amount });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to topup campus wallet' });
  }
});

app.get('/api/inventory', authenticateToken, async (_req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.get('/api/transport/routes', authenticateToken, async (_req, res) => {
  try {
    const routes = await prisma.busRoute.findMany({ orderBy: { routeName: 'asc' } });
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus routes' });
  }
});

// STUDENTS
app.get('/api/students', authenticateToken, async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { class: true, invoices: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = students.map((s) => {
      const totalAssigned = s.invoices.reduce((a, i) => a + i.totalAmount, 0);
      const paidAmount = s.invoices.reduce((a, i) => a + i.paidAmount, 0);
      const balanceDue = totalAssigned - paidAmount;
      const hasOverdue = s.invoices.some((i) => i.status === 'OVERDUE' || (i.dueDate < new Date() && i.paidAmount < i.totalAmount));
      let status: string = 'UNPAID';
      if (totalAssigned > 0 && paidAmount >= totalAssigned) status = 'PAID';
      else if (paidAmount > 0) status = 'PARTIAL';
      else if (hasOverdue) status = 'OVERDUE';
      return { ...s, totalAssigned, paidAmount, balanceDue, status };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res) => {
  try {
    const { studentCode, name, parentName, parentEmail, parentPhone, classId } = req.body;
    if (!name || !parentEmail) return res.status(400).json({ error: 'Student name and parent email required' });

    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).json({ error: 'School not configured' });

    let resolvedClassId = classId;
    if (!resolvedClassId) {
      const firstClass = await prisma.class.findFirst({ where: { schoolId: school.id } });
      if (!firstClass) return res.status(400).json({ error: 'No classes configured — add a class first' });
      resolvedClassId = firstClass.id;
    }

    const student = await prisma.student.create({
      data: {
        schoolId: school.id,
        classId: resolvedClassId,
        studentCode: studentCode?.trim() || `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        parentName: (parentName || '').trim(),
        parentEmail: parentEmail.toLowerCase().trim(),
        parentPhone: (parentPhone || '').trim(),
        rfidTag: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
        walletBal: 500,
      },
      include: { class: true },
    });

    await writeAudit(req.user.id, 'STUDENT_CREATED', 'Student', student.id, null, { name, parentEmail });
    res.status(201).json({ success: true, data: student });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Student code already exists' });
    res.status(500).json({ error: err.message || 'Failed to enroll student' });
  }
});

app.put('/api/students/:id', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res) => {
  try {
    const { name, parentName, parentEmail, parentPhone, classId, isActive } = req.body;
    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { name, parentName, parentEmail, parentPhone, classId, isActive },
      include: { class: true },
    });
    await writeAudit(req.user.id, 'STUDENT_UPDATED', 'Student', req.params.id, null, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/api/students/:id', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: any, res) => {
  try {
    await prisma.student.update({ where: { id: req.params.id }, data: { isActive: false } });
    await writeAudit(req.user.id, 'STUDENT_DEACTIVATED', 'Student', req.params.id);
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate student' });
  }
});

app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        invoices: { include: { items: { include: { feeType: true } }, transactions: true } },
        waivers: true,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// CLASSES
app.get('/api/classes', authenticateToken, async (_req, res) => {
  try {
    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.post('/api/classes', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: any, res) => {
  try {
    const { name, section } = req.body;
    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).json({ error: 'School not configured' });
    const cls = await prisma.class.create({ data: { schoolId: school.id, name, section } });
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// FEE TYPES
app.get('/api/fees', authenticateToken, async (_req, res) => {
  try {
    const fees = await prisma.feeType.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: fees });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fee types' });
  }
});

app.post('/api/fees', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res) => {
  try {
    const { name, amount, frequency, lateFeePerDay = 50, gracePeriodDays = 5, description, applicableTo = 'ALL' } = req.body;
    if (!name || !amount || !frequency) return res.status(400).json({ error: 'Name, amount, and frequency required' });

    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).json({ error: 'School not configured' });

    const fee = await prisma.feeType.create({
      data: {
        schoolId: school.id,
        name: name.trim(),
        amount: Number(amount),
        frequency,
        lateFeePerDay: Number(lateFeePerDay),
        gracePeriodDays: Number(gracePeriodDays),
        description: description?.trim(),
        applicableTo,
      },
    });

    await writeAudit(req.user.id, 'FEE_TYPE_CREATED', 'FeeType', fee.id, null, { name, amount, frequency });
    res.status(201).json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fee structure' });
  }
});

app.delete('/api/fees/:id', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: any, res) => {
  try {
    await prisma.feeType.update({ where: { id: req.params.id }, data: { isActive: false } });
    await writeAudit(req.user.id, 'FEE_TYPE_DEACTIVATED', 'FeeType', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate fee type' });
  }
});

// INVOICES
app.get('/api/invoices', authenticateToken, async (req: any, res) => {
  try {
    const where: any = {};
    if (req.user.role === 'PARENT') {
      const children = await prisma.student.findMany({ where: { parentEmail: req.user.email } });
      where.studentId = { in: children.map((c: any) => c.id) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        student: { include: { class: true } },
        items: { include: { feeType: true } },
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const enriched = invoices.map((inv) => {
      let lateFeeAccrued = 0;
      if (['UNPAID', 'PARTIAL', 'OVERDUE'].includes(inv.status) && inv.dueDate < now) {
        const overdueDays = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
        lateFeeAccrued = overdueDays * 50;
        if (inv.status !== 'OVERDUE') {
          prisma.invoice.update({ where: { id: inv.id }, data: { status: 'OVERDUE' } }).catch(() => {});
        }
      }
      return { ...inv, lateFeeAccrued, overdueDays: lateFeeAccrued > 0 ? Math.floor(lateFeeAccrued / 50) : 0 };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/api/invoices', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res) => {
  try {
    const { studentId, feeTypeIds, dueDate, items } = req.body;
    if (!studentId || !dueDate) return res.status(400).json({ error: 'Student ID and due date required' });

    const school = await prisma.school.findFirst();
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!school || !student) return res.status(400).json({ error: 'Invalid student or school' });

    let invoiceItems: { feeTypeId: string; label: string; amount: number }[] = [];
    let totalAmount = 0;

    if (items && items.length > 0) {
      invoiceItems = items;
      totalAmount = items.reduce((a: number, i: any) => a + Number(i.amount), 0);
    } else if (feeTypeIds && feeTypeIds.length > 0) {
      const feeTypes = await prisma.feeType.findMany({ where: { id: { in: feeTypeIds } } });
      invoiceItems = feeTypes.map((ft) => ({ feeTypeId: ft.id, label: ft.name, amount: ft.amount }));
      totalAmount = feeTypes.reduce((a, ft) => a + ft.amount, 0);
    }

    if (totalAmount <= 0) return res.status(400).json({ error: 'Invoice total must be greater than zero' });

    const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoice = await prisma.invoice.create({
      data: {
        schoolId: school.id,
        studentId,
        invoiceNo,
        dueDate: new Date(dueDate),
        totalAmount,
        items: {
          create: invoiceItems.map((i) => ({
            feeTypeId: i.feeTypeId,
            label: i.label,
            amount: i.amount,
          })),
        },
      },
      include: { items: { include: { feeType: true } }, student: true },
    });

    await writeAudit(req.user.id, 'INVOICE_CREATED', 'Invoice', invoice.id, null, { studentId, totalAmount, invoiceNo });
    res.status(201).json({ success: true, data: invoice });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create invoice' });
  }
});

app.delete('/api/invoices/:id', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: any, res) => {
  try {
    await prisma.invoice.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    await writeAudit(req.user.id, 'INVOICE_CANCELLED', 'Invoice', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel invoice' });
  }
});

// TRANSACTIONS / PAYMENTS
app.get('/api/transactions', authenticateToken, async (req: any, res) => {
  try {
    const where: any = {};
    if (req.user.role === 'PARENT') {
      const children = await prisma.student.findMany({ where: { parentEmail: req.user.email } });
      const invoices = await prisma.invoice.findMany({ where: { studentId: { in: children.map((c: any) => c.id) } } });
      where.invoiceId = { in: invoices.map((i: any) => i.id) };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { invoice: { include: { student: true } }, ledgerEntries: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/payments/record', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (req: any, res) => {
  try {
    const { invoiceId, method, amount, referenceNo, notes, chequeNo, chequeBank, upiRef, idempotencyKey } = req.body;
    if (!invoiceId || !method || !amount) return res.status(400).json({ error: 'Invoice ID, method, and amount are required' });

    if (idempotencyKey) {
      const existingTx = await prisma.transaction.findUnique({ where: { idempotencyKey } });
      if (existingTx) return res.json({ success: true, data: existingTx, note: 'Idempotent replay' });
    }

    const school = await prisma.school.findFirst();
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { student: true } });
    if (!school || !invoice) return res.status(400).json({ error: 'Invoice not found' });

    const result = await prisma.$transaction(async (tx) => {
      const newPaid = invoice.paidAmount + Number(amount);
      const newStatus = newPaid >= invoice.totalAmount ? 'PAID' : 'PARTIAL';

      await tx.invoice.update({ where: { id: invoiceId }, data: { paidAmount: newPaid, status: newStatus } });

      const transaction = await tx.transaction.create({
        data: {
          schoolId: school.id,
          invoiceId,
          amount: Number(amount),
          method,
          status: 'SUCCESS',
          idempotencyKey: idempotencyKey || null,
          referenceNo: referenceNo || `REF-${Date.now()}`,
          chequeNo,
          chequeBank,
          upiRef,
          notes,
          cashReceivedBy: method === 'CASH' ? req.user.name : null,
        },
      });

      await createLedgerEntries(
        tx,
        transaction.id,
        school.id,
        Number(amount),
        method,
        `Payment for ${invoice.invoiceNo} (${invoice.student.name})`
      );

      return transaction;
    });

    await writeAudit(req.user.id, 'PAYMENT_RECORDED', 'Transaction', result.id, null, { invoiceId, method, amount });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Payment error', { error: err.message });
    res.status(500).json({ error: err.message || 'Failed to record payment' });
  }
});

// RAZORPAY
app.post('/api/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || Number(amount) < 100)
      return res.status(400).json({ error: 'Minimum amount is ₹1 (100 paise)' });

    const order = await razorpay.orders.create({
      amount: Number(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

app.post('/api/verify-payment', authenticateToken, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: 'Missing Razorpay signature parameters' });

    const expectedSig = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ success: false, error: 'Invalid HMAC signature — payment rejected' });

    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).json({ error: 'School not configured' });

    const paidAmt = Number(amount) / 100;

    const result = await prisma.$transaction(async (tx) => {
      let invoice = invoiceId ? await tx.invoice.findUnique({ where: { id: invoiceId }, include: { student: true } }) : null;

      if (!invoice) {
        const firstStudent = await tx.student.findFirst();
        if (firstStudent) {
          invoice = await tx.invoice.create({
            data: {
              schoolId: school.id,
              studentId: firstStudent.id,
              invoiceNo: `INV-RZP-${Date.now()}`,
              dueDate: new Date(Date.now() + 86400000 * 10),
              totalAmount: paidAmt,
              paidAmount: paidAmt,
              status: 'PAID',
            },
            include: { student: true },
          });
        }
      } else {
        const newPaid = invoice.paidAmount + paidAmt;
        invoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: { paidAmount: newPaid, status: newPaid >= invoice.totalAmount ? 'PAID' : 'PARTIAL' },
          include: { student: true },
        });
      }

      if (invoice) {
        const transaction = await tx.transaction.create({
          data: {
            schoolId: school.id,
            invoiceId: invoice.id,
            amount: paidAmt,
            method: 'RAZORPAY',
            status: 'SUCCESS',
            referenceNo: razorpay_payment_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
          },
        });

        await createLedgerEntries(
          tx,
          transaction.id,
          school.id,
          paidAmt,
          'RAZORPAY',
          `Razorpay payment for ${invoice.invoiceNo}`
        );

        return transaction;
      }
      return null;
    });

    if (result) {
      await writeAudit(req.user.id, 'RAZORPAY_PAYMENT', 'Transaction', razorpay_payment_id, null, { amount: paidAmt });
    }

    res.json({ success: true, payment_id: razorpay_payment_id, message: 'Payment verified and posted to Ledger' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

// DEFAULTERS
app.get('/api/defaulters', authenticateToken, async (_req, res) => {
  try {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { status: 'OVERDUE' },
          { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: now } },
        ],
      },
      include: { student: { include: { class: true } }, transactions: true },
      orderBy: { dueDate: 'asc' },
    });

    const defaulters = overdueInvoices.map((inv) => {
      const overdueDays = Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000));
      const lateFeeAccrued = overdueDays * 50;
      return {
        invoiceId: inv.id,
        invoiceNo: inv.invoiceNo,
        studentId: inv.studentId,
        studentCode: inv.student.studentCode,
        studentName: inv.student.name,
        className: `${inv.student.class?.name || ''} ${inv.student.class?.section || ''}`.trim(),
        parentName: inv.student.parentName,
        parentEmail: inv.student.parentEmail,
        parentPhone: inv.student.parentPhone,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.totalAmount - inv.paidAmount,
        dueDate: inv.dueDate,
        overdueDays,
        lateFeeAccrued,
        status: 'OVERDUE',
      };
    });

    res.json({ success: true, data: defaulters });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch defaulters' });
  }
});

// WAIVERS
app.post('/api/waivers', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: any, res) => {
  try {
    const { studentId, invoiceId, amount, reason } = req.body;
    if (!studentId || !invoiceId || !amount || !reason)
      return res.status(400).json({ error: 'All fields required' });

    const waiver = await prisma.waiver.create({
      data: { studentId, invoiceId, amount: Number(amount), reason, approvedBy: req.user.name },
    });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice) {
      const newTotal = Math.max(0, invoice.totalAmount - Number(amount));
      const newStatus = invoice.paidAmount >= newTotal ? 'PAID' : invoice.status;
      await prisma.invoice.update({ where: { id: invoiceId }, data: { totalAmount: newTotal, status: newStatus } });
    }

    await writeAudit(req.user.id, 'WAIVER_GRANTED', 'Waiver', waiver.id, null, { studentId, amount, reason });
    res.status(201).json({ success: true, data: waiver });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create waiver' });
  }
});

// USERS
app.get('/api/users', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireRole('SUPER_ADMIN'), async (req: any, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });

    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).json({ error: 'School not configured' });

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { schoolId: school.id, name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    await writeAudit(req.user.id, 'USER_CREATED', 'User', user.id, null, { email, role });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id/toggle', authenticateToken, requireRole('SUPER_ADMIN'), async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    await writeAudit(req.user.id, updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'User', req.params.id);
    res.json({ success: true, data: { isActive: updated.isActive } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// PARENT PORTAL
app.get('/api/parent/my-children', authenticateToken, requireRole('PARENT'), async (req: any, res) => {
  try {
    const children = await prisma.student.findMany({
      where: { parentEmail: req.user.email, isActive: true },
      include: {
        class: true,
        invoices: {
          include: { transactions: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const formatted = children.map((child) => {
      const totalAssigned = child.invoices.reduce((a, i) => a + i.totalAmount, 0);
      const paidAmount = child.invoices.reduce((a, i) => a + i.paidAmount, 0);
      const balanceDue = totalAssigned - paidAmount;
      return { ...child, totalAssigned, paidAmount, balanceDue };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your children' });
  }
});

// AUDIT LOGS
app.get('/api/audit-logs', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (_req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// SCHOOL SETTINGS
app.get('/api/settings/school', authenticateToken, async (_req, res) => {
  try {
    const school = await prisma.school.findFirst();
    res.json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch school settings' });
  }
});

app.put('/api/settings/school', authenticateToken, requireRole('SUPER_ADMIN'), async (req: any, res) => {
  try {
    const { name, address, logoUrl } = req.body;
    const school = await prisma.school.findFirst();
    if (!school) return res.status(404).json({ error: 'School not found' });
    const updated = await prisma.school.update({ where: { id: school.id }, data: { name, address, logoUrl } });
    await writeAudit(req.user.id, 'SCHOOL_UPDATED', 'School', school.id, null, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update school settings' });
  }
});

// REPORTS
app.get('/api/reports/summary', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), async (_req, res) => {
  try {
    const [totalRevenue, pendingAmount, overdueCount, paidCount, totalStudents, byMethod] = await Promise.all([
      prisma.transaction.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } }, _sum: { totalAmount: true } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.invoice.count({ where: { status: 'PAID' } }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.transaction.groupBy({ by: ['method'], where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount ?? 0,
        pendingAmount: (pendingAmount._sum as any).totalAmount ?? 0,
        overdueCount,
        paidCount,
        totalStudents,
        byMethod: byMethod.map((m) => ({ method: m.method, total: m._sum.amount, count: m._count })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute report summary' });
  }
});

const server = app.listen(PORT, () => {
  logger.info(`✓ SchoolFin Production Enterprise API running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    prisma.$disconnect();
    logger.info('HTTP server and DB connections closed');
  });
});
