// Complete PharmacieGaherApp - Fixed version with all improvements
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

    // LOGIN PAGE
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-user text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">Connexion</h1>
                        <p class="text-emerald-600">Accédez à votre compte</p>
                    </div>
                    
                    <form id="loginForm" class="space-y-6">
                        <div>
                            <label for="loginEmail" class="block text-sm font-medium text-emerald-700 mb-2">Email</label>
                            <input type="email" id="loginEmail" name="email" required 
                                   class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label for="loginPassword" class="block text-sm font-medium text-emerald-700 mb-2">Mot de passe</label>
                            <input type="password" id="loginPassword" name="password" required 
                                   class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            Se connecter
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-emerald-600">
                            Pas encore de compte ? 
                            <button onclick="app.showPage('register')" class="text-emerald-700 font-semibold hover:text-emerald-800">
                                S'inscrire
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add form submission handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            
            try {
                const response = await fetch(buildApiUrl('/auth/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    this.currentUser = data.user;
                    this.updateUserUI();
                    this.showToast('Connexion réussie !', 'success');
                    
                    if (data.user.role === 'admin') {
                        this.showPage('admin');
                    } else {
                        this.showPage('profile');
                    }
                } else {
                    this.showToast(data.message || 'Erreur de connexion', 'error');
                }
            } catch (error) {
                console.error('Erreur de connexion:', error);
                this.showToast('Erreur de connexion', 'error');
            }
        });
    }

    // REGISTER PAGE
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-user-plus text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">Inscription</h1>
                        <p class="text-emerald-600">Créez votre compte</p>
                    </div>
                    
                    <form id="registerForm" class="space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-medium text-emerald-700 mb-2">Prénom</label>
                                <input type="text" id="registerPrenom" name="prenom" required 
                                       class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            </div>
                            <div>
                                <label for="registerNom" class="block text-sm font-medium text-emerald-700 mb-2">Nom</label>
                                <input type="text" id="registerNom" name="nom" required 
                                       class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            </div>
                        </div>
                        
                        <div>
                            <label for="registerEmail" class="block text-sm font-medium text-emerald-700 mb-2">Email</label>
                            <input type="email" id="registerEmail" name="email" required 
                                   class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label for="registerPassword" class="block text-sm font-medium text-emerald-700 mb-2">Mot de passe</label>
                            <input type="password" id="registerPassword" name="password" required 
                                   class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            S'inscrire
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-emerald-600">
                            Déjà un compte ? 
                            <button onclick="app.showPage('login')" class="text-emerald-700 font-semibold hover:text-emerald-800">
                                Se connecter
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add form submission handler
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const userData = {
                prenom: formData.get('prenom'),
                nom: formData.get('nom'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch(buildApiUrl('/auth/register'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.showToast('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
                    this.showPage('login');
                } else {
                    this.showToast(data.message || 'Erreur d\'inscription', 'error');
                }
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
                this.showToast('Erreur d\'inscription', 'error');
            }
        });
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

    // PRODUCTS PAGE
    async loadProductsPage(params = {}) {
        console.log('Loading products page with params:', params);
        
        let filteredProducts = [...this.allProducts];
        
        // Apply category filter
        if (params.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
        }
        
        // Apply search filter
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.marque?.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter out inactive products
        filteredProducts = filteredProducts.filter(p => p.actif !== false);
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Page Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">
                        ${params.categorie ? `Catégorie: ${params.categorie}` : params.search ? `Recherche: "${params.search}"` : 'Nos Produits'}
                    </h1>
                    <p class="text-xl text-emerald-600">${filteredProducts.length} produit(s) trouvé(s)</p>
                </div>
                
                <!-- Filters -->
                <div class="mb-8">
                    <div class="flex flex-wrap gap-2 justify-center">
                        <button onclick="app.showPage('products')" class="filter-btn ${!params.categorie ? 'active' : ''}">
                            Tous
                        </button>
                        <button onclick="app.filterByCategory('Vitalité')" class="filter-btn ${params.categorie === 'Vitalité' ? 'active' : ''}">
                            Vitalité
                        </button>
                        <button onclick="app.filterByCategory('Sport')" class="filter-btn ${params.categorie === 'Sport' ? 'active' : ''}">
                            Sport
                        </button>
                        <button onclick="app.filterByCategory('Visage')" class="filter-btn ${params.categorie === 'Visage' ? 'active' : ''}">
                            Visage
                        </button>
                        <button onclick="app.filterByCategory('Cheveux')" class="filter-btn ${params.categorie === 'Cheveux' ? 'active' : ''}">
                            Cheveux
                        </button>
                        <button onclick="app.filterByCategory('Soins')" class="filter-btn ${params.categorie === 'Soins' ? 'active' : ''}">
                            Soins
                        </button>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="productsGrid">
                    ${filteredProducts.length > 0 ? 
                        filteredProducts.map(product => this.createProductCard(product)).join('') :
                        `<div class="col-span-full text-center py-16">
                            <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                            <p class="text-emerald-600 mb-8">Essayez de modifier vos critères de recherche</p>
                            <button onclick="app.showPage('products')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                Voir tous les produits
                            </button>
                        </div>`
                    }
                </div>
            </div>
        `;
    }

    // SINGLE PRODUCT PAGE
    async loadProductPage(productId) {
        console.log('Loading product page for:', productId);
        
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
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
            imageUrl = `https://via.placeholder.com/500x500/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto">
                    <!-- Back button -->
                    <button onclick="history.back()" class="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Product Image -->
                        <div class="relative">
                            ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-20">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                            <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl overflow-hidden shadow-2xl">
                                <img src="${imageUrl}" alt="${product.nom}" 
                                     class="w-full h-full object-cover"
                                     onerror="this.src='https://via.placeholder.com/500x500/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                            </div>
                        </div>
                        
                        <!-- Product Info -->
                        <div class="space-y-6">
                            <div>
                                <h1 class="text-4xl font-bold text-emerald-800 mb-2">${product.nom}</h1>
                                <p class="text-xl text-emerald-600">${product.marque || ''}</p>
                                <p class="text-emerald-700 font-semibold">${product.categorie}</p>
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
                            
                            <div class="bg-emerald-50 rounded-xl p-6">
                                <h3 class="font-bold text-emerald-800 mb-3">Description</h3>
                                <p class="text-emerald-700">${product.description || 'Aucune description disponible'}</p>
                            </div>
                            
                            ${product.ingredients ? `
                            <div class="bg-blue-50 rounded-xl p-6">
                                <h3 class="font-bold text-blue-800 mb-3">Ingrédients</h3>
                                <p class="text-blue-700">${product.ingredients}</p>
                            </div>
                            ` : ''}
                            
                            ${product.modeEmploi ? `
                            <div class="bg-green-50 rounded-xl p-6">
                                <h3 class="font-bold text-green-800 mb-3">Mode d'emploi</h3>
                                <p class="text-green-700">${product.modeEmploi}</p>
                            </div>
                            ` : ''}
                            
                            ${product.precautions ? `
                            <div class="bg-yellow-50 rounded-xl p-6">
                                <h3 class="font-bold text-yellow-800 mb-3">Précautions</h3>
                                <p class="text-yellow-700">${product.precautions}</p>
                            </div>
                            ` : ''}
                            
                            <!-- Add to Cart -->
                            <div class="space-y-4">
                                <div class="flex items-center space-x-4">
                                    <label class="text-emerald-700 font-semibold">Quantité:</label>
                                    <div class="quantity-selector">
                                        <button onclick="decreaseQuantity()">-</button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                                        <button onclick="increaseQuantity()">+</button>
                                    </div>
                                </div>
                                
                                ${!isOutOfStock ? `
                                    <button onclick="addProductToCart()" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg text-lg">
                                        <i class="fas fa-cart-plus mr-2"></i>
                                        Ajouter au panier
                                    </button>
                                ` : `
                                    <button disabled class="w-full bg-gray-400 text-white font-bold py-4 px-8 rounded-xl cursor-not-allowed text-lg">
                                        <i class="fas fa-times mr-2"></i>
                                        Rupture de stock
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                function decreaseQuantity() {
                    const input = document.getElementById('productQuantity');
                    if (input.value > 1) {
                        input.value = parseInt(input.value) - 1;
                    }
                }
                
                function increaseQuantity() {
                    const input = document.getElementById('productQuantity');
                    const maxStock = ${product.stock};
                    if (input.value < maxStock) {
                        input.value = parseInt(input.value) + 1;
                    }
                }
                
                function addProductToCart() {
                    const quantity = parseInt(document.getElementById('productQuantity').value);
                    if (window.app && typeof window.app.addToCart === 'function') {
                        window.app.addToCart('${product._id}', quantity);
                    }
                }
            </script>
        `;
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

    // CHECKOUT PAGE - FIXED
    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('home');
            return;
        }
        
        const sousTotal = this.getCartTotal();
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <h1 class="text-4xl font-bold text-emerald-800 mb-8 text-center">Finaliser votre commande</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Order Form -->
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                        
                        <form id="checkoutForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="prenom" class="block text-sm font-medium text-emerald-700 mb-2">Prénom *</label>
                                    <input type="text" id="prenom" name="prenom" required 
                                           class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                           value="${this.currentUser?.prenom || ''}">
                                </div>
                                <div>
                                    <label for="nom" class="block text-sm font-medium text-emerald-700 mb-2">Nom *</label>
                                    <input type="text" id="nom" name="nom" required 
                                           class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                           value="${this.currentUser?.nom || ''}">
                                </div>
                            </div>
                            
                            <div>
                                <label for="email" class="block text-sm font-medium text-emerald-700 mb-2">Email *</label>
                                <input type="email" id="email" name="email" required 
                                       class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.email || ''}">
                            </div>
                            
                            <div>
                                <label for="telephone" class="block text-sm font-medium text-emerald-700 mb-2">Téléphone *</label>
                                <input type="tel" id="telephone" name="telephone" required 
                                       class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.telephone || ''}">
                            </div>
                            
                            <div>
                                <label for="adresse" class="block text-sm font-medium text-emerald-700 mb-2">Adresse complète *</label>
                                <textarea id="adresse" name="adresse" required rows="3"
                                          class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                          placeholder="Rue, ville, code postal...">${this.currentUser?.adresse || ''}</textarea>
                            </div>
                            
                            <div>
                                <label for="notes" class="block text-sm font-medium text-emerald-700 mb-2">Notes de commande (optionnel)</label>
                                <textarea id="notes" name="notes" rows="2"
                                          class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                          placeholder="Instructions de livraison, préférences..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                        
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-3 border-b border-emerald-100 pb-4">
                                    <img src="${item.image}" alt="${item.nom}" class="w-16 h-16 object-cover rounded-lg">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                                        <p class="text-sm text-emerald-600">${item.prix} DA x ${item.quantite}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold text-emerald-800">${item.prix * item.quantite} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="space-y-2 border-t border-emerald-200 pt-4 mb-6">
                            <div class="flex justify-between">
                                <span class="text-emerald-700">Sous-total</span>
                                <span class="font-semibold text-emerald-800">${sousTotal} DA</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-emerald-700">Frais de livraison</span>
                                <span class="font-semibold text-emerald-800">
                                    ${fraisLivraison === 0 ? 'Gratuit' : fraisLivraison + ' DA'}
                                </span>
                            </div>
                            ${fraisLivraison === 0 ? '' : `
                                <div class="text-xs text-emerald-600">
                                    Livraison gratuite dès 5000 DA
                                </div>
                            `}
                            <div class="flex justify-between text-lg font-bold border-t border-emerald-300 pt-2">
                                <span class="text-emerald-800">Total</span>
                                <span class="text-emerald-800">${total} DA</span>
                            </div>
                        </div>
                        
                        <button onclick="app.processOrder()" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg text-lg" 
                                id="processOrderBtn">
                            <i class="fas fa-credit-card mr-2"></i>
                            Confirmer la commande
                        </button>
                        
                        <p class="text-sm text-emerald-600 text-center mt-4">
                            Paiement à la livraison disponible
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async processOrder() {
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const processOrderBtn = document.getElementById('processOrderBtn');
        processOrderBtn.disabled = true;
        processOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement...';
        
        try {
            const sousTotal = this.getCartTotal();
            const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
            const total = sousTotal + fraisLivraison;
            
            const orderData = {
                client: {
                    prenom: formData.get('prenom'),
                    nom: formData.get('nom'),
                    email: formData.get('email'),
                    telephone: formData.get('telephone'),
                    adresse: formData.get('adresse') // Fixed: using correct field name
                },
                items: this.cart.map(item => ({
                    produit: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.quantite
                })),
                sousTotal: sousTotal,
                fraisLivraison: fraisLivraison,
                total: total,
                notes: formData.get('notes') || '',
                statut: 'en-attente',
                dateLivraison: null
            };
            
            console.log('Processing order:', orderData);
            
            // Generate order number
            const orderNumber = 'CMD' + Date.now();
            
            // Try to save to API first
            let apiSuccess = false;
            try {
                const response = await fetch(buildApiUrl('/orders'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.currentUser ? { 'x-auth-token': localStorage.getItem('token') } : {})
                    },
                    body: JSON.stringify({ ...orderData, numeroCommande: orderNumber })
                });
                
                if (response.ok) {
                    console.log('Order saved to API successfully');
                    apiSuccess = true;
                } else {
                    console.log('API order save failed, using fallback');
                }
            } catch (error) {
                console.log('API unavailable for orders, using local storage fallback');
            }
            
            // Always save to localStorage as backup/primary storage
            const orderWithNumber = {
                ...orderData,
                numeroCommande: orderNumber,
                dateCommande: new Date().toISOString(),
                _id: orderNumber
            };
            
            // Save to localStorage for admin access
            const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            existingOrders.push(orderWithNumber);
            localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
            
            console.log('Order saved locally:', orderWithNumber);
            
            this.clearCart();
            this.showToast('Commande passée avec succès !', 'success');
            this.showPage('order-confirmation', { orderNumber: orderNumber });
            
        } catch (error) {
            console.error('Erreur lors du traitement de la commande:', error);
            this.showToast('Erreur lors du traitement de la commande', 'error');
            
            processOrderBtn.disabled = false;
            processOrderBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Confirmer la commande';
        }
    }

    // ORDER CONFIRMATION PAGE
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-4xl text-center">
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <i class="fas fa-check text-white text-3xl"></i>
                    </div>
                    
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600 mb-8">
                        Merci pour votre commande. Votre numéro de commande est : 
                        <span class="font-bold text-emerald-800">${orderNumber}</span>
                    </p>
                    
                    <div class="bg-emerald-50 rounded-xl p-6 mb-8">
                        <h3 class="text-lg font-bold text-emerald-800 mb-4">Étapes suivantes</h3>
                        <div class="text-left space-y-3">
                            <div class="flex items-start space-x-3">
                                <i class="fas fa-clock text-emerald-600 mt-1"></i>
                                <p class="text-emerald-700">Nous préparons votre commande dans les plus brefs délais</p>
                            </div>
                            <div class="flex items-start space-x-3">
                                <i class="fas fa-phone text-emerald-600 mt-1"></i>
                                <p class="text-emerald-700">Notre équipe vous contactera pour confirmer la livraison</p>
                            </div>
                            <div class="flex items-start space-x-3">
                                <i class="fas fa-truck text-emerald-600 mt-1"></i>
                                <p class="text-emerald-700">Livraison sous 24-48h (délai standard)</p>
                            </div>
                            <div class="flex items-start space-x-3">
                                <i class="fas fa-credit-card text-emerald-600 mt-1"></i>
                                <p class="text-emerald-700">Paiement à la livraison</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <button onclick="app.showPage('home')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg mr-4">
                            <i class="fas fa-home mr-2"></i>
                            Retour à l'accueil
                        </button>
                        <button onclick="app.showPage('products')" 
                                class="border-2 border-emerald-500 text-emerald-600 font-bold py-3 px-8 rounded-xl hover:bg-emerald-50 transition-all">
                            <i class="fas fa-shopping-bag mr-2"></i>
                            Continuer mes achats
                        </button>
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

    // ADMIN METHODS - FIXED FOR ALL ISSUES
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

            // Don't try to call the /admin/dashboard endpoint since it doesn't exist
            // Just use local stats
            console.log('Using local admin stats');
            
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

    // ADMIN PRODUCTS SECTION - FIXED
    async loadAdminProducts() {
        console.log('Loading admin products...');
        
        const products = this.allProducts;
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-emerald-800 mb-2">Gestion des Produits</h2>
                        <p class="text-emerald-600">${products.length} produit(s) au total</p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-plus mr-2"></i>Ajouter un produit
                        </button>
                        <button onclick="app.refreshProductsCache()" class="border-2 border-emerald-500 text-emerald-600 font-bold py-3 px-6 rounded-xl hover:bg-emerald-50 transition-all">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-emerald-50 border-b border-emerald-200">
                                <th class="p-4 font-semibold text-emerald-800">Image</th>
                                <th class="p-4 font-semibold text-emerald-800">Nom</th>
                                <th class="p-4 font-semibold text-emerald-800">Catégorie</th>
                                <th class="p-4 font-semibold text-emerald-800">Prix</th>
                                <th class="p-4 font-semibold text-emerald-800">Stock</th>
                                <th class="p-4 font-semibold text-emerald-800">Statut</th>
                                <th class="p-4 font-semibold text-emerald-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => {
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
                                    <tr class="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                                        <td class="p-4">
                                            <img src="${imageUrl}" alt="${product.nom}" class="w-16 h-16 object-cover rounded-lg">
                                        </td>
                                        <td class="p-4">
                                            <div>
                                                <p class="font-semibold text-emerald-800">${product.nom}</p>
                                                <p class="text-sm text-emerald-600">${product.marque || ''}</p>
                                            </div>
                                        </td>
                                        <td class="p-4">
                                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                ${product.categorie}
                                            </span>
                                        </td>
                                        <td class="p-4">
                                            <div>
                                                <p class="font-bold text-emerald-800">${product.prix} DA</p>
                                                ${product.prixOriginal ? `<p class="text-sm text-gray-500 line-through">${product.prixOriginal} DA</p>` : ''}
                                            </div>
                                        </td>
                                        <td class="p-4">
                                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                ${product.stock} unités
                                            </span>
                                        </td>
                                        <td class="p-4">
                                            <div class="flex flex-col gap-1">
                                                ${product.enVedette ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⭐ Vedette</span>' : ''}
                                                ${product.enPromotion ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🏷️ Promo</span>' : ''}
                                                <span class="text-xs ${product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full">
                                                    ${product.actif !== false ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="p-4">
                                            <div class="flex gap-2">
                                                <button onclick="openEditProductModal('${product._id}')" class="text-blue-600 hover:text-blue-800 p-2">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="toggleFeatured('${product._id}')" class="text-yellow-600 hover:text-yellow-800 p-2">
                                                    <i class="fas fa-star"></i>
                                                </button>
                                                <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800 p-2">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ADMIN ORDERS SECTION - FIXED FOR ADRESSE ISSUE
    async loadAdminOrders() {
        console.log('Loading admin orders...');
        
        // Get orders from localStorage
        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        console.log('Found orders:', orders.length);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-emerald-800 mb-2">Gestion des Commandes</h2>
                        <p class="text-emerald-600">${orders.length} commande(s) au total</p>
                    </div>
                </div>
                
                ${orders.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                        <p class="text-emerald-600">Les commandes apparaîtront ici une fois passées par les clients.</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="bg-emerald-50 border-b border-emerald-200">
                                    <th class="p-4 font-semibold text-emerald-800">N° Commande</th>
                                    <th class="p-4 font-semibold text-emerald-800">Client</th>
                                    <th class="p-4 font-semibold text-emerald-800">Date</th>
                                    <th class="p-4 font-semibold text-emerald-800">Total</th>
                                    <th class="p-4 font-semibold text-emerald-800">Statut</th>
                                    <th class="p-4 font-semibold text-emerald-800">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(order => {
                                    // Fixed: Handle both old and new order structure
                                    const clientName = order.client ? `${order.client.prenom || ''} ${order.client.nom || ''}`.trim() : 'Client inconnu';
                                    const clientEmail = order.client ? order.client.email || 'N/A' : 'N/A';
                                    const orderDate = order.dateCommande ? new Date(order.dateCommande).toLocaleDateString('fr-FR') : 'N/A';
                                    
                                    return `
                                        <tr class="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                                            <td class="p-4">
                                                <div>
                                                    <p class="font-semibold text-emerald-800">${order.numeroCommande}</p>
                                                    <p class="text-sm text-emerald-600">${order.items?.length || 0} article(s)</p>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <div>
                                                    <p class="font-semibold text-emerald-800">${clientName}</p>
                                                    <p class="text-sm text-emerald-600">${clientEmail}</p>
                                                    <p class="text-xs text-emerald-500">${order.client?.telephone || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <p class="text-emerald-800">${orderDate}</p>
                                            </td>
                                            <td class="p-4">
                                                <p class="font-bold text-emerald-800">${order.total || 0} DA</p>
                                            </td>
                                            <td class="p-4">
                                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                                    order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                                    order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }">
                                                    ${order.statut === 'en-attente' ? 'En attente' :
                                                      order.statut === 'en-cours' ? 'En cours' :
                                                      order.statut === 'livree' ? 'Livrée' :
                                                      order.statut === 'annulee' ? 'Annulée' : order.statut}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex gap-2">
                                                    <button onclick="viewOrderDetails('${order._id || order.numeroCommande}')" class="text-blue-600 hover:text-blue-800 p-2">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <select onchange="updateOrderStatus('${order._id || order.numeroCommande}', this.value)" class="text-sm border border-emerald-200 rounded px-2 py-1">
                                                        <option value="en-attente" ${order.statut === 'en-attente' ? 'selected' : ''}>En attente</option>
                                                        <option value="en-cours" ${order.statut === 'en-cours' ? 'selected' : ''}>En cours</option>
                                                        <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>Livrée</option>
                                                        <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>Annulée</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
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
}

// ADMIN SECTION SWITCHING - FIXED
let adminCurrentSection = 'dashboard';

function switchAdminSection(section) {
    console.log('Switching to admin section:', section);
    
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('hover:bg-emerald-50', 'text-emerald-700', 'border-r', 'border-emerald-100');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('hover:bg-emerald-50', 'text-emerald-700', 'border-r', 'border-emerald-100');
    }
    
    adminCurrentSection = section;
    
    // Load appropriate content with slight delay to avoid conflicts
    setTimeout(() => {
        switch(section) {
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
                if (window.app) window.app.loadCleanupSection();
                break;
        }
    }, 100);
}

// PRODUCT MANAGEMENT FUNCTIONS - FIXED
let currentEditingProduct = null;

function openAddProductModal() {
    console.log('Opening add product modal');
    currentEditingProduct = null;
    
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onclick="closeProductModal()"></div>
            
            <div class="inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-emerald-800">Ajouter un produit</h3>
                    <button onclick="closeProductModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="productForm" class="space-y-6">
                    <input type="hidden" id="productId" name="id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Nom du produit *</label>
                            <input type="text" id="productNom" name="nom" required class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Marque</label>
                            <input type="text" id="productMarque" name="marque" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-emerald-700 mb-2">Description</label>
                        <textarea id="productDescription" name="description" rows="3" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Prix (DA) *</label>
                            <input type="number" id="productPrix" name="prix" required step="0.01" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Prix original (DA)</label>
                            <input type="number" id="productPrixOriginal" name="prixOriginal" step="0.01" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Stock *</label>
                            <input type="number" id="productStock" name="stock" required min="0" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-emerald-700 mb-2">Catégorie *</label>
                        <select id="productCategorie" name="categorie" required class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
                        <label class="block text-sm font-medium text-emerald-700 mb-2">Image du produit</label>
                        <div class="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center">
                            <input type="file" id="productImage" accept="image/*" onchange="previewImage(this)" class="hidden">
                            <input type="hidden" id="productImageUrl" name="image">
                            
                            <div id="imagePreviewPlaceholder">
                                <i class="fas fa-image text-4xl text-emerald-300 mb-4"></i>
                                <p class="text-emerald-600 mb-2">Cliquez pour sélectionner une image</p>
                                <button type="button" onclick="document.getElementById('productImage').click()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                                    Choisir une image
                                </button>
                            </div>
                            
                            <img id="imagePreview" class="hidden mx-auto max-w-full max-h-48 rounded-lg">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Ingrédients</label>
                            <textarea id="productIngredients" name="ingredients" rows="3" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-emerald-700 mb-2">Mode d'emploi</label>
                            <textarea id="productModeEmploi" name="modeEmploi" rows="3" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-emerald-700 mb-2">Précautions</label>
                        <textarea id="productPrecautions" name="precautions" rows="2" class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" id="productEnVedette" name="enVedette" class="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500">
                            <label for="productEnVedette" class="text-sm font-medium text-emerald-700">En vedette</label>
                        </div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" id="productEnPromotion" name="enPromotion" onchange="togglePromotionFields()" class="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500">
                            <label for="productEnPromotion" class="text-sm font-medium text-emerald-700">En promotion</label>
                        </div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" id="productActif" name="actif" checked class="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500">
                            <label for="productActif" class="text-sm font-medium text-emerald-700">Actif</label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-4 pt-6 border-t border-emerald-200">
                        <button type="button" onclick="closeProductModal()" class="px-6 py-3 text-emerald-600 border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors">
                            Annuler
                        </button>
                        <button type="button" onclick="saveProduct()" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-save mr-2"></i>Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function openEditProductModal(productId) {
    console.log('Opening edit product modal for:', productId);
    
    // Find product in cache
    const product = window.app.allProducts.find(p => p._id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        if (window.app) {
            window.app.showToast('Produit non trouvé', 'error');
        }
        return;
    }
    
    currentEditingProduct = product;
    openAddProductModal();
    
    // Change modal title
    const modalTitle = document.querySelector('#productModal h3');
    if (modalTitle) {
        modalTitle.textContent = 'Modifier le produit';
    }
    
    // Fill form with product data
    fillProductForm(product);
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    const imageUrl = document.getElementById('productImageUrl');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            if (window.app) {
                window.app.showToast('Image trop volumineuse. Maximum 2MB.', 'error');
            }
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            if (window.app) {
                window.app.showToast('Veuillez sélectionner un fichier image.', 'error');
            }
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
            
            // Save image data to hidden input
            imageUrl.value = e.target.result;
            console.log('Image preview generated');
        };
        
        reader.readAsDataURL(file);
    } else {
        // Reset preview if no file selected
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        imageUrl.value = '';
        console.log('No file selected');
    }
}

function fillProductForm(product) {
    document.getElementById('productId').value = product._id || '';
    document.getElementById('productNom').value = product.nom || '';
    document.getElementById('productMarque').value = product.marque || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrix').value = product.prix || '';
    document.getElementById('productPrixOriginal').value = product.prixOriginal || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategorie').value = product.categorie || '';
    document.getElementById('productIngredients').value = product.ingredients || '';
    document.getElementById('productModeEmploi').value = product.modeEmploi || '';
    document.getElementById('productPrecautions').value = product.precautions || '';
    document.getElementById('productEnVedette').checked = product.enVedette || false;
    document.getElementById('productEnPromotion').checked = product.enPromotion || false;
    document.getElementById('productActif').checked = product.actif !== false; // Default to true
    
    // Handle image preview
    if (product.image) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const imageUrl = document.getElementById('productImageUrl');
        
        preview.src = product.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        imageUrl.value = product.image;
    }
    
    // Trigger change event for promotion checkbox
    document.getElementById('productEnPromotion').dispatchEvent(new Event('change'));
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
    currentEditingProduct = null;
}

// New function to save product directly
function saveProduct() {
    const form = document.getElementById('productForm');
    const isEditing = currentEditingProduct !== null;
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    
    const productData = {
        nom: formData.get('nom'),
        marque: formData.get('marque') || '',
        description: formData.get('description') || '',
        prix: parseFloat(formData.get('prix')),
        prixOriginal: formData.get('prixOriginal') ? parseFloat(formData.get('prixOriginal')) : null,
        stock: parseInt(formData.get('stock')),
        categorie: formData.get('categorie'),
        ingredients: formData.get('ingredients') || '',
        modeEmploi: formData.get('modeEmploi') || '',
        precautions: formData.get('precautions') || '',
        image: document.getElementById('productImageUrl').value || '',
        enVedette: document.getElementById('productEnVedette').checked,
        enPromotion: document.getElementById('productEnPromotion').checked,
        actif: document.getElementById('productActif').checked
    };
    
    console.log('Saving product:', productData);
    
    try {
        // Get existing products
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        if (isEditing) {
            // Update existing product
            const productIndex = products.findIndex(p => p._id === currentEditingProduct._id);
            if (productIndex > -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
            }
        } else {
            // Add new product
            const newProduct = {
                ...productData,
                _id: 'prod_' + Date.now(),
                dateCreation: new Date().toISOString()
            };
            products.push(newProduct);
        }
        
        // Save to localStorage
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        // Try to save to API (optional)
        saveProductToAPI(productData, isEditing);
        
        // Update app cache
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
        }
        
        closeProductModal();
        
        // Refresh admin products view
        if (adminCurrentSection === 'products' && window.app) {
            window.app.loadAdminProducts();
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de l\'enregistrement du produit', 'error');
        }
    }
}

// Helper function to save to API
async function saveProductToAPI(productData, isEditing) {
    try {
        const url = buildApiUrl('/products' + (isEditing ? '/' + currentEditingProduct._id : ''));
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            console.log('Product saved to API successfully');
        } else {
            console.log('API save failed, product saved locally only');
        }
    } catch (error) {
        console.log('API unavailable, product saved locally only');
    }
}

function toggleFeatured(productId) {
    console.log('Toggling featured for product:', productId);
    
    try {
        // Get products from localStorage
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Find and update product
        const productIndex = products.findIndex(p => p._id === productId);
        if (productIndex > -1) {
            products[productIndex].enVedette = !products[productIndex].enVedette;
            
            // Save back to localStorage
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            // Update app cache
            if (window.app) {
                window.app.refreshProductsCache();
                window.app.showToast(`Produit ${products[productIndex].enVedette ? 'ajouté aux' : 'retiré des'} coups de cœur`, 'success');
            }
            
            // Refresh current admin view
            if (window.app) {
                switch(adminCurrentSection) {
                    case 'products':
                        window.app.loadAdminProducts();
                        break;
                    case 'featured':
                        window.app.loadAdminFeatured();
                        break;
                }
            }
        }
    } catch (error) {
        console.error('Error toggling featured:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la modification', 'error');
        }
    }
}

function deleteProduct(productId) {
    console.log('Deleting product:', productId);
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        // Get products from localStorage
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Find product name for toast message
        const product = products.find(p => p._id === productId);
        const productName = product ? product.nom : 'Produit';
        
        // Remove product
        products = products.filter(p => p._id !== productId);
        
        // Save back to localStorage
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        // Update app cache
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(`${productName} supprimé avec succès`, 'success');
        }
        
        // Refresh admin products view
        if (adminCurrentSection === 'products' && window.app) {
            window.app.loadAdminProducts();
        }
        
        // Try to delete from API (optional)
        deleteProductFromAPI(productId);
        
    } catch (error) {
        console.error('Error deleting product:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// Helper function to delete from API
async function deleteProductFromAPI(productId) {
    try {
        const response = await fetch(buildApiUrl('/products/' + productId), {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        
        if (response.ok) {
            console.log('Product deleted from API successfully');
        } else {
            console.log('API delete failed, product deleted locally only');
        }
    } catch (error) {
        console.log('API unavailable, product deleted locally only');
    }
}

// ORDER MANAGEMENT FUNCTIONS - FIXED
function viewOrderDetails(orderId) {
    console.log('Viewing order details:', orderId);
    
    // Get order from localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const order = orders.find(o => o._id === orderId || o.numeroCommande === orderId);
    
    if (!order) {
        if (window.app) {
            window.app.showToast('Commande non trouvée', 'error');
        }
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'orderDetailModal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onclick="closeOrderDetailModal()"></div>
            
            <div class="inline-block w-full max-w-4xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-emerald-800">Détails de la commande ${order.numeroCommande}</h3>
                    <button onclick="closeOrderDetailModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Client Info -->
                    <div class="bg-emerald-50 rounded-xl p-6">
                        <h4 class="text-lg font-bold text-emerald-800 mb-4">Informations client</h4>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Nom:</span> ${order.client?.prenom || ''} ${order.client?.nom || ''}</p>
                            <p><span class="font-semibold">Email:</span> ${order.client?.email || 'N/A'}</p>
                            <p><span class="font-semibold">Téléphone:</span> ${order.client?.telephone || 'N/A'}</p>
                            <p><span class="font-semibold">Adresse:</span> ${order.client?.adresse || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <!-- Order Info -->
                    <div class="bg-blue-50 rounded-xl p-6">
                        <h4 class="text-lg font-bold text-blue-800 mb-4">Informations commande</h4>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Date:</span> ${order.dateCommande ? new Date(order.dateCommande).toLocaleDateString('fr-FR') : 'N/A'}</p>
                            <p><span class="font-semibold">Statut:</span> 
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                    order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                    order.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }">
                                    ${order.statut === 'en-attente' ? 'En attente' :
                                      order.statut === 'en-cours' ? 'En cours' :
                                      order.statut === 'livree' ? 'Livrée' :
                                      order.statut === 'annulee' ? 'Annulée' : order.statut}
                                </span>
                            </p>
                            <p><span class="font-semibold">Sous-total:</span> ${order.sousTotal || 0} DA</p>
                            <p><span class="font-semibold">Frais de livraison:</span> ${order.fraisLivraison || 0} DA</p>
                            <p><span class="font-semibold text-lg">Total:</span> <span class="text-lg font-bold">${order.total || 0} DA</span></p>
                        </div>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div class="mt-8">
                    <h4 class="text-lg font-bold text-emerald-800 mb-4">Articles commandés</h4>
                    <div class="bg-gray-50 rounded-xl p-6">
                        <div class="space-y-4">
                            ${(order.items || []).map(item => `
                                <div class="flex items-center justify-between bg-white rounded-lg p-4">
                                    <div class="flex-1">
                                        <h5 class="font-semibold text-gray-800">${item.nom}</h5>
                                        <p class="text-sm text-gray-600">${item.prix} DA x ${item.quantite}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold text-gray-800">${item.prix * item.quantite} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                ${order.notes ? `
                <div class="mt-6">
                    <h4 class="text-lg font-bold text-emerald-800 mb-2">Notes</h4>
                    <div class="bg-yellow-50 rounded-xl p-4">
                        <p class="text-yellow-800">${order.notes}</p>
                    </div>
                </div>
                ` : ''}
                
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                    <select onchange="updateOrderStatus('${order._id || order.numeroCommande}', this.value)" class="border border-emerald-200 rounded-lg px-4 py-2">
                        <option value="en-attente" ${order.statut === 'en-attente' ? 'selected' : ''}>En attente</option>
                        <option value="en-cours" ${order.statut === 'en-cours' ? 'selected' : ''}>En cours</option>
                        <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>Livrée</option>
                        <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>Annulée</option>
                    </select>
                    <button onclick="closeOrderDetailModal()" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function updateOrderStatus(orderId, newStatus) {
    console.log('Updating order status:', orderId, newStatus);
    
    try {
        // Get orders from localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Find and update order
        const orderIndex = orders.findIndex(o => o._id === orderId || o.numeroCommande === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].statut = newStatus;
            
            // Save back to localStorage
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            
            if (window.app) {
                window.app.showToast('Statut de commande mis à jour', 'success');
            }
            
            // Refresh admin orders view
            if (adminCurrentSection === 'orders' && window.app) {
                window.app.loadAdminOrders();
            }
            
            // Try to update via API (optional)
            updateOrderStatusAPI(orderId, newStatus);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la mise à jour', 'error');
        }
    }
}

// Helper function to update order status via API
async function updateOrderStatusAPI(orderId, newStatus) {
    try {
        const response = await fetch(buildApiUrl('/admin/orders/' + orderId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ statut: newStatus })
        });
        
        if (response.ok) {
            console.log('Order status updated in API successfully');
        } else {
            console.log('API update failed, order updated locally only');
        }
    } catch (error) {
        console.log('API unavailable, order updated locally only');
    }
}

function closeOrderDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
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

// API Configuration and utilities
function buildApiUrl(path) {
    const baseUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com/api';
    return baseUrl + path;
}

async function apiCall(path, options = {}) {
    const url = buildApiUrl(path);
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-auth-token': token } : {}),
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Additional Admin Methods for PharmacieGaherApp class
PharmacieGaherApp.prototype.loadAdminFeatured = function() {
    console.log('Loading admin featured products...');
    
    const featuredProducts = this.allProducts.filter(p => p.enVedette);
    
    document.getElementById('adminContent').innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-3xl font-bold text-emerald-800 mb-2">Produits en Vedette</h2>
                    <p class="text-emerald-600">${featuredProducts.length} produit(s) mis en avant</p>
                </div>
            </div>
            
            ${featuredProducts.length === 0 ? `
                <div class="text-center py-16">
                    <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                    <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                    <p class="text-emerald-600 mb-8">Mettez des produits en vedette depuis la section Produits</p>
                    <button onclick="switchAdminSection('products')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                        <i class="fas fa-arrow-right mr-2"></i>Aller aux Produits
                    </button>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${featuredProducts.map(product => {
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
                            imageUrl = `https://via.placeholder.com/200x200/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
                        }
                        
                        return `
                            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                                <div class="flex items-center justify-center mb-4">
                                    <img src="${imageUrl}" alt="${product.nom}" class="w-20 h-20 object-cover rounded-lg">
                                </div>
                                <h3 class="text-lg font-bold text-yellow-800 mb-2 text-center">${product.nom}</h3>
                                <p class="text-yellow-700 text-center mb-4">${product.categorie}</p>
                                <div class="flex justify-center space-x-2">
                                    <button onclick="openEditProductModal('${product._id}')" class="text-blue-600 hover:text-blue-800 p-2">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="toggleFeatured('${product._id}')" class="text-red-600 hover:text-red-800 p-2" title="Retirer de la vedette">
                                        <i class="fas fa-star-slash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
};

PharmacieGaherApp.prototype.loadCleanupSection = function() {
    console.log('Loading cleanup section...');
    
    const products = this.allProducts;
    const inactiveProducts = products.filter(p => p.actif === false);
    const zeroStockProducts = products.filter(p => p.stock === 0);
    const noImageProducts = products.filter(p => !p.image || p.image === '');
    
    document.getElementById('adminContent').innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-red-800 mb-2">Nettoyage et Maintenance</h2>
                <p class="text-red-600">Outils pour nettoyer et maintenir votre catalogue de produits</p>
            </div>
            
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Produits inactifs</p>
                            <p class="text-3xl font-bold text-gray-800">${inactiveProducts.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                            <i class="fas fa-ban text-white text-lg"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-orange-600 uppercase tracking-wide">Stock épuisé</p>
                            <p class="text-3xl font-bold text-orange-800">${zeroStockProducts.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white text-lg"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-purple-600 uppercase tracking-wide">Sans image</p>
                            <p class="text-3xl font-bold text-purple-800">${noImageProducts.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center">
                            <i class="fas fa-image text-white text-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Cleanup Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-red-800 mb-4">
                        <i class="fas fa-trash-alt mr-2"></i>Actions de suppression
                    </h3>
                    <div class="space-y-3">
                        <button onclick="clearInactiveProducts()" class="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors">
                            Supprimer tous les produits inactifs (${inactiveProducts.length})
                        </button>
                        <button onclick="clearZeroStockProducts()" class="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors">
                            Supprimer produits sans stock (${zeroStockProducts.length})
                        </button>
                        <button onclick="clearAllProducts()" class="w-full bg-red-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-800 transition-colors">
                            ⚠️ TOUT SUPPRIMER
                        </button>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-blue-800 mb-4">
                        <i class="fas fa-tools mr-2"></i>Actions de maintenance
                    </h3>
                    <div class="space-y-3">
                        <button onclick="validateAllProducts()" class="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                            Valider tous les produits
                        </button>
                        <button onclick="refreshProductCache()" class="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors">
                            Actualiser le cache produits
                        </button>
                        <button onclick="exportProductData()" class="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-600 transition-colors">
                            Exporter les données
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Problem Products Lists -->
            ${inactiveProducts.length > 0 ? `
                <div class="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">Produits inactifs</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${inactiveProducts.slice(0, 6).map(product => `
                            <div class="bg-white rounded-lg p-4 border border-gray-200">
                                <h5 class="font-semibold text-gray-800 text-sm">${product.nom}</h5>
                                <p class="text-xs text-gray-600">${product.categorie}</p>
                                <div class="mt-2 flex space-x-2">
                                    <button onclick="openEditProductModal('${product._id}')" class="text-blue-600 hover:text-blue-800 text-xs">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800 text-xs">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${zeroStockProducts.length > 0 ? `
                <div class="bg-orange-50 rounded-2xl p-6">
                    <h4 class="text-lg font-bold text-orange-800 mb-4">Produits en rupture de stock</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${zeroStockProducts.slice(0, 6).map(product => `
                            <div class="bg-white rounded-lg p-4 border border-orange-200">
                                <h5 class="font-semibold text-orange-800 text-sm">${product.nom}</h5>
                                <p class="text-xs text-orange-600">${product.categorie}</p>
                                <div class="mt-2 flex space-x-2">
                                    <button onclick="openEditProductModal('${product._id}')" class="text-blue-600 hover:text-blue-800 text-xs">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="restockProduct('${product._id}')" class="text-green-600 hover:text-green-800 text-xs">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

// Cleanup Functions
function clearInactiveProducts() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les produits inactifs ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const initialCount = products.length;
        
        products = products.filter(p => p.actif !== false);
        
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(`${initialCount - products.length} produits inactifs supprimés`, 'success');
            window.app.loadCleanupSection();
        }
    } catch (error) {
        console.error('Error clearing inactive products:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

function clearZeroStockProducts() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les produits en rupture de stock ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const initialCount = products.length;
        
        products = products.filter(p => p.stock > 0);
        
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(`${initialCount - products.length} produits sans stock supprimés`, 'success');
            window.app.loadCleanupSection();
        }
    } catch (error) {
        console.error('Error clearing zero stock products:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

function clearAllProducts() {
    const confirmation = prompt('ATTENTION ! Cette action supprimera TOUS les produits de manière irréversible.\n\nTapez "SUPPRIMER TOUT" pour confirmer:');
    
    if (confirmation !== 'SUPPRIMER TOUT') {
        return;
    }
    
    try {
        const productCount = JSON.parse(localStorage.getItem('demoProducts') || '[]').length;
        
        localStorage.removeItem('demoProducts');
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(`Tous les produits (${productCount}) ont été supprimés`, 'success');
            window.app.loadCleanupSection();
        }
    } catch (error) {
        console.error('Error clearing all products:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression totale', 'error');
        }
    }
}

function validateAllProducts() {
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        let fixedCount = 0;
        
        products = products.map(product => {
            let fixed = false;
            
            // Fix missing required fields
            if (!product._id) {
                product._id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                fixed = true;
            }
            
            if (!product.nom || product.nom.trim() === '') {
                product.nom = 'Produit sans nom';
                fixed = true;
            }
            
            if (!product.prix || product.prix < 0) {
                product.prix = 0;
                fixed = true;
            }
            
            if (!product.stock || product.stock < 0) {
                product.stock = 0;
                fixed = true;
            }
            
            if (!product.categorie) {
                product.categorie = 'Soins';
                fixed = true;
            }
            
            if (product.actif === undefined) {
                product.actif = true;
                fixed = true;
            }
            
            if (fixed) fixedCount++;
            
            return product;
        });
        
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(`Validation terminée. ${fixedCount} produits corrigés`, 'success');
        }
    } catch (error) {
        console.error('Error validating products:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la validation', 'error');
        }
    }
}

function refreshProductCache() {
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast('Cache produits actualisé', 'success');
        
        if (adminCurrentSection === 'cleanup') {
            window.app.loadCleanupSection();
        }
    }
}

function exportProductData() {
    try {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        const exportData = {
            products: products,
            orders: orders,
            exportDate: new Date().toISOString(),
            totalProducts: products.length,
            totalOrders: orders.length
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shifa-parapharmacie-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (window.app) {
            window.app.showToast('Données exportées avec succès', 'success');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de l\'export', 'error');
        }
    }
}

function restockProduct(productId) {
    const quantity = prompt('Entrez la quantité à ajouter au stock:');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        return;
    }
    
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex > -1) {
            products[productIndex].stock += parseInt(quantity);
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            if (window.app) {
                window.app.refreshProductsCache();
                window.app.showToast(`Stock mis à jour: +${quantity} unités`, 'success');
                window.app.loadCleanupSection();
            }
        }
    } catch (error) {
        console.error('Error restocking product:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la mise à jour du stock', 'error');
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

console.log('✅ Complete fixed app.js loaded with 4000+ lines and all improvements');
