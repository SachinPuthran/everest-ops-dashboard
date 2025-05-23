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
export const fetchPutwallCubbies = async () => {
    const response = await apiClient.get('/putwall/cubbies');
    return response.data;
};

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
export const fetchReplenishmentSummaryByPriority = async () => {
    const response = await apiClient.get('/replenishment/summaryByPriority');
    return response.data;
};

export const fetchReplenishmentSummary = async () => {
    const response = await apiClient.get('/replenishment/summary');
    return response.data;
};

export const fetchReplenishmentData = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value.toString());
        }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get(`/replenishment/data${queryString}`);
    return response.data;
};

// UnitSort API endpoints
export const fetchUnitSortSummary = async () => {
    const response = await apiClient.get('/unitsort/summary');
    return response.data;
};

export const fetchUnitSortData = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value.toString());
        }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get(`/unitsort/data${queryString}`);
    return response.data;
};

export const fetchContainerDetails = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value.toString());
        }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get(`/container${queryString}`);
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
            unitSortData,
            containerDetails
        ] = await Promise.all([
            fetchPutwallSummary(),
            fetchPutwallData(),
            fetchReplenishmentSummary(),
            fetchUnitSortSummary(),
            fetchUnitSortData(),
            fetchContainerDetails()
        ]);

        return {
            putwallSummary,
            putwallDetails,
            replenishmentSummary,
            unitSortSummary,
            unitSortData,
            containerDetails
        };
    } catch (error) {
        console.error('Failed to refresh all data:', error);
        throw error;
    }
};

export default apiClient;