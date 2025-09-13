// Enhanced Authentication System for Shifa Parapharmacie
// Aesthetic, Functional, and Secure Implementation

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.isLoading = false;
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        console.log('🔐 Authentication System Initializing...');
        await this.checkExistingAuth();
        console.log('✅ Authentication System Ready');
    }
    
    async checkExistingAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await this.validateToken(token);
                if (userData) {
                    this.currentUser = userData;
                    this.notifyAuthChange();
                    return true;
                }
            } catch (error) {
                console.log('Token validation failed, removing invalid token');
                localStorage.removeItem('token');
            }
        }
        return false;
    }
    
    async validateToken(token) {
        try {
            const response = await fetch(buildApiUrl('/auth/profile'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Token invalid');
        } catch (error) {
            throw error;
        }
    }
    
    onAuthChange(callback) {
        this.authCallbacks.push(callback);
    }
    
    notifyAuthChange() {
        this.authCallbacks.forEach(callback => {
            try {
                callback(this.currentUser);
            } catch (error) {
                console.error('Auth callback error:', error);
            }
        });
    }
    
    // Enhanced Login Method
    async login(email, password) {
        if (this.isLoading) return { success: false, message: 'Une connexion est déjà en cours...' };
        
        this.isLoading = true;
        
        try {
            console.log('🔐 Attempting login for:', email);
            
            // Input validation
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }
            
            if (!this.isValidEmail(email)) {
                throw new Error('Format d\'email invalide');
            }
            
            // API Call with enhanced error handling
            const response = await fetch(buildApiUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`);
            }
            
            // Success - store token and user data
            localStorage.setItem('token', data.token);
            this.currentUser = data.user;
            
            console.log('✅ Login successful for:', email);
            
            // Notify app about auth change
            this.notifyAuthChange();
            
            return {
                success: true,
                message: 'Connexion réussie !',
                user: data.user
            };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                message: this.getFriendlyErrorMessage(error.message)
            };
        } finally {
            this.isLoading = false;
        }
    }
    
    // Enhanced Registration Method
    async register(userData) {
        if (this.isLoading) return { success: false, message: 'Une inscription est déjà en cours...' };
        
        this.isLoading = true;
        
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            // Client-side validation
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            const response = await fetch(buildApiUrl('/auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nom: userData.nom.trim(),
                    prenom: userData.prenom.trim(),
                    email: userData.email.toLowerCase().trim(),
                    password: userData.password,
                    telephone: userData.telephone.replace(/\s+/g, ''),
                    adresse: userData.adresse?.trim() || '',
                    ville: userData.ville?.trim() || '',
                    wilaya: userData.wilaya,
                    codePostal: userData.codePostal?.trim() || ''
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`);
            }
            
            // Success - store token and user data
            localStorage.setItem('token', data.token);
            this.currentUser = data.user;
            
            console.log('✅ Registration successful for:', userData.email);
            
            // Notify app about auth change
            this.notifyAuthChange();
            
            return {
                success: true,
                message: 'Inscription réussie !',
                user: data.user
            };
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            return {
                success: false,
                message: this.getFriendlyErrorMessage(error.message)
            };
        } finally {
            this.isLoading = false;
        }
    }
    
    // Logout method
    async logout() {
        try {
            localStorage.removeItem('token');
            this.currentUser = null;
            this.notifyAuthChange();
            
            return {
                success: true,
                message: 'Déconnexion réussie'
            };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'Erreur lors de la déconnexion'
            };
        }
    }
    
    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validateRegistrationData(data) {
        if (!data.nom || data.nom.trim().length < 2) {
            return { isValid: false, message: 'Le nom doit contenir au moins 2 caractères' };
        }
        
        if (!data.prenom || data.prenom.trim().length < 2) {
            return { isValid: false, message: 'Le prénom doit contenir au moins 2 caractères' };
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Format d\'email invalide' };
        }
        
        if (!data.password || data.password.length < 6) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
        }
        
        if (!data.telephone || data.telephone.length < 10) {
            return { isValid: false, message: 'Numéro de téléphone invalide' };
        }
        
        if (!data.wilaya) {
            return { isValid: false, message: 'Wilaya requise' };
        }
        
        return { isValid: true };
    }
    
    getFriendlyErrorMessage(errorMessage) {
        const errorMappings = {
            'fetch': 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
            'Network request failed': 'Erreur de réseau. Vérifiez votre connexion.',
            'Failed to fetch': 'Impossible de contacter le serveur. Réessayez plus tard.',
            'Erreur serveur lors de la connexion': 'Erreur de serveur. Veuillez réessayer dans quelques instants.',
            'Email ou mot de passe incorrect': 'Email ou mot de passe incorrect',
            'Un utilisateur avec cet email existe déjà': 'Un compte existe déjà avec cet email',
            'Ce numéro de téléphone est déjà utilisé': 'Ce numéro de téléphone est déjà utilisé'
        };
        
        for (const [key, message] of Object.entries(errorMappings)) {
            if (errorMessage.includes(key)) {
                return message;
            }
        }
        
        return errorMessage || 'Une erreur inattendue s\'est produite';
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    getUser() {
        return this.currentUser;
    }
    
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
}

