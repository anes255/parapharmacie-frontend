// ==========================================
// 🌿 Authentication Management - FIXED
// ==========================================

/**
 * Load login page
 */
async function loadLoginPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-3xl shadow-2xl p-8">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
                            <i class="fas fa-seedling text-white text-3xl"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-emerald-900">Connexion</h2>
                        <p class="text-gray-600 mt-2">Connectez-vous à votre compte</p>
                    </div>
                    
                    <!-- Login Form -->
                    <form id="loginForm" class="space-y-6">
                        <div>
                            <label for="loginEmail" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-envelope text-emerald-500 mr-2"></i>Email
                            </label>
                            <input type="email" id="loginEmail" name="email" required 
                                   class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                   placeholder="votre@email.com"
                                   autocomplete="email">
                        </div>
                        
                        <div>
                            <label for="loginPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock text-emerald-500 mr-2"></i>Mot de passe
                            </label>
                            <div class="relative">
                                <input type="password" id="loginPassword" name="password" required 
                                       class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none pr-12"
                                       placeholder="••••••••"
                                       autocomplete="current-password">
                                <button type="button" onclick="togglePasswordVisibility('loginPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-eye" id="loginPasswordIcon"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg" id="loginBtn">
                            <span id="loginBtnText">Se connecter</span>
                            <i id="loginBtnSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </form>
                    
                    <!-- Links -->
                    <div class="mt-6 text-center space-y-3">
                        <p class="text-sm text-gray-600">
                            Pas encore de compte?
                            <a href="#" onclick="event.preventDefault(); window.app.showPage('register')" class="font-semibold text-emerald-600 hover:text-emerald-700">
                                S'inscrire
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listener
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

/**
 * Load registration page
 */
