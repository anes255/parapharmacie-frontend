// Complete PharmacieGaherApp - Updated with all required methods
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
    
    // New method to load and cache products
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
                            // Update localStorage with merged data
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
    
    // New method to refresh products cache (called from admin when products are modified)
    refreshProductsCache() {
        console.log('Refreshing products cache...');
        
        // Reload from localStorage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        this.allProducts = [...localProducts];
        
        console.log(`Products cache refreshed: ${this.allProducts.length} products`);
        
        // If we're on the home page, refresh the displayed products
        if (this.currentPage === 'home') {
            this.refreshHomePage();
        } else if (this.currentPage === 'products') {
            // Refresh products page if we're on it
            this.showPage('products');
        }
    }
    
    // New method to refresh home page content
    refreshHomePage() {
        console.log('Refreshing home page content...');
        
        // Refresh featured products
        this.loadFeaturedProducts();
        // Refresh promotion products  
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
        window.app = this; // Critical: Make globally available
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
    
    async loadCategories() {
        // Show all 10 categories with Vitalité first
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
        
        // Use cached products and filter for featured products
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
        
        // Use cached products and filter for promotion products
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

    getAlgerianWilayas() {
        return [
            "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
            "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
            "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
            "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
            "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
            "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
            "Ghardaïa", "Relizane"
        ];
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
    
    // ADD TO CART FUNCTIONALITY - FIXED
    async addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId, quantity);
            
            // Find product in our cached products
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
            
            // Generate image URL
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
            
            // Check if product already in cart
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
    
    // Load profile page stub
    async loadProfilePage() {
        // This would contain profile page logic
        this.showToast('Page de profil en cours de développement', 'info');
    }

    // Checkout related methods
    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-8 max-w-7xl">
                    <!-- Checkout Header -->
                    <div class="text-center mb-12">
                        <div class="flex justify-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/80">
                                <i class="fas fa-shopping-cart text-white text-3xl"></i>
                            </div>
                        </div>
                        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-4">
                            Finaliser votre commande
                        </h1>
                        <p class="text-xl text-emerald-600">Nous livrons partout en Algérie avec soin</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Left Column - Forms -->
                        <div class="lg:col-span-2 space-y-8">
                            <!-- Client Information -->
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                                <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-user mr-3"></i>
                                        Informations personnelles
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <form id="checkoutForm" class="space-y-6">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Nom *</label>
                                                <input type="text" name="nom" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Votre nom de famille">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Prénom</label>
                                                <input type="text" name="prenom" 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Votre prénom">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Téléphone *</label>
                                                <input type="tel" name="telephone" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="+213 XXX XXX XXX">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Email (optionnel)</label>
                                                <input type="email" name="email" 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="votre@email.com">
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                            <!-- Delivery Address -->
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-map-marker-alt mr-3"></i>
                                        Adresse de livraison
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <div class="space-y-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Wilaya *</label>
                                            <select name="wilaya" required form="checkoutForm"
                                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm">
                                                <option value="">Sélectionnez votre wilaya</option>
                                                ${this.getAlgerianWilayas().map(w => `<option value="${w}">${w}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Ville</label>
                                                <input type="text" name="ville" form="checkoutForm"
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Nom de votre ville">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Code postal</label>
                                                <input type="text" name="codePostal" form="checkoutForm"
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="16000">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Adresse complète *</label>
                                            <textarea name="adresse" required rows="3" form="checkoutForm"
                                                      class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm resize-none"
                                                      placeholder="Rue, quartier, numéro de bâtiment..."></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Complément d'adresse</label>
                                            <input type="text" name="complementAdresse" form="checkoutForm"
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="Étage, interphone, code d'accès...">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column - Order Summary -->
                        <div class="lg:col-span-1">
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 sticky top-8 overflow-hidden">
                                <div class="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-receipt mr-3"></i>
                                        Récapitulatif
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <!-- Cart Items -->
                                    <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                        ${this.cart.map(item => `
                                            <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50">
                                                <img src="${item.image}" alt="${item.nom}" 
                                                     class="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-lg">
                                                <div class="flex-1">
                                                    <h4 class="font-bold text-emerald-800 text-sm line-clamp-2">${item.nom}</h4>
                                                    <div class="flex items-center justify-between mt-2">
                                                        <span class="text-emerald-600 font-semibold">${item.prix} DA</span>
                                                        <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">×${item.quantite}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <!-- Totals -->
                                    <div class="border-t-2 border-emerald-200 pt-6 space-y-4">
                                        <div class="flex justify-between text-emerald-700">
                                            <span class="font-semibold">Sous-total:</span>
                                            <span class="font-bold">${this.getCartTotal()} DA</span>
                                        </div>
                                        <div class="flex justify-between text-emerald-700">
                                            <span class="font-semibold">Frais de livraison:</span>
                                            <span class="font-bold" id="shippingCost">${this.getCartTotal() >= 5000 ? '0' : '300'} DA</span>
                                        </div>
                                        ${this.getCartTotal() >= 5000 ? `
                                            <div class="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-l-4 border-green-500">
                                                <p class="text-green-700 font-semibold text-sm flex items-center">
                                                    <i class="fas fa-gift mr-2"></i>
                                                    Livraison gratuite !
                                                </p>
                                            </div>
                                        ` : `
                                            <div class="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-xl border-l-4 border-yellow-500">
                                                <p class="text-yellow-700 text-sm">
                                                    <i class="fas fa-info-circle mr-2"></i>
                                                    Plus que <strong>${5000 - this.getCartTotal()} DA</strong> pour la livraison gratuite
                                                </p>
                                            </div>
                                        `}
                                        <div class="flex justify-between text-lg font-bold text-emerald-800 border-t-2 border-emerald-300 pt-4">
                                            <span>Total:</span>
                                            <span id="finalTotal" class="text-2xl">${this.getCartTotal() + (this.getCartTotal() >= 5000 ? 0 : 300)} DA</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Order Button -->
                                    <div class="mt-8">
                                        <button type="submit" form="checkoutForm" 
                                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg">
                                            <span id="orderButtonText">
                                                <i class="fas fa-check-circle mr-3"></i>
                                                Confirmer la commande
                                            </span>
                                            <div id="orderSpinner" class="hidden">
                                                <i class="fas fa-spinner fa-spin mr-3"></i>
                                                Traitement en cours...
                                            </div>
                                        </button>
                                        <p class="text-center text-emerald-600 text-sm mt-4">
                                            <i class="fas fa-shield-alt mr-1"></i>
                                            Commande sécurisée • Paiement à la livraison
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add form handler
        this.initCheckoutForm();
    }
    
    initCheckoutForm() {
        const form = document.getElementById('checkoutForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processOrder(e);
        });
        
        // Pre-fill if user is logged in
        if (this.currentUser) {
            form.nom.value = this.currentUser.nom || '';
            form.prenom.value = this.currentUser.prenom || '';
            form.telephone.value = this.currentUser.telephone || '';
            form.email.value = this.currentUser.email || '';
            
            if (this.currentUser.adresse) {
                form.adresse.value = this.currentUser.adresse;
            }
            if (this.currentUser.wilaya) {
                form.wilaya.value = this.currentUser.wilaya;
            }
        }
    }
    
    async processOrder(event) {
        const form = event.target;
        const formData = new FormData(form);
        
        // Get form data
        const clientInfo = {
            nom: formData.get('nom').trim(),
            prenom: formData.get('prenom').trim(),
            telephone: formData.get('telephone').trim(),
            email: formData.get('email').trim()
        };
        
        const adresseLivraison = {
            adresse: formData.get('adresse').trim(),
            ville: formData.get('ville').trim(),
            wilaya: formData.get('wilaya'),
            codePostal: formData.get('codePostal').trim(),
            complementAdresse: formData.get('complementAdresse').trim()
        };
        
        // Validation
        if (!clientInfo.nom || !clientInfo.telephone || !adresseLivraison.adresse || !adresseLivraison.wilaya) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Phone validation
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        if (!phoneRegex.test(clientInfo.telephone.replace(/\s+/g, ''))) {
            this.showToast('Veuillez entrer un numéro de téléphone algérien valide', 'error');
            return;
        }
        
        // Email validation (if provided)
        if (clientInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
            this.showToast('Veuillez entrer un email valide', 'error');
            return;
        }
        
        // Show loading state
        this.showOrderLoading(true);
        
        try {
            // Calculate totals
            const sousTotal = this.getCartTotal();
            const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
            const total = sousTotal + fraisLivraison;
            
            // Prepare order data
            const orderData = {
                produits: this.cart.map(item => ({
                    produit: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.quantite,
                    image: item.image
                })),
                clientInfo,
                adresseLivraison,
                sousTotal,
                fraisLivraison,
                total
            };
            
            console.log('📤 Sending order to backend:', orderData);
            
            // Submit order with retry logic
            const maxAttempts = 3;
            let lastError;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`📡 Attempt ${attempt}/${maxAttempts}: Submitting order to backend...`);
                    
                    const response = await apiCall('/orders', {
                        method: 'POST',
                        body: JSON.stringify(orderData)
                    });
                    
                    console.log('✅ Order created successfully:', response);
                    
                    // Clear cart and redirect to confirmation
                    this.clearCart();
                    this.showToast('Commande créée avec succès !', 'success');
                    this.showPage('order-confirmation', { orderNumber: response.numeroCommande });
                    return;
                    
                } catch (error) {
                    console.log(`⚠️ Backend attempt ${attempt} failed:`, error.message);
                    lastError = error;
                    
                    if (attempt < maxAttempts) {
                        console.log(`🔄 Retrying in ${2 * attempt} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                    }
                }
            }
            
            console.log('❌ All backend attempts failed');
            
            // Fallback: Save order locally
            const localOrder = {
                id: Date.now().toString(),
                numeroCommande: `LOCAL-${Date.now()}`,
                ...orderData,
                dateCommande: new Date().toISOString(),
                statut: 'en-attente-serveur'
            };
            
            // Save to localStorage for later sync
            const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
            pendingOrders.push(localOrder);
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
            
            // Also save to admin orders for immediate visibility
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            adminOrders.push(localOrder);
            localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
            
            console.log('💾 Order saved locally:', localOrder.numeroCommande);
            
            this.clearCart();
            this.showToast('Commande enregistrée localement. Nous vous contacterons sous peu.', 'success');
            this.showPage('order-confirmation', { orderNumber: localOrder.numeroCommande });
            
        } catch (error) {
            console.error('❌ Order processing error:', error);
            this.showToast('Une erreur est survenue. Veuillez réessayer ou nous contacter.', 'error');
        } finally {
            this.showOrderLoading(false);
        }
    }
    
    showOrderLoading(show) {
        const orderButtonText = document.getElementById('orderButtonText');
        const orderSpinner = document.getElementById('orderSpinner');
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (show) {
            orderButtonText.classList.add('hidden');
            orderSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            orderButtonText.classList.remove('hidden');
            orderSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    // Method to load order confirmation page
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-16 max-w-4xl">
                    <div class="text-center mb-12">
                        <!-- Success Animation -->
                        <div class="flex justify-center mb-8">
                            <div class="relative">
                                <div class="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                    <i class="fas fa-check text-white text-5xl"></i>
                                </div>
                                <div class="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                                    <i class="fas fa-star text-white text-xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-6">
                            Commande confirmée !
                        </h1>
                        <p class="text-2xl text-emerald-600 mb-8">Merci pour votre confiance</p>
                        
                        <!-- Order Number -->
                        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                            <div class="flex items-center justify-center mb-6">
                                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                                    <i class="fas fa-receipt text-white text-2xl"></i>
                                </div>
                                <div class="text-left">
                                    <p class="text-emerald-600 font-semibold">Numéro de commande</p>
                                    <p class="text-3xl font-bold text-emerald-800" id="orderNumberDisplay">${orderNumber}</p>
                                </div>
                            </div>
                            
                            <div class="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-6 border border-emerald-200">
                                <h3 class="text-xl font-bold text-emerald-800 mb-4">📱 Prochaines étapes</h3>
                                <div class="space-y-3 text-left">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-phone text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Nous vous contacterons dans les 2 heures pour confirmer votre commande</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-truck text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Livraison sous 24-48h (selon votre wilaya)</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-300 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-money-bill-wave text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Paiement à la livraison (espèces uniquement)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="app.showPage('home')" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-home mr-2"></i>
                                Retour à l'accueil
                            </button>
                            <button onclick="app.showPage('products')" 
                                    class="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Continuer mes achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Products page
    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-8">
                    <!-- Products Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-4">
                            Nos Produits
                        </h1>
                        <p class="text-xl text-emerald-600">Découvrez notre gamme complète de produits de santé et beauté</p>
                    </div>
                    
                    <!-- Filters -->
                    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-emerald-700 font-semibold mb-2">Rechercher</label>
                                <input type="text" id="productsSearchInput" placeholder="Nom du produit..."
                                       value="${params.search || ''}"
                                       class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                            </div>
                            <div>
                                <label class="block text-emerald-700 font-semibold mb-2">Catégorie</label>
                                <select id="productsCategoryFilter" 
                                        class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    <option value="">Toutes les catégories</option>
                                    <option value="Vitalité" ${params.categorie === 'Vitalité' ? 'selected' : ''}>Vitalité</option>
                                    <option value="Sport" ${params.categorie === 'Sport' ? 'selected' : ''}>Sport</option>
                                    <option value="Visage" ${params.categorie === 'Visage' ? 'selected' : ''}>Visage</option>
                                    <option value="Cheveux" ${params.categorie === 'Cheveux' ? 'selected' : ''}>Cheveux</option>
                                    <option value="Solaire" ${params.categorie === 'Solaire' ? 'selected' : ''}>Solaire</option>
                                    <option value="Intime" ${params.categorie === 'Intime' ? 'selected' : ''}>Intime</option>
                                    <option value="Soins" ${params.categorie === 'Soins' ? 'selected' : ''}>Soins</option>
                                    <option value="Bébé" ${params.categorie === 'Bébé' ? 'selected' : ''}>Bébé</option>
                                    <option value="Homme" ${params.categorie === 'Homme' ? 'selected' : ''}>Homme</option>
                                    <option value="Dentaire" ${params.categorie === 'Dentaire' ? 'selected' : ''}>Dentaire</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-emerald-700 font-semibold mb-2">Prix</label>
                                <select id="productsPriceFilter"
                                        class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    <option value="">Tous les prix</option>
                                    <option value="0-1000">0 - 1,000 DA</option>
                                    <option value="1000-3000">1,000 - 3,000 DA</option>
                                    <option value="3000-5000">3,000 - 5,000 DA</option>
                                    <option value="5000+">Plus de 5,000 DA</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-emerald-700 font-semibold mb-2">Trier par</label>
                                <select id="productsSortFilter"
                                        class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    <option value="newest">Plus récents</option>
                                    <option value="name_asc">Nom A-Z</option>
                                    <option value="name_desc">Nom Z-A</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix décroissant</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-4">
                            <button onclick="window.app.applyProductsFilters()" 
                                    class="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-all">
                                <i class="fas fa-filter mr-2"></i>Appliquer
                            </button>
                            <button onclick="clearProductsFilters()" 
                                    class="text-emerald-600 hover:text-emerald-800 transition-all">
                                <i class="fas fa-times mr-1"></i>Effacer
                            </button>
                        </div>
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="mb-6">
                        <p class="text-emerald-600" id="productsResultsCount">Chargement...</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" id="productsGrid">
                        <!-- Products will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Initialize products filtering
        this.initProductsFiltering(params);
        this.loadProductsGrid(params);
    }
    
    initProductsFiltering(params) {
        // Setup filter event listeners
        const searchInput = document.getElementById('productsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.applyProductsFilters();
            }, 300));
        }
    }
    
    applyProductsFilters() {
        const params = {
            search: document.getElementById('productsSearchInput')?.value || '',
            categorie: document.getElementById('productsCategoryFilter')?.value || '',
            priceRange: document.getElementById('productsPriceFilter')?.value || '',
            sort: document.getElementById('productsSortFilter')?.value || 'newest'
        };
        
        this.loadProductsGrid(params);
    }
    
    async loadProductsGrid(params = {}) {
        const productsGrid = document.getElementById('productsGrid');
        const resultsCount = document.getElementById('productsResultsCount');
        
        try {
            // Use cached products
            let filteredProducts = [...this.allProducts];
            
            // Apply search filter
            if (params.search) {
                const searchTerm = params.search.toLowerCase();
                filteredProducts = filteredProducts.filter(p => 
                    p.nom.toLowerCase().includes(searchTerm) ||
                    (p.marque && p.marque.toLowerCase().includes(searchTerm)) ||
                    (p.description && p.description.toLowerCase().includes(searchTerm))
                );
            }
            
            // Apply category filter
            if (params.categorie) {
                filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
            }
            
            // Apply price filter
            if (params.priceRange) {
                const [min, max] = params.priceRange.split('-');
                filteredProducts = filteredProducts.filter(p => {
                    if (max === undefined) {
                        return p.prix >= parseInt(min);
                    }
                    return p.prix >= parseInt(min) && p.prix <= parseInt(max);
                });
            }
            
            // Apply sorting
            filteredProducts.sort((a, b) => {
                switch (params.sort) {
                    case 'name_asc': return a.nom.localeCompare(b.nom);
                    case 'name_desc': return b.nom.localeCompare(a.nom);
                    case 'price_asc': return a.prix - b.prix;
                    case 'price_desc': return b.prix - a.prix;
                    case 'newest': return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0);
                    default: return 0;
                }
            });
            
            // Filter out inactive products for public view
            filteredProducts = filteredProducts.filter(p => p.actif !== false);
            
            if (resultsCount) {
                resultsCount.textContent = `${filteredProducts.length} produits trouvés`;
            }
            
            if (filteredProducts.length === 0) {
                productsGrid.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                        <p class="text-emerald-600 mb-8">Essayez de modifier vos critères de recherche</p>
                        <button onclick="clearProductsFilters()" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                            <i class="fas fa-times mr-2"></i>Effacer les filtres
                        </button>
                    </div>
                `;
                return;
            }
            
            productsGrid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
            
        } catch (error) {
            console.error('Error loading products grid:', error);
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-700 mb-4">Erreur de chargement</h3>
                    <p class="text-red-500">Impossible de charger les produits</p>
                </div>
            `;
        }
    }

    // Product detail page
    async loadProductPage(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        const imageUrl = product.image || `https://via.placeholder.com/600x400/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}`;
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-8 max-w-6xl">
                    <!-- Breadcrumb -->
                    <nav class="mb-8">
                        <div class="flex items-center space-x-2 text-sm">
                            <button onclick="app.showPage('home')" class="text-emerald-600 hover:text-emerald-800">Accueil</button>
                            <i class="fas fa-chevron-right text-emerald-400"></i>
                            <button onclick="app.showPage('products')" class="text-emerald-600 hover:text-emerald-800">Produits</button>
                            <i class="fas fa-chevron-right text-emerald-400"></i>
                            <span class="text-emerald-800 font-semibold">${product.nom}</span>
                        </div>
                    </nav>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Product Image -->
                        <div class="space-y-6">
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                                <img src="${imageUrl}" alt="${product.nom}" 
                                     class="w-full h-96 object-cover"
                                     onerror="this.src='https://via.placeholder.com/600x400/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                            </div>
                        </div>
                        
                        <!-- Product Info -->
                        <div class="space-y-8">
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                                <!-- Header -->
                                <div class="mb-6">
                                    <div class="flex items-center justify-between mb-4">
                                        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full">
                                            ${product.categorie}
                                        </span>
                                        ${product.enVedette ? '<span class="text-yellow-500 text-xl">⭐</span>' : ''}
                                    </div>
                                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                                    ${product.marque ? `<p class="text-lg text-emerald-600 mb-4">Par ${product.marque}</p>` : ''}
                                    <p class="text-gray-700 text-lg leading-relaxed">${product.description}</p>
                                </div>
                                
                                <!-- Price -->
                                <div class="mb-8">
                                    <div class="flex items-center space-x-4 mb-4">
                                        ${product.enPromotion && product.prixOriginal ? `
                                            <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                            <span class="text-4xl font-bold text-red-600">${product.prix} DA</span>
                                        ` : `
                                            <span class="text-4xl font-bold text-emerald-700">${product.prix} DA</span>
                                        `}
                                    </div>
                                    
                                    <!-- Stock -->
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm font-semibold text-gray-700">Disponibilité:</span>
                                        ${product.stock > 0 ? `
                                            <span class="text-green-600 font-semibold">
                                                <i class="fas fa-check-circle mr-1"></i>
                                                ${product.stock} en stock
                                            </span>
                                        ` : `
                                            <span class="text-red-600 font-semibold">
                                                <i class="fas fa-times-circle mr-1"></i>
                                                Rupture de stock
                                            </span>
                                        `}
                                    </div>
                                </div>
                                
                                <!-- Add to Cart -->
                                <div class="space-y-4">
                                    ${product.stock > 0 ? `
                                        <div class="flex items-center space-x-4 mb-6">
                                            <label class="text-sm font-semibold text-gray-700">Quantité:</label>
                                            <div class="flex items-center space-x-2">
                                                <button onclick="changeQuantity(-1)" 
                                                        class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                                                    <i class="fas fa-minus"></i>
                                                </button>
                                                <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}"
                                                       class="w-20 text-center border-2 border-emerald-200 rounded-lg py-2">
                                                <button onclick="changeQuantity(1)" 
                                                        class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <button onclick="addProductToCart('${product._id}')" 
                                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
                                            <i class="fas fa-cart-plus mr-3"></i>
                                            Ajouter au panier
                                        </button>
                                    ` : `
                                        <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                                            <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                                            <h3 class="text-xl font-bold text-red-700 mb-2">Produit indisponible</h3>
                                            <p class="text-red-600">Ce produit est actuellement en rupture de stock.</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                function changeQuantity(delta) {
                    const input = document.getElementById('productQuantity');
                    const currentValue = parseInt(input.value) || 1;
                    const newValue = Math.max(1, Math.min(${product.stock}, currentValue + delta));
                    input.value = newValue;
                }
                
                function addProductToCart(productId) {
                    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
                    if (window.app) {
                        window.app.addToCart(productId, quantity);
                    }
                }
            </script>
        `;
    }

    // Admin functionality stub
    async loadAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès refusé - Droits administrateur requis', 'error');
            this.showPage('home');
            return;
        }

        // This would load the full admin interface
        // For now, show a placeholder
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                    <i class="fas fa-cog text-6xl text-emerald-500 mb-6"></i>
                    <h2 class="text-3xl font-bold text-emerald-800 mb-4">Panel d'Administration</h2>
                    <p class="text-emerald-600 mb-8">Interface d'administration en cours de développement</p>
                    <button onclick="app.showPage('home')" 
                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                        <i class="fas fa-home mr-2"></i>Retour à l'accueil
                    </button>
                </div>
            </div>
        `;
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
    
    // Method to check if user is authenticated for protected actions
    requireAuth() {
        if (!this.currentUser) {
            this.showToast('Veuillez vous connecter pour continuer', 'warning');
            this.showPage('login');
            return false;
        }
        return true;
    }
    
    // Method to check if user is admin
    requireAdmin() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès administrateur requis', 'error');
            this.showPage('home');
            return false;
        }
        return true;
    }
    
    // Enhanced error handling for authentication
    handleAuthError(error, context = '') {
        console.error(`Auth Error ${context}:`, error);
        
        if (error.message.includes('401') || error.message.includes('Token invalide')) {
            // Token expired or invalid
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

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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

function clearProductsFilters() {
    const searchInput = document.getElementById('productsSearchInput');
    const categoryFilter = document.getElementById('productsCategoryFilter');
    const priceFilter = document.getElementById('productsPriceFilter');
    const sortFilter = document.getElementById('productsSortFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = 'newest';
    
    if (window.app && typeof window.app.loadProductsGrid === 'function') {
        window.app.loadProductsGrid();
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

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('App initialized and made globally available');
});

console.log('✅ Complete app.js loaded with all required methods');
