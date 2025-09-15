// Beautiful and Aesthetic Authentication System

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

// Aesthetic Login Page - Modern and Beautiful
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <!-- Modern Aesthetic Login -->
        <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
            <!-- Animated Background Elements -->
            <div class="absolute inset-0">
                <div class="absolute top-20 left-20 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
            </div>
            
            <!-- Subtle Grid Pattern -->
            <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0); background-size: 40px 40px;"></div>
            
            <div class="container mx-auto px-4 py-8 relative z-10">
                <div class="min-h-screen flex items-center justify-center">
                    <div class="w-full max-w-md">
                        <!-- Logo Section -->
                        <div class="text-center mb-10">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                                <i class="fas fa-seedling text-white text-3xl"></i>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent mb-3">
                                Bienvenue
                            </h1>
                            <p class="text-slate-600 text-lg font-medium">Connectez-vous à votre espace Shifa</p>
                        </div>
                        
                        <!-- Login Card -->
                        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500">
                            <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-slate-700">
                                        <i class="fas fa-envelope mr-2 text-emerald-600"></i>Adresse email
                                    </label>
                                    <input type="email" id="loginEmail" name="email" required 
                                           class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                           placeholder="votre@email.com">
                                </div>
                                
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-slate-700">
                                        <i class="fas fa-lock mr-2 text-emerald-600"></i>Mot de passe
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="loginPassword" name="password" required 
                                               class="w-full px-4 py-4 pr-12 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                               placeholder="••••••••">
                                        <button type="button" onclick="togglePassword('loginPassword')" 
                                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Login Button -->
                                <button type="submit" id="loginBtn" 
                                        class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center">
                                    <span id="loginBtnText">
                                        <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                                    </span>
                                    <i id="loginSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </form>
                            
                            <!-- Divider -->
                            <div class="relative my-8">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-slate-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white/80 text-slate-500 rounded-full font-medium">ou</span>
                                </div>
                            </div>
                            
                            <!-- Register Link -->
                            <div class="text-center space-y-4">
                                <p class="text-slate-600">Pas encore de compte ?</p>
                                <button onclick="app.showPage('register')" 
                                        class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 hover:border-slate-300 px-8 py-3 rounded-xl transition-all duration-300 font-semibold">
                                    <i class="fas fa-user-plus mr-2"></i>Créer un compte
                                </button>
                            </div>
                        </div>
                        
                        <!-- Back to Home -->
                        <div class="text-center mt-8">
                            <button onclick="app.showPage('home')" 
                                    class="text-slate-500 hover:text-emerald-600 transition-colors font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

