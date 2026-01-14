import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    validate
];

// Login validation
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Shop creation validation
export const shopValidation = [
    body('shopName')
        .trim()
        .notEmpty().withMessage('Shop name is required')
        .isLength({ max: 100 }).withMessage('Shop name cannot exceed 100 characters'),
    body('category')
        .optional()
        .isIn(['kirana', 'salon', 'tailor', 'tiffin', 'tuition', 'repair', 'medical', 'bakery', 'other'])
        .withMessage('Invalid category'),
    body('whatsapp')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit WhatsApp number'),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    validate
];

// Product validation
export const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative number'),
    body('unit')
        .optional()
        .isIn(['piece', 'kg', 'gram', 'liter', 'ml', 'meter', 'dozen', 'box', 'packet', 'other'])
        .withMessage('Invalid unit'),
    validate
];

// Order validation
export const orderValidation = [
    body('customer.name')
        .trim()
        .notEmpty().withMessage('Customer name is required'),
    body('customer.phone')
        .trim()
        .notEmpty().withMessage('Customer phone is required')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('items')
        .isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId')
        .notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('total')
        .isFloat({ min: 0 }).withMessage('Total must be a positive number'),
    validate
];

// Customer validation
export const customerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Customer name is required'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    validate
];

// WhatsApp message validation
export const messageValidation = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters'),
    validate
];

// Campaign validation
export const campaignValidation = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters'),
    body('recipients')
        .isArray({ min: 1 }).withMessage('At least one recipient is required'),
    validate
];

// AI query validation
export const aiQueryValidation = [
    body('query')
        .trim()
        .notEmpty().withMessage('Query is required')
        .isLength({ max: 500 }).withMessage('Query cannot exceed 500 characters'),
    validate
];

// MongoDB ObjectId validation
export const objectIdValidation = (paramName) => [
    param(paramName)
        .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid ID format'),
    validate
];
