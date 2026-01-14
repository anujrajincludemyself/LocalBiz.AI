import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free'
    },
    planExpiry: {
        type: Date,
        default: null
    },
    planLimits: {
        maxOrders: { type: Number, default: 20 },
        maxMessages: { type: Number, default: 50 },
        maxProducts: { type: Number, default: 50 },
        maxCustomers: { type: Number, default: 100 },
        aiQueries: { type: Number, default: 10 }
    },
    usage: {
        ordersThisMonth: { type: Number, default: 0 },
        messagesThisMonth: { type: Number, default: 0 },
        aiQueriesThisMonth: { type: Number, default: 0 }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update plan limits based on subscription
userSchema.methods.updatePlanLimits = function () {
    const limits = {
        free: {
            maxOrders: 20,
            maxMessages: 50,
            maxProducts: 50,
            maxCustomers: 100,
            aiQueries: 10
        },
        basic: {
            maxOrders: 100,
            maxMessages: 500,
            maxProducts: 200,
            maxCustomers: 500,
            aiQueries: 50
        },
        pro: {
            maxOrders: 999999,
            maxMessages: 2000,
            maxProducts: 999999,
            maxCustomers: 999999,
            aiQueries: 200
        },
        enterprise: {
            maxOrders: 999999,
            maxMessages: 999999,
            maxProducts: 999999,
            maxCustomers: 999999,
            aiQueries: 999999
        }
    };

    this.planLimits = limits[this.plan] || limits.free;
};

// Reset monthly usage (run via cron job)
userSchema.methods.resetMonthlyUsage = function () {
    this.usage = {
        ordersThisMonth: 0,
        messagesThisMonth: 0,
        aiQueriesThisMonth: 0
    };
};

const User = mongoose.model('User', userSchema);

export default User;
