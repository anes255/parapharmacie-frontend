// Complete PharmacieGaherApp - Fixed version with localStorage cleanup

class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.allProducts = [];
        this.adminCurrentSection = 'dashboard';
        this.currentEditingProduct = null;
        this.settings = {
            couleurPrimaire: '#10b981',
            couleurSecondaire: '#059669',
            couleurAccent: '#34d399',
            nomSite: 'Pharmacie Gaher',
            descriptionSite: 'Votre parapharmacie de confiance',
            adresse: '123 Rue de la Santé, Alger',
            telephone: '0555 123 456',
            email: 'contact@pharmaciegaher.com',
            horaires: 'Lun-Sam: 9h-19h, Dim: 10h-18h',
            fraisLivraison: 300,
            fraisLivraisonGratuite: 5000,
            tva: 0.20
        };
        
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        console.log('App initialized with API URL:', this.apiUrl);
        
        this.init();
    }

    async init() {
        try {
            // Clean up localStorage on init
            this.performStartupCleanup();
            
            // Load cart safely
            this.loadCart();
            
            await this.checkAuth();
            await this.loadSettings();
            await this.loadProducts();
            this.updateCartUI();
            this.initializeEventListeners();
            this.showPage('home');
            
            console.log('✅ App fully initialized');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleError(error);
        }
    }

    // CRITICAL: Startup cleanup to prevent quota issues
    performStartupCleanup() {
        try {
            console.log('🧹 Performing startup cleanup...');
            
            // Keep only last 10 admin orders
            const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            if (orders.length > 10) {
                localStorage.setItem('adminOrders', JSON.stringify(orders.slice(0, 10)));
                console.log(`✅ Cleaned adminOrders: ${orders.length} → 10`);
            }
            
            // Keep only last 30 products
            const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            if (products.length > 30) {
                localStorage.setItem('demoProducts', JSON.stringify(products.slice(0, 30)));
                console.log(`✅ Cleaned demoProducts: ${products.length} → 30`);
            }
            
            // Clean old user orders (older than 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('userOrders_')) {
                    try {
                        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
                        const recentOrders = userOrders.filter(order => {
                            const orderDate = new Date(order.dateCommande);
                            return orderDate > thirtyDaysAgo;
                        });
                        
                        if (recentOrders.length < userOrders.length) {
                            localStorage.setItem(key, JSON.stringify(recentOrders.slice(0, 10)));
                            console.log(`✅ Cleaned ${key}`);
                        }
                    } catch (e) {
                        console.error(`Error cleaning ${key}:`, e);
                    }
                }
            }
            
            console.log('✅ Startup cleanup completed');
        } catch (error) {
            console.error('Error during startup cleanup:', error);
        }
    }

    // Load cart safely with error handling
    loadCart() {
        try {
            const cartData = localStorage.getItem('cart');
            this.cart = cartData ? JSON.parse(cartData) : [];
            console.log('Cart loaded:', this.cart.length, 'items');
        } catch (error) {
            console.error('Error loading cart, clearing corrupted data:', error);
            localStorage.removeItem('cart');
            this.cart = [];
        }
    }

    // FIXED: Save cart with automatic cleanup on quota error
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'cart',
                newValue: JSON.stringify(this.cart)
            }));
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ LocalStorage quota exceeded! Performing emergency cleanup...');
                
                // EMERGENCY CLEANUP
                try {
                    // 1. Clear admin orders (keep only 5)
                    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                    if (orders.length > 5) {
                        localStorage.setItem('adminOrders', JSON.stringify(orders.slice(0, 5)));
                        console.log(`✅ Emergency: Cleaned adminOrders ${orders.length} → 5`);
                    }
                    
                    // 2. Clear demo products (keep only 20)
                    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
                    if (products.length > 20) {
                        localStorage.setItem('demoProducts', JSON.stringify(products.slice(0, 20)));
                        console.log(`✅ Emergency: Cleaned demoProducts ${products.length} → 20`);
                    }
                    
                    // 3. Clear ALL user orders
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('userOrders_')) {
                            localStorage.removeItem(key);
                            console.log(`✅ Emergency: Removed ${key}`);
                        }
                    }
                    
                    // 4. Try to save cart again
                    localStorage.setItem('cart', JSON.stringify(this.cart));
                    console.log('✅ Cart saved after emergency cleanup');
                    
                    this.showToast('Nettoyage automatique effectué', 'info');
                    
                } catch (retryError) {
                    console.error('❌ Still cannot save cart after cleanup');
                    this.showToast('Erreur: Mémoire pleine. Veuillez vider votre panier.', 'error');
                }
            } else {
                console.error('Error saving cart:', error);
                this.showToast('Erreur lors de la sauvegarde du panier', 'error');
            }
        }
    }

    // Authentication methods
    async checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            this.currentUser = null;
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/auth/verify`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                this.currentUser = await response.json();
                console.log('User authenticated:', this.currentUser);
            } else {
                localStorage.removeItem('authToken');
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.currentUser = null;
        }
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiUrl}/api/settings`);
            if (response.ok) {
                const data = await response.json();
                this.settings = { ...this.settings, ...data };
            }
        } catch (error) {
            console.log('Using default settings');
        }
    }

    async loadProducts() {
        try {
            // Try to load from API first
            const response = await fetch(`${this.apiUrl}/api/products`);
            if (response.ok) {
                const data = await response.json();
                this.allProducts = data.products || [];
                
                // Save to localStorage for offline use
                localStorage.setItem('demoProducts', JSON.stringify(this.allProducts));
                console.log('Products loaded from API:', this.allProducts.length);
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            // Fallback to localStorage
            console.log('Loading products from localStorage');
            const localProducts = localStorage.getItem('demoProducts');
            this.allProducts = localProducts ? JSON.parse(localProducts) : [];
            console.log('Products loaded from localStorage:', this.allProducts.length);
        }
    }

    refreshProductsCache() {
        this.loadProducts();
    }

    initializeEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-page]');
            if (navLink) {
                e.preventDefault();
                const page = navLink.dataset.page;
                this.showPage(page);
            }
        });

        // Cart toggle
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                if (window.cartSystem) {
                    window.cartSystem.toggle();
                }
            });
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    showPage(page, params = {}) {
        console.log('Showing page:', page);

        // Update URL without reload
        history.pushState({ page, params }, '', `#${page}`);

        // Hide all pages
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => p.classList.add('hidden'));

        // Show requested page
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }

        // Update navigation
        this.updateNavigation(page);

        // Load page-specific content
        switch (page) {
            case 'home':
                this.loadHomePage();
                break;
            case 'products':
                this.loadProductsPage();
                break;
            case 'product':
                if (params.id) {
                    this.loadProductPage(params.id);
                }
                break;
            case 'checkout':
                this.loadCheckoutPage();
                break;
            case 'admin':
                this.loadAdminPage();
                break;
            case 'login':
                this.loadLoginPage();
                break;
            case 'register':
                this.loadRegisterPage();
                break;
            case 'profile':
                this.loadProfilePage();
                break;
            case 'order-confirmation':
                this.loadOrderConfirmationPage(params);
                break;
            default:
                this.loadHomePage();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    updateNavigation(currentPage) {
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            const page = link.dataset.page;
            if (page === currentPage) {
                link.classList.add('active', 'text-emerald-600', 'font-semibold');
            } else {
                link.classList.remove('active', 'text-emerald-600', 'font-semibold');
            }
        });
    }

    loadHomePage() {
        // Load featured products
        const featuredProducts = this.allProducts.filter(p => p.enVedette).slice(0, 8);
        this.renderFeaturedProducts(featuredProducts);
    }

    renderFeaturedProducts(products) {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit en vedette</p>';
            return;
        }

        container.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }

    loadProductsPage() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (this.allProducts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit disponible</p>';
            return;
        }

        container.innerHTML = this.allProducts.map(product => this.renderProductCard(product)).join('');
    }

    renderProductCard(product) {
        const imageUrl = product.image || this.generatePlaceholderImage(product);
        
        return `
            <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-emerald-100">
                <div class="relative">
                    <img src="${imageUrl}" 
                         alt="${product.nom}" 
                         class="w-full h-48 object-cover"
                         onerror="this.src='${this.generatePlaceholderImage(product)}'">
                    ${product.enVedette ? '<span class="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">★ Vedette</span>' : ''}
                    ${product.enPromotion ? `<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">-${product.pourcentagePromotion || 10}%</span>` : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${product.nom}</h3>
                    <p class="text-sm text-gray-600 mb-3">${product.marque || 'Sans marque'}</p>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            ${product.enPromotion && product.prixOriginal ? `
                                <span class="text-gray-400 line-through text-sm">${product.prixOriginal} DA</span>
                                <span class="text-emerald-600 font-bold text-lg ml-2">${product.prix} DA</span>
                            ` : `
                                <span class="text-emerald-600 font-bold text-lg">${product.prix} DA</span>
                            `}
                        </div>
                        <span class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                            ${product.stock > 0 ? `En stock (${product.stock})` : 'Rupture'}
                        </span>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button onclick="app.addToCart('${product._id}')" 
                                class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-md"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart mr-2"></i>Ajouter
                        </button>
                        <button onclick="app.showPage('product', {id: '${product._id}'})" 
                                class="bg-white border-2 border-emerald-500 text-emerald-600 py-2 px-4 rounded-lg hover:bg-emerald-50 transition-all">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generatePlaceholderImage(product) {
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
        return `https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }

    loadProductPage(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }

        const container = document.getElementById('productDetail');
        if (!container) return;

        const imageUrl = product.image || this.generatePlaceholderImage(product);

        container.innerHTML = `
            <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    <div>
                        <img src="${imageUrl}" 
                             alt="${product.nom}" 
                             class="w-full rounded-xl shadow-lg"
                             onerror="this.src='${this.generatePlaceholderImage(product)}'">
                    </div>
                    
                    <div class="space-y-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 mb-2">${product.nom}</h1>
                            <p class="text-lg text-gray-600">${product.marque || 'Sans marque'}</p>
                            <span class="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                                ${product.categorie}
                            </span>
                        </div>
                        
                        <div class="border-t border-b border-gray-200 py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    ${product.enPromotion && product.prixOriginal ? `
                                        <span class="text-gray-400 line-through text-xl">${product.prixOriginal} DA</span>
                                        <span class="text-emerald-600 font-bold text-3xl ml-3">${product.prix} DA</span>
                                    ` : `
                                        <span class="text-emerald-600 font-bold text-3xl">${product.prix} DA</span>
                                    `}
                                </div>
                                <span class="text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                                    ${product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
                            <p class="text-gray-700">${product.description || 'Aucune description disponible'}</p>
                        </div>
                        
                        ${product.ingredients ? `
                            <div>
                                <h3 class="font-semibold text-gray-900 mb-2">Ingrédients</h3>
                                <p class="text-gray-700">${product.ingredients}</p>
                            </div>
                        ` : ''}
                        
                        ${product.modeEmploi ? `
                            <div>
                                <h3 class="font-semibold text-gray-900 mb-2">Mode d'emploi</h3>
                                <p class="text-gray-700">${product.modeEmploi}</p>
                            </div>
                        ` : ''}
                        
                        <div class="flex space-x-4">
                            <button onclick="app.addToCart('${product._id}')" 
                                    class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg text-lg font-semibold"
                                    ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart mr-2"></i>Ajouter au panier
                            </button>
                            <button onclick="app.showPage('products')" 
                                    class="bg-white border-2 border-emerald-500 text-emerald-600 py-3 px-6 rounded-xl hover:bg-emerald-50 transition-all">
                                <i class="fas fa-arrow-left mr-2"></i>Retour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadCheckoutPage() {
        // Initialize checkout system
        if (window.initCheckout) {
            window.initCheckout();
        }
    }

    loadLoginPage() {
        // Login page content
        console.log('Login page loaded');
    }

    loadRegisterPage() {
        // Register page content
        console.log('Register page loaded');
    }

    loadProfilePage() {
        // Profile page content
        console.log('Profile page loaded');
    }

    loadOrderConfirmationPage(params) {
        const container = document.getElementById('orderConfirmation');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center">
                <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check text-green-600 text-4xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
                <p class="text-xl text-gray-600 mb-6">Numéro de commande: <strong>${params.orderNumber || 'N/A'}</strong></p>
                <p class="text-gray-700 mb-8">Merci pour votre commande. Vous recevrez un email de confirmation sous peu.</p>
                <div class="flex justify-center space-x-4">
                    <button onclick="app.showPage('home')" 
                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                        Retour à l'accueil
                    </button>
                    <button onclick="app.showPage('products')" 
                            class="bg-white border-2 border-emerald-500 text-emerald-600 py-3 px-8 rounded-xl hover:bg-emerald-50 transition-all">
                        Continuer vos achats
                    </button>
                </div>
            </div>
        `;
    }

    loadAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès refusé', 'error');
            this.showPage('home');
            return;
        }

        this.loadAdminDashboard();
    }

    loadAdminDashboard() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        const stats = this.getAdminStats();

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm font-medium">Total Produits</p>
                            <p class="text-3xl font-bold mt-2">${stats.totalProducts}</p>
                        </div>
                        <i class="fas fa-boxes text-4xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm font-medium">Commandes</p>
                            <p class="text-3xl font-bold mt-2">${stats.totalOrders}</p>
                        </div>
                        <i class="fas fa-shopping-cart text-4xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm font-medium">En Vedette</p>
                            <p class="text-3xl font-bold mt-2">${stats.featuredProducts}</p>
                        </div>
                        <i class="fas fa-star text-4xl text-purple-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100 text-sm font-medium">Stock Faible</p>
                            <p class="text-3xl font-bold mt-2">${stats.lowStock}</p>
                        </div>
                        <i class="fas fa-exclamation-triangle text-4xl text-orange-200"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Bienvenue dans le panneau d'administration</h3>
                <p class="text-gray-600">Utilisez le menu latéral pour gérer vos produits, commandes et paramètres.</p>
            </div>
        `;
    }

    getAdminStats() {
        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const products = this.allProducts;

        return {
            totalProducts: products.length,
            totalOrders: orders.length,
            featuredProducts: products.filter(p => p.enVedette).length,
            lowStock: products.filter(p => p.stock < 10).length
        };
    }

    // FIXED: Add to cart with proper error handling
    addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId, quantity);

            const product = this.allProducts.find(p => p._id === productId);
            if (!product) {
                throw new Error('Produit non trouvé');
            }

            if (product.stock === 0) {
                throw new Error('Ce produit est en rupture de stock');
            }

            if (quantity > product.stock) {
                throw new Error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
            }

            const existingIndex = this.cart.findIndex(item => item.id === productId);

            if (existingIndex > -1) {
                const newQuantity = this.cart[existingIndex].quantite + quantity;
                
                if (newQuantity > product.stock) {
                    throw new Error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
                }

                this.cart[existingIndex].quantite = newQuantity;
            } else {
                const cartItem = {
                    id: product._id,
                    nom: product.nom,
                    prix: product.prix,
                    image: product.image || this.generatePlaceholderImage(product),
                    quantite: quantity,
                    stock: product.stock,
                    categorie: product.categorie,
                    marque: product.marque || ''
                };

                this.cart.push(cartItem);
            }

            this.saveCart();
            this.updateCartUI();
            this.showToast(`${product.nom} ajouté au panier`, 'success');

            console.log('✅ Product added to cart successfully');
            return true;

        } catch (error) {
            console.error('❌ Erreur ajout au panier:', error);
            this.showToast(error.message, 'error');
            return false;
        }
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartUI();
            this.showToast(`${item.nom} retiré du panier`, 'success');
            return true;
        }
        
        return false;
    }

    updateCartQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return false;
        }

        if (newQuantity <= 0) {
            return this.removeFromCart(productId);
        }

        const item = this.cart[itemIndex];

        if (newQuantity > item.stock) {
            this.showToast(`Stock insuffisant. Maximum disponible: ${item.stock}`, 'error');
            return false;
        }

        item.quantite = newQuantity;
        this.saveCart();
        this.updateCartUI();
        
        return true;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showToast('Panier vidé', 'success');
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    }

    updateCartUI() {
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
            cartCount.textContent = totalItems;
        }

        // Update cart system if available
        if (window.cartSystem) {
            window.cartSystem.cart = this.cart;
            window.cartSystem.updateUI();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.loadProductsPage();
            return;
        }

        const filtered = this.allProducts.filter(product => 
            product.nom.toLowerCase().includes(query.toLowerCase()) ||
            product.categorie.toLowerCase().includes(query.toLowerCase()) ||
            (product.marque && product.marque.toLowerCase().includes(query.toLowerCase()))
        );

        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit trouvé</p>';
            return;
        }

        container.innerHTML = filtered.map(product => this.renderProductCard(product)).join('');
    }

    processOrder() {
        if (window.checkoutSystem) {
            return window.checkoutSystem.processOrder();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    handleError(error) {
        console.error('App error:', error);
        this.showToast('Une erreur est survenue', 'error');
    }
}

// Global functions for easy access
function addToCartFromCard(productId) {
    console.log('Add to cart from card called:', productId);
    if (window.app) {
        window.app.addToCart(productId);
    }
}

// Initialize app
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new PharmacieGaherApp();
        window.app = app;
        console.log('✅ App initialized on DOMContentLoaded');
    });
} else {
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('✅ App initialized immediately');
}

// Export for global access
window.addToCartFromCard = addToCartFromCard;

console.log('✅ Complete app.js loaded successfully');
