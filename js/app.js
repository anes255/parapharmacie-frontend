// Complete PharmacieGaherApp - Updated with all missing pages
class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
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
    
    // CART INTEGRATION - Delegate to CartSystem
    addToCart(productId, quantity = 1) {
        console.log('App.addToCart called, delegating to CartSystem:', productId, quantity);
        
        // Delegate to the CartSystem
        if (window.cartSystem) {
            return window.cartSystem.addItem(productId, quantity);
        } else {
            console.error('CartSystem not available');
            this.showToast('Erreur du système de panier', 'error');
            return false;
        }
    }
    
    // Get cart data from CartSystem
    getCartData() {
        if (window.cartSystem) {
            return window.cartSystem.exportCart();
        }
        return { items: [], totals: { total: 0 } };
    }
    
    // Get cart item count from CartSystem
    getCartItemCount() {
        if (window.cartSystem) {
            return window.cartSystem.getTotals().itemCount;
        }
        return 0;
    }
    
    // LOGIN PAGE
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-sign-in-alt text-white text-2xl"></i>
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
                                   placeholder="••••••••">
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-gray-600">Pas encore de compte ?</p>
                        <button onclick="app.showPage('register')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Créer un compte
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // REGISTER PAGE
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-user-plus text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">Inscription</h1>
                        <p class="text-emerald-600">Créez votre compte gratuitement</p>
                    </div>
                    
                    <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                <input type="text" id="registerPrenom" name="prenom" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Votre prénom">
                            </div>
                            
                            <div>
                                <label for="registerNom" class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                <input type="text" id="registerNom" name="nom" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Votre nom">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="registerEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input type="email" id="registerEmail" name="email" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="votre@email.com">
                            </div>
                            
                            <div>
                                <label for="registerTelephone" class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                <input type="tel" id="registerTelephone" name="telephone" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="05XXXXXXXX">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerPassword" class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                            <input type="password" id="registerPassword" name="password" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                   placeholder="••••••••">
                        </div>
                        
                        <div>
                            <label for="registerAdresse" class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                            <textarea id="registerAdresse" name="adresse" rows="2" 
                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                      placeholder="Votre adresse complète"></textarea>
                        </div>
                        
                        <div>
                            <label for="registerWilaya" class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                            <select id="registerWilaya" name="wilaya" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                <option value="">Sélectionnez votre wilaya</option>
                                <option value="Alger">Alger</option>
                                <option value="Blida">Blida</option>
                                <option value="Tipaza">Tipaza</option>
                                <option value="Boumerdès">Boumerdès</option>
                                <option value="Médéa">Médéa</option>
                                <option value="Bouira">Bouira</option>
                                <option value="Tizi Ouzou">Tizi Ouzou</option>
                                <option value="Béjaïa">Béjaïa</option>
                                <option value="Setif">Setif</option>
                                <option value="Constantine">Constantine</option>
                                <option value="Oran">Oran</option>
                                <option value="Annaba">Annaba</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-gray-600">Déjà un compte ?</p>
                        <button onclick="app.showPage('login')" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // CHECKOUT PAGE
    async loadCheckoutPage() {
        // Validate cart first
        if (!window.cartSystem || window.cartSystem.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        const cartTotals = window.cartSystem.getTotals();
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Finaliser votre commande</h1>
                        <p class="text-xl text-emerald-600">${cartTotals.itemCount} article(s) dans votre panier</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Order Form -->
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                            
                            <form id="checkoutForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="checkoutPrenom" class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" id="checkoutPrenom" name="prenom" required 
                                               value="${this.currentUser?.prenom || ''}"
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    </div>
                                    
                                    <div>
                                        <label for="checkoutNom" class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                        <input type="text" id="checkoutNom" name="nom" required 
                                               value="${this.currentUser?.nom || ''}"
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="checkoutEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input type="email" id="checkoutEmail" name="email" required 
                                               value="${this.currentUser?.email || ''}"
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    </div>
                                    
                                    <div>
                                        <label for="checkoutTelephone" class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                        <input type="tel" id="checkoutTelephone" name="telephone" required 
                                               value="${this.currentUser?.telephone || ''}"
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="checkoutAdresse" class="block text-sm font-semibold text-gray-700 mb-2">Adresse complète *</label>
                                    <textarea id="checkoutAdresse" name="adresse" required rows="3" 
                                              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                              placeholder="Votre adresse complète de livraison">${this.currentUser?.adresse || ''}</textarea>
                                </div>
                                
                                <div>
                                    <label for="checkoutWilaya" class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                    <select id="checkoutWilaya" name="wilaya" required 
                                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                        <option value="">Sélectionnez votre wilaya</option>
                                        <option value="Alger" ${this.currentUser?.wilaya === 'Alger' ? 'selected' : ''}>Alger</option>
                                        <option value="Blida" ${this.currentUser?.wilaya === 'Blida' ? 'selected' : ''}>Blida</option>
                                        <option value="Tipaza" ${this.currentUser?.wilaya === 'Tipaza' ? 'selected' : ''}>Tipaza</option>
                                        <option value="Boumerdès" ${this.currentUser?.wilaya === 'Boumerdès' ? 'selected' : ''}>Boumerdès</option>
                                        <option value="Médéa" ${this.currentUser?.wilaya === 'Médéa' ? 'selected' : ''}>Médéa</option>
                                        <option value="Bouira" ${this.currentUser?.wilaya === 'Bouira' ? 'selected' : ''}>Bouira</option>
                                        <option value="Tizi Ouzou" ${this.currentUser?.wilaya === 'Tizi Ouzou' ? 'selected' : ''}>Tizi Ouzou</option>
                                        <option value="Béjaïa" ${this.currentUser?.wilaya === 'Béjaïa' ? 'selected' : ''}>Béjaïa</option>
                                        <option value="Setif" ${this.currentUser?.wilaya === 'Setif' ? 'selected' : ''}>Setif</option>
                                        <option value="Constantine" ${this.currentUser?.wilaya === 'Constantine' ? 'selected' : ''}>Constantine</option>
                                        <option value="Oran" ${this.currentUser?.wilaya === 'Oran' ? 'selected' : ''}>Oran</option>
                                        <option value="Annaba" ${this.currentUser?.wilaya === 'Annaba' ? 'selected' : ''}>Annaba</option>
                                    </select>
                                </div>
                                
                                <!-- Payment Method -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-4">Mode de paiement *</label>
                                    <div class="space-y-3">
                                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-all">
                                            <input type="radio" name="modePaiement" value="Paiement à la livraison" checked 
                                                   class="text-emerald-600 mr-3">
                                            <div class="flex items-center">
                                                <i class="fas fa-money-bill text-emerald-600 mr-3"></i>
                                                <div>
                                                    <p class="font-semibold text-gray-800">Paiement à la livraison</p>
                                                    <p class="text-sm text-gray-600">Payez en espèces lors de la réception</p>
                                                </div>
                                            </div>
                                        </label>
                                        
                                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-all opacity-50">
                                            <input type="radio" name="modePaiement" value="Carte bancaire" disabled 
                                                   class="text-emerald-600 mr-3">
                                            <div class="flex items-center">
                                                <i class="fas fa-credit-card text-emerald-600 mr-3"></i>
                                                <div>
                                                    <p class="font-semibold text-gray-800">Carte bancaire</p>
                                                    <p class="text-sm text-gray-600">Bientôt disponible</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <div id="paymentMethodInfo"></div>
                                </div>
                                
                                <!-- Comments -->
                                <div>
                                    <label for="checkoutCommentaires" class="block text-sm font-semibold text-gray-700 mb-2">Commentaires (optionnel)</label>
                                    <textarea id="checkoutCommentaires" name="commentaires" rows="3" 
                                              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                              placeholder="Instructions spéciales pour la livraison..."></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-6">
                                ${window.cartSystem.cart.map(item => `
                                    <div class="flex items-center space-x-4 p-4 bg-emerald-50/50 rounded-xl">
                                        <img src="${item.image}" alt="${item.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-emerald-800">${item.nom}</h4>
                                            <p class="text-sm text-emerald-600">Quantité: ${item.quantite} × ${item.prix} DA</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-semibold text-emerald-700">${item.prix * item.quantite} DA</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Shipping Progress -->
                            <div id="shippingMessage" class="mb-6"></div>
                            
                            <!-- Totals -->
                            <div class="border-t-2 border-emerald-200 pt-6 space-y-3">
                                <div class="flex justify-between text-emerald-700">
                                    <span>Sous-total:</span>
                                    <span id="checkoutSousTotal">${cartTotals.sousTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-emerald-700">
                                    <span>Frais de livraison:</span>
                                    <span id="checkoutFraisLivraison">300 DA</span>
                                </div>
                                <div class="flex justify-between text-xl font-bold text-emerald-800 border-t-2 border-emerald-200 pt-3">
                                    <span>Total:</span>
                                    <span id="checkoutTotal">${cartTotals.sousTotal + 300} DA</span>
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <button onclick="processCheckoutOrder()" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mt-6">
                                <i class="fas fa-check mr-2"></i>Confirmer la commande
                            </button>
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
    
    // ORDER CONFIRMATION PAGE
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-2xl mx-auto text-center">
                    <div class="mb-8">
                        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-check-circle text-green-500 text-4xl"></i>
                        </div>
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                        <p class="text-xl text-emerald-600">Merci pour votre commande</p>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Détails de votre commande</h2>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Numéro de commande:</span>
                                <span class="font-bold text-emerald-800">#${orderNumber}</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Date:</span>
                                <span class="font-medium text-gray-800">${new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Statut:</span>
                                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">En attente</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                        <h3 class="text-lg font-bold text-blue-800 mb-4">Que se passe-t-il maintenant ?</h3>
                        <div class="text-left space-y-3 text-blue-700">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-blue-500 mr-3"></i>
                                <span>Nous avons reçu votre commande</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-clock text-blue-500 mr-3"></i>
                                <span>Nous préparons votre commande</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-shipping-fast text-blue-500 mr-3"></i>
                                <span>Livraison sous 24-48h</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-phone text-blue-500 mr-3"></i>
                                <span>Notre livreur vous contactera</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <button onclick="app.showPage('home')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                        
                        <div class="mt-4">
                            <button onclick="app.showPage('products')" 
                                    class="text-emerald-600 hover:text-emerald-700 font-semibold">
                                Continuer mes achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
    
    // ADMIN METHODS - These need to be part of the main app class
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
}

// Global functions - FIXED TO USE CARTSYSTEM
function addToCartFromCard(productId, quantity = 1) {
    console.log('Add to cart from card called:', productId);
    // Use CartSystem directly instead of app
    if (window.cartSystem && typeof window.cartSystem.addItem === 'function') {
        window.cartSystem.addItem(productId, quantity);
    } else {
        console.error('CartSystem not available');
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

console.log('✅ Complete app.js loaded with all pages');
