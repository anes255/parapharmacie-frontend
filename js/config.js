// Configuration for Shifa Parapharmacie - Browser Compatible

// Detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// API Configuration
const API_CONFIG = {
    BASE_URL: isProduction 
        ? 'https://parapharmacie-gaher.onrender.com/api'
        : 'http://localhost:5000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// App Configuration
const APP_CONFIG = {
    name: 'Shifa - Parapharmacie',
    version: '2.0.0',
    description: 'Votre parapharmacie de confiance à Tipaza, Algérie',
    
    // Contact Information
    contact: {
        phone: '+213 123 456 789',
        email: 'pharmaciegaher@gmail.com',
        address: 'Tipaza, Algérie',
        hours: 'Lun-Sam: 8h-20h, Dim: 9h-18h'
    },
    
    // Social Media
    social: {
        facebook: 'https://www.facebook.com/pharmaciegaher/?locale=mg_MG',
        instagram: 'https://www.instagram.com/pharmaciegaher/'
    },
    
    // Business Settings
    business: {
        currency: 'DA',
        freeShippingThreshold: 5000,
        defaultShippingCost: 350,
        taxRate: 0, // No tax in Algeria for pharmacy products
        
        // Shipping costs by wilaya
        shippingRates: {
            'Alger': 250,
            'Blida': 250,
            'Boumerdès': 250,
            'Tipaza': 200,
            'Médéa': 300,
            'Oran': 350,
            'Constantine': 400,
            'Annaba': 400,
            'Sétif': 350,
            'Batna': 400,
            'Biskra': 450,
            'Tébessa': 450,
            'Ouargla': 500,
            'Béjaïa': 350,
            'Tizi Ouzou': 300,
            'Djelfa': 400,
            'Jijel': 350,
            'Sidi Bel Abbès': 350,
            'Béchar': 500,
            'Tamanrasset': 600,
            'Laghouat': 400,
            'Khenchela': 400,
            'Souk Ahras': 400,
            'Guelma': 400,
            'Skikda': 350,
            'Tlemcen': 350,
            'Bouira': 300,
            'Bordj Bou Arréridj': 350,
            'Chlef': 300,
            'Mostaganem': 350,
            'M\'Sila': 350,
            'Mascara': 350,
            'Tiaret': 350,
            'Tissemsilt': 400,
            'El Oued': 450,
            'Ghardaïa': 450,
            'Relizane': 350,
            'Tindouf': 650,
            'Adrar': 550,
            'Aïn Defla': 300,
            'Aïn Témouchent': 350,
            'El Tarf': 400,
            'Illizi': 650,
            'Mila': 400,
            'Naâma': 500,
            'Saïda': 400,
            'El Bayadh': 450
        }
    },
    
    // Categories
    categories: [
        'Vitalité',
        'Sport', 
        'Visage',
        'Cheveux',
        'Solaire',
        'Intime',
        'Soins',
        'Bébé',
        'Homme',
        'Dentaire'
    ],
    
    // Admin Configuration
    admin: {
        email: 'pharmaciegaher@gmail.com',
        // This will be checked server-side for security
    },
    
    // Local Storage Keys
    storage: {
        cart: 'shifa_cart',
        user: 'shifa_user',
        token: 'shifa_token',
        products: 'shifa_products',
        orders: 'shifa_admin_orders',
        settings: 'shifa_settings'
    },
    
    // Default Demo Products for Offline Mode
    demoProducts: [
        {
            _id: 'demo1',
            nom: 'Vitamine C 1000mg',
            description: 'Complément alimentaire riche en vitamine C pour renforcer votre système immunitaire',
            prix: 1200,
            stock: 50,
            categorie: 'Vitalité',
            marque: 'Shifa',
            image: 'https://via.placeholder.com/300x300/10b981/ffffff?text=VC',
            enVedette: true,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo2',
            nom: 'Crème Hydratante Visage',
            description: 'Crème hydratante quotidienne pour tous types de peau',
            prix: 2500,
            prixOriginal: 3000,
            stock: 30,
            categorie: 'Visage',
            marque: 'Shifa',
            image: 'https://via.placeholder.com/300x300/ec4899/ffffff?text=CH',
            enPromotion: true,
            pourcentagePromotion: 17,
            actif: true,
            dateAjout: new Date().toISOString()
        },
        {
            _id: 'demo3',
            nom: 'Shampoing Fortifiant',
            description: 'Shampoing fortifiant pour cheveux fragiles et cassants',
            prix: 1800,
            stock: 25,
            categorie: 'Cheveux',
            marque: 'Shifa',
            image: 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=SF',
            enVedette: true,
            actif: true,
            dateAjout: new Date().toISOString()
        }
    ],
    
    // Coupon Codes
    coupons: {
        'WELCOME10': { type: 'percentage', value: 10, description: 'Réduction de bienvenue' },
        'SHIFA15': { type: 'percentage', value: 15, description: 'Réduction spéciale Shifa' },
        'SANTE20': { type: 'percentage', value: 20, description: 'Promotion santé' },
        'NOUVEAU50': { type: 'fixed', value: 500, description: 'Réduction nouveau client' },
        'FIDELE100': { type: 'fixed', value: 1000, description: 'Réduction client fidèle' }
    }
};

// Utility function to build API URLs
function buildApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Utility function to get config value
function getConfig(key, defaultValue = null) {
    const keys = key.split('.');
    let value = APP_CONFIG;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// Export for global access
window.APP_CONFIG = APP_CONFIG;
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.getConfig = getConfig;

console.log('✅ Config loaded successfully', {
    environment: isProduction ? 'production' : 'development',
    apiUrl: API_CONFIG.BASE_URL,
    appName: APP_CONFIG.name
});
