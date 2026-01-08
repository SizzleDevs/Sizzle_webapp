// API Configuration
const API_BASE_URL = 'https://sizzle-backend-9mad.onrender.com';

// API Endpoints
const API = {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/api/auth/me`,
    
    RECIPES: `${API_BASE_URL}/api/recepten/`,
    RECIPE_DETAIL: (id) => `${API_BASE_URL}/api/recepten/${id}`,
    RECIPE_ASK: (id) => `${API_BASE_URL}/api/recepten/${id}/ask`,
    RECOMMENDATIONS: `${API_BASE_URL}/api/recepten/aanbevelingen`,
    
    FAVORITES: `${API_BASE_URL}/api/favorieten/`,
    FAVORITE_TOGGLE: (id) => `${API_BASE_URL}/api/favorieten/${id}`
};

// Helper function for making authenticated API requests
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle token expiration
    if (response.status === 401 || response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.msg && (errorData.msg.includes('expired') || errorData.msg.includes('Invalid'))) {
            // Token expired or invalid, clear storage and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('fullname');
            window.location.href = 'login.html';
            throw new Error('Session expired');
        }
    }
    
    // Handle 404 errors - redirect to 404 page
    if (response.status === 404) {
        window.location.href = '404.html';
        throw new Error('Resource not found');
    }
    
    return response;
}

// Helper to check if the API is reachable
async function checkApiHealth() {
    try {
        const response = await fetch(API_BASE_URL, { method: 'GET' });
        return response.ok;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

// Export for use in other files
window.API = API;
window.API_BASE_URL = API_BASE_URL;
window.apiRequest = apiRequest;
window.checkApiHealth = checkApiHealth;
