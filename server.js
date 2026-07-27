import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Razorpay SDK instance securely with environment variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('ERROR: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env file!');
}

const instance = new Razorpay({
  key_id: razorpayKeyId || '',
  key_secret: razorpayKeySecret || '',
});

/**
 * STEP 1: Create Order Endpoint
 * POST /api/create-order
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate minimum amount (100 paise = 1 INR)
    const amountInPaise = Number(amount);
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount must be at least 100 paise (1 INR).',
      });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Invalid Key ID or Secret.' });
    }
    return res.status(500).json({
      error: error.message || 'Failed to create Razorpay order',
    });
  }
});

/**
 * STEP 3: Verify Payment Signature Endpoint
 * POST /api/verify-payment
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Razorpay payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Potential payment tampering detected.',
      });
    }
  } catch (error: any) {
    console.error('Razorpay Signature Verification Error:', error);
    return res.status(500).json({ error: 'Internal server error verifying signature' });
  }
});

app.listen(PORT, () => {
  console.log(`Razorpay Backend Server running on http://localhost:${PORT}`);
});
