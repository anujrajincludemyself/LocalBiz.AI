import api from './api';

export const customerApi = {
    // Get all customers with optional filters
    getCustomers: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.segment) queryParams.append('segment', params.segment);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return api.get(url);
    },

    // Get single customer with order history
    getCustomer: async (id) => {
        return api.get(`/customers/${id}`);
    },

    // Create new customer
    createCustomer: async (data) => {
        return api.post('/customers', data);
    },

    // Update customer
    updateCustomer: async (id, data) => {
        return api.put(`/customers/${id}`, data);
    }
};

export default customerApi;
