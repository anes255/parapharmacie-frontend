// Authentication System for Shifa Parapharmacie

// Load login page
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-md">
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">Connexion</h1>
                    <p class="text-emerald-600">Accédez à votre compte</p>
                </div>
                
                <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                    <div>
                        <label for="loginEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input type="email" id="loginEmail" name="email" required 
                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                               placeholder="votre@email.com">
                    </div>
                    
                    <div>
                        <label for="loginPassword" class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                        <input type="password" id="loginPassword" name="password" required 
                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                               placeholder="Votre mot de passe">
                    </div>
                    
                    <button type="submit" id="loginSubmitBtn" 
                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold">
                        <span id="loginSubmitText">Se connecter</span>
                        <i id="loginSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        Pas encore de compte ? 
                        <a href="#" onclick="app.showPage('register')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Créer un compte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
};

// Load register page
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-md">
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-plus text-white text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">Inscription</h1>
                    <p class="text-emerald-600">Créez votre compte</p>
                </div>
                
                <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="registerPrenom" class="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                            <input type="text" id="registerPrenom" name="prenom" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                   placeholder="Prénom">
                        </div>
                        <div>
                            <label for="registerNom" class="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                            <input type="text" id="registerNom" name="nom" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                   placeholder="Nom">
                        </div>
                    </div>
                    
                    <div>
                        <label for="registerEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input type="email" id="registerEmail" name="email" required 
                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                               placeholder="votre@email.com">
                    </div>
                    
                    <div>
                        <label for="registerPassword" class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                        <input type="password" id="registerPassword" name="password" required 
                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                               placeholder="Mot de passe">
                    </div>
                    
                    <button type="submit" id="registerSubmitBtn" 
                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold">
                        <span id="registerSubmitText">Créer mon compte</span>
                        <i id="registerSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        Déjà un compte ? 
                        <a href="#" onclick="app.showPage('login')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
};

// Load profile page
PharmacieGaherApp.prototype.loadProfilePage = async function() {
    if (!this.currentUser) {
        this.showPage('login');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-emerald-800 mb-4">Mon Profil</h1>
                <p class="text-xl text-emerald-600">Gérez vos informations personnelles</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Profile Info -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations personnelles</h2>
                        
                        <form id="profileForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                                    <input type="text" value="${this.currentUser.prenom || ''}" 
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                                    <input type="text" value="${this.currentUser.nom || ''}" 
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input type="email" value="${this.currentUser.email || ''}" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            
                            <button type="submit" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-bold">
                                Mettre à jour
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Profile Summary -->
                <div class="space-y-6">
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <div class="text-center">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-white text-2xl font-bold">
                                    ${(this.currentUser.prenom?.[0] || '') + (this.currentUser.nom?.[0] || '')}
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-emerald-800">${this.currentUser.prenom} ${this.currentUser.nom}</h3>
                            <p class="text-emerald-600">${this.currentUser.email}</p>
                            ${this.currentUser.role === 'admin' ? '<p class="text-red-600 font-semibold mt-2">Administrateur</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-bold text-emerald-800 mb-4">Actions rapides</h3>
                        <div class="space-y-3">
                            <button onclick="app.showPage('orders')" class="w-full bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg hover:bg-emerald-100 transition-all text-left">
                                <i class="fas fa-box mr-3"></i>Mes commandes
                            </button>
                            ${this.currentUser.role === 'admin' ? `
                            <button onclick="app.showPage('admin')" class="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-all text-left">
                                <i class="fas fa-cog mr-3"></i>Administration
                            </button>
                            ` : ''}
                            <button onclick="logout()" class="w-full bg-red-50 text-red-700 px-4 py-3 rounded-lg hover:bg-red-100 transition-all text-left">
                                <i class="fas fa-sign-out-alt mr-3"></i>Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');
    const submitSpinner = document.getElementById('loginSubmitSpinner');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        // Try API login first
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                window.app.showToast('Connexion réussie !', 'success');
                window.app.showPage('home');
                return;
            }
        } catch (apiError) {
            console.log('API login failed, trying demo login');
        }
        
        // Demo login for development
        if (email === 'admin@shifa.dz' && password === 'admin123') {
            const demoUser = {
                id: 'demo-admin',
                email: 'admin@shifa.dz',
                prenom: 'Admin',
                nom: 'Shifa',
                role: 'admin'
            };
            
            localStorage.setItem('token', 'demo-token-admin');
            window.app.currentUser = demoUser;
            window.app.updateUserUI();
            window.app.showToast('Connexion administrateur réussie !', 'success');
            window.app.showPage('admin');
        } else if (email === 'user@shifa.dz' && password === 'user123') {
            const demoUser = {
                id: 'demo-user',
                email: 'user@shifa.dz',
                prenom: 'Client',
                nom: 'Test',
                role: 'user'
            };
            
            localStorage.setItem('token', 'demo-token-user');
            window.app.currentUser = demoUser;
            window.app.updateUserUI();
            window.app.showToast('Connexion réussie !', 'success');
            window.app.showPage('home');
        } else {
            throw new Error('Email ou mot de passe incorrect');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        window.app.showToast(error.message || 'Erreur de connexion', 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const prenom = document.getElementById('registerPrenom').value.trim();
    const nom = document.getElementById('registerNom').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const submitSpinner = document.getElementById('registerSubmitSpinner');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        // Validate form
        if (!prenom || !nom || !email || !password) {
            throw new Error('Tous les champs sont requis');
        }
        
        if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        // Try API registration first
        try {
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ prenom, nom, email, password })
            });
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                window.app.showToast('Inscription réussie ! Bienvenue !', 'success');
                window.app.showPage('home');
                return;
            }
        } catch (apiError) {
            console.log('API registration failed, using demo registration');
        }
        
        // Demo registration for development
        const newUser = {
            id: 'demo-' + Date.now(),
            email,
            prenom,
            nom,
            role: 'user'
        };
        
        localStorage.setItem('token', 'demo-token-' + Date.now());
        window.app.currentUser = newUser;
        window.app.updateUserUI();
        window.app.showToast('Inscription réussie ! Bienvenue !', 'success');
        window.app.showPage('home');
        
    } catch (error) {
        console.error('Register error:', error);
        window.app.showToast(error.message || 'Erreur lors de l\'inscription', 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

// Export functions
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;

console.log('✅ Auth.js loaded successfully');
