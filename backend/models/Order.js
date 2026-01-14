import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null
        },
        address: String
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: String,
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    finalTotal: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'card', 'online', 'other'],
        default: 'cash'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryDate: Date,
    deliveryTime: String,
    notes: String,
    whatsappSent: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['shop', 'public_page', 'whatsapp', 'manual'],
        default: 'manual'
    },
    statusHistory: [{
        status: String,
        timestamp: Date,
        updatedBy: String
    }]
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ shopId: 1, status: 1 });
orderSchema.index({ shopId: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ orderNumber: 1 });

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    // Generate order number: ORD-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Get count of orders today for this shop
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));

    const todayOrderCount = await mongoose.model('Order').countDocuments({
        shopId: this.shopId,
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const orderNum = String(todayOrderCount + 1).padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${orderNum}`;

    next();
});

// Calculate final total before saving
orderSchema.pre('save', function (next) {
    this.finalTotal = this.total - this.discount;
    next();
});

// Method to add status to history
orderSchema.methods.addStatusHistory = function (status, updatedBy = 'system') {
    this.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy
    });
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
