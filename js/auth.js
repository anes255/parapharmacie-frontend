// Beautiful and Secure Authentication System

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
            console.log('🔍 Verifying token...');
            const response = await apiCall('/auth/verify');
            
            if (response && response.success) {
                this.currentUser = response.user;
                console.log('✅ Token verified for user:', this.currentUser.email);
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
            console.log('🔑 Attempting login...');
            
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (response && response.success) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Login successful for:', this.currentUser.email);
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
                message: 'Impossible de se connecter au serveur. Vérifiez votre connexion.' 
            };
        }
    }
    
    async register(userData) {
        try {
            console.log('📝 Attempting registration...');
            
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (response && response.success) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Registration successful for:', this.currentUser.email);
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
                message: 'Impossible de créer le compte. Vérifiez votre connexion.' 
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

// Beautiful Login Page - matches site design
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <!-- Hero Section with Gradient Background -->
        <section class="min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20"></div>
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
            
            <div class="container mx-auto px-4 py-8 relative z-10">
                <div class="min-h-screen flex items-center justify-center">
                    <div class="w-full max-w-md">
                        <!-- Logo Section -->
                        <div class="text-center mb-8">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-white/30 shadow-2xl">
                                <i class="fas fa-seedling text-white text-3xl drop-shadow-lg"></i>
                            </div>
                            <h1 class="text-4xl font-bold text-white drop-shadow-md mb-2">Bienvenue</h1>
                            <p class="text-emerald-100 text-lg">Connectez-vous à votre compte Shifa</p>
                        </div>
                        
                        <!-- Login Form -->
                        <div class="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                            <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                                <div>
                                    <label class="block text-sm font-semibold text-white mb-3">
                                        <i class="fas fa-envelope mr-2"></i>Adresse email
                                    </label>
                                    <input type="email" id="loginEmail" name="email" required 
                                           class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                           placeholder="votre@email.com">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-white mb-3">
                                        <i class="fas fa-lock mr-2"></i>Mot de passe
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="loginPassword" name="password" required 
                                               class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                               placeholder="••••••••">
                                        <button type="button" onclick="togglePassword('loginPassword')" 
                                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-200 hover:text-white transition-colors">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <button type="submit" id="loginBtn" 
                                        class="w-full bg-white text-emerald-600 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center">
                                    <span id="loginBtnText">
                                        <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                                    </span>
                                    <i id="loginSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </form>
                            
                            <!-- Divider -->
                            <div class="relative my-8">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-white/30"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white/10 text-emerald-100 rounded-full">ou</span>
                                </div>
                            </div>
                            
                            <!-- Register Link -->
                            <div class="text-center">
                                <p class="text-emerald-100 mb-4">Pas encore de compte ?</p>
                                <button onclick="app.showPage('register')" 
                                        class="bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/50 text-white px-8 py-3 rounded-xl hover:bg-emerald-400/40 transition-all duration-300 font-semibold">
                                    <i class="fas fa-user-plus mr-2"></i>Créer un compte
                                </button>
                            </div>
                        </div>
                        
                        <!-- Back to Home -->
                        <div class="text-center mt-8">
                            <button onclick="app.showPage('home')" 
                                    class="text-white/80 hover:text-white transition-colors font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

// Beautiful Register Page - matches site design  
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <!-- Hero Section with Gradient Background -->
        <section class="min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20"></div>
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
            
            <div class="container mx-auto px-4 py-8 relative z-10">
                <div class="min-h-screen flex items-center justify-center">
                    <div class="w-full max-w-2xl">
                        <!-- Logo Section -->
                        <div class="text-center mb-8">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-white/30 shadow-2xl">
                                <i class="fas fa-user-plus text-white text-3xl drop-shadow-lg"></i>
                            </div>
                            <h1 class="text-4xl font-bold text-white drop-shadow-md mb-2">Rejoignez-nous</h1>
                            <p class="text-emerald-100 text-lg">Créez votre compte Shifa Parapharmacie</p>
                        </div>
                        
                        <!-- Register Form -->
                        <div class="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                            <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                                <!-- Name Fields -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-white mb-3">
                                            <i class="fas fa-user mr-2"></i>Prénom
                                        </label>
                                        <input type="text" id="registerPrenom" name="prenom" required 
                                               class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                               placeholder="Votre prénom">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-white mb-3">
                                            <i class="fas fa-user mr-2"></i>Nom
                                        </label>
                                        <input type="text" id="registerNom" name="nom" required 
                                               class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                               placeholder="Votre nom">
                                    </div>
                                </div>
                                
                                <!-- Email -->
                                <div>
                                    <label class="block text-sm font-semibold text-white mb-3">
                                        <i class="fas fa-envelope mr-2"></i>Adresse email
                                    </label>
                                    <input type="email" id="registerEmail" name="email" required 
                                           class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                           placeholder="votre@email.com">
                                </div>
                                
                                <!-- Password -->
                                <div>
                                    <label class="block text-sm font-semibold text-white mb-3">
                                        <i class="fas fa-lock mr-2"></i>Mot de passe
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="registerPassword" name="password" required minlength="6"
                                               class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                               placeholder="Minimum 6 caractères">
                                        <button type="button" onclick="togglePassword('registerPassword')" 
                                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-200 hover:text-white transition-colors">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Contact Fields -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-white mb-3">
                                            <i class="fas fa-phone mr-2"></i>Téléphone
                                        </label>
                                        <input type="tel" id="registerTelephone" name="telephone" required 
                                               class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300"
                                               placeholder="+213 123 456 789">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-white mb-3">
                                            <i class="fas fa-map-marker-alt mr-2"></i>Wilaya
                                        </label>
                                        <select id="registerWilaya" name="wilaya" required 
                                                class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white transition-all duration-300">
                                            <option value="" class="text-gray-800">Sélectionnez votre wilaya</option>
                                            <option value="Adrar" class="text-gray-800">01 - Adrar</option>
                                            <option value="Chlef" class="text-gray-800">02 - Chlef</option>
                                            <option value="Laghouat" class="text-gray-800">03 - Laghouat</option>
                                            <option value="Oum El Bouaghi" class="text-gray-800">04 - Oum El Bouaghi</option>
                                            <option value="Batna" class="text-gray-800">05 - Batna</option>
                                            <option value="Béjaïa" class="text-gray-800">06 - Béjaïa</option>
                                            <option value="Biskra" class="text-gray-800">07 - Biskra</option>
                                            <option value="Béchar" class="text-gray-800">08 - Béchar</option>
                                            <option value="Blida" class="text-gray-800">09 - Blida</option>
                                            <option value="Bouira" class="text-gray-800">10 - Bouira</option>
                                            <option value="Tamanrasset" class="text-gray-800">11 - Tamanrasset</option>
                                            <option value="Tébessa" class="text-gray-800">12 - Tébessa</option>
                                            <option value="Tlemcen" class="text-gray-800">13 - Tlemcen</option>
                                            <option value="Tiaret" class="text-gray-800">14 - Tiaret</option>
                                            <option value="Tizi Ouzou" class="text-gray-800">15 - Tizi Ouzou</option>
                                            <option value="Alger" class="text-gray-800">16 - Alger</option>
                                            <option value="Djelfa" class="text-gray-800">17 - Djelfa</option>
                                            <option value="Jijel" class="text-gray-800">18 - Jijel</option>
                                            <option value="Sétif" class="text-gray-800">19 - Sétif</option>
                                            <option value="Saïda" class="text-gray-800">20 - Saïda</option>
                                            <option value="Skikda" class="text-gray-800">21 - Skikda</option>
                                            <option value="Sidi Bel Abbès" class="text-gray-800">22 - Sidi Bel Abbès</option>
                                            <option value="Annaba" class="text-gray-800">23 - Annaba</option>
                                            <option value="Guelma" class="text-gray-800">24 - Guelma</option>
                                            <option value="Constantine" class="text-gray-800">25 - Constantine</option>
                                            <option value="Médéa" class="text-gray-800">26 - Médéa</option>
                                            <option value="Mostaganem" class="text-gray-800">27 - Mostaganem</option>
                                            <option value="M'Sila" class="text-gray-800">28 - M'Sila</option>
                                            <option value="Mascara" class="text-gray-800">29 - Mascara</option>
                                            <option value="Ouargla" class="text-gray-800">30 - Ouargla</option>
                                            <option value="Oran" class="text-gray-800">31 - Oran</option>
                                            <option value="El Bayadh" class="text-gray-800">32 - El Bayadh</option>
                                            <option value="Illizi" class="text-gray-800">33 - Illizi</option>
                                            <option value="Bordj Bou Arréridj" class="text-gray-800">34 - Bordj Bou Arréridj</option>
                                            <option value="Boumerdès" class="text-gray-800">35 - Boumerdès</option>
                                            <option value="El Tarf" class="text-gray-800">36 - El Tarf</option>
                                            <option value="Tindouf" class="text-gray-800">37 - Tindouf</option>
                                            <option value="Tissemsilt" class="text-gray-800">38 - Tissemsilt</option>
                                            <option value="El Oued" class="text-gray-800">39 - El Oued</option>
                                            <option value="Khenchela" class="text-gray-800">40 - Khenchela</option>
                                            <option value="Souk Ahras" class="text-gray-800">41 - Souk Ahras</option>
                                            <option value="Tipaza" class="text-gray-800">42 - Tipaza</option>
                                            <option value="Mila" class="text-gray-800">43 - Mila</option>
                                            <option value="Aïn Defla" class="text-gray-800">44 - Aïn Defla</option>
                                            <option value="Naâma" class="text-gray-800">45 - Naâma</option>
                                            <option value="Aïn Témouchent" class="text-gray-800">46 - Aïn Témouchent</option>
                                            <option value="Ghardaïa" class="text-gray-800">47 - Ghardaïa</option>
                                            <option value="Relizane" class="text-gray-800">48 - Relizane</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Address -->
                                <div>
                                    <label class="block text-sm font-semibold text-white mb-3">
                                        <i class="fas fa-home mr-2"></i>Adresse complète
                                    </label>
                                    <textarea id="registerAdresse" name="adresse" required rows="2"
                                              class="w-full px-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/50 text-white placeholder-emerald-200 transition-all duration-300 resize-none"
                                              placeholder="Votre adresse complète"></textarea>
                                </div>
                                
                                <button type="submit" id="registerBtn" 
                                        class="w-full bg-white text-emerald-600 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center">
                                    <span id="registerBtnText">
                                        <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                                    </span>
                                    <i id="registerSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </form>
                            
                            <!-- Divider -->
                            <div class="relative my-8">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-white/30"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white/10 text-emerald-100 rounded-full">ou</span>
                                </div>
                            </div>
                            
                            <!-- Login Link -->
                            <div class="text-center">
                                <p class="text-emerald-100 mb-4">Déjà un compte ?</p>
                                <button onclick="app.showPage('login')" 
                                        class="bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/50 text-white px-8 py-3 rounded-xl hover:bg-emerald-400/40 transition-all duration-300 font-semibold">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                                </button>
                            </div>
                        </div>
                        
                        <!-- Back to Home -->
                        <div class="text-center mt-8">
                            <button onclick="app.showPage('home')" 
                                    class="text-white/80 hover:text-white transition-colors font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

// Form handling functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        app.showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    
    // Disable button and show loading
    btn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const result = await auth.login(email, password);
        
        if (result.success) {
            // Update app user
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
            }
            
            app.showToast(`Bienvenue ${result.user.prenom} !`, 'success');
            
            // Redirect based on user role
            if (result.user.role === 'admin') {
                app.showPage('admin');
            } else {
                app.showPage('home');
            }
        } else {
            app.showToast(result.message || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        app.showToast('Une erreur est survenue lors de la connexion', 'error');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        prenom: formData.get('prenom')?.trim(),
        nom: formData.get('nom')?.trim(),
        email: formData.get('email')?.trim(),
        password: formData.get('password'),
        telephone: formData.get('telephone')?.trim(),
        adresse: formData.get('adresse')?.trim(),
        wilaya: formData.get('wilaya')
    };
    
    // Validation
    if (!userData.prenom || !userData.nom || !userData.email || !userData.password || 
        !userData.telephone || !userData.adresse || !userData.wilaya) {
        app.showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (userData.password.length < 6) {
        app.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('registerBtnText');
    const spinner = document.getElementById('registerSpinner');
    
    // Disable button and show loading
    btn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const result = await auth.register(userData);
        
        if (result.success) {
            // Update app user
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
            }
            
            app.showToast(`Compte créé avec succès ! Bienvenue ${result.user.prenom} !`, 'success');
            app.showPage('home');
        } else {
            app.showToast(result.message || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        app.showToast('Une erreur est survenue lors de l\'inscription', 'error');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// Utility function to toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
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
window.togglePassword = togglePassword;

console.log('✅ Beautiful and secure authentication system loaded');
