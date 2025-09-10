// Fixed Shifa Parapharmacie App
class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.currentPage = 'home';
        this.allProducts = [];
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Shifa Parapharmacie App...');
            
            await this.checkAuth();
            this.initEventListeners();
            await this.loadAllProducts();
            await this.showPage('home');
            this.updateCartUI();
            
            console.log('✅ App initialization complete');
        } catch (error) {
            console.error('Erreur initialisation app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
    }
    
    initEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        // Mobile menu toggle
        window.toggleMobileMenu = () => {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        };
        
        // Cart toggle
        window.toggleCart = () => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartOverlay = document.getElementById('cartOverlay');
            
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.toggle('translate-x-full');
                cartOverlay.classList.toggle('hidden');
            }
        };
        
        // Global navigation
        window.showPage = (page, params) => this.showPage(page, params);
        window.filterByCategory = (category) => this.filterByCategory(category);
        window.addToCartFromCard = (productId, quantity = 1) => this.addToCart(productId, quantity);
        window.logout = () => this.logout();
        
        // Cart functions
        window.proceedToCheckout = () => {
            if (this.cart.length === 0) {
                this.showToast('Votre panier est vide', 'warning');
                return;
            }
            window.toggleCart();
            this.showPage('checkout');
        };
    }
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await apiCall('/auth/profile');
                if (response && response.id) {
                    this.currentUser = response;
                    this.updateUserUI();
                }
            } catch (error) {
                console.log('Token invalid, removing...');
                localStorage.removeItem('token');
                this.currentUser = null;
            }
        }
        this.updateUserUI();
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
    
    async loadAllProducts() {
        try {
            console.log('📦 Loading products from database...');
            const response = await apiCall('/products?limit=100');
            
            if (response && response.products) {
                this.allProducts = response.products;
                console.log(`✅ Loaded ${this.allProducts.length} products from database`);
            } else {
                this.allProducts = [];
                console.log('No products found in database');
            }
        } catch (error) {
            console.warn('Failed to load products from database:', error.message);
            this.allProducts = [];
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
                            <div class="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                                <i class="fas fa-seedling text-7xl text-white drop-shadow-lg"></i>
                            </div>
                        </div>
                        <h1 class="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent drop-shadow-2xl">
                            Shifa
                        </h1>
                        <h2 class="text-2xl md:text-3xl font-semibold mb-6 text-green-100">
                            Parapharmacie Gaher
                        </h2>
                        <p class="text-xl md:text-2xl mb-12 opacity-90 text-green-50">
                            Votre bien-être, notre mission naturelle
                        </p>
                        <div class="flex justify-center">
                            <button onclick="showPage('products')" class="bg-white text-emerald-600 hover:bg-green-50 text-lg px-10 py-5 rounded-xl font-bold transform hover:scale-105 transition-all shadow-lg">
                                <i class="fas fa-leaf mr-3"></i>
                                Explorer nos produits naturels
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="py-20 bg-gradient-to-b from-green-50 to-emerald-50">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Spécialités Santé</h2>
                        <p class="text-xl text-emerald-600 max-w-2xl mx-auto">
                            Découvrez nos gammes spécialisées pour votre bien-être quotidien
                        </p>
                    </div>
                    <div id="categoriesGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    </div>
                </div>
            </section>
            
            <section class="py-20 bg-gradient-to-b from-emerald-50 to-green-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Coups de Cœur</h2>
                        <p class="text-xl text-emerald-600">
                            Nos produits les plus appréciés par nos clients
                        </p>
                    </div>
                    <div id="featuredProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    </div>
                </div>
            </section>
            
            <section class="py-20 bg-gradient-to-b from-green-100 to-emerald-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Offres Spéciales</h2>
                        <p class="text-xl text-emerald-600">
                            Profitez de nos promotions exclusives
                        </p>
                    </div>
                    <div id="promotionProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    </div>
                </div>
            </section>
            
            <section class="py-20 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden">
                <div class="container mx-auto px-4 relative z-10">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-truck-fast text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Livraison Express</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Livraison rapide dans toute l'Algérie
                            </p>
                        </div>
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-certificate text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Qualité Certifiée</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Produits authentiques avec garantie qualité
                            </p>
                        </div>
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-user-md text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Conseil Expert</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Accompagnement par nos pharmaciens qualifiés
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        await this.loadCategories();
        await this.loadFeaturedProducts();
        await this.loadPromotionProducts();
    }
    
    async loadCategories() {
        const categories = [
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
            categoriesGrid.innerHTML = categories.map((category, index) => `
                <div class="category-card text-center cursor-pointer p-6 bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-200/50 ${index === 0 ? 'ring-2 ring-emerald-400' : ''}"
                     onclick="filterByCategory('${category.nom}')">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        <i class="fas ${category.icon} text-2xl"></i>
                    </div>
                    <h3 class="font-bold text-emerald-800 mb-2 text-sm lg:text-base">${category.nom}</h3>
                    <p class="text-xs lg:text-sm text-emerald-600 font-medium">${category.description}</p>
                    ${index === 0 ? '<div class="mt-2"><span class="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-semibold">★ POPULAIRE</span></div>' : ''}
                </div>
            `).join('');
        }
    }
    
    async loadFeaturedProducts() {
        try {
            let featuredProducts = [];
            
            // Try to get featured products from API
            try {
                const response = await apiCall('/products/featured/all');
                if (response && Array.isArray(response)) {
                    featuredProducts = response;
                }
            } catch (error) {
                console.log('Failed to load featured products from API, using all products filter');
                featuredProducts = this.allProducts.filter(p => p.enVedette && p.actif !== false);
            }
            
            const container = document.getElementById('featuredProducts');
            if (container) {
                if (featuredProducts.length === 0) {
                    container.innerHTML = `
                        <div class="col-span-full text-center py-16">
                            <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                            <p class="text-emerald-600 mb-8">Les produits mis en vedette apparaîtront ici</p>
                        </div>
                    `;
                } else {
                    container.innerHTML = featuredProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
                }
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }
    
    async loadPromotionProducts() {
        try {
            let promotionProducts = [];
            
            // Try to get promotion products from API
            try {
                const response = await apiCall('/products/promotions/all');
                if (response && Array.isArray(response)) {
                    promotionProducts = response;
                }
            } catch (error) {
                console.log('Failed to load promotion products from API, using all products filter');
                promotionProducts = this.allProducts.filter(p => p.enPromotion && p.actif !== false);
            }
            
            const container = document.getElementById('promotionProducts');
            if (container) {
                if (promotionProducts.length === 0) {
                    container.innerHTML = `
                        <div class="col-span-full text-center py-16">
                            <i class="fas fa-tags text-6xl text-red-300 mb-6"></i>
                            <h3 class="text-2xl font-bold text-red-800 mb-4">Aucune promotion active</h3>
                            <p class="text-red-600">Les promotions apparaîtront ici</p>
                        </div>
                    `;
                } else {
                    container.innerHTML = promotionProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
                }
            }
        } catch (error) {
            console.error('Error loading promotion products:', error);
        }
    }
    
    createProductCard(product) {
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        // Generate image URL
        let imageUrl;
        if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:image'))) {
            imageUrl = product.image;
        } else {
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            imageUrl = `https://via.placeholder.com/300x300/10b981/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        return `
            <div class="product-card bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 ${isOutOfStock ? 'opacity-75' : ''}"
                 onclick="showPage('product', {id: '${product._id}'})">
                ${hasPromotion ? `<div class="absolute top-4 left-4 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                    <span class="text-white font-bold text-lg">Rupture de stock</span>
                </div>` : ''}
                
                <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                         onerror="this.src='https://via.placeholder.com/300x300/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                </div>
                
                <div class="p-6">
                    <h3 class="font-bold text-emerald-800 mb-3 text-lg">${product.nom}</h3>
                    <p class="text-sm text-emerald-600 mb-4">${product.description || 'Description du produit'}</p>
                    
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
    
    async addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId, quantity);
            
            let product = this.allProducts.find(p => p._id === productId);
            
            if (!product) {
                // Try to fetch from API
                try {
                    product = await apiCall(`/products/${productId}`);
                } catch (error) {
                    this.showToast('Produit non trouvé', 'error');
                    return;
                }
            }
            
            if (product.stock === 0) {
                this.showToast('Ce produit est en rupture de stock', 'error');
                return;
            }
            
            if (quantity > product.stock) {
                this.showToast(`Stock insuffisant. Maximum disponible: ${product.stock}`, 'error');
                return;
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
                    image: product.image || `https://via.placeholder.com/64x64/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2))}`,
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
            <div class="flex items-center space-x-3 p-4 bg-white rounded-lg border border-emerald-100">
                <img src="${item.image}" alt="${item.nom}" 
                     class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                    <p class="text-sm text-emerald-600">${item.prix} DA</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite - 1})" 
                                class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200">-</button>
                        <span class="mx-2 font-medium">${item.quantite}</span>
                        <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite + 1})" 
                                class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200">+</button>
                        <button onclick="app.removeFromCart('${item.id}')" 
                                class="ml-2 text-red-500 hover:text-red-700">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.updateCartTotals();
        if (cartSummary) cartSummary.classList.remove('hidden');
    }
    
    updateCartTotals() {
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
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
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
                        
                        <form class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                                    <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Votre nom complet">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea rows="5" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" placeholder="Votre message..."></textarea>
                            </div>
                            
                            <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-bold">
                                Envoyer le message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Login and Registration pages (simplified)
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Connexion</h2>
                    <p class="text-center text-gray-600 mb-6">Connectez-vous à votre compte</p>
                    
                    <form id="loginForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="loginEmail" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" id="loginPassword" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-bold">
                            Se connecter
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Pas encore de compte? 
                            <a href="#" onclick="showPage('register')" class="text-emerald-600 hover:text-emerald-700 font-medium">S'inscrire</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await apiCall('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    this.currentUser = response.user;
                    this.updateUserUI();
                    this.showToast('Connexion réussie', 'success');
                    this.showPage('home');
                }
            } catch (error) {
                this.showToast('Email ou mot de passe incorrect', 'error');
            }
        });
    }
    
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Inscription</h2>
                    <p class="text-center text-gray-600 mb-6">Créez votre compte</p>
                    
                    <form id="registerForm" class="space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                <input type="text" id="registerPrenom" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                <input type="text" id="registerNom" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="registerEmail" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" id="registerPassword" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-bold">
                            S'inscrire
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Déjà un compte? 
                            <a href="#" onclick="showPage('login')" class="text-emerald-600 hover:text-emerald-700 font-medium">Se connecter</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add register form handler
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const prenom = document.getElementById('registerPrenom').value;
            const nom = document.getElementById('registerNom').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            try {
                const response = await apiCall('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ prenom, nom, email, password })
                });
                
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    this.currentUser = response.user;
                    this.updateUserUI();
                    this.showToast('Inscription réussie', 'success');
                    this.showPage('home');
                }
            } catch (error) {
                this.showToast(error.message || 'Erreur lors de l\'inscription', 'error');
            }
        });
    }
    
    // Placeholder for other pages
    async loadProductsPage(params = {}) {
        // This will be handled by products.js
        console.log('Loading products page with params:', params);
        // For now, show a simple message
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-emerald-800 mb-8">Nos Produits</h1>
                <div class="text-center py-16">
                    <p class="text-gray-600">Page des produits en cours de chargement...</p>
                </div>
            </div>
        `;
    }
    
    async loadProductPage(productId) {
        console.log('Loading product page for:', productId);
        // This will be handled by products.js
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-emerald-800 mb-8">Détail du Produit</h1>
                <div class="text-center py-16">
                    <p class="text-gray-600">Détails du produit en cours de chargement...</p>
                </div>
            </div>
        `;
    }
    
    async loadAdminPage() {
        console.log('Loading admin page');
        // This will be handled by admin.js
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-emerald-800 mb-8">Administration</h1>
                <div class="text-center py-16">
                    <p class="text-gray-600">Panel d'administration en cours de chargement...</p>
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
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${this.getToastClasses(type)}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getToastIcon(type)} mr-3"></i>
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current opacity-70 hover:opacity-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
    
    getToastClasses(type) {
        const classes = {
            'info': 'bg-blue-500 text-white',
            'success': 'bg-green-500 text-white',
            'error': 'bg-red-500 text-white',
            'warning': 'bg-yellow-500 text-white'
        };
        return classes[type] || classes.info;
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
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏥 Initializing Shifa Parapharmacie App...');
    app = new PharmacieGaherApp();
    window.app = app; // Make globally available
    
    // Test backend connection
    setTimeout(testBackendConnection, 2000);
    
    console.log('✅ App ready!');
});

console.log('✅ Main app.js loaded successfully');
