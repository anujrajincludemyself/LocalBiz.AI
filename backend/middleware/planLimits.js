// Middleware to check subscription plan limits
export const checkPlanLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Check if plan has expired
            if (user.plan !== 'free' && user.planExpiry && new Date(user.planExpiry) < new Date()) {
                // Downgrade to free plan
                user.plan = 'free';
                user.updatePlanLimits();
                await user.save();
            }

            const limits = user.planLimits;
            const usage = user.usage;

            let exceeded = false;
            let message = '';

            switch (limitType) {
                case 'orders':
                    if (usage.ordersThisMonth >= limits.maxOrders) {
                        exceeded = true;
                        message = `You have reached your monthly order limit of ${limits.maxOrders}. Please upgrade your plan.`;
                    }
                    break;

                case 'messages':
                    if (usage.messagesThisMonth >= limits.maxMessages) {
                        exceeded = true;
                        message = `You have reached your monthly WhatsApp message limit of ${limits.maxMessages}. Please upgrade your plan.`;
                    }
                    break;

                case 'ai':
                    if (usage.aiQueriesThisMonth >= limits.aiQueries) {
                        exceeded = true;
                        message = `You have reached your monthly AI query limit of ${limits.aiQueries}. Please upgrade your plan.`;
                    }
                    break;

                default:
                    break;
            }

            if (exceeded) {
                return res.status(403).json({
                    success: false,
                    message,
                    limitExceeded: true,
                    currentPlan: user.plan,
                    usage: {
                        current: usage[`${limitType}ThisMonth`],
                        limit: limits[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`]
                    }
                });
            }

            next();
        } catch (error) {
            console.error('Plan limit check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking plan limits'
            });
        }
    };
};

// Increment usage count
export const incrementUsage = async (userId, usageType) => {
    try {
        const User = (await import('../models/User.js')).default;

        const updateField = {};
        updateField[`usage.${usageType}ThisMonth`] = 1;

        await User.findByIdAndUpdate(userId, {
            $inc: updateField
        });
    } catch (error) {
        console.error('Error incrementing usage:', error);
    }
};
