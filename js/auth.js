// Enhanced Authentication System for Shifa Parapharmacie
class AuthManager {
    constructor() {
        this.isLoading = false;
        this.passwordStrengthIndicator = null;
        
        console.log('🔐 AuthManager initialized');
    }
    
    // Load login page
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-50 via-sage-50 to-forest-50 py-12 px-4">
                <div class="max-w-md w-full">
                    <!-- Logo and Header -->
                    <div class="text-center mb-8" data-aos="fade-up">
                        <div class="flex justify-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-health">
                                <i class="fas fa-leaf text-3xl text-white"></i>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold text-forest-800 mb-2">Connexion</h1>
                        <p class="text-mint-600">Accédez à votre compte Shifa</p>
                    </div>
                    
                    <!-- Login Form -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health-lg border border-mint-200/50 p-8" data-aos="fade-up" data-aos-delay="200">
                        <form id="loginForm" onsubmit="authManager.handleLogin(event)" class="space-y-6">
                            <!-- Email Field -->
                            <div>
                                <label for="loginEmail" class="block text-sm font-semibold text-forest-700 mb-2">
                                    <i class="fas fa-envelope mr-2 text-mint-500"></i>Adresse e-mail
                                </label>
                                <input type="email" id="loginEmail" name="email" required 
                                       class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                       placeholder="votre@email.com">
                                <div id="emailError" class="hidden text-red-500 text-sm mt-2"></div>
                            </div>
                            
                            <!-- Password Field -->
                            <div>
                                <label for="loginPassword" class="block text-sm font-semibold text-forest-700 mb-2">
                                    <i class="fas fa-lock mr-2 text-mint-500"></i>Mot de passe
                                </label>
                                <div class="relative">
                                    <input type="password" id="loginPassword" name="password" required 
                                           class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="••••••••">
                                    <button type="button" onclick="authManager.togglePassword('loginPassword')" 
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                        <i class="fas fa-eye" id="loginPasswordToggle"></i>
                                    </button>
                                </div>
                                <div id="passwordError" class="hidden text-red-500 text-sm mt-2"></div>
                            </div>
                            
                            <!-- Remember Me -->
                            <div class="flex items-center justify-between">
                                <label class="flex items-center">
                                    <input type="checkbox" id="rememberMe" name="rememberMe" 
                                           class="w-4 h-4 text-primary bg-mint-50 border-mint-300 rounded focus:ring-primary focus:ring-2">
                                    <span class="ml-2 text-sm text-forest-600">Se souvenir de moi</span>
                                </label>
                                <a href="#" onclick="authManager.showForgotPassword()" 
                                   class="text-sm text-primary hover:text-secondary transition-colors font-medium">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                            
                            <!-- Submit Button -->
                            <button type="submit" id="loginSubmitBtn" 
                                    class="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-2xl font-bold text-lg hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health hover:shadow-health-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <span id="loginSubmitText">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                                </span>
                                <div id="loginSpinner" class="hidden">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>Connexion...
                                </div>
                            </button>
                        </form>
                        
                        <!-- Divider -->
                        <div class="relative my-6">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-mint-200"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-4 bg-white text-mint-600 font-medium">ou</span>
                            </div>
                        </div>
                        
                        <!-- Register Link -->
                        <div class="text-center">
                            <p class="text-forest-600">
                                Pas encore de compte ?
                                <a href="#" onclick="app.showPage('register')" 
                                   class="text-primary hover:text-secondary font-bold transition-colors">
                                    Créer un compte
                                </a>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Quick Access for Admin -->
                    <div class="mt-8 text-center" data-aos="fade-up" data-aos-delay="400">
                        <button onclick="authManager.quickAdminLogin()" 
                                class="text-sm text-mint-600 hover:text-primary transition-colors">
                            <i class="fas fa-user-shield mr-1"></i>
                            Accès administrateur
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Load register page
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-50 via-sage-50 to-forest-50 py-12 px-4">
                <div class="max-w-2xl w-full">
                    <!-- Logo and Header -->
                    <div class="text-center mb-8" data-aos="fade-up">
                        <div class="flex justify-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-health">
                                <i class="fas fa-user-plus text-3xl text-white"></i>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold text-forest-800 mb-2">Créer un compte</h1>
                        <p class="text-mint-600">Rejoignez la communauté Shifa</p>
                    </div>
                    
                    <!-- Register Form -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health-lg border border-mint-200/50 p-8" data-aos="fade-up" data-aos-delay="200">
                        <form id="registerForm" onsubmit="authManager.handleRegister(event)" class="space-y-6">
                            <!-- Personal Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerPrenom" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-user mr-2 text-mint-500"></i>Prénom *
                                    </label>
                                    <input type="text" id="registerPrenom" name="prenom" required 
                                           class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="Votre prénom">
                                </div>
                                <div>
                                    <label for="registerNom" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-user mr-2 text-mint-500"></i>Nom *
                                    </label>
                                    <input type="text" id="registerNom" name="nom" required 
                                           class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="Votre nom">
                                </div>
                            </div>
                            
