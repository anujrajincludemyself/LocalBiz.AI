import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    plan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'success', 'failed', 'refunded'],
        default: 'created'
    },
    validFrom: Date,
    validUntil: Date,
    receipt: String,
    failureReason: String,
    refundId: String,
    refundAmount: Number
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Method to mark payment as successful
paymentSchema.methods.markAsSuccess = function (paymentId, signature) {
    this.status = 'success';
    this.razorpayPaymentId = paymentId;
    this.razorpaySignature = signature;

    // Set validity period
    this.validFrom = new Date();

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1); // 1 month validity
    this.validUntil = validUntil;
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function (reason) {
    this.status = 'failed';
    this.failureReason = reason;
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
