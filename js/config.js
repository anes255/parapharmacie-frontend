// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    // Backend URL configuration - Updated with your actual URL
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Request configuration
    TIMEOUT: 45000, // 45 seconds for Render cold starts
    RETRY_ATTEMPTS: 2, // Reduced to avoid too many retries
    RETRY_DELAY: 3000, // 3 seconds between retries
    
    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register', 
            PROFILE: '/auth/profile'
        },
        PRODUCTS: {
            LIST: '/products',
            CREATE: '/admin/products',
            UPDATE: '/admin/products/',
            DELETE: '/admin/products/',
            DETAIL: '/products/',
            CATEGORIES: '/products/categories/all',
            FEATURED: '/products/featured/all',
            PROMOTIONS: '/products/promotions/all'
        },
        ORDERS: {
            CREATE: '/orders',
            LIST: '/admin/orders',
            DETAIL: '/orders/',
            USER_ORDERS: '/orders/user/all'
        },
        ADMIN: {
            DASHBOARD: '/admin/dashboard'
        },
        HEALTH: '/health'
    }
};

// Helper function to build API URLs
function buildApiUrl(endpoint) {
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log(`🌐 Building API URL: ${url}`);
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
        }
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
    
    console.log(`📡 API Call: ${finalOptions.method} ${url}`);
    
    // Single attempt with longer timeout for Render
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, API_CONFIG.TIMEOUT);
        
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📡 Response Status: ${response.status}`);
        
        // Handle different content types
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }
            } else {
                data = { message: 'Réponse vide' };
            }
        }
        
        if (!response.ok) {
            console.error(`❌ HTTP Error ${response.status}:`, data);
            throw new Error(data.message || `Erreur HTTP: ${response.status}`);
        }
        
        console.log('✅ API Call Success');
        return data;
        
    } catch (error) {
        console.error(`💥 API Call Failed:`, error.message);
        
        if (error.name === 'AbortError') {
            throw new Error('Délai d\'attente dépassé. Le serveur met trop de temps à répondre.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
        }
        
        throw error;
    }
}

// Test backend connection with retry
async function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    
    try {
        const response = await apiCall('/health');
        console.log('✅ Backend connection successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Wake up Render service (for cold starts)
async function wakeUpService() {
    console.log('⏰ Waking up Render service...');
    try {
        // Make a simple call to wake up the service
        await fetch(API_CONFIG.BASE_URL + '/health', { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        console.log('✅ Service wake-up call sent');
    } catch (error) {
        console.log('⚠️ Wake-up call failed:', error.message);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wake up the service immediately
    wakeUpService();
});

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.wakeUpService = wakeUpService;

console.log('✅ Fixed Config loaded - Backend URL:', API_CONFIG.BASE_URL);
