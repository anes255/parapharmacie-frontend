// Complete Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    // Backend URL configuration - FIXED
    BASE_URL: (() => {
        const hostname = window.location.hostname;
        
        // Always use production backend URL - CORRECT URL
        return 'https://parapharmacie-gaher.onrender.com/api';
        
        // Comment out the localhost logic to always use production
        /*
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        
        // Production - Your actual Render backend URL
        return 'https://mamanalgerienne-backend.onrender.com/api';
        */
    })(),
    
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
            TEST_USERS: '/auth/test-users'
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
            USER_ORDERS: '/orders/user/all',
            STATUS: '/orders/status/'
        },
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            PRODUCTS: '/admin/products',
            ORDERS: '/admin/orders',
            ORDER_STATUS: '/admin/orders/{id}/status'
        },
        SETTINGS: {
            GET: '/settings',
            UPDATE: '/settings',
            SHIPPING: '/settings/shipping'
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

// Enhanced API call function with Render-specific optimizations
async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit' // Don't send cookies (better for static sites)
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
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.log('⏱️ Request timeout triggered');
            }, API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📡 Response: ${response.status} ${response.statusText}`);
            
            // Handle different content types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.log('📄 Non-JSON response:', text);
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text || 'Empty response' };
                }
            }
            
            if (!response.ok) {
                console.error(`❌ HTTP Error ${response.status}:`, data);
                
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(data.message || `Erreur HTTP: ${response.status}`);
                }
                
                // Retry on server errors (5xx) if we have attempts left
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
            
            // Handle different error types
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
            } else if (error.message.includes('CORS')) {
                throw new Error('Erreur de configuration serveur (CORS). Contactez l\'administrateur.');
            }
            
            // If it's the last attempt, throw the error
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
            // Wait before retrying
            console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        }
    }
}

// Test backend connection with detailed logging
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        console.log('🎯 Backend URL:', API_CONFIG.BASE_URL);
        console.log('⚙️ Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');
        
        const startTime = Date.now();
        const response = await apiCall('/health');
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ Backend connection successful in ${responseTime}ms:`, response);
        
        // Show connection status in UI if app is available
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(`✅ Connexion établie (${responseTime}ms)`, 'success');
        }
        
        return { success: true, responseTime, data: response };
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        
        // Show offline mode message
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast('⚠️ Mode hors ligne - Fonctionnalités limitées', 'warning');
        }
        
        return { success: false, error: error.message };
    }
}

// Connection status monitoring
let connectionStatus = {
    isOnline: false,
    lastCheck: null,
    retryAttempts: 0,
    maxRetries: 5
};

async function monitorConnection() {
    const result = await testBackendConnection();
    connectionStatus.lastCheck = new Date();
    
    if (result.success) {
        connectionStatus.isOnline = true;
        connectionStatus.retryAttempts = 0;
        
        // Update UI to show online status
        document.dispatchEvent(new CustomEvent('connectionStatusChanged', { 
            detail: { online: true, responseTime: result.responseTime } 
        }));
        
    } else {
        connectionStatus.isOnline = false;
        connectionStatus.retryAttempts++;
        
        // Update UI to show offline status
        document.dispatchEvent(new CustomEvent('connectionStatusChanged', { 
            detail: { online: false, error: result.error } 
        }));
        
        // Schedule retry if we haven't exceeded max retries
        if (connectionStatus.retryAttempts <= connectionStatus.maxRetries) {
            const retryDelay = Math.min(connectionStatus.retryAttempts * 5000, 30000); // Max 30 seconds
            console.log(`🔄 Scheduling reconnection attempt ${connectionStatus.retryAttempts}/${connectionStatus.maxRetries} in ${retryDelay}ms`);
            setTimeout(monitorConnection, retryDelay);
        } else {
            console.log('🚫 Max reconnection attempts reached');
        }
    }
}

// Initialize connection monitoring when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Shifa Parapharmacie Frontend...');
    console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
    console.log('⏱️ Timeout:', API_CONFIG.TIMEOUT + 'ms');
    console.log('🔄 Retry attempts:', API_CONFIG.RETRY_ATTEMPTS);
    
    // Test connection immediately
    setTimeout(monitorConnection, 1000);
    
    // Monitor connection every 5 minutes when online
    setInterval(() => {
        if (connectionStatus.isOnline || connectionStatus.retryAttempts === 0) {
            monitorConnection();
        }
    }, 5 * 60 * 1000);
});

// Listen for connection status changes
document.addEventListener('connectionStatusChanged', (event) => {
    const { online, responseTime, error } = event.detail;
    
    if (online) {
        console.log(`🟢 Connection Status: ONLINE (${responseTime}ms)`);
    } else {
        console.log(`🔴 Connection Status: OFFLINE (${error})`);
    }
});

// Utility function to check if we're in development mode
function isDevelopment() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

// Utility function to get connection status
function getConnectionStatus() {
    return {
        ...connectionStatus,
        apiUrl: API_CONFIG.BASE_URL,
        isDevelopment: isDevelopment()
    };
}

// Debug information
console.log('🥽 Shifa Parapharmacie - Configuration Loaded');
console.log('🎯 Target Backend:', API_CONFIG.BASE_URL);
console.log('🌐 Environment:', isDevelopment() ? 'Development' : 'Production');

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.monitorConnection = monitorConnection;
window.getConnectionStatus = getConnectionStatus;
window.isDevelopment = isDevelopment;
