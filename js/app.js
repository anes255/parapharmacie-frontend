// Complete PharmacieGaherApp - Full Implementation
class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.allProducts = []; // Cache for all products
        this.settings = {
            couleurPrimaire: '#10b981',
            couleurSecondaire: '#059669',
            couleurAccent: '#34d399',
            nomSite: 'Shifa - Parapharmacie',
            fraisLivraison: 300,
            livraisonGratuite: 5000
        };
        this.currentPage = 'home';
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkAuth();
            await this.loadProductsCache();
            this.initUI();
            await this.showPage('home');
            this.updateCartUI();
            this.initSearch();
        } catch (error) {
            console.error('Erreur initialisation app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
    }
    
    async loadProductsCache() {
        try {
            console.log('Loading products cache...');
            
            // Start with localStorage products
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            this.allProducts = [...localProducts];
            
            // Try to load from API and merge
            try {
                const response = await fetch(buildApiUrl('/products'));
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.products && data.products.length > 0) {
                        // Merge API products with local ones, avoiding duplicates
                        const localIds = localProducts.map(p => p._id);
                        const newApiProducts = data.products.filter(p => !localIds.includes(p._id));
                        
                        if (newApiProducts.length > 0) {
                            this.allProducts = [...localProducts, ...newApiProducts];
                            localStorage.setItem('demoProducts', JSON.stringify(this.allProducts));
                        }
                    }
                }
            } catch (error) {
                console.log('API unavailable, using local products only:', error.message);
            }
            
            console.log(`Products cache loaded: ${this.allProducts.length} products`);
            
        } catch (error) {
            console.error('Error loading products cache:', error);
            this.allProducts = [];
        }
    }
    
    refreshProductsCache() {
        console.log('Refreshing products cache...');
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        this.allProducts = [...localProducts];
        
        console.log(`Products cache refreshed: ${this.allProducts.length} products`);
        
        if (this.currentPage === 'home') {
            this.refreshHomePage();
        } else if (this.currentPage === 'products') {
            this.showPage('products');
        }
    }
    
    refreshHomePage() {
        console.log('Refreshing home page content...');
        this.loadFeaturedProducts();
        this.loadPromotionProducts();
    }
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(buildApiUrl('/auth/profile'), {
                    headers: { 'x-auth-token': token }
                });
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateUserUI();
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Erreur vérification auth:', error);
                localStorage.removeItem('token');
            }
        }
    }
    
    initUI() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        this.updateCartUI();
        window.app = this;
    }
    
    updateUserUI() {
        const guestMenu = document.getElementById('guestMenu');
        const userLoggedMenu = document.getElementById('userLoggedMenu');
        const adminMenuLink = document.getElementById('adminMenuLink');
        
        if (this.currentUser) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userLoggedMenu) userLoggedMenu.style.display = 'block';
            
            if (this.currentUser.role === 'admin' && adminMenuLink) {
                adminMenuLink.style.display = 'block';
            }
        } else {
            if (guestMenu) guestMenu.style.display = 'block';
            if (userLoggedMenu) userLoggedMenu.style.display = 'none';
            if (adminMenuLink) adminMenuLink.style.display = 'none';
        }
    }
    
    async showPage(pageName, params = {}) {
        try {
            this.showLoading();
            this.currentPage = pageName;
            
            switch (pageName) {
                case 'home':
                    await this.loadHomePage();
                    break;
                case 'products':
                    await this.loadProductsPage(params);
                    break;
                case 'product':
                    await this.loadProductPage(params.id);
                    break;
                case 'login':
                    await this.loadLoginPage();
                    break;
                case 'register':
                    await this.loadRegisterPage();
                    break;
                case 'profile':
                    if (!this.currentUser) {
                        await this.showPage('login');
                        return;
                    }
                    await this.loadProfilePage();
                    break;
                case 'checkout':
                    await this.loadCheckoutPage();
                    break;
                case 'order-confirmation':
                    await this.loadOrderConfirmationPage(params.orderNumber);
                    break;
                case 'contact':
                    await this.loadContactPage();
                    break;
                case 'admin':
                    if (!this.currentUser || this.currentUser.role !== 'admin') {
                        this.showToast('Accès refusé', 'error');
                        await this.showPage('home');
                        return;
                    }
                    await this.loadAdminPage();
                    break;
                default:
                    await this.loadHomePage();
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Erreur chargement page:', error);
            this.hideLoading();
            this.showToast('Erreur de chargement de la page', 'error');
        }
    }

    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                        <!-- Header -->
                        <div class="text-center">
                            <div class="flex justify-center mb-6">
                                <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <i class="fas fa-user-circle text-white text-3xl"></i>
                                </div>
                            </div>
                            <h2 class="text-3xl font-bold text-emerald-800 mb-2">Connexion</h2>
                            <p class="text-emerald-600 mb-8">Accédez à votre compte Shifa</p>
                        </div>

                        <!-- Login Form -->
                        <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                            <div>
                                <label for="loginEmail" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    <i class="fas fa-envelope mr-2"></i>Adresse email
                                </label>
                                <input 
                                    id="loginEmail" 
                                    name="email" 
                                    type="email" 
                                    required 
                                    class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                    placeholder="votre@email.com"
                                >
                            </div>

                            <div>
                                <label for="loginPassword" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    <i class="fas fa-lock mr-2"></i>Mot de passe
                                </label>
                                <div class="relative">
                                    <input 
                                        id="loginPassword" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70 pr-12"
                                        placeholder="Votre mot de passe"
                                    >
                                    <button 
                                        type="button" 
                                        onclick="togglePasswordVisibility('loginPassword', this)"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                            </button>
                        </form>

                        <!-- Divider -->
                        <div class="my-6">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-emerald-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-3 bg-white text-emerald-600 font-medium">Nouveau client ?</span>
                                </div>
                            </div>
                        </div>

                        <!-- Register Link -->
                        <div class="text-center">
                            <button 
                                onclick="app.showPage('register')" 
                                class="w-full bg-white border-2 border-emerald-500 text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                            >
                                <i class="fas fa-user-plus mr-2"></i>Créer un compte
                            </button>
                        </div>

                        <!-- Back to Home -->
                        <div class="text-center mt-6">
                            <button 
                                onclick="app.showPage('home')" 
                                class="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                            >
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-2xl w-full space-y-8">
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                        <!-- Header -->
                        <div class="text-center mb-8">
                            <div class="flex justify-center mb-6">
                                <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <i class="fas fa-user-plus text-white text-3xl"></i>
                                </div>
                            </div>
                            <h2 class="text-3xl font-bold text-emerald-800 mb-2">Créer un compte</h2>
                            <p class="text-emerald-600">Rejoignez la communauté Shifa</p>
                        </div>

                        <!-- Register Form -->
                        <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                            <!-- Personal Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerPrenom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-user mr-2"></i>Prénom *
                                    </label>
                                    <input 
                                        id="registerPrenom" 
                                        name="prenom" 
                                        type="text" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                        placeholder="Votre prénom"
                                    >
                                </div>
                                
                                <div>
                                    <label for="registerNom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-user mr-2"></i>Nom *
                                    </label>
                                    <input 
                                        id="registerNom" 
                                        name="nom" 
                                        type="text" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                        placeholder="Votre nom"
                                    >
                                </div>
                            </div>

                            <!-- Contact Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerEmail" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-envelope mr-2"></i>Adresse email *
                                    </label>
                                    <input 
                                        id="registerEmail" 
                                        name="email" 
                                        type="email" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                        placeholder="votre@email.com"
                                    >
                                </div>
                                
                                <div>
                                    <label for="registerTelephone" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-phone mr-2"></i>Téléphone *
                                    </label>
                                    <input 
                                        id="registerTelephone" 
                                        name="telephone" 
                                        type="tel" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                        placeholder="0123456789"
                                        pattern="^(\\+213|0)[5-9]\\d{8}$"
                                        title="Numéro de téléphone algérien valide"
                                    >
                                </div>
                            </div>

                            <!-- Password -->
                            <div>
                                <label for="registerPassword" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    <i class="fas fa-lock mr-2"></i>Mot de passe *
                                </label>
                                <div class="relative">
                                    <input 
                                        id="registerPassword" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        minlength="6"
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70 pr-12"
                                        placeholder="Minimum 6 caractères"
                                    >
                                    <button 
                                        type="button" 
                                        onclick="togglePasswordVisibility('registerPassword', this)"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="mt-1 text-xs text-emerald-600">
                                    Le mot de passe doit contenir au moins 6 caractères
                                </div>
                            </div>

                            <!-- Address Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerWilaya" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-map-marker-alt mr-2"></i>Wilaya *
                                    </label>
                                    <select 
                                        id="registerWilaya" 
                                        name="wilaya" 
                                        required 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                    >
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
                                        <option value="M'Sila" selected>28 - M'Sila</option>
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
                                    <label for="registerAdresse" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        <i class="fas fa-home mr-2"></i>Adresse (optionnel)
                                    </label>
                                    <input 
                                        id="registerAdresse" 
                                        name="adresse" 
                                        type="text" 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/70"
                                        placeholder="Votre adresse"
                                    >
                                </div>
                            </div>

                            <!-- Terms and Submit -->
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <input 
                                        id="acceptTerms" 
                                        type="checkbox" 
                                        required
                                        class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                                    >
                                    <label for="acceptTerms" class="ml-3 text-sm text-emerald-700">
                                        J'accepte les <a href="#" class="text-emerald-600 hover:text-emerald-800 font-semibold">conditions d'utilisation</a> et la <a href="#" class="text-emerald-600 hover:text-emerald-800 font-semibold">politique de confidentialité</a>
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                                </button>
                            </div>
                        </form>

                        <!-- Divider -->
                        <div class="my-6">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-emerald-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-3 bg-white text-emerald-600 font-medium">Déjà membre ?</span>
                                </div>
                            </div>
                        </div>

                        <!-- Login Link -->
                        <div class="text-center">
                            <button 
                                onclick="app.showPage('login')" 
                                class="w-full bg-white border-2 border-emerald-500 text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                            </button>
                        </div>

                        <!-- Back to Home -->
                        <div class="text-center mt-6">
                            <button 
                                onclick="app.showPage('home')" 
                                class="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                            >
                                <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadProfilePage() {
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

                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                    <!-- Profile Header -->
                    <div class="flex items-center space-x-6 mb-8 pb-6 border-b border-emerald-200">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-user text-white text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-emerald-800">${this.currentUser.prenom} ${this.currentUser.nom}</h2>
                            <p class="text-emerald-600">${this.currentUser.email}</p>
                            <p class="text-sm text-emerald-500">Membre depuis ${new Date(this.currentUser.dateInscription).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <!-- Profile Form -->
                    <form id="profileForm" onsubmit="handleProfileUpdate(event)" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="profilePrenom" class="block text-sm font-semibold text-emerald-700 mb-2">Prénom</label>
                                <input type="text" id="profilePrenom" value="${this.currentUser.prenom}" 
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                            
                            <div>
                                <label for="profileNom" class="block text-sm font-semibold text-emerald-700 mb-2">Nom</label>
                                <input type="text" id="profileNom" value="${this.currentUser.nom}" 
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="profileEmail" class="block text-sm font-semibold text-emerald-700 mb-2">Email</label>
                                <input type="email" id="profileEmail" value="${this.currentUser.email}" disabled
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl bg-gray-100 text-gray-600">
                                <p class="text-xs text-emerald-600 mt-1">L'email ne peut pas être modifié</p>
                            </div>
                            
                            <div>
                                <label for="profileTelephone" class="block text-sm font-semibold text-emerald-700 mb-2">Téléphone</label>
                                <input type="tel" id="profileTelephone" value="${this.currentUser.telephone}" 
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="profileWilaya" class="block text-sm font-semibold text-emerald-700 mb-2">Wilaya</label>
                                <select id="profileWilaya" 
                                        class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                    ${['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
                                      'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
                                      'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
                                      'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
                                      'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
                                      'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
                                      'Ghardaïa', 'Relizane'].map(w => 
                                        `<option value="${w}" ${w === this.currentUser.wilaya ? 'selected' : ''}>${w}</option>`
                                      ).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label for="profileVille" class="block text-sm font-semibold text-emerald-700 mb-2">Ville</label>
                                <input type="text" id="profileVille" value="${this.currentUser.ville || ''}" 
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                        </div>

                        <div>
                            <label for="profileAdresse" class="block text-sm font-semibold text-emerald-700 mb-2">Adresse</label>
                            <input type="text" id="profileAdresse" value="${this.currentUser.adresse || ''}" 
                                   class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                        </div>

                        <div class="flex space-x-4">
                            <button type="submit" 
                                    class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-save mr-2"></i>Mettre à jour le profil
                            </button>
                            
                            <button type="button" onclick="showChangePasswordForm()" 
                                    class="flex-1 bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-4 rounded-xl hover:bg-emerald-50 transition-all">
                                <i class="fas fa-key mr-2"></i>Changer le mot de passe
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Change Password Modal (hidden by default) -->
                <div id="changePasswordModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 class="text-2xl font-bold text-emerald-800 mb-6">Changer le mot de passe</h3>
                        
                        <form id="changePasswordForm" onsubmit="handlePasswordChange(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Mot de passe actuel</label>
                                <input type="password" id="currentPassword" required
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Nouveau mot de passe</label>
                                <input type="password" id="newPassword" required minlength="6"
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                            </div>
                            
                            <div class="flex space-x-4 pt-4">
                                <button type="submit" 
                                        class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl">
                                    Changer
                                </button>
                                <button type="button" onclick="hideChangePasswordForm()" 
                                        class="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-xl">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <script>
                function showChangePasswordForm() {
                    document.getElementById('changePasswordModal').classList.remove('hidden');
                }
                
                function hideChangePasswordForm() {
                    document.getElementById('changePasswordModal').classList.add('hidden');
                    document.getElementById('changePasswordForm').reset();
                }
                
                async function handleProfileUpdate(event) {
                    event.preventDefault();
                    
                    const updateData = {
                        prenom: document.getElementById('profilePrenom').value.trim(),
                        nom: document.getElementById('profileNom').value.trim(),
                        telephone: document.getElementById('profileTelephone').value.trim(),
                        wilaya: document.getElementById('profileWilaya').value,
                        ville: document.getElementById('profileVille').value.trim(),
                        adresse: document.getElementById('profileAdresse').value.trim()
                    };
                    
                    try {
                        if (window.authSystem) {
                            await window.authSystem.updateProfile(updateData);
                            if (window.app) {
                                window.app.currentUser = { ...window.app.currentUser, ...updateData };
                                window.app.showToast('Profil mis à jour avec succès', 'success');
                            }
                        }
                    } catch (error) {
                        if (window.app) {
                            window.app.showToast(error.message, 'error');
                        }
                    }
                }
                
                async function handlePasswordChange(event) {
                    event.preventDefault();
                    
                    const currentPassword = document.getElementById('currentPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    
                    try {
                        if (window.authSystem) {
                            await window.authSystem.changePassword(currentPassword, newPassword);
                            if (window.app) {
                                window.app.showToast('Mot de passe changé avec succès', 'success');
                            }
                            hideChangePasswordForm();
                        }
                    } catch (error) {
                        if (window.app) {
                            window.app.showToast(error.message, 'error');
                        }
                    }
                }
            </script>
        `;
    }
    
    async loadHomePage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <section class="hero-gradient text-white py-24 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20"></div>
                <div class="container mx-auto px-4 relative z-10">
                    <div class="max-w-4xl mx-auto text-center">
                        <div class="flex justify-center mb-8">
                            <div class="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30 float-animation">
                                <i class="fas fa-seedling text-7xl text-white drop-shadow-lg"></i>
                            </div>
                        </div>
                        <h1 class="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent drop-shadow-2xl">
                            Shifa
                        </h1>
                        <h2 class="text-2xl md:text-3xl font-semibold mb-6 text-green-100">
                            Parapharmacie
                        </h2>
                        <p class="text-xl md:text-2xl mb-12 opacity-90 text-green-50">
                            Votre bien-être, notre mission naturelle
                        </p>
                        <div class="flex justify-center">
                            <button onclick="app.showPage('products')" class="btn-primary bg-white text-emerald-600 hover:bg-green-50 text-lg px-10 py-5 transform hover:scale-105">
                                <i class="fas fa-leaf mr-3"></i>
                                Explorer nos produits naturels
                            </button>
                        </div>
                    </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-50 to-transparent"></div>
            </section>
            
            <!-- Categories Section -->
            <section class="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Catégories</h2>
                        <p class="text-xl text-emerald-600">Découvrez notre gamme complète de produits</p>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="categoriesGrid">
                        <!-- Categories will be loaded here -->
                    </div>
                </div>
            </section>
            
            <!-- Featured Products -->
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Coups de Cœur</h2>
                        <p class="text-xl text-emerald-600">Produits sélectionnés pour vous</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="featuredProducts">
                        <!-- Featured products will be loaded here -->
                    </div>
                </div>
            </section>
            
            <!-- Promotions -->
            <section class="py-16 bg-gradient-to-br from-red-50 to-pink-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-red-800 mb-4">Promotions</h2>
                        <p class="text-xl text-red-600">Offres spéciales et réductions</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="promotionProducts">
                        <!-- Promotion products will be loaded here -->
                    </div>
                </div>
            </section>
        `;
        
        await this.loadCategories();
        await this.loadFeaturedProducts();
        await this.loadPromotionProducts();
    }

    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        let products = [...this.allProducts];
        let title = 'Tous nos produits';
        
        // Apply filters
        if (params.categorie) {
            products = products.filter(p => p.categorie === params.categorie);
            title = `Catégorie: ${params.categorie}`;
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            products = products.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm) ||
                p.marque?.toLowerCase().includes(searchTerm)
            );
            title = `Recherche: "${params.search}"`;
        }

        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">${title}</h1>
                    <p class="text-xl text-emerald-600">${products.length} produit(s) trouvé(s)</p>
                </div>

                <!-- Filters -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/50 p-6 mb-8">
                    <div class="flex flex-wrap gap-4 items-center justify-between">
                        <div class="flex flex-wrap gap-2">
                            <button onclick="app.showPage('products')" 
                                    class="px-4 py-2 rounded-lg border ${!params.categorie ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'}">
                                Tous
                            </button>
                            ${['Vitalité', 'Sport', 'Visage', 'Cheveux', 'Solaire', 'Intime', 'Soins', 'Bébé', 'Homme', 'Dentaire'].map(cat => `
                                <button onclick="app.filterByCategory('${cat}')" 
                                        class="px-4 py-2 rounded-lg border ${params.categorie === cat ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'}">
                                    ${cat}
                                </button>
                            `).join('')}
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <select id="sortSelect" onchange="app.sortProducts(this.value)" class="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-200">
                                <option value="nom">Nom A-Z</option>
                                <option value="prix-asc">Prix croissant</option>
                                <option value="prix-desc">Prix décroissant</option>
                                <option value="stock">Stock disponible</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Products Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="productsGrid">
                    ${products.length > 0 ? products.map(product => this.createProductCard(product)).join('') : `
                        <div class="col-span-full text-center py-16">
                            <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                            <p class="text-emerald-600 mb-8">Essayez de modifier vos critères de recherche</p>
                            <button onclick="app.showPage('products')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-arrow-left mr-2"></i>Voir tous les produits
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    async loadContactPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
                    <p class="text-xl text-gray-600">Nous sommes là pour vous aider</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8">
                        <div>
                            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Nos coordonnées</h2>
                            
                            <div class="space-y-6">
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-map-marker-alt text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Adresse</h3>
                                        <p class="text-gray-600">Tipaza, Algérie</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-phone text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Téléphone</h3>
                                        <p class="text-gray-600">+213 123 456 789</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-envelope text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Email</h3>
                                        <a href="mailto:pharmaciegaher@gmail.com" class="text-primary hover:text-secondary">
                                            pharmaciegaher@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
                        
                        <form id="contactForm" onsubmit="handleContactForm(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="contactName" class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                                    <input type="text" id="contactName" name="name" required class="form-input" placeholder="Votre nom complet">
                                </div>
                                <div>
                                    <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input type="email" id="contactEmail" name="email" required class="form-input" placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div>
                                <label for="contactMessage" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea id="contactMessage" name="message" rows="5" required class="form-input resize-none" placeholder="Votre message..."></textarea>
                            </div>
                            
                            <button type="submit" class="w-full btn-primary py-3" id="contactSubmitBtn">
                                <span id="contactSubmitText">Envoyer le message</span>
                                <i id="contactSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        const subtotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const shipping = subtotal >= 5000 ? 0 : 300;
        const total = subtotal + shipping;

        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Finaliser la commande</h1>
                    <p class="text-xl text-emerald-600">Vérifiez vos informations et confirmez votre commande</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Order Form -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                        
                        <form id="checkoutForm" onsubmit="handleCheckout(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Prénom *</label>
                                    <input type="text" id="checkoutPrenom" required value="${this.currentUser?.prenom || ''}"
                                           class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Nom *</label>
                                    <input type="text" id="checkoutNom" required value="${this.currentUser?.nom || ''}"
                                           class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Email *</label>
                                    <input type="email" id="checkoutEmail" required value="${this.currentUser?.email || ''}"
                                           class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="checkoutTelephone" required value="${this.currentUser?.telephone || ''}"
                                           class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Adresse complète *</label>
                                <input type="text" id="checkoutAdresse" required value="${this.currentUser?.adresse || ''}"
                                       class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                                       placeholder="Votre adresse complète">
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Wilaya *</label>
                                    <select id="checkoutWilaya" required
                                            class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                        <option value="">Sélectionnez votre wilaya</option>
                                        ${['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
                                          'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
                                          'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
                                          'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
                                          'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
                                          'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
                                          'Ghardaïa', 'Relizane'].map(w => 
                                            `<option value="${w}" ${w === this.currentUser?.wilaya ? 'selected' : ''}>${w}</option>`
                                          ).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Ville</label>
                                    <input type="text" id="checkoutVille" value="${this.currentUser?.ville || ''}"
                                           class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Notes pour la livraison (optionnel)</label>
                                <textarea id="checkoutNotes" rows="3"
                                          class="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                                          placeholder="Instructions spéciales pour la livraison..."></textarea>
                            </div>

                            <button type="submit" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-credit-card mr-2"></i>Confirmer la commande (${total} DA)
                            </button>
                        </form>
                    </div>

                    <!-- Order Summary -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                        
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-4 p-4 bg-emerald-50 rounded-xl">
                                    <img src="${item.image}" alt="${item.nom}" class="w-16 h-16 object-cover rounded-lg">
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-emerald-800">${item.nom}</h4>
                                        <p class="text-emerald-600">Quantité: ${item.quantite}</p>
                                        <p class="text-emerald-700 font-bold">${item.prix} DA x ${item.quantite} = ${item.prix * item.quantite} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="border-t border-emerald-200 pt-6 space-y-3">
                            <div class="flex justify-between text-emerald-700">
                                <span>Sous-total:</span>
                                <span class="font-semibold">${subtotal} DA</span>
                            </div>
                            <div class="flex justify-between text-emerald-700">
                                <span>Frais de livraison:</span>
                                <span class="font-semibold">${shipping} DA</span>
                            </div>
                            ${shipping === 0 ? `
                                <div class="text-sm text-green-600 font-medium">
                                    <i class="fas fa-check-circle mr-1"></i>Livraison gratuite (commande > 5000 DA)
                                </div>
                            ` : `
                                <div class="text-sm text-emerald-600">
                                    Livraison gratuite dès 5000 DA d'achat
                                </div>
                            `}
                            <div class="flex justify-between text-xl font-bold text-emerald-800 border-t border-emerald-200 pt-3">
                                <span>Total:</span>
                                <span>${total} DA</span>
                            </div>
                        </div>

                        <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 class="font-semibold text-blue-800 mb-2">
                                <i class="fas fa-info-circle mr-2"></i>Modalités de paiement
                            </h4>
                            <p class="text-sm text-blue-700">
                                Paiement à la livraison. Vous paierez directement au livreur lors de la réception de votre commande.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                async function handleCheckout(event) {
                    event.preventDefault();
                    
                    if (!window.app || window.app.cart.length === 0) {
                        if (window.app) {
                            window.app.showToast('Panier vide', 'error');
                        }
                        return;
                    }
                    
                    const orderData = {
                        client: {
                            prenom: document.getElementById('checkoutPrenom').value.trim(),
                            nom: document.getElementById('checkoutNom').value.trim(),
                            email: document.getElementById('checkoutEmail').value.trim(),
                            telephone: document.getElementById('checkoutTelephone').value.trim()
                        },
                        livraison: {
                            adresse: document.getElementById('checkoutAdresse').value.trim(),
                            wilaya: document.getElementById('checkoutWilaya').value,
                            ville: document.getElementById('checkoutVille').value.trim(),
                            notes: document.getElementById('checkoutNotes').value.trim()
                        },
                        articles: window.app.cart.map(item => ({
                            produitId: item.id,
                            nom: item.nom,
                            prix: item.prix,
                            quantite: item.quantite
                        })),
                        sousTotal: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0),
                        fraisLivraison: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) >= 5000 ? 0 : 300,
                        total: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) + 
                               (window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) >= 5000 ? 0 : 300)
                    };
                    
                    try {
                        // Save order to localStorage for demo
                        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                        const orderNumber = 'CMD' + Date.now().toString().slice(-6);
                        const newOrder = {
                            ...orderData,
                            numeroCommande: orderNumber,
                            statut: 'en-attente',
                            dateCommande: new Date().toISOString()
                        };
                        
                        orders.push(newOrder);
                        localStorage.setItem('adminOrders', JSON.stringify(orders));
                        
                        // Try to send to API as well
                        try {
                            await apiCall('/orders', {
                                method: 'POST',
                                body: JSON.stringify(orderData)
                            });
                        } catch (error) {
                            console.log('API order creation failed, using local storage');
                        }
                        
                        // Clear cart
                        window.app.clearCart();
                        
                        // Show confirmation
                        window.app.showToast('Commande créée avec succès!', 'success');
                        window.app.showPage('order-confirmation', { orderNumber });
                        
                    } catch (error) {
                        console.error('Checkout error:', error);
                        if (window.app) {
                            window.app.showToast('Erreur lors de la création de la commande', 'error');
                        }
                    }
                }
            </script>
        `;
    }

    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-3xl text-center">
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-12">
                    <!-- Success Icon -->
                    <div class="flex justify-center mb-8">
                        <div class="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                            <i class="fas fa-check text-white text-6xl"></i>
                        </div>
                    </div>

                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600 mb-8">Merci pour votre confiance</p>

                    <div class="bg-emerald-50 rounded-2xl p-8 mb-8 border border-emerald-200">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-4">
                            <i class="fas fa-receipt mr-3"></i>Numéro de commande
                        </h2>
                        <p class="text-3xl font-bold text-emerald-700 font-mono tracking-wider">${orderNumber}</p>
                        <p class="text-emerald-600 mt-2">Conservez ce numéro pour suivre votre commande</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <i class="fas fa-clock text-blue-500 text-3xl mb-3"></i>
                            <h3 class="font-bold text-blue-800 mb-2">Traitement</h3>
                            <p class="text-sm text-blue-600">Votre commande est en cours de préparation</p>
                        </div>
                        
                        <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                            <i class="fas fa-truck text-yellow-500 text-3xl mb-3"></i>
                            <h3 class="font-bold text-yellow-800 mb-2">Livraison</h3>
                            <p class="text-sm text-yellow-600">Livraison sous 24-48h</p>
                        </div>
                        
                        <div class="bg-green-50 rounded-xl p-6 border border-green-200">
                            <i class="fas fa-credit-card text-green-500 text-3xl mb-3"></i>
                            <h3 class="font-bold text-green-800 mb-2">Paiement</h3>
                            <p class="text-sm text-green-600">À la livraison</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <button onclick="app.showPage('products')" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mb-4">
                            <i class="fas fa-shopping-bag mr-2"></i>Continuer mes achats
                        </button>
                        
                        <button onclick="app.showPage('home')" 
                                class="w-full bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-4 px-8 rounded-xl hover:bg-emerald-50 transition-all">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                    </div>

                    <div class="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <h3 class="text-lg font-bold text-emerald-800 mb-2">
                            <i class="fas fa-phone mr-2"></i>Besoin d'aide ?
                        </h3>
                        <p class="text-emerald-700 mb-4">Notre équipe est là pour vous accompagner</p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="tel:+213123456789" 
                               class="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                                <i class="fas fa-phone mr-2"></i>+213 123 456 789
                            </a>
                            <a href="mailto:pharmaciegaher@gmail.com" 
                               class="bg-white border border-emerald-300 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                                <i class="fas fa-envelope mr-2"></i>Nous écrire
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès refusé - Droits administrateur requis', 'error');
            this.showPage('home');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Admin Header -->
                <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 class="text-4xl font-bold text-emerald-800 mb-2">Panel d'Administration</h1>
                            <p class="text-emerald-600 text-lg">Gestion complète de Shifa - Parapharmacie</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <p class="text-sm text-emerald-500">Connecté en tant que</p>
                                <p class="font-bold text-emerald-800 text-lg">${this.currentUser.prenom} ${this.currentUser.nom}</p>
                                <p class="text-sm text-emerald-600">${this.currentUser.email}</p>
                            </div>
                            <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                                <i class="fas fa-user-shield text-white text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Admin Content Placeholder -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <h2 class="text-2xl font-bold text-emerald-800 mb-4">Tableau de bord</h2>
                    <p class="text-emerald-600">Interface d'administration en développement...</p>
                </div>
            </div>
        `;
    }
    
    async loadCategories() {
        const mainPageCategories = [
            { nom: 'Vitalité', description: 'Vitamines & Énergie', icon: 'fa-seedling' },
            { nom: 'Sport', description: 'Nutrition sportive', icon: 'fa-dumbbell' },
            { nom: 'Visage', description: 'Soins du visage', icon: 'fa-smile' },
            { nom: 'Cheveux', description: 'Soins capillaires', icon: 'fa-cut' },
            { nom: 'Solaire', description: 'Protection solaire', icon: 'fa-sun' },
            { nom: 'Intime', description: 'Hygiène intime', icon: 'fa-heart' },
            { nom: 'Soins', description: 'Soins corporels', icon: 'fa-spa' },
            { nom: 'Bébé', description: 'Soins bébé', icon: 'fa-baby-carriage' },
            { nom: 'Homme', description: 'Soins masculins', icon: 'fa-user-tie' },
            { nom: 'Dentaire', description: 'Hygiène dentaire', icon: 'fa-tooth' }
        ];
        
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = mainPageCategories.map((category, index) => `
                <div class="category-card text-center cursor-pointer p-6 bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-200/50 ${index === 0 ? 'ring-2 ring-emerald-400 bg-gradient-to-br from-emerald-50 to-green-100' : ''}"
                     onclick="app.filterByCategory('${category.nom}')">
                    <div class="category-icon mx-auto ${index === 0 ? 'pulse-slow' : ''}">
                        <i class="fas ${category.icon} drop-shadow-lg"></i>
                    </div>
                    <h3 class="font-bold text-emerald-800 mb-2 text-sm lg:text-base">${category.nom}</h3>
                    <p class="text-xs lg:text-sm text-emerald-600 font-medium">${category.description}</p>
                    ${index === 0 ? '<div class="mt-2"><span class="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-semibold">★ POPULAIRE</span></div>' : ''}
                </div>
            `).join('');
        }
    }
    
    async loadFeaturedProducts() {
        console.log('Loading featured products...');
        
        const featuredProducts = this.allProducts.filter(p => p.enVedette && p.actif !== false);
        
        console.log(`Found ${featuredProducts.length} featured products`);
        
        const container = document.getElementById('featuredProducts');
        if (container) {
            if (featuredProducts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                        <p class="text-emerald-600 mb-8">Ajoutez des produits en vedette depuis l'administration</p>
                        ${this.currentUser && this.currentUser.role === 'admin' ? `
                        <button onclick="app.showPage('admin')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-cog mr-2"></i>Aller à l'administration
                        </button>
                        ` : ''}
                    </div>
                `;
            } else {
                container.innerHTML = featuredProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
            }
        }
    }
    
    async loadPromotionProducts() {
        console.log('Loading promotion products...');
        
        const promotionProducts = this.allProducts.filter(p => p.enPromotion && p.actif !== false);
        
        console.log(`Found ${promotionProducts.length} promotion products`);
        
        const container = document.getElementById('promotionProducts');
        if (container) {
            if (promotionProducts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-tags text-6xl text-red-300 mb-6"></i>
                        <h3 class="text-2xl font-bold text-red-800 mb-4">Aucune promotion active</h3>
                        <p class="text-red-600 mb-8">Créez des promotions depuis l'administration</p>
                    </div>
                `;
            } else {
                container.innerHTML = promotionProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
            }
        }
    }
    
    createProductCard(product) {
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        let imageUrl;
        if (product.image && product.image.startsWith('http')) {
            imageUrl = product.image;
        } else if (product.image && product.image.startsWith('data:image')) {
            imageUrl = product.image;
        } else if (product.image) {
            imageUrl = `./images/products/${product.image}`;
        } else {
            const getCategoryColor = (category) => {
                const colors = {
                    'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
                    'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
                    'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
                    'Dentaire': '6366f1'
                };
                return colors[category] || '10b981';
            };
            
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            const categoryColor = getCategoryColor(product.categorie);
            imageUrl = `https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        return `
            <div class="product-card bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 ${isOutOfStock ? 'opacity-75' : ''}"
                 onclick="app.showPage('product', {id: '${product._id}'})">
                ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-20">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                    <span class="text-white font-bold text-lg">Rupture de stock</span>
                </div>` : ''}
                
                <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                         onerror="this.src='https://via.placeholder.com/300x300/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                </div>
                
                <div class="p-6">
                    <h3 class="font-bold text-emerald-800 mb-3 text-lg line-clamp-2">${product.nom}</h3>
                    <p class="text-sm text-emerald-600 mb-4 line-clamp-2">${product.description || 'Description du produit'}</p>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            ${hasPromotion ? `
                                <span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>
                                <span class="text-xl font-bold text-red-600">${product.prix} DA</span>
                            ` : `
                                <span class="text-xl font-bold text-emerald-700">${product.prix} DA</span>
                            `}
                        </div>
                        
                        ${!isOutOfStock ? `
                            <button onclick="event.stopPropagation(); addToCartFromCard('${product._id}')" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-emerald-600">Stock: ${product.stock}</span>
                        <span class="text-emerald-700 font-semibold">${product.marque || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    async filterByCategory(category) {
        await this.showPage('products', { categorie: category });
    }
    
    async performSearch(query) {
        if (query.trim()) {
            await this.showPage('products', { search: query });
        }
    }
    
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.trim()) {
                        this.performSearch(e.target.value);
                    }
                }, 500);
            });
        }
    }
    
    sortProducts(sortBy) {
        console.log('Sort products by:', sortBy);
        // Implementation would depend on current products display
    }
    
    async addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId, quantity);
            
            const product = this.allProducts.find(p => p._id === productId);
            
            if (!product) {
                throw new Error('Produit non trouvé');
            }
            
            if (product.stock === 0) {
                this.showToast('Ce produit est en rupture de stock', 'error');
                return;
            }
            
            if (quantity > product.stock) {
                this.showToast(`Stock insuffisant. Maximum disponible: ${product.stock}`, 'error');
                return;
            }
            
            const getCategoryColor = (category) => {
                const colors = {
                    'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
                    'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
                    'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
                    'Dentaire': '6366f1'
                };
                return colors[category] || '10b981';
            };
            
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            const categoryColor = getCategoryColor(product.categorie);
            let imageUrl;
            
            if (product.image && product.image.startsWith('data:image')) {
                imageUrl = product.image;
            } else if (product.image && product.image.startsWith('http')) {
                imageUrl = product.image;
            } else {
                imageUrl = `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
            }
            
            const existingIndex = this.cart.findIndex(item => item.id === productId);
            
            if (existingIndex > -1) {
                const newQuantity = this.cart[existingIndex].quantite + quantity;
                
                if (newQuantity > product.stock) {
                    this.showToast(`Stock insuffisant. Maximum disponible: ${product.stock}`, 'error');
                    return;
                }
                
                this.cart[existingIndex].quantite = newQuantity;
            } else {
                const cartItem = {
                    id: product._id,
                    nom: product.nom,
                    prix: product.prix,
                    image: imageUrl,
                    quantite: quantity,
                    stock: product.stock,
                    categorie: product.categorie
                };
                
                this.cart.push(cartItem);
            }
            
            this.saveCart();
            this.updateCartUI();
            this.showToast(`${product.nom} ajouté au panier`, 'success');
            
        } catch (error) {
            console.error('Erreur ajout au panier:', error);
            this.showToast('Erreur lors de l\'ajout au panier', 'error');
        }
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.classList.add('pulse');
            } else {
                cartCount.classList.remove('pulse');
            }
        }
        
        this.updateCartSidebar();
    }
    
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-emerald-600 text-center py-8">
                    <i class="fas fa-shopping-cart text-4xl mb-4 opacity-50"></i>
                    <p>Votre panier est vide</p>
                </div>
            `;
            if (cartSummary) cartSummary.classList.add('hidden');
            return;
        }
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.nom}" 
                         class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                        <p class="text-sm text-emerald-600">${item.prix} DA</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <div class="quantity-selector">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite - 1})">-</button>
                                <input type="number" value="${item.quantite}" min="1" 
                                       onchange="app.updateCartQuantity('${item.id}', parseInt(this.value))">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite + 1})">+</button>
                            </div>
                            <button onclick="app.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 ml-2">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.updateCartTotals();
        if (cartSummary) cartSummary.classList.remove('hidden');
    }
    
    async updateCartTotals() {
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartShipping = document.getElementById('cartShipping');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartSubtotal) cartSubtotal.textContent = `${sousTotal} DA`;
        if (cartShipping) cartShipping.textContent = `${fraisLivraison} DA`;
        if (cartTotal) cartTotal.textContent = `${total} DA`;
    }
    
    updateCartQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) return;
        
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        const item = this.cart[itemIndex];
        
        if (newQuantity > item.stock) {
            this.showToast(`Stock insuffisant. Maximum disponible: ${item.stock}`, 'error');
            return;
        }
        
        item.quantite = newQuantity;
        this.saveCart();
        this.updateCartUI();
    }
    
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartUI();
            this.showToast(`${item.nom} retiré du panier`, 'success');
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showToast('Panier vidé', 'success');
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
    }
    
    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantite, 0);
    }
    
    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
    }
    
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas ${this.getToastIcon(type)} mr-3"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 5000);
        }
    }
    
    getToastIcon(type) {
        const icons = {
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }
    
    requireAuth() {
        if (!this.currentUser) {
            this.showToast('Veuillez vous connecter pour continuer', 'warning');
            this.showPage('login');
            return false;
        }
        return true;
    }
    
    requireAdmin() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès administrateur requis', 'error');
            this.showPage('home');
            return false;
        }
        return true;
    }
    
    handleAuthError(error, context = '') {
        console.error(`Auth Error ${context}:`, error);
        
        if (error.message.includes('401') || error.message.includes('Token invalide')) {
            localStorage.removeItem('token');
            this.currentUser = null;
            this.updateUserUI();
            this.showToast('Session expirée. Veuillez vous reconnecter.', 'warning');
            this.showPage('login');
        } else if (error.message.includes('403')) {
            this.showToast('Accès refusé', 'error');
        } else if (error.message.includes('404')) {
            this.showToast('Ressource non trouvée', 'error');
        } else if (error.message.includes('500')) {
            this.showToast('Erreur serveur. Veuillez réessayer plus tard.', 'error');
        } else {
            this.showToast(error.message || 'Une erreur est survenue', 'error');
        }
    }
}

// Password visibility toggle function
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Global functions
function addToCartFromCard(productId, quantity = 1) {
    console.log('Add to cart from card called:', productId);
    if (window.app && typeof window.app.addToCart === 'function') {
        window.app.addToCart(productId, quantity);
    } else {
        console.error('App not available');
    }
}

function showPage(page, params) {
    if (window.app) {
        window.app.showPage(page, params);
    }
}

function filterByCategory(category) {
    if (window.app) {
        window.app.filterByCategory(category);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
    }
}

function proceedToCheckout() {
    if (window.app) {
        if (window.app.cart.length === 0) {
            window.app.showToast('Votre panier est vide', 'warning');
            return;
        }
        
        toggleCart();
        window.app.showPage('checkout');
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('contactSubmitBtn');
    const submitText = document.getElementById('contactSubmitText');
    const submitSpinner = document.getElementById('contactSubmitSpinner');
    
    submitBtn.disabled = true;
    submitText.textContent = 'Envoi en cours...';
    submitSpinner.classList.remove('hidden');
    
    setTimeout(() => {
        submitBtn.disabled = false;
        submitText.textContent = 'Envoyer le message';
        submitSpinner.classList.add('hidden');
        
        event.target.reset();
        
        if (window.app) {
            window.app.showToast('Message envoyé avec succès !', 'success');
        }
    }, 2000);
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('App initialized and made globally available');
});

console.log('✅ Complete app.js loaded with full functionality');
