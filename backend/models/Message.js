import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['order_confirmation', 'campaign', 'reminder', 'offer', 'custom'],
        required: true
    },
    recipient: {
        phone: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        name: String,
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        }
    },
    message: {
        type: String,
        required: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    templateName: String,
    templateParams: mongoose.Schema.Types.Mixed,
    status: {
        type: String,
        enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
        default: 'queued'
    },
    whatsappMessageId: String,
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    campaignId: String,
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    failureReason: String,
    retryCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
messageSchema.index({ shopId: 1, status: 1 });
messageSchema.index({ shopId: 1, type: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'recipient.phone': 1 });

// Method to mark as sent
messageSchema.methods.markAsSent = function (whatsappMessageId) {
    this.status = 'sent';
    this.whatsappMessageId = whatsappMessageId;
    this.sentAt = new Date();
};

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function () {
    this.status = 'delivered';
    this.deliveredAt = new Date();
};

// Method to mark as failed
messageSchema.methods.markAsFailed = function (reason) {
    this.status = 'failed';
    this.failureReason = reason;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
