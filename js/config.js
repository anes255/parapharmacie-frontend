// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    // Environment
    environment: 'production',
    appName: 'Shifa - Parapharmacie',
    
    // Backend URL configuration - Using your provided URL
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Request configuration
    TIMEOUT: 30000, // 30 seconds for Render cold starts
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    
    // App Settings - Fixed missing properties
    SETTINGS: {
        fraisLivraison: 300,
        livraisonGratuite: 5000,
        FREE_SHIPPING_THRESHOLD: 5000, // Added for compatibility
        maxQuantity: 10,
        adminEmail: 'pharmaciegaher@gmail.com',
        adminPassword: 'anesaya75',
        nomSite: 'Shifa - Parapharmacie',
        couleurPrimaire: '#10b981',
        couleurSecondaire: '#059669',
        couleurAccent: '#34d399'
    },
    
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
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log(`🌐 API URL: ${url}`);
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
            
            console.log(`📡 Response: ${response.status} ${response.statusText}`);
            
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
                
                // Don't retry on client errors
                if (response.status >= 400 && response.status < 500) {
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
            
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
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

// Also make settings available globally for compatibility
window.SHIFA_SETTINGS = {
    ...API_CONFIG.SETTINGS,
    apiUrl: API_CONFIG.BASE_URL
};

console.log('Config loaded successfully', {
    environment: API_CONFIG.environment,
    apiUrl: API_CONFIG.BASE_URL,
    appName: API_CONFIG.appName
});

console.log('✅ Config.js loaded successfully');
