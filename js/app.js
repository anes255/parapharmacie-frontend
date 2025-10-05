// ============================================================================
// COMPLETE PharmacieGaherApp - All Pages & Features - FIXED VERSION
// ============================================================================

// UTILITY: Generate placeholder image using canvas instead of via.placeholder.com
function generatePlaceholder(width, height, bgColor, textColor, text) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = `#${bgColor}`;
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = `#${textColor}`;
    ctx.font = `bold ${Math.floor(width / 4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL('image/png');
}

// UTILITY: Preview uploaded image
function previewImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        if (window.app) {
            window.app.showToast('Image trop volumineuse. Maximum 2MB', 'error');
        }
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const imageUrlInput = document.getElementById('productImageUrl');
        
        if (preview && placeholder && imageUrlInput) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
            imageUrlInput.value = e.target.result; // Store base64
        }
    };
    reader.readAsDataURL(file);
}

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
        this.backendReady = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.wakeUpBackend();
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
    
    async wakeUpBackend() {
        const loadingScreen = document.getElementById('serverLoadingScreen');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (!loadingScreen) {
            console.log('No loading screen found, skipping wake-up');
            this.backendReady = true;
            return;
        }
        
        loadingScreen.classList.remove('hidden');
        
        const messages = [
            '🌱 Réveil du serveur en cours...',
            '🔄 Connexion à la base de données...',
            '📦 Chargement des produits...',
            '✨ Préparation de l\'interface...',
            '🎉 Presque prêt...'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (messageIndex < messages.length && loadingMessage) {
                loadingMessage.textContent = messages[messageIndex];
                messageIndex++;
            }
        }, 2000);
        
        const maxAttempts = 10;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            try {
                console.log(`🔄 Tentative ${attempt + 1}/${maxAttempts} de connexion au backend...`);
                
                const response = await fetch(buildApiUrl('/products'), {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    console.log('✅ Backend is awake and ready!');
                    this.backendReady = true;
                    clearInterval(messageInterval);
                    
                    if (loadingMessage) {
                        loadingMessage.textContent = '✅ Connexion établie !';
                    }
                    
                    setTimeout(() => {
                        if (loadingScreen) {
                            loadingScreen.classList.add('fade-out');
                            setTimeout(() => {
                                loadingScreen.classList.add('hidden');
                            }, 500);
                        }
                    }, 500);
                    
                    return;
                }
            } catch (error) {
                console.log(`⏳ Tentative ${attempt + 1} échouée, nouvelle tentative dans 3s...`);
            }
            
            attempt++;
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        clearInterval(messageInterval);
        console.log('⚠️ Backend not responding, continuing with local data');
        
        if (loadingMessage) {
            loadingMessage.textContent = '⚠️ Mode hors ligne - Utilisation des données locales';
        }
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }
        }, 1500);
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
    
    async loginUser(email, password) {
        try {
            console.log('🔐 Attempting login with:', { email, hasPassword: !!password });
            
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }
            
            const requestBody = {
                email: email.trim(),
                password: password
            };
            
            console.log('📤 Sending login request...');
            
            const response = await fetch(buildApiUrl('/auth/login'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }
            
            localStorage.setItem('token', data.token);
            this.currentUser = data.user;
            this.updateUserUI();
            this.showToast('Connexion réussie !', 'success');
            
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    this.showPage('admin');
                } else {
                    this.showPage('home');
                }
            }, 500);
            
            return data;
        } catch (error) {
            console.error('❌ Erreur login:', error);
            this.showToast(error.message, 'error');
            throw error;
        }
    }
    
    async registerUser(userData) {
        try {
            const response = await fetch(buildApiUrl('/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur d\'inscription');
            }
            
            localStorage.setItem('token', data.token);
            this.currentUser = data.user;
            this.updateUserUI();
            this.showToast('Inscription réussie !', 'success');
            
            setTimeout(() => this.showPage('home'), 500);
            
            return data;
        } catch (error) {
            console.error('Erreur register:', error);
            this.showToast(error.message, 'error');
            throw error;
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
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
                console.log('API unavailable, using local products only');
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
                        <p class="text-emerald-600 mb-8">Ajoutez des produits en vedette depuis l'administration</p>
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
    
    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        let filteredProducts = [...this.allProducts].filter(p => p.actif !== false);
        
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
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 class="text-4xl font-bold text-emerald-800 mb-2">
                                ${params.categorie ? params.categorie : params.search ? 'Résultats de recherche' : 'Tous les produits'}
                            </h1>
                            <p class="text-emerald-600">${filteredProducts.length} produit(s) trouvé(s)</p>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <select id="sortProducts" class="form-input" onchange="sortProducts(this.value)">
                                <option value="default">Trier par</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                                <option value="name-asc">Nom A-Z</option>
                                <option value="name-desc">Nom Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="productsGrid">
                    ${filteredProducts.length === 0 ? `
                        <div class="col-span-full text-center py-16">
                            <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-700 mb-2">Aucun produit trouvé</h3>
                            <p class="text-gray-500">Essayez d'autres critères de recherche</p>
                        </div>
                    ` : filteredProducts.map(product => this.createProductCard(product)).join('')}
                </div>
            </div>
        `;
        
        this.currentFilteredProducts = filteredProducts;
    }
    
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
        
        let imageUrl;
        if (product.image && product.image.startsWith('http')) {
            imageUrl = product.image;
        } else if (product.image && product.image.startsWith('data:image')) {
            imageUrl = product.image;
        } else {
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            imageUrl = generatePlaceholder(500, 500, '10b981', 'ffffff', initials);
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <button onclick="history.back()" class="btn-secondary mb-6">
                    <i class="fas fa-arrow-left mr-2"></i>Retour
                </button>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="relative">
                        ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-10">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                        <img src="${imageUrl}" alt="${product.nom}" 
                             class="w-full rounded-2xl shadow-2xl border-4 border-emerald-100"
                             onerror="this.src='${generatePlaceholder(500, 500, '10b981', 'ffffff', product.nom.substring(0, 2).toUpperCase())}'">
                    </div>
                    
                    <div>
                        <div class="mb-6">
                            <span class="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                ${product.categorie}
                            </span>
                            <h1 class="text-4xl font-bold text-emerald-900 mb-4">${product.nom}</h1>
                            <p class="text-lg text-gray-600 mb-6">${product.description || 'Description du produit'}</p>
                        </div>
                        
                        <div class="bg-emerald-50 rounded-2xl p-6 mb-6">
                            <div class="flex items-center justify-between mb-4">
                                ${hasPromotion ? `
                                    <div>
                                        <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                        <span class="text-5xl font-bold text-red-600 ml-4">${product.prix} DA</span>
                                    </div>
                                ` : `
                                    <span class="text-5xl font-bold text-emerald-700">${product.prix} DA</span>
                                `}
                            </div>
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-700">Marque:</span>
                                    <span class="font-semibold text-emerald-800">${product.marque || 'Non spécifié'}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-700">Stock disponible:</span>
                                    <span class="font-semibold ${isOutOfStock ? 'text-red-600' : 'text-emerald-600'}">
                                        ${isOutOfStock ? 'Rupture de stock' : product.stock + ' unités'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        ${!isOutOfStock ? `
                            <div class="flex items-center space-x-4 mb-6">
                                <label class="text-gray-700 font-semibold">Quantité:</label>
                                <div class="quantity-selector">
                                    <button onclick="updateProductQuantity(-1)">-</button>
                                    <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                                    <button onclick="updateProductQuantity(1)">+</button>
                                </div>
                            </div>
                            
                            <button onclick="addProductToCart()" class="btn-primary w-full py-4 text-lg">
                                <i class="fas fa-cart-plus mr-3"></i>
                                Ajouter au panier
                            </button>
                        ` : `
                            <div class="bg-red-100 border border-red-300 rounded-xl p-4 text-center">
                                <i class="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
                                <p class="text-red-800 font-semibold">Ce produit est actuellement en rupture de stock</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200">
                        <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white text-center">
                            <i class="fas fa-user-circle text-6xl mb-4"></i>
                            <h2 class="text-3xl font-bold">Connexion</h2>
                            <p class="text-emerald-100 mt-2">Accédez à votre compte</p>
                        </div>
                        
                        <form id="loginForm" class="p-8 space-y-6" onsubmit="handleLogin(event)">
                            <div>
                                <label for="loginEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <div class="relative">
                                    <i class="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500"></i>
                                    <input type="email" id="loginEmail" required 
                                           class="form-input pl-12" 
                                           placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div>
                                <label for="loginPassword" class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                                <div class="relative">
                                    <i class="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500"></i>
                                    <input type="password" id="loginPassword" required 
                                           class="form-input pl-12" 
                                           placeholder="••••••••">
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary w-full py-3 text-lg">
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                Se connecter
                            </button>
                            
                            <div class="text-center">
                                <p class="text-gray-600">
                                    Pas encore de compte ?
                                    <button type="button" onclick="app.showPage('register')" class="text-emerald-600 font-semibold hover:text-emerald-700">
                                        S'inscrire
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-2xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200">
                        <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white text-center">
                            <i class="fas fa-user-plus text-6xl mb-4"></i>
                            <h2 class="text-3xl font-bold">Inscription</h2>
                            <p class="text-emerald-100 mt-2">Créez votre compte</p>
                        </div>
                        
                        <form id="registerForm" class="p-8 space-y-6" onsubmit="handleRegister(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="registerPrenom" class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                    <input type="text" id="registerPrenom" required class="form-input" placeholder="Votre prénom">
                                </div>
                                <div>
                                    <label for="registerNom" class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                    <input type="text" id="registerNom" required class="form-input" placeholder="Votre nom">
                                </div>
                            </div>
                            
                            <div>
                                <label for="registerEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input type="email" id="registerEmail" required class="form-input" placeholder="votre@email.com">
                            </div>
                            
                            <div>
                                <label for="registerTelephone" class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                <input type="tel" id="registerTelephone" required class="form-input" placeholder="+213 555 123 456">
                            </div>
                            
                            <div>
                                <label for="registerWilaya" class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                <select id="registerWilaya" required class="form-input">
                                    <option value="">Sélectionnez votre wilaya</option>
                                    <option value="Adrar">01 - Adrar</option>
                                    <option value="Chlef">02 - Chlef</option>
                                    <option value="Laghouat">03 - Laghouat</option>
                                    <option value="Oum El Bouaghi">04 - Oum El Bouaghi</option>
                                    <option value="Batna">05 - Batna</option>
                                    <option value="Béjaïa">06 - Béjaïa</option>
                                    <option value="Biskra">07 - Biskra</option>
                                    <option value="Béchar">08 - Béchar</option>
                                    <option value="Blida">09 - Blida</option>
                                    <option value="Bouira">10 - Bouira</option>
                                    <option value="Tamanrasset">11 - Tamanrasset</option>
                                    <option value="Tébessa">12 - Tébessa</option>
                                    <option value="Tlemcen">13 - Tlemcen</option>
                                    <option value="Tiaret">14 - Tiaret</option>
                                    <option value="Tizi Ouzou">15 - Tizi Ouzou</option>
                                    <option value="Alger">16 - Alger</option>
                                    <option value="Djelfa">17 - Djelfa</option>
                                    <option value="Jijel">18 - Jijel</option>
                                    <option value="Sétif">19 - Sétif</option>
                                    <option value="Saïda">20 - Saïda</option>
                                    <option value="Skikda">21 - Skikda</option>
                                    <option value="Sidi Bel Abbès">22 - Sidi Bel Abbès</option>
                                    <option value="Annaba">23 - Annaba</option>
                                    <option value="Guelma">24 - Guelma</option>
                                    <option value="Constantine">25 - Constantine</option>
                                    <option value="Médéa">26 - Médéa</option>
                                    <option value="Mostaganem">27 - Mostaganem</option>
                                    <option value="M'Sila">28 - M'Sila</option>
                                    <option value="Mascara">29 - Mascara</option>
                                    <option value="Ouargla">30 - Ouargla</option>
                                    <option value="Oran">31 - Oran</option>
                                    <option value="El Bayadh">32 - El Bayadh</option>
                                    <option value="Illizi">33 - Illizi</option>
                                    <option value="Bordj Bou Arreridj">34 - Bordj Bou Arreridj</option>
                                    <option value="Boumerdès">35 - Boumerdès</option>
                                    <option value="El Tarf">36 - El Tarf</option>
                                    <option value="Tindouf">37 - Tindouf</option>
                                    <option value="Tissemsilt">38 - Tissemsilt</option>
                                    <option value="El Oued">39 - El Oued</option>
                                    <option value="Khenchela">40 - Khenchela</option>
                                    <option value="Souk Ahras">41 - Souk Ahras</option>
                                    <option value="Tipaza">42 - Tipaza</option>
                                    <option value="Mila">43 - Mila</option>
                                    <option value="Aïn Defla">44 - Aïn Defla</option>
                                    <option value="Naâma">45 - Naâma</option>
                                    <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
                                    <option value="Ghardaïa">47 - Ghardaïa</option>
                                    <option value="Relizane">48 - Relizane</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="registerAdresse" class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                                <input type="text" id="registerAdresse" class="form-input" placeholder="Votre adresse complète">
                            </div>
                            
                            <div>
                                <label for="registerPassword" class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                                <input type="password" id="registerPassword" required class="form-input" placeholder="••••••••" minlength="6">
                            </div>
                            
                            <div>
                                <label for="registerConfirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe *</label>
                                <input type="password" id="registerConfirmPassword" required class="form-input" placeholder="••••••••" minlength="6">
                            </div>
                            
                            <button type="submit" class="btn-primary w-full py-3 text-lg">
                                <i class="fas fa-user-plus mr-2"></i>
                                Créer mon compte
                            </button>
                            
                            <div class="text-center">
                                <p class="text-gray-600">
                                    Déjà un compte ?
                                    <button type="button" onclick="app.showPage('login')" class="text-emerald-600 font-semibold hover:text-emerald-700">
                                        Se connecter
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadProfilePage() {
        if (!this.currentUser) {
            this.showPage('login');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        let orders = [];
        try {
            const response = await fetch(buildApiUrl('/orders/my-orders'), {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (response.ok) {
                const data = await response.json();
                orders = data.orders || [];
            }
        } catch (error) {
            console.log('Cannot load orders from API');
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200 mb-8">
                        <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white">
                            <div class="flex items-center space-x-6">
                                <div class="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <i class="fas fa-user text-5xl"></i>
                                </div>
                                <div>
                                    <h1 class="text-3xl font-bold mb-2">${this.currentUser.prenom} ${this.currentUser.nom}</h1>
                                    <p class="text-emerald-100">${this.currentUser.email}</p>
                                    <p class="text-emerald-100">${this.currentUser.telephone || ''}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations personnelles</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                                    <p class="text-gray-900">${this.currentUser.adresse || 'Non renseignée'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya</label>
                                    <p class="text-gray-900">${this.currentUser.wilaya || 'Non renseignée'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200">
                        <div class="p-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Mes commandes</h2>
                            
                            ${orders.length === 0 ? `
                                <div class="text-center py-12">
                                    <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                                    <h3 class="text-xl font-bold text-gray-700 mb-2">Aucune commande</h3>
                                    <p class="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                                    <button onclick="app.showPage('products')" class="btn-primary">
                                        Découvrir nos produits
                                    </button>
                                </div>
                            ` : `
                                <div class="space-y-4">
                                    ${orders.map(order => `
                                        <div class="border-2 border-emerald-100 rounded-xl p-6 hover:border-emerald-300 transition-all">
                                            <div class="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 class="font-bold text-emerald-800">Commande #${order.numero}</h3>
                                                    <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <span class="px-4 py-2 rounded-full text-sm font-semibold ${
                                                    order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                                    order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }">
                                                    ${order.statut}
                                                </span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <p class="text-gray-700">${order.produits?.length || 0} article(s)</p>
                                                <p class="text-2xl font-bold text-emerald-700">${order.total} DA</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadCheckoutPage() {
        // Check if cart is empty
        if (!this.cart || this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        // All 58 Algerian wilayas alphabetically
        const allWilayas = [
            'Adrar', 'Aïn Defla', 'Aïn Témouchent', 'Alger', 'Annaba', 
            'Batna', 'Béchar', 'Béjaïa', 'Béni Abbès', 'Biskra', 'Blida', 
            'Bordj Bou Arreridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine', 
            'Djelfa', 'Djanet', 'El Bayadh', 'El M\'Ghair', 'El Meniaa', 'El Oued', 
            'El Tarf', 'Ghardaïa', 'Guelma', 'Illizi', 'In Salah', 'Jijel', 
            'Khenchela', 'Laghouat', 'M\'Sila', 'Mascara', 'Médéa', 'Mila', 
            'Mostaganem', 'Naâma', 'Oran', 'Ouargla', 'Ouled Djellal', 'Oum El Bouaghi',
            'Relizane', 'Saïda', 'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras',
            'Tamanrasset', 'Tébessa', 'Tiaret', 'Timimoun', 'Tindouf', 'Tipaza',
            'Tissemsilt', 'Tizi Ouzou', 'Tlemcen', 'Touggourt'
        ];
        
        const mainContent = document.getElementById('mainContent');
        
        // Use the existing getCartTotal method
        const cartTotal = this.getCartTotal();
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-7xl">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Finaliser votre commande</h1>
                    <p class="text-emerald-600 text-lg">Remplissez vos informations de livraison</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column - Checkout Form -->
                    <div class="lg:col-span-2">
                        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                            <form id="checkoutForm" onsubmit="return false;">
                                <!-- Personal Information -->
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                        <i class="fas fa-user mr-3 text-emerald-600"></i>
                                        Informations personnelles
                                    </h2>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label for="checkoutPrenom" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Prénom *
                                            </label>
                                            <input type="text" id="checkoutPrenom" name="prenom" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="Votre prénom">
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutNom" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Nom *
                                            </label>
                                            <input type="text" id="checkoutNom" name="nom" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="Votre nom">
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutEmail" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input type="email" id="checkoutEmail" name="email" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="votre@email.com">
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutTelephone" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Téléphone *
                                            </label>
                                            <input type="tel" id="checkoutTelephone" name="telephone" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="0555 12 34 56">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Delivery Address -->
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                        <i class="fas fa-map-marker-alt mr-3 text-emerald-600"></i>
                                        Adresse de livraison
                                    </h2>
                                    
                                    <div class="grid grid-cols-1 gap-6">
                                        <div>
                                            <label for="checkoutAdresse" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Adresse complète *
                                            </label>
                                            <textarea id="checkoutAdresse" name="adresse" required rows="3"
                                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all resize-none"
                                                      placeholder="Numéro, rue, quartier..."></textarea>
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutWilaya" class="block text-sm font-semibold text-gray-700 mb-2">
                                                Wilaya * <span class="text-xs text-emerald-600">(Tarifs PREST Express)</span>
                                            </label>
                                            <select id="checkoutWilaya" name="wilaya" required
                                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all">
                                                <option value="">Sélectionnez votre wilaya</option>
                                                ${allWilayas.map(wilaya => `<option value="${wilaya}">${wilaya}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Payment Method -->
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                        <i class="fas fa-credit-card mr-3 text-emerald-600"></i>
                                        Mode de paiement
                                    </h2>
                                    
                                    <div class="space-y-4">
                                        <label class="flex items-center p-4 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 cursor-pointer transition-all">
                                            <input type="radio" name="modePaiement" value="Paiement à la livraison" checked
                                                   class="w-5 h-5 text-emerald-600 mr-4">
                                            <div class="flex-1">
                                                <div class="font-semibold text-gray-900">Paiement à la livraison</div>
                                                <div class="text-sm text-gray-600">Payez en espèces lors de la réception</div>
                                            </div>
                                            <i class="fas fa-money-bill-wave text-emerald-600 text-2xl"></i>
                                        </label>
                                        
                                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all opacity-50">
                                            <input type="radio" name="modePaiement" value="Carte bancaire" disabled
                                                   class="w-5 h-5 text-gray-400 mr-4">
                                            <div class="flex-1">
                                                <div class="font-semibold text-gray-900">Carte bancaire</div>
                                                <div class="text-sm text-gray-600">Bientôt disponible</div>
                                            </div>
                                            <i class="fas fa-credit-card text-gray-400 text-2xl"></i>
                                        </label>
                                    </div>
                                    
                                    <div id="paymentMethodInfo"></div>
                                </div>
                                
                                <!-- Additional Comments -->
                                <div class="mb-8">
                                    <label for="checkoutCommentaires" class="block text-sm font-semibold text-gray-700 mb-2">
                                        Commentaires additionnels (optionnel)
                                    </label>
                                    <textarea id="checkoutCommentaires" name="commentaires" rows="3"
                                              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all resize-none"
                                              placeholder="Instructions de livraison, préférences..."></textarea>
                                </div>
                                
                                <div id="shippingMessage"></div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Right Column - Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 sticky top-4">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl">
                                        <img src="${item.image}" alt="${item.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-900 text-sm">${item.nom}</h4>
                                            <p class="text-xs text-gray-600">${item.quantite} × ${item.prix} DA</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-semibold text-emerald-700">${item.quantite * item.prix} DA</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Totals -->
                            <div class="border-t border-emerald-200 pt-4 space-y-3">
                                <div class="flex justify-between text-gray-700">
                                    <span>Sous-total:</span>
                                    <span id="checkoutSousTotal" class="font-semibold">${cartTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-gray-700">
                                    <span>Frais de livraison:</span>
                                    <span id="checkoutFraisLivraison" class="font-semibold">400 DA</span>
                                </div>
                                <div class="flex justify-between text-xl font-bold text-emerald-800 border-t border-emerald-200 pt-3">
                                    <span>Total:</span>
                                    <span id="checkoutTotal">${cartTotal + 400} DA</span>
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <button onclick="if(window.checkoutSystem) { window.checkoutSystem.processOrder(); }" 
                                    class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-check mr-2"></i>Confirmer la commande
                            </button>
                            
                            <p class="text-xs text-gray-500 text-center mt-4">
                                En passant commande, vous acceptez nos conditions générales de vente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize checkout system after DOM is ready
        setTimeout(() => {
            if (window.initCheckout) {
                window.initCheckout();
            }
        }, 100);
    }

    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-2xl mx-auto text-center">
                    <div class="bg-white rounded-3xl shadow-2xl p-12 border-2 border-emerald-200">
                        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <i class="fas fa-check text-5xl text-green-600"></i>
                        </div>
                        
                        <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                        <p class="text-xl text-gray-600 mb-8">Merci pour votre commande</p>
                        
                        <div class="bg-emerald-50 rounded-2xl p-8 mb-8">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-4">Numéro de commande</h2>
                            <p class="text-4xl font-bold text-emerald-600 mb-4">#${orderNumber}</p>
                            <p class="text-gray-700">Vous recevrez un email de confirmation à l'adresse fournie</p>
                        </div>
                        
                        <div class="space-y-4">
                            <p class="text-gray-700">
                                <i class="fas fa-truck text-emerald-600 mr-2"></i>
                                Votre commande sera livrée dans 2-3 jours ouvrables
                            </p>
                            <p class="text-gray-700">
                                <i class="fas fa-phone text-emerald-600 mr-2"></i>
                                Notre équipe vous contactera pour confirmer la livraison
                            </p>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 mt-8">
                            <button onclick="app.showPage('products')" class="btn-primary flex-1">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Continuer mes achats
                            </button>
                            <button onclick="app.showPage('profile')" class="btn-secondary flex-1">
                                <i class="fas fa-user mr-2"></i>
                                Voir mes commandes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
                
                <div id="adminContent" class="min-h-96"></div>
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
            imageUrl = generatePlaceholder(300, 300, categoryColor, 'ffffff', initials);
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
                         onerror="this.src='${generatePlaceholder(300, 300, '10b981', 'ffffff', product.nom.substring(0, 2).toUpperCase())}'">
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
                imageUrl = generatePlaceholder(64, 64, categoryColor, 'ffffff', initials);
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
    
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount){
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
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

function addToCartFromCard(productId, quantity = 1) {
    if (window.app && typeof window.app.addToCart === 'function') {
        window.app.addToCart(productId, quantity);
    }
}

function updateProductQuantity(change) {
    const input = document.getElementById('productQuantity');
    if (input) {
        let newValue = parseInt(input.value) + change;
        const max = parseInt(input.max);
        
        if (newValue < 1) newValue = 1;
        if (newValue > max) newValue = max;
        
        input.value = newValue;
    }
}

function addProductToCart() {
    const productId = window.location.hash.split('/').pop();
    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    
    if (window.app) {
        window.app.addToCart(productId, quantity);
    }
}

function sortProducts(sortBy) {
    if (!window.app || !window.app.currentFilteredProducts) return;
    
    const products = [...window.app.currentFilteredProducts];
    
    switch(sortBy) {
        case 'price-asc':
            products.sort((a, b) => a.prix - b.prix);
            break;
        case 'price-desc':
            products.sort((a, b) => b.prix - a.prix);
            break;
        case 'name-asc':
            products.sort((a, b) => a.nom.localeCompare(b.nom));
            break;
        case 'name-desc':
            products.sort((a, b) => b.nom.localeCompare(a.nom));
            break;
    }
    
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = products.map(product => window.app.createProductCard(product)).join('');
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

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (window.app) {
        try {
            await window.app.loginUser(email, password);
        } catch (error) {
            console.error('Login error:', error);
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        window.app.showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    const userData = {
        prenom: document.getElementById('registerPrenom').value,
        nom: document.getElementById('registerNom').value,
        email: document.getElementById('registerEmail').value,
        telephone: document.getElementById('registerTelephone').value,
        wilaya: document.getElementById('registerWilaya').value,
        adresse: document.getElementById('registerAdresse')?.value || '',
        ville: '',
        codePostal: '',
        password: password
    };
    
    if (window.app) {
        try {
            await window.app.registerUser(userData);
        } catch (error) {
            console.error('Register error:', error);
        }
    }
}

async function handleCheckout(event) {
    event.preventDefault();
    
    if (!window.app) return;
    
    const orderData = {
        client: {
            prenom: document.getElementById('checkoutPrenom').value,
            nom: document.getElementById('checkoutNom').value,
            email: document.getElementById('checkoutEmail').value,
            telephone: document.getElementById('checkoutTelephone').value,
            adresse: document.getElementById('checkoutAdresse').value,
            wilaya: document.getElementById('checkoutWilaya').value
        },
        produits: window.app.cart.map(item => ({
            produit: item.id,
            quantite: item.quantite,
            prix: item.prix
        })),
        total: window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) + 
               (window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0) >= 5000 ? 0 : 300),
        notes: document.getElementById('checkoutNotes').value
    };
    
    try {
        const response = await fetch(buildApiUrl('/orders'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') || ''
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la création de la commande');
        }
        
        const data = await response.json();
        
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        adminOrders.push({
            numero: data.order?.numero || `ORD-${Date.now()}`,
            ...orderData,
            statut: 'en-attente',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        window.app.clearCart();
        window.app.showPage('order-confirmation', { 
            orderNumber: data.order?.numero || `ORD-${Date.now()}` 
        });
        
    } catch (error) {
        console.error('Checkout error:', error);
        
        const orderNumber = `ORD-${Date.now()}`;
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        adminOrders.push({
            numero: orderNumber,
            ...orderData,
            statut: 'en-attente',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        window.app.clearCart();
        window.app.showPage('order-confirmation', { orderNumber });
        window.app.showToast('Commande créée localement', 'success');
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

function switchAdminSection(section) {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
    }
    
    switch(section) {
        case 'dashboard':
            if (window.app) {
                window.app.loadAdminDashboard();
            }
            break;
        case 'products':
            loadAdminProducts();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'featured':
            loadAdminFeatured();
            break;
        case 'cleanup':
            loadAdminCleanup();
            break;
    }
}

function loadAdminProducts() {
    const adminContent = document.getElementById('adminContent');
    const products = window.app.allProducts;
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-emerald-800">Gestion des Produits</h2>
                <button onclick="showAddProductModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Ajouter un produit
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-emerald-50 border-b-2 border-emerald-200">
                            <th class="px-4 py-3 text-left text-emerald-800">Image</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Nom</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Catégorie</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Prix</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Stock</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Statut</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => {
                            let imageUrl = product.image;
                            if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                                const initials = product.nom.substring(0, 2).toUpperCase();
                                imageUrl = generatePlaceholder(50, 50, '10b981', 'ffffff', initials);
                            }
                            return `
                            <tr class="border-b border-emerald-100 hover:bg-emerald-50">
                                <td class="px-4 py-3">
                                    <img src="${imageUrl}" 
                                         alt="${product.nom}" 
                                         class="w-12 h-12 object-cover rounded-lg">
                                </td>
                                <td class="px-4 py-3 font-semibold text-emerald-800">${product.nom}</td>
                                <td class="px-4 py-3 text-gray-700">${product.categorie}</td>
                                <td class="px-4 py-3 text-emerald-700 font-bold">${product.prix} DA</td>
                                <td class="px-4 py-3 ${product.stock === 0 ? 'text-red-600' : 'text-emerald-600'} font-semibold">
                                    ${product.stock}
                                </td>
                                <td class="px-4 py-3">
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                        product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }">
                                        ${product.actif !== false ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="addProductModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-bold">
                            <i class="fas fa-plus-circle mr-2"></i>
                            Ajouter un produit
                        </h3>
                        <button onclick="closeAddProductModal()" class="text-white hover:text-gray-200">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <form id="addProductForm" onsubmit="handleAddProduct(event)" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                        <input type="text" id="productNom" required class="form-input" placeholder="Ex: Vitamine C 1000mg">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea id="productDescription" rows="3" class="form-input" placeholder="Description du produit"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                            <select id="productCategorie" required class="form-input">
                                <option value="">Sélectionner...</option>
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
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                            <input type="text" id="productMarque" class="form-input" placeholder="Ex: Bioderma">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                            <input type="number" id="productPrix" required min="0" class="form-input" placeholder="1500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                            <input type="number" id="productStock" required min="0" class="form-input" placeholder="50">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div id="imagePreviewContainer" class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-2 h-48 flex items-center justify-center">
                                    <div id="imagePreviewPlaceholder">
                                        <i class="fas fa-image text-gray-400 text-4xl mb-2"></i>
                                        <p class="text-gray-500">Aperçu de l'image</p>
                                    </div>
                                    <img id="imagePreview" src="" alt="Aperçu" class="max-h-40 max-w-full hidden">
                                </div>
                            </div>
                            <div class="flex flex-col justify-center">
                                <div class="mb-4">
                                    <label for="productImageUpload" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl text-center cursor-pointer flex items-center justify-center">
                                        <i class="fas fa-upload mr-2"></i>Télécharger une image
                                        <input type="file" id="productImageUpload" accept="image/*" class="hidden" onchange="previewImage(this)">
                                    </label>
                                </div>
                                <div class="text-sm text-gray-500">
                                    <p>Formats acceptés: JPG, PNG, GIF</p>
                                    <p>Taille max: 2MB</p>
                                </div>
                                <input type="hidden" id="productImageUrl">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="productActif" checked class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">Produit actif</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" id="productVedette" class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">En vedette</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" id="productPromotion" class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">En promotion</span>
                        </label>
                    </div>
                    
                    <div id="promotionFields" class="hidden space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" id="productPrixOriginal" min="0" class="form-input" placeholder="2000">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">% de réduction</label>
                                <input type="number" id="productPourcentagePromotion" min="0" max="100" class="form-input" placeholder="25">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-4 pt-4">
                        <button type="submit" class="btn-primary flex-1">
                            <i class="fas fa-save mr-2"></i>
                            Ajouter le produit
                        </button>
                        <button type="button" onclick="closeAddProductModal()" class="btn-secondary flex-1">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const promotionCheckbox = document.getElementById('productPromotion');
        const promotionFields = document.getElementById('promotionFields');
        
        if (promotionCheckbox && promotionFields) {
            promotionCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    promotionFields.classList.remove('hidden');
                } else {
                    promotionFields.classList.add('hidden');
                }
            });
        }
    }, 100);
}

function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('addProductForm').reset();
        document.getElementById('promotionFields').classList.add('hidden');
        
        // Reset image preview
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        if (preview && placeholder) {
            preview.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    }
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    if (!window.app || !window.app.currentUser) {
        window.app.showToast('Vous devez être connecté', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.app.showToast('Session expirée. Veuillez vous reconnecter.', 'error');
        window.app.showPage('login');
        return;
    }
    
    const productData = {
        nom: document.getElementById('productNom').value,
        description: document.getElementById('productDescription').value,
        categorie: document.getElementById('productCategorie').value,
        marque: document.getElementById('productMarque').value,
        prix: parseFloat(document.getElementById('productPrix').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImageUrl').value || '',
        actif: document.getElementById('productActif').checked,
        enVedette: document.getElementById('productVedette').checked,
        enPromotion: document.getElementById('productPromotion').checked
    };
    
    if (productData.enPromotion) {
        productData.prixOriginal = parseFloat(document.getElementById('productPrixOriginal').value);
        productData.pourcentagePromotion = parseInt(document.getElementById('productPourcentagePromotion').value);
    }
    
    try {
        const response = await fetch(buildApiUrl('/products'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 401) {
                window.app.showToast('Session expirée. Reconnexion nécessaire.', 'error');
                localStorage.removeItem('token');
                window.app.currentUser = null;
                window.app.showPage('login');
                return;
            }
            
            throw new Error(errorData.message || 'Erreur lors de l\'ajout du produit');
        }
        
        const data = await response.json();
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        localProducts.push(data.product || { ...productData, _id: Date.now().toString() });
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        window.app.refreshProductsCache();
        window.app.showToast('Produit ajouté avec succès !', 'success');
        
        closeAddProductModal();
        loadAdminProducts();
        
    } catch (error) {
        console.error('Error adding product:', error);
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const newProduct = {
            ...productData,
            _id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        localProducts.push(newProduct);
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        window.app.refreshProductsCache();
        window.app.showToast('Produit ajouté localement (API non disponible)', 'warning');
        
        closeAddProductModal();
        loadAdminProducts();
    }
}

function loadAdminOrders() {
    const adminContent = document.getElementById('adminContent');
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Gestion des Commandes</h2>
            
            ${orders.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Aucune commande</h3>
                    <p class="text-gray-500">Les commandes apparaîtront ici</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${orders.reverse().map((order, index) => `
                        <div class="border-2 border-emerald-100 rounded-xl p-6 hover:border-emerald-300 transition-all">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h3 class="font-bold text-emerald-800 text-lg">Commande #${order.numero}</h3>
                                    <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                    <p class="text-sm text-gray-700 mt-1">
                                        <i class="fas fa-user mr-2"></i>
                                        ${order.client.prenom} ${order.client.nom}
                                    </p>
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-phone mr-2"></i>
                                        ${order.client.telephone}
                                    </p>
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-map-marker-alt mr-2"></i>
                                        ${order.client.adresse}, ${order.client.wilaya}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-3xl font-bold text-emerald-700 mb-2">${order.total} DA</p>
                                    <span class="px-4 py-2 rounded-full text-sm font-semibold ${
                                        order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                        order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                        order.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }">
                                        ${order.statut}
                                    </span>
                                    <div class="mt-3">
                                        <button onclick="deleteOrder(${index})" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                                            <i class="fas fa-trash mr-2"></i>Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <h4 class="font-semibold text-emerald-800 mb-2">Produits:</h4>
                                <div class="space-y-2">
                                    ${order.produits.map(item => `
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-700">${item.quantite}x Produit</span>
                                            <span class="font-semibold text-emerald-700">${item.prix * item.quantite} DA</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${order.notes ? `
                                <div class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-sticky-note mr-2 text-yellow-600"></i>
                                        <strong>Notes:</strong> ${order.notes}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function deleteOrder(orderIndex) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const reversedOrders = [...orders].reverse();
    
    reversedOrders.splice(orderIndex, 1);
    
    const ordersBackToNormal = reversedOrders.reverse();
    localStorage.setItem('adminOrders', JSON.stringify(ordersBackToNormal));
    
    if (window.app) {
        window.app.showToast('Commande supprimée avec succès', 'success');
    }
    
    loadAdminOrders();
}

function loadAdminFeatured() {
    const adminContent = document.getElementById('adminContent');
    const products = window.app.allProducts;
    const featuredProducts = products.filter(p => p.enVedette);
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Produits en Vedette</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                ${featuredProducts.map(product => {
                    let imageUrl = product.image;
                    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                        const initials = product.nom.substring(0, 2).toUpperCase();
                        imageUrl = generatePlaceholder(200, 200, '10b981', 'ffffff', initials);
                    }
                    return `
                    <div class="border-2 border-emerald-200 rounded-xl p-4 relative">
                        <img src="${imageUrl}" 
                             alt="${product.nom}" 
                             class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" 
                                class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                            <i class="fas fa-times mr-2"></i>Retirer
                        </button>
                    </div>
                `}).join('')}
            </div>
            
            <h3 class="text-xl font-bold text-emerald-800 mb-4">Ajouter des produits en vedette</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${products.filter(p => !p.enVedette).slice(0, 9).map(product => {
                    let imageUrl = product.image;
                    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                        const initials = product.nom.substring(0, 2).toUpperCase();
                        imageUrl = generatePlaceholder(200, 200, '10b981', 'ffffff', initials);
                    }
                    return `
                    <div class="border border-emerald-200 rounded-xl p-4">
                        <img src="${imageUrl}" 
                             alt="${product.nom}" 
                             class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" 
                                class="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">
                            <i class="fas fa-star mr-2"></i>Mettre en vedette
                        </button>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
}

function loadAdminCleanup() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <h2 class="text-2xl font-bold text-red-800 mb-6">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Zone de Nettoyage
            </h2>
            
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-red-800 mb-4">⚠️ Attention</h3>
                <p class="text-red-700 mb-4">
                    Cette section permet de supprimer en masse les produits indésirables. 
                    Ces actions sont <strong>irréversibles</strong>.
                </p>
            </div>
            
            <div class="space-y-4">
                <div class="border-2 border-gray-200 rounded-xl p-6">
                    <h4 class="font-bold text-gray-800 mb-3">Supprimer les produits en rupture de stock</h4>
                    <p class="text-gray-600 mb-4">Supprime tous les produits avec un stock de 0</p>
                    <button onclick="cleanupOutOfStock()" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
                    </button>
                </div>
                
                <div class="border-2 border-gray-200 rounded-xl p-6">
                    <h4 class="font-bold text-gray-800 mb-3">Supprimer les produits inactifs</h4>
                    <p class="text-gray-600 mb-4">Supprime tous les produits marqués comme inactifs</p>
                    <button onclick="cleanupInactive()" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
                    </button>
                </div>
                
                <div class="border-2 border-red-300 rounded-xl p-6 bg-red-50">
                    <h4 class="font-bold text-red-800 mb-3">⚠️ Réinitialiser tous les produits</h4>
                    <p class="text-red-700 mb-4">
                        <strong>DANGER:</strong> Supprime TOUS les produits de la base de données
                    </p>
                    <button onclick="confirmResetAllProducts()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                        <i class="fas fa-trash-alt mr-2"></i>Tout réinitialiser
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleFeatured(productId) {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const productIndex = products.findIndex(p => p._id === productId);
    
    if (productIndex > -1) {
        products[productIndex].enVedette = !products[productIndex].enVedette;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            loadAdminFeatured();
            window.app.showToast('Produit mis à jour', 'success');
        }
    }
}

function cleanupOutOfStock() {
    if (!confirm('Supprimer tous les produits en rupture de stock ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const filtered = products.filter(p => p.stock > 0);
    
    localStorage.setItem('demoProducts', JSON.stringify(filtered));
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast(`${products.length - filtered.length} produits supprimés`, 'success');
        loadAdminCleanup();
    }
}

function cleanupInactive() {
    if (!confirm('Supprimer tous les produits inactifs ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const filtered = products.filter(p => p.actif !== false);
    
    localStorage.setItem('demoProducts', JSON.stringify(filtered));
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast(`${products.length - filtered.length} produits supprimés`, 'success');
        loadAdminCleanup();
    }
}

function confirmResetAllProducts() {
    if (!confirm('⚠️ ATTENTION: Voulez-vous vraiment supprimer TOUS les produits ? Cette action est IRRÉVERSIBLE !')) return;
    if (!confirm('Dernière confirmation: Êtes-vous ABSOLUMENT sûr ?')) return;
    
    localStorage.setItem('demoProducts', '[]');
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast('Tous les produits ont été supprimés', 'success');
        switchAdminSection('dashboard');
    }
}

function editProduct(productId) {
    window.app.showToast('Fonctionnalité en cours de développement', 'info');
}

async function deleteProduct(productId) {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
        console.log('Deleting product:', productId);
        
        // 1. Delete from localStorage first
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        products = products.filter(p => p._id !== productId);
        localStorage.setItem('demoProducts', JSON.stringify(products));
        console.log('Deleted from localStorage');
        
        // 2. Try to delete from API
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(buildApiUrl(`/admin/products/${productId}`), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });
                
                if (response.ok) {
                    console.log('Deleted from API');
                } else {
                    console.log('API deletion failed:', response.status);
                }
            } catch (error) {
                console.log('API error:', error.message);
            }
        }
        
        // 3. Refresh app cache from localStorage
        if (window.app) {
            window.app.allProducts = products;
            window.app.showToast('Produit supprimé', 'success');
            
            // Reload admin products view
            loadAdminProducts();
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Shifa Parapharmacie App...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('✅ App initialized and globally available');
});

console.log('✅ Complete app.js loaded - Fixed version with canvas placeholders, image upload & order deletion!');
