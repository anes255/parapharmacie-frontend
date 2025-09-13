// Enhanced Authentication System for Shifa Parapharmacie
class PharmacieGaherApp {
    
    // Beautiful login page matching the site's aesthetic
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-12">
                <div class="container mx-auto px-4">
                    <div class="max-w-md mx-auto">
                        <!-- Header -->
                        <div class="text-center mb-8">
                            <div class="flex justify-center mb-6">
                                <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/80">
                                    <i class="fas fa-user text-white text-3xl"></i>
                                </div>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-2">
                                Connexion
                            </h1>
                            <p class="text-emerald-600 text-lg">Accédez à votre compte Shifa</p>
                        </div>
                        
                        <!-- Login Form -->
                        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                            <div class="p-8">
                                <form id="loginForm" class="space-y-6">
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">
                                            <i class="fas fa-envelope mr-2"></i>Email
                                        </label>
                                        <input type="email" name="email" required 
                                               class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm text-lg"
                                               placeholder="votre@email.com">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">
                                            <i class="fas fa-lock mr-2"></i>Mot de passe
                                        </label>
                                        <div class="relative">
                                            <input type="password" name="password" required 
                                                   class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm text-lg pr-12"
                                                   placeholder="••••••••">
                                            <button type="button" onclick="togglePasswordVisibility('loginForm')" 
                                                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700">
                                                <i class="fas fa-eye" id="passwordToggleIcon"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Demo Credentials Info -->
                                    <div class="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 class="font-semibold text-blue-800 mb-2">
                                            <i class="fas fa-info-circle mr-2"></i>Comptes de démonstration
                                        </h4>
                                        <div class="text-sm text-blue-700 space-y-2">
                                            <div class="bg-white/60 rounded-lg p-3">
                                                <p class="font-medium">👑 Administrateur:</p>
                                                <p><strong>Email:</strong> pharmaciegaher@gmail.com</p>
                                                <p><strong>Mot de passe:</strong> anesaya75</p>
                                            </div>
                                            <div class="bg-white/60 rounded-lg p-3">
                                                <p class="font-medium">👤 Utilisateur test:</p>
                                                <p><strong>Email:</strong> test@example.com</p>
                                                <p><strong>Mot de passe:</strong> test123</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button type="submit" 
                                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg">
                                        <span id="loginButtonText">
                                            <i class="fas fa-sign-in-alt mr-2"></i>
                                            Se connecter
                                        </span>
                                        <div id="loginSpinner" class="hidden">
                                            <i class="fas fa-spinner fa-spin mr-2"></i>
                                            Connexion...
                                        </div>
                                    </button>
                                </form>
                                
                                <!-- Register Link -->
                                <div class="mt-8 text-center">
                                    <p class="text-emerald-600 mb-4">Pas encore de compte ?</p>
                                    <button onclick="app.showPage('register')" 
                                            class="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline transition-all">
                                        <i class="fas fa-user-plus mr-2"></i>
                                        Créer un compte
                                    </button>
                                </div>
                                
