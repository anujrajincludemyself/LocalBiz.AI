import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: [true, 'Please provide a shop name'],
        trim: true,
        maxlength: [100, 'Shop name cannot exceed 100 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['kirana', 'salon', 'tailor', 'tiffin', 'tuition', 'repair', 'medical', 'bakery', 'other'],
        default: 'other'
    },
    whatsapp: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
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
        state: String,
        pincode: {
            type: String,
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        },
        landmark: String
    },
    publicSlug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    logo: {
        type: String,
        default: null
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        language: {
            type: String,
            enum: ['en', 'hi'],
            default: 'en'
        },
        currency: {
            type: String,
            default: 'INR'
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        autoConfirmOrders: {
            type: Boolean,
            default: false
        },
        lowStockThreshold: {
            type: Number,
            default: 10
        },
        enableWhatsAppNotifications: {
            type: Boolean,
            default: true
        }
    },
    businessHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
    },
    stats: {
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalCustomers: { type: Number, default: 0 },
        totalProducts: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Generate unique slug from shop name
shopSchema.pre('save', async function (next) {
    if (!this.isModified('shopName') && this.publicSlug) {
        return next();
    }

    // Create base slug from shop name
    let slug = this.shopName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Check if slug exists
    let slugExists = await mongoose.model('Shop').findOne({ publicSlug: slug });
    let counter = 1;

    while (slugExists && slugExists._id.toString() !== this._id.toString()) {
        slug = `${slug}-${counter}`;
        slugExists = await mongoose.model('Shop').findOne({ publicSlug: slug });
        counter++;
    }

    this.publicSlug = slug;
    next();
});

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
