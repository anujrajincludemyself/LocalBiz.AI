import express from 'express';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { protect } from '../middleware/auth.js';
import { productValidation } from '../utils/validators.js';
import { getPagination, buildPaginationResponse } from '../utils/helpers.js';

const router = express.Router();

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', protect, productValidation, async (req, res) => {
    try {
        if (!req.user.shopId) {
            return res.status(400).json({
                success: false,
                message: 'Please create a shop first'
            });
        }

        const product = await Product.create({
            ...req.body,
            shopId: req.user.shopId
        });

        // Update shop stats
        await Shop.findByIdAndUpdate(req.user.shopId, {
            $inc: { 'stats.totalProducts': 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product'
        });
    }
});

// @route   GET /api/products
// @desc    Get all products
// @access  Private/Public
router.get('/', async (req, res) => {
    try {
        const { shopId, category, isActive, search, page, limit } = req.query;
        const { skip, ...pagination } = getPagination(req.query);

        // Build query
        const query = {};

        if (shopId) {
            query.shopId = shopId;
        } else if (req.user?.shopId) {
            query.shopId = req.user.shopId;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Shop ID required'
            });
        }

        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$text = { $search: search };
        }

        // Get products with pagination
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pagination.limit);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            ...buildPaginationResponse(products, total, pagination.page, pagination.limit)
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment view count
        product.stats.views += 1;
        await product.save();

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            shopId: req.user.shopId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        Object.assign(product, req.body);
        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            shopId: req.user.shopId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update shop stats
        await Shop.findByIdAndUpdate(req.user.shopId, {
            $inc: { 'stats.totalProducts': -1 }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res) => {
    try {
        const shop = await Shop.findById(req.user.shopId);
        const threshold = shop?.settings?.lowStockThreshold || 10;

        const products = await Product.find({
            shopId: req.user.shopId,
            isActive: true,
            stock: { $lte: threshold }
        }).sort({ stock: 1 });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Low stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching low stock products'
        });
    }
});

export default router;
