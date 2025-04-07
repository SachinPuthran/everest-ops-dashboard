import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with common configurations
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

// Putwall API endpoints
export const fetchPutwallSummary = async () => {
    const response = await apiClient.get('/putwall/summary');
    return response.data;
};

export const fetchPutwallIssues = async () => {
    const response = await apiClient.get('/putwall/issues');
    return response.data;
};

export const fetchPutwallIssueDetails = async (replen: string) => {
    const response = await apiClient.get(`/putwall/issue-details/${encodeURIComponent(replen)}`);
    return response.data;
};

// Replenishment API endpoints
export const fetchReplenishmentSummary = async () => {
    const response = await apiClient.get('/replenishment/summary');
    return response.data;
};

export const fetchReplenishmentData = async (filters = {}) => {
    const response = await apiClient.get('/replenishment/data', { params: filters });
    return response.data;
};

// UnitSort API endpoints
export const fetchUnitSortSummary = async () => {
    const response = await apiClient.get('/unitsort/summary');
    return response.data;
};

export const fetchUnitSortIssues = async () => {
    const response = await apiClient.get('/unitsort/issues');
    return response.data;
};

// Health check endpoint
export const checkAPIHealth = async () => {
    try {
        const response = await apiClient.get('/health');
        return response.status === 200;
    } catch (error) {
        console.error('API Health Check Failed:', error);
        return false;
    }
};

// Dashboard utilities
export const refreshAllData = async () => {
    try {
        const [
            putwallSummary,
            putwallIssues,
            replenishmentSummary,
            unitSortSummary,
            unitSortIssues
        ] = await Promise.all([
            fetchPutwallSummary(),
            fetchPutwallIssues(),
            fetchReplenishmentSummary(),
            fetchUnitSortSummary(),
            fetchUnitSortIssues()
        ]);

        return {
            putwallSummary,
            putwallIssues,
            replenishmentSummary,
            unitSortSummary,
            unitSortIssues
        };
    } catch (error) {
        console.error('Failed to refresh all data:', error);
        throw error;
    }
};

export default apiClient;