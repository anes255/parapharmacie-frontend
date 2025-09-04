// Gestion de l'authentification - Frontend complet

// Page de connexion
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-600/10 to-teal-700/5"></div>
            <div class="absolute top-10 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 right-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl"></div>
            
            <div class="max-w-md w-full space-y-8 relative z-10">
                <div class="text-center">
                    <div class="flex justify-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/50 float-animation">
                            <i class="fas fa-seedling text-white text-3xl drop-shadow-lg"></i>
                        </div>
                    </div>
                    <h2 class="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">Connexion</h2>
                    <p class="text-emerald-600 text-lg">AccÃ©dez Ã  votre espace personnel</p>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                    <form id="loginForm" class="space-y-6" onsubmit="handleLogin(event)">
                        <div class="space-y-6">
                            <div>
                                <label for="loginEmail" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    Adresse email
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-envelope text-emerald-400"></i>
                                    </div>
                                    <input id="loginEmail" name="email" type="email" required
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div>
                                <label for="loginPassword" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    Mot de passe
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-lock text-emerald-400"></i>
                                    </div>
                                    <input id="loginPassword" name="password" type="password" required
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="Votre mot de passe">
                                </div>
                            </div>
                        </div>
                        
                        <div id="loginError" class="hidden bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
                        </div>
                        
                        <div>
                            <button type="submit" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                                    id="loginButton">
                                <span id="loginButtonText" class="flex items-center justify-center">
                                    <i class="fas fa-sign-in-alt mr-3"></i>Se connecter
                                </span>
                                <i id="loginSpinner" class="fas fa-spinner fa-spin hidden"></i>
                            </button>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-emerald-600">
                                Pas encore de compte ?
                                <a href="#" onclick="app.showPage('register')" 
                                   class="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors">
                                    CrÃ©ez votre compte
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
                
                <!-- Informations d'aide -->
                <div class="text-center">
                    <p class="text-emerald-600 text-sm">
                        Besoin d'aide ? 
                        <a href="#" onclick="app.showPage('contact')" class="font-semibold hover:underline">
                            Contactez-nous
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
};

// Page d'inscription
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    const wilayas = [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'BÃ©jaÃ¯a', 
        'Biskra', 'BÃ©char', 'Blida', 'Bouira', 'Tamanrasset', 'TÃ©bessa', 
        'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 
        'SÃ©tif', 'SaÃ¯da', 'Skikda', 'Sidi Bel AbbÃ¨s', 'Annaba', 'Guelma', 
        'Constantine', 'MÃ©dÃ©a', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 
        'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou ArrÃ©ridj', 'BoumeerdÃ¨s', 
        'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 
        'Souk Ahras', 'Tipaza', 'Mila', 'AÃ¯n Defla', 'NaÃ¢ma', 'AÃ¯n TÃ©mouchent', 
        'GhardaÃ¯a', 'Relizane'
    ];
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-600/10 to-teal-700/5"></div>
            <div class="absolute top-10 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 right-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl"></div>
            
            <div class="max-w-2xl w-full space-y-8 relative z-10">
                <div class="text-center">
                    <div class="flex justify-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/50 float-animation">
                            <i class="fas fa-seedling text-white text-3xl drop-shadow-lg"></i>
                        </div>
                    </div>
                    <h2 class="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">Inscription</h2>
                    <p class="text-emerald-600 text-lg">Rejoignez la communautÃ© Shifa</p>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                    <form id="registerForm" class="space-y-6" onsubmit="handleRegister(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerNom" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    Nom *
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-user text-emerald-400"></i>
                                    </div>
                                    <input id="registerNom" name="nom" type="text" required
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="Votre nom">
                                </div>
                            </div>
                            
                            <div>
                                <label for="registerPrenom" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    PrÃ©nom *
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-user text-emerald-400"></i>
                                    </div>
                                    <input id="registerPrenom" name="prenom" type="text" required
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="Votre prÃ©nom">
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerEmail" class="block text-sm font-semibold text-emerald-700 mb-3">
                                Adresse email *
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="fas fa-envelope text-emerald-400"></i>
                                </div>
                                <input id="registerEmail" name="email" type="email" required
                                       class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                       placeholder="votre@email.com">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerTelephone" class="block text-sm font-semibold text-emerald-700 mb-3">
                                TÃ©lÃ©phone *
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="fas fa-phone text-emerald-400"></i>
                                </div>
                                <input id="registerTelephone" name="telephone" type="tel" required
                                       class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                       placeholder="+213 xxx xxx xxx">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerAdresse" class="block text-sm font-semibold text-emerald-700 mb-3">
                                Adresse complÃ¨te *
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="fas fa-map-marker-alt text-emerald-400"></i>
                                </div>
                                <input id="registerAdresse" name="adresse" type="text" required
                                       class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                       placeholder="Votre adresse complÃ¨te">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerWilaya" class="block text-sm font-semibold text-emerald-700 mb-3">
                                Wilaya *
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="fas fa-map text-emerald-400"></i>
                                </div>
                                <select id="registerWilaya" name="wilaya" required 
                                        class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 appearance-none">
                                    <option value="">SÃ©lectionnez votre wilaya</option>
                                    ${wilayas.map(wilaya => `<option value="${wilaya}">${wilaya}</option>`).join('')}
                                </select>
                                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <i class="fas fa-chevron-down text-emerald-400"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPassword" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    Mot de passe *
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-lock text-emerald-400"></i>
                                    </div>
                                    <input id="registerPassword" name="password" type="password" required minlength="6"
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="Au moins 6 caractÃ¨res">
                                </div>
                            </div>
                            
                            <div>
                                <label for="registerConfirmPassword" class="block text-sm font-semibold text-emerald-700 mb-3">
                                    Confirmer le mot de passe *
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-lock text-emerald-400"></i>
                                    </div>
                                    <input id="registerConfirmPassword" name="confirmPassword" type="password" required
                                           class="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 text-emerald-800 placeholder-emerald-400" 
                                           placeholder="Confirmez votre mot de passe">
                                </div>
                            </div>
                        </div>
                        
                        <div id="registerError" class="hidden bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
                        </div>
                        
                        <div>
                            <button type="submit" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                                    id="registerButton">
                                <span id="registerButtonText" class="flex items-center justify-center">
                                    <i class="fas fa-user-plus mr-3"></i>CrÃ©er mon compte
                                </span>
                                <i id="registerSpinner" class="fas fa-spinner fa-spin hidden"></i>
                            </button>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-emerald-600">
                                DÃ©jÃ  un compte ?
                                <a href="#" onclick="app.showPage('login')" 
                                   class="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors">
                                    Connectez-vous
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};

