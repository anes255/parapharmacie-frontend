// Enhanced Configuration for Shifa Parapharmacie Frontend
const API_CONFIG = {
    // Backend URL configuration - Production ready
    BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://parapharmacie-gaher.onrender.com/api'
        : 'http://localhost:5000/api',
    
    // Alternative backends for fallback
    FALLBACK_URLS: [
        'https://parapharmacie-gaher.onrender.com/api',
        'https://shifa-backend.herokuapp.com/api',
        'http://localhost:5000/api'
    ],
    
    // Request configuration
    TIMEOUT: 30000, // 30 seconds for slow connections
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    
    // Cache configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    CACHE_MAX_SIZE: 100, // Maximum cached items
    
    // Endpoints mapping
    ENDPOINTS: {
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            PROFILE: '/auth/profile',
            CHANGE_PASSWORD: '/auth/change-password',
            VERIFY_TOKEN: '/auth/verify-token',
            REFRESH_TOKEN: '/auth/refresh-token'
        },
        
        // Product endpoints
        PRODUCTS: {
            LIST: '/products',
            DETAIL: '/products/',
            SEARCH: '/products/search',
            CATEGORIES: '/products/categories',
            FEATURED: '/products/featured',
            PROMOTIONS: '/products/promotions'
        },
        
        // Order endpoints
        ORDERS: {
            CREATE: '/orders',
            LIST: '/orders',
            DETAIL: '/orders/',
            USER_ORDERS: '/orders/user/',
            STATS: '/orders/stats/summary'
        },
        
        // Admin endpoints
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            PRODUCTS: '/admin/products',
            ORDERS: '/admin/orders',
            USERS: '/admin/users',
            CLEANUP: '/admin/cleanup/products',
            EXPORT: '/admin/export/orders',
            ANALYTICS: '/admin/analytics/sales'
        },
        
        // Settings endpoints
        SETTINGS: {
            GET: '/settings',
            UPDATE: '/settings',
            CONTACT: '/settings/contact',
            SHIPPING: '/settings/shipping',
            PAYMENT: '/settings/payment',
            WILAYAS: '/settings/wilayas'
        },
        
        // Health check
        HEALTH: '/health'
    }
};

