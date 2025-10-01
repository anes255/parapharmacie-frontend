// ==========================================
// 🌿 Shifa Parapharmacie - Configuration
// ==========================================

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 10000, // 10 seconds
    
    // Site Information
    SITE_NAME: 'Shifa - Parapharmacie',
    SITE_DESCRIPTION: 'Parapharmacie Gaher à Tipaza, Algérie',
    CONTACT_EMAIL: 'pharmaciegaher@gmail.com',
    CONTACT_PHONE: '+213 123 456 789',
    ADDRESS: 'Tipaza, Algérie',
    
    // Delivery Settings
    FRAIS_LIVRAISON: 300,
    LIVRAISON_GRATUITE_SEUIL: 5000,
    
    // Categories
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
    ],
    
    // Wilayas
    WILAYAS: [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 
        'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 
        'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 
        'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 
        'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 
        'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 
        'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 
        'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 
        'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
    ],
    
    // Pagination
    PRODUCTS_PER_PAGE: 12,
    
    // Image Settings
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    
    // Toast Settings
    TOAST_DURATION: 5000, // 5 seconds
    
    // Debug Mode
    DEBUG: true
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Full API URL
 */
function buildApiUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${CONFIG.API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

/**
 * Build request headers with authentication
 * @returns {object} Headers object
 */
function buildHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
        headers['x-auth-token'] = token;
    }
    
    return headers;
}

/**
 * Enhanced API call with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} API response
 */
async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const defaultOptions = {
        headers: buildHeaders(),
        timeout: CONFIG.API_TIMEOUT
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Merge headers properly
    if (options.headers) {
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    
    try {
        if (CONFIG.DEBUG) {
            console.log('🌐 API Call:', {
                url,
                method: mergedOptions.method || 'GET',
                headers: mergedOptions.headers
            });
        }
        
        const response = await fetch(url, mergedOptions);
        
        if (CONFIG.DEBUG) {
            console.log('📥 API Response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
        }
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Réponse non-JSON du serveur: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Erreur HTTP: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ API Error:', {
            endpoint,
            error: error.message
        });
        
        // Check if network error
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        }
        
        throw error;
    }
}

/**
 * Format price in DA
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return `${price.toLocaleString('fr-DZ')} DA`;
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (Algerian)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
function isValidPhone(phone) {
    const re = /^(0|\+213)[567]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {object} Validation result
 */
function validateImageFile(file) {
    if (!file) {
        return { valid: false, error: 'Aucun fichier sélectionné' };
    }
    
    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { 
            valid: false, 
            error: 'Format d\'image non supporté. Utilisez JPG, PNG ou WebP.' 
        };
    }
    
    if (file.size > CONFIG.MAX_IMAGE_SIZE) {
        return { 
            valid: false, 
            error: `La taille de l'image doit être inférieure à ${CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB` 
        };
    }
    
    return { valid: true };
}

/**
 * Convert file to Base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get category color
 * @param {string} category - Category name
 * @returns {string} Hex color code
 */
function getCategoryColor(category) {
    const colors = {
        'Vitalité': '10b981',
        'Sport': 'f43f5e',
        'Visage': 'ec4899',
        'Cheveux': 'f59e0b',
        'Solaire': 'f97316',
        'Intime': 'ef4444',
        'Bébé': '06b6d4',
        'Homme': '3b82f6',
        'Soins': '22c55e',
        'Dentaire': '6366f1'
    };
    return colors[category] || '10b981';
}

/**
 * Generate placeholder image URL
 * @param {string} text - Text to display
 * @param {string} category - Category for color
 * @returns {string} Placeholder image URL
 */
function generatePlaceholderImage(text, category) {
    const color = getCategoryColor(category);
    const initials = text.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    return `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
}

/**
 * Log function for debugging
 * @param {string} message - Message to log
 * @param {*} data - Data to log
 */
function log(message, data = null) {
    if (CONFIG.DEBUG) {
        if (data) {
            console.log(`🌿 ${message}`, data);
        } else {
            console.log(`🌿 ${message}`);
        }
    }
}

// Export configuration and functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        buildApiUrl,
        getAuthToken,
        buildHeaders,
        apiCall,
        formatPrice,
        formatDate,
        formatDateTime,
        isValidEmail,
        isValidPhone,
        validateImageFile,
        fileToBase64,
        debounce,
        generateId,
        getCategoryColor,
        generatePlaceholderImage,
        log
    };
}

console.log('✅ Config.js loaded successfully');
