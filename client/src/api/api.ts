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

export const fetchPutwallData = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value.toString());
        }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get(`/putwall/data${queryString}`);
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
            putwallDetails,
            replenishmentSummary,
            unitSortSummary,
            unitSortIssues
        ] = await Promise.all([
            fetchPutwallSummary(),
            fetchPutwallData(),
            fetchReplenishmentSummary(),
            fetchUnitSortSummary(),
            fetchUnitSortIssues()
        ]);

        return {
            putwallSummary,
            putwallDetails,
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