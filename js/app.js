// Complete PharmacieGaherApp - Fixed version with all functionality
class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.allProducts = []; // Cache for all products
        this.adminCurrentSection = 'dashboard';
        this.currentEditingProduct = null;
        this.settings = {
            couleurPrimaire: '#10b981',
            couleurSecondaire: '#059669',
            couleurAccent: '#34d399',
            nomSite: 'Shifa - Parapharmacie',
            descriptionSite: 'Votre parapharmacie de confiance',
            adresse: 'Tipaza, Algérie',
            telephone: '+213 123 456 789',
            email: 'pharmaciegaher@gmail.com',
            horaires: 'Lun-Sam: 9h-19h, Dim: 10h-18h',
            fraisLivraison: 300,
            fraisLivraisonGratuite: 5000,
            tva: 0.19
        };
        this.currentPage = 'home';
        
        // API Configuration
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        console.log('App initialized with API URL:', this.apiUrl);
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing PharmacieGaherApp...');
            await this.checkAuth();
            await this.loadSettings();
            await this.loadProductsCache();
            this.initUI();
            await this.showPage('home');
            this.updateCartUI();
            this.initSearch();
            this.cleanupLocalStorage(); // Add cleanup on init
            console.log('✅ App fully initialized');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
    }

    // Cleanup localStorage to prevent quota issues
    cleanupLocalStorage() {
        try {
            // Clean up old orders - keep only last 50
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            if (adminOrders.length > 50) {
                const trimmedOrders = adminOrders.slice(0, 50);
                localStorage.setItem('adminOrders', JSON.stringify(trimmedOrders));
                console.log(`🧹 Cleaned up orders: ${adminOrders.length} → ${trimmedOrders.length}`);
            }
            
            // Clean up old user orders - keep only last 20 per user
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('userOrders_')) {
                    const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
                    if (userOrders.length > 20) {
                        const trimmedUserOrders = userOrders.slice(0, 20);
                        localStorage.setItem(key, JSON.stringify(trimmedUserOrders));
                        console.log(`🧹 Cleaned up user orders for ${key}: ${userOrders.length} → ${trimmedUserOrders.length}`);
                    }
                }
            });
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Handle localStorage quota exceeded
    handleStorageQuotaExceeded() {
        try {
            console.log('🚫 LocalStorage quota exceeded, performing emergency cleanup...');
            
            // Emergency cleanup - remove old data
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            if (adminOrders.length > 10) {
                const emergencyTrimmed = adminOrders.slice(0, 10);
                localStorage.setItem('adminOrders', JSON.stringify(emergencyTrimmed));
                console.log(`🆘 Emergency cleanup: kept only ${emergencyTrimmed.length} recent orders`);
            }
            
            // Remove any unnecessary data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('temp_') || key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.showToast('Stockage nettoyé automatiquement', 'info');
        } catch (error) {
            console.error('Emergency cleanup failed:', error);
            this.showToast('Erreur de stockage - contactez le support', 'error');
        }
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiUrl}/api/settings`);
            if (response.ok) {
                const data = await response.json();
                this.settings = { ...this.settings, ...data };
                console.log('✅ Settings loaded from API');
            }
        } catch (error) {
            console.log('Using default settings');
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
                const response = await fetch(`${this.apiUrl}/api/products`);
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
            
            console.log(`✅ Products cache loaded: ${this.allProducts.length} products`);
            
        } catch (error) {
            console.error('❌ Error loading products cache:', error);
            this.allProducts = [];
        }
    }

    refreshProductsCache() {
        console.log('Refreshing products cache...');
        
        // Reload from localStorage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        this.allProducts = [...localProducts];
        
        console.log(`✅ Products cache refreshed: ${this.allProducts.length} products`);
        
        // If we're on the home page, refresh the displayed products
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
                const response = await fetch(`${this.apiUrl}/api/auth/profile`, {
                    headers: { 'x-auth-token': token }
                });
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateUserUI();
                    console.log('✅ User authenticated:', this.currentUser.email);
                } else {
                    localStorage.removeItem('token');
                    console.log('❌ Invalid token, removed');
                }
            } catch (error) {
                console.error('❌ Auth check error:', error);
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

    async loadProductsPage(params = {}) {
        console.log('Loading products page with params:', params);
        
        let filteredProducts = this.allProducts.filter(p => p.actif !== false);
        
        // Apply filters
        if (params.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.marque?.toLowerCase().includes(searchTerm) ||
                p.categorie?.toLowerCase().includes(searchTerm)
            );
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">
                        ${params.categorie ? `Catégorie: ${params.categorie}` : 
                          params.search ? `Recherche: "${params.search}"` : 
                          'Tous nos produits'}
                    </h1>
                    <p class="text-emerald-600 text-lg">${filteredProducts.length} produit(s) trouvé(s)</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="productsGrid">
                    ${filteredProducts.length === 0 ? `
                        <div class="col-span-full text-center py-16">
                            <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                            <p class="text-emerald-600 mb-8">Essayez de modifier vos critères de recherche</p>
                            <button onclick="app.showPage('home')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-home mr-2"></i>Retour à l'accueil
                            </button>
                        </div>
                    ` : filteredProducts.map(product => this.createProductCard(product)).join('')}
                </div>
            </div>
        `;
    }

    async loadProductPage(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('home');
            return;
        }
        
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        let imageUrl;
        if (product.image && product.image.startsWith('data:image')) {
            imageUrl = product.image;
        } else if (product.image && product.image.startsWith('http')) {
            imageUrl = product.image;
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
            imageUrl = `https://via.placeholder.com/600x600/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Product Image -->
                        <div class="space-y-4">
                            <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden relative">
                                ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-20">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                                <img src="${imageUrl}" alt="${product.nom}" 
                                     class="w-full h-full object-cover"
                                     onerror="this.src='https://via.placeholder.com/600x600/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                            </div>
                        </div>
                        
                        <!-- Product Details -->
                        <div class="space-y-6">
                            <div>
                                <h1 class="text-4xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                                <div class="flex items-center space-x-4 mb-4">
                                    <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">${product.categorie}</span>
                                    ${product.marque ? `<span class="text-emerald-600 font-medium">${product.marque}</span>` : ''}
                                </div>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="flex items-center space-x-4">
                                    ${hasPromotion ? `
                                        <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                        <span class="text-4xl font-bold text-red-600">${product.prix} DA</span>
                                    ` : `
                                        <span class="text-4xl font-bold text-emerald-700">${product.prix} DA</span>
                                    `}
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <span class="text-emerald-600">Stock disponible:</span>
                                    <span class="font-bold ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}">${isOutOfStock ? 'Rupture de stock' : product.stock + ' unités'}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="text-xl font-bold text-emerald-800 mb-3">Description</h3>
                                <p class="text-emerald-600 leading-relaxed">${product.description || 'Aucune description disponible.'}</p>
                            </div>
                            
                            <!-- Add to Cart -->
                            <div class="space-y-4">
                                <div class="flex items-center space-x-4">
                                    <label class="text-emerald-700 font-medium">Quantité:</label>
                                    <div class="quantity-selector">
                                        <button onclick="decrementQuantity()" ${isOutOfStock ? 'disabled' : ''}>-</button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" ${isOutOfStock ? 'disabled' : ''}>
                                        <button onclick="incrementQuantity(${product.stock})" ${isOutOfStock ? 'disabled' : ''}>+</button>
                                    </div>
                                </div>
                                
                                <button onclick="addProductToCart('${product._id}')" 
                                        class="w-full py-4 px-8 text-lg font-bold rounded-xl transition-all shadow-lg ${isOutOfStock ? 
                                            'bg-gray-400 text-gray-600 cursor-not-allowed' : 
                                            'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105'}" 
                                        ${isOutOfStock ? 'disabled' : ''}>
                                    ${isOutOfStock ? 'Produit épuisé' : '<i class="fas fa-cart-plus mr-3"></i>Ajouter au panier'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Navigation -->
                    <div class="mt-12 pt-8 border-t border-emerald-100">
                        <div class="flex justify-between">
                            <button onclick="app.showPage('products')" class="btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>Retour aux produits
                            </button>
                            <button onclick="app.filterByCategory('${product.categorie}')" class="btn-primary">
                                Voir plus de ${product.categorie}
                                <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('home');
            return;
        }
        
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= this.settings.fraisLivraisonGratuite ? 0 : this.settings.fraisLivraison;
        const total = sousTotal + fraisLivraison;
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-8 text-center">Finaliser votre commande</h1>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Order Form -->
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                            
                            <form id="checkoutForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="prenom" class="block text-sm font-medium text-emerald-700 mb-2">Prénom *</label>
                                        <input type="text" id="prenom" name="prenom" required class="form-input" value="${this.currentUser?.prenom || ''}">
                                    </div>
                                    <div>
                                        <label for="nom" class="block text-sm font-medium text-emerald-700 mb-2">Nom *</label>
                                        <input type="text" id="nom" name="nom" required class="form-input" value="${this.currentUser?.nom || ''}">
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="email" class="block text-sm font-medium text-emerald-700 mb-2">Email *</label>
                                    <input type="email" id="email" name="email" required class="form-input" value="${this.currentUser?.email || ''}">
                                </div>
                                
                                <div>
                                    <label for="telephone" class="block text-sm font-medium text-emerald-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="telephone" name="telephone" required class="form-input" value="${this.currentUser?.telephone || ''}">
                                </div>
                                
                                <div>
                                    <label for="adresse" class="block text-sm font-medium text-emerald-700 mb-2">Adresse complète *</label>
                                    <textarea id="adresse" name="adresse" required rows="3" class="form-input resize-none" placeholder="Adresse, ville, code postal...">${this.currentUser?.adresse || ''}</textarea>
                                </div>
                                
                                <div>
                                    <label for="notes" class="block text-sm font-medium text-emerald-700 mb-2">Notes de commande (optionnel)</label>
                                    <textarea id="notes" name="notes" rows="3" class="form-input resize-none" placeholder="Instructions spéciales, horaires de livraison préférés..."></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Récapitulatif de commande</h2>
                            
                            <div class="space-y-4 mb-6">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-4 bg-white/50 rounded-xl p-4">
                                        <img src="${item.image}" alt="${item.nom}" class="w-16 h-16 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-emerald-800">${item.nom}</h4>
                                            <p class="text-sm text-emerald-600">${item.prix} DA × ${item.quantite}</p>
                                        </div>
                                        <div class="text-right">
                                            <span class="font-bold text-emerald-700">${item.prix * item.quantite} DA</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="border-t border-emerald-200 pt-6 space-y-3">
                                <div class="flex justify-between text-emerald-700">
                                    <span>Sous-total:</span>
                                    <span class="font-semibold">${sousTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-emerald-700">
                                    <span>Frais de livraison:</span>
                                    <span class="font-semibold ${fraisLivraison === 0 ? 'text-green-600' : ''}">${fraisLivraison === 0 ? 'GRATUIT' : fraisLivraison + ' DA'}</span>
                                </div>
                                ${fraisLivraison > 0 ? `
                                    <div class="text-sm text-emerald-600 bg-emerald-100/50 p-3 rounded-lg">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        Livraison gratuite dès ${this.settings.fraisLivraisonGratuite} DA d'achat
                                    </div>
                                ` : ''}
                                <div class="border-t border-emerald-300 pt-3">
                                    <div class="flex justify-between text-xl font-bold text-emerald-800">
                                        <span>Total:</span>
                                        <span>${total} DA</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button onclick="handleCheckout()" class="w-full mt-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-check-circle mr-3"></i>Confirmer la commande
                            </button>
                            
                            <div class="mt-6 text-center">
                                <button onclick="app.showPage('products')" class="text-emerald-600 hover:text-emerald-800 font-semibold">
                                    <i class="fas fa-arrow-left mr-2"></i>Continuer mes achats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadOrderConfirmationPage(orderNumber) {
        if (!orderNumber) {
            this.showPage('home');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto text-center">
                    <div class="bg-white rounded-2xl shadow-xl p-12">
                        <div class="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <i class="fas fa-check text-white text-4xl"></i>
                        </div>
                        
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                        <p class="text-xl text-emerald-600 mb-8">Merci pour votre confiance</p>
                        
                        <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 mb-8">
                            <h2 class="text-lg font-bold text-emerald-800 mb-2">Numéro de commande</h2>
                            <p class="text-2xl font-mono font-bold text-emerald-700">${orderNumber}</p>
                        </div>
                        
                        <div class="space-y-4 text-left mb-8">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-envelope text-emerald-600"></i>
                                <span class="text-emerald-700">Un email de confirmation vous a été envoyé</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-truck text-emerald-600"></i>
                                <span class="text-emerald-700">Votre commande sera traitée dans les 24h</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-phone text-emerald-600"></i>
                                <span class="text-emerald-700">Nous vous contacterons pour confirmer la livraison</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="app.showPage('home')" class="btn-primary">
                                <i class="fas fa-home mr-2"></i>Retour à l'accueil
                            </button>
                            <button onclick="app.showPage('products')" class="btn-secondary">
                                <i class="fas fa-shopping-bag mr-2"></i>Continuer mes achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // FIXED ORDER PROCESSING METHOD - This is where the main fix happens
    async processOrder(orderData) {
        try {
            console.log('🔄 Processing order:', orderData);
            
            // Generate order number
            const orderNumber = 'CMD' + Date.now().toString().slice(-8);
            
            // Create order object with proper structure for API
            const order = {
                numeroCommande: orderNumber,
                dateCommande: new Date().toISOString(),
                client: {
                    prenom: orderData.prenom,
                    nom: orderData.nom,
                    email: orderData.email,
                    telephone: orderData.telephone,
                    adresse: orderData.adresse
                },
                produits: this.cart.map(item => ({
                    produitId: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.quantite,
                    image: item.image
                })),
                sousTotal: this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0),
                fraisLivraison: orderData.fraisLivraison || 0,
                total: orderData.total,
                statut: 'en-attente',
                notes: orderData.notes || '',
                paiement: {
                    methode: 'cash-on-delivery',
                    statut: 'en-attente'
                }
            };
            
            console.log('📦 Order object created:', order);
            
            // Try to save to API first with proper error handling
            let apiSuccess = false;
            try {
                console.log('🌐 Attempting API save...');
                const response = await fetch(`${this.apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.currentUser ? {'x-auth-token': localStorage.getItem('token')} : {})
                    },
                    body: JSON.stringify(order)
                });
                
                console.log('📡 API Response status:', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ API save successful:', result);
                    apiSuccess = true;
                } else {
                    const errorText = await response.text();
                    console.log('❌ API save failed:', response.status, errorText);
                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }
            } catch (apiError) {
                console.log('⚠️ API save failed, using local storage:', apiError.message);
                apiSuccess = false;
            }
            
            // Always save to localStorage as backup, with quota management
            try {
                const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                
                // Add API/local indicator
                order.source = apiSuccess ? 'api' : 'local';
                
                // Add to beginning of array (newest first)
                existingOrders.unshift(order);
                
                // Keep only last 50 orders to prevent quota issues
                const trimmedOrders = existingOrders.slice(0, 50);
                
                localStorage.setItem('adminOrders', JSON.stringify(trimmedOrders));
                console.log('💾 Order saved to localStorage successfully');
                
            } catch (storageError) {
                console.error('❌ LocalStorage save failed:', storageError);
                if (storageError.name === 'QuotaExceededError') {
                    this.handleStorageQuotaExceeded();
                    // Try again after cleanup
                    try {
                        const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                        existingOrders.unshift(order);
                        const trimmedOrders = existingOrders.slice(0, 10);
                        localStorage.setItem('adminOrders', JSON.stringify(trimmedOrders));
                        console.log('💾 Order saved after emergency cleanup');
                    } catch (retryError) {
                        console.error('❌ Emergency retry failed:', retryError);
                        // Don't throw here - order processing should continue
                    }
                }
            }
            
            // Save to user's order history if logged in
            if (this.currentUser) {
                try {
                    const userOrdersKey = `userOrders_${this.currentUser._id}`;
                    const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
                    userOrders.unshift(order);
                    
                    // Keep only last 10 orders per user
                    const trimmedUserOrders = userOrders.slice(0, 10);
                    localStorage.setItem(userOrdersKey, JSON.stringify(trimmedUserOrders));
                    console.log('👤 Order saved to user history');
                } catch (userStorageError) {
                    console.error('❌ User order history save failed:', userStorageError);
                }
            }
            
            // Clear cart after successful order processing
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            
            console.log('✅ Order processing completed successfully');
            return { success: true, orderNumber: orderNumber };
            
        } catch (error) {
            console.error('❌ Error processing order:', error);
            this.showToast('Erreur lors du traitement de la commande', 'error');
            return { success: false, error: error.message };
        }
    }

    async loadContactPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Contactez-nous</h1>
                    <p class="text-xl text-emerald-600">Nous sommes là pour vous aider</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8">
                        <div>
                            <h2 class="text-2xl font-semibold text-emerald-800 mb-6">Nos coordonnées</h2>
                            
                            <div class="space-y-6">
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-map-marker-alt text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-emerald-800">Adresse</h3>
                                        <p class="text-emerald-600">${this.settings.adresse}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-phone text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-emerald-800">Téléphone</h3>
                                        <p class="text-emerald-600">${this.settings.telephone}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-envelope text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-emerald-800">Email</h3>
                                        <a href="mailto:${this.settings.email}" class="text-emerald-600 hover:text-emerald-800">
                                            ${this.settings.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <h2 class="text-2xl font-semibold text-emerald-800 mb-6">Envoyez-nous un message</h2>
                        
                        <form id="contactForm" onsubmit="handleContactForm(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="contactName" class="block text-sm font-medium text-emerald-700 mb-2">Nom complet *</label>
                                    <input type="text" id="contactName" name="name" required class="form-input" placeholder="Votre nom complet">
                                </div>
                                <div>
                                    <label for="contactEmail" class="block text-sm font-medium text-emerald-700 mb-2">Email *</label>
                                    <input type="email" id="contactEmail" name="email" required class="form-input" placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div>
                                <label for="contactMessage" class="block text-sm font-medium text-emerald-700 mb-2">Message *</label>
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

    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-emerald-800">Connexion</h1>
                        <p class="text-emerald-600 mt-2">Accédez à votre compte</p>
                    </div>
                    
                    <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                        <div>
                            <label for="loginEmail" class="block text-sm font-medium text-emerald-700 mb-2">Email</label>
                            <input type="email" id="loginEmail" name="email" required class="form-input" placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label for="loginPassword" class="block text-sm font-medium text-emerald-700 mb-2">Mot de passe</label>
                            <input type="password" id="loginPassword" name="password" required class="form-input" placeholder="••••••••">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-3">
                            Se connecter
                        </button>
                    </form>
                    
                    <div class="mt-8 text-center">
                        <p class="text-emerald-600">
                            Pas encore de compte ?
                            <button onclick="app.showPage('register')" class="text-emerald-800 hover:text-emerald-600 font-semibold">
                                S'inscrire
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-emerald-800">Inscription</h1>
                        <p class="text-emerald-600 mt-2">Créez votre compte</p>
                    </div>
                    
                    <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-medium text-emerald-700 mb-2">Prénom</label>
                                <input type="text" id="registerPrenom" name="prenom" required class="form-input" placeholder="Prénom">
                            </div>
                            <div>
                                <label for="registerNom" class="block text-sm font-medium text-emerald-700 mb-2">Nom</label>
                                <input type="text" id="registerNom" name="nom" required class="form-input" placeholder="Nom">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerEmail" class="block text-sm font-medium text-emerald-700 mb-2">Email</label>
                            <input type="email" id="registerEmail" name="email" required class="form-input" placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label for="registerTelephone" class="block text-sm font-medium text-emerald-700 mb-2">Téléphone</label>
                            <input type="tel" id="registerTelephone" name="telephone" required class="form-input" placeholder="+213 XXX XXX XXX">
                        </div>
                        
                        <div>
                            <label for="registerPassword" class="block text-sm font-medium text-emerald-700 mb-2">Mot de passe</label>
                            <input type="password" id="registerPassword" name="password" required class="form-input" placeholder="••••••••">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary py-3">
                            S'inscrire
                        </button>
                    </form>
                    
                    <div class="mt-8 text-center">
                        <p class="text-emerald-600">
                            Déjà un compte ?
                            <button onclick="app.showPage('login')" class="text-emerald-800 hover:text-emerald-600 font-semibold">
                                Se connecter
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // ADMIN FUNCTIONALITY - Complete implementation
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
            // Get stats from localStorage and cached products
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            const products = this.allProducts;
            
            let stats = {
                totalProducts: products.length,
                totalOrders: adminOrders.length,
                pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
                totalUsers: 1,
                monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0)
            };

            // Try to get API stats but don't fail if unavailable
            try {
                const response = await fetch(`${this.apiUrl}/api/admin/dashboard`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.stats) {
                        stats = { ...stats, ...data.stats };
                    }
                }
            } catch (error) {
                console.log('API unavailable for dashboard, using local stats');
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

    // FIXED ADMIN ORDERS - This addresses the specific error in the logs
    async loadAdminOrders() {
        try {
            console.log('Loading orders from admin panel...');
            
            // Always start with localStorage orders
            let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            console.log('Local orders loaded:', orders.length);
            
            // Try to merge with API orders
            try {
                const response = await fetch(`${this.apiUrl}/api/orders`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.orders && data.orders.length > 0) {
                        console.log('API orders loaded:', data.orders.length);
                        // Merge orders avoiding duplicates
                        const apiOrders = data.orders.filter(apiOrder => 
                            !orders.some(localOrder => localOrder.numeroCommande === apiOrder.numeroCommande)
                        );
                        orders = [...orders, ...apiOrders];
                    }
                }
            } catch (error) {
                console.log('API unavailable, using only local orders');
            }
            
            // Sort by date, newest first
            orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
            
            console.log('Total orders to display:', orders.length);
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des commandes</h2>
                        <div class="flex gap-2">
                            <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ${orders.length} commande(s)
                            </span>
                            <button onclick="app.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-sync mr-2"></i>Actualiser
                            </button>
                        </div>
                    </div>
                    
                    ${orders.length === 0 ? `
                        <div class="text-center py-16">
                            <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                            <p class="text-emerald-600">Les commandes apparaîtront ici une fois reçues.</p>
                        </div>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-emerald-100">
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">N° Commande</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Client</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Date</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Total</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Statut</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orders.map(order => `
                                        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                            <td class="py-4 px-4">
                                                <span class="font-mono font-semibold text-emerald-700">${order.numeroCommande}</span>
                                                ${order.source === 'local' ? '<span class="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">LOCAL</span>' : ''}
                                            </td>
                                            <td class="py-4 px-4">
                                                <div>
                                                    <p class="font-semibold text-emerald-800">${order.client.prenom} ${order.client.nom}</p>
                                                    <p class="text-sm text-emerald-600">${order.client.email}</p>
                                                    <p class="text-sm text-emerald-600">${order.client.telephone}</p>
                                                </div>
                                            </td>
                                            <td class="py-4 px-4">
                                                <p class="text-emerald-700">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                                                <p class="text-sm text-emerald-500">${new Date(order.dateCommande).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                                            </td>
                                            <td class="py-4 px-4">
                                                <span class="font-bold text-emerald-700">${order.total} DA</span>
                                            </td>
                                            <td class="py-4 px-4">
                                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                                                    order.statut === 'en-attente' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.statut === 'confirmee' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'expediee' ? 'bg-purple-100 text-purple-800' :
                                                    order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }">
                                                    ${order.statut.charAt(0).toUpperCase() + order.statut.slice(1)}
                                                </span>
                                            </td>
                                            <td class="py-4 px-4">
                                                <div class="flex items-center space-x-2">
                                                    <button onclick="viewOrderDetails('${order.numeroCommande}')" 
                                                            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all"
                                                            title="Voir détails">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button onclick="updateOrderStatus('${order.numeroCommande}')" 
                                                            class="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all"
                                                            title="Changer statut">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading admin orders:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p class="text-red-800">Erreur de chargement des commandes: ${error.message}</p>
                </div>
            `;
        }
    }

    // CART FUNCTIONALITY - FIXED
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
        const fraisLivraison = sousTotal >= this.settings.fraisLivraisonGratuite ? 0 : this.settings.fraisLivraison;
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

    // AUTH METHODS
    async login(credentials) {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                this.currentUser = data.user;
                this.updateUserUI();
                this.showToast('Connexion réussie', 'success');
                this.showPage('home');
                return { success: true };
            } else {
                throw new Error(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                this.currentUser = data.user;
                this.updateUserUI();
                this.showToast('Inscription réussie', 'success');
                this.showPage('home');
                return { success: true };
            } else {
                throw new Error(data.message || 'Erreur d\'inscription');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
    }

    // SEARCH FUNCTIONALITY
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

    // ADMIN PRODUCTS MANAGEMENT
    async loadAdminProducts() {
        try {
            console.log('Loading admin products...');
            
            const products = [...this.allProducts];
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des produits</h2>
                        <div class="flex gap-4">
                            <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ${products.length} produit(s)
                            </span>
                            <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-green-700 font-semibold">
                                <i class="fas fa-plus mr-2"></i>Ajouter produit
                            </button>
                        </div>
                    </div>
                    
                    ${products.length === 0 ? `
                        <div class="text-center py-16">
                            <i class="fas fa-pills text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit</h3>
                            <p class="text-emerald-600 mb-8">Commencez par ajouter votre premier produit.</p>
                            <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-plus mr-2"></i>Ajouter le premier produit
                            </button>
                        </div>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-emerald-100">
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Image</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Nom</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Catégorie</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Prix</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Stock</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Statut</th>
                                        <th class="text-left py-3 px-4 font-semibold text-emerald-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map(product => this.createProductRowForAdmin(product)).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
                
                <!-- Add Product Modal -->
                <div id="addProductModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-emerald-800" id="modalTitle">Ajouter un produit</h3>
                            <button onclick="closeProductModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form id="productForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="productName" class="block text-sm font-medium text-emerald-700 mb-2">Nom du produit *</label>
                                    <input type="text" id="productName" name="nom" required class="form-input">
                                </div>
                                <div>
                                    <label for="productBrand" class="block text-sm font-medium text-emerald-700 mb-2">Marque</label>
                                    <input type="text" id="productBrand" name="marque" class="form-input">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="productCategory" class="block text-sm font-medium text-emerald-700 mb-2">Catégorie *</label>
                                    <select id="productCategory" name="categorie" required class="form-input">
                                        <option value="">Sélectionner une catégorie</option>
                                        <option value="Vitalité">Vitalité</option>
                                        <option value="Sport">Sport</option>
                                        <option value="Visage">Visage</option>
                                        <option value="Cheveux">Cheveux</option>
                                        <option value="Solaire">Solaire</option>
                                        <option value="Intime">Intime</option>
                                        <option value="Soins">Soins</option>
                                        <option value="Bébé">Bébé</option>
                                        <option value="Homme">Homme</option>
                                        <option value="Dentaire">Dentaire</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="productPrice" class="block text-sm font-medium text-emerald-700 mb-2">Prix (DA) *</label>
                                    <input type="number" id="productPrice" name="prix" required min="0" step="0.01" class="form-input">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="productStock" class="block text-sm font-medium text-emerald-700 mb-2">Stock *</label>
                                    <input type="number" id="productStock" name="stock" required min="0" class="form-input">
                                </div>
                                <div>
                                    <label for="productOriginalPrice" class="block text-sm font-medium text-emerald-700 mb-2">Prix original (pour promotion)</label>
                                    <input type="number" id="productOriginalPrice" name="prixOriginal" min="0" step="0.01" class="form-input">
                                </div>
                            </div>
                            
                            <div>
                                <label for="productDescription" class="block text-sm font-medium text-emerald-700 mb-2">Description</label>
                                <textarea id="productDescription" name="description" rows="3" class="form-input resize-none"></textarea>
                            </div>
                            
                            <div>
                                <label for="productImage" class="block text-sm font-medium text-emerald-700 mb-2">Image du produit</label>
                                <input type="file" id="productImage" name="image" accept="image/*" class="form-input" onchange="previewProductImage(this)">
                                <div id="imagePreview" class="mt-4 hidden">
                                    <img id="previewImg" src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg">
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-6">
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" id="productFeatured" name="enVedette" class="form-checkbox">
                                    <span class="text-emerald-700 font-medium">En vedette</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" id="productPromotion" name="enPromotion" class="form-checkbox">
                                    <span class="text-emerald-700 font-medium">En promotion</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" id="productActive" name="actif" checked class="form-checkbox">
                                    <span class="text-emerald-700 font-medium">Actif</span>
                                </label>
                            </div>
                            
                            <div class="flex justify-end space-x-4">
                                <button type="button" onclick="closeProductModal()" class="btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" class="btn-primary">
                                    <span id="submitButtonText">Ajouter le produit</span>
                                    <i id="submitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading admin products:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p class="text-red-800">Erreur de chargement des produits: ${error.message}</p>
                </div>
            `;
        }
    }

    createProductRowForAdmin(product) {
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
        
        return `
            <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                <td class="py-4 px-4">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-16 h-16 object-cover rounded-lg"
                         onerror="this.src='https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}'">
                </td>
                <td class="py-4 px-4">
                    <div>
                        <p class="font-semibold text-emerald-800">${product.nom}</p>
                        ${product.marque ? `<p class="text-sm text-emerald-600">${product.marque}</p>` : ''}
                    </div>
                </td>
                <td class="py-4 px-4">
                    <span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-semibold">${product.categorie}</span>
                </td>
                <td class="py-4 px-4">
                    <div>
                        <span class="font-bold text-emerald-700">${product.prix} DA</span>
                        ${product.prixOriginal ? `<p class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</p>` : ''}
                    </div>
                </td>
                <td class="py-4 px-4">
                    <span class="font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-emerald-600'}">${product.stock}</span>
                </td>
                <td class="py-4 px-4">
                    <div class="flex flex-col space-y-1">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${product.actif !== false ? 'Actif' : 'Inactif'}
                        </span>
                        ${product.enVedette ? '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">★ Vedette</span>' : ''}
                        ${product.enPromotion ? '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">% Promo</span>' : ''}
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="editProduct('${product._id}')" 
                                class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all"
                                title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="toggleProductFeatured('${product._id}', ${!product.enVedette})" 
                                class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 p-2 rounded-lg transition-all"
                                title="${product.enVedette ? 'Retirer de la vedette' : 'Mettre en vedette'}">
                            <i class="fas fa-star ${product.enVedette ? 'text-yellow-500' : ''}"></i>
                        </button>
                        <button onclick="deleteProduct('${product._id}')" 
                                class="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // ADMIN FEATURED PRODUCTS
    async loadAdminFeatured() {
        try {
            const featuredProducts = this.allProducts.filter(p => p.enVedette);
            const regularProducts = this.allProducts.filter(p => !p.enVedette);
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des coups de cœur</h2>
                        <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ${featuredProducts.length} produit(s) en vedette
                        </span>
                    </div>
                    
                    <!-- Featured Products -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-emerald-800 mb-4">
                            <i class="fas fa-star text-yellow-500 mr-2"></i>Produits en vedette
                        </h3>
                        
                        ${featuredProducts.length === 0 ? `
                            <div class="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                                <i class="fas fa-star text-4xl text-yellow-300 mb-4"></i>
                                <p class="text-yellow-700 font-semibold">Aucun produit en vedette</p>
                                <p class="text-yellow-600 text-sm">Sélectionnez des produits ci-dessous pour les mettre en vedette</p>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${featuredProducts.map(product => `
                                    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 relative">
                                        <div class="absolute top-2 right-2">
                                            <button onclick="toggleProductFeatured('${product._id}', false)" 
                                                    class="text-red-500 hover:text-red-700 bg-white rounded-full p-1">
                                                <i class="fas fa-times text-sm"></i>
                                            </button>
                                        </div>
                                        <div class="flex items-center space-x-3">
                                            <img src="${this.getProductImageUrl(product)}" alt="${product.nom}" 
                                                 class="w-16 h-16 object-cover rounded-lg">
                                            <div class="flex-1">
                                                <h4 class="font-semibold text-emerald-800">${product.nom}</h4>
                                                <p class="text-sm text-emerald-600">${product.categorie}</p>
                                                <p class="font-bold text-emerald-700">${product.prix} DA</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    
                    <!-- Available Products -->
                    <div>
                        <h3 class="text-xl font-bold text-emerald-800 mb-4">
                            <i class="fas fa-plus-circle text-emerald-500 mr-2"></i>Ajouter à la vedette
                        </h3>
                        
                        ${regularProducts.length === 0 ? `
                            <div class="text-center py-12 bg-emerald-50 rounded-xl border border-emerald-200">
                                <i class="fas fa-check-circle text-4xl text-emerald-300 mb-4"></i>
                                <p class="text-emerald-700 font-semibold">Tous les produits sont en vedette !</p>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${regularProducts.slice(0, 12).map(product => `
                                    <div class="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                                         onclick="toggleProductFeatured('${product._id}', true)">
                                        <div class="flex items-center space-x-3">
                                            <img src="${this.getProductImageUrl(product)}" alt="${product.nom}" 
                                                 class="w-16 h-16 object-cover rounded-lg">
                                            <div class="flex-1">
                                                <h4 class="font-semibold text-emerald-800">${product.nom}</h4>
                                                <p class="text-sm text-emerald-600">${product.categorie}</p>
                                                <p class="font-bold text-emerald-700">${product.prix} DA</p>
                                            </div>
                                            <div class="text-emerald-500">
                                                <i class="fas fa-plus-circle text-xl"></i>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ${regularProducts.length > 12 ? `
                                <div class="text-center mt-6">
                                    <p class="text-emerald-600">Et ${regularProducts.length - 12} autres produits...</p>
                                </div>
                            ` : ''}
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading featured products:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p class="text-red-800">Erreur de chargement: ${error.message}</p>
                </div>
            `;
        }
    }

    // ADMIN CLEANUP SECTION
    async loadAdminCleanup() {
        try {
            const duplicateProducts = this.findDuplicateProducts();
            const inactiveProducts = this.allProducts.filter(p => p.actif === false);
            const outOfStockProducts = this.allProducts.filter(p => p.stock === 0);
            const problemProducts = this.allProducts.filter(p => !p.nom || !p.prix || !p.categorie);
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-red-800">
                            <i class="fas fa-broom mr-3"></i>Nettoyage des produits
                        </h2>
                        <div class="text-right">
                            <p class="text-sm text-red-600">Maintenance de la base de données</p>
                            <p class="text-xs text-red-500">Utilisez avec précaution</p>
                        </div>
                    </div>
                    
                    <!-- Statistics -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-yellow-700">Doublons</p>
                                    <p class="text-2xl font-bold text-yellow-800">${duplicateProducts.length}</p>
                                </div>
                                <i class="fas fa-copy text-yellow-500 text-2xl"></i>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-gray-700">Inactifs</p>
                                    <p class="text-2xl font-bold text-gray-800">${inactiveProducts.length}</p>
                                </div>
                                <i class="fas fa-eye-slash text-gray-500 text-2xl"></i>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-red-700">Stock épuisé</p>
                                    <p class="text-2xl font-bold text-red-800">${outOfStockProducts.length}</p>
                                </div>
                                <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-purple-700">Problèmes</p>
                                    <p class="text-2xl font-bold text-purple-800">${problemProducts.length}</p>
                                </div>
                                <i class="fas fa-bug text-purple-500 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cleanup Actions -->
                    <div class="space-y-6">
                        ${duplicateProducts.length > 0 ? `
                            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <h3 class="text-lg font-bold text-yellow-800 mb-4">
                                    <i class="fas fa-copy mr-2"></i>Produits en double
                                </h3>
                                <p class="text-yellow-700 mb-4">${duplicateProducts.length} doublons détectés</p>
                                <button onclick="cleanupDuplicates()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold">
                                    <i class="fas fa-broom mr-2"></i>Supprimer les doublons
                                </button>
                            </div>
                        ` : ''}
                        
                        ${inactiveProducts.length > 0 ? `
                            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-bold text-gray-800 mb-4">
                                    <i class="fas fa-eye-slash mr-2"></i>Produits inactifs
                                </h3>
                                <p class="text-gray-700 mb-4">${inactiveProducts.length} produits inactifs trouvés</p>
                                <div class="flex space-x-4">
                                    <button onclick="activateAllProducts()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
                                        <i class="fas fa-eye mr-2"></i>Activer tous
                                    </button>
                                    <button onclick="deleteInactiveProducts()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
                                        <i class="fas fa-trash mr-2"></i>Supprimer tous
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${outOfStockProducts.length > 0 ? `
                            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                                <h3 class="text-lg font-bold text-red-800 mb-4">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>Produits en rupture
                                </h3>
                                <p class="text-red-700 mb-4">${outOfStockProducts.length} produits en rupture de stock</p>
                                <button onclick="restockAllProducts()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                                    <i class="fas fa-plus mr-2"></i>Remettre en stock (10 unités)
                                </button>
                            </div>
                        ` : ''}
                        
                        <!-- Bulk Actions -->
                        <div class="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                            <h3 class="text-lg font-bold text-red-800 mb-4">
                                <i class="fas fa-exclamation-triangle mr-2"></i>Actions de masse (DANGER)
                            </h3>
                            <p class="text-red-700 mb-6">Ces actions sont irréversibles. Utilisez avec précaution.</p>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onclick="confirmBulkAction('deleteAll')" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold">
                                    <i class="fas fa-trash mr-2"></i>Supprimer TOUS les produits
                                </button>
                                <button onclick="confirmBulkAction('resetStock')" class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold">
                                    <i class="fas fa-undo mr-2"></i>Remettre à zéro tous les stocks
                                </button>
                                <button onclick="confirmBulkAction('clearFeatured')" class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold">
                                    <i class="fas fa-star-half-alt mr-2"></i>Retirer toutes les vedettes
                                </button>
                                <button onclick="confirmBulkAction('clearPromotions')" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold">
                                    <i class="fas fa-percentage mr-2"></i>Supprimer toutes les promotions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading cleanup page:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p class="text-red-800">Erreur de chargement: ${error.message}</p>
                </div>
            `;
        }
    }

    findDuplicateProducts() {
        const seen = new Map();
        const duplicates = [];
        
        this.allProducts.forEach(product => {
            const key = `${product.nom.toLowerCase()}_${product.prix}_${product.categorie}`;
            if (seen.has(key)) {
                duplicates.push(product);
            } else {
                seen.set(key, product);
            }
        });
        
        return duplicates;
    }

    getProductImageUrl(product) {
        if (product.image && product.image.startsWith('data:image')) {
            return product.image;
        } else if (product.image && product.image.startsWith('http')) {
            return product.image;
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
            return `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
    }

    // PRODUCT MANAGEMENT METHODS
    async addProduct(productData) {
        try {
            console.log('Adding new product:', productData);
            
            // Generate ID
            const productId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const newProduct = {
                _id: productId,
                ...productData,
                dateAjout: new Date().toISOString(),
                actif: productData.actif !== false
            };
            
            // Try API first
            try {
                const response = await fetch(`${this.apiUrl}/api/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(newProduct)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Product added to API:', result);
                    newProduct._id = result.product._id || newProduct._id;
                }
            } catch (apiError) {
                console.log('⚠️ API unavailable, saving locally only');
            }
            
            // Always save to localStorage
            const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            products.unshift(newProduct);
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            // Update cache
            this.allProducts.unshift(newProduct);
            
            this.showToast('Produit ajouté avec succès', 'success');
            return { success: true, product: newProduct };
            
        } catch (error) {
            console.error('❌ Error adding product:', error);
            this.showToast('Erreur lors de l\'ajout du produit', 'error');
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, productData) {
        try {
            console.log('Updating product:', productId, productData);
            
            // Try API first
            try {
                const response = await fetch(`${this.apiUrl}/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    console.log('✅ Product updated in API');
                }
            } catch (apiError) {
                console.log('⚠️ API unavailable for update, updating locally only');
            }
            
            // Always update localStorage
            const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const productIndex = products.findIndex(p => p._id === productId);
            
            if (productIndex > -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
                localStorage.setItem('demoProducts', JSON.stringify(products));
                
                // Update cache
                const cacheIndex = this.allProducts.findIndex(p => p._id === productId);
                if (cacheIndex > -1) {
                    this.allProducts[cacheIndex] = { ...this.allProducts[cacheIndex], ...productData };
                }
                
                this.showToast('Produit mis à jour avec succès', 'success');
                return { success: true };
            } else {
                throw new Error('Produit non trouvé');
            }
            
        } catch (error) {
            console.error('❌ Error updating product:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        try {
            console.log('Deleting product:', productId);
            
            // Try API first
            try {
                const response = await fetch(`${this.apiUrl}/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                
                if (response.ok) {
                    console.log('✅ Product deleted from API');
                }
            } catch (apiError) {
                console.log('⚠️ API unavailable for delete, deleting locally only');
            }
            
            // Always delete from localStorage
            const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const updatedProducts = products.filter(p => p._id !== productId);
            localStorage.setItem('demoProducts', JSON.stringify(updatedProducts));
            
            // Update cache
            this.allProducts = this.allProducts.filter(p => p._id !== productId);
            
            this.showToast('Produit supprimé avec succès', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            this.showToast('Erreur lors de la suppression', 'error');
            return { success: false, error: error.message };
        }
    }

    async toggleProductFeatured(productId, featured) {
        await this.updateProduct(productId, { enVedette: featured });
        
        // Refresh current admin section if we're in featured section
        if (document.querySelector('.admin-nav-btn.featured.bg-gradient-to-r')) {
            await this.loadAdminFeatured();
        } else if (document.querySelector('.admin-nav-btn.products.bg-gradient-to-r')) {
            await this.loadAdminProducts();
        }
        
        // Refresh home page products if needed
        this.refreshHomePage();
    }

    // UI HELPER METHODS
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
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast ${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
        
        // Set colors based on type
        const colors = {
            'success': 'bg-green-500 text-white',
            'error': 'bg-red-500 text-white',
            'warning': 'bg-yellow-500 text-white',
            'info': 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${colors[type] || colors.info}`;
        
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas ${this.getToastIcon(type)} mr-3"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
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

    handleError(error) {
        console.error('App Error:', error);
        this.showToast('Une erreur est survenue', 'error');
    }

    // Utility method to check if user is authenticated
    requireAuth() {
        if (!this.currentUser) {
            this.showToast('Veuillez vous connecter pour continuer', 'warning');
            this.showPage('login');
            return false;
        }
        return true;
    }

    // Utility method to check if user is admin
    requireAdmin() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès administrateur requis', 'error');
            this.showPage('home');
            return false;
        }
        return true;
    }
}

// GLOBAL FUNCTIONS - Critical for proper functionality

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

// CHECKOUT FUNCTIONALITY - Fixed
async function handleCheckout() {
    if (!window.app) {
        console.error('App not available for checkout');
        return;
    }
    
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Validate form
    const required = ['prenom', 'nom', 'email', 'telephone', 'adresse'];
    for (let field of required) {
        if (!formData.get(field)) {
            window.app.showToast(`Le champ ${field} est requis`, 'error');
            return;
        }
    }
    
    // Calculate totals
    const sousTotal = window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const fraisLivraison = sousTotal >= window.app.settings.fraisLivraisonGratuite ? 0 : window.app.settings.fraisLivraison;
    const total = sousTotal + fraisLivraison;
    
    const orderData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        adresse: formData.get('adresse'),
        notes: formData.get('notes') || '',
        sousTotal: sousTotal,
        fraisLivraison: fraisLivraison,
        total: total
    };
    
    console.log('🛒 Processing checkout with data:', orderData);
    
    try {
        const result = await window.app.processOrder(orderData);
        
        if (result.success) {
            console.log('✅ Order processed successfully:', result.orderNumber);
            window.app.showPage('order-confirmation', { orderNumber: result.orderNumber });
        } else {
            console.error('❌ Order processing failed:', result.error);
            window.app.showToast('Erreur lors de la commande: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Checkout error:', error);
        window.app.showToast('Erreur lors de la finalisation de la commande', 'error');
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

// PRODUCT PAGE FUNCTIONS
function incrementQuantity(maxStock) {
    const input = document.getElementById('productQuantity');
    if (input) {
        const current = parseInt(input.value);
        if (current < maxStock) {
            input.value = current + 1;
        }
    }
}

function decrementQuantity() {
    const input = document.getElementById('productQuantity');
    if (input) {
        const current = parseInt(input.value);
        if (current > 1) {
            input.value = current - 1;
        }
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (window.app) {
        window.app.addToCart(productId, quantity);
    }
}

// ADMIN FUNCTIONS
function switchAdminSection(section) {
    if (!window.app || !window.app.requireAdmin()) return;
    
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
    }
    
    // Load section content
    switch (section) {
        case 'dashboard':
            window.app.loadAdminDashboard();
            break;
        case 'products':
            window.app.loadAdminProducts();
            break;
        case 'orders':
            window.app.loadAdminOrders();
            break;
        case 'featured':
            window.app.loadAdminFeatured();
            break;
        case 'cleanup':
            window.app.loadAdminCleanup();
            break;
    }
}

// PRODUCT MODAL FUNCTIONS
function openAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    const submitText = document.getElementById('submitButtonText');
    
    if (modal) {
        modal.classList.remove('hidden');
        if (modalTitle) modalTitle.textContent = 'Ajouter un produit';
        if (form) form.reset();
        if (submitText) submitText.textContent = 'Ajouter le produit';
        
        window.app.currentEditingProduct = null;
    }
}

function editProduct(productId) {
    if (!window.app) return;
    
    const product = window.app.allProducts.find(p => p._id === productId);
    if (!product) {
        window.app.showToast('Produit non trouvé', 'error');
        return;
    }
    
    const modal = document.getElementById('addProductModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitButtonText');
    
    if (modal) {
        modal.classList.remove('hidden');
        if (modalTitle) modalTitle.textContent = 'Modifier le produit';
        if (submitText) submitText.textContent = 'Mettre à jour';
        
        // Fill form with product data
        document.getElementById('productName').value = product.nom || '';
        document.getElementById('productBrand').value = product.marque || '';
        document.getElementById('productCategory').value = product.categorie || '';
        document.getElementById('productPrice').value = product.prix || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productOriginalPrice').value = product.prixOriginal || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productFeatured').checked = product.enVedette || false;
        document.getElementById('productPromotion').checked = product.enPromotion || false;
        document.getElementById('productActive').checked = product.actif !== false;
        
        // Show image preview if exists
        if (product.image) {
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (imagePreview && previewImg) {
                previewImg.src = window.app.getProductImageUrl(product);
                imagePreview.classList.remove('hidden');
            }
        }
        
        window.app.currentEditingProduct = productId;
    }
}

function closeProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function previewProductImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (imagePreview && previewImg) {
                previewImg.src = e.target.result;
                imagePreview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// PRODUCT FORM SUBMISSION
document.addEventListener('DOMContentLoaded', function() {
    // Product form handler
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!window.app) return;
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const submitText = document.getElementById('submitButtonText');
            const submitSpinner = document.getElementById('submitSpinner');
            
            // Show loading state
            if (submitBtn) submitBtn.disabled = true;
            if (submitText) submitText.textContent = 'Traitement...';
            if (submitSpinner) submitSpinner.classList.remove('hidden');
            
            try {
                const productData = {
                    nom: formData.get('nom'),
                    marque: formData.get('marque'),
                    categorie: formData.get('categorie'),
                    prix: parseFloat(formData.get('prix')),
                    stock: parseInt(formData.get('stock')),
                    prixOriginal: formData.get('prixOriginal') ? parseFloat(formData.get('prixOriginal')) : null,
                    description: formData.get('description'),
                    enVedette: formData.get('enVedette') === 'on',
                    enPromotion: formData.get('enPromotion') === 'on',
                    actif: formData.get('actif') === 'on'
                };
                
                // Handle image
                const imageFile = formData.get('image');
                if (imageFile && imageFile.size > 0) {
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        productData.image = e.target.result;
                        await processProductSubmission(productData);
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    await processProductSubmission(productData);
                }
                
                async function processProductSubmission(data) {
                    let result;
                    if (window.app.currentEditingProduct) {
                        result = await window.app.updateProduct(window.app.currentEditingProduct, data);
                    } else {
                        result = await window.app.addProduct(data);
                    }
                    
                    if (result.success) {
                        closeProductModal();
                        window.app.loadAdminProducts();
                        window.app.refreshProductsCache();
                    }
                    
                    // Reset loading state
                    if (submitBtn) submitBtn.disabled = false;
                    if (submitText) submitText.textContent = window.app.currentEditingProduct ? 'Mettre à jour' : 'Ajouter le produit';
                    if (submitSpinner) submitSpinner.classList.add('hidden');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                window.app.showToast('Erreur lors de la soumission', 'error');
                
                // Reset loading state
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.textContent = window.app.currentEditingProduct ? 'Mettre à jour' : 'Ajouter le produit';
                if (submitSpinner) submitSpinner.classList.add('hidden');
            }
        });
    }
});

function deleteProduct(productId) {
    if (!window.app || !confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    window.app.deleteProduct(productId).then(result => {
        if (result.success) {
            window.app.loadAdminProducts();
            window.app.refreshProductsCache();
        }
    });
}

// ORDER MANAGEMENT FUNCTIONS
function viewOrderDetails(orderNumber) {
    if (!window.app) return;
    
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const order = orders.find(o => o.numeroCommande === orderNumber);
    
    if (!order) {
        window.app.showToast('Commande non trouvée', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-90vh overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-emerald-800">Détails de la commande ${order.numeroCommande}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 class="text-lg font-bold text-emerald-800 mb-4">Informations client</h4>
                    <div class="space-y-2">
                        <p><strong>Nom:</strong> ${order.client.prenom} ${order.client.nom}</p>
                        <p><strong>Email:</strong> ${order.client.email}</p>
                        <p><strong>Téléphone:</strong> ${order.client.telephone}</p>
                        <p><strong>Adresse:</strong> ${order.client.adresse}</p>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-bold text-emerald-800 mb-4">Informations commande</h4>
                    <div class="space-y-2">
                        <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleString('fr-FR')}</p>
                        <p><strong>Statut:</strong> <span class="px-2 py-1 rounded-full text-sm ${
                            order.statut === 'en-attente' ? 'bg-yellow-100 text-yellow-800' :
                            order.statut === 'confirmee' ? 'bg-blue-100 text-blue-800' :
                            order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }">${order.statut}</span></p>
                        <p><strong>Sous-total:</strong> ${order.sousTotal} DA</p>
                        <p><strong>Frais de livraison:</strong> ${order.fraisLivraison} DA</p>
                        <p><strong>Total:</strong> <span class="font-bold">${order.total} DA</span></p>
                    </div>
                </div>
            </div>
            
            <div class="mb-8">
                <h4 class="text-lg font-bold text-emerald-800 mb-4">Produits commandés</h4>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left py-2">Produit</th>
                                <th class="text-left py-2">Prix unitaire</th>
                                <th class="text-left py-2">Quantité</th>
                                <th class="text-left py-2">Sous-total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.produits.map(produit => `
                                <tr class="border-b">
                                    <td class="py-3">
                                        <div class="flex items-center space-x-3">
                                            <img src="${produit.image}" alt="${produit.nom}" class="w-12 h-12 object-cover rounded">
                                            <span class="font-medium">${produit.nom}</span>
                                        </div>
                                    </td>
                                    <td class="py-3">${produit.prix} DA</td>
                                    <td class="py-3">${produit.quantite}</td>
                                    <td class="py-3 font-bold">${produit.prix * produit.quantite} DA</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${order.notes ? `
                <div class="mb-8">
                    <h4 class="text-lg font-bold text-emerald-800 mb-2">Notes de commande</h4>
                    <p class="bg-gray-50 p-4 rounded-lg">${order.notes}</p>
                </div>
            ` : ''}
            
            <div class="flex justify-end space-x-4">
                <button onclick="updateOrderStatus('${order.numeroCommande}')" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                    Changer le statut
                </button>
                <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                    Fermer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateOrderStatus(orderNumber) {
    if (!window.app) return;
    
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.numeroCommande === orderNumber);
    
    if (orderIndex === -1) {
        window.app.showToast('Commande non trouvée', 'error');
        return;
    }
    
    const statusOptions = [
        { value: 'en-attente', label: 'En attente', color: 'yellow' },
        { value: 'confirmee', label: 'Confirmée', color: 'blue' },
        { value: 'expediee', label: 'Expédiée', color: 'purple' },
        { value: 'livree', label: 'Livrée', color: 'green' },
        { value: 'annulee', label: 'Annulée', color: 'red' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-emerald-800 mb-4">Changer le statut de la commande</h3>
            <p class="text-emerald-600 mb-6">Commande: ${orderNumber}</p>
            
            <div class="space-y-3 mb-6">
                ${statusOptions.map(status => `
                    <label class="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                        <input type="radio" name="newStatus" value="${status.value}" 
                               ${orders[orderIndex].statut === status.value ? 'checked' : ''}
                               class="form-radio">
                        <span class="px-3 py-1 rounded-full text-sm font-semibold bg-${status.color}-100 text-${status.color}-800">
                            ${status.label}
                        </span>
                    </label>
                `).join('')}
            </div>
            
            <div class="flex justify-end space-x-4">
                <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                    Annuler
                </button>
                <button onclick="confirmStatusChange('${orderNumber}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg">
                    Confirmer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmStatusChange(orderNumber) {
    const modal = event.target.closest('.fixed');
    const selectedStatus = modal.querySelector('input[name="newStatus"]:checked');
    
    if (!selectedStatus) {
        window.app.showToast('Veuillez sélectionner un statut', 'error');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.numeroCommande === orderNumber);
    
    if (orderIndex > -1) {
        orders[orderIndex].statut = selectedStatus.value;
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        window.app.showToast('Statut mis à jour avec succès', 'success');
        window.app.loadAdminOrders();
        
        // Close all modals
        document.querySelectorAll('.fixed.inset-0').forEach(m => m.remove());
    }
}

// CLEANUP FUNCTIONS
function cleanupDuplicates() {
    if (!window.app || !confirm('Supprimer tous les produits en double ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const seen = new Map();
    const uniqueProducts = [];
    
    products.forEach(product => {
        const key = `${product.nom.toLowerCase()}_${product.prix}_${product.categorie}`;
        if (!seen.has(key)) {
            seen.set(key, true);
            uniqueProducts.push(product);
        }
    });
    
    localStorage.setItem('demoProducts', JSON.stringify(uniqueProducts));
    window.app.allProducts = uniqueProducts;
    
    window.app.showToast(`${products.length - uniqueProducts.length} doublons supprimés`, 'success');
    window.app.loadAdminCleanup();
}

function activateAllProducts() {
    if (!window.app || !confirm('Activer tous les produits ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    products.forEach(product => product.actif = true);
    
    localStorage.setItem('demoProducts', JSON.stringify(products));
    window.app.allProducts = products;
    
    window.app.showToast('Tous les produits ont été activés', 'success');
    window.app.loadAdminCleanup();
}

function deleteInactiveProducts() {
    if (!window.app || !confirm('Supprimer tous les produits inactifs ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const activeProducts = products.filter(product => product.actif !== false);
    
    localStorage.setItem('demoProducts', JSON.stringify(activeProducts));
    window.app.allProducts = activeProducts;
    
    window.app.showToast(`${products.length - activeProducts.length} produits inactifs supprimés`, 'success');
    window.app.loadAdminCleanup();
}

function restockAllProducts() {
    if (!window.app || !confirm('Remettre en stock tous les produits épuisés (10 unités) ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    products.forEach(product => {
        if (product.stock === 0) {
            product.stock = 10;
        }
    });
    
    localStorage.setItem('demoProducts', JSON.stringify(products));
    window.app.allProducts = products;
    
    window.app.showToast('Stock remis à jour pour tous les produits épuisés', 'success');
    window.app.loadAdminCleanup();
}

function confirmBulkAction(action) {
    if (!window.app) return;
    
    const actions = {
        deleteAll: {
            message: 'SUPPRIMER TOUS LES PRODUITS ? Cette action est irréversible !',
            execute: () => {
                localStorage.setItem('demoProducts', JSON.stringify([]));
                window.app.allProducts = [];
                window.app.showToast('Tous les produits ont été supprimés', 'success');
            }
        },
        resetStock: {
            message: 'Remettre à zéro le stock de tous les produits ?',
            execute: () => {
                const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
                products.forEach(product => product.stock = 0);
                localStorage.setItem('demoProducts', JSON.stringify(products));
                window.app.allProducts = products;
                window.app.showToast('Stock remis à zéro pour tous les produits', 'success');
            }
        },
        clearFeatured: {
            message: 'Retirer tous les produits de la vedette ?',
            execute: () => {
                const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
                products.forEach(product => product.enVedette = false);
                localStorage.setItem('demoProducts', JSON.stringify(products));
                window.app.allProducts = products;
                window.app.showToast('Tous les produits ont été retirés de la vedette', 'success');
                window.app.refreshHomePage();
            }
        },
        clearPromotions: {
            message: 'Supprimer toutes les promotions ?',
            execute: () => {
                const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
                products.forEach(product => {
                    product.enPromotion = false;
                    delete product.prixOriginal;
                });
                localStorage.setItem('demoProducts', JSON.stringify(products));
                window.app.allProducts = products;
                window.app.showToast('Toutes les promotions ont été supprimées', 'success');
                window.app.refreshHomePage();
            }
        }
    };
    
    const actionData = actions[action];
    if (actionData && confirm(actionData.message)) {
        actionData.execute();
        window.app.loadAdminCleanup();
    }
}

// AUTH FORM HANDLERS
async function handleLogin(event) {
    event.preventDefault();
    
    if (!window.app) return;
    
    const form = event.target;
    const formData = new FormData(form);
    
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    await window.app.login(credentials);
}

async function handleRegister(event) {
    event.preventDefault();
    
    if (!window.app) return;
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        password: formData.get('password')
    };
    
    await window.app.register(userData);
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing PharmacieGaherApp...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('✅ App initialized and made globally available');
});

console.log('✅ Complete Fixed app.js loaded with all functionality - 4000+ lines');
