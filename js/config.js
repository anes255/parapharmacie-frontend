// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    TIMEOUT: 30000, // 30 seconds for Render cold starts
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    
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
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log(`🌐 API URL: ${url}`);
    return url;
}

// Enhanced API call function with improved error handling
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
    
    // Track if we should clear token (only on last attempt)
    let shouldClearToken = false;
    
    // Retry logic for Render cold starts and network issues
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}: ${finalOptions.method} ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📡 Response received: ${response.status} ${response.statusText}`);
            
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('📥 Response data:', data);
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
                
                // Handle 401 Unauthorized errors - ONLY clear token on final attempt
                if (response.status === 401) {
                    if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                        console.log('🚪 Unauthorized on final attempt - will clear token after error is thrown');
                        shouldClearToken = true;
                    }
                    // Don't retry 401 errors - they won't get better with retries
                    throw new Error(data.message || 'Token invalide, utilisateur non trouvé');
                }
                
                // Don't retry on client errors (400-499) except 408 (timeout)
                if (response.status >= 400 && response.status < 500 && response.status !== 408) {
                    throw new Error(data.message || `Erreur HTTP: ${response.status}`);
                }
                
                // Retry on server errors if we have attempts left
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                }
                
                throw new Error(data.message || `Erreur serveur: ${response.status}`);
            }
            
            console.log('✅ API Call Success');
            return data;
            
        } catch (error) {
            console.error(`💥 Error on attempt ${attempt}:`, error.message);
            
            // Handle timeout
            if (error.name === 'AbortError') {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`⏱️ Timeout - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Le serveur met trop de temps à répondre. Réessayez plus tard.');
                }
            } 
            // Handle network errors
            else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🌐 Network error - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            // For 401 errors, don't retry
            else if (error.message.includes('Token invalide') || error.message.includes('401')) {
                // Clear token if this is the final attempt
                if (shouldClearToken) {
                    console.log('🗑️ Clearing invalid token');
                    localStorage.removeItem('token');
                    if (window.app) {
                        window.app.currentUser = null;
                        window.app.updateUserUI();
                    }
                }
                throw error;
            }
            
            // If this was the last attempt, throw the error
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
            // Otherwise, retry for other errors
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
