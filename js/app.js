// Complete Fixed PharmacieGaherApp with Profile, Orders, and all missing functionality
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
            console.log('🚀 Initializing Shifa Parapharmacie App...');
            
            await this.checkAuth();
            await this.loadProductsCache();
            this.initUI();
            
            // Fix: Always start with home page and scroll to top
            this.currentPage = 'home';
            await this.showPage('home');
            
            this.updateCartUI();
            this.initSearch();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
    }
    
    // Load and cache products from localStorage and API
    async loadProductsCache() {
        try {
            console.log('📦 Loading products cache...');
            
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
                console.log('ℹ️ API unavailable, using local products only:', error.message);
            }
            
            console.log(`✅ Products cache loaded: ${this.allProducts.length} products`);
            
        } catch (error) {
            console.error('❌ Error loading products cache:', error);
            this.allProducts = [];
        }
    }
    
    // Refresh products cache (called from admin when products are modified)
    refreshProductsCache() {
        console.log('🔄 Refreshing products cache...');
        
        // Reload from localStorage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        this.allProducts = [...localProducts];
        
        console.log(`✅ Products cache refreshed: ${this.allProducts.length} products`);
        
        // Refresh current page if needed
        if (this.currentPage === 'home') {
            this.refreshHomePage();
        } else if (this.currentPage === 'products') {
            this.showPage('products');
        }
    }
    
    // Refresh home page content
    refreshHomePage() {
        console.log('🔄 Refreshing home page content...');
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
                console.error('Auth check error:', error);
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
        
        console.log('✅ UI initialized');
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
            console.log(`📄 Loading page: ${pageName}`, params);
            
            this.showLoading();
            this.currentPage = pageName;
            
            // Fix: Always scroll to top when loading new page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
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
            
            console.log(`✅ Page loaded: ${pageName}`);
            
        } catch (error) {
            console.error('❌ Error loading page:', error);
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
        console.log('📦 Loading featured products...');
        
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
        console.log('📦 Loading promotion products...');
        
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
    
    // NEW: Profile Page Implementation
    async loadProfilePage() {
        console.log('👤 Loading profile page...');
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                    <!-- Profile Header -->
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-12 text-white relative">
                        <div class="absolute top-4 right-4">
                            <button onclick="app.showPage('home')" class="text-white/80 hover:text-white transition-colors">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                                <i class="fas fa-user text-3xl"></i>
                            </div>
                            <div class="text-center md:text-left">
                                <h1 class="text-3xl font-bold mb-2">Mon Profil</h1>
                                <p class="text-emerald-100 text-lg">${this.currentUser.prenom} ${this.currentUser.nom}</p>
                                <p class="text-emerald-200">${this.currentUser.email}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profile Content -->
                    <div class="p-8">
                        <!-- Navigation Tabs -->
                        <div class="flex flex-wrap border-b border-emerald-200 mb-8">
                            <button onclick="switchProfileTab('info')" class="profile-tab active px-6 py-3 text-emerald-600 font-semibold border-b-2 border-emerald-500 transition-all">
                                <i class="fas fa-user mr-2"></i>Informations personnelles
                            </button>
                            <button onclick="switchProfileTab('security')" class="profile-tab px-6 py-3 text-gray-500 hover:text-emerald-600 font-semibold border-b-2 border-transparent transition-all">
                                <i class="fas fa-lock mr-2"></i>Sécurité
                            </button>
                        </div>
                        
                        <!-- Personal Information Tab -->
                        <div id="profileInfoTab" class="tab-content">
                            <form id="profileForm" onsubmit="handleProfileUpdate(event)" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" id="profilePrenom" value="${this.currentUser.prenom || ''}" 
                                               class="form-input" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                        <input type="text" id="profileNom" value="${this.currentUser.nom || ''}" 
                                               class="form-input" required>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                    <input type="email" id="profileEmail" value="${this.currentUser.email || ''}" 
                                           class="form-input" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="profileTelephone" value="${this.currentUser.telephone || ''}" 
                                           class="form-input" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                                    <textarea id="profileAdresse" rows="3" class="form-input">${this.currentUser.adresse || ''}</textarea>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya</label>
                                        <select id="profileWilaya" class="form-input">
                                            <option value="">Sélectionnez une wilaya</option>
                                            ${this.getWilayaOptions(this.currentUser.wilaya)}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
                                        <input type="text" id="profileCodePostal" value="${this.currentUser.codePostal || ''}" 
                                               class="form-input">
                                    </div>
                                </div>
                                
                                <div class="flex justify-end space-x-4 pt-6">
                                    <button type="button" onclick="app.showPage('home')" 
                                            class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                                        Annuler
                                    </button>
                                    <button type="submit" class="btn-primary px-8 py-3" id="profileUpdateBtn">
                                        <i class="fas fa-save mr-2"></i>Enregistrer les modifications
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Security Tab -->
                        <div id="profileSecurityTab" class="tab-content hidden">
                            <form id="passwordForm" onsubmit="handlePasswordChange(event)" class="space-y-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel *</label>
                                    <input type="password" id="currentPassword" class="form-input" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe *</label>
                                    <input type="password" id="newPassword" class="form-input" required>
                                    <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Confirmer le nouveau mot de passe *</label>
                                    <input type="password" id="confirmPassword" class="form-input" required>
                                </div>
                                
                                <div class="flex justify-end space-x-4 pt-6">
                                    <button type="button" onclick="document.getElementById('passwordForm').reset()" 
                                            class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                                        Annuler
                                    </button>
                                    <button type="submit" class="btn-primary px-8 py-3" id="passwordUpdateBtn">
                                        <i class="fas fa-key mr-2"></i>Changer le mot de passe
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW: Orders Page Implementation  
    async loadOrdersPage() {
        console.log('📦 Loading orders page...');
        
        const mainContent = document.getElementById('mainContent');
        
        // Show loading state
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p class="text-emerald-600 mt-4">Chargement de vos commandes...</p>
                </div>
            </div>
        `;
        
        let orders = [];
        
        try {
            // Try to load from API first
            const response = await apiCall('/orders/user/all');
            if (response && response.orders) {
                orders = response.orders;
                console.log(`✅ Loaded ${orders.length} orders from API`);
            }
        } catch (error) {
            console.log('⚠️ API unavailable, loading from localStorage');
            
            // Load from localStorage if API fails
            const userOrdersKey = `userOrders_${this.currentUser.id}`;
            const localOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
            orders = localOrders;
            
            console.log(`📦 Loaded ${orders.length} orders from localStorage`);
        }
        
        // Render orders page
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                    <!-- Orders Header -->
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-12 text-white relative">
                        <div class="absolute top-4 right-4">
                            <button onclick="app.showPage('home')" class="text-white/80 hover:text-white transition-colors">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="flex flex-col md:flex-row items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold mb-2">Mes Commandes</h1>
                                <p class="text-emerald-100">${orders.length} commande${orders.length !== 1 ? 's' : ''} au total</p>
                            </div>
                            <div class="mt-4 md:mt-0">
                                <button onclick="app.showPage('products')" class="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all font-semibold">
                                    <i class="fas fa-plus mr-2"></i>Nouvelle commande
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Orders Content -->
                    <div class="p-8">
                        ${orders.length === 0 ? this.renderNoOrders() : this.renderOrdersList(orders)}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderNoOrders() {
        return `
            <div class="text-center py-16">
                <div class="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i class="fas fa-shopping-bag text-5xl text-emerald-500"></i>
                </div>
                <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                <p class="text-emerald-600 mb-8 max-w-md mx-auto">
                    Vous n'avez pas encore passé de commande. Explorez notre catalogue et découvrez nos produits naturels.
                </p>
                <button onclick="app.showPage('products')" class="btn-primary px-8 py-3">
                    <i class="fas fa-leaf mr-2"></i>Découvrir nos produits
                </button>
            </div>
        `;
    }
    
    renderOrdersList(orders) {
        const getStatusColor = (status) => {
            const colors = {
                'en-attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'confirmée': 'bg-blue-100 text-blue-800 border-blue-200',
                'préparée': 'bg-purple-100 text-purple-800 border-purple-200',
                'expédiée': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                'livrée': 'bg-green-100 text-green-800 border-green-200',
                'annulée': 'bg-red-100 text-red-800 border-red-200'
            };
            return colors[status] || colors['en-attente'];
        };
        
        const getStatusIcon = (status) => {
            const icons = {
                'en-attente': 'fa-clock',
                'confirmée': 'fa-check-circle',
                'préparée': 'fa-box',
                'expédiée': 'fa-truck',
                'livrée': 'fa-check-double',
                'annulée': 'fa-times-circle'
            };
            return icons[status] || icons['en-attente'];
        };
        
        return `
            <div class="space-y-6">
                ${orders.map(order => `
                    <div class="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <!-- Order Header -->
                        <div class="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
                            <div class="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                                <div class="flex items-center space-x-4">
                                    <div class="font-bold text-emerald-800">
                                        Commande #${order.numeroCommande}
                                    </div>
                                    <div class="px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.statut)}">
                                        <i class="fas ${getStatusIcon(order.statut)} mr-1"></i>
                                        ${order.statut.charAt(0).toUpperCase() + order.statut.slice(1)}
                                    </div>
                                </div>
                                <div class="text-sm text-gray-600">
                                    ${new Date(order.dateCommande).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Order Details -->
                        <div class="p-6">
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <!-- Products -->
                                <div class="lg:col-span-2">
                                    <h4 class="font-semibold text-gray-800 mb-4">Articles commandés</h4>
                                    <div class="space-y-3">
                                        ${order.articles.map(article => `
                                            <div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    ${article.image ? 
                                                        `<img src="${article.image}" alt="${article.nom}" class="w-full h-full object-cover rounded-lg">` :
                                                        `<i class="fas fa-pills text-emerald-600"></i>`
                                                    }
                                                </div>
                                                <div class="flex-1">
                                                    <div class="font-medium text-gray-800">${article.nom}</div>
                                                    <div class="text-sm text-gray-600">Quantité: ${article.quantite} × ${article.prix} DA</div>
                                                </div>
                                                <div class="font-semibold text-emerald-700">
                                                    ${article.quantite * article.prix} DA
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <!-- Order Summary -->
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-4">Résumé</h4>
                                    <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 space-y-2">
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Sous-total:</span>
                                            <span class="font-medium">${order.sousTotal} DA</span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Livraison:</span>
                                            <span class="font-medium ${order.fraisLivraison === 0 ? 'text-green-600' : ''}">${order.fraisLivraison} DA</span>
                                        </div>
                                        <hr class="border-emerald-200">
                                        <div class="flex justify-between font-bold text-lg">
                                            <span class="text-emerald-800">Total:</span>
                                            <span class="text-emerald-800">${order.total} DA</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Customer Info -->
                                    <div class="mt-4 text-sm text-gray-600">
                                        <div><strong>Livraison:</strong> ${order.client.adresse}</div>
                                        <div><strong>Wilaya:</strong> ${order.client.wilaya}</div>
                                        <div><strong>Paiement:</strong> ${order.modePaiement}</div>
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="mt-4 space-y-2">
                                        ${order.statut === 'en-attente' ? `
                                            <button onclick="cancelOrder('${order._id}')" 
                                                    class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium">
                                                <i class="fas fa-times mr-2"></i>Annuler la commande
                                            </button>
                                        ` : ''}
                                        <button onclick="trackOrder('${order._id}')" 
                                                class="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all text-sm font-medium">
                                            <i class="fas fa-search mr-2"></i>Suivre la commande
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Login page implementation
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-12 text-center text-white">
                        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-sign-in-alt text-2xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold">Connexion</h1>
                        <p class="text-emerald-100 mt-2">Accédez à votre compte</p>
                    </div>
                    
                    <form id="loginForm" onsubmit="handleLogin(event)" class="p-8 space-y-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input type="email" id="loginEmail" required class="form-input" placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                            <input type="password" id="loginPassword" required class="form-input" placeholder="••••••••">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-3">
                            <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                        </button>
                        
                        <div class="text-center">
                            <p class="text-gray-600">Pas encore de compte ?</p>
                            <button type="button" onclick="showPage('register')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                                Créer un compte
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    // Register page implementation
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-12 text-center text-white">
                        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-user-plus text-2xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold">Inscription</h1>
                        <p class="text-emerald-100 mt-2">Créez votre compte</p>
                    </div>
                    
                    <form id="registerForm" onsubmit="handleRegister(event)" class="p-8 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                <input type="text" id="registerPrenom" required class="form-input">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                <input type="text" id="registerNom" required class="form-input">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input type="email" id="registerEmail" required class="form-input">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                            <input type="tel" id="registerTelephone" required class="form-input" placeholder="+213 XXX XXX XXX">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                            <input type="password" id="registerPassword" required class="form-input" placeholder="Minimum 6 caractères">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                            <textarea id="registerAdresse" rows="2" class="form-input"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya</label>
                            <select id="registerWilaya" class="form-input">
                                <option value="">Sélectionnez une wilaya</option>
                                ${this.getWilayaOptions()}
                            </select>
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-3">
                            <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                        </button>
                        
                        <div class="text-center">
                            <p class="text-gray-600">Déjà un compte ?</p>
                            <button type="button" onclick="showPage('login')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                                Se connecter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    // Checkout page implementation
    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Checkout Form -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-8">Finaliser la commande</h2>
                            
                            <form id="checkoutForm" onsubmit="app.processOrder(); return false;" class="space-y-6">
                                <!-- Customer Information -->
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Informations de livraison</h3>
                                    
                                    ${this.currentUser ? `
                                        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                                            <p class="text-emerald-700">
                                                <i class="fas fa-user mr-2"></i>
                                                Connecté en tant que: ${this.currentUser.prenom} ${this.currentUser.nom}
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                            <input type="text" id="checkoutPrenom" value="${this.currentUser?.prenom || ''}" 
                                                   class="form-input" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                            <input type="text" id="checkoutNom" value="${this.currentUser?.nom || ''}" 
                                                   class="form-input" required>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                            <input type="email" id="checkoutEmail" value="${this.currentUser?.email || ''}" 
                                                   class="form-input" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                            <input type="tel" id="checkoutTelephone" value="${this.currentUser?.telephone || ''}" 
                                                   class="form-input" required>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse de livraison *</label>
                                        <textarea id="checkoutAdresse" rows="3" class="form-input" required>${this.currentUser?.adresse || ''}</textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                        <select id="checkoutWilaya" class="form-input" required onchange="checkoutSystem?.calculateShipping()">
                                            <option value="">Sélectionnez une wilaya</option>
                                            ${this.getWilayaOptions(this.currentUser?.wilaya)}
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Payment Method -->
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Mode de paiement</h3>
                                    <div class="space-y-3">
                                        <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input type="radio" name="modePaiement" value="Paiement à la livraison" checked class="mr-4">
                                            <div class="flex items-center">
                                                <i class="fas fa-money-bill-wave text-green-500 text-xl mr-3"></i>
                                                <div>
                                                    <div class="font-semibold">Paiement à la livraison</div>
                                                    <div class="text-sm text-gray-600">Payez en espèces lors de la réception</div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <div id="paymentMethodInfo"></div>
                                </div>
                                
                                <!-- Comments -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Commentaires (optionnel)</label>
                                    <textarea id="checkoutCommentaires" rows="3" class="form-input" 
                                              placeholder="Instructions spéciales pour la livraison..."></textarea>
                                </div>
                                
                                <button type="submit" class="w-full btn-primary py-4 text-lg">
                                    <i class="fas fa-check mr-2"></i>Confirmer la commande
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-xl p-8 sticky top-4">
                            <h3 class="text-xl font-bold text-emerald-800 mb-6">Résumé de la commande</h3>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-3 bg-white rounded-lg p-3">
                                        <img src="${item.image}" alt="${item.nom}" 
                                             class="w-12 h-12 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <div class="font-medium text-gray-800 text-sm">${item.nom}</div>
                                            <div class="text-xs text-gray-600">${item.quantite} × ${item.prix} DA</div>
                                        </div>
                                        <div class="font-semibold text-emerald-700">
                                            ${item.quantite * item.prix} DA
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Totals -->
                            <div class="space-y-3 border-t border-emerald-200 pt-4">
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Sous-total:</span>
                                    <span id="checkoutSousTotal" class="font-semibold">${this.getCartTotal()} DA</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Livraison:</span>
                                    <span id="checkoutFraisLivraison" class="font-semibold">300 DA</span>
                                </div>
                                <div id="shippingMessage"></div>
                                <hr class="border-emerald-200">
                                <div class="flex justify-between text-lg font-bold text-emerald-800">
                                    <span>Total:</span>
                                    <span id="checkoutTotal">${this.getCartTotal() + 300} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize checkout system
        if (window.initCheckout) {
            window.initCheckout();
        }
    }
    
    // Order confirmation page
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <div class="text-center">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <i class="fas fa-check text-4xl text-green-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-green-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-green-600 mb-8">
                        Votre commande #${orderNumber} a été enregistrée avec succès.
                    </p>
                    
                    <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 mb-8">
                        <h3 class="text-xl font-semibold text-green-800 mb-4">Prochaines étapes</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div class="text-center">
                                <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-phone text-green-700"></i>
                                </div>
                                <h4 class="font-semibold text-green-800 mb-2">Confirmation</h4>
                                <p class="text-green-600">Nous vous contacterons pour confirmer votre commande</p>
                            </div>
                            <div class="text-center">
                                <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-box text-green-700"></i>
                                </div>
                                <h4 class="font-semibold text-green-800 mb-2">Préparation</h4>
                                <p class="text-green-600">Votre commande sera préparée avec soin</p>
                            </div>
                            <div class="text-center">
                                <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-truck text-green-700"></i>
                                </div>
                                <h4 class="font-semibold text-green-800 mb-2">Livraison</h4>
                                <p class="text-green-600">Livraison sous 2-5 jours ouvrables</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-x-4">
                        <button onclick="app.showPage('home')" class="btn-primary px-8 py-3">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                        ${this.currentUser ? `
                            <button onclick="app.showPage('orders')" class="bg-gray-500 text-white px-8 py-3 rounded-xl hover:bg-gray-600 transition-all">
                                <i class="fas fa-list mr-2"></i>Mes commandes
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Contact page implementation
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
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-map-marker-alt text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Adresse</h3>
                                        <p class="text-gray-600">Tipaza, Algérie</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-phone text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Téléphone</h3>
                                        <p class="text-gray-600">+213 123 456 789</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-envelope text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">Email</h3>
                                        <a href="mailto:pharmaciegaher@gmail.com" class="text-emerald-600 hover:text-emerald-700">
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
    
    // Helper method to get wilaya options
    getWilayaOptions(selectedWilaya = '') {
        const wilayas = [
            'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida',
            'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa',
            'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine',
            'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi',
            'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
            'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
        ];
        
        return wilayas.map(wilaya => 
            `<option value="${wilaya}" ${selectedWilaya === wilaya ? 'selected' : ''}>${wilaya}</option>`
        ).join('');
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
    
    // Cart functionality
    async addToCart(productId, quantity = 1) {
        try {
            console.log('🛒 Adding to cart:', productId, quantity);
            
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
            console.error('❌ Error adding to cart:', error);
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
    
    // Process order method - Fixed to work with checkout
    async processOrder() {
        if (window.checkoutSystem) {
            return await window.checkoutSystem.processOrder();
        } else {
            this.showToast('Système de commande non initialisé', 'error');
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
    }
    
    // ADMIN METHODS
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

// Global functions - CRITICAL FIXES
function addToCartFromCard(productId, quantity = 1) {
    console.log('🛒 Add to cart from card called:', productId);
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
    
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Envoi en cours...';
    if (submitSpinner) submitSpinner.classList.remove('hidden');
    
    setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Envoyer le message';
        if (submitSpinner) submitSpinner.classList.add('hidden');
        
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

// Profile and Orders functions
function switchProfileTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.profile-tab').forEach(btn => {
        btn.classList.remove('active', 'border-emerald-500', 'text-emerald-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`profile${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Set active tab button
    const activeButton = document.querySelector(`.profile-tab[onclick*="'${tabName}'"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-emerald-500', 'text-emerald-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (!window.app || !window.app.currentUser) {
        return;
    }
    
    const updateBtn = document.getElementById('profileUpdateBtn');
    const originalText = updateBtn ? updateBtn.innerHTML : '';
    
    try {
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mise à jour...';
        }
        
        const updateData = {
            prenom: document.getElementById('profilePrenom').value.trim(),
            nom: document.getElementById('profileNom').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            telephone: document.getElementById('profileTelephone').value.trim(),
            adresse: document.getElementById('profileAdresse').value.trim(),
            wilaya: document.getElementById('profileWilaya').value,
            codePostal: document.getElementById('profileCodePostal').value.trim()
        };
        
        // Update via API or locally
        if (window.authSystem) {
            const result = await window.authSystem.updateProfile(updateData);
            if (result) {
                window.app.currentUser = { ...window.app.currentUser, ...updateData };
                window.app.showToast('Profil mis à jour avec succès', 'success');
            }
        } else {
            // Local update
            window.app.currentUser = { ...window.app.currentUser, ...updateData };
            window.app.showToast('Profil mis à jour localement', 'success');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        window.app.showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.innerHTML = originalText;
        }
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    if (!window.app || !window.app.currentUser) {
        return;
    }
    
    const passwordBtn = document.getElementById('passwordUpdateBtn');
    const originalText = passwordBtn ? passwordBtn.innerHTML : '';
    
    try {
        if (passwordBtn) {
            passwordBtn.disabled = true;
            passwordBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Modification...';
        }
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        
        if (window.authSystem) {
            await window.authSystem.changePassword(currentPassword, newPassword);
            document.getElementById('passwordForm').reset();
            window.app.showToast('Mot de passe modifié avec succès', 'success');
        } else {
            throw new Error('Système d\'authentification non disponible');
        }
        
    } catch (error) {
        console.error('Password change error:', error);
        window.app.showToast(error.message || 'Erreur lors de la modification', 'error');
    } finally {
        if (passwordBtn) {
            passwordBtn.disabled = false;
            passwordBtn.innerHTML = originalText;
        }
    }
}

function cancelOrder(orderId) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
        // Implementation for order cancellation
        if (window.app) {
            window.app.showToast('Demande d\'annulation envoyée', 'info');
        }
    }
}

function trackOrder(orderId) {
    // Implementation for order tracking
    if (window.app) {
        window.app.showToast('Fonctionnalité de suivi bientôt disponible', 'info');
    }
}

// Initialize app - FIXED to ensure home page loads first
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Shifa Parapharmacie App...');
    
    // Ensure we start at the top of the page
    window.scrollTo(0, 0);
    
    app = new PharmacieGaherApp();
    window.app = app;
    
    console.log('✅ App initialized and made globally available');
});

// Export functions for global access
window.addToCartFromCard = addToCartFromCard;
window.showPage = showPage;
window.filterByCategory = filterByCategory;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.handleContactForm = handleContactForm;
window.logout = logout;
window.switchProfileTab = switchProfileTab;
window.handleProfileUpdate = handleProfileUpdate;
window.handlePasswordChange = handlePasswordChange;
window.cancelOrder = cancelOrder;
window.trackOrder = trackOrder;

console.log('✅ Complete Fixed app.js loaded with all functionality');
