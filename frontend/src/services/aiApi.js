import api from './api';

export const aiApi = {
    // Ask AI a business question
    askAI: async (query) => {
        return api.post('/ai/query', { query });
    },

    // Get suggested questions
    getSuggestions: async () => {
        return api.get('/ai/suggestions');
    }
};

export default aiApi;
