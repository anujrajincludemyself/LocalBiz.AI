import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please provide customer name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    address: {
        street: String,
        area: String,
        city: String,
        pincode: String,
        landmark: String
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    lastOrderDate: Date,
    averageOrderValue: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    segment: {
        type: String,
        enum: ['new', 'regular', 'vip', 'inactive'],
        default: 'new'
    },
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    },
    preferences: {
        language: {
            type: String,
            enum: ['en', 'hi'],
            default: 'en'
        },
        marketingConsent: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Compound index for shopId + phone uniqueness
customerSchema.index({ shopId: 1, phone: 1 }, { unique: true });
customerSchema.index({ shopId: 1, segment: 1 });
customerSchema.index({ shopId: 1, name: 'text' }); // Text search

// Update customer segment based on spending
customerSchema.methods.updateSegment = function () {
    if (this.totalOrders === 0) {
        this.segment = 'new';
    } else if (this.totalOrders >= 10 || this.totalSpent >= 10000) {
        this.segment = 'vip';
    } else if (this.totalOrders >= 3) {
        this.segment = 'regular';
    } else {
        // Check if inactive (no order in last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        if (this.lastOrderDate && this.lastOrderDate < ninetyDaysAgo) {
            this.segment = 'inactive';
        }
    }
};

// Calculate average order value
customerSchema.methods.calculateAverageOrderValue = function () {
    if (this.totalOrders > 0) {
        this.averageOrderValue = Math.round(this.totalSpent / this.totalOrders);
    } else {
        this.averageOrderValue = 0;
    }
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