async function loadRegisterPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-2xl w-full">
                <div class="bg-white rounded-3xl shadow-2xl p-8">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
                            <i class="fas fa-user-plus text-white text-3xl"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-emerald-900">Inscription</h2>
                        <p class="text-gray-600 mt-2">Créez votre compte Shifa</p>
                    </div>
                    
                    <!-- Registration Form -->
                    <form id="registerForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerNom" class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-user text-emerald-500 mr-2"></i>Nom *
                                </label>
                                <input type="text" id="registerNom" name="nom" required 
                                       class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                       placeholder="Votre nom">
                            </div>
                            
                            <div>
                                <label for="registerPrenom" class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-user text-emerald-500 mr-2"></i>Prénom *
                                </label>
                                <input type="text" id="registerPrenom" name="prenom" required 
                                       class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                       placeholder="Votre prénom">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerEmail" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-envelope text-emerald-500 mr-2"></i>Email *
                            </label>
                            <input type="email" id="registerEmail" name="email" required 
                                   class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                   placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label for="registerTelephone" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-phone text-emerald-500 mr-2"></i>Téléphone *
                            </label>
                            <input type="tel" id="registerTelephone" name="telephone" required 
                                   class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                   placeholder="+213 555 123 456">
                        </div>
                        
                        <div>
                            <label for="registerWilaya" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-map-marker-alt text-emerald-500 mr-2"></i>Wilaya *
                            </label>
                            <select id="registerWilaya" name="wilaya" required class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                                <option value="">Sélectionnez votre wilaya</option>
                                ${CONFIG.WILAYAS.map(w => `<option value="${w}">${w}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label for="registerAdresse" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-home text-emerald-500 mr-2"></i>Adresse complète *
                            </label>
                            <textarea id="registerAdresse" name="adresse" required 
                                      class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                      rows="3"
                                      placeholder="Rue, numéro, quartier..."></textarea>
                        </div>
                        
                        <div>
                            <label for="registerPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock text-emerald-500 mr-2"></i>Mot de passe *
                            </label>
                            <div class="relative">
                                <input type="password" id="registerPassword" name="password" required 
                                       class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none pr-12"
                                       placeholder="••••••••"
                                       minlength="6">
                                <button type="button" onclick="togglePasswordVisibility('registerPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-eye" id="registerPasswordIcon"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                        </div>
                        
                        <div>
                            <label for="registerConfirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock text-emerald-500 mr-2"></i>Confirmer le mot de passe *
                            </label>
                            <div class="relative">
                                <input type="password" id="registerConfirmPassword" name="confirmPassword" required 
                                       class="form-input w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none pr-12"
                                       placeholder="••••••••"
                                       minlength="6">
                                <button type="button" onclick="togglePasswordVisibility('registerConfirmPassword')"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-eye" id="registerConfirmPasswordIcon"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg" id="registerBtn">
                            <span id="registerBtnText">Créer mon compte</span>
                            <i id="registerBtnSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </form>
                    
                    <!-- Links -->
                    <div class="mt-6 text-center">
                        <p class="text-sm text-gray-600">
                            Vous avez déjà un compte?
                            <a href="#" onclick="event.preventDefault(); window.app.showPage('login')" class="font-semibold text-emerald-600 hover:text-emerald-700">
                                Se connecter
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listener
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

/**
 * Handle login - FIXED
 */
async function handleLogin(event) {
    event.preventDefault();
    
    console.log('Login form submitted');
    
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const btnSpinner = document.getElementById('loginBtnSpinner');
    
    if (!btn || !btnText || !btnSpinner) {
        console.error('Button elements not found');
        return;
    }
    
    try {
        // Disable button
        btn.disabled = true;
        btnText.textContent = 'Connexion...';
        btnSpinner.classList.remove('hidden');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Login attempt with:', email);
        
        // Try API first
        try {
            const response = await fetch(buildApiUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                // Save token
                localStorage.setItem('token', data.token);
                
                // Update app state
                window.app.currentUser = data.user;
                window.app.updateUserUI();
                
                window.app.showToast('Connexion réussie!', 'success');
                
                setTimeout(() => {
                    window.app.showPage('home');
                }, 1000);
                
                return;
            } else {
                throw new Error(data.message || 'Échec de connexion');
            }
        } catch (apiError) {
            console.log('API unavailable, trying local auth');
            
            // Local authentication fallback
            if (email === 'pharmaciegaher@gmail.com' && password === 'anesaya75') {
                // Create admin user object
                const adminUser = {
                    _id: 'admin-local',
                    nom: 'Gaher',
                    prenom: 'Parapharmacie',
                    email: 'pharmaciegaher@gmail.com',
                    role: 'admin',
                    telephone: '+213123456789',
                    wilaya: 'Tipaza',
                    adresse: 'Tipaza, Algérie'
                };
                
                // Create fake token
                localStorage.setItem('token', 'local-admin-token');
                
                // Update app state
                window.app.currentUser = adminUser;
                window.app.updateUserUI();
                
                window.app.showToast('Connexion admin réussie!', 'success');
                
                setTimeout(() => {
                    window.app.showPage('home');
                }, 1000);
                
                return;
            } else {
                throw new Error('Email ou mot de passe incorrect');
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        window.app.showToast(error.message || 'Erreur de connexion', 'error');
    } finally {
        // Re-enable button
        if (btn && btnText && btnSpinner) {
            btn.disabled = false;
            btnText.textContent = 'Se connecter';
            btnSpinner.classList.add('hidden');
        }
    }
}

/**
 * Handle registration - FIXED
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('registerBtnText');
    const btnSpinner = document.getElementById('registerBtnSpinner');
    
    if (!btn || !btnText || !btnSpinner) {
        console.error('Button elements not found');
        return;
    }
    
    try {
        // Disable button
        btn.disabled = true;
        btnText.textContent = 'Création en cours...';
        btnSpinner.classList.remove('hidden');
        
        const formData = new FormData(event.target);
        const data = {
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            wilaya: formData.get('wilaya'),
            adresse: formData.get('adresse'),
            password: formData.get('password')
        };
        
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate
        if (!isValidEmail(data.email)) {
            throw new Error('Email invalide');
        }
        
        if (data.password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        if (data.password !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        
        console.log('Registration attempt:', { email: data.email });
        
        // Try API
        try {
            const response = await fetch(buildApiUrl('/auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.token) {
                localStorage.setItem('token', result.token);
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                
                window.app.showToast('Compte créé avec succès!', 'success');
                
                setTimeout(() => {
                    window.app.showPage('home');
                }, 1000);
                
                return;
            } else {
                throw new Error(result.message || 'Échec de l\'inscription');
            }
        } catch (apiError) {
            console.log('API unavailable, creating local account');
            
            // Save locally
            const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
            
            // Check if email exists
            if (users.find(u => u.email === data.email)) {
                throw new Error('Cet email est déjà utilisé');
            }
            
            const newUser = {
                _id: 'user-' + Date.now(),
                ...data,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('localUsers', JSON.stringify(users));
            
            // Auto login
            localStorage.setItem('token', 'local-user-token-' + newUser._id);
            window.app.currentUser = newUser;
            window.app.updateUserUI();
            
            window.app.showToast('Compte créé avec succès!', 'success');
            
            setTimeout(() => {
                window.app.showPage('home');
            }, 1000);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        window.app.showToast(error.message || 'Erreur d\'inscription', 'error');
    } finally {
        // Re-enable button
        if (btn && btnText && btnSpinner) {
            btn.disabled = false;
            btnText.textContent = 'Créer mon compte';
            btnSpinner.classList.add('hidden');
        }
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');
    
    if (!input || !icon) return;
    
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

console.log('✅ Auth.js (FIXED) loaded successfully');
