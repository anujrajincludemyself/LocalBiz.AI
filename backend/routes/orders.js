import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Shop from '../models/Shop.js';
import { protect } from '../middleware/auth.js';
import { checkPlanLimit, incrementUsage } from '../middleware/planLimits.js';
import { orderValidation } from '../utils/validators.js';
import { getPagination, buildPaginationResponse } from '../utils/helpers.js';
import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private/Public
router.post('/', orderValidation, checkPlanLimit('orders'), async (req, res) => {
    try {
        const { customer, items, total, discount, deliveryDate, deliveryTime, notes, source, shopId } = req.body;

        const targetShopId = shopId || req.user?.shopId;

        if (!targetShopId) {
            return res.status(400).json({
                success: false,
                message: 'Shop ID required'
            });
        }

        // Calculate subtotals and validate products
        const processedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            processedItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                unit: product.unit,
                subtotal: product.price * item.quantity
            });

            // Update product stock and stats
            product.updateStock(item.quantity, 'subtract');
            product.stats.totalSold += item.quantity;
            product.stats.revenue += product.price * item.quantity;
            await product.save();
        }

        // Find or create customer
        let customerDoc = await Customer.findOne({
            shopId: targetShopId,
            phone: customer.phone
        });

        if (!customerDoc) {
            customerDoc = await Customer.create({
                shopId: targetShopId,
                name: customer.name,
                phone: customer.phone,
                address: customer.address
            });
        }

        // Create order
        const order = await Order.create({
            shopId: targetShopId,
            customer: {
                name: customer.name,
                phone: customer.phone,
                customerId: customerDoc._id,
                address: customer.address
            },
            items: processedItems,
            total,
            discount: discount || 0,
            deliveryDate,
            deliveryTime,
            notes,
            source: source || 'manual'
        });

        // Update customer stats
        customerDoc.totalOrders += 1;
        customerDoc.totalSpent += order.finalTotal;
        customerDoc.lastOrderDate = new Date();
        customerDoc.calculateAverageOrderValue();
        customerDoc.updateSegment();
        await customerDoc.save();

        // Update shop stats
        await Shop.findByIdAndUpdate(targetShopId, {
            $inc: {
                'stats.totalOrders': 1,
                'stats.totalRevenue': order.finalTotal
            }
        });

        // Increment usage if user authenticated
        if (req.user) {
            await incrementUsage(req.user._id, 'orders');
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, paymentStatus, search, startDate, endDate } = req.query;
        const { skip, ...pagination } = getPagination(req.query);

        const query = { shopId: req.user.shopId };

        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (search) query.orderNumber = new RegExp(search, 'i');
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pagination.limit)
            .populate('customer.customerId', 'name segment');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            ...buildPaginationResponse(orders, total, pagination.page, pagination.limit)
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.user.shopId
        }).populate('items.productId customer.customerId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.user.shopId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        order.addStatusHistory(status, req.user.name);
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
});

// @route   POST /api/orders/:id/send-whatsapp
// @desc    Send WhatsApp confirmation
// @access  Private
router.post('/:id/send-whatsapp', protect, checkPlanLimit('messages'), async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.user.shopId
        }).populate('shopId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const shop = order.shopId;
        const messageText = whatsappService.formatOrderConfirmation({
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            total: order.finalTotal,
            deliveryDate: order.deliveryDate,
            shopName: shop.shopName
        });

        const result = await whatsappService.sendMessage(order.customer.phone, messageText);

        if (result.success) {
            order.whatsappSent = true;
            await order.save();

            // Log message
            await Message.create({
                shopId: req.user.shopId,
                type: 'order_confirmation',
                recipient: {
                    phone: order.customer.phone,
                    name: order.customer.name,
                    customerId: order.customer.customerId
                },
                message: messageText,
                status: 'sent',
                whatsappMessageId: result.messageId,
                orderId: order._id,
                sentAt: new Date()
            });

            await incrementUsage(req.user._id, 'messages');
        }

        res.json({
            success: result.success,
            message: result.success ? 'WhatsApp message sent' : 'Failed to send WhatsApp message',
            messageId: result.messageId
        });
    } catch (error) {
        console.error('Send WhatsApp error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending WhatsApp message'
        });
    }
});

export default router;
