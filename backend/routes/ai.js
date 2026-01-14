import express from 'express';
import Shop from '../models/Shop.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { checkPlanLimit, incrementUsage } from '../middleware/planLimits.js';
import { aiQueryValidation } from '../utils/validators.js';
import aiService from '../services/aiService.js';
import { getDateRange } from '../utils/helpers.js';

const router = express.Router();

// @route   POST /api/ai/query
// @desc    Ask AI for business insights
// @access  Private
router.post('/query', protect, checkPlanLimit('ai'), aiQueryValidation, async (req, res) => {
    try {
        const { query } = req.body;

        // Get shop data
        const shop = await Shop.findById(req.user.shopId);

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        // Get analytics data
        const { startDate: weekStart } = getDateRange('week');
        const { startDate: monthStart } = getDateRange('month');

        const weekOrders = await Order.find({
            shopId: shop._id,
            createdAt: { $gte: weekStart }
        });

        const monthOrders = await Order.find({
            shopId: shop._id,
            createdAt: { $gte: monthStart }
        });

        const todayOrders = await Order.find({
            shopId: shop._id,
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        // Top products
        const topProducts = await Product.find({
            shopId: shop._id,
            isActive: true
        })
            .sort({ 'stats.totalSold': -1 })
            .limit(5)
            .select('name stats.totalSold stats.revenue stock unit');

        // Low stock products
        const lowStockProducts = await Product.find({
            shopId: shop._id,
            isActive: true,
            stock: { $lte: 10 }
        })
            .select('name stock unit')
            .limit(5);

        const analyticsData = {
            totalProducts: await Product.countDocuments({ shopId: shop._id, isActive: true }),
            totalOrders: shop.stats.totalOrders,
            totalRevenue: shop.stats.totalRevenue,
            todaySales: todayOrders.reduce((sum, o) => sum + o.finalTotal, 0),
            weekSales: weekOrders.reduce((sum, o) => sum + o.finalTotal, 0),
            monthSales: monthOrders.reduce((sum, o) => sum + o.finalTotal, 0),
            topProducts: topProducts.map(p => ({
                name: p.name,
                totalSold: p.stats.totalSold,
                revenue: p.stats.revenue,
                stock: p.stock
            })),
            lowStockProducts: lowStockProducts.map(p => ({
                name: p.name,
                stock: p.stock,
                unit: p.unit
            }))
        };

        const shopData = {
            shopName: shop.shopName,
            category: shop.category
        };

        // Get AI response
        const aiResult = await aiService.getBusinessInsights(query, shopData, analyticsData);

        if (aiResult.success) {
            await incrementUsage(req.user._id, 'ai');
        }

        res.json({
            success: aiResult.success,
            query,
            response: aiResult.response,
            message: aiResult.message
        });
    } catch (error) {
        console.error('AI query error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing AI query'
        });
    }
});

// @route   GET /api/ai/suggestions
// @desc    Get suggested questions
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
    try {
        const shop = await Shop.findById(req.user.shopId);

        const suggestions = aiService.getSuggestedQuestions(shop?.category || 'other');

        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('AI suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions'
        });
    }
});

export default router;