                                <!-- Back to Home -->
                                <div class="mt-6 text-center">
                                    <button onclick="app.showPage('home')" 
                                            class="text-emerald-500 hover:text-emerald-700 transition-all">
                                        <i class="fas fa-arrow-left mr-2"></i>
                                        Retour à l'accueil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initLoginForm();
    }
    
    // Beautiful register page matching the site's aesthetic
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12">
                <div class="container mx-auto px-4">
                    <div class="max-w-2xl mx-auto">
                        <!-- Header -->
                        <div class="text-center mb-8">
                            <div class="flex justify-center mb-6">
                                <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/80">
                                    <i class="fas fa-user-plus text-white text-3xl"></i>
                                </div>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-2">
                                Inscription
                            </h1>
                            <p class="text-emerald-600 text-lg">Rejoignez la famille Shifa dès aujourd'hui</p>
                        </div>
                        
                        <!-- Register Form -->
                        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                            <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6">
                                <h2 class="text-2xl font-bold text-white flex items-center">
                                    <i class="fas fa-user-circle mr-3"></i>
                                    Créer votre compte
                                </h2>
                                <p class="text-emerald-100 mt-2">Remplissez les informations ci-dessous</p>
                            </div>
                            
                            <div class="p-8">
                                <form id="registerForm" class="space-y-6">
                                    <!-- Personal Information -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-user mr-2"></i>Nom *
                                            </label>
                                            <input type="text" name="nom" required 
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="Votre nom de famille">
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-user mr-2"></i>Prénom *
                                            </label>
                                            <input type="text" name="prenom" required 
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="Votre prénom">
                                        </div>
                                    </div>
                                    
                                    <!-- Contact Information -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-envelope mr-2"></i>Email *
                                            </label>
                                            <input type="email" name="email" required 
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="votre@email.com">
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-phone mr-2"></i>Téléphone *
                                            </label>
                                            <input type="tel" name="telephone" required 
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="+213 XXX XXX XXX">
                                        </div>
                                    </div>
                                    
                                    <!-- Address Information -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-map-marker-alt mr-2"></i>Wilaya *
                                            </label>
                                            <select name="wilaya" required 
                                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm">
                                                <option value="">Sélectionnez votre wilaya</option>
                                                ${this.getAlgerianWilayas().map(w => `<option value="${w}">${w}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-home mr-2"></i>Ville
                                            </label>
                                            <input type="text" name="ville" 
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="Nom de votre ville">
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">
                                            <i class="fas fa-map mr-2"></i>Adresse complète
                                        </label>
                                        <textarea name="adresse" rows="2" 
                                                  class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm resize-none"
                                                  placeholder="Rue, quartier, numéro..."></textarea>
                                    </div>
                                    
                                    <!-- Password -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-lock mr-2"></i>Mot de passe *
                                            </label>
                                            <div class="relative">
                                                <input type="password" name="password" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm pr-12"
                                                       placeholder="••••••••"
                                                       minlength="6">
                                                <button type="button" onclick="togglePasswordVisibility('registerForm', 'password')" 
                                                        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                            <p class="text-sm text-emerald-600 mt-1">Minimum 6 caractères</p>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">
                                                <i class="fas fa-lock mr-2"></i>Confirmer *
                                            </label>
                                            <div class="relative">
                                                <input type="password" name="confirmPassword" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm pr-12"
                                                       placeholder="••••••••">
                                                <button type="button" onclick="togglePasswordVisibility('registerForm', 'confirmPassword')" 
                                                        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Terms -->
                                    <div class="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-4 border border-emerald-200">
                                        <label class="flex items-start space-x-3">
                                            <input type="checkbox" name="acceptTerms" required 
                                                   class="mt-1 w-5 h-5 text-emerald-600 bg-white border-2 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2">
                                            <span class="text-sm text-emerald-700">
                                                J'accepte les <a href="#" class="font-semibold hover:underline">conditions d'utilisation</a> 
                                                et la <a href="#" class="font-semibold hover:underline">politique de confidentialité</a> 
                                                de Shifa Parapharmacie.
                                            </span>
                                        </label>
                                    </div>
                                    
                                    <button type="submit" 
                                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg">
                                        <span id="registerButtonText">
                                            <i class="fas fa-user-plus mr-2"></i>
                                            Créer mon compte
                                        </span>
                                        <div id="registerSpinner" class="hidden">
                                            <i class="fas fa-spinner fa-spin mr-2"></i>
                                            Création...
                                        </div>
                                    </button>
                                </form>
                                
                                <!-- Login Link -->
                                <div class="mt-8 text-center">
                                    <p class="text-emerald-600 mb-4">Déjà inscrit ?</p>
                                    <button onclick="app.showPage('login')" 
                                            class="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline transition-all">
                                        <i class="fas fa-sign-in-alt mr-2"></i>
                                        Se connecter
                                    </button>
                                </div>
                                
                                <!-- Back to Home -->
                                <div class="mt-6 text-center">
                                    <button onclick="app.showPage('home')" 
                                            class="text-emerald-500 hover:text-emerald-700 transition-all">
                                        <i class="fas fa-arrow-left mr-2"></i>
                                        Retour à l'accueil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initRegisterForm();
    }
    
    initLoginForm() {
        const form = document.getElementById('loginForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const credentials = {
                email: formData.get('email').trim(),
                password: formData.get('password')
            };
            
            if (!credentials.email || !credentials.password) {
                this.showToast('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            this.showLoginLoading(true);
            
            try {
                console.log('🔐 Attempting login for:', credentials.email);
                
                const response = await apiCall('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(credentials)
                });
                
                console.log('✅ Login successful:', response);
                
                // Store token and user data
                localStorage.setItem('token', response.token);
                this.currentUser = response.user;
                this.updateUserUI();
                
                this.showToast(`Bienvenue ${response.user.prenom} !`, 'success');
                this.showPage('home');
                
            } catch (error) {
                console.error('❌ Login error:', error);
                this.handleAuthError(error, 'login');
            } finally {
                this.showLoginLoading(false);
            }
        });
    }
    
    initRegisterForm() {
        const form = document.getElementById('registerForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const userData = {
                nom: formData.get('nom').trim(),
                prenom: formData.get('prenom').trim(),
                email: formData.get('email').trim(),
                telephone: formData.get('telephone').trim(),
                wilaya: formData.get('wilaya'),
                ville: formData.get('ville').trim(),
                adresse: formData.get('adresse').trim(),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
            
            // Validation
            if (!userData.nom || !userData.prenom || !userData.email || !userData.telephone || !userData.password || !userData.wilaya) {
                this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            
            if (userData.password.length < 6) {
                this.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
                return;
            }
            
            if (userData.password !== userData.confirmPassword) {
                this.showToast('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                this.showToast('Veuillez entrer un email valide', 'error');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
            if (!phoneRegex.test(userData.telephone.replace(/\s+/g, ''))) {
                this.showToast('Veuillez entrer un numéro de téléphone algérien valide', 'error');
                return;
            }
            
            if (!formData.get('acceptTerms')) {
                this.showToast('Veuillez accepter les conditions d\'utilisation', 'error');
                return;
            }
            
            this.showRegisterLoading(true);
            
            try {
                console.log('📝 Attempting registration for:', userData.email);
                
                // Remove confirmPassword before sending
                delete userData.confirmPassword;
                
                const response = await apiCall('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
                
                console.log('✅ Registration successful:', response);
                
                // Store token and user data
                localStorage.setItem('token', response.token);
                this.currentUser = response.user;
                this.updateUserUI();
                
                this.showToast(`Bienvenue dans la famille Shifa, ${response.user.prenom} !`, 'success');
                this.showPage('home');
                
            } catch (error) {
                console.error('❌ Registration error:', error);
                this.handleAuthError(error, 'register');
            } finally {
                this.showRegisterLoading(false);
            }
        });
    }
    
    showLoginLoading(show) {
        const buttonText = document.getElementById('loginButtonText');
        const spinner = document.getElementById('loginSpinner');
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        if (show) {
            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    showRegisterLoading(show) {
        const buttonText = document.getElementById('registerButtonText');
        const spinner = document.getElementById('registerSpinner');
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        
        if (show) {
            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
}

// Global function to toggle password visibility
function togglePasswordVisibility(formId, fieldName = 'password') {
    const form = document.getElementById(formId);
    const passwordInput = fieldName ? form[fieldName] : form.password;
    const icon = passwordInput.parentElement.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

console.log('✅ Enhanced authentication system loaded');