// Aesthetic Register Page
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <!-- Modern Aesthetic Register -->
        <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
            <!-- Animated Background Elements -->
            <div class="absolute inset-0">
                <div class="absolute top-20 left-20 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
            </div>
            
            <!-- Subtle Grid Pattern -->
            <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0); background-size: 40px 40px;"></div>
            
            <div class="container mx-auto px-4 py-8 relative z-10">
                <div class="min-h-screen flex items-center justify-center">
                    <div class="w-full max-w-2xl">
                        <!-- Logo Section -->
                        <div class="text-center mb-10">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                                <i class="fas fa-user-plus text-white text-3xl"></i>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent mb-3">
                                Rejoignez-nous
                            </h1>
                            <p class="text-slate-600 text-lg font-medium">Créez votre compte Shifa Parapharmacie</p>
                        </div>
                        
                        <!-- Register Card -->
                        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500">
                            <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                                <!-- Name Fields -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-slate-700">
                                            <i class="fas fa-user mr-2 text-emerald-600"></i>Prénom
                                        </label>
                                        <input type="text" id="registerPrenom" name="prenom" required 
                                               class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                               placeholder="Votre prénom">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-slate-700">
                                            <i class="fas fa-user mr-2 text-emerald-600"></i>Nom
                                        </label>
                                        <input type="text" id="registerNom" name="nom" required 
                                               class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                               placeholder="Votre nom">
                                    </div>
                                </div>
                                
                                <!-- Email -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-slate-700">
                                        <i class="fas fa-envelope mr-2 text-emerald-600"></i>Adresse email
                                    </label>
                                    <input type="email" id="registerEmail" name="email" required 
                                           class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                           placeholder="votre@email.com">
                                </div>
                                
                                <!-- Password -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-slate-700">
                                        <i class="fas fa-lock mr-2 text-emerald-600"></i>Mot de passe
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="registerPassword" name="password" required minlength="6"
                                               class="w-full px-4 py-4 pr-12 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                               placeholder="Minimum 6 caractères">
                                        <button type="button" onclick="togglePassword('registerPassword')" 
                                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Contact Fields -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-slate-700">
                                            <i class="fas fa-phone mr-2 text-emerald-600"></i>Téléphone
                                        </label>
                                        <input type="tel" id="registerTelephone" name="telephone" required 
                                               class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white"
                                               placeholder="+213 123 456 789">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-slate-700">
                                            <i class="fas fa-map-marker-alt mr-2 text-emerald-600"></i>Wilaya
                                        </label>
                                        <select id="registerWilaya" name="wilaya" required 
                                                class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 transition-all duration-300 hover:bg-white">
                                            <option value="">Sélectionnez votre wilaya</option>
                                            <option value="Adrar">01 - Adrar</option>
                                            <option value="Chlef">02 - Chlef</option>
                                            <option value="Laghouat">03 - Laghouat</option>
                                            <option value="Oum El Bouaghi">04 - Oum El Bouaghi</option>
                                            <option value="Batna">05 - Batna</option>
                                            <option value="Béjaïa">06 - Béjaïa</option>
                                            <option value="Biskra">07 - Biskra</option>
                                            <option value="Béchar">08 - Béchar</option>
                                            <option value="Blida">09 - Blida</option>
                                            <option value="Bouira">10 - Bouira</option>
                                            <option value="Tamanrasset">11 - Tamanrasset</option>
                                            <option value="Tébessa">12 - Tébessa</option>
                                            <option value="Tlemcen">13 - Tlemcen</option>
                                            <option value="Tiaret">14 - Tiaret</option>
                                            <option value="Tizi Ouzou">15 - Tizi Ouzou</option>
                                            <option value="Alger">16 - Alger</option>
                                            <option value="Djelfa">17 - Djelfa</option>
                                            <option value="Jijel">18 - Jijel</option>
                                            <option value="Sétif">19 - Sétif</option>
                                            <option value="Saïda">20 - Saïda</option>
                                            <option value="Skikda">21 - Skikda</option>
                                            <option value="Sidi Bel Abbès">22 - Sidi Bel Abbès</option>
                                            <option value="Annaba">23 - Annaba</option>
                                            <option value="Guelma">24 - Guelma</option>
                                            <option value="Constantine">25 - Constantine</option>
                                            <option value="Médéa">26 - Médéa</option>
                                            <option value="Mostaganem">27 - Mostaganem</option>
                                            <option value="M'Sila">28 - M'Sila</option>
                                            <option value="Mascara">29 - Mascara</option>
                                            <option value="Ouargla">30 - Ouargla</option>
                                            <option value="Oran">31 - Oran</option>
                                            <option value="El Bayadh">32 - El Bayadh</option>
                                            <option value="Illizi">33 - Illizi</option>
                                            <option value="Bordj Bou Arréridj">34 - Bordj Bou Arréridj</option>
                                            <option value="Boumerdès">35 - Boumerdès</option>
                                            <option value="El Tarf">36 - El Tarf</option>
                                            <option value="Tindouf">37 - Tindouf</option>
                                            <option value="Tissemsilt">38 - Tissemsilt</option>
                                            <option value="El Oued">39 - El Oued</option>
                                            <option value="Khenchela">40 - Khenchela</option>
                                            <option value="Souk Ahras">41 - Souk Ahras</option>
                                            <option value="Tipaza">42 - Tipaza</option>
                                            <option value="Mila">43 - Mila</option>
                                            <option value="Aïn Defla">44 - Aïn Defla</option>
                                            <option value="Naâma">45 - Naâma</option>
                                            <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
                                            <option value="Ghardaïa">47 - Ghardaïa</option>
                                            <option value="Relizane">48 - Relizane</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Address -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-slate-700">
                                        <i class="fas fa-home mr-2 text-emerald-600"></i>Adresse complète
                                    </label>
                                    <textarea id="registerAdresse" name="adresse" required rows="2"
                                              class="w-full px-4 py-4 bg-slate-50/80 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all duration-300 hover:bg-white resize-none"
                                              placeholder="Votre adresse complète"></textarea>
                                </div>
                                
                                <!-- Register Button -->
                                <button type="submit" id="registerBtn" 
                                        class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center">
                                    <span id="registerBtnText">
                                        <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                                    </span>
                                    <i id="registerSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </form>
                            
                            <!-- Divider -->
                            <div class="relative my-8">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-slate-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white/80 text-slate-500 rounded-full font-medium">ou</span>
                                </div>
                            </div>
                            
                            <!-- Login Link -->
                            <div class="text-center space-y-4">
                                <p class="text-slate-600">Déjà un compte ?</p>
                                <button onclick="app.showPage('login')" 
                                        class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 hover:border-slate-300 px-8 py-3 rounded-xl transition-all duration-300 font-semibold">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                                </button>
                            </div>
                        </div>
                        
                        <!-- Back to Home -->
                        <div class="text-center mt-8">
                            <button onclick="app.showPage('home')" 
                                    class="text-slate-500 hover:text-emerald-600 transition-colors font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

// Form handling functions (same as before)
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

console.log('✅ Beautiful and aesthetic authentication system loaded');
