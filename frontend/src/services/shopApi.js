import api from './api';

export const shopApi = {
    // Get authenticated user's shop
    getShop: async () => {
        return api.get('/shop');
    },

    // Create new shop
    createShop: async (data) => {
        return api.post('/shop', data);
    },

    // Update shop
    updateShop: async (data) => {
        return api.put('/shop', data);
    },

    // Get public shop by slug (no auth required)
    getPublicShop: async (slug) => {
        // For public endpoint, bypass auth interceptor
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shop/public/${slug}`);
        if (!response.ok) {
            throw new Error('Shop not found');
        }
        return response.json();
    }
};

export default shopApi;
