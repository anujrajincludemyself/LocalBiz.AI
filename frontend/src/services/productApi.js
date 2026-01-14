import api from './api';

export const productApi = {
    // Get all products with optional filters
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return api.get(url);
    },

    // Get single product
    getProduct: async (id) => {
        return api.get(`/products/${id}`);
    },

    // Create new product
    createProduct: async (data) => {
        return api.post('/products', data);
    },

    // Update product
    updateProduct: async (id, data) => {
        return api.put(`/products/${id}`, data);
    },

    // Delete product
    deleteProduct: async (id) => {
        return api.delete(`/products/${id}`);
    },

    // Get low stock products
    getLowStock: async () => {
        return api.get('/products/alerts/low-stock');
    }
};

export default productApi;
