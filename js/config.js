// API Configuration for PharmacieGaherApp
console.log('🔧 Loading API configuration...');

// API Configuration
window.API_CONFIG = {
    // Production API URL - Render deployment
    baseURL: 'https://parapharmacie-gaher.onrender.com',
    
    // Development fallback (if needed)
    devURL: 'http://localhost:5000',
    
    // API endpoints
    endpoints: {
        auth: {
            login: '/api/auth/login',
            register: '/api/auth/register',
            me: '/api/auth/me',
            profile: '/api/auth/profile',
            changePassword: '/api/auth/change-password'
        },
        products: {
            all: '/api/products',
            byId: '/api/products/:id',
            create: '/api/products',
            update: '/api/products/:id',
            delete: '/api/products/:id',
            featured: '/api/products/featured/all',
            promotions: '/api/products/promotions/all',
            categories: '/api/products/categories/all'
        },
        orders: {
            all: '/api/orders',
            byId: '/api/orders/:id',
            create: '/api/orders',
            updateStatus: '/api/orders/:id/status',
            stats: '/api/orders/stats/dashboard'
        },
        admin: {
            dashboard: '/api/admin/dashboard',
            analytics: '/api/admin/analytics',
            users: '/api/admin/users'
        },
        settings: {
            get: '/api/settings',
            update: '/api/settings',
            public: '/api/settings/public',
            appearance: '/api/settings/appearance',
            shipping: '/api/settings/shipping',
            payment: '/api/settings/payment'
        }
    },
    
    // Request timeout (ms)
    timeout: 30000,
    
    // Retry configuration
    retry: {
        attempts: 3,
        delay: 1000
    },
    
    // Cache configuration
    cache: {
        products: 5 * 60 * 1000, // 5 minutes
        settings: 10 * 60 * 1000, // 10 minutes
        user: 2 * 60 * 1000 // 2 minutes
    }
};

// Utility functions for API calls
window.API_UTILS = {
    // Build full URL
    buildURL(endpoint, params = {}) {
        let url = window.API_CONFIG.baseURL + endpoint;
        
        // Replace path parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return url;
    },
    
    // Build query string
    buildQueryString(params) {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                searchParams.append(key, params[key]);
            }
        });
        
        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    },
    
    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        if (!token) return {};
        
        return {
            'x-auth-token': token,
            'Authorization': `Bearer ${token}`
        };
    },
    
    // Check if URL is available
    async checkConnection(url = window.API_CONFIG.baseURL) {
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                timeout: 5000 
            });
            return response.ok;
        } catch (error) {
            console.log('API connection check failed:', error.message);
            return false;
        }
    }
};

// Enhanced fetch wrapper with retry logic
window.API_FETCH = async function(endpoint, options = {}) {
    const config = window.API_CONFIG;
    const maxAttempts = config.retry.attempts;
    const delay = config.retry.delay;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`📡 API Request (attempt ${attempt}/${maxAttempts}): ${options.method || 'GET'} ${endpoint}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(`${config.baseURL}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...window.API_UTILS.getAuthHeaders(),
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ API Success (attempt ${attempt}): ${options.method || 'GET'} ${endpoint}`);
            return result;
            
        } catch (error) {
            console.log(`❌ API Error (attempt ${attempt}): ${error.message}`);
            lastError = error;
            
            // Don't retry on certain errors
            if (error.name === 'AbortError' || 
                error.message.includes('401') || 
                error.message.includes('403') ||
                attempt === maxAttempts) {
                break;
            }
            
            // Wait before retry
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
    
    throw lastError || new Error('API request failed after all retry attempts');
};

// Connection status monitor
window.API_MONITOR = {
    isOnline: true,
    lastCheck: null,
    checkInterval: 5 * 60 * 1000, // 5 minutes
    
    async start() {
        console.log('🔍 Starting API connection monitor...');
        
        // Initial check
        await this.checkStatus();
        
        // Periodic checks
        setInterval(async () => {
            await this.checkStatus();
        }, this.checkInterval);
        
        // Check on page visibility change
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                await this.checkStatus();
            }
        });
    },
    
    async checkStatus() {
        try {
            const wasOnline = this.isOnline;
            this.isOnline = await window.API_UTILS.checkConnection();
            this.lastCheck = new Date();
            
            // Notify if status changed
            if (wasOnline !== this.isOnline) {
                console.log(`🌐 API status changed: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('apiStatusChange', {
                    detail: { isOnline: this.isOnline }
                }));
            }
            
        } catch (error) {
            console.error('API status check failed:', error);
            this.isOnline = false;
        }
    }
};

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

// Use development URL if in development mode
if (isDevelopment && window.location.port !== '3000') {
    console.log('🔧 Development mode detected, using local API');
    window.API_CONFIG.baseURL = window.API_CONFIG.devURL;
}

// Initialize API monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start connection monitoring
    window.API_MONITOR.start();
    
    // Log configuration
    console.log('✅ API Configuration loaded:', {
        baseURL: window.API_CONFIG.baseURL,
        timeout: window.API_CONFIG.timeout,
        development: isDevelopment
    });
});

// Global error handler for API calls
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('API')) {
        console.error('🚨 Unhandled API error:', event.reason);
        
        // Show user-friendly message
        if (window.app && typeof window.app.showMessage === 'function') {
            window.app.showMessage('Problème de connexion avec le serveur', 'error');
        }
    }
});

console.log('✅ API configuration and utilities loaded successfully');
