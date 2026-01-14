import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import { protect } from '../middleware/auth.js';
import { getDateRange, calculatePercentageChange } from '../utils/helpers.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        const shopId = req.user.shopId;

        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: 'No shop found'
            });
        }

        // Today's stats
        const { startDate: todayStart, endDate: todayEnd } = getDateRange('today');
        const { startDate: weekStart } = getDateRange('week');
        const { startDate: monthStart } = getDateRange('month');

        // Yesterday for comparison
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayEnd);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

        // Today's orders
        const todayOrders = await Order.find({
            shopId,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        const todaySales = todayOrders.reduce((sum, order) => sum + order.finalTotal, 0);
        const todayOrderCount = todayOrders.length;

        // Yesterday's stats for comparison
        const yesterdayOrders = await Order.find({
            shopId,
            createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
        });

        const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + order.finalTotal, 0);

        // Week's stats
        const weekOrders = await Order.find({
            shopId,
            createdAt: { $gte: weekStart }
        });

        const weekSales = weekOrders.reduce((sum, order) => sum + order.finalTotal, 0);

        // Month's stats
        const monthOrders = await Order.find({
            shopId,
            createdAt: { $gte: monthStart }
        });

        const monthSales = monthOrders.reduce((sum, order) => sum + order.finalTotal, 0);

        // Top selling products
        const topProducts = await Product.aggregate([
            { $match: { shopId: shopId, isActive: true } },
            { $sort: { 'stats.totalSold': -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    totalSold: '$stats.totalSold',
                    revenue: '$stats.revenue',
                    stock: 1,
                    price: 1,
                    unit: 1
                }
            }
        ]);

        // Low stock products
        const lowStockProducts = await Product.find({
            shopId,
            isActive: true,
            stock: { $lte: 10 }
        })
            .select('name stock unit price')
            .sort({ stock: 1 })
            .limit(10);

        // Recent orders
        const recentOrders = await Order.find({ shopId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('orderNumber customer status finalTotal createdAt paymentStatus');

        // Customer stats
        const totalCustomers = await Customer.countDocuments({ shopId, isActive: true });
        const vipCustomers = await Customer.countDocuments({ shopId, segment: 'vip' });

        // Pending orders
        const pendingOrders = await Order.countDocuments({
            shopId,
            status: { $in: ['pending', 'confirmed', 'processing'] }
        });

        // Total products
        const totalProducts = await Product.countDocuments({ shopId, isActive: true });

        res.json({
            success: true,
            analytics: {
                today: {
                    sales: todaySales,
                    orders: todayOrderCount,
                    salesChange: calculatePercentageChange(todaySales, yesterdaySales)
                },
                week: {
                    sales: weekSales,
                    orders: weekOrders.length
                },
                month: {
                    sales: monthSales,
                    orders: monthOrders.length
                },
                topProducts,
                lowStockProducts,
                recentOrders,
                totals: {
                    customers: totalCustomers,
                    vipCustomers,
                    products: totalProducts,
                    pendingOrders
                }
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

// @route   GET /api/analytics/sales-trends
// @desc    Get sales trends for charts
// @access  Private
router.get('/sales-trends', protect, async (req, res) => {
    try {
        const { period = 'week' } = req.query; // week, month, year
        const shopId = req.user.shopId;

        let groupBy, daysBack;

        switch (period) {
            case 'week':
                groupBy = { $dayOfWeek: '$createdAt' };
                daysBack = 7;
                break;
            case 'month':
                groupBy = { $dayOfMonth: '$createdAt' };
                daysBack = 30;
                break;
            case 'year':
                groupBy = { $month: '$createdAt' };
                daysBack = 365;
                break;
            default:
                groupBy = { $dayOfWeek: '$createdAt' };
                daysBack = 7;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const salesTrends = await Order.aggregate([
            {
                $match: {
                    shopId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: '$finalTotal' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            salesTrends
        });
    } catch (error) {
        console.error('Sales trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales trends'
        });
    }
});

export default router;