// Page de profil
PharmacieGaherApp.prototype.loadProfilePage = async function() {
    if (!this.currentUser) {
        this.showPage('login');
        return;
    }

    const mainContent = document.getElementById('mainContent');
    
    const wilayas = [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'BÃ©jaÃ¯a', 
        'Biskra', 'BÃ©char', 'Blida', 'Bouira', 'Tamanrasset', 'TÃ©bessa', 
        'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 
        'SÃ©tif', 'SaÃ¯da', 'Skikda', 'Sidi Bel AbbÃ¨s', 'Annaba', 'Guelma', 
        'Constantine', 'MÃ©dÃ©a', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 
        'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou ArrÃ©ridj', 'BoumeerdÃ¨s', 
        'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 
        'Souk Ahras', 'Tipaza', 'Mila', 'AÃ¯n Defla', 'NaÃ¢ma', 'AÃ¯n TÃ©mouchent', 
        'GhardaÃ¯a', 'Relizane'
    ];
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-emerald-200/50">
                <div class="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-8">
                    <div class="flex items-center">
                        <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6 border-2 border-white/30">
                            <i class="fas fa-user text-white text-3xl"></i>
                        </div>
                        <div class="text-white">
                            <h1 class="text-3xl font-bold drop-shadow-md">${this.currentUser.prenom} ${this.currentUser.nom}</h1>
                            <p class="text-lg opacity-90 text-emerald-100">${this.currentUser.email}</p>
                            <span class="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mt-2 font-semibold border border-white/30">
                                ${this.currentUser.role === 'admin' ? 'Administrateur' : 'Client Shifa'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Menu de navigation -->
                        <div class="lg:col-span-1">
                            <nav class="space-y-2">
                                <button onclick="showProfileSection('info')" 
                                        class="profile-nav-btn active w-full text-left px-6 py-4 rounded-xl bg-emerald-100 font-semibold text-emerald-700 border-2 border-emerald-200">
                                    <i class="fas fa-user mr-3"></i>Informations personnelles
                                </button>
                                <button onclick="showProfileSection('orders')" 
                                        class="profile-nav-btn w-full text-left px-6 py-4 rounded-xl hover:bg-emerald-50 font-semibold text-emerald-600 border-2 border-transparent hover:border-emerald-200 transition-all">
                                    <i class="fas fa-box mr-3"></i>Mes commandes
                                </button>
                                <button onclick="showProfileSection('security')" 
                                        class="profile-nav-btn w-full text-left px-6 py-4 rounded-xl hover:bg-emerald-50 font-semibold text-emerald-600 border-2 border-transparent hover:border-emerald-200 transition-all">
                                    <i class="fas fa-shield-alt mr-3"></i>SÃ©curitÃ©
                                </button>
                            </nav>
                        </div>
                        
                        <!-- Contenu -->
                        <div class="lg:col-span-2">
                            <!-- Section Informations -->
                            <div id="profileInfo" class="profile-section">
                                <h3 class="text-xl font-semibold mb-6 text-emerald-800">Informations personnelles</h3>
                                
                                <form id="profileForm" onsubmit="handleUpdateProfile(event)" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Nom</label>
                                            <input type="text" name="nom" value="${this.currentUser.nom}" 
                                                   class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold text-emerald-700 mb-2">PrÃ©nom</label>
                                            <input type="text" name="prenom" value="${this.currentUser.prenom}" 
                                                   class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" required>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-emerald-700 mb-2">Email</label>
                                        <input type="email" value="${this.currentUser.email}" 
                                               class="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600" readonly>
                                        <p class="text-sm text-emerald-600 mt-1">L'email ne peut pas Ãªtre modifiÃ©</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-emerald-700 mb-2">TÃ©lÃ©phone</label>
                                        <input type="tel" name="telephone" value="${this.currentUser.telephone || ''}" 
                                               class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" required>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-emerald-700 mb-2">Adresse</label>
                                        <input type="text" name="adresse" value="${this.currentUser.adresse || ''}" 
                                               class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" required>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-emerald-700 mb-2">Wilaya</label>
                                        <select name="wilaya" class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" required>
                                            ${wilayas.map(wilaya => 
                                                `<option value="${wilaya}" ${wilaya === this.currentUser.wilaya ? 'selected' : ''}>${wilaya}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="pt-4">
                                        <button type="submit" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                            <i class="fas fa-save mr-2"></i>Sauvegarder
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Section Commandes -->
                            <div id="profileOrders" class="profile-section hidden">
                                <h3 class="text-xl font-semibold mb-6 text-emerald-800">Mes commandes</h3>
                                <div id="userOrders">
                                    <div class="text-center py-8">
                                        <i class="fas fa-box text-4xl text-emerald-200 mb-4"></i>
                                        <p class="text-emerald-600">Aucune commande trouvÃ©e</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Section SÃ©curitÃ© -->
                            <div id="profileSecurity" class="profile-section hidden">
                                <h3 class="text-xl font-semibold mb-6 text-emerald-800">SÃ©curitÃ©</h3>
                                
                                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                                    <div class="flex">
                                        <i class="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
                                        <div>
                                            <h4 class="font-semibold text-yellow-800">Changement de mot de passe</h4>
                                            <p class="text-sm text-yellow-700 mt-1">
                                                Pour modifier votre mot de passe, veuillez nous contacter Ã  
                                                <a href="mailto:pharmaciegaher@gmail.com" class="font-semibold underline">
                                                    pharmaciegaher@gmail.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <div>
                                            <h4 class="font-semibold text-emerald-800">Session active</h4>
                                            <p class="text-sm text-emerald-600">ConnectÃ© depuis cet appareil</p>
                                        </div>
                                        <button onclick="app.logout()" class="bg-white text-emerald-600 border-2 border-emerald-200 px-6 py-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all font-semibold">
                                            Se dÃ©connecter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Charger les commandes automatiquement
    setTimeout(() => {
        if (document.getElementById('userOrders')) {
            loadUserOrders();
        }
    }, 100);
};

// Fonctions de gestion de l'authentification
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const button = document.getElementById('loginButton');
    const buttonText = document.getElementById('loginButtonText');
    const spinner = document.getElementById('loginSpinner');
    const errorDiv = document.getElementById('loginError');
    
    // DÃ©sactiver le bouton et afficher le spinner
    button.disabled = true;
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';
    errorDiv.classList.add('hidden');
    
    try {
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        const response = await fetch(buildApiUrl('/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Sauvegarder le token
            localStorage.setItem('token', result.token);
            
            // Mettre Ã  jour l'utilisateur actuel
            app.currentUser = result.user;
            app.updateUserUI();
            
            app.showToast('Connexion rÃ©ussie', 'success');
            app.showPage('home');
        } else {
            throw new Error(result.message || 'Erreur de connexion');
        }
        
    } catch (error) {
        console.error('Erreur login:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        // RÃ©activer le bouton
        button.disabled = false;
        buttonText.style.display = 'flex';
        spinner.style.display = 'none';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const button = document.getElementById('registerButton');
    const buttonText = document.getElementById('registerButtonText');
    const spinner = document.getElementById('registerSpinner');
    const errorDiv = document.getElementById('registerError');
    
    // VÃ©rifier que les mots de passe correspondent
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // DÃ©sactiver le bouton et afficher le spinner
    button.disabled = true;
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';
    errorDiv.classList.add('hidden');
    
    try {
        const registerData = {
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            adresse: formData.get('adresse'),
            wilaya: formData.get('wilaya'),
            password: formData.get('password')
        };
        
        const response = await fetch(buildApiUrl('/auth/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Sauvegarder le token
            localStorage.setItem('token', result.token);
            
            // Mettre Ã  jour l'utilisateur actuel
            app.currentUser = result.user;
            app.updateUserUI();
            
            app.showToast('Inscription rÃ©ussie', 'success');
            app.showPage('home');
        } else {
            throw new Error(result.message || 'Erreur lors de l\'inscription');
        }
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        // RÃ©activer le bouton
        button.disabled = false;
        buttonText.style.display = 'flex';
        spinner.style.display = 'none';
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const profileData = {
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            telephone: formData.get('telephone'),
            adresse: formData.get('adresse'),
            wilaya: formData.get('wilaya')
        };
        
        const response = await fetch(buildApiUrl('/auth/profile'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Mettre Ã  jour l'utilisateur actuel
            app.currentUser = { ...app.currentUser, ...profileData };
            
            app.showToast('Profil mis Ã  jour avec succÃ¨s', 'success');
            
            // Recharger la page de profil pour reflÃ©ter les changements
            app.loadProfilePage();
        } else {
            throw new Error(result.message || 'Erreur lors de la mise Ã  jour');
        }
        
    } catch (error) {
        console.error('Erreur mise Ã  jour profil:', error);
        app.showToast('Erreur lors de la mise Ã  jour du profil', 'error');
    }
}

// Fonctions utilitaires pour le profil
function showProfileSection(section) {
    // Masquer toutes les sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // RÃ©initialiser tous les boutons de navigation
    document.querySelectorAll('.profile-nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-emerald-100', 'text-emerald-700', 'border-emerald-200');
        btn.classList.add('hover:bg-emerald-50', 'text-emerald-600', 'border-transparent', 'hover:border-emerald-200');
    });
    
    // Activer le bouton correspondant
    event.target.classList.add('active', 'bg-emerald-100', 'text-emerald-700', 'border-emerald-200');
    event.target.classList.remove('hover:bg-emerald-50', 'text-emerald-600', 'border-transparent', 'hover:border-emerald-200');
    
    // Afficher la section correspondante
    const targetSection = document.getElementById('profile' + section.charAt(0).toUpperCase() + section.slice(1));
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Charger les commandes si nÃ©cessaire
    if (section === 'orders') {
        loadUserOrders();
    }
}

async function loadUserOrders() {
    const ordersContainer = document.getElementById('userOrders');
    
    ordersContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-2xl text-emerald-400 mb-4"></i>
            <p class="text-emerald-600">Chargement des commandes...</p>
        </div>
    `;
    
    try {
        const response = await fetch(buildApiUrl('/orders/user/all'), {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        
        if (response.ok) {
            const orders = await response.json();
            
            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-box text-4xl text-emerald-200 mb-4"></i>
                        <p class="text-emerald-600">Aucune commande trouvÃ©e</p>
                        <button onclick="app.showPage('products')" class="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                            Commencer mes achats
                        </button>
                    </div>
                `;
            } else {
                ordersContainer.innerHTML = orders.map(order => `
                    <div class="bg-white/60 border border-emerald-200 rounded-xl p-6 mb-4 hover:shadow-lg transition-all">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h4 class="font-bold text-emerald-800">Commande #${order.numeroCommande}</h4>
                                <p class="text-sm text-emerald-600">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="status-badge status-${order.statut}">${getOrderStatusLabel(order.statut)}</span>
                                <span class="font-bold text-emerald-700">${order.total} DA</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-emerald-700">Articles:</span>
                                <span class="text-emerald-600">${order.articles.length} produit${order.articles.length > 1 ? 's' : ''}</span>
                            </div>
                            <div>
                                <span class="font-medium text-emerald-700">Paiement:</span>
                                <span class="text-emerald-600">${order.modePaiement}</span>
                            </div>
                            <div>
                                <span class="font-medium text-emerald-700">Livraison:</span>
                                <span class="text-emerald-600">${order.fraisLivraison === 0 ? 'Gratuite' : order.fraisLivraison + ' DA'}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            throw new Error('Erreur lors du chargement des commandes');
        }
        
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        ordersContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                <p class="text-red-600">Erreur lors du chargement des commandes</p>
            </div>
        `;
    }
}

function getOrderStatusLabel(status) {
    const statusLabels = {
        'en-attente': 'En attente',
        'confirmÃ©e': 'ConfirmÃ©e',
        'prÃ©parÃ©e': 'PrÃ©parÃ©e',
        'expÃ©diÃ©e': 'ExpÃ©diÃ©e',
        'livrÃ©e': 'LivrÃ©e',
        'annulÃ©e': 'AnnulÃ©e'
    };
    return statusLabels[status] || status;
}

// Enhanced authentication methods for app.js integration
PharmacieGaherApp.prototype.checkAuth = async function() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(buildApiUrl('/auth/profile'), {
                headers: {
                    'x-auth-token': token
                }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserUI();
                console.log('âœ… User authenticated:', this.currentUser.email);
            } else {
                console.log('âŒ Invalid token, removing from storage');
                localStorage.removeItem('token');
                this.currentUser = null;
                this.updateUserUI();
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            localStorage.removeItem('token');
            this.currentUser = null;
            this.updateUserUI();
        }
    } else {
        this.currentUser = null;
        this.updateUserUI();
    }
};

// Enhanced updateUserUI method
PharmacieGaherApp.prototype.updateUserUI = function() {
    const guestMenu = document.getElementById('guestMenu');
    const userLoggedMenu = document.getElementById('userLoggedMenu');
    const adminMenuLink = document.getElementById('adminMenuLink');
    
    if (this.currentUser) {
        // User is logged in
        if (guestMenu) guestMenu.style.display = 'none';
        if (userLoggedMenu) userLoggedMenu.style.display = 'block';
        
        // Show admin menu if user is admin
        if (this.currentUser.role === 'admin' && adminMenuLink) {
            adminMenuLink.style.display = 'block';
        } else if (adminMenuLink) {
            adminMenuLink.style.display = 'none';
        }
        
        console.log('UI updated for user:', this.currentUser.prenom, this.currentUser.nom);
    } else {
        // User is not logged in
        if (guestMenu) guestMenu.style.display = 'block';
        if (userLoggedMenu) userLoggedMenu.style.display = 'none';
        if (adminMenuLink) adminMenuLink.style.display = 'none';
    }
};

// Enhanced logout method
PharmacieGaherApp.prototype.logout = function() {
    localStorage.removeItem('token');
    this.currentUser = null;
    this.updateUserUI();
    this.showToast('DÃ©connexion rÃ©ussie', 'success');
    this.showPage('home');
};

// Method to check if user is authenticated for protected actions
PharmacieGaherApp.prototype.requireAuth = function() {
    if (!this.currentUser) {
        this.showToast('Veuillez vous connecter pour continuer', 'warning');
        this.showPage('login');
        return false;
    }
    return true;
};

// Method to check if user is admin
PharmacieGaherApp.prototype.requireAdmin = function() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
        this.showToast('AccÃ¨s administrateur requis', 'error');
        this.showPage('home');
        return false;
    }
    return true;
};

// Enhanced error handling for authentication
PharmacieGaherApp.prototype.handleAuthError = function(error, context = '') {
    console.error(`Auth Error ${context}:`, error);
    
    if (error.message.includes('401') || error.message.includes('Token invalide')) {
        // Token expired or invalid
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Session expirÃ©e. Veuillez vous reconnecter.', 'warning');
        this.showPage('login');
    } else if (error.message.includes('403')) {
        this.showToast('AccÃ¨s refusÃ©', 'error');
    } else if (error.message.includes('404')) {
        this.showToast('Ressource non trouvÃ©e', 'error');
    } else if (error.message.includes('500')) {
        this.showToast('Erreur serveur. Veuillez rÃ©essayer plus tard.', 'error');
    } else {
        this.showToast(error.message || 'Une erreur est survenue', 'error');
    }
};