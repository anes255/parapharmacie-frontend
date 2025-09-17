// Enhanced PharmacieGaherApp with Order Confirmation Page and Complete Functionality
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
    
    // NEW METHOD: Order Confirmation Page
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-4xl">
                <!-- Success Animation -->
                <div class="text-center mb-12">
                    <div class="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-8 shadow-2xl animate-bounce">
                        <i class="fas fa-check text-white text-5xl"></i>
                    </div>
                    <h1 class="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
                        Commande Confirmée !
                    </h1>
                    <p class="text-xl text-emerald-600 mb-8">
                        Merci pour votre commande. Nous avons bien reçu votre demande.
                    </p>
                </div>
                
                <!-- Order Details -->
                <div class="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-8 mb-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-2">Numéro de commande</h2>
                        <div class="bg-white border-2 border-emerald-300 rounded-xl px-6 py-4 inline-block">
                            <span class="text-3xl font-mono font-bold text-emerald-700">#${orderNumber}</span>
                        </div>
                        <p class="text-emerald-600 mt-4">
                            Conservez ce numéro pour suivre votre commande
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div class="text-center p-6 bg-white/60 rounded-xl">
                            <i class="fas fa-clock text-3xl text-emerald-600 mb-4"></i>
                            <h3 class="font-bold text-emerald-800 mb-2">Traitement</h3>
                            <p class="text-sm text-emerald-600">Votre commande sera traitée sous 24h</p>
                        </div>
                        
                        <div class="text-center p-6 bg-white/60 rounded-xl">
                            <i class="fas fa-truck text-3xl text-emerald-600 mb-4"></i>
                            <h3 class="font-bold text-emerald-800 mb-2">Livraison</h3>
                            <p class="text-sm text-emerald-600">Livraison prévue sous 2-5 jours ouvrés</p>
                        </div>
                        
                        <div class="text-center p-6 bg-white/60 rounded-xl">
                            <i class="fas fa-envelope text-3xl text-emerald-600 mb-4"></i>
                            <h3 class="font-bold text-emerald-800 mb-2">Confirmation</h3>
                            <p class="text-sm text-emerald-600">Un email de confirmation vous sera envoyé</p>
                        </div>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div class="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
                    <h3 class="text-2xl font-bold text-blue-800 mb-6 text-center">Prochaines étapes</h3>
                    <div class="space-y-4">
                        <div class="flex items-start space-x-4">
                            <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <h4 class="font-semibold text-blue-800">Confirmation de votre commande</h4>
                                <p class="text-blue-600 text-sm">Nous vérifions la disponibilité des produits et préparons votre commande</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start space-x-4">
                            <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <h4 class="font-semibold text-blue-800">Préparation et emballage</h4>
                                <p class="text-blue-600 text-sm">Vos produits sont soigneusement emballés pour l'expédition</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start space-x-4">
                            <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                            <div>
                                <h4 class="font-semibold text-blue-800">Expédition et livraison</h4>
                                <p class="text-blue-600 text-sm">Votre commande est expédiée et livrée à l'adresse indiquée</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Information -->
                <div class="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Besoin d'aide ?</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="text-center">
                            <i class="fas fa-phone text-3xl text-emerald-600 mb-4"></i>
                            <h4 class="font-semibold text-gray-800 mb-2">Appelez-nous</h4>
                            <p class="text-emerald-600 font-semibold">+213 123 456 789</p>
                            <p class="text-gray-600 text-sm">Lun-Sam: 8h-20h</p>
                        </div>
                        
                        <div class="text-center">
                            <i class="fas fa-envelope text-3xl text-emerald-600 mb-4"></i>
                            <h4 class="font-semibold text-gray-800 mb-2">Écrivez-nous</h4>
                            <p class="text-emerald-600 font-semibold">pharmaciegaher@gmail.com</p>
                            <p class="text-gray-600 text-sm">Réponse sous 24h</p>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="text-center space-y-4">
                    <div class="space-x-4">
                        <button onclick="app.showPage('products')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            <i class="fas fa-shopping-bag mr-2"></i>
                            Continuer mes achats
                        </button>
                        
                        <button onclick="app.showPage('home')" 
                                class="bg-gray-100 text-gray-700 font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-all">
                            <i class="fas fa-home mr-2"></i>
                            Retour à l'accueil
                        </button>
                    </div>
                    
                    ${this.currentUser ? `
                    <div class="mt-4">
                        <button onclick="app.showPage('profile')" 
                                class="text-emerald-600 hover:text-emerald-800 font-semibold">
                            <i class="fas fa-user mr-2"></i>
                            Voir mes commandes
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Show success toast
        setTimeout(() => {
            this.showToast('🎉 Votre commande a été passée avec succès !', 'success');
        }, 500);
        
        // Add confetti effect if available
        if (typeof confetti !== 'undefined') {
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }, 1000);
        }
    }
    
    // NEW METHOD: Load Products Page
    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        // Filter products based on parameters
        let filteredProducts = [...this.allProducts];
        
        if (params.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm)
            );
        }
        
        const title = params.categorie ? `Catégorie: ${params.categorie}` : 
                     params.search ? `Résultats pour: "${params.search}"` : 
                     'Tous nos produits';
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">${title}</h1>
                    <p class="text-xl text-emerald-600">${filteredProducts.length} produit(s) trouvé(s)</p>
                </div>
                
                ${filteredProducts.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-search text-6xl text-gray-300 mb-6"></i>
                        <h3 class="text-2xl font-bold text-gray-700 mb-4">Aucun produit trouvé</h3>
                        <p class="text-gray-600 mb-8">Essayez avec d'autres mots-clés ou explorez nos catégories</p>
                        <button onclick="app.showPage('home')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${filteredProducts.map(product => this.createProductCard(product)).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    // NEW METHOD: Load Single Product Page
    async loadProductPage(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Product Image -->
                    <div class="relative">
                        <img src="${product.image || this.generateProductImage(product)}" 
                             alt="${product.nom}" 
                             class="w-full h-96 object-cover rounded-2xl shadow-xl">
                        ${hasPromotion ? `<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                        ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                            <span class="text-white font-bold text-2xl">Rupture de stock</span>
                        </div>` : ''}
                    </div>
                    
                    <!-- Product Details -->
                    <div class="space-y-6">
                        <div>
                            <h1 class="text-4xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                            <p class="text-emerald-600 text-lg mb-4">${product.description || 'Description du produit'}</p>
                            
                            <div class="flex items-center space-x-4 mb-6">
                                ${hasPromotion ? `
                                    <span class="text-3xl font-bold text-red-600">${product.prix} DA</span>
                                    <span class="text-xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                ` : `
                                    <span class="text-3xl font-bold text-emerald-700">${product.prix} DA</span>
                                `}
                            </div>
                            
                            <div class="text-emerald-600 mb-6">
                                <p><strong>Catégorie:</strong> ${product.categorie}</p>
                                <p><strong>Stock disponible:</strong> ${product.stock} unités</p>
                                ${product.marque ? `<p><strong>Marque:</strong> ${product.marque}</p>` : ''}
                            </div>
                        </div>
                        
                        ${!isOutOfStock ? `
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center border border-emerald-300 rounded-lg">
                                    <button onclick="changeQuantity(-1)" class="px-4 py-2 text-emerald-600 hover:bg-emerald-50">-</button>
                                    <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                           class="w-16 text-center border-none focus:ring-0">
                                    <button onclick="changeQuantity(1)" class="px-4 py-2 text-emerald-600 hover:bg-emerald-50">+</button>
                                </div>
                                
                                <button onclick="addToCartWithQuantity('${product._id}')" 
                                        class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                    <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                                </button>
                            </div>
                        ` : `
                            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p class="text-red-800 font-semibold">Ce produit est actuellement en rupture de stock.</p>
                            </div>
                        `}
                        
                        ${product.ingredients || product.modeEmploi || product.precautions ? `
                            <div class="space-y-4 pt-6 border-t border-emerald-200">
                                ${product.ingredients ? `
                                    <div>
                                        <h3 class="font-semibold text-emerald-800 mb-2">Ingrédients</h3>
                                        <p class="text-emerald-600">${product.ingredients}</p>
                                    </div>
                                ` : ''}
                                
                                ${product.modeEmploi ? `
                                    <div>
                                        <h3 class="font-semibold text-emerald-800 mb-2">Mode d'emploi</h3>
                                        <p class="text-emerald-600">${product.modeEmploi}</p>
                                    </div>
                                ` : ''}
                                
                                ${product.precautions ? `
                                    <div>
                                        <h3 class="font-semibold text-emerald-800 mb-2">Précautions</h3>
                                        <p class="text-emerald-600">${product.precautions}</p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW METHOD: Load Login Page
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">Connexion</h1>
                        <p class="text-emerald-600">Connectez-vous à votre compte</p>
                    </div>
                    
                    <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                   placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                   placeholder="Votre mot de passe">
                        </div>
                        
                        <button type="submit" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            Se connecter
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-gray-600">Pas encore de compte ?</p>
                        <button onclick="app.showPage('register')" class="text-emerald-600 hover:text-emerald-800 font-semibold">
                            Créer un compte
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW METHOD: Load Register Page
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 max-w-2xl">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">Inscription</h1>
                        <p class="text-emerald-600">Créez votre compte Shifa</p>
                    </div>
                    
                    <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                <input type="text" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Votre prénom">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                <input type="text" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="Votre nom">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                   placeholder="votre@email.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <input type="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                   placeholder="Mot de passe sécurisé">
                        </div>
                        
                        <button type="submit" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            Créer mon compte
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-gray-600">Déjà un compte ?</p>
                        <button onclick="app.showPage('login')" class="text-emerald-600 hover:text-emerald-800 font-semibold">
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW METHOD: Load Profile Page
    async loadProfilePage() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <h1 class="text-4xl font-bold text-emerald-800 mb-8">Mon Profil</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Profile Info -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <div class="text-center mb-6">
                                <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span class="text-white text-2xl font-bold">${this.currentUser?.prenom?.[0]}${this.currentUser?.nom?.[0]}</span>
                                </div>
                                <h2 class="text-xl font-bold text-emerald-800">${this.currentUser?.prenom} ${this.currentUser?.nom}</h2>
                                <p class="text-emerald-600">${this.currentUser?.email}</p>
                            </div>
                            
                            <div class="space-y-3">
                                <button class="w-full text-left p-3 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <i class="fas fa-user mr-3 text-emerald-600"></i>Informations personnelles
                                </button>
                                <button class="w-full text-left p-3 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <i class="fas fa-box mr-3 text-emerald-600"></i>Mes commandes
                                </button>
                                <button onclick="app.logout()" class="w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                                    <i class="fas fa-sign-out-alt mr-3"></i>Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profile Content -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h3 class="text-2xl font-bold text-emerald-800 mb-6">Mes Commandes</h3>
                            <p class="text-emerald-600">Aucune commande pour le moment</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW METHOD: Load Checkout Page
    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        const sousTotal = this.getCartTotal();
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <h1 class="text-4xl font-bold text-emerald-800 mb-8 text-center">Finaliser ma commande</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Order Form -->
                    <div class="space-y-8">
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                            
                            <form id="checkoutForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" id="checkoutPrenom" required 
                                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                               placeholder="Votre prénom" value="${this.currentUser?.prenom || ''}">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                        <input type="text" id="checkoutNom" required 
                                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                               placeholder="Votre nom" value="${this.currentUser?.nom || ''}">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input type="email" id="checkoutEmail" required 
                                           class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                           placeholder="votre@email.com" value="${this.currentUser?.email || ''}">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="checkoutTelephone" required 
                                           class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                           placeholder="+213 123 456 789" value="${this.currentUser?.telephone || ''}">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                    <textarea id="checkoutAdresse" required rows="3"
                                              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                              placeholder="Adresse complète avec détails">${this.currentUser?.adresse || ''}</textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                    <select id="checkoutWilaya" required onchange="window.checkoutSystem?.calculateShipping()"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="">Sélectionnez votre wilaya</option>
                                        <option value="Alger">Alger</option>
                                        <option value="Blida">Blida</option>
                                        <option value="Tipaza">Tipaza</option>
                                        <option value="Boumerdès">Boumerdès</option>
                                        <option value="Médéa">Médéa</option>
                                        <option value="Autre">Autre wilaya</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-4">Mode de paiement</label>
                                    <div class="space-y-3">
                                        <label class="flex items-center p-4 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50">
                                            <input type="radio" name="modePaiement" value="Paiement à la livraison" checked
                                                   class="mr-3 text-emerald-600 focus:ring-emerald-500">
                                            <div class="flex-1">
                                                <div class="font-medium text-emerald-800">Paiement à la livraison</div>
                                                <div class="text-sm text-emerald-600">Payez en espèces lors de la réception</div>
                                            </div>
                                            <i class="fas fa-money-bill-wave text-emerald-600"></i>
                                        </label>
                                    </div>
                                    <div id="paymentMethodInfo"></div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Commentaires (optionnel)</label>
                                    <textarea id="checkoutCommentaires" rows="3"
                                              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                              placeholder="Instructions spéciales, horaires de livraison préférés..."></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="space-y-6">
                        <!-- Cart Items -->
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h3 class="text-xl font-bold text-emerald-800 mb-6">Récapitulatif de commande</h3>
                            
                            <div class="space-y-4 mb-6">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-4 p-4 bg-emerald-50 rounded-xl">
                                        <img src="${item.image}" alt="${item.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                                            <p class="text-emerald-600 text-sm">Quantité: ${item.quantite}</p>
                                        </div>
                                        <div class="text-emerald-700 font-semibold">
                                            ${item.prix * item.quantite} DA
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Totals -->
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <div class="space-y-4">
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Sous-total:</span>
                                    <span class="text-emerald-800" id="checkoutSousTotal">${sousTotal} DA</span>
                                </div>
                                
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Frais de livraison:</span>
                                    <span class="text-emerald-800" id="checkoutFraisLivraison">
                                        <span id="shippingCost">${fraisLivraison} DA</span>
                                    </span>
                                </div>
                                
                                <div id="shippingMessage"></div>
                                
                                <div class="border-t border-emerald-200 pt-4">
                                    <div class="flex justify-between text-xl font-bold">
                                        <span class="text-emerald-800">Total:</span>
                                        <span class="text-emerald-600" id="checkoutTotal">${total} DA</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button onclick="app.processOrder()" 
                                    class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
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
    
    // ENHANCED METHOD: Process Order
    async processOrder() {
        try {
            if (window.checkoutSystem && typeof window.checkoutSystem.processOrder === 'function') {
                await window.checkoutSystem.processOrder();
            } else {
                throw new Error('Système de commande non disponible');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            this.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
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
    
    generateProductImage(product) {
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
        return `https://via.placeholder.com/400x400/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
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

// Global functions - CRITICAL FIXES
function addToCartFromCard(productId, quantity = 1) {
    console.log('Add to cart from card called:', productId);
    if (window.app && typeof window.app.addToCart === 'function') {
        window.app.addToCart(productId, quantity);
    } else {
        console.error('App not available');
    }
}

function addToCartWithQuantity(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    if (window.app && typeof window.app.addToCart === 'function') {
        window.app.addToCart(productId, quantity);
    } else {
        console.error('App not available');
    }
}

function changeQuantity(delta) {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const newValue = Math.max(1, Math.min(parseInt(quantityInput.max) || 99, currentValue + delta));
        quantityInput.value = newValue;
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

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || event.target.querySelector('input[type="password"]').value;
    
    // Simple demo login
    if (email === 'pharmaciegaher@gmail.com' && password === 'anesaya75') {
        // Admin login
        window.app.currentUser = {
            id: 'admin-1',
            prenom: 'Admin',
            nom: 'Shifa',
            email: 'pharmaciegaher@gmail.com',
            role: 'admin'
        };
        
        localStorage.setItem('token', 'admin-demo-token');
        window.app.updateUserUI();
        window.app.showToast('Connexion administrateur réussie', 'success');
        window.app.showPage('admin');
    } else {
        // Regular user login (demo)
        window.app.currentUser = {
            id: 'user-' + Date.now(),
            prenom: 'Utilisateur',
            nom: 'Demo',
            email: email,
            role: 'user'
        };
        
        localStorage.setItem('token', 'user-demo-token');
        window.app.updateUserUI();
        window.app.showToast('Connexion réussie', 'success');
        window.app.showPage('home');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const inputs = event.target.querySelectorAll('input');
    const prenom = inputs[0].value;
    const nom = inputs[1].value;
    const email = inputs[2].value;
    const password = inputs[3].value;
    
    // Simple demo registration
    window.app.currentUser = {
        id: 'user-' + Date.now(),
        prenom: prenom,
        nom: nom,
        email: email,
        role: 'user'
    };
    
    localStorage.setItem('token', 'user-demo-token');
    window.app.updateUserUI();
    window.app.showToast('Inscription réussie !', 'success');
    window.app.showPage('home');
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// CSS for toasts and animations
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: relative;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast.info {
        background-color: #dbeafe;
        border: 1px solid #93c5fd;
        color: #1e40af;
    }
    
    .toast.success {
        background-color: #d1fae5;
        border: 1px solid #6ee7b7;
        color: #065f46;
    }
    
    .toast.error {
        background-color: #fee2e2;
        border: 1px solid #fca5a5;
        color: #991b1b;
    }
    
    .toast.warning {
        background-color: #fef3c7;
        border: 1px solid #fcd34d;
        color: #92400e;
    }
    
    .badge-promotion {
        background: linear-gradient(45deg, #ef4444, #dc2626);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .quantity-selector {
        display: flex;
        align-items: center;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    
    .quantity-selector button {
        padding: 0.25rem 0.5rem;
        background: #f9fafb;
        border: none;
        color: #374151;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .quantity-selector button:hover {
        background: #e5e7eb;
    }
    
    .quantity-selector input {
        border: none;
        text-align: center;
        width: 3rem;
        padding: 0.25rem;
        outline: none;
    }
    
    .cart-item {
        padding: 1rem;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .hero-gradient {
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
    }
    
    .float-animation {
        animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    .pulse-slow {
        animation: pulse 3s infinite;
    }
    
    .category-icon {
        width: 4rem;
        height: 4rem;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        color: white;
        font-size: 1.5rem;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        transition: all 0.3s ease;
    }
    
    .category-card:hover .category-icon {
        transform: scale(1.1);
        box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
    }
    
    .product-card {
        transition: all 0.3s ease;
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .btn-primary:hover {
        background: linear-gradient(135deg, #059669, #047857);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .form-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        transition: all 0.2s;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
`;
document.head.appendChild(style);

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('App initialized and made globally available');
});

console.log('✅ Enhanced app.js loaded with complete functionality and order confirmation page');
