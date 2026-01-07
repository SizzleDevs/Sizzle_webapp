// API Configuration
const API_BASE_URL = 'https://sizzle-backend-9mad.onrender.com:5000';

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

// Export for use in other files
window.API = API;
window.API_BASE_URL = API_BASE_URL;
