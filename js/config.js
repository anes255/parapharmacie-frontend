// Fixed Configuration for Shifa Parapharmacie - Better Connection Handling
const API_CONFIG = {
    // Backend URL configuration
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Reduced timeouts for faster fallback to local mode
    TIMEOUT: 8000, // 8 seconds (reduced from 30)
    RETRY_ATTEMPTS: 2, // Reduced from 3
    RETRY_DELAY: 1000, // 1 second (reduced from 2)
    
    // Connection test settings
    TEST_ENDPOINT: '/health',
    CONNECTION_CHECK_INTERVAL: 30000, // Check every 30 seconds
    
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

// Connection status tracking
let connectionStatus = {
    isOnline: false,
    lastCheck: null,
    consecutiveFailures: 0
};

// Helper function to build API URLs
function buildApiUrl(endpoint) {
    const url = API_CONFIG.BASE_URL + endpoint;
    return url;
}

// Quick connection test (reduced timeout)
async function quickConnectionTest() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Quick 3s test
        
        const response = await fetch(buildApiUrl('/health'), {
            method: 'GET',
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
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
    
    // Quick connection check first
    if (connectionStatus.consecutiveFailures >= 3) {
        throw new Error('API temporarily unavailable - using local data');
    }
    
    // Retry logic with shorter timeouts
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
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
            
            // Reset failure counter on success
            connectionStatus.consecutiveFailures = 0;
            connectionStatus.isOnline = true;
            connectionStatus.lastCheck = new Date();
            
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
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(data.message || `Erreur client: ${response.status}`);
                }
                
                // Retry on server errors if we have attempts left
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                }
                
                throw new Error(data.message || `Erreur serveur: ${response.status}`);
            }
            
            return data;
            
        } catch (error) {
            // Increment failure counter
            connectionStatus.consecutiveFailures++;
            connectionStatus.isOnline = false;
            
            if (error.name === 'AbortError') {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('API timeout - using local data');
                }
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Network error - using local data');
                }
            }
            
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        }
    }
}

// Silent backend connection test (no console errors)
async function testBackendConnection() {
    try {
        const response = await quickConnectionTest();
        if (response) {
            connectionStatus.isOnline = true;
            connectionStatus.consecutiveFailures = 0;
            connectionStatus.lastCheck = new Date();
            return { success: true };
        } else {
            connectionStatus.isOnline = false;
            connectionStatus.consecutiveFailures++;
            return { success: false, error: 'Connection failed' };
        }
    } catch (error) {
        connectionStatus.isOnline = false;
        connectionStatus.consecutiveFailures++;
        return { success: false, error: error.message };
    }
}

// Periodic connection checker (silent)
function startConnectionMonitoring() {
    // Initial check
    testBackendConnection();
    
    // Periodic checks
    setInterval(async () => {
        await testBackendConnection();
    }, API_CONFIG.CONNECTION_CHECK_INTERVAL);
}

// Get connection status
function getConnectionStatus() {
    return {
        isOnline: connectionStatus.isOnline,
        lastCheck: connectionStatus.lastCheck,
        consecutiveFailures: connectionStatus.consecutiveFailures
    };
}

// Show connection status in UI
function showConnectionStatus() {
    const status = getConnectionStatus();
    const statusElement = document.getElementById('connectionStatus');
    
    if (statusElement) {
        statusElement.innerHTML = status.isOnline 
            ? '<span class="text-green-600"><i class="fas fa-wifi mr-1"></i>En ligne</span>'
            : '<span class="text-orange-600"><i class="fas fa-wifi-slash mr-1"></i>Mode local</span>';
    }
}

// Initialize connection monitoring when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    startConnectionMonitoring();
    
    // Add connection status to page if container exists
    const statusContainer = document.getElementById('connectionStatusContainer');
    if (statusContainer) {
        statusContainer.innerHTML = '<div id="connectionStatus" class="text-sm"></div>';
        showConnectionStatus();
        
        // Update status display periodically
        setInterval(showConnectionStatus, 5000);
    }
});

// Optimized API call for critical operations
async function criticalApiCall(endpoint, options = {}) {
    try {
        // Only try once for critical operations
        const result = await apiCall(endpoint, { ...options, timeout: 5000 });
        return result;
    } catch (error) {
        console.warn(`Critical API call failed for ${endpoint}, using local fallback`);
        throw error;
    }
}

// Check if we should attempt API calls
function shouldAttemptApiCall() {
    return connectionStatus.consecutiveFailures < 5;
}

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.getConnectionStatus = getConnectionStatus;
window.criticalApiCall = criticalApiCall;
window.shouldAttemptApiCall = shouldAttemptApiCall;

console.log('✅ Config loaded with improved connection handling - Backend URL:', API_CONFIG.BASE_URL);

// Show initial connection status
setTimeout(() => {
    const status = getConnectionStatus();
    if (status.isOnline) {
        console.log('🟢 Backend connection: Online');
    } else {
        console.log('🟡 Backend connection: Offline - Using local data mode');
    }
}, 2000);
