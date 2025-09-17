// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    // Backend URL configuration
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Request configuration
    TIMEOUT: 30000, // 30 seconds for Render cold starts
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    
    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            PROFILE: '/auth/profile',
            VERIFY_TOKEN: '/auth/verify-token'
        },
        PRODUCTS: {
            LIST: '/products',
            DETAIL: '/products/',
            CREATE: '/products',
            UPDATE: '/products/',
            DELETE: '/products/',
            CATEGORIES: '/products/categories/all',
            FEATURED: '/products/featured/all',
            PROMOTIONS: '/products/promotions/all'
        },
        ORDERS: {
            CREATE: '/orders',
            DETAIL: '/orders/',
            UPDATE: '/orders/',
            USER_ORDERS: '/orders/user/all',
            ADMIN_ORDERS: '/admin/orders'
        },
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            PRODUCTS: '/admin/products',
            ORDERS: '/admin/orders',
            USERS: '/admin/users'
        },
        HEALTH: '/health'
    }
};

// Helper function to build API URLs
function buildApiUrl(endpoint) {
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log(`🌐 API URL: ${url}`);
    return url;
}

// Enhanced API call function with proper error handling
async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors'
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    // Retry logic for Render cold starts
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            console.log(`🔄 API Call Attempt ${attempt}: ${finalOptions.method} ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📡 Response: ${response.status}`);
            
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text || 'Empty response' };
                }
            }
            
            if (!response.ok) {
                console.error(`❌ HTTP Error ${response.status}:`, data);
                
                // Handle different error types
                if (response.status === 401) {
                    // Unauthorized - token expired or invalid
                    localStorage.removeItem('token');
                    if (window.authSystem) {
                        window.authSystem.logout();
                    }
                    throw new Error(data.message || 'Session expirée. Veuillez vous reconnecter.');
                } else if (response.status === 403) {
                    // Forbidden
                    throw new Error(data.message || 'Accès non autorisé');
                } else if (response.status === 404) {
                    // Not Found
                    throw new Error(data.message || 'Ressource non trouvée');
                } else if (response.status === 422) {
                    // Validation Error
                    throw new Error(data.message || 'Données invalides');
                }
                
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(data.message || `Erreur client: ${response.status}`);
                }
                
                // Retry on server errors (5xx) if we have attempts left
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Server error, retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                }
                
                throw new Error(data.message || `Erreur serveur: ${response.status}`);
            }
            
            console.log('✅ API Success');
            return data;
            
        } catch (error) {
            console.error(`💥 API Call Error (Attempt ${attempt}):`, error.message);
            
            if (error.name === 'AbortError') {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`⏱️ Timeout - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Le serveur met trop de temps à répondre. Réessayez plus tard.');
                }
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🌐 Network error - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            
            // If this was the last attempt, throw the error
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
            console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        }
    }
}

// Test backend connection with better error handling
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await apiCall('/health');
        console.log('✅ Backend connection successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Validate authentication status
async function validateAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        return { valid: false, message: 'No token found' };
    }
    
    try {
        const response = await apiCall('/auth/verify-token', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
        
        if (response.valid) {
            return { valid: true, user: response.user };
        } else {
            localStorage.removeItem('token');
            return { valid: false, message: response.message };
        }
    } catch (error) {
        localStorage.removeItem('token');
        return { valid: false, message: error.message };
    }
}

// Initialize connection and auth check on load
document.addEventListener('DOMContentLoaded', async () => {
    // Test backend connection
    const connectionTest = await testBackendConnection();
    
    if (connectionTest.success) {
        console.log('✅ Backend is available');
    } else {
        console.warn('⚠️ Backend connection issues:', connectionTest.error);
        // Show user-friendly message
        if (window.app) {
            window.app.showToast('Connexion au serveur instable. Certaines fonctionnalités peuvent être limitées.', 'warning');
        }
    }
    
    // Validate authentication if token exists
    const token = localStorage.getItem('token');
    if (token) {
        const authStatus = await validateAuthStatus();
        if (!authStatus.valid) {
            console.log('Token is invalid, removing...');
            if (window.authSystem) {
                window.authSystem.logout();
            }
        }
    }
});

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.validateAuthStatus = validateAuthStatus;

console.log('✅ Fixed Config loaded - Backend URL:', API_CONFIG.BASE_URL);
