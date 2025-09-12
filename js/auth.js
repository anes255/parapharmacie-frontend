// Complete Authentication System for Shifa Parapharmacie

// Login Page
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="fas fa-seedling text-white text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
                    <p class="text-gray-600">Accédez à votre compte Shifa</p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
                    <form id="loginForm" class="space-y-6" onsubmit="handleLogin(event)">
                        <div>
                            <label for="loginEmail" class="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-envelope text-gray-400"></i>
                                </div>
                                <input id="loginEmail" name="email" type="email" required 
                                       class="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10"
                                       placeholder="votre@email.com"
                                       autocomplete="email">
                            </div>
                        </div>
                        
                        <div>
                            <label for="loginPassword" class="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-lock text-gray-400"></i>
                                </div>
                                <input id="loginPassword" name="password" type="password" required 
                                       class="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10"
                                       placeholder="Mot de passe"
                                       autocomplete="current-password">
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input id="rememberMe" name="rememberMe" type="checkbox" 
                                       class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded">
                                <label for="rememberMe" class="ml-2 block text-sm text-gray-900">
                                    Se souvenir de moi
                                </label>
                            </div>
                            
                            <div class="text-sm">
                                <a href="#" onclick="showForgotPassword()" class="font-medium text-emerald-600 hover:text-emerald-500">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>
                        
                        <div>
                            <button type="submit" id="loginSubmitBtn"
                                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <i id="loginIcon" class="fas fa-sign-in-alt text-emerald-300 group-hover:text-emerald-200"></i>
                                    <i id="loginSpinner" class="fas fa-spinner fa-spin text-emerald-300 hidden"></i>
                                </span>
                                <span id="loginText">Se connecter</span>
                            </button>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-sm text-gray-600">
                                Pas encore de compte ? 
                                <a href="#" onclick="app.showPage('register')" class="font-medium text-emerald-600 hover:text-emerald-500">
                                    Créer un compte
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
                
                <!-- Demo Login Info -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <h4 class="text-blue-800 font-semibold mb-2">
                        <i class="fas fa-info-circle mr-2"></i>Compte de démonstration
                    </h4>
                    <div class="text-blue-700 text-sm space-y-1">
                        <p><strong>Admin:</strong> pharmaciegaher@gmail.com</p>
                        <p><strong>Mot de passe:</strong> anesaya75</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Register Page
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-2xl w-full space-y-8">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="fas fa-user-plus text-white text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
                    <p class="text-gray-600">Rejoignez la communauté Shifa</p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
                    <form id="registerForm" class="space-y-6" onsubmit="handleRegister(event)">
                        <!-- Personal Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-medium text-gray-700 mb-2">
                                    Prénom *
                                </label>
                                <input id="registerPrenom" name="prenom" type="text" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Votre prénom">
                            </div>
                            
                            <div>
                                <label for="registerNom" class="block text-sm font-medium text-gray-700 mb-2">
                                    Nom *
                                </label>
                                <input id="registerNom" name="nom" type="text" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Votre nom">
                            </div>
                        </div>
                        
                        <!-- Contact Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerEmail" class="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input id="registerEmail" name="email" type="email" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="votre@email.com">
                            </div>
                            
                            <div>
                                <label for="registerTelephone" class="block text-sm font-medium text-gray-700 mb-2">
                                    Téléphone *
                                </label>
                                <input id="registerTelephone" name="telephone" type="tel" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="+213 XX XX XX XX XX">
                            </div>
                        </div>
                        
                        <!-- Address Information -->
                        <div>
                            <label for="registerAdresse" class="block text-sm font-medium text-gray-700 mb-2">
                                Adresse *
                            </label>
                            <textarea id="registerAdresse" name="adresse" required rows="2"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                      placeholder="Votre adresse complète"></textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerWilaya" class="block text-sm font-medium text-gray-700 mb-2">
                                    Wilaya *
                                </label>
                                <select id="registerWilaya" name="wilaya" required 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
                            
                            <div>
                                <label for="registerCodePostal" class="block text-sm font-medium text-gray-700 mb-2">
                                    Code postal
                                </label>
                                <input id="registerCodePostal" name="codePostal" type="text" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Code postal (optionnel)">
                            </div>
                        </div>
                        
                        <!-- Password -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPassword" class="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe *
                                </label>
                                <input id="registerPassword" name="password" type="password" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Minimum 6 caractères">
                            </div>
                            
                            <div>
                                <label for="registerConfirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmer le mot de passe *
                                </label>
                                <input id="registerConfirmPassword" name="confirmPassword" type="password" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Confirmez votre mot de passe">
                            </div>
                        </div>
                        
                        <!-- Terms and Conditions -->
                        <div class="flex items-center">
                            <input id="acceptTerms" name="acceptTerms" type="checkbox" required
                                   class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded">
                            <label for="acceptTerms" class="ml-2 block text-sm text-gray-900">
                                J'accepte les <a href="#" class="text-emerald-600 hover:text-emerald-500 font-medium">conditions d'utilisation</a> 
                                et la <a href="#" class="text-emerald-600 hover:text-emerald-500 font-medium">politique de confidentialité</a>
                            </label>
                        </div>
                        
                        <div>
                            <button type="submit" id="registerSubmitBtn"
                                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <i id="registerIcon" class="fas fa-user-plus text-emerald-300 group-hover:text-emerald-200"></i>
                                    <i id="registerSpinner" class="fas fa-spinner fa-spin text-emerald-300 hidden"></i>
                                </span>
                                <span id="registerText">Créer mon compte</span>
                            </button>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-sm text-gray-600">
                                Déjà un compte ? 
                                <a href="#" onclick="app.showPage('login')" class="font-medium text-emerald-600 hover:text-emerald-500">
                                    Se connecter
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};

