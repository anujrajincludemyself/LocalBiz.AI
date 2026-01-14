import express from 'express';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';
import { customerValidation } from '../utils/validators.js';
import { getPagination, buildPaginationResponse } from '../utils/helpers.js';

const router = express.Router();

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { segment, search } = req.query;
        const { skip, ...pagination } = getPagination(req.query);

        const query = { shopId: req.user.shopId, isActive: true };

        if (segment) query.segment = segment;
        if (search) query.$text = { $search: search };

        const customers = await Customer.find(query)
            .sort({ totalSpent: -1 })
            .skip(skip)
            .limit(pagination.limit);

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            ...buildPaginationResponse(customers, total, pagination.page, pagination.limit)
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers'
        });
    }
});

// @route   GET /api/customers/:id
// @desc    Get customer with order history
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOne({
            _id: req.params.id,
            shopId: req.user.shopId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const orders = await Order.find({
            'customer.customerId': customer._id
        }).sort({ createdAt: -1 }).limit(10);

        res.json({
            success: true,
            customer,
            orders
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer'
        });
    }
});

// @route   POST /api/customers
// @desc    Add customer manually
// @access  Private
router.post('/', protect, customerValidation, async (req, res) => {
    try {
        const existing = await Customer.findOne({
            shopId: req.user.shopId,
            phone: req.body.phone
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }

        const customer = await Customer.create({
            ...req.body,
            shopId: req.user.shopId
        });

        res.status(201).json({
            success: true,
            message: 'Customer added successfully',
            customer
        });
    } catch (error) {
        console.error('Add customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding customer'
        });
    }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, shopId: req.user.shopId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer updated successfully',
            customer
        });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer'
        });
    }
});

export default router;
