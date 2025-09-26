// Complete PharmacieGaherApp Authentication System
class PharmacieGaherApp {
    constructor() {
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        this.currentUser = null;
        this.authToken = null;
        this.isInitialized = false;
        
        console.log('🔐 Authentication system initializing...');
        this.initAuth();
    }

    // Initialize authentication system
    async initAuth() {
        try {
            // Load stored auth data
            this.authToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('currentUser');
            
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                } catch (e) {
                    console.log('Invalid stored user data, clearing...');
                    this.clearAuth();
                }
            }

            console.log('🔐 Auth state loaded:', {
                hasToken: !!this.authToken,
                hasUser: !!this.currentUser,
                userRole: this.currentUser?.role
            });

            // Verify token if available
            if (this.authToken && this.currentUser) {
                try {
                    await this.verifyToken();
                } catch (error) {
                    console.log('🔐 Token verification failed, clearing auth');
                    this.clearAuth();
                }
            }

            this.isInitialized = true;
            this.updateAuthUI();

        } catch (error) {
            console.error('❌ Auth initialization error:', error);
            this.clearAuth();
        }
    }

    // Verify current token with API
    async verifyToken() {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.authToken,
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('✅ Token verified, user updated');
                return true;
            } else {
                throw new Error('Token verification failed');
            }
        } catch (error) {
            console.log('🔐 Token verification error:', error.message);
            throw error;
        }
    }

    // Enhanced API call with proper authentication
    async apiCall(endpoint, method = 'GET', data = null, requireAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Always add auth headers if available
            if (this.authToken || requireAuth) {
                if (!this.authToken && requireAuth) {
                    throw new Error('Authentication required but no token available');
                }
                
                if (this.authToken) {
                    headers['x-auth-token'] = this.authToken;
                    headers['Authorization'] = `Bearer ${this.authToken}`;
                }
            }

            const options = {
                method,
                headers
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            console.log(`📡 API Call: ${method} ${endpoint}`, {
                hasAuth: !!this.authToken,
                requireAuth,
                userRole: this.currentUser?.role
            });

            const response = await fetch(`${this.apiUrl}${endpoint}`, options);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Unauthorized - clearing auth and redirecting');
                    this.clearAuth();
                    throw new Error('Authentication expired');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ API Success: ${method} ${endpoint}`);
            return result;

        } catch (error) {
            console.error(`❌ API Error: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    // Login function
    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);

            const response = await fetch(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    motDePasse: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur de connexion');
            }

            const data = await response.json();
            
            // Store authentication data
            this.authToken = data.token;
            this.currentUser = data.user;
            
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            console.log('✅ Login successful:', {
                email: this.currentUser.email,
                role: this.currentUser.role
            });

            this.updateAuthUI();
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: error.message };
        }
    }

    // Register function
    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);

            const response = await fetch(`${this.apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prenom: userData.prenom,
                    nom: userData.nom,
                    email: userData.email,
                    motDePasse: userData.password,
                    telephone: userData.telephone || ''
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur d\'inscription');
            }

            const data = await response.json();
            
            // Store authentication data
            this.authToken = data.token;
            this.currentUser = data.user;
            
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            console.log('✅ Registration successful:', {
                email: this.currentUser.email,
                role: this.currentUser.role
            });

            this.updateAuthUI();
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, message: error.message };
        }
    }

    // Logout function
    logout() {
        console.log('🔐 Logging out user:', this.currentUser?.email);
        this.clearAuth();
        this.showPage('home');
    }

    // Clear authentication data
    clearAuth() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        console.log('🔐 Authentication cleared');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.authToken && this.currentUser);
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    // Update authentication UI
    updateAuthUI() {
        const authButton = document.getElementById('auth-button');
        const adminButton = document.getElementById('admin-button');
        
        if (authButton) {
            if (this.isAuthenticated()) {
                authButton.innerHTML = `
                    <div class="relative group">
                        <button class="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span>${this.currentUser.prenom} ${this.currentUser.nom}</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div class="p-2">
                                <div class="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                                    ${this.currentUser.email}
                                </div>
                                <button onclick="app.showUserProfile()" class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                                    Mon Profil
                                </button>
                                <button onclick="app.showUserOrders()" class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                                    Mes Commandes
                                </button>
                                <div class="border-t border-gray-100 mt-1 pt-1">
                                    <button onclick="app.logout()" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                authButton.innerHTML = `
                    <button onclick="app.showLogin()" class="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>Se connecter</span>
                    </button>
                `;
            }
        }

        // Show/hide admin button
        if (adminButton) {
            if (this.isAdmin()) {
                adminButton.style.display = 'block';
                adminButton.innerHTML = `
                    <button onclick="app.showPage('admin')" class="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>Administration</span>
                    </button>
                `;
            } else {
                adminButton.style.display = 'none';
            }
        }

        console.log('🎨 Auth UI updated:', {
            authenticated: this.isAuthenticated(),
            isAdmin: this.isAdmin(),
            userName: this.currentUser?.prenom
        });
    }

    // Show login modal
    showLogin() {
        const modalHTML = `
            <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-md w-full p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Connexion</h2>
                        <button onclick="document.getElementById('auth-modal').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="login-form" onsubmit="return false;">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="login-email" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                                <input type="password" id="login-password" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>
                        
                        <div id="login-error" class="mt-4 text-red-600 text-sm hidden"></div>
                        
                        <div class="mt-6 space-y-3">
                            <button type="submit" onclick="app.handleLogin()" id="login-btn"
                                    class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors">
                                Se connecter
                            </button>
                            <button type="button" onclick="app.showRegister()" 
                                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors">
                                Créer un compte
                            </button>
                        </div>
                        
                        <div class="mt-4 text-center">
                            <button type="button" onclick="app.loginAsAdmin()" 
                                    class="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">
                                Connexion administrateur
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Show register modal
    showRegister() {
        document.getElementById('auth-modal')?.remove();
        
        const modalHTML = `
            <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-md w-full p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Créer un compte</h2>
                        <button onclick="document.getElementById('auth-modal').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="register-form" onsubmit="return false;">
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                    <input type="text" id="register-prenom" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                    <input type="text" id="register-nom" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="register-email" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                <input type="tel" id="register-telephone" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                                <input type="password" id="register-password" required minlength="6"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                            </div>
                        </div>
                        
                        <div id="register-error" class="mt-4 text-red-600 text-sm hidden"></div>
                        
                        <div class="mt-6 space-y-3">
                            <button type="submit" onclick="app.handleRegister()" id="register-btn"
                                    class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors">
                                Créer mon compte
                            </button>
                            <button type="button" onclick="app.showLogin()" 
                                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors">
                                J'ai déjà un compte
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Handle login form submission
    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        if (!email || !password) {
            this.showError(errorDiv, 'Veuillez remplir tous les champs');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Connexion...';

        const result = await this.login(email, password);

        if (result.success) {
            document.getElementById('auth-modal').remove();
            this.showMessage('Connexion réussie !', 'success');
            
            // Redirect admin users to admin panel
            if (this.isAdmin()) {
                setTimeout(() => this.showPage('admin'), 1000);
            }
        } else {
            this.showError(errorDiv, result.message);
            loginBtn.disabled = false;
            loginBtn.textContent = 'Se connecter';
        }
    }

    // Handle register form submission
    async handleRegister() {
        const userData = {
            prenom: document.getElementById('register-prenom').value.trim(),
            nom: document.getElementById('register-nom').value.trim(),
            email: document.getElementById('register-email').value.trim(),
            telephone: document.getElementById('register-telephone').value.trim(),
            password: document.getElementById('register-password').value
        };
        
        const errorDiv = document.getElementById('register-error');
        const registerBtn = document.getElementById('register-btn');

        if (!userData.prenom || !userData.nom || !userData.email || !userData.password) {
            this.showError(errorDiv, 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (userData.password.length < 6) {
            this.showError(errorDiv, 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = 'Création...';

        const result = await this.register(userData);

        if (result.success) {
            document.getElementById('auth-modal').remove();
            this.showMessage('Compte créé avec succès !', 'success');
        } else {
            this.showError(errorDiv, result.message);
            registerBtn.disabled = false;
            registerBtn.textContent = 'Créer mon compte';
        }
    }

    // Quick admin login for testing
    async loginAsAdmin() {
        console.log('🔐 Quick admin login...');
        
        // Try to login as admin with default credentials
        const result = await this.login('admin@pharmaciegaher.com', 'admin123');
        
        if (result.success) {
            document.getElementById('auth-modal').remove();
            this.showMessage('Connexion administrateur réussie !', 'success');
            setTimeout(() => this.showPage('admin'), 1000);
        } else {
            // If no admin exists, create one locally for demo
            this.authToken = 'demo_admin_token_' + Date.now();
            this.currentUser = {
                _id: 'demo_admin_id',
                prenom: 'Admin',
                nom: 'Pharmacie',
                email: 'admin@pharmaciegaher.com',
                role: 'admin'
            };
            
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            document.getElementById('auth-modal').remove();
            this.updateAuthUI();
            this.showMessage('Connexion administrateur (mode démonstration)', 'success');
            setTimeout(() => this.showPage('admin'), 1000);
        }
    }

    // Show error in form
    showError(errorDiv, message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    // Show success/error messages
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

// Ensure global availability
if (typeof window !== 'undefined') {
    window.PharmacieGaherApp = PharmacieGaherApp;
}

console.log('✅ Complete authentication system loaded');
