import express from 'express';
import Shop from '../models/Shop.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { shopValidation } from '../utils/validators.js';

const router = express.Router();

// @route   POST /api/shop
// @desc    Create new shop
// @access  Private
router.post('/', protect, shopValidation, async (req, res) => {
    try {
        const { shopName, category, whatsapp, email, address, description } = req.body;

        // Check if user already has a shop
        if (req.user.shopId) {
            return res.status(400).json({
                success: false,
                message: 'You already have a shop. Please edit existing shop.'
            });
        }

        // Create shop
        const shop = await Shop.create({
            shopName,
            owner: req.user._id,
            category,
            whatsapp,
            email,
            address,
            description
        });

        // Update user with shop ID
        req.user.shopId = shop._id;
        await req.user.save();

        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            shop
        });
    } catch (error) {
        console.error('Shop creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating shop'
        });
    }
});

// @route   GET /api/shop
// @desc    Get user's shop
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        if (!req.user.shopId) {
            return res.status(404).json({
                success: false,
                message: 'No shop found. Please create a shop first.'
            });
        }

        const shop = await Shop.findById(req.user.shopId);

        res.json({
            success: true,
            shop
        });
    } catch (error) {
        console.error('Get shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shop'
        });
    }
});

// @route   PUT /api/shop
// @desc    Update shop
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        if (!req.user.shopId) {
            return res.status(404).json({
                success: false,
                message: 'No shop found'
            });
        }

        const shop = await Shop.findByIdAndUpdate(
            req.user.shopId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Shop updated successfully',
            shop
        });
    } catch (error) {
        console.error('Shop update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating shop'
        });
    }
});

// @route   GET /api/shop/public/:slug
// @desc    Get shop by public slug
// @access  Public
router.get('/public/:slug', async (req, res) => {
    try {
        const shop = await Shop.findOne({ publicSlug: req.params.slug, isActive: true })
            .select('-owner -settings -stats');

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.json({
            success: true,
            shop
        });
    } catch (error) {
        console.error('Get public shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shop'
        });
    }
});

export default router;