                            <!-- Contact Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerEmail" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-envelope mr-2 text-mint-500"></i>Adresse e-mail *
                                    </label>
                                    <input type="email" id="registerEmail" name="email" required 
                                           class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="votre@email.com">
                                    <div id="registerEmailError" class="hidden text-red-500 text-sm mt-2"></div>
                                </div>
                                <div>
                                    <label for="registerTelephone" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-phone mr-2 text-mint-500"></i>Téléphone *
                                    </label>
                                    <input type="tel" id="registerTelephone" name="telephone" required 
                                           class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="0X XX XX XX XX">
                                    <div id="registerTelephoneError" class="hidden text-red-500 text-sm mt-2"></div>
                                </div>
                            </div>
                            
                            <!-- Address Info -->
                            <div>
                                <label for="registerAdresse" class="block text-sm font-semibold text-forest-700 mb-2">
                                    <i class="fas fa-map-marker-alt mr-2 text-mint-500"></i>Adresse complète *
                                </label>
                                <textarea id="registerAdresse" name="adresse" required rows="2"
                                          class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400 resize-none"
                                          placeholder="Votre adresse complète"></textarea>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerVille" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-city mr-2 text-mint-500"></i>Ville
                                    </label>
                                    <input type="text" id="registerVille" name="ville"
                                           class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                           placeholder="Votre ville">
                                </div>
                                <div>
                                    <label for="registerWilaya" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-map mr-2 text-mint-500"></i>Wilaya *
                                    </label>
                                    <select id="registerWilaya" name="wilaya" required
                                            class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                                        <option value="">Choisir une wilaya</option>
                                        ${APP_CONFIG.WILAYAS.map(wilaya => `<option value="${wilaya}">${wilaya}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Password -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerPassword" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-lock mr-2 text-mint-500"></i>Mot de passe *
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="registerPassword" name="password" required 
                                               class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                               placeholder="••••••••"
                                               oninput="authManager.checkPasswordStrength(this.value)">
                                        <button type="button" onclick="authManager.togglePassword('registerPassword')" 
                                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                            <i class="fas fa-eye" id="registerPasswordToggle"></i>
                                        </button>
                                    </div>
                                    <div id="passwordStrength" class="mt-2 hidden">
                                        <div class="flex space-x-1 mb-1">
                                            <div class="h-2 w-1/4 rounded-full bg-gray-200" id="strength1"></div>
                                            <div class="h-2 w-1/4 rounded-full bg-gray-200" id="strength2"></div>
                                            <div class="h-2 w-1/4 rounded-full bg-gray-200" id="strength3"></div>
                                            <div class="h-2 w-1/4 rounded-full bg-gray-200" id="strength4"></div>
                                        </div>
                                        <p class="text-xs" id="strengthText">Force du mot de passe</p>
                                    </div>
                                </div>
                                <div>
                                    <label for="registerConfirmPassword" class="block text-sm font-semibold text-forest-700 mb-2">
                                        <i class="fas fa-lock mr-2 text-mint-500"></i>Confirmer le mot de passe *
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="registerConfirmPassword" name="confirmPassword" required 
                                               class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-mint-400"
                                               placeholder="••••••••">
                                        <button type="button" onclick="authManager.togglePassword('registerConfirmPassword')" 
                                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                            <i class="fas fa-eye" id="registerConfirmPasswordToggle"></i>
                                        </button>
                                    </div>
                                    <div id="registerPasswordError" class="hidden text-red-500 text-sm mt-2"></div>
                                </div>
                            </div>
                            
                            <!-- Terms and Conditions -->
                            <div class="flex items-start space-x-3">
                                <input type="checkbox" id="acceptTerms" name="acceptTerms" required
                                       class="w-5 h-5 text-primary bg-mint-50 border-mint-300 rounded focus:ring-primary focus:ring-2 mt-1">
                                <label for="acceptTerms" class="text-sm text-forest-600 leading-relaxed">
                                    J'accepte les <a href="#" class="text-primary hover:text-secondary font-medium">conditions d'utilisation</a> 
                                    et la <a href="#" class="text-primary hover:text-secondary font-medium">politique de confidentialité</a> 
                                    de Shifa Parapharmacie.
                                </label>
                            </div>
                            
                            <!-- Newsletter -->
                            <div class="flex items-center space-x-3">
                                <input type="checkbox" id="newsletter" name="newsletter"
                                       class="w-4 h-4 text-primary bg-mint-50 border-mint-300 rounded focus:ring-primary focus:ring-2">
                                <label for="newsletter" class="text-sm text-forest-600">
                                    Je souhaite recevoir les actualités et offres spéciales par e-mail
                                </label>
                            </div>
                            
                            <!-- Submit Button -->
                            <button type="submit" id="registerSubmitBtn" 
                                    class="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-2xl font-bold text-lg hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health hover:shadow-health-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <span id="registerSubmitText">
                                    <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                                </span>
                                <div id="registerSpinner" class="hidden">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>Création...
                                </div>
                            </button>
                        </form>
                        
                        <!-- Login Link -->
                        <div class="mt-6 text-center">
                            <p class="text-forest-600">
                                Déjà un compte ?
                                <a href="#" onclick="app.showPage('login')" 
                                   class="text-primary hover:text-secondary font-bold transition-colors">
                                    Se connecter
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Load profile page
    async loadProfilePage() {
        if (!window.app.currentUser) {
            window.app.showPage('login');
            return;
        }
        
        const user = window.app.currentUser;
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-mint-50 via-sage-50 to-forest-50 py-12">
                <div class="container mx-auto px-4 max-w-4xl">
                    <!-- Header -->
                    <div class="text-center mb-12" data-aos="fade-up">
                        <div class="flex justify-center mb-6">
                            <div class="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-health-lg text-white text-3xl font-bold">
                                ${user.initiales || (user.prenom[0] + user.nom[0]).toUpperCase()}
                            </div>
                        </div>
                        <h1 class="text-4xl font-bold text-forest-800 mb-2">Mon Profil</h1>
                        <p class="text-xl text-mint-600">Gérez vos informations personnelles</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Sidebar -->
                        <div class="lg:col-span-1">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-6 sticky top-6" data-aos="fade-right">
                                <div class="text-center mb-6">
                                    <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-health text-white text-2xl font-bold mx-auto mb-4">
                                        ${user.initiales || (user.prenom[0] + user.nom[0]).toUpperCase()}
                                    </div>
                                    <h3 class="text-xl font-bold text-forest-800">${user.prenom} ${user.nom}</h3>
                                    <p class="text-mint-600">${user.email}</p>
                                    ${user.role === 'admin' ? '<span class="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full mt-2 font-semibold">Administrateur</span>' : ''}
                                </div>
                                
                                <nav class="space-y-2">
                                    <button onclick="authManager.showProfileSection('info')" id="profileNavInfo"
                                            class="w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 bg-primary/10 text-primary font-semibold">
                                        <i class="fas fa-user mr-3"></i>Informations personnelles
                                    </button>
                                    <button onclick="authManager.showProfileSection('orders')" id="profileNavOrders"
                                            class="w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 text-forest-600 hover:bg-mint-100 hover:text-primary">
                                        <i class="fas fa-shopping-bag mr-3"></i>Mes commandes
                                    </button>
                                    <button onclick="authManager.showProfileSection('security')" id="profileNavSecurity"
                                            class="w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 text-forest-600 hover:bg-mint-100 hover:text-primary">
                                        <i class="fas fa-shield-alt mr-3"></i>Sécurité
                                    </button>
                                    <button onclick="authManager.showProfileSection('preferences')" id="profileNavPreferences"
                                            class="w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 text-forest-600 hover:bg-mint-100 hover:text-primary">
                                        <i class="fas fa-cog mr-3"></i>Préférences
                                    </button>
                                </nav>
                                
                                <div class="mt-6 pt-6 border-t border-mint-200">
                                    <button onclick="logout()" 
                                            class="w-full flex items-center justify-center px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold">
                                        <i class="fas fa-sign-out-alt mr-3"></i>Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="lg:col-span-2" id="profileMainContent" data-aos="fade-left">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load default section
        this.showProfileSection('info');
    }
    
    // Show profile section
    showProfileSection(section) {
        const user = window.app.currentUser;
        const mainContent = document.getElementById('profileMainContent');
        
        // Update navigation
        document.querySelectorAll('[id^="profileNav"]').forEach(btn => {
            btn.className = "w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 text-forest-600 hover:bg-mint-100 hover:text-primary";
        });
        
        document.getElementById(`profileNav${section.charAt(0).toUpperCase() + section.slice(1)}`).className = 
            "w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 bg-primary/10 text-primary font-semibold";
        
        switch (section) {
            case 'info':
                mainContent.innerHTML = this.getPersonalInfoSection(user);
                break;
            case 'orders':
                this.loadUserOrders();
                break;
            case 'security':
                mainContent.innerHTML = this.getSecuritySection();
                break;
            case 'preferences':
                mainContent.innerHTML = this.getPreferencesSection(user);
                break;
        }
    }
    
    // Get personal info section
    getPersonalInfoSection(user) {
        return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-forest-800">Informations personnelles</h2>
                    <button onclick="authManager.toggleEditMode()" id="editModeBtn"
                            class="bg-primary text-white px-6 py-2 rounded-xl hover:bg-secondary transition-colors">
                        <i class="fas fa-edit mr-2"></i>Modifier
                    </button>
                </div>
                
                <form id="profileForm" onsubmit="authManager.updateProfile(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Prénom</label>
                            <input type="text" id="profilePrenom" value="${user.prenom}" readonly
                                   class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Nom</label>
                            <input type="text" id="profileNom" value="${user.nom}" readonly
                                   class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Email</label>
                            <input type="email" id="profileEmail" value="${user.email}" readonly
                                   class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Téléphone</label>
                            <input type="tel" id="profileTelephone" value="${user.telephone}" readonly
                                   class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300">
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <label class="block text-sm font-semibold text-forest-700 mb-2">Adresse</label>
                        <textarea id="profileAdresse" rows="2" readonly
                                  class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300 resize-none">${user.adresse}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Ville</label>
                            <input type="text" id="profileVille" value="${user.ville || ''}" readonly
                                   class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 readonly:bg-gray-100 readonly:text-gray-600 transition-all duration-300">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Wilaya</label>
                            <select id="profileWilaya" disabled
                                    class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 bg-mint-50/50 disabled:bg-gray-100 disabled:text-gray-600 transition-all duration-300">
                                ${APP_CONFIG.WILAYAS.map(wilaya => 
                                    `<option value="${wilaya}" ${user.wilaya === wilaya ? 'selected' : ''}>${wilaya}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-8 hidden" id="profileFormActions">
                        <div class="flex space-x-4">
                            <button type="submit" 
                                    class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health">
                                <i class="fas fa-save mr-2"></i>Enregistrer
                            </button>
                            <button type="button" onclick="authManager.cancelEditMode()"
                                    class="bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors">
                                <i class="fas fa-times mr-2"></i>Annuler
                            </button>
                        </div>
                    </div>
                </form>
                
                <!-- Account Stats -->
                <div class="mt-8 pt-8 border-t border-mint-200">
                    <h3 class="text-xl font-bold text-forest-800 mb-4">Statistiques du compte</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-mint-50 rounded-2xl p-4 text-center">
                            <div class="text-2xl font-bold text-primary">${user.statistiques?.totalCommandes || 0}</div>
                            <div class="text-sm text-mint-600">Commandes</div>
                        </div>
                        <div class="bg-mint-50 rounded-2xl p-4 text-center">
                            <div class="text-2xl font-bold text-primary">${Utils.formatPrice(user.statistiques?.totalDepense || 0)}</div>
                            <div class="text-sm text-mint-600">Total dépensé</div>
                        </div>
                        <div class="bg-mint-50 rounded-2xl p-4 text-center">
                            <div class="text-2xl font-bold text-primary">${user.ancienneteCompte || '0 jour'}</div>
                            <div class="text-sm text-mint-600">Membre depuis</div>
                        </div>
                        <div class="bg-mint-50 rounded-2xl p-4 text-center">
                            <div class="text-2xl font-bold text-primary">${user.role === 'admin' ? 'Admin' : 'Client'}</div>
                            <div class="text-sm text-mint-600">Statut</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get security section
    getSecuritySection() {
        return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8">
                <h2 class="text-2xl font-bold text-forest-800 mb-6">Sécurité du compte</h2>
                
                <!-- Change Password -->
                <div class="mb-8">
                    <h3 class="text-xl font-semibold text-forest-700 mb-4">
                        <i class="fas fa-key mr-2 text-mint-500"></i>Changer le mot de passe
                    </h3>
                    <form id="changePasswordForm" onsubmit="authManager.changePassword(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Mot de passe actuel</label>
                            <div class="relative">
                                <input type="password" id="currentPassword" name="currentPassword" required
                                       class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50">
                                <button type="button" onclick="authManager.togglePassword('currentPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                    <i class="fas fa-eye" id="currentPasswordToggle"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Nouveau mot de passe</label>
                            <div class="relative">
                                <input type="password" id="newPassword" name="newPassword" required
                                       class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50"
                                       oninput="authManager.checkPasswordStrength(this.value, 'newPassword')">
                                <button type="button" onclick="authManager.togglePassword('newPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                    <i class="fas fa-eye" id="newPasswordToggle"></i>
                                </button>
                            </div>
                            <div id="newPasswordStrength" class="mt-2 hidden">
                                <div class="flex space-x-1 mb-1">
                                    <div class="h-2 w-1/4 rounded-full bg-gray-200" id="newStrength1"></div>
                                    <div class="h-2 w-1/4 rounded-full bg-gray-200" id="newStrength2"></div>
                                    <div class="h-2 w-1/4 rounded-full bg-gray-200" id="newStrength3"></div>
                                    <div class="h-2 w-1/4 rounded-full bg-gray-200" id="newStrength4"></div>
                                </div>
                                <p class="text-xs" id="newStrengthText">Force du mot de passe</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-forest-700 mb-2">Confirmer le nouveau mot de passe</label>
                            <div class="relative">
                                <input type="password" id="confirmNewPassword" name="confirmNewPassword" required
                                       class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50">
                                <button type="button" onclick="authManager.togglePassword('confirmNewPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-mint-500 hover:text-primary transition-colors">
                                    <i class="fas fa-eye" id="confirmNewPasswordToggle"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" 
                                class="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health">
                            <i class="fas fa-shield-alt mr-2"></i>Changer le mot de passe
                        </button>
                    </form>
                </div>
                
                <!-- Security Info -->
                <div class="bg-mint-50 rounded-2xl p-6 border border-mint-200">
                    <h3 class="text-lg font-semibold text-forest-700 mb-4">
                        <i class="fas fa-info-circle mr-2 text-mint-500"></i>Conseils de sécurité
                    </h3>
                    <ul class="space-y-2 text-forest-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-mint-500 mr-2 mt-1"></i>
                            Utilisez un mot de passe fort avec au moins 8 caractères
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-mint-500 mr-2 mt-1"></i>
                            Ne partagez jamais vos identifiants de connexion
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-mint-500 mr-2 mt-1"></i>
                            Déconnectez-vous sur les ordinateurs partagés
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-mint-500 mr-2 mt-1"></i>
                            Vérifiez régulièrement l'activité de votre compte
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Get preferences section
    getPreferencesSection(user) {
        return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8">
                <h2 class="text-2xl font-bold text-forest-800 mb-6">Préférences</h2>
                
                <form id="preferencesForm" onsubmit="authManager.updatePreferences(event)" class="space-y-8">
                    <!-- Notification Preferences -->
                    <div>
                        <h3 class="text-xl font-semibold text-forest-700 mb-4">
                            <i class="fas fa-bell mr-2 text-mint-500"></i>Notifications
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-medium text-forest-700">Notifications par email</p>
                                    <p class="text-sm text-mint-600">Recevoir les mises à jour de commandes par email</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${user.preferences?.notifications?.email !== false ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-medium text-forest-700">Promotions et offres</p>
                                    <p class="text-sm text-mint-600">Recevoir les offres spéciales et nouveautés</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${user.preferences?.notifications?.promotions !== false ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Category Preferences -->
                    <div>
                        <h3 class="text-xl font-semibold text-forest-700 mb-4">
                            <i class="fas fa-heart mr-2 text-mint-500"></i>Catégories préférées
                        </h3>
                        <p class="text-sm text-mint-600 mb-4">Sélectionnez vos catégories d'intérêt pour des recommandations personnalisées</p>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            ${Object.keys(APP_CONFIG.CATEGORIES).map(category => `
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" name="categories" value="${category}"
                                           class="w-4 h-4 text-primary bg-mint-50 border-mint-300 rounded focus:ring-primary focus:ring-2"
                                           ${user.preferences?.categories?.includes(category) ? 'checked' : ''}>
                                    <span class="text-sm font-medium text-forest-700">${category}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Language and Display -->
                    <div>
                        <h3 class="text-xl font-semibold text-forest-700 mb-4">
                            <i class="fas fa-cog mr-2 text-mint-500"></i>Affichage
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-forest-700 mb-2">Langue</label>
                                <select class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50">
                                    <option value="fr">Français</option>
                                    <option value="ar">العربية</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-forest-700 mb-2">Devise</label>
                                <select class="w-full px-4 py-3 rounded-2xl border-2 border-mint-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 bg-white/50">
                                    <option value="DA">Dinar Algérien (DA)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="USD">Dollar US ($)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" 
                            class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health">
                        <i class="fas fa-save mr-2"></i>Enregistrer les préférences
                    </button>
                </form>
            </div>
        `;
    }
    
    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();
        
        if (this.isLoading) return;
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        
        // Clear previous errors
        this.clearErrors();
        
        // Basic validation
        if (!this.validateEmail(email)) {
            this.showFieldError('emailError', 'Format d\'email invalide');
            return;
        }
        
        if (password.length < APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH) {
            this.showFieldError('passwordError', `Le mot de passe doit contenir au moins ${APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH} caractères`);
            return;
        }
        
        try {
            this.setLoadingState('login', true);
            
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (response.success && response.token) {
                // Store token
                localStorage.setItem('token', response.token);
                
                // Update current user
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                
                // Show success message
                window.app.showToast(`Bienvenue ${response.user.prenom} !`, 'success');
                
                // Redirect based on role
                if (response.user.role === 'admin') {
                    window.app.showPage('admin');
                } else {
                    window.app.showPage('profile');
                }
                
                // Dispatch login event
                document.dispatchEvent(new CustomEvent('auth:login', {
                    detail: { user: response.user, token: response.token }
                }));
                
            } else {
                throw new Error(response.message || 'Erreur de connexion');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message.includes('Email ou mot de passe incorrect')) {
                this.showFieldError('passwordError', 'Email ou mot de passe incorrect');
            } else if (error.message.includes('compte désactivé')) {
                this.showFieldError('emailError', 'Votre compte a été désactivé. Contactez l\'administrateur.');
            } else {
                window.app.showToast(error.message || 'Erreur de connexion. Veuillez réessayer.', 'error');
            }
            
        } finally {
            this.setLoadingState('login', false);
        }
    }
    
    // Handle register form submission
    async handleRegister(event) {
        event.preventDefault();
        
        if (this.isLoading) return;
        
        const form = event.target;
        const formData = new FormData(form);
        
        const userData = {
            prenom: formData.get('prenom').trim(),
            nom: formData.get('nom').trim(),
            email: formData.get('email').trim().toLowerCase(),
            telephone: formData.get('telephone').trim(),
            adresse: formData.get('adresse').trim(),
            ville: formData.get('ville')?.trim() || '',
            wilaya: formData.get('wilaya'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        // Clear previous errors
        this.clearErrors();
        
        // Validation
        const errors = this.validateRegistrationData(userData);
        if (errors.length > 0) {
            errors.forEach(error => {
                this.showFieldError(error.field, error.message);
            });
            return;
        }
        
        try {
            this.setLoadingState('register', true);
            
            // Remove confirmPassword before sending
            delete userData.confirmPassword;
            
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (response.success && response.token) {
                // Store token
                localStorage.setItem('token', response.token);
                
                // Update current user
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                
                // Show success message
                window.app.showToast('Inscription réussie ! Bienvenue chez Shifa !', 'success');
                
                // Redirect to profile
                window.app.showPage('profile');
                
                // Dispatch login event
                document.dispatchEvent(new CustomEvent('auth:login', {
                    detail: { user: response.user, token: response.token }
                }));
                
            } else {
                throw new Error(response.message || 'Erreur d\'inscription');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            
            if (error.message.includes('email existe déjà')) {
                this.showFieldError('registerEmailError', 'Un compte avec cet email existe déjà');
            } else if (error.message.includes('téléphone est déjà utilisé')) {
                this.showFieldError('registerTelephoneError', 'Ce numéro de téléphone est déjà utilisé');
            } else {
                window.app.showToast(error.message || 'Erreur d\'inscription. Veuillez réessayer.', 'error');
            }
            
        } finally {
            this.setLoadingState('register', false);
        }
    }
    
    // Validate registration data
    validateRegistrationData(data) {
        const errors = [];
        
        if (data.prenom.length < 2) {
            errors.push({ field: 'prenomError', message: 'Le prénom doit contenir au moins 2 caractères' });
        }
        
        if (data.nom.length < 2) {
            errors.push({ field: 'nomError', message: 'Le nom doit contenir au moins 2 caractères' });
        }
        
        if (!this.validateEmail(data.email)) {
            errors.push({ field: 'registerEmailError', message: 'Format d\'email invalide' });
        }
        
        if (!Utils.validatePhone(data.telephone)) {
            errors.push({ field: 'registerTelephoneError', message: 'Format de téléphone invalide (numéro algérien requis)' });
        }
        
        if (data.adresse.length < 10) {
            errors.push({ field: 'adresseError', message: 'L\'adresse doit contenir au moins 10 caractères' });
        }
        
        if (!data.wilaya) {
            errors.push({ field: 'wilayaError', message: 'Veuillez sélectionner une wilaya' });
        }
        
        if (data.password.length < APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH) {
            errors.push({ field: 'registerPasswordError', message: `Le mot de passe doit contenir au moins ${APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH} caractères` });
        }
        
        if (data.password !== data.confirmPassword) {
            errors.push({ field: 'registerPasswordError', message: 'Les mots de passe ne correspondent pas' });
        }
        
        return errors;
    }
    
    // Toggle password visibility
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(inputId + 'Toggle');
        
        if (input && toggle) {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                toggle.className = 'fas fa-eye';
            }
        }
    }
    
    // Check password strength
    checkPasswordStrength(password, prefix = '') {
        const strengthContainer = document.getElementById(prefix + 'passwordStrength' || 'passwordStrength');
        if (!strengthContainer) return;
        
        strengthContainer.classList.remove('hidden');
        
        const indicators = [1, 2, 3, 4].map(i => 
            document.getElementById(prefix ? `${prefix.replace('Password', '')}Strength${i}` : `strength${i}`)
        );
        const strengthText = document.getElementById(prefix ? `${prefix.replace('Password', '')}StrengthText` : 'strengthText');
        
        // Reset indicators
        indicators.forEach(indicator => {
            if (indicator) indicator.className = 'h-2 w-1/4 rounded-full bg-gray-200';
        });
        
        let strength = 0;
        let strengthLabel = 'Très faible';
        let color = 'bg-red-400';
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z\d]/.test(password)) strength++;
        
        if (strength >= 6) {
            strengthLabel = 'Très fort';
            color = 'bg-green-500';
            strength = 4;
        } else if (strength >= 4) {
            strengthLabel = 'Fort';
            color = 'bg-green-400';
            strength = 3;
        } else if (strength >= 3) {
            strengthLabel = 'Moyen';
            color = 'bg-yellow-400';
            strength = 2;
        } else if (strength >= 2) {
            strengthLabel = 'Faible';
            color = 'bg-orange-400';
            strength = 1;
        }
        
        // Update indicators
        for (let i = 0; i < strength; i++) {
            if (indicators[i]) {
                indicators[i].className = `h-2 w-1/4 rounded-full ${color}`;
            }
        }
        
        if (strengthText) {
            strengthText.textContent = strengthLabel;
            strengthText.className = `text-xs font-medium ${color.replace('bg-', 'text-')}`;
        }
    }
    
    // Quick admin login
    quickAdminLogin() {
        document.getElementById('loginEmail').value = APP_CONFIG.ADMIN.EMAIL;
        document.getElementById('loginPassword').value = APP_CONFIG.ADMIN.PASSWORD;
        window.app.showToast('Identifiants administrateur pré-remplis', 'info');
    }
    
    // Show forgot password modal
    showForgotPassword() {
        window.app.showToast('Fonctionnalité de récupération de mot de passe bientôt disponible', 'info');
    }
    
    // Utility methods
    validateEmail(email) {
        return Utils.validateEmail(email);
    }
    
    clearErrors() {
        document.querySelectorAll('[id$="Error"]').forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });
    }
    
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    setLoadingState(action, loading) {
        this.isLoading = loading;
        
        const submitBtn = document.getElementById(`${action}SubmitBtn`);
        const submitText = document.getElementById(`${action}SubmitText`);
        const spinner = document.getElementById(`${action}Spinner`);
        
        if (submitBtn && submitText && spinner) {
            submitBtn.disabled = loading;
            
            if (loading) {
                submitText.classList.add('hidden');
                spinner.classList.remove('hidden');
            } else {
                submitText.classList.remove('hidden');
                spinner.classList.add('hidden');
            }
        }
    }
    
    // Profile management methods
    toggleEditMode() {
        const inputs = document.querySelectorAll('#profileForm input, #profileForm textarea, #profileForm select');
        const editBtn = document.getElementById('editModeBtn');
        const actions = document.getElementById('profileFormActions');
        
        const isReadonly = inputs[0].readOnly || inputs[0].disabled;
        
        inputs.forEach(input => {
            if (input.type === 'email') return; // Email should not be editable
            
            input.readOnly = !isReadonly;
            input.disabled = !isReadonly;
            
            if (isReadonly) {
                input.classList.remove('readonly:bg-gray-100', 'readonly:text-gray-600', 'disabled:bg-gray-100', 'disabled:text-gray-600');
                input.classList.add('focus:border-primary', 'focus:ring-4', 'focus:ring-primary/20');
            } else {
                input.classList.add('readonly:bg-gray-100', 'readonly:text-gray-600', 'disabled:bg-gray-100', 'disabled:text-gray-600');
                input.classList.remove('focus:border-primary', 'focus:ring-4', 'focus:ring-primary/20');
            }
        });
        
        if (editBtn) {
            editBtn.innerHTML = isReadonly ? 
                '<i class="fas fa-times mr-2"></i>Annuler' : 
                '<i class="fas fa-edit mr-2"></i>Modifier';
        }
        
        if (actions) {
            actions.classList.toggle('hidden', !isReadonly);
        }
    }
    
    cancelEditMode() {
        // Reload the profile section to reset changes
        this.showProfileSection('info');
    }
    
    // Update profile
    async updateProfile(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const updateData = {
            prenom: formData.get('prenom') || document.getElementById('profilePrenom').value,
            nom: formData.get('nom') || document.getElementById('profileNom').value,
            telephone: formData.get('telephone') || document.getElementById('profileTelephone').value,
            adresse: formData.get('adresse') || document.getElementById('profileAdresse').value,
            ville: formData.get('ville') || document.getElementById('profileVille').value,
            wilaya: formData.get('wilaya') || document.getElementById('profileWilaya').value
        };
        
        try {
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (response.success) {
                window.app.currentUser = { ...window.app.currentUser, ...response.user };
                window.app.updateUserUI();
                window.app.showToast('Profil mis à jour avec succès', 'success');
                this.showProfileSection('info'); // Refresh the section
            } else {
                throw new Error(response.message || 'Erreur de mise à jour');
            }
            
        } catch (error) {
            console.error('Profile update error:', error);
            window.app.showToast(error.message || 'Erreur lors de la mise à jour', 'error');
        }
    }
    
    // Change password
    async changePassword(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmNewPassword: formData.get('confirmNewPassword')
        };
        
        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            window.app.showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (passwordData.newPassword.length < APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH) {
            window.app.showToast(`Le nouveau mot de passe doit contenir au moins ${APP_CONFIG.SECURITY.MIN_PASSWORD_LENGTH} caractères`, 'error');
            return;
        }
        
        try {
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                method: 'POST',
                body: JSON.stringify(passwordData)
            });
            
            if (response.success) {
                window.app.showToast('Mot de passe changé avec succès', 'success');
                event.target.reset();
            } else {
                throw new Error(response.message || 'Erreur de changement de mot de passe');
            }
            
        } catch (error) {
            console.error('Password change error:', error);
            window.app.showToast(error.message || 'Erreur lors du changement de mot de passe', 'error');
        }
    }
    
    // Update preferences
    async updatePreferences(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const categories = formData.getAll('categories');
        
        const preferences = {
            notifications: {
                email: formData.get('notifications-email') === 'on',
                promotions: formData.get('notifications-promotions') === 'on'
            },
            categories: categories
        };
        
        try {
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
                method: 'PUT',
                body: JSON.stringify({ preferences })
            });
            
            if (response.success) {
                window.app.currentUser.preferences = preferences;
                window.app.showToast('Préférences mises à jour avec succès', 'success');
            } else {
                throw new Error(response.message || 'Erreur de mise à jour des préférences');
            }
            
        } catch (error) {
            console.error('Preferences update error:', error);
            window.app.showToast(error.message || 'Erreur lors de la mise à jour des préférences', 'error');
        }
    }
    
    // Load user orders
    async loadUserOrders() {
        const mainContent = document.getElementById('profileMainContent');
        
        try {
            const response = await apiCall(`${API_CONFIG.ENDPOINTS.ORDERS.USER_ORDERS}${window.app.currentUser.id}`);
            
            if (response.success && response.orders) {
                mainContent.innerHTML = this.generateOrdersHTML(response.orders);
            } else {
                mainContent.innerHTML = this.generateEmptyOrdersHTML();
            }
            
        } catch (error) {
            console.error('Load user orders error:', error);
            mainContent.innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                    <h3 class="text-xl font-bold text-forest-800 mb-2">Erreur de chargement</h3>
                    <p class="text-mint-600">Impossible de charger vos commandes pour le moment</p>
                </div>
            `;
        }
    }
    
    generateOrdersHTML(orders) {
        if (orders.length === 0) {
            return this.generateEmptyOrdersHTML();
        }
        
        return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8">
                <h2 class="text-2xl font-bold text-forest-800 mb-6">Mes commandes</h2>
                <div class="space-y-6">
                    ${orders.map(order => `
                        <div class="bg-mint-50/50 rounded-2xl p-6 border border-mint-200 hover:border-mint-400 transition-all">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h3 class="text-lg font-bold text-forest-800">Commande #${order.numeroCommande}</h3>
                                    <p class="text-sm text-mint-600">${Utils.formatDate(order.dateCommande)}</p>
                                </div>
                                <div class="flex items-center space-x-4 mt-2 md:mt-0">
                                    <span class="px-4 py-2 rounded-xl text-sm font-semibold ${this.getOrderStatusClass(order.statut)}">
                                        ${APP_CONFIG.ECOMMERCE.ORDER_STATUSES[order.statut]?.label || order.statut}
                                    </span>
                                    <span class="text-xl font-bold text-forest-800">${Utils.formatPrice(order.total)}</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p class="font-semibold text-forest-700">Articles</p>
                                    <p class="text-mint-600">${order.articles.length} produit(s)</p>
                                </div>
                                <div>
                                    <p class="font-semibold text-forest-700">Mode de paiement</p>
                                    <p class="text-mint-600">${order.modePaiement}</p>
                                </div>
                                <div>
                                    <p class="font-semibold text-forest-700">Statut paiement</p>
                                    <p class="text-mint-600">${order.statutPaiement}</p>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-mint-200">
                                <button onclick="app.showOrderDetails('${order._id}')" 
                                        class="text-primary hover:text-secondary font-semibold transition-colors">
                                    Voir les détails <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    generateEmptyOrdersHTML() {
        return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-health border border-mint-200/50 p-8 text-center">
                <div class="w-24 h-24 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-shopping-bag text-4xl text-mint-400"></i>
                </div>
                <h3 class="text-2xl font-bold text-forest-800 mb-4">Aucune commande</h3>
                <p class="text-mint-600 mb-8">Vous n'avez pas encore passé de commande</p>
                <button onclick="app.showPage('products')" 
                        class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health">
                    <i class="fas fa-shopping-cart mr-2"></i>Découvrir nos produits
                </button>
            </div>
        `;
    }
    
    getOrderStatusClass(status) {
        const statusColors = {
            'en-attente': 'bg-yellow-100 text-yellow-800',
            'confirmée': 'bg-blue-100 text-blue-800',
            'préparée': 'bg-indigo-100 text-indigo-800',
            'expédiée': 'bg-purple-100 text-purple-800',
            'livrée': 'bg-green-100 text-green-800',
            'annulée': 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    }
}

// Initialize AuthManager
const authManager = new AuthManager();

// Make it globally available
window.authManager = authManager;

console.log('✅ Enhanced auth.js loaded successfully');