// Global Authentication instance
window.authSystem = new AuthenticationSystem();

// Enhanced UI Management for Authentication Pages
class AuthUIManager {
    constructor() {
        this.algerian_wilayas = [
            'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
            'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
            'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
            'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
            'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
            'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
            'Ghardaïa', 'Relizane'
        ];
    }
    
    createLoginPage() {
        return `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <!-- Header -->
                    <div class="text-center">
                        <div class="mx-auto flex justify-center">
                            <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                                <i class="fas fa-seedling text-white text-3xl drop-shadow-lg"></i>
                            </div>
                        </div>
                        <h2 class="mt-6 text-4xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent">
                            Connexion
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Connectez-vous à votre compte Shifa Parapharmacie
                        </p>
                    </div>
                    
                    <!-- Login Form -->
                    <form class="mt-8 space-y-6" onsubmit="handleLogin(event)">
                        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                            <div class="space-y-6">
                                <!-- Email Field -->
                                <div>
                                    <label for="loginEmail" class="block text-sm font-semibold text-gray-700 mb-3">
                                        <i class="fas fa-envelope mr-2 text-emerald-500"></i>
                                        Email
                                    </label>
                                    <input 
                                        id="loginEmail" 
                                        name="email" 
                                        type="email" 
                                        required 
                                        class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-400"
                                        placeholder="votre@email.com"
                                        autocomplete="email"
                                    >
                                </div>
                                
                                <!-- Password Field -->
                                <div>
                                    <label for="loginPassword" class="block text-sm font-semibold text-gray-700 mb-3">
                                        <i class="fas fa-lock mr-2 text-emerald-500"></i>
                                        Mot de passe
                                    </label>
                                    <div class="relative">
                                        <input 
                                            id="loginPassword" 
                                            name="password" 
                                            type="password" 
                                            required 
                                            class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-400 pr-12"
                                            placeholder="Votre mot de passe"
                                            autocomplete="current-password"
                                        >
                                        <button 
                                            type="button" 
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                                            onclick="togglePasswordVisibility('loginPassword')"
                                        >
                                            <i class="fas fa-eye" id="loginPasswordToggle"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <button 
                                    type="submit" 
                                    id="loginSubmitBtn"
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <span id="loginSubmitText">
                                        <i class="fas fa-sign-in-alt mr-2"></i>
                                        Se connecter
                                    </span>
                                    <div id="loginSpinner" class="hidden flex items-center justify-center">
                                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Connexion...
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Footer Links -->
                        <div class="text-center space-y-4">
                            <p class="text-sm text-gray-600">
                                Pas encore de compte ? 
                                <button 
                                    type="button"
                                    onclick="app.showPage('register')" 
                                    class="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                                >
                                    Créer un compte
                                </button>
                            </p>
                            
                            <div class="pt-4 border-t border-gray-200">
                                <button 
                                    type="button"
                                    onclick="app.showPage('home')" 
                                    class="text-sm text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2 mx-auto"
                                >
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Retour à l'accueil</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    createRegisterPage() {
        return `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-2xl mx-auto">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <div class="mx-auto flex justify-center mb-6">
                            <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                                <i class="fas fa-user-plus text-white text-3xl drop-shadow-lg"></i>
                            </div>
                        </div>
                        <h2 class="text-4xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent">
                            Créer un compte
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Rejoignez la communauté Shifa Parapharmacie
                        </p>
                    </div>
                    
                    <!-- Registration Form -->
                    <form onsubmit="handleRegister(event)" class="space-y-8">
                        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                            <!-- Personal Information -->
                            <div class="mb-8">
                                <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <i class="fas fa-user mr-3 text-emerald-500"></i>
                                    Informations personnelles
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="registerNom" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Nom *
                                        </label>
                                        <input 
                                            id="registerNom" 
                                            name="nom" 
                                            type="text" 
                                            required 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="Votre nom"
                                        >
                                    </div>
                                    
                                    <div>
                                        <label for="registerPrenom" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Prénom *
                                        </label>
                                        <input 
                                            id="registerPrenom" 
                                            name="prenom" 
                                            type="text" 
                                            required 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="Votre prénom"
                                        >
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Contact Information -->
                            <div class="mb-8">
                                <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <i class="fas fa-envelope mr-3 text-emerald-500"></i>
                                    Coordonnées
                                </h3>
                                <div class="space-y-6">
                                    <div>
                                        <label for="registerEmail" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input 
                                            id="registerEmail" 
                                            name="email" 
                                            type="email" 
                                            required 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="votre@email.com"
                                        >
                                    </div>
                                    
                                    <div>
                                        <label for="registerTelephone" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Téléphone *
                                        </label>
                                        <input 
                                            id="registerTelephone" 
                                            name="telephone" 
                                            type="tel" 
                                            required 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="0555123456"
                                            pattern="[0-9+\s\-]+"
                                        >
                                    </div>
                                    
                                    <div class="relative">
                                        <label for="registerPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Mot de passe *
                                        </label>
                                        <div class="relative">
                                            <input 
                                                id="registerPassword" 
                                                name="password" 
                                                type="password" 
                                                required 
                                                minlength="6"
                                                class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 pr-12"
                                                placeholder="Minimum 6 caractères"
                                            >
                                            <button 
                                                type="button" 
                                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                                                onclick="togglePasswordVisibility('registerPassword')"
                                            >
                                                <i class="fas fa-eye" id="registerPasswordToggle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Address Information -->
                            <div class="mb-8">
                                <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <i class="fas fa-map-marker-alt mr-3 text-emerald-500"></i>
                                    Adresse (optionnel)
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="md:col-span-2">
                                        <label for="registerAdresse" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Adresse complète
                                        </label>
                                        <input 
                                            id="registerAdresse" 
                                            name="adresse" 
                                            type="text" 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="Rue, cité, quartier..."
                                        >
                                    </div>
                                    
                                    <div>
                                        <label for="registerVille" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Ville
                                        </label>
                                        <input 
                                            id="registerVille" 
                                            name="ville" 
                                            type="text" 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="Votre ville"
                                        >
                                    </div>
                                    
                                    <div>
                                        <label for="registerWilaya" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Wilaya *
                                        </label>
                                        <select 
                                            id="registerWilaya" 
                                            name="wilaya" 
                                            required 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                        >
                                            <option value="">Sélectionnez une wilaya</option>
                                            ${this.algerian_wilayas.map(wilaya => 
                                                `<option value="${wilaya}">${wilaya}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label for="registerCodePostal" class="block text-sm font-semibold text-gray-700 mb-2">
                                            Code postal
                                        </label>
                                        <input 
                                            id="registerCodePostal" 
                                            name="codePostal" 
                                            type="text" 
                                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                                            placeholder="Code postal (optionnel)"
                                            pattern="[0-9]{5}"
                                        >
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <button 
                                type="submit" 
                                id="registerSubmitBtn"
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <span id="registerSubmitText">
                                    <i class="fas fa-user-plus mr-2"></i>
                                    Créer mon compte
                                </span>
                                <div id="registerSpinner" class="hidden flex items-center justify-center">
                                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Création du compte...
                                </div>
                            </button>
                        </div>
                        
                        <!-- Footer -->
                        <div class="text-center space-y-4">
                            <p class="text-sm text-gray-600">
                                Déjà un compte ? 
                                <button 
                                    type="button"
                                    onclick="app.showPage('login')" 
                                    class="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                                >
                                    Se connecter
                                </button>
                            </p>
                            
                            <div class="pt-4 border-t border-gray-200">
                                <button 
                                    type="button"
                                    onclick="app.showPage('home')" 
                                    class="text-sm text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2 mx-auto"
                                >
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Retour à l'accueil</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}

// Global UI Manager instance
window.authUI = new AuthUIManager();

// Enhanced Form Handlers
async function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');
    const spinner = document.getElementById('loginSpinner');
    
    // Get form data
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // UI loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        console.log('🔐 Login form submitted for:', email);
        
        const result = await window.authSystem.login(email, password);
        
        if (result.success) {
            // Show success message
            if (window.app && typeof window.app.showToast === 'function') {
                window.app.showToast(result.message, 'success');
            }
            
            // Redirect to home page after short delay
            setTimeout(() => {
                if (window.app && typeof window.app.showPage === 'function') {
                    window.app.showPage('home');
                } else {
                    window.location.reload();
                }
            }, 1000);
            
        } else {
            // Show error message
            if (window.app && typeof window.app.showToast === 'function') {
                window.app.showToast(result.message, 'error');
            } else {
                alert(result.message);
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        const message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
        
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    } finally {
        // Reset UI state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const spinner = document.getElementById('registerSpinner');
    
    // Get form data
    const formData = new FormData(event.target);
    const userData = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        email: formData.get('email'),
        password: formData.get('password'),
        telephone: formData.get('telephone'),
        adresse: formData.get('adresse'),
        ville: formData.get('ville'),
        wilaya: formData.get('wilaya'),
        codePostal: formData.get('codePostal')
    };
    
    // UI loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        console.log('📝 Registration form submitted for:', userData.email);
        
        const result = await window.authSystem.register(userData);
        
        if (result.success) {
            // Show success message
            if (window.app && typeof window.app.showToast === 'function') {
                window.app.showToast(result.message, 'success');
            }
            
            // Redirect to home page after short delay
            setTimeout(() => {
                if (window.app && typeof window.app.showPage === 'function') {
                    window.app.showPage('home');
                } else {
                    window.location.reload();
                }
            }, 1000);
            
        } else {
            // Show error message
            if (window.app && typeof window.app.showToast === 'function') {
                window.app.showToast(result.message, 'error');
            } else {
                alert(result.message);
            }
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        const message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
        
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    } finally {
        // Reset UI state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// Utility function for password visibility toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId + 'Toggle');
    
    if (input && toggle) {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    }
}

// App integration for loading login/register pages
async function loadLoginPage() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = window.authUI.createLoginPage();
    }
}

async function loadRegisterPage() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = window.authUI.createRegisterPage();
    }
}

// Connect with main app when it becomes available
if (window.app) {
    window.app.loadLoginPage = loadLoginPage;
    window.app.loadRegisterPage = loadRegisterPage;
    
    // Set up auth state synchronization
    window.authSystem.onAuthChange((user) => {
        window.app.currentUser = user;
        window.app.updateUserUI();
    });
} else {
    // Wait for app to be ready
    document.addEventListener('DOMContentLoaded', () => {
        if (window.app) {
            window.app.loadLoginPage = loadLoginPage;
            window.app.loadRegisterPage = loadRegisterPage;
            
            window.authSystem.onAuthChange((user) => {
                window.app.currentUser = user;
                window.app.updateUserUI();
            });
        }
    });
}

console.log('✅ Enhanced Auth System Loaded - Aesthetic & Functional');
