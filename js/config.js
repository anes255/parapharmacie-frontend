// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection

const API_CONFIG = {
    // Backend URL configuration - Using your provided URL
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Request configuration
    TIMEOUT: 30000, // 30 seconds for Render cold starts
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    
    // Demo mode configuration
    DEMO_MODE: true, // Enable demo mode for offline functionality
    
    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            PROFILE: '/auth/profile',
            CHANGE_PASSWORD: '/auth/change-password',
            VERIFY_TOKEN: '/auth/verify-token'
        },
        PRODUCTS: {
            LIST: '/products',
            DETAIL: '/products/',
            CATEGORIES: '/products/categories/all',
            FEATURED: '/products/featured/all',
            PROMOTIONS: '/products/promotions/all',
            CREATE: '/products',
            UPDATE: '/products/',
            DELETE: '/products/'
        },
        ORDERS: {
            CREATE: '/orders',
            LIST: '/orders',
            DETAIL: '/orders/',
            USER_ORDERS: '/orders/user/all',
            UPDATE_STATUS: '/orders/',
            DELETE: '/orders/',
            STATS: '/orders/stats/dashboard'
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
    if (token && !token.startsWith('demo_')) { // Don't send demo tokens to API
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
                
                // Handle specific HTTP errors
                const errorMessage = data.message || data.error || `HTTP Error: ${response.status}`;
                
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(errorMessage);
                }
                
                // Retry on server errors (5xx) if we have attempts left
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🔄 Server error - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                }
                
                throw new Error(errorMessage);
            }
            
            console.log('✅ API Success');
            return data;
            
        } catch (error) {
            console.error(`💥 API Call Error (Attempt ${attempt}):`, error.message);
            
            // Handle different types of errors
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
            
            // If this is the last attempt, throw the error
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

// Initialize API with health check
async function initializeAPI() {
    console.log('🚀 Initializing API connection...');
    
    // Test connection
    const healthCheck = await testBackendConnection();
    
    if (healthCheck.success) {
        console.log('✅ API is online and ready');
        API_CONFIG.IS_ONLINE = true;
    } else {
        console.log('⚠️ API is offline, falling back to demo mode');
        API_CONFIG.IS_ONLINE = false;
        API_CONFIG.DEMO_MODE = true;
    }
    
    return API_CONFIG.IS_ONLINE;
}

// Demo data configuration
const DEMO_DATA = {
    // Demo users for authentication
    USERS: [
        {
            id: 'demo-admin-001',
            email: 'pharmaciegaher@gmail.com',
            password: 'admin123',
            nom: 'Admin',
            prenom: 'Pharmacie',
            role: 'admin',
            telephone: '+213555123456',
            adresse: 'Tipaza, Algérie',
            wilaya: 'Tipaza',
            dateInscription: new Date().toISOString()
        },
        {
            id: 'demo-user-001',
            email: 'client@example.com',
            password: 'client123',
            nom: 'Dupont',
            prenom: 'Jean',
            role: 'client',
            telephone: '+213555654321',
            adresse: 'Alger, Algérie',
            wilaya: 'Alger',
            dateInscription: new Date().toISOString()
        }
    ],
    
    // Algeria wilayas for forms
    WILAYAS: [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 
        'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
        'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
        'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
        'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
        'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
        'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras',
        'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa',
        'Relizane'
    ],
    
    // Product categories
    CATEGORIES: [
        { nom: 'Vitalité', description: 'Vitamines & Énergie', icon: 'fa-seedling' },
        { nom: 'Sport', description: 'Nutrition sportive', icon: 'fa-dumbbell' },
        { nom: 'Visage', description: 'Soins du visage', icon: 'fa-smile' },
        { nom: 'Cheveux', description: 'Soins capillaires', icon: 'fa-cut' },
        { nom: 'Solaire', description: 'Protection solaire', icon: 'fa-sun' },
        { nom: 'Intime', description: 'Hygiène intime', icon: 'fa-heart' },
        { nom: 'Soins', description: 'Soins corporels', icon: 'fa-spa' },
        { nom: 'Bébé', description: 'Soins bébé', icon: 'fa-baby-carriage' },
        { nom: 'Homme', description: 'Soins masculins', icon: 'fa-user-tie' },
        { nom: 'Dentaire', description: 'Hygiène dentaire', icon: 'fa-tooth' }
    ]
};

// Shipping configuration
const SHIPPING_CONFIG = {
    FREE_SHIPPING_THRESHOLD: 5000, // Free shipping for orders over 5000 DA
    RATES: {
        'Alger': 250,
        'Blida': 250,
        'Boumerdès': 250,
        'Tipaza': 200,
        'Médéa': 300,
        'default': 350
    }
};

// App configuration
const APP_CONFIG = {
    NAME: 'Shifa - Parapharmacie',
    VERSION: '1.0.0',
    AUTHOR: 'Pharmacie Gaher',
    COLORS: {
        PRIMARY: '#10b981',
        SECONDARY: '#059669',
        ACCENT: '#34d399'
    },
    CONTACT: {
        EMAIL: 'pharmaciegaher@gmail.com',
        PHONE: '+213 123 456 789',
        ADDRESS: 'Tipaza, Algérie',
        FACEBOOK: 'https://www.facebook.com/pharmaciegaher/?locale=mg_MG',
        INSTAGRAM: 'https://www.instagram.com/pharmaciegaher/'
    },
    BUSINESS_HOURS: {
        WEEKDAYS: '8h-20h',
        WEEKEND: 'Dim: 9h-18h'
    }
};

// Storage keys configuration
const STORAGE_KEYS = {
    TOKEN: 'token',
    CART: 'cart',
    DEMO_PRODUCTS: 'demoProducts',
    ADMIN_ORDERS: 'adminOrders',
    USER_ORDERS: 'userOrders_',
    USER_PREFERENCES: 'userPreferences_'
};

// Utility function to check if app is in demo mode
function isDemoMode() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return API_CONFIG.DEMO_MODE || (token && token.startsWith('demo_'));
}

// Utility function to clear all demo data
function clearDemoData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        if (key.endsWith('_')) {
            // Clear keys with patterns
            Object.keys(localStorage).forEach(storageKey => {
                if (storageKey.startsWith(key)) {
                    localStorage.removeItem(storageKey);
                }
            });
        } else {
            localStorage.removeItem(key);
        }
    });
    console.log('✅ Demo data cleared');
}

// Export for global access
window.API_CONFIG = API_CONFIG;
window.DEMO_DATA = DEMO_DATA;
window.SHIPPING_CONFIG = SHIPPING_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.initializeAPI = initializeAPI;
window.isDemoMode = isDemoMode;
window.clearDemoData = clearDemoData;

// Initialize API on load
document.addEventListener('DOMContentLoaded', () => {
    initializeAPI();
});

console.log('✅ Fixed Config loaded with demo support - Backend URL:', API_CONFIG.BASE_URL);
