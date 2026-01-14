import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    unit: {
        type: String,
        enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'meter', 'dozen', 'box', 'packet', 'other'],
        default: 'piece'
    },
    category: {
        type: String,
        trim: true,
        default: 'general'
    },
    image: {
        type: String,
        default: null
    },
    sku: {
        type: String,
        trim: true,
        sparse: true // Allow null values but enforce uniqueness when present
    },
    barcode: {
        type: String,
        trim: true,
        sparse: true
    },
    costPrice: {
        type: Number,
        min: [0, 'Cost price cannot be negative'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    stats: {
        totalSold: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        views: { type: Number, default: 0 }
    },
    lastRestocked: Date
}, {
    timestamps: true
});

// Indexes for efficient queries
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, isActive: 1 });
productSchema.index({ shopId: 1, name: 'text' }); // Text search on name

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
    if (this.costPrice > 0) {
        return ((this.price - this.costPrice) / this.costPrice * 100).toFixed(2);
    }
    return 0;
});

// Method to check if stock is low
productSchema.methods.isLowStock = function (threshold = 10) {
    return this.stock <= threshold;
};

// Method to update stock
productSchema.methods.updateStock = function (quantity, operation = 'subtract') {
    if (operation === 'subtract') {
        this.stock = Math.max(0, this.stock - quantity);
    } else if (operation === 'add') {
        this.stock += quantity;
        this.lastRestocked = new Date();
    }
};

const Product = mongoose.model('Product', productSchema);

export default Product;