// Application Configuration
const APP_CONFIG = {
    // Site information
    SITE_NAME: 'Shifa - Parapharmacie',
    SITE_DESCRIPTION: 'Votre parapharmacie de confiance à Tipaza, Algérie',
    SITE_VERSION: '2.0.0',
    
    // Contact information
    CONTACT: {
        EMAIL: 'pharmaciegaher@gmail.com',
        PHONE: '+213 123 456 789',
        ADDRESS: 'Tipaza, Algérie',
        HOURS: 'Lun-Sam: 8h-20h, Dim: 9h-18h'
    },
    
    // Social media links
    SOCIAL_MEDIA: {
        FACEBOOK: 'https://www.facebook.com/pharmaciegaher/?locale=mg_MG',
        INSTAGRAM: 'https://www.instagram.com/pharmaciegaher/',
        WHATSAPP: 'https://wa.me/213123456789'
    },
    
    // E-commerce settings
    ECOMMERCE: {
        CURRENCY: 'DA',
        FREE_SHIPPING_THRESHOLD: 5000,
        STANDARD_SHIPPING_COST: 300,
        TAX_RATE: 0, // No tax in Algeria for pharmacy products
        
        // Payment methods
        PAYMENT_METHODS: [
            { id: 'cod', name: 'Paiement à la livraison', icon: 'fas fa-money-bill-wave', default: true },
            { id: 'bank', name: 'Virement bancaire', icon: 'fas fa-university' },
            { id: 'card', name: 'Carte bancaire', icon: 'fas fa-credit-card' }
        ],
        
        // Order statuses with colors and translations
        ORDER_STATUSES: {
            'en-attente': { label: 'En attente', color: '#f59e0b', icon: 'fas fa-clock' },
            'confirmée': { label: 'Confirmée', color: '#10b981', icon: 'fas fa-check-circle' },
            'préparée': { label: 'Préparée', color: '#3b82f6', icon: 'fas fa-box' },
            'expédiée': { label: 'Expédiée', color: '#6366f1', icon: 'fas fa-shipping-fast' },
            'livrée': { label: 'Livrée', color: '#059669', icon: 'fas fa-check-double' },
            'annulée': { label: 'Annulée', color: '#ef4444', icon: 'fas fa-times-circle' }
        }
    },
    
    // Product categories with icons and colors
    CATEGORIES: {
        'Vitalité': { icon: 'fas fa-seedling', color: '#10b981', description: 'Vitamines & Énergie' },
        'Sport': { icon: 'fas fa-dumbbell', color: '#f43f5e', description: 'Nutrition sportive' },
        'Visage': { icon: 'fas fa-smile', color: '#ec4899', description: 'Soins du visage' },
        'Cheveux': { icon: 'fas fa-cut', color: '#f59e0b', description: 'Soins capillaires' },
        'Solaire': { icon: 'fas fa-sun', color: '#f97316', description: 'Protection solaire' },
        'Intime': { icon: 'fas fa-heart', color: '#ef4444', description: 'Hygiène intime' },
        'Soins': { icon: 'fas fa-spa', color: '#22c55e', description: 'Soins corporels' },
        'Bébé': { icon: 'fas fa-baby-carriage', color: '#06b6d4', description: 'Soins bébé' },
        'Homme': { icon: 'fas fa-user-tie', color: '#3b82f6', description: 'Soins masculins' },
        'Dentaire': { icon: 'fas fa-tooth', color: '#6366f1', description: 'Hygiène dentaire' }
    },
    
    // Algerian Wilayas for shipping
    WILAYAS: [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
        'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
        'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
        'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
        'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
        'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
        'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
        'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
        'Ghardaïa', 'Relizane'
    ],
    
    // UI Configuration
    UI: {
        // Animation settings
        ANIMATION_DURATION: 300,
        LOADING_DELAY: 500,
        TOAST_DURATION: 5000,
        
        // Pagination
        PRODUCTS_PER_PAGE: 12,
        ORDERS_PER_PAGE: 10,
        SEARCH_RESULTS_LIMIT: 20,
        
        // Image settings
        PRODUCT_IMAGE_PLACEHOLDER: 'https://via.placeholder.com/300x300/10b981/ffffff?text=Produit',
        LAZY_LOADING: true,
        
        // Theme colors
        THEME: {
            PRIMARY: '#10b981',
            SECONDARY: '#059669',
            ACCENT: '#34d399',
            SUCCESS: '#10b981',
            WARNING: '#f59e0b',
            ERROR: '#ef4444',
            INFO: '#3b82f6'
        }
    },
    
    // Security settings
    SECURITY: {
        MIN_PASSWORD_LENGTH: 6,
        SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
        CSRF_PROTECTION: true,
        XSS_PROTECTION: true
    },
    
    // Admin configuration
    ADMIN: {
        EMAIL: 'pharmaciegaher@gmail.com',
        PASSWORD: 'anesaya75', // This should be hashed in production
        
        // Dashboard refresh intervals
        DASHBOARD_REFRESH: 5 * 60 * 1000, // 5 minutes
        NOTIFICATIONS_CHECK: 30 * 1000, // 30 seconds
        
        // Batch actions
        BULK_ACTIONS_LIMIT: 50,
        EXPORT_LIMIT: 1000
    },
    
    // Feature flags
    FEATURES: {
        GUEST_CHECKOUT: true,
        WISHLIST: false,
        REVIEWS: false,
        LIVE_CHAT: false,
        NOTIFICATIONS: true,
        ANALYTICS: true,
        SERVICE_WORKER: true,
        OFFLINE_MODE: false
    }
};

// Cache Management
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
    }
    
    set(key, data, duration = API_CONFIG.CACHE_DURATION) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= API_CONFIG.CACHE_MAX_SIZE) {
            const oldestKey = [...this.timestamps.entries()]
                .sort(([,a], [,b]) => a - b)[0][0];
            this.delete(oldestKey);
        }
        
        this.cache.set(key, data);
        this.timestamps.set(key, Date.now() + duration);
    }
    
    get(key) {
        if (!this.cache.has(key)) return null;
        
        const expiry = this.timestamps.get(key);
        if (Date.now() > expiry) {
            this.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }
    
    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }
    
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }
    
    size() {
        return this.cache.size;
    }
}

