import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.from = process.env.EMAIL_USER;
        this.initialize();
    }

    initialize() {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    isConfigured() {
        return !!this.transporter;
    }

    async sendWelcomeEmail(to, name) {
        if (!this.isConfigured()) {
            console.warn('Email service not configured');
            return { success: false };
        }

        try {
            const mailOptions = {
                from: `LocalBiz AI <${this.from}>`,
                to,
                subject: 'Welcome to LocalBiz AI! 🎉',
                html: `
          <h2>Welcome to LocalBiz AI, ${name}!</h2>
          <p>Thank you for joining LocalBiz AI - your digital business assistant.</p>
          <p>You can now:</p>
          <ul>
            <li>📦 Manage products and inventory</li>
            <li>🛒 Track orders and customers</li>
            <li>📱 Send WhatsApp messages automatically</li>
            <li>🤖 Get AI-powered business insights</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
          <p>Need help? Reply to this email anytime.</p>
          <br>
          <p>Best regards,<br>LocalBiz AI Team</p>
        `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordReset(to, resetToken) {
        if (!this.isConfigured()) return { success: false };

        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            const mailOptions = {
                from: `LocalBiz AI <${this.from}>`,
                to,
                subject: 'Password Reset Request',
                html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false };
        }
    }

    async sendPaymentConfirmation(to, paymentData) {
        if (!this.isConfigured()) return { success: false };

        try {
            const mailOptions = {
                from: `LocalBiz AI <${this.from}>`,
                to,
                subject: 'Payment Successful - Subscription Activated',
                html: `
          <h2>Payment Successful! 🎉</h2>
          <p>Your ${paymentData.plan} plan subscription has been activated.</p>
          <p><strong>Amount Paid:</strong> ₹${paymentData.amount}</p>
          <p><strong>Valid Until:</strong> ${new Date(paymentData.validUntil).toLocaleDateString()}</p>
          <p>Thank you for upgrading! Enjoy all premium features.</p>
          <p><a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a></p>
        `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false };
        }
    }
}

export default new EmailService();