// Profile Page
PharmacieGaherApp.prototype.loadProfilePage = async function() {
    if (!this.currentUser) {
        this.showPage('login');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Mon Profil</h1>
                <p class="text-xl text-gray-600">Gérez vos informations personnelles</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Profile Info -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                        
                        <form id="profileForm" class="space-y-6" onsubmit="handleProfileUpdate(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="profilePrenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                    <input type="text" id="profilePrenom" name="prenom" 
                                           value="${this.currentUser.prenom}"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                                <div>
                                    <label for="profileNom" class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                    <input type="text" id="profileNom" name="nom" 
                                           value="${this.currentUser.nom}"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="profileEmail" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" id="profileEmail" name="email" 
                                           value="${this.currentUser.email}"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readonly>
                                    <p class="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                                </div>
                                <div>
                                    <label for="profileTelephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                    <input type="tel" id="profileTelephone" name="telephone" 
                                           value="${this.currentUser.telephone}"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                            </div>
                            
                            <div>
                                <label for="profileAdresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                                <textarea id="profileAdresse" name="adresse" rows="3"
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">${this.currentUser.adresse}</textarea>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="profileWilaya" class="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                                    <select id="profileWilaya" name="wilaya" 
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="${this.currentUser.wilaya}" selected>${this.currentUser.wilaya}</option>
                                        <!-- Add other wilayas here if needed -->
                                    </select>
                                </div>
                                <div>
                                    <label for="profileCodePostal" class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                                    <input type="text" id="profileCodePostal" name="codePostal" 
                                           value="${this.currentUser.codePostal || ''}"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button type="submit" id="profileSubmitBtn"
                                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                    <span id="profileSubmitText">Mettre à jour</span>
                                    <i id="profileSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Account Actions -->
                <div class="space-y-6">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Compte</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-2">
                                <span class="text-gray-600">Statut:</span>
                                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Actif</span>
                            </div>
                            <div class="flex items-center justify-between py-2">
                                <span class="text-gray-600">Rôle:</span>
                                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">${this.currentUser.role === 'admin' ? 'Administrateur' : 'Client'}</span>
                            </div>
                            <div class="flex items-center justify-between py-2">
                                <span class="text-gray-600">Membre depuis:</span>
                                <span class="text-gray-900">${new Date(this.currentUser.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                        <div class="space-y-3">
                            <button onclick="showChangePasswordModal()" 
                                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all">
                                <i class="fas fa-key mr-2"></i>Changer le mot de passe
                            </button>
                            <button onclick="confirmLogout()" 
                                    class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all">
                                <i class="fas fa-sign-out-alt mr-2"></i>Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginText');
    const submitIcon = document.getElementById('loginIcon');
    const submitSpinner = document.getElementById('loginSpinner');
    
    // Disable form
    submitBtn.disabled = true;
    submitText.textContent = 'Connexion...';
    submitIcon.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        const formData = new FormData(event.target);
        const loginData = {
            email: formData.get('email').trim(),
            password: formData.get('password')
        };
        
        console.log('🔐 Attempting login for:', loginData.email);
        
        // Try to login via API
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginData)
            });
            
            if (response && response.token && response.user) {
                // Save token and user data
                localStorage.setItem('token', response.token);
                
                // Update app state
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                
                window.app.showToast('Connexion réussie !', 'success');
                console.log('✅ Login successful for:', response.user.email);
                
                // Redirect to home or intended page
                window.app.showPage('home');
                return;
            }
        } catch (error) {
            console.error('❌ API login failed:', error.message);
            
            // Fallback: Check for demo admin account
            if (loginData.email === 'pharmaciegaher@gmail.com' && loginData.password === 'anesaya75') {
                console.log('🔄 Using demo admin account');
                
                const demoUser = {
                    _id: 'demo-admin',
                    email: 'pharmaciegaher@gmail.com',
                    nom: 'Gaher',
                    prenom: 'Parapharmacie',
                    role: 'admin',
                    telephone: '+213123456789',
                    adresse: 'Tipaza, Algérie',
                    wilaya: 'Tipaza',
                    actif: true,
                    createdAt: new Date().toISOString()
                };
                
                // Create a demo token
                const demoToken = 'demo-token-' + Date.now();
                localStorage.setItem('token', demoToken);
                
                // Update app state
                window.app.currentUser = demoUser;
                window.app.updateUserUI();
                
                window.app.showToast('Connexion réussie (mode démonstration)', 'success');
                window.app.showPage('home');
                return;
            }
            
            throw new Error('Email ou mot de passe incorrect');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        window.app.showToast(error.message || 'Erreur lors de la connexion', 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitText.textContent = 'Se connecter';
        submitIcon.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerText');
    const submitIcon = document.getElementById('registerIcon');
    const submitSpinner = document.getElementById('registerSpinner');
    
    // Disable form
    submitBtn.disabled = true;
    submitText.textContent = 'Création du compte...';
    submitIcon.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        const formData = new FormData(event.target);
        
        // Validate passwords match
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        
        if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        const registerData = {
            nom: formData.get('nom').trim(),
            prenom: formData.get('prenom').trim(),
            email: formData.get('email').trim(),
            telephone: formData.get('telephone').trim(),
            password: password,
            adresse: formData.get('adresse').trim(),
            wilaya: formData.get('wilaya'),
            codePostal: formData.get('codePostal')?.trim() || ''
        };
        
        console.log('📝 Attempting registration for:', registerData.email);
        
        // Try to register via API
        try {
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(registerData)
            });
            
            if (response && response.token && response.user) {
                // Save token and user data
                localStorage.setItem('token', response.token);
                
                // Update app state
                window.app.currentUser = response.user;
                window.app.updateUserUI();
                
                window.app.showToast('Compte créé avec succès !', 'success');
                console.log('✅ Registration successful for:', response.user.email);
                
                // Redirect to home
                window.app.showPage('home');
                return;
            }
        } catch (error) {
            console.error('❌ API registration failed:', error.message);
            throw new Error(error.message || 'Erreur lors de la création du compte');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        window.app.showToast(error.message || 'Erreur lors de la création du compte', 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitText.textContent = 'Créer mon compte';
        submitIcon.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('profileSubmitBtn');
    const submitText = document.getElementById('profileSubmitText');
    const submitSpinner = document.getElementById('profileSubmitSpinner');
    
    submitBtn.disabled = true;
    submitText.textContent = 'Mise à jour...';
    submitSpinner.classList.remove('hidden');
    
    try {
        const formData = new FormData(event.target);
        const updateData = {
            nom: formData.get('nom').trim(),
            prenom: formData.get('prenom').trim(),
            telephone: formData.get('telephone').trim(),
            adresse: formData.get('adresse').trim(),
            wilaya: formData.get('wilaya'),
            codePostal: formData.get('codePostal')?.trim() || ''
        };
        
        // Try to update via API
        try {
            const response = await apiCall('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (response && response.user) {
                // Update app state
                window.app.currentUser = response.user;
                window.app.showToast('Profil mis à jour avec succès !', 'success');
                return;
            }
        } catch (error) {
            console.error('API profile update failed:', error.message);
            
            // Fallback: Update local user data
            if (window.app.currentUser) {
                Object.assign(window.app.currentUser, updateData);
                window.app.showToast('Profil mis à jour localement', 'warning');
                return;
            }
            
            throw new Error('Erreur lors de la mise à jour du profil');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        window.app.showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Mettre à jour';
        submitSpinner.classList.add('hidden');
    }
}

function showForgotPassword() {
    window.app.showToast('Fonctionnalité bientôt disponible', 'info');
}

function showChangePasswordModal() {
    window.app.showToast('Fonctionnalité bientôt disponible', 'info');
}

function confirmLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.app.logout();
    }
}

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleProfileUpdate = handleProfileUpdate;
window.showForgotPassword = showForgotPassword;
window.showChangePasswordModal = showChangePasswordModal;
window.confirmLogout = confirmLogout;

console.log('✅ Complete auth.js loaded with mobile-friendly authentication');
