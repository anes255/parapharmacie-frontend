// Simple Authentication System for Frontend

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }
    
    async init() {
        if (this.token) {
            await this.verifyToken();
        }
    }
    
    async verifyToken() {
        try {
            console.log('Verifying token...');
            const response = await apiCall('/auth/verify');
            
            if (response && response.success) {
                this.currentUser = response.user;
                console.log('✅ Token verified, user:', this.currentUser.email);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Token verification failed:', error.message);
            this.logout();
            return false;
        }
    }
    
    async login(email, password) {
        try {
            console.log('🔑 Attempting login for:', email);
            
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            console.log('Login response:', response);
            
            if (response && response.success) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Login successful:', this.currentUser.email);
                return { success: true, user: this.currentUser };
            } else {
                console.error('❌ Login failed:', response);
                return { 
                    success: false, 
                    message: response?.message || 'Échec de la connexion' 
                };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { 
                success: false, 
                message: error.message || 'Erreur de connexion au serveur' 
            };
        }
    }
    
    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (response && response.success) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Registration successful:', this.currentUser.email);
                return { success: true, user: this.currentUser };
            } else {
                return { 
                    success: false, 
                    message: response?.message || 'Échec de l\'inscription' 
                };
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { 
                success: false, 
                message: error.message || 'Erreur d\'inscription' 
            };
        }
    }
    
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        console.log('👋 User logged out');
    }
    
    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }
    
    isAdmin() {
        return this.isAuthenticated() && this.currentUser?.role === 'admin';
    }
    
    getUser() {
        return this.currentUser;
    }
    
    getToken() {
        return this.token;
    }
}

// Initialize authentication system
const auth = new AuthenticationSystem();

// Login page functionality
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">Connexion</h1>
                    <p class="text-emerald-600">Connectez-vous à votre compte</p>
                </div>
                
                <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="loginEmail" name="email" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                               placeholder="votre@email.com">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                        <input type="password" id="loginPassword" name="password" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                               placeholder="Votre mot de passe">
                    </div>
                    
                    <button type="submit" id="loginBtn" 
                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-medium">
                        <span id="loginBtnText">Se connecter</span>
                        <i id="loginSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">Pas encore de compte ?</p>
                    <button onclick="app.showPage('register')" 
                            class="text-emerald-600 hover:text-emerald-700 font-medium">
                        Créer un compte
                    </button>
                </div>
                
                <!-- Demo Login Info -->
                <div class="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 class="font-semibold text-emerald-800 mb-2">Compte de démonstration :</h3>
                    <p class="text-sm text-emerald-700 mb-1"><strong>Email:</strong> pharmaciegaher@gmail.com</p>
                    <p class="text-sm text-emerald-700"><strong>Mot de passe:</strong> anesaya75</p>
                    <button onclick="fillDemoLogin()" class="mt-2 text-xs bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600">
                        Utiliser ces identifiants
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Register page functionality
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-plus text-white text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">Inscription</h1>
                    <p class="text-emerald-600">Créez votre compte</p>
                </div>
                
                <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                            <input type="text" id="registerPrenom" name="prenom" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                            <input type="text" id="registerNom" name="nom" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="registerEmail" name="email" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                        <input type="password" id="registerPassword" name="password" required minlength="6"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input type="tel" id="registerTelephone" name="telephone" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                        <input type="text" id="registerAdresse" name="adresse" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                        <select id="registerWilaya" name="wilaya" required 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Sélectionnez votre wilaya</option>
                            <option value="Tipaza">42 - Tipaza</option>
                            <option value="Alger">16 - Alger</option>
                            <option value="Blida">09 - Blida</option>
                            <!-- Add more wilayas as needed -->
                        </select>
                    </div>
                    
                    <button type="submit" id="registerBtn" 
                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-medium">
                        <span id="registerBtnText">Créer mon compte</span>
                        <i id="registerSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">Déjà un compte ?</p>
                    <button onclick="app.showPage('login')" 
                            class="text-emerald-600 hover:text-emerald-700 font-medium">
                        Se connecter
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Global functions for form handling
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    
    // Disable button and show loading
    btn.disabled = true;
    btnText.textContent = 'Connexion...';
    spinner.classList.remove('hidden');
    
    try {
        const result = await auth.login(email, password);
        
        if (result.success) {
            // Update app user
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
            }
            
            app.showToast('Connexion réussie !', 'success');
            app.showPage('home');
        } else {
            app.showToast(result.message || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        app.showToast('Erreur de connexion', 'error');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btnText.textContent = 'Se connecter';
        spinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        password: formData.get('password'),
        telephone: formData.get('telephone'),
        adresse: formData.get('adresse'),
        wilaya: formData.get('wilaya')
    };
    
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('registerBtnText');
    const spinner = document.getElementById('registerSpinner');
    
    // Disable button and show loading
    btn.disabled = true;
    btnText.textContent = 'Création...';
    spinner.classList.remove('hidden');
    
    try {
        const result = await auth.register(userData);
        
        if (result.success) {
            // Update app user
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
            }
            
            app.showToast('Compte créé avec succès !', 'success');
            app.showPage('home');
        } else {
            app.showToast(result.message || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        app.showToast('Erreur d\'inscription', 'error');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btnText.textContent = 'Créer mon compte';
        spinner.classList.add('hidden');
    }
}

function fillDemoLogin() {
    document.getElementById('loginEmail').value = 'pharmaciegaher@gmail.com';
    document.getElementById('loginPassword').value = 'anesaya75';
}

// Update the app's checkAuth method
PharmacieGaherApp.prototype.checkAuth = async function() {
    if (auth.isAuthenticated()) {
        this.currentUser = auth.getUser();
        this.updateUserUI();
    }
};

// Export for global use
window.auth = auth;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.fillDemoLogin = fillDemoLogin;

console.log('✅ Simple authentication system loaded');
