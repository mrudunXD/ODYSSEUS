import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TIWVCWyzGuKOq8';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'yQ1CqeJoYcf07z80S2wLlKAm';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SchoolFin Server Running Cleanly', port: PORT });
});

// STEP 1: BACKEND - Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum order amount is 100 paise (1 INR)' });
    }

    const options = {
      amount: Number(amount),
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Razorpay Order' });
  }
});

// STEP 3: BACKEND - Verify Payment Signature (HMAC-SHA256)
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay parameters' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment signature' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 210550,
      netPending: 25700,
      totalWaivers: 2500,
      activeStudents: 100,
      revenueDeltaPercent: 9.5,
      pendingDeltaPercent: -4.2,
      aiInsight: 'Term collection target is 88%. Recommend sending 0-fee UPI QR payment reminders to overdue Grade 10 parents.',
    },
  });
});

app.listen(PORT, () => {
  console.log(`SchoolFin Backend API Server running on port ${PORT}`);
});
