// Complete Configuration for Shifa Parapharmacie - Production API

// FORCE PRODUCTION MODE - Always use Render API
const API_CONFIG = {
    // PRODUCTION API URL - DO NOT CHANGE
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
            PROFILE: '/auth/profile'
        },
        PRODUCTS: {
            LIST: '/products',
            DETAIL: '/products/',
            CATEGORIES: '/products/categories/all',
            FEATURED: '/products/featured/all',
            PROMOTIONS: '/products/promotions/all'
        },
        ORDERS: {
            CREATE: '/orders',
            DETAIL: '/orders/',
            USER_ORDERS: '/orders/user/all'
        },
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            PRODUCTS: '/admin/products',
            ORDERS: '/admin/orders'
        },
        HEALTH: '/health'
    }
};

// Helper function to build API URLs
function buildApiUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = API_CONFIG.BASE_URL + cleanEndpoint;
    console.log(`🌐 Building API URL: ${url}`);
    return url;
}

// Enhanced API call function with better error handling
async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
        console.log('🔑 Token added to request');
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    console.log(`📤 API Request: ${finalOptions.method} ${url}`);
    if (finalOptions.body) {
        try {
            const bodyData = JSON.parse(finalOptions.body);
            console.log('📦 Request body:', bodyData);
        } catch (e) {
            console.log('📦 Request body (raw):', finalOptions.body);
        }
    }
    
    // Retry logic for Render cold starts and network issues
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('⏱️ Request timeout, aborting...');
                controller.abort();
            }, API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📡 Response received: ${response.status} ${response.statusText}`);
            
            // Handle response
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('📥 Response data:', data);
            } else {
                const text = await response.text();
                console.log('📄 Response text:', text);
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text || 'Empty response' };
                }
            }
            
            // Handle HTTP errors
            if (!response.ok) {
                console.error(`❌ HTTP Error ${response.status}:`, data);
                
                // For 401 Unauthorized, clear token
                if (response.status === 401) {
                    console.log('🚪 Unauthorized - clearing token');
                    localStorage.removeItem('token');
                    throw new Error(data.message || 'Session expirée. Veuillez vous reconnecter.');
                }
                
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(data.message || `Erreur: ${response.status}`);
                }
                
                // Retry on server errors (5xx) if we have attempts left
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Server error, retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                }
                
                throw new Error(data.message || `Erreur serveur: ${response.status}`);
            }
            
            console.log('✅ API call successful');
            return data;
            
        } catch (error) {
            console.error(`💥 Error on attempt ${attempt}:`, error);
            
            // Handle abort/timeout
            if (error.name === 'AbortError') {
                console.log('⏱️ Request timed out');
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Le serveur met trop de temps à répondre. Veuillez réessayer.');
                }
            }
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('🌐 Network error detected');
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
                }
            }
            
            // If this is the last attempt, throw the error
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
            // Otherwise, retry after delay
            console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        }
    }
}

// Test backend connection
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

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;

console.log('✅ Config loaded - Backend URL:', API_CONFIG.BASE_URL);
console.log('🚀 Using PRODUCTION API on Render');
