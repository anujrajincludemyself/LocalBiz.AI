import express from 'express';
import Message from '../models/Message.js';
import Customer from '../models/Customer.js';
import { protect } from '../middleware/auth.js';
import { checkPlanLimit, incrementUsage } from '../middleware/planLimits.js';
import { messageValidation, campaignValidation } from '../utils/validators.js';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

// @route   POST /api/whatsapp/send
// @desc    Send single WhatsApp message
// @access  Private
router.post('/send', protect, checkPlanLimit('messages'), messageValidation, async (req, res) => {
    try {
        const { phone, message } = req.body;

        const result = await whatsappService.sendMessage(phone, message);

        if (result.success) {
            await Message.create({
                shopId: req.user.shopId,
                type: 'custom',
                recipient: { phone },
                message,
                status: 'sent',
                whatsappMessageId: result.messageId,
                sentAt: new Date()
            });

            await incrementUsage(req.user._id, 'messages');
        }

        res.json({
            success: result.success,
            message: result.success ? 'Message sent successfully' : 'Failed to send message',
            messageId: result.messageId,
            error: result.error
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// @route   POST /api/whatsapp/campaign
// @desc    Send campaign to multiple customers
// @access  Private
router.post('/campaign', protect, checkPlanLimit('messages'), campaignValidation, async (req, res) => {
    try {
        const { message, recipients, segment } = req.body;

        let targetCustomers = [];

        if (recipients && recipients.length > 0) {
            // Specific recipients
            targetCustomers = recipients;
        } else if (segment) {
            // Send to segment
            const customers = await Customer.find({
                shopId: req.user.shopId,
                segment,
                'preferences.marketingConsent': true,
                isActive: true
            }).select('phone name');

            targetCustomers = customers.map(c => ({ phone: c.phone, name: c.name }));
        }

        if (targetCustomers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipients found'
            });
        }

        // Send messages
        const results = await whatsappService.sendBulkMessages(targetCustomers, message, 1500);

        // Log messages
        const messageRecords = results.map(r => ({
            shopId: req.user.shopId,
            type: 'campaign',
            recipient: { phone: r.phone, name: r.name },
            message,
            status: r.success ? 'sent' : 'failed',
            whatsappMessageId: r.messageId,
            sentAt: r.success ? new Date() : null,
            failureReason: r.error
        }));

        await Message.insertMany(messageRecords);

        // Increment usage by number of successful sends
        const successCount = results.filter(r => r.success).length;
        for (let i = 0; i < successCount; i++) {
            await incrementUsage(req.user._id, 'messages');
        }

        res.json({
            success: true,
            message: `Campaign sent to ${successCount}/${targetCustomers.length} recipients`,
            results: {
                total: targetCustomers.length,
                successful: successCount,
                failed: targetCustomers.length - successCount
            }
        });
    } catch (error) {
        console.error('Campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending campaign'
        });
    }
});

// @route   GET /api/whatsapp/messages
// @desc    Get message history
// @access  Private
router.get('/messages', protect, async (req, res) => {
    try {
        const messages = await Message.find({ shopId: req.user.shopId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

export default router;
