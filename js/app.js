// Complete Fixed PharmacieGaherApp - All Pages Implemented
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
            await this.loadProductsCache(); // Load products from localStorage/API
            this.initUI();
            await this.showPage('home');
            this.updateCartUI();
            this.initSearch();
        } catch (error) {
            console.error('Erreur initialisation app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
    }
    
    // Load and cache products
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
    
    // Refresh products cache
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
    
    // Refresh home page content
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
                case 'orders':
                    if (!this.currentUser) {
                        await this.showPage('login');
                        return;
                    }
                    await this.loadOrdersPage();
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
    
    // HOME PAGE IMPLEMENTATION
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
    
    // LOGIN PAGE IMPLEMENTATION
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <i class="fas fa-sign-in-alt text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800">Connexion</h1>
                        <p class="text-emerald-600 mt-2">Accédez à votre compte Shifa</p>
                    </div>
                    
                    <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                        <div>
                            <label for="loginEmail" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" id="loginEmail" name="email" required 
                                   class="form-input" placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label for="loginPassword" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                            <input type="password" id="loginPassword" name="password" required 
                                   class="form-input" placeholder="••••••••">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-4" id="loginSubmitBtn">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            <span id="loginSubmitText">Se connecter</span>
                            <i id="loginSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Pas encore de compte ? 
                            <a href="#" onclick="app.showPage('register')" class="text-emerald-600 hover:text-emerald-700 font-medium">
                                Inscrivez-vous
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // REGISTER PAGE IMPLEMENTATION
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl">
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <i class="fas fa-user-plus text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800">Inscription</h1>
                        <p class="text-emerald-600 mt-2">Créez votre compte Shifa</p>
                    </div>
                    
                    <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                <input type="text" id="registerPrenom" name="prenom" required 
                                       class="form-input" placeholder="Votre prénom">
                            </div>
                            
                            <div>
                                <label for="registerNom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                <input type="text" id="registerNom" name="nom" required 
                                       class="form-input" placeholder="Votre nom">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerEmail" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" id="registerEmail" name="email" required 
                                   class="form-input" placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label for="registerTelephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                            <input type="tel" id="registerTelephone" name="telephone" required 
                                   class="form-input" placeholder="0123 456 789">
                        </div>
                        
                        <div>
                            <label for="registerPassword" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                            <input type="password" id="registerPassword" name="password" required 
                                   class="form-input" placeholder="••••••••">
                        </div>
                        
                        <div>
                            <label for="registerAdresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                            <textarea id="registerAdresse" name="adresse" rows="2" 
                                      class="form-input resize-none" placeholder="Votre adresse complète"></textarea>
                        </div>
                        
                        <div>
                            <label for="registerWilaya" class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                            <select id="registerWilaya" name="wilaya" required class="form-input">
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
                                <option value="Tipaza" selected>42 - Tipaza</option>
                                <option value="Mila">43 - Mila</option>
                                <option value="Aïn Defla">44 - Aïn Defla</option>
                                <option value="Naâma">45 - Naâma</option>
                                <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
                                <option value="Ghardaïa">47 - Ghardaïa</option>
                                <option value="Relizane">48 - Relizane</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-4" id="registerSubmitBtn">
                            <i class="fas fa-user-plus mr-2"></i>
                            <span id="registerSubmitText">Créer mon compte</span>
                            <i id="registerSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Déjà un compte ? 
                            <a href="#" onclick="app.showPage('login')" class="text-emerald-600 hover:text-emerald-700 font-medium">
                                Connectez-vous
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PROFILE PAGE IMPLEMENTATION
    async loadProfilePage() {
        const user = this.currentUser;
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200 overflow-hidden">
                    <!-- Profile Header -->
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6">
                        <div class="flex items-center space-x-6">
                            <div class="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-lg">
                                <i class="fas fa-user text-white text-3xl"></i>
                            </div>
                            <div class="text-white">
                                <h1 class="text-3xl font-bold">${user.prenom} ${user.nom}</h1>
                                <p class="text-emerald-100 text-lg">${user.email}</p>
                                <p class="text-emerald-200">${user.role === 'admin' ? 'Administrateur' : 'Client'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profile Content -->
                    <div class="p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Personal Information -->
                            <div>
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations personnelles</h2>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                        <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${user.prenom} ${user.nom}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${user.email}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${user.telephone || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                                        <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${user.wilaya || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${user.adresse || 'Non renseigné'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Account Actions -->
                            <div>
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Actions du compte</h2>
                                <div class="space-y-4">
                                    <button onclick="app.showPage('orders')" 
                                            class="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <i class="fas fa-box mr-3"></i>
                                        Mes commandes
                                    </button>
                                    
                                    <button onclick="showChangePasswordModal()" 
                                            class="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <i class="fas fa-lock mr-3"></i>
                                        Changer le mot de passe
                                    </button>
                                    
                                    ${user.role === 'admin' ? `
                                    <button onclick="app.showPage('admin')" 
                                            class="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <i class="fas fa-cog mr-3"></i>
                                        Administration
                                    </button>
                                    ` : ''}
                                    
                                    <button onclick="logout()" 
                                            class="w-full bg-red-100 hover:bg-red-200 text-red-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <i class="fas fa-sign-out-alt mr-3"></i>
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ORDERS PAGE IMPLEMENTATION
    async loadOrdersPage() {
        const userOrdersKey = `userOrders_${this.currentUser.id}`;
        let userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-emerald-800">Mes Commandes</h1>
                            <p class="text-emerald-600 mt-2">${userOrders.length} commande(s) trouvée(s)</p>
                        </div>
                        <button onclick="app.showPage('profile')" 
                                class="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-lg transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour au profil
                        </button>
                    </div>
                    
                    ${userOrders.length === 0 ? `
                        <div class="text-center py-16">
                            <i class="fas fa-box text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                            <p class="text-emerald-600 mb-8">Vous n'avez pas encore passé de commandes</p>
                            <button onclick="app.showPage('products')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-all">
                                <i class="fas fa-shopping-bag mr-2"></i>Découvrir nos produits
                            </button>
                        </div>
                    ` : `
                        <div class="space-y-6">
                            ${userOrders.map(order => `
                                <div class="border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 class="text-xl font-bold text-emerald-800">Commande #${order.numeroCommande}</h3>
                                            <p class="text-emerald-600">${new Date(order.dateCommande).toLocaleDateString('fr-FR')} à ${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</p>
                                        </div>
                                        <div class="mt-4 md:mt-0">
                                            <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold ${this.getOrderStatusClass(order.statut)}">
                                                ${this.getOrderStatusLabel(order.statut)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <h4 class="font-semibold text-emerald-700 mb-2">Articles (${order.articles?.length || 0})</h4>
                                            <div class="space-y-2 max-h-32 overflow-y-auto">
                                                ${order.articles?.map(article => `
                                                    <div class="flex items-center space-x-3">
                                                        <img src="${article.image || 'https://via.placeholder.com/32x32/10b981/ffffff?text=' + encodeURIComponent((article.nom || '').substring(0, 2))}" 
                                                             alt="${article.nom}" class="w-8 h-8 rounded object-cover">
                                                        <span class="text-sm text-gray-700">${article.nom} (×${article.quantite})</span>
                                                    </div>
                                                `).join('') || '<p class="text-gray-500">Aucun article</p>'}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 class="font-semibold text-emerald-700 mb-2">Livraison</h4>
                                            <p class="text-sm text-gray-700">${order.client?.adresse || 'Adresse non renseignée'}</p>
                                            <p class="text-sm text-gray-700">${order.client?.wilaya || 'Wilaya non renseignée'}</p>
                                            <p class="text-sm font-medium text-emerald-600 mt-2">${order.modePaiement || 'Paiement à la livraison'}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-emerald-100">
                                        <div class="text-sm text-gray-600">
                                            <span>Sous-total: ${order.sousTotal || 0} DA</span>
                                            <span class="mx-2">•</span>
                                            <span>Livraison: ${order.fraisLivraison || 0} DA</span>
                                        </div>
                                        <div class="text-xl font-bold text-emerald-700 mt-2 md:mt-0">
                                            Total: ${order.total || 0} DA
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    // CHECKOUT PAGE IMPLEMENTATION
    async loadCheckoutPage() {
        if (!this.cart || this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const sousTotal = this.getCartTotal();
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Checkout Form -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                            
                            <form id="checkoutForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="checkoutPrenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" id="checkoutPrenom" name="prenom" required 
                                               value="${this.currentUser?.prenom || ''}"
                                               class="form-input" placeholder="Votre prénom">
                                    </div>
                                    
                                    <div>
                                        <label for="checkoutNom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                        <input type="text" id="checkoutNom" name="nom" required 
                                               value="${this.currentUser?.nom || ''}"
                                               class="form-input" placeholder="Votre nom">
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="checkoutEmail" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input type="email" id="checkoutEmail" name="email" required 
                                               value="${this.currentUser?.email || ''}"
                                               class="form-input" placeholder="votre@email.com">
                                    </div>
                                    
                                    <div>
                                        <label for="checkoutTelephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                        <input type="tel" id="checkoutTelephone" name="telephone" required 
                                               value="${this.currentUser?.telephone || ''}"
                                               class="form-input" placeholder="0123 456 789">
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="checkoutAdresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                    <textarea id="checkoutAdresse" name="adresse" required rows="3" 
                                              class="form-input resize-none" placeholder="Votre adresse complète de livraison">${this.currentUser?.adresse || ''}</textarea>
                                </div>
                                
                                <div>
                                    <label for="checkoutWilaya" class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                    <select id="checkoutWilaya" name="wilaya" required class="form-input" onchange="calculateShipping()">
                                        <option value="">Sélectionnez votre wilaya</option>
                                        <option value="Alger">16 - Alger</option>
                                        <option value="Blida">09 - Blida</option>
                                        <option value="Boumerdès">35 - Boumerdès</option>
                                        <option value="Tipaza" ${this.currentUser?.wilaya === 'Tipaza' ? 'selected' : ''}>42 - Tipaza</option>
                                        <option value="Médéa">26 - Médéa</option>
                                        <option value="Autres">Autres wilayas</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-4">Mode de paiement *</label>
                                    <div class="space-y-3">
                                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all cursor-pointer">
                                            <input type="radio" name="modePaiement" value="Paiement à la livraison" checked 
                                                   class="text-emerald-600 mr-3">
                                            <div class="flex items-center">
                                                <i class="fas fa-money-bill text-emerald-600 mr-3"></i>
                                                <div>
                                                    <span class="font-medium text-gray-900">Paiement à la livraison</span>
                                                    <p class="text-sm text-gray-600">Payez en espèces lors de la réception</p>
                                                </div>
                                            </div>
                                        </label>
                                        
                                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all cursor-pointer opacity-50">
                                            <input type="radio" name="modePaiement" value="Carte bancaire" disabled 
                                                   class="text-emerald-600 mr-3">
                                            <div class="flex items-center">
                                                <i class="fas fa-credit-card text-gray-400 mr-3"></i>
                                                <div>
                                                    <span class="font-medium text-gray-500">Carte bancaire</span>
                                                    <p class="text-sm text-gray-400">Bientôt disponible</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="checkoutCommentaires" class="block text-sm font-medium text-gray-700 mb-2">Commentaires (optionnel)</label>
                                    <textarea id="checkoutCommentaires" name="commentaires" rows="3" 
                                              class="form-input resize-none" placeholder="Instructions spéciales pour la livraison..."></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Order Summary -->
                    <div>
                        <div class="bg-white rounded-2xl shadow-xl p-6 border border-emerald-200 sticky top-8">
                            <h3 class="text-xl font-bold text-emerald-800 mb-6">Récapitulatif</h3>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-3">
                                        <img src="${item.image}" alt="${item.nom}" class="w-12 h-12 rounded-lg object-cover">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-900 text-sm">${item.nom}</h4>
                                            <p class="text-emerald-600 text-sm">${item.quantite} × ${item.prix} DA</p>
                                        </div>
                                        <span class="font-bold text-emerald-700">${item.quantite * item.prix} DA</span>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Totals -->
                            <div class="border-t border-emerald-200 pt-6 space-y-3">
                                <div class="flex justify-between text-emerald-700">
                                    <span>Sous-total:</span>
                                    <span id="checkoutSousTotal">${sousTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-emerald-700">
                                    <span>Frais de livraison:</span>
                                    <span id="checkoutFraisLivraison">300 DA</span>
                                </div>
                                <div class="flex justify-between text-lg font-bold text-emerald-800 border-t border-emerald-200 pt-3">
                                    <span>Total:</span>
                                    <span id="checkoutTotal">${sousTotal + 300} DA</span>
                                </div>
                            </div>
                            
                            <div id="shippingMessage" class="mt-4"></div>
                            
                            <button onclick="app.processOrder()" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-lg mt-6">
                                <i class="fas fa-check mr-2"></i>Confirmer la commande
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize checkout system
        if (window.checkoutSystem) {
            window.checkoutSystem.init();
        }
    }
    
    // ORDER CONFIRMATION PAGE IMPLEMENTATION
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl text-center">
                <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                    <div class="mb-8">
                        <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <i class="fas fa-check text-white text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                        <p class="text-emerald-600 text-lg">Votre commande a été enregistrée avec succès</p>
                    </div>
                    
                    <div class="bg-emerald-50 rounded-xl p-6 mb-8">
                        <h2 class="text-xl font-bold text-emerald-800 mb-4">Numéro de commande</h2>
                        <p class="text-2xl font-bold text-emerald-600">#${orderNumber}</p>
                        <p class="text-emerald-600 mt-2">Conservez ce numéro pour le suivi de votre commande</p>
                    </div>
                    
                    <div class="space-y-4 text-left mb-8">
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-info-circle text-emerald-500 mt-1"></i>
                            <div>
                                <h3 class="font-semibold text-gray-900">Traitement de la commande</h3>
                                <p class="text-gray-600 text-sm">Votre commande sera traitée dans les 24h ouvrées</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-truck text-emerald-500 mt-1"></i>
                            <div>
                                <h3 class="font-semibold text-gray-900">Livraison</h3>
                                <p class="text-gray-600 text-sm">Livraison prévue sous 2-5 jours ouvrés</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-phone text-emerald-500 mt-1"></i>
                            <div>
                                <h3 class="font-semibold text-gray-900">Contact</h3>
                                <p class="text-gray-600 text-sm">Notre équipe vous contactera pour confirmer la livraison</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="app.showPage('home')" 
                                class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg transition-all font-medium">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                        
                        ${this.currentUser ? `
                        <button onclick="app.showPage('orders')" 
                                class="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-3 px-6 rounded-lg transition-all font-medium">
                            <i class="fas fa-box mr-2"></i>Mes commandes
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // CONTACT PAGE IMPLEMENTATION
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
    
    // ADD TO CART FUNCTIONALITY - FIXED
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
    
    // Process order - FIXED
    async processOrder() {
        if (window.checkoutSystem) {
            return window.checkoutSystem.processOrder();
        }
    }
    
    // Order status helpers
    getOrderStatusClass(status) {
        const classes = {
            'en-attente': 'bg-yellow-100 text-yellow-800',
            'confirmée': 'bg-green-100 text-green-800',
            'préparée': 'bg-blue-100 text-blue-800',
            'expédiée': 'bg-purple-100 text-purple-800',
            'livrée': 'bg-emerald-100 text-emerald-800',
            'annulée': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    getOrderStatusLabel(status) {
        const labels = {
            'en-attente': 'En attente',
            'confirmée': 'Confirmée',
            'préparée': 'Préparée',
            'expédiée': 'Expédiée',
            'livrée': 'Livrée',
            'annulée': 'Annulée'
        };
        return labels[status] || status;
    }
    
    // Categories, featured and promotion loading methods remain the same...
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
    
    // Keep all other methods for cart, search, UI updates, etc.
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
        
        // Update shipping progress
        const shippingProgress = document.getElementById('shippingProgress');
        if (shippingProgress) {
            const needed = 5000 - sousTotal;
            
            if (needed <= 0) {
                shippingProgress.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div class="flex items-center">
                            <i class="fas fa-truck text-green-600 mr-2"></i>
                            <span class="text-green-800 font-medium text-sm">Livraison gratuite !</span>
                        </div>
                    </div>
                `;
            } else if (sousTotal > 0) {
                const progress = (sousTotal / 5000) * 100;
                shippingProgress.innerHTML = `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div class="flex items-center justify-between text-sm text-blue-800 mb-2">
                            <span>Livraison gratuite à partir de 5000 DA</span>
                            <span class="font-medium">${needed} DA restants</span>
                        </div>
                        <div class="w-full bg-blue-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                    </div>
                `;
            }
        }
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
    
    // Keep all admin methods from the original file...
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
                
                <!-- Navigation Admin -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 mb-8 overflow-hidden">
                    <nav class="flex flex-wrap">
                        <button onclick="switchAdminSection('dashboard')" 
                                class="admin-nav-btn dashboard flex-1 min-w-max px-6 py-4 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                            <i class="fas fa-chart-line mr-2"></i>Tableau de bord
                        </button>
                        <button onclick="switchAdminSection('products')" 
                                class="admin-nav-btn products flex-1 min-w-max px-6 py-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-pills mr-2"></i>Produits
                        </button>
                        <button onclick="switchAdminSection('orders')" 
                                class="admin-nav-btn orders flex-1 min-w-max px-6 py-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-shopping-bag mr-2"></i>Commandes
                        </button>
                        <button onclick="switchAdminSection('featured')" 
                                class="admin-nav-btn featured flex-1 min-w-max px-6 py-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-star mr-2"></i>Coups de Coeur
                        </button>
                        <button onclick="switchAdminSection('cleanup')" 
                                class="admin-nav-btn cleanup flex-1 min-w-max px-6 py-4 text-sm font-semibold text-red-700 hover:bg-red-50 transition-all">
                            <i class="fas fa-broom mr-2"></i>Nettoyage
                        </button>
                    </nav>
                </div>
                
                <!-- Admin Content -->
                <div id="adminContent" class="min-h-96">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;
        
        await this.loadAdminDashboard();
    }
    
    async loadAdminDashboard() {
        try {
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            const products = this.allProducts;
            
            let stats = {
                totalProducts: products.length,
                totalOrders: adminOrders.length,
                pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
                totalUsers: 1,
                monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0)
            };

            try {
                const data = await apiCall('/admin/dashboard');
                if (data && data.stats) {
                    stats = { ...stats, ...data.stats };
                }
            } catch (error) {
                console.log('API unavailable, using local stats');
            }
            
            document.getElementById('adminContent').innerHTML = `
                <!-- Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">Produits</p>
                                <p class="text-3xl font-bold text-blue-800">${stats.totalProducts}</p>
                                <p class="text-xs text-blue-500 mt-1">Total actifs</p>
                            </div>
                            <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-pills text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-green-600 uppercase tracking-wide">Commandes</p>
                                <p class="text-3xl font-bold text-green-800">${stats.totalOrders}</p>
                                <p class="text-xs text-green-500 mt-1">Total reçues</p>
                            </div>
                            <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-shopping-bag text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-yellow-600 uppercase tracking-wide">En attente</p>
                                <p class="text-3xl font-bold text-yellow-800">${stats.pendingOrders}</p>
                                <p class="text-xs text-yellow-500 mt-1">Commandes</p>
                            </div>
                            <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-clock text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-purple-600 uppercase tracking-wide">Revenus</p>
                                <p class="text-3xl font-bold text-purple-800">${stats.monthlyRevenue} DA</p>
                                <p class="text-xs text-purple-500 mt-1">Ce mois</p>
                            </div>
                            <div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-coins text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('products')">
                        <i class="fas fa-plus-circle text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Gérer les produits</h3>
                        <p class="text-emerald-100">Ajouter, modifier et gérer vos produits</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('orders')">
                        <i class="fas fa-shopping-bag text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Commandes</h3>
                        <p class="text-blue-100">Voir et gérer les commandes</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('featured')">
                        <i class="fas fa-star text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Coups de Coeur</h3>
                        <p class="text-yellow-100">Gérer les produits mis en avant</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('cleanup')">
                        <i class="fas fa-broom text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Nettoyage</h3>
                        <p class="text-red-100">Supprimer produits indésirables</p>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p class="text-red-800">Erreur de chargement du tableau de bord</p>
                </div>
            `;
        }
    }
}

// Global functions - CRITICAL FIXES
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
        
        // Prevent body scroll when cart is open
        if (cartSidebar.classList.contains('translate-x-full')) {
            document.body.classList.remove('overflow-hidden');
        } else {
            document.body.classList.add('overflow-hidden');
        }
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

// Change password modal
function showChangePasswordModal() {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="changePasswordModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-emerald-800">Changer le mot de passe</h3>
                    <button onclick="closeChangePasswordModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="changePasswordForm" onsubmit="handleChangePassword(event)" class="space-y-4">
                    <div>
                        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel *</label>
                        <input type="password" id="currentPassword" name="currentPassword" required 
                               class="form-input" placeholder="Mot de passe actuel">
                    </div>
                    
                    <div>
                        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                        <input type="password" id="newPassword" name="newPassword" required 
                               class="form-input" placeholder="Nouveau mot de passe">
                    </div>
                    
                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required 
                               class="form-input" placeholder="Confirmer le mot de passe">
                    </div>
                    
                    <div class="flex justify-end space-x-4 pt-4">
                        <button type="button" onclick="closeChangePasswordModal()" 
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                            Annuler
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                            Changer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `);
    
    document.body.style.overflow = 'hidden';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

async function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        if (window.app) {
            window.app.showToast('Les mots de passe ne correspondent pas', 'error');
        }
        return;
    }
    
    if (newPassword.length < 6) {
        if (window.app) {
            window.app.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        }
        return;
    }
    
    try {
        if (window.authSystem) {
            await window.authSystem.changePassword(currentPassword, newPassword);
            if (window.app) {
                window.app.showToast('Mot de passe modifié avec succès', 'success');
            }
            closeChangePasswordModal();
        }
    } catch (error) {
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    }
}

// Shipping calculation for checkout
function calculateShipping() {
    if (window.checkoutSystem) {
        window.checkoutSystem.calculateShipping();
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

// Expose necessary global functions
window.addToCartFromCard = addToCartFromCard;
window.showPage = showPage;
window.filterByCategory = filterByCategory;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.handleContactForm = handleContactForm;
window.logout = logout;
window.showChangePasswordModal = showChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.handleChangePassword = handleChangePassword;
window.calculateShipping = calculateShipping;

console.log('✅ Complete Fixed app.js loaded with all pages implemented');
