const Razorpay = require('razorpay');
const crypto = require('crypto');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
let isRealConfigured = false;

if (key_id && key_secret && key_id.startsWith('rzp_')) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    isRealConfigured = true;
    console.log(`[PAYMENT-INIT] Razorpay client initialized in ${key_id.startsWith('rzp_test_') ? 'TEST' : 'LIVE'} mode.`);
  } catch (err) {
    console.error(`[PAYMENT-INIT-ERROR] Failed to initialize Razorpay SDK:`, err.message);
  }
} else {
  console.log(`[PAYMENT-INIT] Real Razorpay credentials not detected. Initializing sandbox simulation client for testing.`);
  // Simulated fallback provider with matching Razorpay SDK interface
  razorpayInstance = {
    orders: {
      create: async (options) => {
        const orderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          id: orderId,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };
      },
      fetch: async (orderId) => {
        return {
          id: orderId,
          entity: 'order',
          status: 'created',
        };
      },
    },
    payments: {
      fetch: async (paymentId) => {
        return {
          id: paymentId,
          entity: 'payment',
          status: 'captured',
          amount: 50000,
          currency: 'INR',
        };
      },
    },
  };
}

/**
 * Verifies Razorpay payment signature
 * crypto.createHmac('sha256', secret).update(order_id + "|" + razorpay_payment_id).digest('hex')
 */
const verifyPaymentSignature = ({ order_id, razorpay_payment_id, razorpay_signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'simulated_secret_key';

  if (!isRealConfigured) {
    // In simulated sandbox mode, verify signature against the fallback secret or simulate valid signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Also accept test simulation signature if frontend generated it with the simulation key
    return (
      razorpay_signature === expectedSignature ||
      razorpay_signature === `sig_sim_${order_id}_${razorpay_payment_id}` ||
      razorpay_signature === 'simulated_valid_signature'
    );
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
};

/**
 * Verifies Razorpay Webhook signature
 */
const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

const getPaymentConfigStatus = () => ({
  isRealConfigured,
  keyId: isRealConfigured ? key_id : 'rzp_test_SIMULATED_KEY',
  mode: isRealConfigured
    ? key_id.startsWith('rzp_test_')
      ? 'Razorpay Test Sandbox'
      : 'Razorpay Live Production'
    : 'Simulated Sandbox (Awaiting Real Keys)',
});

module.exports = {
  razorpay: razorpayInstance,
  isRealConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentConfigStatus,
};
