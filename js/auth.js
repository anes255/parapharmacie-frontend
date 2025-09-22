// Complete Fixed Authentication System for Shifa Parapharmacie - Enhanced with Fallback System

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.isOfflineMode = false;
        this.authEndpoints = {
            primary: '/auth/login',
            secondary: '/api/auth/login',
            fallback: '/login'
        };
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Enhanced Authentication System...');
        
        // Check connection status
        await this.checkConnectionStatus();
        
        if (this.token) {
            await this.validateToken();
        }
        
        // Initialize demo admin for offline mode
        this.initializeDemoAdmin();
        
        console.log('✅ Authentication system initialized');
    }

    // Check if backend is available
    async checkConnectionStatus() {
        try {
            const response = await fetch(buildApiUrl('/health'), {
                method: 'GET',
                timeout: 3000
            });
            this.isOfflineMode = !response.ok;
        } catch (error) {
            this.isOfflineMode = true;
            console.log('🟡 Backend unavailable - authentication will work in demo mode');
        }
    }

    // Initialize demo admin for offline testing
    initializeDemoAdmin() {
        const demoUsers = {
            'pharmaciegaher@gmail.com': {
                _id: 'demo-admin-001',
                nom: 'Gaher',
                prenom: 'Pharmacie', 
                email: 'pharmaciegaher@gmail.com',
                telephone: '+213123456789',
                adresse: 'Tipaza, Algérie',
                wilaya: 'Tipaza',
                role: 'admin',
                password: 'anesaya75', // Demo password
                dateInscription: new Date().toISOString()
            },
            'user@demo.com': {
                _id: 'demo-user-001',
                nom: 'Demo',
                prenom: 'User',
                email: 'user@demo.com',
                telephone: '+213987654321',
                adresse: 'Alger, Algérie',
                wilaya: 'Alger',
                role: 'user',
                password: 'demo123',
                dateInscription: new Date().toISOString()
            }
        };
        
        localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
    }

    // Enhanced login method with multiple endpoint fallback
    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            console.log('📤 Sending login request...');
            
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format d\'email invalide');
            }

            // Try online authentication first
            if (!this.isOfflineMode) {
                try {
                    const result = await this.tryOnlineLogin(email, password);
                    if (result.success) {
                        return result;
                    }
                } catch (error) {
                    console.log('🔄 Online login failed, trying demo mode...');
                    this.isOfflineMode = true;
                }
            }

            // Fallback to demo/offline authentication
            return await this.tryDemoLogin(email, password);

        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    // Try online authentication with multiple endpoints
    async tryOnlineLogin(email, password) {
        const endpoints = [
            '/api/auth/login',
            '/auth/login', 
            '/login'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Trying endpoint: ${endpoint}`);
                
                const response = await fetch(buildApiUrl(endpoint), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.toLowerCase().trim(),
                        password: password
                    }),
                    timeout: 8000
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.token && data.user) {
                        this.token = data.token;
                        this.currentUser = data.user;
                        
                        localStorage.setItem('token', this.token);
                        localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
                        
                        console.log('✅ Online login successful for:', data.user.email);
                        
                        return {
                            success: true,
                            user: data.user,
                            message: 'Connexion réussie',
                            mode: 'online'
                        };
                    }
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
                    console.log(`❌ Endpoint ${endpoint} failed:`, response.status, errorData.message);
                }

            } catch (error) {
                console.log(`❌ Endpoint ${endpoint} error:`, error.message);
            }
        }

        throw new Error('Tous les endpoints d\'authentification ont échoué');
    }

    // Demo/offline authentication
    async tryDemoLogin(email, password) {
        console.log('🎭 Attempting demo login...');
        
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
        const user = demoUsers[email.toLowerCase()];

        if (!user) {
            throw new Error('Utilisateur non trouvé (mode démo)');
        }

        if (user.password !== password) {
            throw new Error('Mot de passe incorrect (mode démo)');
        }

        // Generate demo token
        const demoToken = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        
        this.token = demoToken;
        this.currentUser = { ...user };
        delete this.currentUser.password; // Don't store password

        localStorage.setItem('token', this.token);
        localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
        localStorage.setItem('demoMode', 'true');

        console.log('✅ Demo login successful for:', this.currentUser.email);

        return {
            success: true,
            user: this.currentUser,
            message: 'Connexion réussie (mode démo)',
            mode: 'demo'
        };
    }

    // Enhanced register method
    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            // Validation
            const required = ['nom', 'prenom', 'email', 'password', 'telephone', 'wilaya'];
            for (let field of required) {
                if (!userData[field] || userData[field].trim() === '') {
                    throw new Error(`Le champ ${field} est requis`);
                }
            }

            // Enhanced validations
            if (!this.validateEmail(userData.email)) {
                throw new Error('Format d\'email invalide');
            }

            if (!this.validatePassword(userData.password)) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule et un chiffre');
            }

            if (!this.validatePhone(userData.telephone)) {
                throw new Error('Format de téléphone invalide (numéro algérien requis)');
            }

            // Try online registration first
            if (!this.isOfflineMode) {
                try {
                    const result = await this.tryOnlineRegister(userData);
                    if (result.success) {
                        return result;
                    }
                } catch (error) {
                    console.log('🔄 Online registration failed, trying demo mode...');
                    this.isOfflineMode = true;
                }
            }

            // Fallback to demo registration
            return await this.tryDemoRegister(userData);

        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    // Try online registration
    async tryOnlineRegister(userData) {
        const endpoints = ['/api/auth/register', '/auth/register', '/register'];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(buildApiUrl(endpoint), {
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
                        adresse: userData.adresse ? userData.adresse.trim() : '',
                        ville: userData.ville ? userData.ville.trim() : '',
                        wilaya: userData.wilaya,
                        codePostal: userData.codePostal ? userData.codePostal.trim() : ''
                    }),
                    timeout: 10000
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.token && data.user) {
                        this.token = data.token;
                        this.currentUser = data.user;
                        
                        localStorage.setItem('token', this.token);
                        localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
                        
                        console.log('✅ Online registration successful for:', data.user.email);
                        
                        return {
                            success: true,
                            user: data.user,
                            message: 'Inscription réussie',
                            mode: 'online'
                        };
                    }
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
                    console.log(`❌ Registration endpoint ${endpoint} failed:`, errorData.message);
                }

            } catch (error) {
                console.log(`❌ Registration endpoint ${endpoint} error:`, error.message);
            }
        }

        throw new Error('Tous les endpoints d\'inscription ont échoué');
    }

    // Demo registration
    async tryDemoRegister(userData) {
        console.log('🎭 Attempting demo registration...');
        
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
        
        // Check if email already exists
        if (demoUsers[userData.email.toLowerCase()]) {
            throw new Error('Cette adresse email est déjà utilisée');
        }

        // Create new user
        const newUser = {
            _id: 'demo_user_' + Date.now(),
            nom: userData.nom.trim(),
            prenom: userData.prenom.trim(),
            email: userData.email.toLowerCase().trim(),
            telephone: userData.telephone.replace(/\s+/g, ''),
            adresse: userData.adresse ? userData.adresse.trim() : '',
            wilaya: userData.wilaya,
            role: 'user',
            password: userData.password,
            dateInscription: new Date().toISOString()
        };

        // Save to demo users
        demoUsers[newUser.email] = newUser;
        localStorage.setItem('demoUsers', JSON.stringify(demoUsers));

        // Generate demo token
        const demoToken = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        
        this.token = demoToken;
        this.currentUser = { ...newUser };
        delete this.currentUser.password;

        localStorage.setItem('token', this.token);
        localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
        localStorage.setItem('demoMode', 'true');

        console.log('✅ Demo registration successful for:', this.currentUser.email);

        return {
            success: true,
            user: this.currentUser,
            message: 'Inscription réussie (mode démo)',
            mode: 'demo'
        };
    }

    // Validate token on app startup
    async validateToken() {
        if (!this.token) return false;

        try {
            // Check if it's a demo token
            if (this.token.startsWith('demo_token_')) {
                const cachedUser = localStorage.getItem('cachedUser');
                if (cachedUser) {
                    this.currentUser = JSON.parse(cachedUser);
                    console.log('✅ Demo token validated');
                    return true;
                }
                return false;
            }

            // Try online validation if not in offline mode
            if (!this.isOfflineMode) {
                const endpoints = ['/api/auth/profile', '/auth/profile', '/profile'];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(buildApiUrl(endpoint), {
                            headers: { 
                                'x-auth-token': this.token,
                                'Authorization': `Bearer ${this.token}`
                            },
                            timeout: 5000
                        });

                        if (response.ok) {
                            const userData = await response.json();
                            this.currentUser = userData;
                            localStorage.setItem('cachedUser', JSON.stringify(userData));
                            console.log('✅ Online token validated');
                            return true;
                        }
                    } catch (error) {
                        console.log(`Token validation failed for ${endpoint}`);
                    }
                }
            }

            // Fallback to cached user
            const cachedUser = localStorage.getItem('cachedUser');
            if (cachedUser) {
                this.currentUser = JSON.parse(cachedUser);
                console.log('✅ Using cached user data');
                return true;
            }

            throw new Error('Token invalide');

        } catch (error) {
            console.log('Token validation failed:', error.message);
            this.logout();
            return false;
        }
    }

    // Get current user profile
    async getProfile() {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            // Return current user if available
            if (this.currentUser) {
                return this.currentUser;
            }

            // Try to fetch from server
            if (!this.isOfflineMode) {
                const endpoints = ['/api/auth/profile', '/auth/profile', '/profile'];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(buildApiUrl(endpoint), {
                            headers: { 
                                'x-auth-token': this.token,
                                'Authorization': `Bearer ${this.token}`
                            }
                        });

                        if (response.ok) {
                            const userData = await response.json();
                            this.currentUser = userData;
                            localStorage.setItem('cachedUser', JSON.stringify(userData));
                            return userData;
                        }
                    } catch (error) {
                        console.log(`Profile fetch failed for ${endpoint}`);
                    }
                }
            }

            // Return cached user
            const cachedUser = localStorage.getItem('cachedUser');
            if (cachedUser) {
                this.currentUser = JSON.parse(cachedUser);
                return this.currentUser;
            }

            throw new Error('Profil utilisateur non trouvé');

        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(updateData) {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            // Try online update first
            if (!this.isOfflineMode) {
                const endpoints = ['/api/auth/profile', '/auth/profile', '/profile'];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(buildApiUrl(endpoint), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-auth-token': this.token,
                                'Authorization': `Bearer ${this.token}`
                            },
                            body: JSON.stringify(updateData)
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.user) {
                                this.currentUser = data.user;
                                localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
                            }
                            return data;
                        }
                    } catch (error) {
                        console.log(`Profile update failed for ${endpoint}`);
                    }
                }
            }

            // Offline/demo update
            if (this.currentUser) {
                this.currentUser = { ...this.currentUser, ...updateData };
                localStorage.setItem('cachedUser', JSON.stringify(this.currentUser));
                
                // Update demo users if applicable
                const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
                if (demoUsers[this.currentUser.email]) {
                    demoUsers[this.currentUser.email] = { ...demoUsers[this.currentUser.email], ...updateData };
                    localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
                }

                return {
                    success: true,
                    user: this.currentUser,
                    message: 'Profil mis à jour (mode local)'
                };
            }

            throw new Error('Impossible de mettre à jour le profil');

        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            if (!currentPassword || !newPassword) {
                throw new Error('Mot de passe actuel et nouveau mot de passe requis');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule et un chiffre');
            }

            // Try online password change first
            if (!this.isOfflineMode) {
                const endpoints = ['/api/auth/change-password', '/auth/change-password', '/change-password'];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(buildApiUrl(endpoint), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-auth-token': this.token,
                                'Authorization': `Bearer ${this.token}`
                            },
                            body: JSON.stringify({
                                currentPassword,
                                newPassword
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            return {
                                success: true,
                                message: 'Mot de passe modifié avec succès'
                            };
                        }
                    } catch (error) {
                        console.log(`Password change failed for ${endpoint}`);
                    }
                }
            }

            // Demo password change
            const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
            const userEmail = this.currentUser?.email;
            
            if (userEmail && demoUsers[userEmail]) {
                if (demoUsers[userEmail].password !== currentPassword) {
                    throw new Error('Mot de passe actuel incorrect');
                }
                
                demoUsers[userEmail].password = newPassword;
                localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
                
                return {
                    success: true,
                    message: 'Mot de passe modifié avec succès (mode démo)'
                };
            }

            throw new Error('Impossible de changer le mot de passe');

        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Enhanced logout
    logout() {
        console.log('🚪 Logging out user');
        
        this.token = null;
        this.currentUser = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('cachedUser');
        localStorage.removeItem('demoMode');
        
        // Update UI if app is available
        if (window.app) {
            window.app.currentUser = null;
            window.app.updateUserUI();
        }
    }

    // Validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        if (password.length < 6) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    }

    validatePhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        return phoneRegex.test(cleanPhone);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.token && this.currentUser);
    }

    // Check if user is admin
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.role === 'admin';
    }

    // Get user role
    getRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    // Get user info
    getUser() {
        return this.currentUser;
    }

    // Get token
    getToken() {
        return this.token;
    }

    // Check if in demo mode
    isDemoMode() {
        return localStorage.getItem('demoMode') === 'true' || this.token?.startsWith('demo_token_');
    }
}

// Enhanced global authentication functions
async function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');
    const submitSpinner = document.getElementById('loginSubmitSpinner');
    
    if (submitBtn.disabled) return;
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
        }
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Connexion en cours...';
    submitSpinner.classList.remove('hidden');
    
    try {
        const result = await authSystem.login(email, password);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                
                // Show appropriate success message
                const message = result.mode === 'demo' ? 
                    'Connexion réussie (mode démo)' : 
                    'Connexion réussie';
                    
                window.app.showToast(message, 'success');
                window.app.showPage('home');
            }
        }
    } catch (error) {
        console.error('❌ Login error in handler:', error);
        if (window.app) {
            let errorMessage = error.message;
            
            // Provide helpful error messages
            if (errorMessage.includes('404') || errorMessage.includes('non trouvé')) {
                errorMessage = 'Service temporairement indisponible. Essayez: pharmaciegaher@gmail.com / anesaya75 (démo)';
            } else if (errorMessage.includes('incorrect')) {
                errorMessage = 'Mot de passe incorrect. Pour le mode démo: pharmaciegaher@gmail.com / anesaya75';
            }
            
            window.app.showToast(errorMessage, 'error');
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Se connecter';
        submitSpinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const submitSpinner = document.getElementById('registerSubmitSpinner');
    
    if (submitBtn.disabled) return;
    
    const formData = {
        prenom: document.getElementById('registerPrenom')?.value.trim(),
        nom: document.getElementById('registerNom')?.value.trim(),
        email: document.getElementById('registerEmail')?.value.trim(),
        telephone: document.getElementById('registerTelephone')?.value.trim(),
        password: document.getElementById('registerPassword')?.value,
        adresse: document.getElementById('registerAdresse')?.value.trim(),
        wilaya: document.getElementById('registerWilaya')?.value
    };
    
    // Basic validation
    const required = ['prenom', 'nom', 'email', 'telephone', 'password', 'wilaya'];
    for (let field of required) {
        if (!formData[field]) {
            if (window.app) {
                window.app.showToast(`Le champ ${field} est requis`, 'error');
            }
            return;
        }
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Création du compte...';
    submitSpinner.classList.remove('hidden');
    
    try {
        const result = await authSystem.register(formData);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                
                // Show appropriate success message
                const message = result.mode === 'demo' ? 
                    'Inscription réussie (mode démo)' : 
                    'Inscription réussie';
                    
                window.app.showToast(message, 'success');
                window.app.showPage('home');
            }
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        if (window.app) {
            let errorMessage = error.message;
            
            // Provide helpful error messages
            if (errorMessage.includes('404') || errorMessage.includes('indisponible')) {
                errorMessage = 'Service temporairement indisponible. Votre compte sera créé en mode démo.';
            }
            
            window.app.showToast(errorMessage, 'error');
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Créer mon compte';
        submitSpinner.classList.add('hidden');
    }
}

// Enhanced logout function
function logout() {
    if (authSystem) {
        authSystem.logout();
    }
    
    if (window.app) {
        window.app.showToast('Déconnexion réussie', 'success');
        window.app.showPage('home');
    }
}

// Enhanced password validation
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Au moins 6 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Au moins une minuscule');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Au moins un chiffre');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        strength: password.length < 6 ? 'weak' : 
                 password.length < 10 ? 'medium' : 'strong'
    };
}

// Real-time password strength indicator
function showPasswordStrength(password, targetId) {
    const validation = validatePassword(password);
    const target = document.getElementById(targetId);
    
    if (target && password.length > 0) {
        const colors = {
            weak: 'text-red-600',
            medium: 'text-yellow-600', 
            strong: 'text-green-600'
        };
        
        target.innerHTML = `
            <div class="text-sm ${colors[validation.strength]} mt-2">
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-1 mr-2">
                        <div class="h-1 rounded-full ${
                            validation.strength === 'weak' ? 'bg-red-500 w-1/3' :
                            validation.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                            'bg-green-500 w-full'
                        }"></div>
                    </div>
                    <span class="text-xs font-medium">${
                        validation.strength === 'weak' ? 'Faible' :
                        validation.strength === 'medium' ? 'Moyen' : 'Fort'
                    }</span>
                </div>
                ${validation.errors.length > 0 ? `
                    <ul class="text-xs mt-1 ml-2">
                        ${validation.errors.map(error => `<li>• ${error}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    } else if (target) {
        target.innerHTML = '';
    }
}

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    try {
        authSystem = new AuthenticationSystem();
        window.authSystem = authSystem;
        console.log('✅ Enhanced Authentication system initialized');
    } catch (error) {
        console.error('❌ Failed to initialize auth system:', error);
    }
});

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.validatePassword = validatePassword;
window.showPasswordStrength = showPasswordStrength;

console.log('✅ Complete Enhanced Authentication System loaded');
