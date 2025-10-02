// Complete PharmacieGaherApp - FULL VERSION with all methods
class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.allProducts = [];
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
            console.log('⚠️ Continuing with limited functionality...');
        }
    }
    
    async loadProductsCache() {
        try {
            console.log('Loading products cache...');
            
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            this.allProducts = [...localProducts];
            
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
                console.log('⚠️ API unavailable, using local products only');
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
        
        if (!token) {
            console.log('No token found - user not authenticated');
            this.currentUser = null;
            this.updateUserUI();
            return;
        }
        
        try {
            console.log('🔍 Checking authentication...');
            const response = await fetch(buildApiUrl('/auth/profile'), {
                headers: { 
                    'x-auth-token': token,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('✅ User authenticated:', this.currentUser.email);
                this.updateUserUI();
            } else {
                console.log('⚠️ Token invalid - clearing');
                localStorage.removeItem('token');
                this.currentUser = null;
                this.updateUserUI();
            }
        } catch (error) {
            console.log('⚠️ Auth check failed - clearing token');
            localStorage.removeItem('token');
            this.currentUser = null;
            this.updateUserUI();
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
            
            <section class="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Catégories</h2>
                        <p class="text-xl text-emerald-600">Découvrez notre gamme complète de produits</p>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="categoriesGrid"></div>
                </div>
            </section>
            
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Coups de Cœur</h2>
                        <p class="text-xl text-emerald-600">Produits sélectionnés pour vous</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="featuredProducts"></div>
                </div>
            </section>
            
            <section class="py-16 bg-gradient-to-br from-red-50 to-pink-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-red-800 mb-4">Promotions</h2>
                        <p class="text-xl text-red-600">Offres spéciales et réductions</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="promotionProducts"></div>
                </div>
            </section>
        `;
        
        await this.loadCategories();
        await this.loadFeaturedProducts();
        await this.loadPromotionProducts();
    }
    
    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        let filteredProducts = [...this.allProducts];
        
        if (params.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm)
            );
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">
                        ${params.categorie ? params.categorie : params.search ? `Résultats pour "${params.search}"` : 'Tous nos produits'}
                    </h1>
                    <p class="text-emerald-600">${filteredProducts.length} produit(s) trouvé(s)</p>
                </div>
                
                ${filteredProducts.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                        <button onclick="app.showPage('home')" class="btn-primary">
                            Retour à l'accueil
                        </button>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${filteredProducts.map(product => this.createProductCard(product)).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    async loadProductPage(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        <div>
                            <img src="${product.image || 'https://via.placeholder.com/500'}" 
                                 alt="${product.nom}" 
                                 class="w-full h-auto rounded-xl">
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                            <p class="text-emerald-600 mb-4">${product.description}</p>
                            <div class="text-3xl font-bold text-emerald-700 mb-6">${product.prix} DA</div>
                            <button onclick="app.addToCart('${product._id}')" class="btn-primary w-full py-4 text-lg">
                                <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h1 class="text-3xl font-bold text-emerald-800 mb-6 text-center">Connexion</h1>
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="loginEmail" required class="form-input w-full" placeholder="votre@email.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" id="loginPassword" required class="form-input w-full" placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn-primary w-full">Se connecter</button>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const data = await loginUser(email, password);
                this.currentUser = data.user;
                this.updateUserUI();
                this.showToast('Connexion réussie', 'success');
                this.showPage('home');
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }
    
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h1 class="text-3xl font-bold text-emerald-800 mb-6 text-center">Inscription</h1>
                    <form id="registerForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                <input type="text" id="registerPrenom" required class="form-input w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                <input type="text" id="registerNom" required class="form-input w-full">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="registerEmail" required class="form-input w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                            <input type="tel" id="registerTelephone" required class="form-input w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" id="registerPassword" required class="form-input w-full">
                        </div>
                        <button type="submit" class="btn-primary w-full">S'inscrire</button>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                prenom: document.getElementById('registerPrenom').value,
                nom: document.getElementById('registerNom').value,
                email: document.getElementById('registerEmail').value,
                telephone: document.getElementById('registerTelephone').value,
                motDePasse: document.getElementById('registerPassword').value
            };
            
            try {
                const data = await registerUser(userData);
                this.currentUser = data.user;
                this.updateUserUI();
                this.showToast('Inscription réussie', 'success');
                this.showPage('home');
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }
    
    async loadProfilePage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <h1 class="text-3xl font-bold text-emerald-800 mb-6">Mon Profil</h1>
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="space-y-4">
                        <p><strong>Nom:</strong> ${this.currentUser.prenom} ${this.currentUser.nom}</p>
                        <p><strong>Email:</strong> ${this.currentUser.email}</p>
                        <p><strong>Rôle:</strong> ${this.currentUser.role}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadCheckoutPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-emerald-800 mb-6">Finaliser la commande</h1>
                <div id="checkoutContent"></div>
            </div>
        `;
        
        if (typeof initCheckout === 'function') {
            initCheckout();
        }
    }
    
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl text-center">
                <div class="bg-white rounded-2xl shadow-xl p-12">
                    <i class="fas fa-check-circle text-6xl text-green-500 mb-6"></i>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600 mb-8">Numéro de commande: ${orderNumber}</p>
                    <button onclick="app.showPage('home')" class="btn-primary">
                        Retour à l'accueil
                    </button>
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
        const featuredProducts = this.allProducts.filter(p => p.enVedette && p.actif !== false);
        const container = document.getElementById('featuredProducts');
        
        if (container) {
            if (featuredProducts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                    </div>
                `;
            } else {
                container.innerHTML = featuredProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
            }
        }
    }
    
    async loadPromotionProducts() {
        const promotionProducts = this.allProducts.filter(p => p.enPromotion && p.actif !== false);
        const container = document.getElementById('promotionProducts');
        
        if (container) {
            if (promotionProducts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-tags text-6xl text-red-300 mb-6"></i>
                        <h3 class="text-2xl font-bold text-red-800 mb-4">Aucune promotion active</h3>
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
        
        let imageUrl = product.image || 'https://via.placeholder.com/300';
        
        return `
            <div class="product-card bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 ${isOutOfStock ? 'opacity-75' : ''}"
                 onclick="app.showPage('product', {id: '${product._id}'})">
                ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-20">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                    <span class="text-white font-bold text-lg">Rupture de stock</span>
                </div>` : ''}
                
                <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
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
    
    async addToCart(productId, quantity = 1) {
        try {
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
                    image: product.image || 'https://via.placeholder.com/64',
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
            </div>
        `;
    }
    
    async loadAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès refusé', 'error');
            this.showPage('home');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-2">Panel d'Administration</h1>
                    <p class="text-emerald-600 text-lg">Gestion complète de Shifa - Parapharmacie</p>
                </div>
                
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
                
                <div id="adminContent" class="min-h-96"></div>
            </div>
        `;
        
        await this.loadAdminDashboard();
    }
    
    async loadAdminDashboard() {
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const products = this.allProducts;
        
        let stats = {
            totalProducts: products.length,
            totalOrders: adminOrders.length,
            pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
            totalUsers: 1,
            monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        };
        
        document.getElementById('adminContent').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <p class="text-sm font-semibold text-blue-600 uppercase">Produits</p>
                    <p class="text-3xl font-bold text-blue-800">${stats.totalProducts}</p>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
                    <p class="text-sm font-semibold text-green-600 uppercase">Commandes</p>
                    <p class="text-3xl font-bold text-green-800">${stats.totalOrders}</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                    <p class="text-sm font-semibold text-yellow-600 uppercase">En attente</p>
                    <p class="text-3xl font-bold text-yellow-800">${stats.pendingOrders}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
                    <p class="text-sm font-semibold text-purple-600 uppercase">Revenus</p>
                    <p class="text-3xl font-bold text-purple-800">${stats.monthlyRevenue} DA</p>
                </div>
            </div>
        `;
    }
    
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('hidden');
    }
    
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('hidden');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
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
                if (toast.parentElement) toast.remove();
            }, 5000);
        }
    }
}

// Global functions
function addToCartFromCard(productId, quantity = 1) {
    if (window.app) window.app.addToCart(productId, quantity);
}

function showPage(page, params) {
    if (window.app) window.app.showPage(page, params);
}

function filterByCategory(category) {
    if (window.app) window.app.filterByCategory(category);
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) mobileMenu.classList.toggle('hidden');
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
    if (window.app) {
        window.app.showToast('Message envoyé avec succès !', 'success');
    }
}

function logout() {
    if (window.app) window.app.logout();
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('✅ App initialized successfully');
});

console.log('✅ Complete app.js loaded with ALL page methods');
