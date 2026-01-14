import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// Plan prices
const PLANS = {
    basic: { amount: 19900, name: 'Basic' }, // ₹199
    pro: { amount: 49900, name: 'Pro' },     // ₹499
    enterprise: { amount: 99900, name: 'Enterprise' } // ₹999
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!PLANS[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment service not configured'
            });
        }

        const options = {
            amount: PLANS[plan].amount, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan
            }
        };

        const order = await razorpay.orders.create(options);

        // Create payment record
        await Payment.create({
            userId: req.user._id,
            razorpayOrderId: order.id,
            plan,
            amount: PLANS[plan].amount / 100, // Store in rupees
            receipt: options.receipt,
            status: 'created'
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order'
        });
    }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and update subscription
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Verify signature
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        payment.markAsSuccess(razorpayPaymentId, razorpaySignature);
        await payment.save();

        // Update user subscription
        const user = await User.findById(req.user._id);
        user.plan = payment.plan;
        user.planExpiry = payment.validUntil;
        user.updatePlanLimits();
        await user.save();

        // Send confirmation email
        await emailService.sendPaymentConfirmation(user.email, {
            plan: PLANS[payment.plan].name,
            amount: payment.amount,
            validUntil: payment.validUntil
        });

        res.json({
            success: true,
            message: 'Payment verified successfully',
            plan: payment.plan,
            validUntil: payment.validUntil
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
});

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-razorpaySignature');

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history'
        });
    }
});

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        plans: [
            {
                id: 'free',
                name: 'Free',
                price: 0,
                features: ['20 orders/month', '50 WhatsApp messages', '10 AI queries', 'Basic support']
            },
            {
                id: 'basic',
                name: 'Basic',
                price: 199,
                features: ['100 orders/month', '500 WhatsApp messages', '50 AI queries', 'Email support']
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 499,
                features: ['Unlimited orders', '2000 WhatsApp messages', '200 AI queries', 'Priority support']
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 999,
                features: ['Everything unlimited', 'Custom domain', 'API access', 'Dedicated support']
            }
        ]
    });
});

export default router;
