import axios from 'axios';

class AIService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }

    // Check if AI is configured
    isConfigured() {
        return !!this.apiKey;
    }

    // Get business insights
    async getBusinessInsights(query, shopData, analyticsData) {
        if (!this.isConfigured()) {
            return {
                success: false,
                message: 'AI service is not configured. Please add your Groq API key.'
            };
        }

        try {
            const systemPrompt = `You are a helpful business advisor for small shops in India. 
The shop owner speaks simple Hindi/English. Give practical, actionable advice.
Keep responses concise (3-4 sentences) and friendly.
Use emojis occasionally to make it engaging.
Include specific numbers and data points when available.`;

            const contextPrompt = `Shop Information:
- Name: ${shopData.shopName}
- Category: ${shopData.category}
- Total Products: ${analyticsData.totalProducts || 0}
- Total Orders: ${analyticsData.totalOrders || 0}
- Total Revenue: ₹${analyticsData.totalRevenue || 0}

Recent Performance:
- Today's Sales: ₹${analyticsData.todaySales || 0}
- This Week's Sales: ₹${analyticsData.weekSales || 0}
- This Month's Sales: ₹${analyticsData.monthSales || 0}
${analyticsData.topProducts ? `\nTop Selling Products:\n${analyticsData.topProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.totalSold} sold`).join('\n')}` : ''}
${analyticsData.lowStockProducts ? `\nLow Stock Products:\n${analyticsData.lowStockProducts.map(p => `- ${p.name}: ${p.stock} ${p.unit}`).join('\n')}` : ''}

User Question: ${query}`;

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: contextPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiResponse = response.data.choices[0].message.content;

            return {
                success: true,
                response: aiResponse,
                usage: response.data.usage
            };
        } catch (error) {
            console.error('AI Service error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.error?.message || 'AI service error. Please try again.',
                error: error.message
            };
        }
    }

    // Get product recommendations
    async getProductRecommendations(shopData, salesData) {
        if (!this.isConfigured()) {
            return { success: false, message: 'AI not configured' };
        }

        const query = 'Based on my sales data, which products should I stock more and which should I reduce?';
        return this.getBusinessInsights(query, shopData, salesData);
    }

    // Get marketing suggestions
    async getMarketingSuggestions(shopData, analyticsData) {
        if (!this.isConfigured()) {
            return { success: false, message: 'AI not configured' };
        }

        const query = 'What marketing offers or discounts should I run this week to increase sales?';
        return this.getBusinessInsights(query, shopData, analyticsData);
    }

    // Analyze sales trends
    async analyzeSalesTrends(shopData, salesHistory) {
        if (!this.isConfigured()) {
            return { success: false, message: 'AI not configured' };
        }

        const analyticsData = {
            ...salesHistory,
            trend: salesHistory.weekSales > salesHistory.lastWeekSales ? 'increasing' : 'decreasing'
        };

        const query = `My sales are ${analyticsData.trend}. Why is this happening and what should I do?`;
        return this.getBusinessInsights(query, shopData, analyticsData);
    }

    // Generate campaign message
    async generateCampaignMessage(context) {
        if (!this.isConfigured()) {
            return { success: false, message: 'AI not configured' };
        }

        try {
            const prompt = `Generate a short WhatsApp marketing message (max 100 characters) in Hindi/English mix for a ${context.shopCategory} shop. 
Context: ${context.occasion || 'general promotion'}
Offer: ${context.offer || 'special discount'}
Keep it friendly and include 1-2 emojis.`;

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.8,
                    max_tokens: 150
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: response.data.choices[0].message.content.trim()
            };
        } catch (error) {
            console.error('Campaign generation error:', error);
            return { success: false, message: 'Error generating campaign' };
        }
    }

    // Get suggested questions for the user
    getSuggestedQuestions(shopCategory) {
        const commonQuestions = [
            '💰 आज की sales कैसी है?',
            '📦 Which is my best selling product?',
            '📊 क्या मुझे कोई offer देना चाहिए?',
            '⚠️ Low stock वाले products कौन से हैं?',
            '👥 मेरे top customers कौन हैं?'
        ];

        const categorySpecific = {
            kirana: ['🛒 Grocery items में सबसे ज्यादा क्या बिकता है?'],
            salon: ['💇 Which service is most popular?'],
            tailor: ['👔 Peak season में क्या करूं?'],
            tiffin: ['🍱 Daily vs weekend orders का comparison?'],
            tuition: ['📚 Student retention कैसे बढ़ाएं?']
        };

        return [
            ...commonQuestions,
            ...(categorySpecific[shopCategory] || [])
        ];
    }
}

export default new AIService();
