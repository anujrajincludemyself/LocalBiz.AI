import api from './api';

export const orderApi = {
    // Get all orders with optional filters
    getOrders: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
        if (params.search) queryParams.append('search', params.search);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return api.get(url);
    },

    // Get single order
    getOrder: async (id) => {
        return api.get(`/orders/${id}`);
    },

    // Create new order
    createOrder: async (data) => {
        return api.post('/orders', data);
    },

    // Update order status
    updateOrderStatus: async (id, status) => {
        return api.put(`/orders/${id}/status`, { status });
    },

    // Send WhatsApp notification
    sendWhatsApp: async (id) => {
        return api.post(`/orders/${id}/send-whatsapp`);
    }
};

export default orderApi;