// Enhanced API call function with caching and fallback
async function apiCall(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cacheManager = window.cacheManager || new CacheManager();
    
    // Check cache for GET requests
    if ((!options.method || options.method === 'GET') && !options.skipCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for: ${endpoint}`);
            return cached;
        }
    }
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        mode: 'cors',
        credentials: 'omit'
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
    
    // Try main URL first, then fallbacks
    const urlsToTry = [API_CONFIG.BASE_URL, ...API_CONFIG.FALLBACK_URLS];
    
    for (let i = 0; i < urlsToTry.length; i++) {
        const baseUrl = urlsToTry[i];
        const url = baseUrl + endpoint;
        
        for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                console.log(`🔄 API Call (${i + 1}/${urlsToTry.length}, attempt ${attempt}): ${finalOptions.method} ${url}`);
                
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
                
                // Handle different content types
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = { message: text || 'Empty response', rawResponse: text };
                    }
                }
                
                if (!response.ok) {
                    console.error(`❌ HTTP Error ${response.status}:`, data);
                    
                    // Handle specific error cases
                    if (response.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem('token');
                        window.dispatchEvent(new CustomEvent('auth:logout'));
                        throw new Error('Session expirée. Veuillez vous reconnecter.');
                    }
                    
                    if (response.status === 403) {
                        throw new Error('Accès refusé.');
                    }
                    
                    if (response.status === 404) {
                        throw new Error('Ressource non trouvée.');
                    }
                    
                    // Don't retry on client errors (4xx)
                    if (response.status >= 400 && response.status < 500) {
                        throw new Error(data.message || `Erreur client: ${response.status}`);
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
                
                // Cache successful GET requests
                if ((!options.method || options.method === 'GET') && !options.skipCache) {
                    cacheManager.set(cacheKey, data);
                }
                
                return data;
                
            } catch (error) {
                console.error(`💥 API Call Error (URL ${i + 1}, Attempt ${attempt}):`, error.message);
                
                if (error.name === 'AbortError') {
                    if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                        console.log(`⏱️ Timeout - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                        continue;
                    }
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    // Network error, try next URL or retry
                    if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                        console.log(`🌐 Network error - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                        continue;
                    }
                } else {
                    // Other errors, throw immediately for client errors
                    if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                        if (i < urlsToTry.length - 1) break; // Try next URL
                        throw error;
                    }
                }
                
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                }
            }
        }
        
        // If we reach here, all attempts for this URL failed, try next URL
        if (i < urlsToTry.length - 1) {
            console.log(`🔄 Trying next URL...`);
            continue;
        }
    }
    
    // If we reach here, all URLs and attempts failed
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
}

// Utility function to build API URLs
function buildApiUrl(endpoint) {
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log(`🌐 API URL: ${url}`);
    return url;
}

// Test backend connection with health check
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await apiCall(API_CONFIG.ENDPOINTS.HEALTH);
        console.log('✅ Backend connection successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Utility functions
const Utils = {
    // Format currency
    formatPrice: (price) => {
        return `${parseInt(price).toLocaleString('fr-FR')} ${APP_CONFIG.ECOMMERCE.CURRENCY}`;
    },
    
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Validate email
    validateEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Validate phone (Algerian format)
    validatePhone: (phone) => {
        return /^(\+213|0)[5-9]\d{8}$/.test(phone.replace(/\s+/g, ''));
    },
    
    // Generate random ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Local storage with expiry
    setStorageWithExpiry: (key, value, ttl) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    getStorageWithExpiry: (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }
};

// Export for global access
window.API_CONFIG = API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.Utils = Utils;
window.cacheManager = new CacheManager();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Enhanced config loaded');
    console.log(`🚀 ${APP_CONFIG.SITE_NAME} v${APP_CONFIG.SITE_VERSION}`);
    console.log(`🔗 Backend: ${API_CONFIG.BASE_URL}`);
    
    // Test backend connection
    if (APP_CONFIG.FEATURES.ANALYTICS) {
        testBackendConnection().then(result => {
            if (result.success) {
                console.log('🟢 Backend is accessible');
            } else {
                console.log('🟡 Backend connection issues, will use fallbacks');
            }
        });
    }
});

console.log('✅ Enhanced config.js loaded successfully');
