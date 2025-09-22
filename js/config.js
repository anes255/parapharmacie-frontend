// Fixed Configuration for Shifa Parapharmacie Frontend-Backend Connection
const API_CONFIG = {
    // Backend URL configuration - Using your provided URL
    BASE_URL: 'https://parapharmacie-gaher.onrender.com/api',
    
    // Request configuration - REDUCED TIMEOUTS TO PREVENT HANGING
    TIMEOUT: 8000, // 8 seconds instead of 30
    RETRY_ATTEMPTS: 1, // Only 1 retry instead of 3
    RETRY_DELAY: 1000, // 1 second instead of 2
    
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

// Enhanced API call function with FAST timeout
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
    
    // Retry logic for Render cold starts - BUT WITH FASTER TIMEOUTS
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            console.log(`🔄 API Call Attempt ${attempt}: ${finalOptions.method} ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('⏱️ API call timeout, aborting...');
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
                console.log('⏱️ Request was aborted due to timeout');
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`⏱️ Timeout - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Le serveur met trop de temps à répondre. Le site fonctionne en mode local.');
                }
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('🌐 Network error detected');
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    console.log(`🌐 Network error - retrying in ${API_CONFIG.RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                    continue;
                } else {
                    throw new Error('Connexion impossible. Le site fonctionne en mode local.');
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

// OPTIONAL: Test backend connection - DON'T BLOCK LOADING
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection (non-blocking)...');
        
        // Add a very short timeout for this test
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds max
        
        const response = await fetch(buildApiUrl('/health'), {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            return { success: true, data: data };
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        console.warn('⚠️ Backend connection failed (site will work locally):', error.message);
        return { success: false, error: error.message };
    }
}

// Create some demo products for immediate loading
function createDemoProducts() {
    const demoProducts = [
        {
            _id: 'demo_001',
            nom: 'Vitamine C 1000mg',
            description: 'Complément alimentaire à base de vitamine C pour renforcer le système immunitaire.',
            prix: 1200,
            stock: 25,
            categorie: 'Vitalité',
            marque: 'Shifa',
            enVedette: true,
            enPromotion: false,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo_002',
            nom: 'Crème Hydratante Visage',
            description: 'Crème hydratante pour tous types de peau, enrichie en acide hyaluronique.',
            prix: 800,
            prixOriginal: 1000,
            stock: 15,
            categorie: 'Visage',
            marque: 'Natural Care',
            enVedette: false,
            enPromotion: true,
            pourcentagePromotion: 20,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo_003',
            nom: 'Shampooing Réparateur',
            description: 'Shampooing réparateur pour cheveux abîmés et colorés.',
            prix: 650,
            stock: 30,
            categorie: 'Cheveux',
            marque: 'Hair Expert',
            enVedette: true,
            enPromotion: false,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo_004',
            nom: 'Protéine Whey Sport',
            description: 'Protéine en poudre pour sportifs, saveur vanille.',
            prix: 2500,
            stock: 12,
            categorie: 'Sport',
            marque: 'FitLife',
            enVedette: false,
            enPromotion: false,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo_005',
            nom: 'Crème Solaire SPF50',
            description: 'Protection solaire haute pour visage et corps, résistante à l\'eau.',
            prix: 950,
            stock: 20,
            categorie: 'Solaire',
            marque: 'SunCare',
            enVedette: true,
            enPromotion: false,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo_006',
            nom: 'Lingettes Bébé Bio',
            description: 'Lingettes douces et naturelles pour bébé, sans parfum.',
            prix: 450,
            prixOriginal: 550,
            stock: 40,
            categorie: 'Bébé',
            marque: 'Baby Natural',
            enVedette: false,
            enPromotion: true,
            pourcentagePromotion: 18,
            actif: true,
            dateAjout: new Date().toISOString()
        }
    ];
    
    // Save demo products to localStorage if not already present
    const existingProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    if (existingProducts.length === 0) {
        localStorage.setItem('demoProducts', JSON.stringify(demoProducts));
        console.log('✅ Demo products created and saved to localStorage');
    }
    
    return demoProducts;
}

// Initialize demo data and test connection in background
function initializeConfig() {
    console.log('🔧 Initializing configuration...');
    
    // Create demo products first (immediate loading)
    createDemoProducts();
    
    // Test backend connection in background (don't wait for it)
    setTimeout(() => {
        testBackendConnection().then(result => {
            if (result.success) {
                console.log('✅ Backend is available for real-time data');
            } else {
                console.log('⚠️ Backend unavailable, using local data only');
            }
        });
    }, 100);
    
    console.log('✅ Config initialized - Backend URL:', API_CONFIG.BASE_URL);
}

// Export for global access
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.apiCall = apiCall;
window.testBackendConnection = testBackendConnection;
window.createDemoProducts = createDemoProducts;

// Initialize immediately when script loads
initializeConfig();

console.log('✅ Fixed config loaded - Fast timeouts to prevent hanging');
