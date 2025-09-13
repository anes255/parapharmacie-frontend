// Complete Fixed PharmacieGaherApp - Full File Replacement
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
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="categoriesGrid">
                    </div>
                </div>
            </section>
            
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-emerald-800 mb-4">Nos Coups de Cœur</h2>
                        <p class="text-xl text-emerald-600">Produits sélectionnés pour vous</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="featuredProducts">
                    </div>
                </div>
            </section>
            
            <section class="py-16 bg-gradient-to-br from-red-50 to-pink-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-red-800 mb-4">Promotions</h2>
                        <p class="text-xl text-red-600">Offres spéciales et réductions</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="promotionProducts">
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
    
    // CHECKOUT PAGE - FIXED
    async loadCheckoutPage() {
        const mainContent = document.getElementById('mainContent');
        
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('home');
            return;
        }
        
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8">
                <div class="container mx-auto px-4 max-w-6xl">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Finaliser votre commande</h1>
                        <p class="text-xl text-emerald-600">Vérifiez vos informations et validez votre achat</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-6 mb-6">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-shopping-cart mr-3"></i>
                                    Vos articles (${this.cart.reduce((sum, item) => sum + item.quantite, 0)})
                                </h2>
                                
                                <div class="space-y-4">
                                    ${this.cart.map(item => `
                                        <div class="flex items-center space-x-4 p-4 bg-emerald-50 rounded-2xl">
                                            <img src="${item.image}" alt="${item.nom}" 
                                                 class="w-20 h-20 object-cover rounded-xl">
                                            <div class="flex-1">
                                                <h3 class="font-bold text-emerald-800">${item.nom}</h3>
                                                <p class="text-emerald-600">Quantité: ${item.quantite}</p>
                                                <p class="text-emerald-700 font-semibold">${item.prix} DA x ${item.quantite} = ${item.prix * item.quantite} DA</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-6">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-truck mr-3"></i>
                                    Informations de livraison
                                </h2>
                                
                                <form id="checkoutForm" onsubmit="handleCheckout(event)" class="space-y-4">
                                    ${this.currentUser ? `
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                                                <input type="text" name="nomComplet" 
                                                       value="${this.currentUser.prenom} ${this.currentUser.nom}" 
                                                       required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                                                <input type="tel" name="telephone" 
                                                       value="${this.currentUser.telephone || ''}" 
                                                       required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input type="email" name="email" 
                                                   value="${this.currentUser.email}" 
                                                   required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse de livraison</label>
                                            <textarea name="adresse" rows="3" required 
                                                      class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                                      placeholder="Adresse complète avec ville et wilaya">${this.currentUser.adresse || ''}</textarea>
                                        </div>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                                                <input type="text" name="ville" 
                                                       value="${this.currentUser.ville || ''}" 
                                                       required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya</label>
                                                <input type="text" name="wilaya" 
                                                       value="${this.currentUser.wilaya || ''}" 
                                                       required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                        </div>
                                    ` : `
                                        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                                            <i class="fas fa-user-plus text-yellow-600 text-3xl mb-4"></i>
                                            <h3 class="font-bold text-yellow-800 mb-2">Connexion recommandée</h3>
                                            <p class="text-yellow-700 mb-4">Connectez-vous pour un checkout plus rapide</p>
                                            <button type="button" onclick="app.showPage('login')" 
                                                    class="bg-yellow-500 text-white px-6 py-2 rounded-xl hover:bg-yellow-600 transition-all">
                                                Se connecter
                                            </button>
                                        </div>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom complet *</label>
                                                <input type="text" name="nomComplet" required 
                                                       class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                                <input type="tel" name="telephone" required 
                                                       class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                            <input type="email" name="email" required 
                                                   class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse de livraison *</label>
                                            <textarea name="adresse" rows="3" required 
                                                      class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                                      placeholder="Adresse complète avec ville et wilaya"></textarea>
                                        </div>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Ville *</label>
                                                <input type="text" name="ville" required 
                                                       class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                                <input type="text" name="wilaya" required 
                                                       class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            </div>
                                        </div>
                                    `}
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Notes de commande (optionnel)</label>
                                        <textarea name="notes" rows="2" 
                                                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                                  placeholder="Instructions spéciales de livraison..."></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-1">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-6 sticky top-4">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-receipt mr-3"></i>
                                    Récapitulatif
                                </h2>
                                
                                <div class="space-y-4 mb-6">
                                    <div class="flex justify-between items-center text-emerald-700">
                                        <span>Sous-total:</span>
                                        <span class="font-semibold">${sousTotal} DA</span>
                                    </div>
                                    
                                    <div class="flex justify-between items-center text-emerald-700">
                                        <span>Frais de livraison:</span>
                                        <span class="font-semibold ${fraisLivraison === 0 ? 'text-green-600' : ''}">${fraisLivraison} DA ${fraisLivraison === 0 ? '(Gratuite!)' : ''}</span>
                                    </div>
                                    
                                    ${sousTotal < 5000 && fraisLivraison > 0 ? `
                                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                        <p class="text-sm text-blue-700">
                                            <i class="fas fa-info-circle mr-2"></i>
                                            Livraison gratuite dès 5000 DA
                                        </p>
                                    </div>
                                    ` : ''}
                                    
                                    <hr class="border-emerald-200">
                                    
                                    <div class="flex justify-between items-center font-bold text-xl text-emerald-800">
                                        <span>Total:</span>
                                        <span>${total} DA</span>
                                    </div>
                                </div>
                                
                                <div class="space-y-4">
                                    <button type="submit" form="checkoutForm" id="checkoutSubmitBtn"
                                            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50">
                                        <span id="checkoutSubmitText">
                                            <i class="fas fa-credit-card mr-2"></i>
                                            Confirmer la commande
                                        </span>
                                        <div id="checkoutSpinner" class="hidden flex items-center justify-center">
                                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Traitement...
                                        </div>
                                    </button>
                                    
                                    <button type="button" onclick="app.showPage('home')" 
                                            class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all">
                                        <i class="fas fa-arrow-left mr-2"></i>
                                        Continuer les achats
                                    </button>
                                </div>
                                
                                <div class="mt-6 p-4 bg-emerald-50 rounded-2xl">
                                    <h4 class="font-semibold text-emerald-800 mb-2 flex items-center">
                                        <i class="fas fa-shield-alt mr-2"></i>
                                        Mode de paiement
                                    </h4>
                                    <p class="text-sm text-emerald-700">
                                        Paiement à la livraison (espèces uniquement)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ORDER CONFIRMATION PAGE - FIXED
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-8">
                <div class="max-w-2xl mx-auto px-4">
                    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 text-center">
                        <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-check text-white text-3xl"></i>
                        </div>
                        
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                        <p class="text-xl text-emerald-600 mb-6">Merci pour votre confiance</p>
                        
                        <div class="bg-emerald-50 rounded-2xl p-6 mb-6">
                            <h2 class="font-bold text-emerald-800 mb-2">Numéro de commande</h2>
                            <p class="text-2xl font-bold text-emerald-700">${orderNumber}</p>
                        </div>
                        
                        <div class="space-y-4 text-left mb-8">
                            <div class="flex items-start space-x-4">
                                <i class="fas fa-truck text-emerald-500 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold text-emerald-800">Livraison</h3>
                                    <p class="text-emerald-600">Votre commande sera livrée sous 24-48h</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start space-x-4">
                                <i class="fas fa-phone text-emerald-500 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold text-emerald-800">Contact</h3>
                                    <p class="text-emerald-600">Nous vous contacterons pour confirmer la livraison</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start space-x-4">
                                <i class="fas fa-money-bill text-emerald-500 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold text-emerald-800">Paiement</h3>
                                    <p class="text-emerald-600">Paiement à la livraison (espèces)</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4">
                            <button onclick="app.showPage('home')" 
                                    class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                                <i class="fas fa-home mr-2"></i>
                                Retour à l'accueil
                            </button>
                            
                            <button onclick="app.showPage('products')" 
                                    class="flex-1 bg-white text-emerald-600 font-semibold py-3 px-6 rounded-xl border-2 border-emerald-200 hover:bg-emerald-50 transition-all">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Continuer les achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // PRODUCTS PAGE - FIXED
    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        this.showLoading();
        
        try {
            let products = [...this.allProducts];
            let pageTitle = 'Nos Produits';
            let subtitle = 'Découvrez notre gamme complète';
            
            if (params.categorie) {
                products = products.filter(p => p.categorie === params.categorie);
                pageTitle = `Catégorie: ${params.categorie}`;
                subtitle = `Produits de la catégorie ${params.categorie}`;
            }
            
            if (params.search) {
                const searchTerm = params.search.toLowerCase();
                products = products.filter(p => 
                    p.nom.toLowerCase().includes(searchTerm) ||
                    p.description.toLowerCase().includes(searchTerm) ||
                    (p.marque && p.marque.toLowerCase().includes(searchTerm))
                );
                pageTitle = `Recherche: "${params.search}"`;
                subtitle = `${products.length} résultat(s) trouvé(s)`;
            }
            
            products = products.filter(p => p.actif !== false);
            
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">${pageTitle}</h1>
                        <p class="text-xl text-emerald-600">${subtitle}</p>
                    </div>
                    
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex flex-wrap items-center gap-4">
                                <button onclick="app.showPage('products')" 
                                        class="px-4 py-2 rounded-xl ${!params.categorie ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-emerald-600 hover:text-white transition-all">
                                    Tous les produits
                                </button>
                                
                                ${['Vitalité', 'Sport', 'Visage', 'Cheveux'].map(cat => `
                                    <button onclick="app.filterByCategory('${cat}')" 
                                            class="px-4 py-2 rounded-xl ${params.categorie === cat ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-emerald-600 hover:text-white transition-all">
                                        ${cat}
                                    </button>
                                `).join('')}
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                <span class="text-emerald-600 font-semibold">${products.length} produits</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="productsGrid">
                        ${products.length > 0 ? 
                            products.map(product => this.createProductCard(product)).join('') :
                            `<div class="col-span-full text-center py-16">
                                <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                                <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                                <p class="text-emerald-600 mb-8">Essayez une autre recherche ou catégorie</p>
                                <button onclick="app.showPage('products')" 
                                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                                    Voir tous les produits
                                </button>
                            </div>`
                        }
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading products page:', error);
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <h3 class="text-xl font-bold text-red-800 mb-2">Erreur de chargement</h3>
                        <p class="text-red-600">Impossible de charger les produits</p>
                    </div>
                </div>
            `;
        } finally {
            this.hideLoading();
        }
    }
    
    // PRODUCT DETAIL PAGE - FIXED
    async loadProductPage(productId) {
        const mainContent = document.getElementById('mainContent');
        
        this.showLoading();
        
        try {
            const product = this.allProducts.find(p => p._id === productId);
            
            if (!product) {
                throw new Error('Produit non trouvé');
            }
            
            const isOutOfStock = product.stock === 0;
            const hasPromotion = product.enPromotion && product.prixOriginal;
            
            let imageUrl;
            if (product.image && product.image.startsWith('http')) {
                imageUrl = product.image;
            } else if (product.image && product.image.startsWith('data:image')) {
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
                imageUrl = `https://via.placeholder.com/400x400/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
            }
            
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="max-w-6xl mx-auto">
                        <nav class="mb-8">
                            <ol class="flex items-center space-x-2 text-sm">
                                <li><button onclick="app.showPage('home')" class="text-emerald-600 hover:text-emerald-800">Accueil</button></li>
                                <li><i class="fas fa-chevron-right text-gray-400 mx-2"></i></li>
                                <li><button onclick="app.filterByCategory('${product.categorie}')" class="text-emerald-600 hover:text-emerald-800">${product.categorie}</button></li>
                                <li><i class="fas fa-chevron-right text-gray-400 mx-2"></i></li>
                                <li class="text-gray-500">${product.nom}</li>
                            </ol>
                        </nav>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div class="relative">
                                ${hasPromotion ? `<div class="absolute top-4 left-4 z-10 badge-promotion">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                                ${isOutOfStock ? `
                                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                                        <span class="text-white font-bold text-2xl">Rupture de stock</span>
                                    </div>
                                ` : ''}
                                
                                <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden">
                                    <img src="${imageUrl}" alt="${product.nom}" 
                                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                         onerror="this.src='https://via.placeholder.com/400x400/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                                </div>
                            </div>
                            
                            <div class="space-y-6">
                                <div>
                                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                                    <p class="text-xl text-emerald-600 mb-4">${product.description}</p>
                                    
                                    <div class="flex items-center space-x-4 mb-6">
                                        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                                            ${product.categorie}
                                        </span>
                                        ${product.marque ? `<span class="text-emerald-600">Marque: ${product.marque}</span>` : ''}
                                    </div>
                                </div>
                                
                                <div class="space-y-2">
                                    <div class="flex items-center space-x-4">
                                        ${hasPromotion ? `
                                            <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                            <span class="text-4xl font-bold text-red-600">${product.prix} DA</span>
                                        ` : `
                                            <span class="text-4xl font-bold text-emerald-700">${product.prix} DA</span>
                                        `}
                                    </div>
                                    <p class="text-emerald-600">Stock disponible: ${product.stock} unités</p>
                                </div>
                                
                                ${!isOutOfStock ? `
                                    <div class="space-y-4">
                                        <div class="flex items-center space-x-4">
                                            <label class="font-semibold text-emerald-800">Quantité:</label>
                                            <div class="quantity-selector">
                                                <button onclick="changeProductQuantity(-1)" id="decreaseBtn">-</button>
                                                <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                                       onchange="validateProductQuantity()">
                                                <button onclick="changeProductQuantity(1)" id="increaseBtn">+</button>
                                            </div>
                                        </div>
                                        
                                        <button onclick="addProductToCart('${product._id}')" 
                                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                                            <i class="fas fa-cart-plus mr-3"></i>
                                            Ajouter au panier
                                        </button>
                                    </div>
                                ` : `
                                    <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p class="text-red-800 font-semibold">Produit actuellement en rupture de stock</p>
                                    </div>
                                `}
                                
                                <div class="space-y-4">
                                    ${product.ingredients ? `
                                        <div>
                                            <h3 class="font-bold text-emerald-800 mb-2">Ingrédients</h3>
                                            <p class="text-emerald-700">${product.ingredients}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${product.modeEmploi ? `
                                        <div>
                                            <h3 class="font-bold text-emerald-800 mb-2">Mode d'emploi</h3>
                                            <p class="text-emerald-700">${product.modeEmploi}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${product.precautions ? `
                                        <div>
                                            <h3 class="font-bold text-emerald-800 mb-2">Précautions</h3>
                                            <p class="text-emerald-700">${product.precautions}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading product page:', error);
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <h3 class="text-xl font-bold text-red-800 mb-2">Produit non trouvé</h3>
                        <p class="text-red-600 mb-4">Le produit demandé n'existe pas ou n'est plus disponible</p>
                        <button onclick="app.showPage('products')" 
                                class="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all">
                            Voir tous les produits
                        </button>
                    </div>
                </div>
            `;
        } finally {
            this.hideLoading();
        }
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
    
    // ADMIN PAGE - FIXED
    async loadAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showToast('Accès refusé - Droits administrateur requis', 'error');
            this.showPage('home');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
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
                
                <div id="adminContent" class="min-h-96">
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
    
    // ADMIN PRODUCTS MANAGEMENT
    async loadAdminProducts() {
        const adminContent = document.getElementById('adminContent');
        
        const products = this.allProducts;
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.actif !== false).length;
        const inactiveProducts = totalProducts - activeProducts;
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-blue-600 uppercase">Total Produits</p>
                                <p class="text-3xl font-bold text-blue-800">${totalProducts}</p>
                            </div>
                            <i class="fas fa-boxes text-blue-500 text-2xl"></i>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-green-600 uppercase">Actifs</p>
                                <p class="text-3xl font-bold text-green-800">${activeProducts}</p>
                            </div>
                            <i class="fas fa-check-circle text-green-500 text-2xl"></i>
                        </div>
                    </div>
                    
                    <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-red-600 uppercase">Inactifs</p>
                                <p class="text-3xl font-bold text-red-800">${inactiveProducts}</p>
                            </div>
                            <i class="fas fa-times-circle text-red-500 text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des produits</h2>
                        <div class="flex flex-wrap gap-3">
                            <button onclick="app.refreshProductsCache()" 
                                    class="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-all font-semibold">
                                <i class="fas fa-sync mr-2"></i>Actualiser
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                    <div class="p-6 border-b border-emerald-100">
                        <h3 class="text-xl font-bold text-emerald-800">Liste des produits</h3>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-emerald-50">
                                <tr>
                                    <th class="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Produit</th>
                                    <th class="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Catégorie</th>
                                    <th class="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Prix</th>
                                    <th class="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Stock</th>
                                    <th class="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Statut</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-emerald-100">
                                ${products.length > 0 ? products.map(product => `
                                    <tr class="hover:bg-emerald-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center space-x-3">
                                                <img src="${product.image || 'https://via.placeholder.com/40x40/10b981/ffffff?text=' + encodeURIComponent(product.nom.substring(0, 2))}" 
                                                     alt="${product.nom}" class="w-10 h-10 rounded-lg object-cover">
                                                <div>
                                                    <p class="font-semibold text-emerald-800">${product.nom}</p>
                                                    <p class="text-sm text-emerald-600">${product.marque || 'Aucune marque'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                                ${product.categorie}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div>
                                                <span class="font-semibold text-emerald-800">${product.prix} DA</span>
                                                ${product.enPromotion && product.prixOriginal ? 
                                                    `<br><span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>` : 
                                                    ''
                                                }
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}">
                                                ${product.stock}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-col space-y-1">
                                                <span class="px-2 py-1 text-xs rounded-full ${product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                    ${product.actif !== false ? 'Actif' : 'Inactif'}
                                                </span>
                                                ${product.enVedette ? '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Vedette</span>' : ''}
                                                ${product.enPromotion ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Promo</span>' : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="5" class="px-6 py-12 text-center text-emerald-600">
                                            <i class="fas fa-box-open text-4xl mb-4"></i>
                                            <p class="text-lg font-semibold">Aucun produit</p>
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ADMIN ORDERS MANAGEMENT
    async loadAdminOrders() {
        const adminContent = document.getElementById('adminContent');
        
        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.statut === 'en-attente').length;
        const completedOrders = orders.filter(o => o.statut === 'livree').length;
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-blue-600 uppercase">Total Commandes</p>
                                <p class="text-3xl font-bold text-blue-800">${totalOrders}</p>
                            </div>
                            <i class="fas fa-shopping-bag text-blue-500 text-2xl"></i>
                        </div>
                    </div>
                    
                    <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-orange-600 uppercase">En Attente</p>
                                <p class="text-3xl font-bold text-orange-800">${pendingOrders}</p>
                            </div>
                            <i class="fas fa-clock text-orange-500 text-2xl"></i>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-green-600 uppercase">Livrées</p>
                                <p class="text-3xl font-bold text-green-800">${completedOrders}</p>
                            </div>
                            <i class="fas fa-check-circle text-green-500 text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                    <div class="p-6 border-b border-emerald-100">
                        <h3 class="text-xl font-bold text-emerald-800">Commandes récentes</h3>
                    </div>
                    
                    ${orders.length > 0 ? `
                        <div class="divide-y divide-emerald-100">
                            ${orders.slice(0, 20).map(order => `
                                <div class="p-6 hover:bg-emerald-50 transition-colors">
                                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div class="flex-1">
                                            <div class="flex items-center space-x-4 mb-2">
                                                <h4 class="font-bold text-emerald-800">${order.numeroCommande}</h4>
                                                <span class="px-3 py-1 text-xs rounded-full ${
                                                    order.statut === 'en-attente' ? 'bg-orange-100 text-orange-800' :
                                                    order.statut === 'confirmee' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'expediee' ? 'bg-purple-100 text-purple-800' :
                                                    order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }">
                                                    ${order.statut.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-600">
                                                <div>
                                                    <p><strong>Client:</strong> ${order.nomComplet}</p>
                                                    <p><strong>Téléphone:</strong> ${order.telephone}</p>
                                                    <p><strong>Email:</strong> ${order.email}</p>
                                                </div>
                                                <div>
                                                    <p><strong>Adresse:</strong> ${order.adresse}</p>
                                                    <p><strong>Ville:</strong> ${order.ville}, ${order.wilaya}</p>
                                                    <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                            
                                            <div class="mt-3">
                                                <p class="text-sm text-emerald-600">
                                                    <strong>Articles:</strong> ${order.articles.map(a => `${a.nom} (x${a.quantite})`).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div class="flex flex-col lg:items-end space-y-2">
                                            <div class="text-right">
                                                <p class="text-2xl font-bold text-emerald-800">${order.total} DA</p>
                                                <p class="text-sm text-emerald-600">${order.articles.reduce((sum, a) => sum + a.quantite, 0)} articles</p>
                                            </div>
                                            
                                            <div class="flex space-x-2">
                                                <select onchange="updateOrderStatus('${order.numeroCommande}', this.value)" 
                                                        class="text-sm px-3 py-1 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                                    <option value="en-attente" ${order.statut === 'en-attente' ? 'selected' : ''}>En attente</option>
                                                    <option value="confirmee" ${order.statut === 'confirmee' ? 'selected' : ''}>Confirmée</option>
                                                    <option value="expediee" ${order.statut === 'expediee' ? 'selected' : ''}>Expédiée</option>
                                                    <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>Livrée</option>
                                                    <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>Annulée</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="p-12 text-center text-emerald-600">
                            <i class="fas fa-shopping-bag text-4xl mb-4"></i>
                            <p class="text-lg font-semibold">Aucune commande</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    // ADMIN FEATURED PRODUCTS
    async loadAdminFeatured() {
        const adminContent = document.getElementById('adminContent');
        
        const products = this.allProducts;
        const featuredProducts = products.filter(p => p.enVedette);
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-emerald-800">Produits Coups de Cœur</h2>
                            <p class="text-emerald-600">Gérez les produits mis en avant sur la page d'accueil</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-bold text-emerald-800">${featuredProducts.length}</p>
                            <p class="text-sm text-emerald-600">Produits en vedette</p>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${featuredProducts.map(product => `
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                            <div class="relative">
                                <img src="${product.image || 'https://via.placeholder.com/300x200/10b981/ffffff?text=' + encodeURIComponent(product.nom.substring(0, 2))}" 
                                     alt="${product.nom}" class="w-full h-48 object-cover">
                                <div class="absolute top-2 left-2">
                                    <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        <i class="fas fa-star mr-1"></i>Vedette
                                    </span>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                                <p class="text-sm text-emerald-600 mb-3">${product.categorie} - ${product.prix} DA</p>
                                <button onclick="toggleProductFeatured('${product._id}', false)" 
                                        class="w-full bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all font-semibold">
                                    <i class="fas fa-star-of-life mr-2"></i>Retirer de la vedette
                                </button>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${featuredProducts.length === 0 ? `
                        <div class="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-12 text-center">
                            <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                            <p class="text-emerald-600 mb-6">Sélectionnez des produits à mettre en avant sur la page d'accueil</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50">
                    <div class="p-6 border-b border-emerald-100">
                        <h3 class="text-xl font-bold text-emerald-800">Ajouter des produits en vedette</h3>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            ${products.filter(p => !p.enVedette && p.actif !== false).slice(0, 12).map(product => `
                                <div class="border border-emerald-200 rounded-xl p-3 hover:bg-emerald-50 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <img src="${product.image || 'https://via.placeholder.com/40x40/10b981/ffffff?text=' + encodeURIComponent(product.nom.substring(0, 2))}" 
                                             alt="${product.nom}" class="w-12 h-12 rounded-lg object-cover">
                                        <div class="flex-1 min-w-0">
                                            <p class="font-semibold text-emerald-800 truncate">${product.nom}</p>
                                            <p class="text-xs text-emerald-600">${product.prix} DA</p>
                                        </div>
                                        <button onclick="toggleProductFeatured('${product._id}', true)" 
                                                class="text-yellow-500 hover:text-yellow-600 p-2 hover:bg-yellow-50 rounded-lg transition-all" 
                                                title="Mettre en vedette">
                                            <i class="fas fa-star"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ADMIN CLEANUP
    async loadAdminCleanup() {
        const adminContent = document.getElementById('adminContent');
        
        const products = this.allProducts;
        const inactiveProducts = products.filter(p => p.actif === false);
        const emptyStockProducts = products.filter(p => p.stock === 0);
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
                        <div>
                            <h2 class="text-2xl font-bold text-red-800">Zone de Nettoyage</h2>
                            <p class="text-red-600">Actions irréversibles - Utilisez avec précaution</p>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-emerald-800">Produits Inactifs</h3>
                            <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">${inactiveProducts.length}</span>
                        </div>
                        
                        <p class="text-emerald-600 mb-4">Produits marqués comme inactifs</p>
                        
                        <div class="space-y-3 mb-6">
                            ${inactiveProducts.slice(0, 3).map(product => `
                                <div class="flex items-center space-x-3 text-sm">
                                    <img src="${product.image || 'https://via.placeholder.com/30x30/10b981/ffffff?text=' + encodeURIComponent(product.nom.substring(0, 2))}" 
                                         alt="${product.nom}" class="w-8 h-8 rounded object-cover">
                                    <span class="text-emerald-700">${product.nom}</span>
                                </div>
                            `).join('')}
                            ${inactiveProducts.length > 3 ? `<p class="text-sm text-emerald-600">... et ${inactiveProducts.length - 3} autres</p>` : ''}
                        </div>
                        
                        <button onclick="cleanupInactiveProducts()" 
                                class="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-all font-bold" 
                                ${inactiveProducts.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-trash mr-2"></i>Supprimer tous les inactifs
                        </button>
                    </div>
                    
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-emerald-800">Stock Épuisé</h3>
                            <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">${emptyStockProducts.length}</span>
                        </div>
                        
                        <p class="text-emerald-600 mb-4">Produits avec stock à zéro</p>
                        
                        <div class="space-y-3 mb-6">
                            ${emptyStockProducts.slice(0, 3).map(product => `
                                <div class="flex items-center space-x-3 text-sm">
                                    <img src="${product.image || 'https://via.placeholder.com/30x30/10b981/ffffff?text=' + encodeURIComponent(product.nom.substring(0, 2))}" 
                                         alt="${product.nom}" class="w-8 h-8 rounded object-cover">
                                    <span class="text-emerald-700">${product.nom}</span>
                                </div>
                            `).join('')}
                            ${emptyStockProducts.length > 3 ? `<p class="text-sm text-emerald-600">... et ${emptyStockProducts.length - 3} autres</p>` : ''}
                        </div>
                        
                        <button onclick="cleanupEmptyStockProducts()" 
                                class="w-full bg-orange-500 text-white py-3 px-4 rounded-xl hover:bg-orange-600 transition-all font-bold" 
                                ${emptyStockProducts.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-boxes mr-2"></i>Supprimer stock épuisé
                        </button>
                    </div>
                </div>
                
                <div class="bg-red-900 text-white rounded-2xl p-6">
                    <div class="text-center">
                        <i class="fas fa-skull-crossbones text-4xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-4">Réinitialisation Complète</h3>
                        <p class="mb-6">Supprime TOUS les produits. Cette action est irréversible !</p>
                        <button onclick="confirmCompleteReset()" 
                                class="bg-red-700 text-white py-3 px-8 rounded-xl hover:bg-red-600 transition-all font-bold border-2 border-red-500">
                            <i class="fas fa-nuclear mr-2"></i>TOUT SUPPRIMER
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadLoginPage() {
        if (typeof window.authUI !== 'undefined' && window.authUI.createLoginPage) {
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = window.authUI.createLoginPage();
        } else {
            console.error('Auth UI not available');
        }
    }
    
    async loadRegisterPage() {
        if (typeof window.authUI !== 'undefined' && window.authUI.createRegisterPage) {
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = window.authUI.createRegisterPage();
        } else {
            console.error('Auth UI not available');
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

// GLOBAL FUNCTIONS - OUTSIDE THE CLASS
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

// CHECKOUT HANDLER
async function handleCheckout(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('checkoutSubmitBtn');
    const submitText = document.getElementById('checkoutSubmitText');
    const spinner = document.getElementById('checkoutSpinner');
    
    const formData = new FormData(event.target);
    const orderData = {
        nomComplet: formData.get('nomComplet'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        adresse: formData.get('adresse'),
        ville: formData.get('ville'),
        wilaya: formData.get('wilaya'),
        notes: formData.get('notes') || '',
        articles: window.app.cart,
        sousTotal: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0),
        fraisLivraison: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) >= 5000 ? 0 : 300
    };
    
    orderData.total = orderData.sousTotal + orderData.fraisLivraison;
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const orderNumber = 'CMD' + Date.now().toString().slice(-8);
        
        let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const newOrder = {
            numeroCommande: orderNumber,
            ...orderData,
            statut: 'en-attente',
            dateCommande: new Date().toISOString(),
            userId: window.app.currentUser ? window.app.currentUser.id : null
        };
        
        adminOrders.unshift(newOrder);
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        window.app.clearCart();
        window.app.showToast('Commande confirmée avec succès !', 'success');
        
        setTimeout(() => {
            window.app.showPage('order-confirmation', { orderNumber });
        }, 1500);
        
    } catch (error) {
        console.error('Checkout error:', error);
        window.app.showToast('Erreur lors de la commande. Veuillez réessayer.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// PRODUCT QUANTITY FUNCTIONS
function changeProductQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.max);
        const newValue = Math.max(1, Math.min(maxValue, currentValue + change));
        quantityInput.value = newValue;
        
        document.getElementById('decreaseBtn').disabled = newValue <= 1;
        document.getElementById('increaseBtn').disabled = newValue >= maxValue;
    }
}

function validateProductQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const value = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.max);
        
        if (value < 1) quantityInput.value = 1;
        if (value > maxValue) quantityInput.value = maxValue;
        
        document.getElementById('decreaseBtn').disabled = value <= 1;
        document.getElementById('increaseBtn').disabled = value >= maxValue;
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    if (window.app) {
        window.app.addToCart(productId, quantity);
    }
}

// ADMIN FUNCTIONS
function switchAdminSection(section) {
    console.log('Switching to admin section:', section);
    
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
    }
    
    switch (section) {
        case 'dashboard':
            if (window.app) window.app.loadAdminDashboard();
            break;
        case 'products':
            if (window.app) window.app.loadAdminProducts();
            break;
        case 'orders':
            if (window.app) window.app.loadAdminOrders();
            break;
        case 'featured':
            if (window.app) window.app.loadAdminFeatured();
            break;
        case 'cleanup':
            if (window.app) window.app.loadAdminCleanup();
            break;
        default:
            console.error('Unknown admin section:', section);
    }
}

function toggleProductFeatured(productId, featured) {
    if (!window.app) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const productIndex = products.findIndex(p => p._id === productId);
    
    if (productIndex > -1) {
        products[productIndex].enVedette = featured;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        window.app.refreshProductsCache();
        window.app.loadAdminFeatured();
        
        const message = featured ? 'Produit ajouté aux coups de cœur' : 'Produit retiré des coups de cœur';
        window.app.showToast(message, 'success');
    }
}

function updateOrderStatus(orderNumber, newStatus) {
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.numeroCommande === orderNumber);
    
    if (orderIndex > -1) {
        orders[orderIndex].statut = newStatus;
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        if (window.app) {
            window.app.showToast('Statut de commande mis à jour', 'success');
        }
    }
}

function cleanupInactiveProducts() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les produits inactifs ? Cette action est irréversible.')) {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const activeProducts = products.filter(p => p.actif !== false);
        
        localStorage.setItem('demoProducts', JSON.stringify(activeProducts));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.loadAdminCleanup();
            window.app.showToast('Produits inactifs supprimés', 'success');
        }
    }
}

function cleanupEmptyStockProducts() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les produits en rupture de stock ?')) {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const stockedProducts = products.filter(p => p.stock > 0);
        
        localStorage.setItem('demoProducts', JSON.stringify(stockedProducts));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.loadAdminCleanup();
            window.app.showToast('Produits en rupture supprimés', 'success');
        }
    }
}

function confirmCompleteReset() {
    const confirmation = prompt('Tapez "SUPPRIMER TOUT" pour confirmer la suppression complète :');
    
    if (confirmation === 'SUPPRIMER TOUT') {
        localStorage.setItem('demoProducts', JSON.stringify([]));
        localStorage.setItem('adminOrders', JSON.stringify([]));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.loadAdminCleanup();
            window.app.showToast('Toutes les données ont été supprimées', 'success');
        }
    } else {
        if (window.app) {
            window.app.showToast('Suppression annulée', 'info');
        }
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

// Global assignments
window.switchAdminSection = switchAdminSection;
window.toggleProductFeatured = toggleProductFeatured;
window.updateOrderStatus = updateOrderStatus;
window.cleanupInactiveProducts = cleanupInactiveProducts;
window.cleanupEmptyStockProducts = cleanupEmptyStockProducts;
window.confirmCompleteReset = confirmCompleteReset;
window.handleCheckout = handleCheckout;
window.changeProductQuantity = changeProductQuantity;
window.validateProductQuantity = validateProductQuantity;
window.addProductToCart = addProductToCart;

console.log('✅ Complete Fixed app.js loaded with full checkout and admin functionality');
