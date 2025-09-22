// Enhanced Shifa Parapharmacie Application
class ShifaApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.allProducts = [];
        this.categories = [];
        this.settings = {};
        this.currentPage = 'home';
        this.isLoading = false;
        
        // State management
        this.state = {
            searchQuery: '',
            activeCategory: null,
            sortBy: 'dateAjout',
            sortOrder: 'desc',
            currentProductPage: 1,
            productsPerPage: APP_CONFIG.UI.PRODUCTS_PER_PAGE
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.showPage = this.showPage.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.updateCartUI = this.updateCartUI.bind(this);
        
        console.log('🚀 Shifa App initialized');
    }
    
    // Initialize application
    async init() {
        try {
            this.showLoading(true);
            console.log('🔧 Initializing Shifa App...');
            
            // Initialize components in order
            await this.checkAuthentication();
            await this.loadSettings();
            await this.loadCategories();
            await this.loadProductsCache();
            
            // Initialize UI components
            this.initializeEventHandlers();
            this.initializeSearch();
            this.updateCartUI();
            this.updateUserUI();
            
            // Load initial page
            const urlParams = new URLSearchParams(window.location.search);
            const initialPage = urlParams.get('page') || 'home';
            await this.showPage(initialPage);
            
            // Set up periodic tasks
            this.setupPeriodicTasks();
            
            console.log('✅ Shifa App initialization complete');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Check user authentication status
    async checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('👤 No authentication token found');
            return;
        }
        
        try {
            console.log('🔐 Verifying authentication...');
            const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
            
            if (response && response.id) {
                this.currentUser = response;
                console.log('✅ User authenticated:', this.currentUser.email);
                
                // Load user-specific data
                if (APP_CONFIG.FEATURES.NOTIFICATIONS) {
                    this.loadUserNotifications();
                }
            }
        } catch (error) {
            console.warn('⚠️ Authentication verification failed:', error.message);
            localStorage.removeItem('token');
            this.currentUser = null;
        }
    }
    
    // Load application settings
    async loadSettings() {
        try {
            console.log('⚙️ Loading app settings...');
            const response = await apiCall(API_CONFIG.ENDPOINTS.SETTINGS.GET);
            
            if (response && response.settings) {
                this.settings = response.settings;
                console.log('✅ Settings loaded');
                
                // Update page title if needed
                if (this.settings.siteName) {
                    document.title = this.settings.siteName;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load settings, using defaults:', error.message);
            this.settings = {
                siteName: APP_CONFIG.SITE_NAME,
                contact: APP_CONFIG.CONTACT,
                shipping: {
                    standardCost: APP_CONFIG.ECOMMERCE.STANDARD_SHIPPING_COST,
                    freeShippingThreshold: APP_CONFIG.ECOMMERCE.FREE_SHIPPING_THRESHOLD
                }
            };
        }
    }
    
    // Load product categories
    async loadCategories() {
        try {
            console.log('📂 Loading categories...');
            const response = await apiCall(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
            
            if (response && response.categories) {
                this.categories = response.categories;
                console.log(`✅ ${this.categories.length} categories loaded`);
            } else {
                // Fallback to default categories
                this.categories = Object.keys(APP_CONFIG.CATEGORIES).map(name => ({
                    nom: name,
                    count: 0,
                    ...APP_CONFIG.CATEGORIES[name]
                }));
            }
        } catch (error) {
            console.warn('⚠️ Failed to load categories, using defaults:', error.message);
            this.categories = Object.keys(APP_CONFIG.CATEGORIES).map(name => ({
                nom: name,
                count: 0,
                ...APP_CONFIG.CATEGORIES[name]
            }));
        }
    }
    
    // Load and cache products
    async loadProductsCache() {
        try {
            console.log('📦 Loading products cache...');
            
            // Try to load from localStorage first
            const localProducts = JSON.parse(localStorage.getItem('productsCache') || '[]');
            if (localProducts.length > 0) {
                this.allProducts = localProducts;
                console.log(`📦 Loaded ${localProducts.length} products from cache`);
            }
            
            // Then try to load from API
            try {
                const response = await apiCall(API_CONFIG.ENDPOINTS.PRODUCTS.LIST + '?limit=100');
                if (response && response.products && response.products.length > 0) {
                    this.allProducts = response.products;
                    
                    // Update localStorage cache
                    localStorage.setItem('productsCache', JSON.stringify(this.allProducts));
                    console.log(`✅ ${this.allProducts.length} products loaded from API`);
                }
            } catch (apiError) {
                console.warn('⚠️ API unavailable, using cached products:', apiError.message);
                
                // If no cached products and no API, create demo data
                if (this.allProducts.length === 0) {
                    this.allProducts = this.generateDemoProducts();
                    localStorage.setItem('productsCache', JSON.stringify(this.allProducts));
                    console.log('📦 Demo products generated');
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.allProducts = this.generateDemoProducts();
        }
    }
    
    // Generate demo products for offline mode
    generateDemoProducts() {
        const demoProducts = [];
        const categories = Object.keys(APP_CONFIG.CATEGORIES);
        
        categories.forEach((category, categoryIndex) => {
            const categoryInfo = APP_CONFIG.CATEGORIES[category];
            
            for (let i = 1; i <= 5; i++) {
                const productId = `demo_${categoryIndex}_${i}`;
                const basePrice = Math.floor(Math.random() * 3000) + 500;
                const isPromotion = Math.random() < 0.3;
                const isFeatured = Math.random() < 0.4;
                
                demoProducts.push({
                    _id: productId,
                    nom: `${category} Premium ${i}`,
                    description: `Produit de qualité supérieure pour ${categoryInfo.description.toLowerCase()}. Formule avancée pour des résultats optimaux.`,
                    prix: isPromotion ? Math.floor(basePrice * 0.8) : basePrice,
                    prixOriginal: isPromotion ? basePrice : null,
                    categorie: category,
                    image: this.generateProductImage(category, productId),
                    stock: Math.floor(Math.random() * 50) + 5,
                    marque: ['Shifa', 'Premium', 'Natural', 'Bio'][Math.floor(Math.random() * 4)],
                    enPromotion: isPromotion,
                    pourcentagePromotion: isPromotion ? Math.floor((basePrice - Math.floor(basePrice * 0.8)) / basePrice * 100) : 0,
                    enVedette: isFeatured,
                    actif: true,
                    dateAjout: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    ingredients: 'Ingrédients naturels de haute qualité',
                    modeEmploi: 'Suivre les instructions sur l\'emballage',
                    precautions: 'Tenir hors de portée des enfants'
                });
            }
        });
        
        return demoProducts;
    }
    
    // Generate product image placeholder
    generateProductImage(category, productId) {
        const categoryInfo = APP_CONFIG.CATEGORIES[category] || {};
        const color = categoryInfo.color?.replace('#', '') || '10b981';
        const initials = category.substring(0, 2).toUpperCase();
        return `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
    }
    
    // Initialize event handlers
    initializeEventHandlers() {
        console.log('🔧 Setting up event handlers...');
        
        // Global click handler for dynamic content
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Search input handlers
        const searchInputs = document.querySelectorAll('#searchInput, #mobileSearchInput');
        searchInputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch(e.target.value);
                    }
                });
                
                // Real-time search suggestions
                input.addEventListener('input', Utils.debounce((e) => {
                    this.showSearchSuggestions(e.target.value);
                }, 300));
            }
        });
        
        // Cart events
        document.addEventListener('cart:updated', this.updateCartUI.bind(this));
        document.addEventListener('auth:logout', this.handleLogout.bind(this));
        document.addEventListener('auth:login', this.handleLogin.bind(this));
        
        // Window events
        window.addEventListener('popstate', this.handlePopState.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        console.log('✅ Event handlers initialized');
    }
    
    // Handle global clicks for dynamic content
    handleGlobalClick(e) {
        const target = e.target.closest('[onclick], [data-action]');
        if (!target) return;
        
        // Handle data-action attributes
        const action = target.getAttribute('data-action');
        if (action) {
            e.preventDefault();
            this.handleAction(action, target);
        }
    }
    
    // Handle dynamic actions
    handleAction(action, element) {
        const actionMap = {
            'add-to-cart': () => {
                const productId = element.getAttribute('data-product-id');
                const quantity = parseInt(element.getAttribute('data-quantity')) || 1;
                this.addToCart(productId, quantity);
            },
            'remove-from-cart': () => {
                const productId = element.getAttribute('data-product-id');
                this.removeFromCart(productId);
            },
            'update-cart-quantity': () => {
                const productId = element.getAttribute('data-product-id');
                const quantity = parseInt(element.getAttribute('data-quantity'));
                this.updateCartQuantity(productId, quantity);
            },
            'show-product': () => {
                const productId = element.getAttribute('data-product-id');
                this.showPage('product', { id: productId });
            },
            'filter-category': () => {
                const category = element.getAttribute('data-category');
                this.filterByCategory(category);
            }
        };
        
        if (actionMap[action]) {
            actionMap[action]();
        }
    }
    
    // Initialize search functionality
    initializeSearch() {
        // Prevent form submission on search
        const searchForms = document.querySelectorAll('form[role="search"]');
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="search"], input[placeholder*="recherch"]');
                if (input && input.value.trim()) {
                    this.performSearch(input.value.trim());
                }
            });
        });
    }
    
    // Show search suggestions
    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer || !query || query.length < 2) {
            if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
            return;
        }
        
        // Filter products for suggestions
        const suggestions = this.allProducts
            .filter(product => 
                product.actif !== false &&
                (product.nom.toLowerCase().includes(query.toLowerCase()) ||
                 product.description.toLowerCase().includes(query.toLowerCase()) ||
                 product.categorie.toLowerCase().includes(query.toLowerCase()))
            )
            .slice(0, 5);
        
        if (suggestions.length === 0) {
            suggestionsContainer.classList.add('hidden');
            return;
        }
        
        suggestionsContainer.innerHTML = suggestions.map(product => `
            <div class="px-4 py-3 hover:bg-mint-50 cursor-pointer transition-colors" onclick="app.showPage('product', {id: '${product._id}'})">
                <div class="flex items-center space-x-3">
                    <img src="${this.getProductImage(product)}" alt="${product.nom}" class="w-10 h-10 object-cover rounded-lg">
                    <div class="flex-1">
                        <p class="font-medium text-forest-800">${product.nom}</p>
                        <p class="text-sm text-mint-600">${product.categorie} • ${Utils.formatPrice(product.prix)}</p>
                    </div>
                </div>
            </div>
        `).join('') + `
            <div class="px-4 py-3 border-t border-mint-100">
                <button onclick="app.performSearch('${query}')" class="text-sm text-mint-600 hover:text-mint-700 font-medium">
                    Voir tous les résultats pour "${query}" <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        `;
        
        suggestionsContainer.classList.remove('hidden');
    }
    
    // Perform search
    async performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.showToast('Veuillez saisir au moins 2 caractères pour la recherche', 'warning');
            return;
        }
        
        this.state.searchQuery = query.trim();
        await this.showPage('products', { search: this.state.searchQuery });
        
        // Hide suggestions
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.add('hidden');
        }
    }
    
    // Filter by category
    async filterByCategory(category) {
        this.state.activeCategory = category;
        await this.showPage('products', { categorie: category });
    }
    
    // Show page with enhanced routing
    async showPage(pageName, params = {}) {
        if (this.isLoading) {
            console.log('⏳ Page load in progress, skipping...');
            return;
        }
        
        try {
            this.showLoading(true);
            this.isLoading = true;
            
            console.log(`📄 Loading page: ${pageName}`, params);
            this.currentPage = pageName;
            
            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('page', pageName);
            if (params.id) url.searchParams.set('id', params.id);
            window.history.pushState({ page: pageName, params }, '', url);
            
            // Route to appropriate page loader
            switch (pageName) {
                case 'home':
                    await this.loadHomePage();
                    break;
                case 'products':
                    await this.loadProductsPage(params);
                    break;
                case 'product':
                    if (!params.id) {
                        await this.showPage('products');
                        return;
                    }
                    await this.loadProductPage(params.id);
                    break;
                case 'login':
                    if (this.currentUser) {
                        await this.showPage('profile');
                        return;
                    }
                    await this.loadLoginPage();
                    break;
                case 'register':
                    if (this.currentUser) {
                        await this.showPage('profile');
                        return;
                    }
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
                    if (this.cart.length === 0) {
                        this.showToast('Votre panier est vide', 'warning');
                        await this.showPage('products');
                        return;
                    }
                    await this.loadCheckoutPage();
                    break;
                case 'contact':
                    await this.loadContactPage();
                    break;
                case 'admin':
                    if (!this.currentUser || this.currentUser.role !== 'admin') {
                        this.showToast('Accès administrateur requis', 'error');
                        await this.showPage('home');
                        return;
                    }
                    await this.loadAdminPage();
                    break;
                default:
                    console.warn(`⚠️ Unknown page: ${pageName}, redirecting to home`);
                    await this.loadHomePage();
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Initialize AOS animations if available
            if (window.AOS) {
                AOS.refresh();
            }
            
        } catch (error) {
            console.error(`❌ Error loading page ${pageName}:`, error);
            this.showToast('Erreur de chargement de la page', 'error');
            
            // Fallback to home page
            if (pageName !== 'home') {
                await this.loadHomePage();
            }
        } finally {
            this.showLoading(false);
            this.isLoading = false;
        }
    }
    
    // Load home page
    async loadHomePage() {
        const mainContent = document.getElementById('mainContent');
        
        const heroContent = `
            <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-mint-600">
                <!-- Background Elements -->
                <div class="absolute inset-0">
                    <div class="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div class="absolute bottom-10 right-10 w-96 h-96 bg-mint-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/30 rounded-full blur-2xl animate-bounce-slow"></div>
                </div>
                
                <div class="container mx-auto px-4 relative z-10 text-center">
                    <div class="max-w-5xl mx-auto">
                        <!-- Logo Animation -->
                        <div class="flex justify-center mb-12" data-aos="zoom-in" data-aos-duration="1000">
                            <div class="relative">
                                <div class="w-48 h-48 bg-white/30 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-health-xl border-4 border-white/40 animate-float">
                                    <i class="fas fa-leaf text-8xl text-white drop-shadow-2xl"></i>
                                </div>
                                <div class="absolute -inset-4 bg-gradient-to-r from-mint-400 to-accent rounded-3xl opacity-30 blur-xl animate-pulse-slow"></div>
                            </div>
                        </div>
                        
                        <!-- Main Title -->
                        <div data-aos="fade-up" data-aos-delay="200">
                            <h1 class="text-7xl md:text-9xl font-black font-jakarta mb-6 bg-gradient-to-r from-white via-mint-100 to-sage-100 bg-clip-text text-transparent drop-shadow-2xl">
                                Shifa
                            </h1>
                            <h2 class="text-3xl md:text-4xl font-bold mb-8 text-mint-100 font-jakarta">
                                Parapharmacie Gaher
                            </h2>
                        </div>
                        
                        <!-- Subtitle -->
                        <div data-aos="fade-up" data-aos-delay="400">
                            <p class="text-xl md:text-2xl mb-12 text-mint-50 font-medium leading-relaxed max-w-3xl mx-auto">
                                🌿 Votre bien-être naturel commence ici<br>
                                <span class="text-lg opacity-90">Découvrez notre sélection premium de produits de santé et beauté</span>
                            </p>
                        </div>
                        
                        <!-- CTA Buttons -->
                        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center" data-aos="fade-up" data-aos-delay="600">
                            <button onclick="app.showPage('products')" 
                                    class="group bg-white text-primary hover:bg-mint-50 px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-health-lg hover:shadow-health-xl transform hover:scale-105 flex items-center">
                                <i class="fas fa-shopping-bag mr-3 group-hover:scale-110 transition-transform"></i>
                                Explorer nos produits
                                <i class="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
                            </button>
                            
                            <button onclick="app.showPage('contact')" 
                                    class="group bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                                <i class="fas fa-phone mr-3 group-hover:scale-110 transition-transform"></i>
                                Nous contacter
                            </button>
                        </div>
                        
                        <!-- Stats or Features -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" data-aos="fade-up" data-aos-delay="800">
                            <div class="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                                <div class="text-4xl font-bold text-white mb-2">${this.allProducts.length}+</div>
                                <div class="text-mint-100">Produits disponibles</div>
                            </div>
                            <div class="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                                <div class="text-4xl font-bold text-white mb-2">48h</div>
                                <div class="text-mint-100">Livraison rapide</div>
                            </div>
                            <div class="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                                <div class="text-4xl font-bold text-white mb-2">100%</div>
                                <div class="text-mint-100">Produits authentiques</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Scroll indicator -->
                <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                    <i class="fas fa-chevron-down text-2xl"></i>
                </div>
            </section>
        `;
        
        const categoriesContent = await this.generateCategoriesSection();
        const featuredContent = await this.generateFeaturedSection();
        const promotionsContent = await this.generatePromotionsSection();
        
        mainContent.innerHTML = heroContent + categoriesContent + featuredContent + promotionsContent;
    }
    
    // Generate categories section
    async generateCategoriesSection() {
        const categoriesHtml = this.categories.slice(0, 10).map((category, index) => `
            <div class="group cursor-pointer" onclick="app.filterByCategory('${category.nom}')" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-health hover:shadow-health-lg transition-all duration-500 border border-mint-200/50 hover:border-mint-400/60 transform hover:scale-105 hover:-translate-y-2">
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${this.getCategoryGradient(category.nom)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <i class="${APP_CONFIG.CATEGORIES[category.nom]?.icon || 'fas fa-pills'} text-3xl text-white"></i>
                        </div>
                        <h3 class="font-bold text-xl text-forest-800 mb-2 group-hover:text-primary transition-colors">${category.nom}</h3>
                        <p class="text-mint-600 text-sm font-medium">${APP_CONFIG.CATEGORIES[category.nom]?.description || 'Produits de qualité'}</p>
                        ${category.count ? `<div class="mt-3 text-xs text-mint-500 font-semibold">${category.count} produits</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        return `
            <section class="py-20 bg-gradient-to-br from-sage-50 to-mint-50">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16" data-aos="fade-up">
                        <h2 class="text-5xl font-black text-forest-800 mb-6 font-jakarta">Nos Spécialités</h2>
                        <p class="text-xl text-mint-600 max-w-2xl mx-auto">
                            Découvrez notre large gamme de produits soigneusement sélectionnés pour votre bien-être
                        </p>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        ${categoriesHtml}
                    </div>
                </div>
            </section>
        `;
    }
    
    // Generate featured products section
    async generateFeaturedSection() {
        const featuredProducts = this.allProducts
            .filter(p => p.enVedette && p.actif !== false && p.stock > 0)
            .slice(0, 8);
        
        if (featuredProducts.length === 0) {
            return `
                <section class="py-20 bg-white">
                    <div class="container mx-auto px-4">
                        <div class="text-center" data-aos="fade-up">
                            <h2 class="text-5xl font-black text-forest-800 mb-6 font-jakarta">Nos Coups de Cœur</h2>
                            <div class="bg-mint-50 rounded-2xl p-12 border border-mint-200">
                                <i class="fas fa-heart text-6xl text-mint-300 mb-6"></i>
                                <p class="text-xl text-mint-600">Découvrez bientôt nos produits coups de cœur</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }
        
        const productsHtml = featuredProducts.map((product, index) => 
            this.generateProductCard(product, index * 100)
        ).join('');
        
        return `
            <section class="py-20 bg-white">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16" data-aos="fade-up">
                        <h2 class="text-5xl font-black text-forest-800 mb-6 font-jakarta">Nos Coups de Cœur</h2>
                        <p class="text-xl text-mint-600 max-w-2xl mx-auto">
                            Sélection spéciale de nos experts pour votre santé et votre beauté
                        </p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${productsHtml}
                    </div>
                    <div class="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
                        <button onclick="app.showPage('products')" 
                                class="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health hover:shadow-health-lg transform hover:scale-105">
                            Voir tous les produits <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </section>
        `;
    }
    
    // Generate promotions section
    async generatePromotionsSection() {
        const promotionProducts = this.allProducts
            .filter(p => p.enPromotion && p.actif !== false && p.stock > 0)
            .slice(0, 8);
        
        if (promotionProducts.length === 0) {
            return '';
        }
        
        const productsHtml = promotionProducts.map((product, index) => 
            this.generateProductCard(product, index * 100)
        ).join('');
        
        return `
            <section class="py-20 bg-gradient-to-br from-red-50 to-pink-50">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16" data-aos="fade-up">
                        <h2 class="text-5xl font-black text-red-800 mb-6 font-jakarta">🏷️ Promotions Exceptionnelles</h2>
                        <p class="text-xl text-red-600 max-w-2xl mx-auto">
                            Profitez de nos offres spéciales à durée limitée
                        </p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${productsHtml}
                    </div>
                </div>
            </section>
        `;
    }
    
    // Generate product card HTML
    generateProductCard(product, delay = 0) {
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        const imageUrl = this.getProductImage(product);
        
        return `
            <div class="group cursor-pointer" onclick="app.showPage('product', {id: '${product._id}'})" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-health hover:shadow-health-lg transition-all duration-500 border border-mint-200/50 hover:border-mint-400/60 transform hover:scale-105 hover:-translate-y-2 ${isOutOfStock ? 'opacity-75' : ''}">
                    ${hasPromotion ? `
                        <div class="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg">
                            -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                        </div>
                    ` : ''}
                    
                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                            <div class="text-white font-bold text-lg text-center">
                                <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                                <div>Rupture de stock</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="aspect-square bg-gradient-to-br from-mint-50 to-sage-50 relative overflow-hidden">
                        <img src="${imageUrl}" alt="${product.nom}" 
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                             onerror="this.src='${this.generateProductImage(product.categorie, product._id)}'">
                    </div>
                    
                    <div class="p-6">
                        <h3 class="font-bold text-xl text-forest-800 mb-3 group-hover:text-primary transition-colors line-clamp-2">${product.nom}</h3>
                        <p class="text-mint-600 text-sm mb-4 line-clamp-2">${product.description || 'Produit de qualité premium'}</p>
                        
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-2">
                                ${hasPromotion ? `
                                    <span class="text-sm text-gray-400 line-through">${Utils.formatPrice(product.prixOriginal)}</span>
                                    <span class="text-2xl font-black text-red-600">${Utils.formatPrice(product.prix)}</span>
                                ` : `
                                    <span class="text-2xl font-black text-forest-800">${Utils.formatPrice(product.prix)}</span>
                                `}
                            </div>
                            
                            ${!isOutOfStock ? `
                                <button onclick="event.stopPropagation(); app.addToCart('${product._id}')" 
                                        class="group/btn bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health hover:shadow-health-lg transform hover:scale-110">
                                    <i class="fas fa-cart-plus group-hover/btn:scale-125 transition-transform"></i>
                                </button>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between text-sm">
                            <span class="flex items-center text-mint-600">
                                <i class="fas fa-box mr-1"></i>
                                Stock: ${product.stock}
                            </span>
                            ${product.marque ? `<span class="text-forest-700 font-semibold">${product.marque}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get product image URL
    getProductImage(product) {
        if (product.image && product.image.startsWith('data:image')) {
            return product.image;
        } else if (product.image && product.image.startsWith('http')) {
            return product.image;
        } else if (product.image) {
            return `./images/products/${product.image}`;
        } else {
            return this.generateProductImage(product.categorie, product._id);
        }
    }
    
    // Get category gradient classes
    getCategoryGradient(category) {
        const gradients = {
            'Vitalité': 'from-green-400 to-green-600',
            'Sport': 'from-red-400 to-red-600',
            'Visage': 'from-pink-400 to-pink-600',
            'Cheveux': 'from-amber-400 to-amber-600',
            'Solaire': 'from-orange-400 to-orange-600',
            'Intime': 'from-rose-400 to-rose-600',
            'Soins': 'from-emerald-400 to-emerald-600',
            'Bébé': 'from-cyan-400 to-cyan-600',
            'Homme': 'from-blue-400 to-blue-600',
            'Dentaire': 'from-indigo-400 to-indigo-600'
        };
        return gradients[category] || 'from-green-400 to-green-600';
    }
    
    // Add to cart functionality
    async addToCart(productId, quantity = 1) {
        try {
            console.log('🛒 Adding to cart:', productId, 'quantity:', quantity);
            
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
            
            const existingIndex = this.cart.findIndex(item => item.id === productId);
            const imageUrl = this.getProductImage(product);
            
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
            
            // Dispatch cart updated event
            document.dispatchEvent(new CustomEvent('cart:updated', { detail: this.cart }));
            
        } catch (error) {
            console.error('❌ Add to cart error:', error);
            this.showToast('Erreur lors de l\'ajout au panier', 'error');
        }
    }
    
    // Update cart UI
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItemsCount = document.getElementById('cartItemsCount');
        
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.classList.add('animate-pulse');
                setTimeout(() => cartCount.classList.remove('animate-pulse'), 1000);
            }
        }
        
        if (cartItemsCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
            cartItemsCount.textContent = totalItems === 0 ? '0 articles' : 
                totalItems === 1 ? '1 article' : `${totalItems} articles`;
        }
        
        this.updateCartSidebar();
    }
    
    // Update cart sidebar
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-16">
                    <div class="w-24 h-24 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-shopping-cart text-4xl text-mint-400"></i>
                    </div>
                    <p class="text-xl font-semibold text-forest-700 mb-2">Votre panier est vide</p>
                    <p class="text-mint-600">Découvrez nos produits de qualité</p>
                    <button onclick="app.showPage('products'); toggleCart();" class="mt-6 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health font-medium">
                        Explorer nos produits
                    </button>
                </div>
            `;
            if (cartSummary) cartSummary.classList.add('hidden');
            return;
        }
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-mint-200/50 hover:border-mint-400/60 transition-all shadow-sm hover:shadow-health">
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.nom}" 
                         class="w-16 h-16 object-cover rounded-xl shadow-sm">
                    <div class="flex-1">
                        <h4 class="font-semibold text-forest-800 text-sm mb-1 line-clamp-1">${item.nom}</h4>
                        <p class="text-primary font-bold text-lg">${Utils.formatPrice(item.prix)}</p>
                        <div class="flex items-center space-x-2 mt-2">
                            <div class="flex items-center bg-mint-100 rounded-xl overflow-hidden">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite - 1})" 
                                        class="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors">
                                    <i class="fas fa-minus text-sm"></i>
                                </button>
                                <span class="px-3 py-1 text-forest-800 font-semibold min-w-12 text-center">${item.quantite}</span>
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite + 1})" 
                                        class="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors">
                                    <i class="fas fa-plus text-sm"></i>
                                </button>
                            </div>
                            <button onclick="app.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
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
    
    // Update cart totals
    updateCartTotals() {
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const freeShippingThreshold = this.settings.shipping?.freeShippingThreshold || APP_CONFIG.ECOMMERCE.FREE_SHIPPING_THRESHOLD;
        const shippingCost = this.settings.shipping?.standardCost || APP_CONFIG.ECOMMERCE.STANDARD_SHIPPING_COST;
        const fraisLivraison = sousTotal >= freeShippingThreshold ? 0 : shippingCost;
        const total = sousTotal + fraisLivraison;
        
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartShipping = document.getElementById('cartShipping');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartSubtotal) cartSubtotal.textContent = Utils.formatPrice(sousTotal);
        if (cartShipping) cartShipping.textContent = Utils.formatPrice(fraisLivraison);
        if (cartTotal) cartTotal.textContent = Utils.formatPrice(total);
    }
    
    // Update cart quantity
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
    
    // Remove from cart
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
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    // Show loading state
    showLoading(show = true) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('hidden', !show);
        }
    }
    
    // Show toast notification
    showToast(message, type = 'info', duration = APP_CONFIG.UI.TOAST_DURATION) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-notification transform translate-x-full transition-all duration-300 mb-3 p-4 rounded-2xl shadow-health-lg backdrop-blur-md border ${this.getToastClasses(type)}`;
        
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <i class="${this.getToastIcon(type)} text-xl"></i>
                </div>
                <div class="flex-1">
                    <p class="font-semibold">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-current hover:opacity-70 transition-opacity">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    
    // Get toast classes by type
    getToastClasses(type) {
        const classes = {
            'info': 'bg-blue-50/90 text-blue-800 border-blue-200',
            'success': 'bg-green-50/90 text-green-800 border-green-200',
            'error': 'bg-red-50/90 text-red-800 border-red-200',
            'warning': 'bg-yellow-50/90 text-yellow-800 border-yellow-200'
        };
        return classes[type] || classes.info;
    }
    
    // Get toast icon by type
    getToastIcon(type) {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }
    
    // Update user UI
    updateUserUI() {
        const guestMenu = document.getElementById('guestMenu');
        const userLoggedMenu = document.getElementById('userLoggedMenu');
        const adminMenuLink = document.getElementById('adminMenuLink');
        const userWelcome = document.getElementById('userWelcome');
        const userRole = document.getElementById('userRole');
        
        if (this.currentUser) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userLoggedMenu) userLoggedMenu.style.display = 'block';
            
            if (userWelcome) {
                userWelcome.textContent = `${this.currentUser.prenom} ${this.currentUser.nom}`;
            }
            
            if (userRole) {
                userRole.textContent = this.currentUser.role === 'admin' ? 'Administrateur' : 'Client';
            }
            
            if (this.currentUser.role === 'admin' && adminMenuLink) {
                adminMenuLink.classList.remove('hidden');
            }
        } else {
            if (guestMenu) guestMenu.style.display = 'block';
            if (userLoggedMenu) userLoggedMenu.style.display = 'none';
            if (adminMenuLink) adminMenuLink.classList.add('hidden');
        }
    }
    
    // Handle events
    handlePopState(event) {
        if (event.state && event.state.page) {
            this.showPage(event.state.page, event.state.params || {});
        }
    }
    
    handleOnline() {
        this.showToast('Connexion rétablie', 'success');
        // Retry failed requests or refresh data
        this.loadProductsCache();
    }
    
    handleOffline() {
        this.showToast('Mode hors ligne activé', 'warning');
    }
    
    handleLogin(event) {
        this.currentUser = event.detail.user;
        this.updateUserUI();
    }
    
    handleLogout() {
        this.currentUser = null;
        this.updateUserUI();
        this.showPage('home');
    }
    
    // Setup periodic tasks
    setupPeriodicTasks() {
        // Refresh products cache periodically
        setInterval(() => {
            if (navigator.onLine) {
                this.loadProductsCache();
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        // Clean old cache entries
        setInterval(() => {
            window.cacheManager.clear();
        }, 30 * 60 * 1000); // 30 minutes
    }
    
    // Utility methods
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
    
    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
        
        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('auth:logout'));
    }
}

// Global functions for backward compatibility and ease of use
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

function addToCartFromCard(productId, quantity = 1) {
    if (window.app) {
        window.app.addToCart(productId, quantity);
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
        const isOpen = !cartSidebar.classList.contains('translate-x-full');
        
        if (isOpen) {
            cartSidebar.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        } else {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
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

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Shifa App...');
    app = new ShifaApp();
    window.app = app;
    await app.init();
    console.log('✅ Shifa App ready!');
});

console.log('✅ Enhanced app.js loaded successfully');
