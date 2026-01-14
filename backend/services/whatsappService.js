import axios from 'axios';

class WhatsAppService {
    constructor() {
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    }

    // Check if WhatsApp is configured
    isConfigured() {
        return !!(this.phoneNumberId && this.accessToken);
    }

    // Send a text message
    async sendMessage(to, message) {
        if (!this.isConfigured()) {
            console.warn('WhatsApp is not configured. Skipping message send.');
            return { success: false, error: 'WhatsApp not configured' };
        }

        try {
            // Format phone number (add country code if not present)
            const formattedPhone = to.startsWith('91') ? to : '91' + to;

            const response = await axios.post(
                this.apiUrl,
                {
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'text',
                    text: { body: message }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.messages[0].id
            };
        } catch (error) {
            console.error('WhatsApp send error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Send template message (pre-approved templates only)
    async sendTemplate(to, templateName, templateParams = []) {
        if (!this.isConfigured()) {
            console.warn('WhatsApp is not configured. Skipping template send.');
            return { success: false, error: 'WhatsApp not configured' };
        }

        try {
            const formattedPhone = to.startsWith('91') ? to : '91' + to;

            const components = templateParams.length > 0 ? [{
                type: 'body',
                parameters: templateParams.map(param => ({
                    type: 'text',
                    text: param
                }))
            }] : [];

            const response = await axios.post(
                this.apiUrl,
                {
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: 'en' },
                        components
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.messages[0].id
            };
        } catch (error) {
            console.error('WhatsApp template error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Format order confirmation message
    formatOrderConfirmation(orderData) {
        const { orderNumber, customerName, total, deliveryDate, shopName } = orderData;

        let message = `🎉 नमस्ते ${customerName}!\n\n`;
        message += `आपका ऑर्डर #${orderNumber} कन्फर्म हो गया है।\n\n`;
        message += `💰 कुल रकम: ₹${total}\n`;

        if (deliveryDate) {
            const date = new Date(deliveryDate).toLocaleDateString('hi-IN');
            message += `📅 डिलीवरी: ${date}\n`;
        }

        message += `\n${shopName} में खरीदारी के लिए धन्यवाद! 🙏`;

        return message;
    }

    // Format campaign/offer message
    formatOfferMessage(offerData) {
        const { shopName, offerText, validUntil } = offerData;

        let message = `🎁 ${shopName} की तरफ से ऑफर!\n\n`;
        message += `${offerText}\n\n`;

        if (validUntil) {
            const date = new Date(validUntil).toLocaleDateString('hi-IN');
            message += `⏰ अंतिम तारीख: ${date}\n`;
        }

        message += `\nअभी ऑर्डर करें! 🛒`;

        return message;
    }

    // Send bulk messages (with rate limiting)
    async sendBulkMessages(recipients, message, delayMs = 1000) {
        const results = [];

        for (const recipient of recipients) {
            const result = await this.sendMessage(recipient.phone, message);
            results.push({
                ...recipient,
                ...result
            });

            // Delay to avoid rate limiting
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        return results;
    }
}

export default new WhatsAppService();
