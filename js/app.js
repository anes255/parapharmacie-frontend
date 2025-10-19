// ============================================================================
// COMPLETE PharmacieGaherApp - SEO URL ROUTING VERSION
// ============================================================================

// UTILITY: Generate placeholder image using canvas
function generatePlaceholder(width, height, bgColor, textColor, text) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = `#${bgColor}`;
    ctx.fillRect(0, 0, width, height);
    
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
            imageUrlInput.value = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// UTILITY: Create SEO-friendly slug from text
function createSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens
        .trim();
}

// ============================================================================
// MAIN APP CLASS WITH URL ROUTING
// ============================================================================

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
        this.keepAliveInterval = null;
        this.currentProductId = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing Shifa Parapharmacie App with URL Routing...');
            
            this.showLoading('Chargement de l\'application...');
            
            // Wake up server
            console.log('Step 1: Waking up server...');
            this.wakeUpServer();
            
            // Check authentication
            console.log('Step 2: Checking authentication...');
            await this.checkAuth();
            console.log('✅ Authentication checked');
            
            // Load products
            console.log('Step 3: Loading products...');
            this.showLoading('Chargement des produits...');
            await this.loadProductsCache();
            console.log('✅ Products loaded:', this.allProducts.length, 'products');
            
            // Initialize UI
            console.log('Step 4: Initializing UI...');
            this.initUI();
            console.log('✅ UI initialized');
            
            // Update cart
            console.log('Step 5: Updating cart...');
            this.updateCartUI();
            console.log('✅ Cart updated');
            
            // Initialize search
            console.log('Step 6: Initializing search...');
            this.initSearch();
            console.log('✅ Search initialized');
            
            // Initialize URL routing
            console.log('Step 7: Initializing URL routing...');
            this.initURLRouting();
            console.log('✅ URL routing initialized');
            
            // Load page based on current URL
            console.log('Step 8: Loading page from URL...');
            this.showLoading('Préparation de la page...');
            await this.loadPageFromURL();
            console.log('✅ Page loaded from URL');
            
            // Force hide loading
            console.log('Step 9: Forcing UI to show...');
            this.hideLoading();
            this.hideServerLoadingScreen();
            
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.style.visibility = 'visible';
                console.log('✅ Main content forced visible');
            }
            
            console.log('✅ App initialized successfully with URL routing!');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.hideLoading();
            this.hideServerLoadingScreen();
            
            this.showToast('Application chargée avec des données en cache', 'warning');
            try {
                await this.loadHomePage();
            } catch (e) {
                console.error('Failed to load home page:', e);
            }
        }
    }
    
    // NEW: Initialize URL routing with hash-based navigation
    initURLRouting() {
        // Listen for hash changes (browser back/forward)
        window.addEventListener('hashchange', () => {
            console.log('Hash changed:', window.location.hash);
            this.loadPageFromURL();
        });
        
        // Handle internal link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#/"]');
            if (link) {
                e.preventDefault();
                const hash = link.getAttribute('href');
                window.location.hash = hash;
            }
        });
        
        console.log('✅ URL routing listeners attached');
    }
    
    // NEW: Load page based on current URL hash
    async loadPageFromURL() {
        const hash = window.location.hash || '#/';
        const path = hash.substring(1); // Remove the #
        const [route, ...pathParts] = path.split('/').filter(p => p);
        
        console.log('Loading page from hash:', hash, 'route:', route, 'parts:', pathParts);
        
        // Parse URL and determine page
        if (!route || route === '') {
            await this.loadHomePage();
        } else if (route === 'produit' || route === 'product') {
            if (pathParts.length > 0) {
                // Extract product ID from URL like #/produit/abc123-product-name
                const productSlug = pathParts[0];
                const productId = productSlug.split('-')[0]; // Get ID before first hyphen
                
                console.log('Loading product from URL:', productId);
                await this.loadProductPage(productId);
            } else {
                await this.loadHomePage();
            }
        } else if (route === 'produits' || route === 'products') {
            // Check for query parameters in hash
            const queryString = path.includes('?') ? path.split('?')[1] : '';
            const params = new URLSearchParams(queryString);
            const categorie = params.get('categorie');
            const search = params.get('search');
            await this.loadProductsPage({ categorie, search });
        } else if (route === 'connexion' || route === 'login') {
            await this.loadLoginPage();
        } else if (route === 'inscription' || route === 'register') {
            await this.loadRegisterPage();
        } else if (route === 'profil' || route === 'profile') {
            await this.loadProfilePage();
        } else if (route === 'panier' || route === 'checkout') {
            await this.loadCheckoutPage();
        } else if (route === 'contact') {
            await this.loadContactPage();
        } else if (route === 'admin') {
            await this.loadAdminPage();
        } else if (route === 'commande' || route === 'order') {
            if (pathParts.length > 0) {
                const orderNumber = pathParts[0];
                await this.loadOrderConfirmationPage(orderNumber);
            } else {
                await this.loadHomePage();
            }
        } else {
            // 404 - load home page
            console.log('Unknown route, loading home page');
            await this.loadHomePage();
        }
    }
    
    // NEW: Update URL hash without reload
    updateURL(hash) {
        console.log('Updating URL hash:', hash);
        window.location.hash = hash;
    }
    
    // NEW: Generate product URL with hash
    generateProductURL(product) {
        const slug = createSlug(product.nom);
        return `#/produit/${product._id}-${slug}`;
    }
    
    async wakeUpServer() {
        try {
            console.log('🔔 Waking up server...');
            
            const loadingMsg = document.getElementById('loadingMessage');
            if (loadingMsg) {
                loadingMsg.innerHTML = `
                    <div class="text-center">
                        <p class="text-white text-lg font-medium animate-pulse mb-2">
                            Connexion au serveur...
                        </p>
                        <p class="text-white/70 text-sm">
                            Premier chargement : 10-30 secondes
                        </p>
                    </div>
                `;
            }
            
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            try {
                const response = await fetch('https://parapharmacie-gaher.onrender.com/api/health', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                
                if (response.ok) {
                    console.log(`✅ Server awake in ${elapsed}s`);
                    this.backendReady = true;
                    this.startKeepAlive();
                    
                    if (loadingMsg) {
                        loadingMsg.innerHTML = `
                            <p class="text-white text-lg font-medium">
                                ✅ Serveur connecté (${elapsed}s)
                            </p>
                        `;
                    }
                } else {
                    throw new Error('Server not responding properly');
                }
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    console.log('⏱️ Server wake-up timeout, retrying...');
                    if (loadingMsg) {
                        loadingMsg.innerHTML = `
                            <p class="text-white text-lg font-medium animate-pulse">
                                Le serveur met plus de temps que prévu...
                            </p>
                            <p class="text-white/70 text-sm mt-2">
                                Nouvelle tentative...
                            </p>
                        `;
                    }
                    setTimeout(() => this.wakeUpServer(), 5000);
                } else {
                    console.log('⚠️ Server wake-up failed:', error.message);
                    setTimeout(() => this.wakeUpServer(), 10000);
                }
            }
        } catch (error) {
            console.log('Could not ping server:', error.message);
            setTimeout(() => this.wakeUpServer(), 10000);
        }
    }
    
    startKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        
        this.keepAliveInterval = setInterval(() => {
            console.log('🔄 Keep-alive ping...');
            fetch('https://parapharmacie-gaher.onrender.com/api/health', {
                method: 'GET'
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Server keep-alive OK');
                } else {
                    console.log('⚠️ Server keep-alive failed');
                }
            }).catch(error => {
                console.log('⚠️ Keep-alive error:', error.message);
            });
        }, 5 * 60 * 1000);
        
        console.log('✅ Keep-alive started (5min interval)');
    }
    
    hideServerLoadingScreen() {
        const serverLoadingScreen = document.getElementById('serverLoadingScreen');
        if (serverLoadingScreen) {
            serverLoadingScreen.style.transition = 'opacity 0.5s ease-out';
            serverLoadingScreen.style.opacity = '0';
            setTimeout(() => {
                serverLoadingScreen.style.display = 'none';
                serverLoadingScreen.remove();
                console.log('✅ Server loading screen hidden and removed');
            }, 500);
        }
    }
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                console.log('Checking auth with server...');
                const response = await fetch('https://parapharmacie-gaher.onrender.com/api/auth/profile', {
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                console.log('Auth response status:', response.status);
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateUserUI();
                    console.log('✅ User authenticated:', this.currentUser.email);
                } else {
                    console.log('Auth failed, removing token');
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.log('Auth check failed:', error.message);
                if (error.name !== 'AbortError') {
                    localStorage.removeItem('token');
                }
            }
        }
    }
    
    async loginUser(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }
            
            const response = await fetch('https://parapharmacie-gaher.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });
            
            const data = await response.json();
            
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
            this.showToast(error.message, 'error');
            throw error;
        }
    }
    
    async registerUser(userData) {
        try {
            const response = await fetch('https://parapharmacie-gaher.onrender.com/api/auth/register', {
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
            try {
                const oldCache = localStorage.getItem('demoProducts');
                if (oldCache) {
                    console.log('🧹 Clearing old product cache...');
                    localStorage.removeItem('demoProducts');
                }
            } catch (e) {
                console.log('Could not clear old cache');
            }
            
            const cachedProducts = localStorage.getItem('productsCache');
            if (cachedProducts) {
                try {
                    const parsed = JSON.parse(cachedProducts);
                    this.allProducts = parsed;
                    console.log('Loaded', this.allProducts.length, 'products from cache');
                } catch (e) {
                    console.log('Cache corrupted, will fetch fresh data');
                    localStorage.removeItem('productsCache');
                }
            }
            
            this.fetchProductsFromAPI();
            
        } catch (error) {
            console.log('Error loading products cache:', error);
            this.allProducts = [];
            this.fetchProductsFromAPI();
        }
    }
    
    async fetchProductsFromAPI() {
        try {
            console.log('🔄 Attempting to fetch products from API...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch('https://parapharmacie-gaher.onrender.com/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API response data:', data);
                
                if (data && data.products && data.products.length > 0) {
                    // Store full products in memory (with images)
                    this.allProducts = data.products;
                    
                    // Store only lightweight data in localStorage (without base64 images)
                    try {
                        const lightProducts = data.products.map(p => ({
                            _id: p._id,
                            nom: p.nom,
                            prix: p.prix,
                            categorie: p.categorie,
                            stock: p.stock,
                            description: p.description,
                            marque: p.marque,
                            enPromotion: p.enPromotion,
                            enVedette: p.enVedette,
                            actif: p.actif,
                            prixOriginal: p.prixOriginal,
                            pourcentagePromotion: p.pourcentagePromotion,
                            // Store image URL (whether http:// or data:image)
                            imageUrl: p.image || null
                        }));
                        
                        localStorage.setItem('productsCache', JSON.stringify(lightProducts));
                        console.log('✅ Cached', lightProducts.length, 'products (lightweight)');
                    } catch (storageError) {
                        console.log('⚠️ Could not cache products:', storageError.message);
                        try {
                            localStorage.removeItem('demoProducts');
                            localStorage.removeItem('productsCache');
                            console.log('🧹 Cleared old cache');
                        } catch (e) {
                            console.log('Could not clear cache');
                        }
                    }
                    
                    console.log('✅ Loaded', this.allProducts.length, 'products from API');
                    
                    if (this.currentPage === 'home') {
                        this.refreshHomePage();
                    } else if (this.currentPage === 'products') {
                        this.showPage('products');
                    }
                } else {
                    console.log('✅ API connected - no products returned');
                }
            } else {
                console.log('⚠️ API response not ok:', response.statusText);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('⏱️ API request timeout - using cached products');
            } else {
                console.log('ℹ️ API error:', error.message);
            }
        }
    }
    
    refreshProductsCache() {
        console.log('🔄 Refreshing products from API...');
        this.fetchProductsFromAPI();
    }
    
    refreshHomePage() {
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
            
            // Generate hash URL
            let hash = '#/';
            
            switch (pageName) {
                case 'home':
                    hash = '#/';
                    await this.loadHomePage();
                    break;
                case 'products':
                    if (params.categorie) {
                        hash = `#/produits?categorie=${encodeURIComponent(params.categorie)}`;
                    } else if (params.search) {
                        hash = `#/produits?search=${encodeURIComponent(params.search)}`;
                    } else {
                        hash = '#/produits';
                    }
                    await this.loadProductsPage(params);
                    break;
                case 'product':
                    const product = this.allProducts.find(p => p._id === params.id);
                    if (product) {
                        hash = this.generateProductURL(product);
                    }
                    await this.loadProductPage(params.id);
                    break;
                case 'login':
                    hash = '#/connexion';
                    await this.loadLoginPage();
                    break;
                case 'register':
                    hash = '#/inscription';
                    await this.loadRegisterPage();
                    break;
                case 'profile':
                    if (!this.currentUser) {
                        await this.showPage('login');
                        return;
                    }
                    hash = '#/profil';
                    await this.loadProfilePage();
                    break;
                case 'checkout':
                    hash = '#/panier';
                    await this.loadCheckoutPage();
                    break;
                case 'order-confirmation':
                    hash = `#/commande/${params.orderNumber}`;
                    await this.loadOrderConfirmationPage(params.orderNumber);
                    break;
                case 'contact':
                    hash = '#/contact';
                    await this.loadContactPage();
                    break;
                case 'admin':
                    if (!this.currentUser || this.currentUser.role !== 'admin') {
                        this.showToast('Accès refusé', 'error');
                        await this.showPage('home');
                        return;
                    }
                    hash = '#/admin';
                    await this.loadAdminPage();
                    break;
                default:
                    hash = '#/';
                    await this.loadHomePage();
            }
            
            // Update URL hash
            this.updateURL(hash);
            
            this.hideLoading();
        } catch (error) {
            console.error('Erreur chargement page:', error);
            this.hideLoading();
            this.showToast('Erreur de chargement de la page', 'error');
        }
    }
    
    showProductNotFound() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="max-w-2xl mx-auto text-center">
                    <div class="mb-8">
                        <i class="fas fa-exclamation-triangle text-8xl text-yellow-500 mb-6"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
                    <p class="text-xl text-gray-600 mb-8">
                        Désolé, ce produit n'existe pas ou n'est plus disponible.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onclick="app.showPage('products')" class="btn-primary">
                            <i class="fas fa-shopping-bag mr-2"></i>
                            Voir tous les produits
                        </button>
                        <button onclick="app.showPage('home')" class="btn-secondary">
                            <i class="fas fa-home mr-2"></i>
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.title = 'Produit non trouvé - Shifa Parapharmacie';
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
        
        document.title = 'Shifa - Parapharmacie | Produits de santé et beauté en Algérie';
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
                    ${index === 0 ? '<div class="mt-2"><span class="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-semibold">POPULAIRE</span></div>' : ''}
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
        
        if (params.categorie) {
            document.title = `${params.categorie} - Shifa Parapharmacie`;
        } else if (params.search) {
            document.title = `Recherche: ${params.search} - Shifa Parapharmacie`;
        } else {
            document.title = 'Produits - Shifa Parapharmacie';
        }
    }
    
    async loadProductPage(productId) {
        // Wait for products to load if they haven't yet
        if (this.allProducts.length === 0) {
            console.log('Products not loaded yet, waiting...');
            this.showLoading('Chargement du produit...');
            
            // Wait up to 10 seconds for products to load
            let attempts = 0;
            while (this.allProducts.length === 0 && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }
            
            if (this.allProducts.length === 0) {
                console.error('Products failed to load after waiting');
                this.showProductNotFound();
                return;
            }
        }
        
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            this.showProductNotFound();
            return;
        }
        
        this.currentProductId = productId;
        
        const mainContent = document.getElementById('mainContent');
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        let imageUrl;
        // Check both 'image' and 'imageUrl' fields (cache uses 'imageUrl')
        const imageSource = product.image || product.imageUrl;
        
        if (imageSource && imageSource.startsWith('http')) {
            imageUrl = imageSource;
        } else if (imageSource && imageSource.startsWith('data:image')) {
            imageUrl = imageSource;
        } else {
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            imageUrl = generatePlaceholder(500, 500, '10b981', 'ffffff', initials);
        }
        
        console.log('Product image URL:', imageUrl?.substring(0, 100));
        console.log('Product has image:', !!product.image, 'imageUrl:', !!product.imageUrl);
        
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
        
        document.title = `${product.nom} - ${product.marque || 'Shifa Parapharmacie'}`;
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
        
        document.title = 'Connexion - Shifa Parapharmacie';
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
                                    <option value="Alger">16 - Alger</option>
                                    <option value="Oran">31 - Oran</option>
                                    <option value="Constantine">25 - Constantine</option>
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
        
        document.title = 'Inscription - Shifa Parapharmacie';
    }
    
    async loadProfilePage() {
        if (!this.currentUser) {
            this.showPage('login');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        let orders = [];
        try {
            const response = await fetch('https://parapharmacie-gaher.onrender.com/api/orders/user/all', {
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
                                                    <h3 class="font-bold text-emerald-800">Commande #${order.numeroCommande}</h3>
                                                    <p class="text-sm text-gray-600">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <span class="px-4 py-2 rounded-full text-sm font-semibold ${
                                                    order.statut === 'livrée' ? 'bg-green-100 text-green-800' :
                                                    order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }">
                                                    ${order.statut}
                                                </span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <p class="text-gray-700">${order.articles?.length || 0} article(s)</p>
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
        
        document.title = 'Mon Profil - Shifa Parapharmacie';
    }
    
    async loadCheckoutPage() {
        if (!this.cart || this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const allWilayas = [
            'Adrar', 'Aïn Defla', 'Aïn Témouchent', 'Alger', 'Annaba', 
            'Batna', 'Béchar', 'Béjaïa', 'Biskra', 'Blida', 
            'Bordj Bou Arreridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine', 
            'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaïa', 
            'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat', 
            'M\'Sila', 'Mascara', 'Médéa', 'Mila', 'Mostaganem', 
            'Naâma', 'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane', 
            'Saïda', 'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras',
            'Tamanrasset', 'Tébessa', 'Tiaret', 'Tindouf', 'Tipaza',
            'Tissemsilt', 'Tizi Ouzou', 'Tlemcen'
        ];
        
        const mainContent = document.getElementById('mainContent');
        const cartTotal = this.getCartTotal();
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-7xl">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Finaliser votre commande</h1>
                    <p class="text-emerald-600 text-lg">Remplissez vos informations de livraison</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                            <form id="checkoutForm" onsubmit="return false;">
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                        <i class="fas fa-user mr-3 text-emerald-600"></i>
                                        Informations personnelles
                                    </h2>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label for="checkoutPrenom" class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                            <input type="text" id="checkoutPrenom" name="prenom" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="Votre prénom">
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutNom" class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                            <input type="text" id="checkoutNom" name="nom" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="Votre nom">
                                        </div>
                                        
                                        <div class="md:col-span-2">
                                            <label for="checkoutTelephone" class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                            <input type="tel" id="checkoutTelephone" name="telephone" required
                                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all"
                                                   placeholder="0555 12 34 56">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                        <i class="fas fa-map-marker-alt mr-3 text-emerald-600"></i>
                                        Adresse de livraison
                                    </h2>
                                    
                                    <div class="grid grid-cols-1 gap-6">
                                        <div>
                                            <label for="checkoutAdresse" class="block text-sm font-semibold text-gray-700 mb-2">Adresse complète *</label>
                                            <textarea id="checkoutAdresse" name="adresse" required rows="3"
                                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all resize-none"
                                                      placeholder="Numéro, rue, quartier..."></textarea>
                                        </div>
                                        
                                        <div>
                                            <label for="checkoutWilaya" class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                            <select id="checkoutWilaya" name="wilaya" required
                                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all">
                                                <option value="">Sélectionnez votre wilaya</option>
                                                ${allWilayas.map(wilaya => `<option value="${wilaya}">${wilaya}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
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
                                    </div>
                                </div>
                                
                                <div class="mb-8">
                                    <label for="checkoutCommentaires" class="block text-sm font-semibold text-gray-700 mb-2">
                                        Commentaires additionnels (optionnel)
                                    </label>
                                    <textarea id="checkoutCommentaires" name="commentaires" rows="3"
                                              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all resize-none"
                                              placeholder="Instructions de livraison, préférences..."></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="lg:col-span-1">
                        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 sticky top-4">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                            
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
                            
                            <button onclick="app.processCheckoutOrder()" 
                                    id="checkoutSubmitBtn"
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
        
        document.title = 'Finaliser la commande - Shifa Parapharmacie';
    }
    
    async processCheckoutOrder() {
        try {
            console.log('Processing checkout order...');
            
            const requiredFields = [
                { id: 'checkoutPrenom', name: 'Prénom' },
                { id: 'checkoutNom', name: 'Nom' },
                { id: 'checkoutTelephone', name: 'Téléphone' },
                { id: 'checkoutAdresse', name: 'Adresse' },
                { id: 'checkoutWilaya', name: 'Wilaya' }
            ];
            
            for (const field of requiredFields) {
                const element = document.getElementById(field.id);
                if (!element || !element.value.trim()) {
                    this.showToast(`Le champ "${field.name}" est requis`, 'error');
                    element?.focus();
                    return;
                }
            }
            
            if (!this.cart || this.cart.length === 0) {
                this.showToast('Votre panier est vide', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('checkoutSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            }
            
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const orderNumber = `CMD${timestamp}${random}`;
            
            const prenom = document.getElementById('checkoutPrenom').value.trim();
            const nom = document.getElementById('checkoutNom').value.trim();
            const telephone = document.getElementById('checkoutTelephone').value.trim();
            const adresse = document.getElementById('checkoutAdresse').value.trim();
            const wilaya = document.getElementById('checkoutWilaya').value;
            const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';
            const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
            
            const cartTotal = this.getCartTotal();
            const fraisLivraison = 400;
            const total = cartTotal + fraisLivraison;
            
            const orderData = {
                numeroCommande: orderNumber,
                client: {
                    prenom: prenom,
                    nom: nom,
                    email: this.currentUser?.email || `guest_${Date.now()}@temp.com`,
                    telephone: telephone.replace(/\s+/g, ''),
                    adresse: adresse,
                    wilaya: wilaya
                },
                articles: this.cart.map(item => ({
                    productId: String(item.id),
                    nom: item.nom,
                    prix: parseFloat(item.prix),
                    quantite: parseInt(item.quantite)
                })),
                sousTotal: parseFloat(cartTotal),
                fraisLivraison: parseFloat(fraisLivraison),
                total: parseFloat(total),
                statut: 'en-attente',
                modePaiement: modePaiement,
                commentaires: commentaires
            };
            
            let apiSuccess = false;
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
                
                if (token) {
                    headers['x-auth-token'] = token;
                }
                
                const response = await fetch('https://parapharmacie-gaher.onrender.com/api/orders', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(orderData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    console.log('✅ Order saved to API successfully');
                    apiSuccess = true;
                } else {
                    console.error('API Error:', data);
                    throw new Error(data.message || 'Erreur API');
                }
            } catch (apiError) {
                console.error('API submission failed:', apiError);
                this.showToast('Erreur lors de l\'enregistrement: ' + apiError.message, 'error');
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
                }
                return;
            }
            
            if (apiSuccess) {
                this.clearCart();
                this.showToast('Commande confirmée !', 'success');
                
                setTimeout(() => {
                    this.showPage('order-confirmation', { orderNumber });
                }, 500);
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            this.showToast(error.message || 'Erreur lors de la commande', 'error');
            
            const submitBtn = document.getElementById('checkoutSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        }
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
                            <p class="text-gray-700">Notre équipe vous contactera pour confirmer la livraison</p>
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
                            <button onclick="app.showPage('home')" class="btn-secondary flex-1">
                                <i class="fas fa-home mr-2"></i>
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.title = `Commande Confirmée #${orderNumber} - Shifa Parapharmacie`;
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
                                        <a href="mailto:contact@parapharmacieshifa.dz" class="text-primary hover:text-secondary">
                                            contact@parapharmacieshifa.dz
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
        
        document.title = 'Contact - Shifa Parapharmacie';
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
                    </nav>
                </div>
                
                <div id="adminContent" class="min-h-96"></div>
            </div>
        `;
        
        await this.loadAdminDashboard();
        document.title = 'Administration - Shifa Parapharmacie';
    }
    
    async loadAdminDashboard() {
        try {
            const products = this.allProducts;
            
            let stats = {
                totalProducts: products.length,
                totalOrders: 0,
                pendingOrders: 0,
                monthlyRevenue: 0
            };

            try {
                const response = await fetch('https://parapharmacie-gaher.onrender.com/api/admin/dashboard', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.orders) {
                        stats.totalOrders = data.orders.total || 0;
                        stats.pendingOrders = data.orders.pending || 0;
                        stats.monthlyRevenue = data.revenue?.monthly || 0;
                    }
                }
            } catch (error) {
                console.log('API unavailable');
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
            `;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }
    
    async loadAdminProducts() {
        try {
            const adminContent = document.getElementById('adminContent');
            adminContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-emerald-600"></i></div>';
            
            let products = [];
            
            try {
                const response = await fetch('https://parapharmacie-gaher.onrender.com/api/admin/products', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    products = data.products || [];
                } else {
                    products = this.allProducts;
                }
            } catch (error) {
                console.log('API unavailable, using local products');
                products = this.allProducts;
            }
            
            adminContent.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des Produits</h2>
                        <button onclick="showAddProductModal()" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i>Ajouter un produit
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-emerald-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Image</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Nom</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Catégorie</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Prix</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Stock</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Statut</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-emerald-100">
                                ${products.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                                            <i class="fas fa-box-open text-4xl mb-2"></i>
                                            <p>Aucun produit trouvé</p>
                                        </td>
                                    </tr>
                                ` : products.map(product => {
                                    const imageUrl = product.image && product.image.startsWith('data:image') 
                                        ? product.image 
                                        : product.image && product.image.startsWith('http')
                                        ? product.image
                                        : generatePlaceholder(64, 64, '10b981', 'ffffff', product.nom.substring(0, 2).toUpperCase());
                                    
                                    return `
                                        <tr class="hover:bg-emerald-50/50 transition-colors">
                                            <td class="px-4 py-3">
                                                <img src="${imageUrl}" alt="${product.nom}" class="w-12 h-12 object-cover rounded-lg border border-emerald-200">
                                            </td>
                                            <td class="px-4 py-3 font-medium text-gray-900">${product.nom}</td>
                                            <td class="px-4 py-3 text-gray-700">${product.categorie}</td>
                                            <td class="px-4 py-3 font-semibold text-emerald-700">${product.prix} DA</td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                                    ${product.stock} unités
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                                    ${product.actif !== false ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="flex items-center space-x-2">
                                                    <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800">
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
            
        } catch (error) {
            console.error('Error loading admin products:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
                    <p class="text-red-600">Erreur lors du chargement des produits</p>
                </div>
            `;
        }
    }
    
    async loadAdminOrders() {
        try {
            const adminContent = document.getElementById('adminContent');
            adminContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-emerald-600"></i><p class="text-emerald-600 mt-4">Chargement des commandes...</p></div>';
            
            let orders = [];
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Token manquant');
            }
            
            try {
                console.log('Fetching orders from API...');
                
                let response = await fetch('https://parapharmacie-gaher.onrender.com/api/orders', {
                    method: 'GET',
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Orders API response status:', response.status);
                
                if (!response.ok) {
                    console.log('Trying admin orders endpoint...');
                    response = await fetch('https://parapharmacie-gaher.onrender.com/api/admin/orders', {
                        method: 'GET',
                        headers: { 
                            'x-auth-token': token,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Admin orders API response status:', response.status);
                }
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Orders data received:', data);
                    orders = data.orders || [];
                    console.log(`Loaded ${orders.length} orders from API`);
                } else {
                    const errorData = await response.json();
                    console.error('API error:', errorData);
                    throw new Error(errorData.message || 'Erreur API');
                }
            } catch (error) {
                console.error('Failed to load orders from API:', error);
                this.showToast('Impossible de charger les commandes depuis le serveur', 'error');
            }
            
            console.log('Rendering orders table with', orders.length, 'orders');
            
            adminContent.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-emerald-800">Gestion des Commandes</h2>
                            <p class="text-sm text-emerald-600 mt-1">${orders.length} commande(s) trouvée(s)</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button onclick="app.loadAdminOrders()" class="text-emerald-600 hover:text-emerald-800 transition-colors" title="Actualiser">
                                <i class="fas fa-sync-alt text-xl"></i>
                            </button>
                            <select id="filterOrderStatus" class="form-input text-sm" onchange="filterOrders(this.value)">
                                <option value="">Tous les statuts</option>
                                <option value="en-attente">En attente</option>
                                <option value="confirmée">Confirmée</option>
                                <option value="préparée">Préparée</option>
                                <option value="expédiée">Expédiée</option>
                                <option value="livrée">Livrée</option>
                                <option value="annulée">Annulée</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-emerald-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">N° Commande</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Client</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Adresse complète</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Contact</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Date</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Articles</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Total</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Statut</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-emerald-100">
                                ${orders.length === 0 ? `
                                    <tr>
                                        <td colspan="9" class="px-4 py-12 text-center">
                                            <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                                            <p class="text-gray-500 text-lg font-medium">Aucune commande trouvée</p>
                                            <p class="text-gray-400 text-sm mt-2">Les commandes apparaîtront ici une fois créées</p>
                                        </td>
                                    </tr>
                                ` : orders.map(order => {
                                    const orderDate = new Date(order.dateCommande);
                                    const formattedDate = orderDate.toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric' 
                                    });
                                    const formattedTime = orderDate.toLocaleTimeString('fr-FR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    });
                                    
                                    return `
                                        <tr class="hover:bg-emerald-50/50 transition-colors">
                                            <td class="px-4 py-3">
                                                <span class="font-mono text-sm font-bold text-emerald-700">#${order.numeroCommande || 'N/A'}</span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div>
                                                    <p class="font-medium text-gray-900">${order.client?.prenom || ''} ${order.client?.nom || ''}</p>
                                                    <p class="text-xs text-gray-500">${order.client?.wilaya || ''}</p>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="max-w-xs">
                                                    <p class="text-sm text-gray-700 break-words">${order.client?.adresse || 'N/A'}</p>
                                                    <p class="text-xs text-gray-500 mt-1">${order.client?.wilaya || ''}</p>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div>
                                                    <p class="text-xs text-gray-600"><i class="fas fa-phone mr-1"></i>${order.client?.telephone || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div>
                                                    <p class="text-sm text-gray-700">${formattedDate}</p>
                                                    <p class="text-xs text-gray-500">${formattedTime}</p>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    ${order.articles?.length || 0} article(s)
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="font-bold text-emerald-700 text-lg">${order.total || 0} DA</span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.statut === 'livrée' ? 'bg-green-100 text-green-800' :
                                                    order.statut === 'expédiée' ? 'bg-blue-100 text-blue-800' :
                                                    order.statut === 'préparée' ? 'bg-purple-100 text-purple-800' :
                                                    order.statut === 'confirmée' ? 'bg-cyan-100 text-cyan-800' :
                                                    order.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }">
                                                    ${order.statut || 'en-attente'}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="flex items-center space-x-2">
                                                    <button onclick="viewOrderDetails('${order._id}')" 
                                                            class="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded" 
                                                            title="Voir détails">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button onclick="deleteOrder('${order._id}')" 
                                                            class="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded" 
                                                            title="Supprimer">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                    <select onchange="updateOrderStatus('${order._id}', this.value); this.value='';" 
                                                            class="text-xs border-2 border-emerald-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 hover:border-emerald-300 transition-colors bg-white">
                                                        <option value="">Changer statut</option>
                                                        <option value="en-attente">En attente</option>
                                                        <option value="confirmée">Confirmée</option>
                                                        <option value="préparée">Préparée</option>
                                                        <option value="expédiée">Expédiée</option>
                                                        <option value="livrée">Livrée</option>
                                                        <option value="annulée">Annulée</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${orders.length > 0 ? `
                        <div class="mt-6 flex items-center justify-between border-t border-emerald-200 pt-4">
                            <p class="text-sm text-gray-600">
                                Affichage de <span class="font-semibold">${orders.length}</span> commande(s)
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading admin orders:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
                    <p class="text-red-600">Erreur lors du chargement des commandes</p>
                </div>
            `;
        }
    }
    
    createProductCard(product) {
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        let imageUrl;
        // Check both 'image' and 'imageUrl' fields (cache uses 'imageUrl')
        const imageSource = product.image || product.imageUrl;
        
        if (imageSource && imageSource.startsWith('http')) {
            imageUrl = imageSource;
        } else if (imageSource && imageSource.startsWith('data:image')) {
            imageUrl = imageSource;
        } else if (imageSource) {
            imageUrl = `./images/products/${imageSource}`;
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
            console.log('🛒 Adding to cart - Product ID:', productId, 'Quantity:', quantity);
            
            const product = this.allProducts.find(p => p._id === productId);
            
            if (!product) {
                console.error('Product not found:', productId);
                console.log('Available products:', this.allProducts.map(p => p._id));
                throw new Error('Produit non trouvé');
            }
            
            console.log('✅ Product found:', product.nom);
            
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
            console.log('✅ Product added to cart successfully');
            
        } catch (error) {
            console.error('❌ Erreur ajout au panier:', error);
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
    
    showLoading(message = 'Chargement...') {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            const loadingText = spinner.querySelector('span');
            if (loadingText) {
                loadingText.textContent = message;
            }
            spinner.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.style.display = 'none';
            console.log('✅ Loading spinner hidden');
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
// GLOBAL FUNCTIONS - Include ALL functions from original
// ============================================================================

function addToCartFromCard(productId, quantity = 1) {
    if (window.app && typeof window.app.addToCart === 'function') {
        console.log('🛒 Adding from card:', productId);
        window.app.addToCart(productId, quantity);
    } else {
        console.error('App not initialized or addToCart not available');
    }
}

function updateProductQuantity(change) {
    const input = document.getElementById('productQuantity');
    if (!input) {
        console.error('Product quantity input not found');
        return;
    }
    
    let newValue = parseInt(input.value) + change;
    const max = parseInt(input.max) || 999;
    const min = parseInt(input.min) || 1;
    
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    input.value = newValue;
}

function addProductToCart() {
    if (!window.app) {
        console.error('App not initialized');
        return;
    }
    
    const productId = window.app.currentProductId;
    
    if (!productId) {
        console.error('No product ID found');
        window.app.showToast('Erreur: Produit introuvable', 'error');
        return;
    }
    
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    console.log('Adding to cart:', productId, 'quantity:', quantity);
    window.app.addToCart(productId, quantity);
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
            if (window.app) {
                window.app.loadAdminProducts();
            }
            break;
        case 'orders':
            if (window.app) {
                window.app.loadAdminOrders();
            }
            break;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus || !window.app) return;
    
    try {
        console.log(`Updating order ${orderId} to status: ${newStatus}`);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée, veuillez vous reconnecter', 'error');
            return;
        }
        
        let response = await fetch(`https://parapharmacie-gaher.onrender.com/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ statut: newStatus })
        });
        
        if (!response.ok) {
            response = await fetch(`https://parapharmacie-gaher.onrender.com/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ statut: newStatus })
            });
        }
        
        console.log('Update status response:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Update successful:', data);
            window.app.showToast('Statut mis à jour avec succès', 'success');
            window.app.loadAdminOrders();
        } else {
            const errorData = await response.json();
            console.error('Update error:', errorData);
            throw new Error(errorData.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        window.app.showToast(error.message || 'Erreur lors de la mise à jour du statut', 'error');
    }
}

async function viewOrderDetails(orderId) {
    if (!window.app || !orderId) return;
    
    try {
        console.log('Fetching order details for:', orderId);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée', 'error');
            return;
        }
        
        let response = await fetch(`https://parapharmacie-gaher.onrender.com/api/orders/${orderId}`, {
            headers: { 'x-auth-token': token }
        });
        
        if (!response.ok) {
            response = await fetch(`https://parapharmacie-gaher.onrender.com/api/admin/orders/${orderId}`, {
                headers: { 'x-auth-token': token }
            });
        }
        
        if (!response.ok) {
            throw new Error('Commande non trouvée');
        }
        
        const order = await response.json();
        console.log('Order details:', order);
        
        const orderDate = new Date(order.dateCommande);
        const formattedDate = orderDate.toLocaleDateString('fr-FR', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const formattedTime = orderDate.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const statusColors = {
            'en-attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'confirmée': 'bg-cyan-100 text-cyan-800 border-cyan-300',
            'préparée': 'bg-purple-100 text-purple-800 border-purple-300',
            'expédiée': 'bg-blue-100 text-blue-800 border-blue-300',
            'livrée': 'bg-green-100 text-green-800 border-green-300',
            'annulée': 'bg-red-100 text-red-800 border-red-300'
        };
        
        const statusColor = statusColors[order.statut] || statusColors['en-attente'];
        
        const modalHTML = `
            <div id="orderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeOrderDetailsModal(event)">
                <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-2xl font-bold">Détails de la commande</h2>
                                <p class="text-emerald-100 text-sm mt-1">Commande #${order.numeroCommande}</p>
                            </div>
                            <button onclick="closeOrderDetailsModal()" class="text-white hover:text-emerald-100">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            <div>
                                <p class="text-sm text-gray-600">Date de commande</p>
                                <p class="font-semibold text-gray-900">${formattedDate} à ${formattedTime}</p>
                            </div>
                            <span class="px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColor}">
                                ${order.statut}
                            </span>
                        </div>
                        
                        <div class="border-2 border-emerald-100 rounded-lg p-6">
                            <h3 class="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                                <i class="fas fa-user mr-2"></i>
                                Informations client
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-gray-600">Nom complet</p>
                                    <p class="font-semibold text-gray-900">${order.client.prenom} ${order.client.nom}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Téléphone</p>
                                    <p class="font-semibold text-gray-900">${order.client.telephone}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Wilaya</p>
                                    <p class="font-semibold text-gray-900">${order.client.wilaya}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <p class="text-sm text-gray-600">Adresse de livraison</p>
                                    <p class="font-semibold text-gray-900">${order.client.adresse}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="border-2 border-emerald-100 rounded-lg p-6">
                            <h3 class="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Articles commandés (${order.articles?.length || 0})
                            </h3>
                            <div class="space-y-3">
                                ${order.articles?.map(article => {
                                    const articleImage = article.image || generatePlaceholder(80, 80, '10b981', 'ffffff', article.nom.substring(0, 2).toUpperCase());
                                    return `
                                        <div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <img src="${articleImage}" alt="${article.nom}" 
                                                 class="w-20 h-20 object-cover rounded-lg border-2 border-emerald-200">
                                            <div class="flex-1">
                                                <h4 class="font-semibold text-gray-900">${article.nom}</h4>
                                                <p class="text-sm text-gray-600">Quantité: ${article.quantite} × ${article.prix} DA</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-bold text-emerald-700 text-lg">${article.quantite * article.prix} DA</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('') || '<p class="text-gray-500">Aucun article</p>'}
                            </div>
                        </div>
                        
                        <div class="border-2 border-emerald-100 rounded-lg p-6 bg-emerald-50">
                            <h3 class="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                                <i class="fas fa-calculator mr-2"></i>
                                Résumé financier
                            </h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-700">Sous-total:</span>
                                    <span class="font-semibold text-gray-900">${order.sousTotal || 0} DA</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-700">Frais de livraison:</span>
                                    <span class="font-semibold text-gray-900">${order.fraisLivraison || 0} DA</span>
                                </div>
                                <div class="flex justify-between items-center pt-3 border-t-2 border-emerald-200">
                                    <span class="text-lg font-bold text-emerald-800">Total:</span>
                                    <span class="text-2xl font-bold text-emerald-700">${order.total || 0} DA</span>
                                </div>
                                <div class="flex justify-between items-center mt-4">
                                    <span class="text-gray-700">Mode de paiement:</span>
                                    <span class="font-semibold text-gray-900">${order.modePaiement || 'Paiement à la livraison'}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${order.commentaires ? `
                            <div class="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h4 class="font-semibold text-gray-700 mb-2">Commentaires:</h4>
                                <p class="text-gray-600">${order.commentaires}</p>
                            </div>
                        ` : ''}
                        
                        <div class="flex items-center justify-end space-x-4 pt-4 border-t">
                            <button onclick="closeOrderDetailsModal()" 
                                    class="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        window.app.showToast(error.message || 'Erreur lors du chargement des détails', 'error');
    }
}

function closeOrderDetailsModal(event) {
    if (event && event.target.id !== 'orderDetailsModal') return;
    
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.remove();
    }
}

async function deleteOrder(orderId) {
    if (!window.app || !orderId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        console.log('Deleting order:', orderId);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée', 'error');
            return;
        }
        
        let response = await fetch(`https://parapharmacie-gaher.onrender.com/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            response = await fetch(`https://parapharmacie-gaher.onrender.com/api/admin/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
        }
        
        console.log('Delete order response:', response.status);
        
        if (response.ok) {
            window.app.showToast('Commande supprimée avec succès', 'success');
            window.app.loadAdminOrders();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        window.app.showToast(error.message || 'Erreur lors de la suppression de la commande', 'error');
    }
}

async function editProduct(productId) {
    if (!window.app || !productId) return;
    
    try {
        const product = window.app.allProducts.find(p => p._id === productId);
        
        if (!product) {
            window.app.showToast('Produit non trouvé', 'error');
            return;
        }
        
        let currentImageUrl = '';
        if (product.image && product.image.startsWith('data:image')) {
            currentImageUrl = product.image;
        } else if (product.image && product.image.startsWith('http')) {
            currentImageUrl = product.image;
        } else {
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            currentImageUrl = generatePlaceholder(128, 128, '10b981', 'ffffff', initials);
        }
        
        const modalHTML = `
            <div id="editProductModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeEditProductModal(event)">
                <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold">Modifier le produit</h2>
                            <button onclick="closeEditProductModal()" class="text-white hover:text-emerald-100">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    
                    <form id="editProductForm" class="p-6 space-y-4" onsubmit="saveProductEdit(event, '${productId}')">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                                <div class="flex items-center space-x-4">
                                    <div class="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                        <img id="editProductImagePreview" src="${currentImageUrl}" alt="Preview" class="w-full h-full object-cover">
                                        <div id="editProductImagePlaceholder" class="w-full h-full flex items-center justify-center bg-gray-50 hidden">
                                            <i class="fas fa-image text-4xl text-gray-300"></i>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <input type="file" id="editProductImageFile" accept="image/*" class="hidden" onchange="previewEditProductImage(this)">
                                        <button type="button" onclick="document.getElementById('editProductImageFile').click()" 
                                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                            <i class="fas fa-upload mr-2"></i>Changer l'image
                                        </button>
                                        <p class="text-xs text-gray-500 mt-2">JPG, PNG (Max 2MB)</p>
                                    </div>
                                </div>
                                <input type="hidden" id="editProductImageUrl" value="${product.image || ''}">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                                <input type="text" id="editProductNom" value="${product.nom || ''}" required
                                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                                <select id="editProductCategorie" required
                                        class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
                                    <option value="">Sélectionner...</option>
                                    ${['Vitalité', 'Sport', 'Visage', 'Cheveux', 'Solaire', 'Intime', 'Soins', 'Bébé', 'Homme', 'Dentaire'].map(cat => 
                                        `<option value="${cat}" ${product.categorie === cat ? 'selected' : ''}>${cat}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                                <input type="text" id="editProductMarque" value="${product.marque || ''}"
                                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                                <input type="number" id="editProductPrix" value="${product.prix || 0}" required min="0"
                                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                                <input type="number" id="editProductStock" value="${product.stock || 0}" required min="0"
                                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea id="editProductDescription" rows="3" required
                                          class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">${product.description || ''}</textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">En promotion</label>
                                <div class="flex items-center space-x-4">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="editProductPromotion" ${product.enPromotion ? 'checked' : ''}
                                               class="w-4 h-4 text-emerald-600 rounded">
                                        <span class="ml-2 text-sm text-gray-700">Oui</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">En vedette</label>
                                <div class="flex items-center space-x-4">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="editProductVedette" ${product.enVedette ? 'checked' : ''}
                                               class="w-4 h-4 text-emerald-600 rounded">
                                        <span class="ml-2 text-sm text-gray-700">Oui</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Actif</label>
                                <div class="flex items-center space-x-4">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="editProductActif" ${product.actif !== false ? 'checked' : ''}
                                               class="w-4 h-4 text-emerald-600 rounded">
                                        <span class="ml-2 text-sm text-gray-700">Oui</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-end space-x-4 pt-4 border-t">
                            <button type="button" onclick="closeEditProductModal()" 
                                    class="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" 
                                    class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-colors">
                                <i class="fas fa-save mr-2"></i>Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Error opening edit modal:', error);
        window.app.showToast('Erreur lors de l\'ouverture du formulaire', 'error');
    }
}

function previewEditProductImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        window.app.showToast('Image trop volumineuse. Maximum 2MB', 'error');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('editProductImagePreview');
        const imageUrlInput = document.getElementById('editProductImageUrl');
        
        if (preview && imageUrlInput) {
            preview.src = e.target.result;
            imageUrlInput.value = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

function closeEditProductModal(event) {
    if (event && event.target.id !== 'editProductModal') return;
    
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.remove();
    }
}

async function saveProductEdit(event, productId) {
    event.preventDefault();
    
    if (!window.app || !productId) return;
    
    try {
        const nom = document.getElementById('editProductNom').value.trim();
        const description = document.getElementById('editProductDescription').value.trim();
        
        if (!nom) {
            window.app.showToast('Le nom du produit est requis', 'error');
            return;
        }
        
        if (!description) {
            window.app.showToast('La description est requise', 'error');
            return;
        }
        
        const productData = {
            nom,
            categorie: document.getElementById('editProductCategorie').value,
            marque: document.getElementById('editProductMarque').value.trim(),
            prix: parseFloat(document.getElementById('editProductPrix').value),
            stock: parseInt(document.getElementById('editProductStock').value),
            description,
            image: document.getElementById('editProductImageUrl').value || '',
            enPromotion: document.getElementById('editProductPromotion').checked,
            enVedette: document.getElementById('editProductVedette').checked,
            actif: document.getElementById('editProductActif').checked
        };
        
        console.log('Updating product:', productId, productData);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée', 'error');
            return;
        }
        
        const response = await fetch(`https://parapharmacie-gaher.onrender.com/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Update product response:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Product updated successfully:', data);
            
            window.app.showToast('Produit mis à jour avec succès', 'success');
            closeEditProductModal();
            
            await window.app.fetchProductsFromAPI();
            window.app.loadAdminProducts();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        window.app.showToast(error.message || 'Erreur lors de la mise à jour du produit', 'error');
    }
}

async function deleteProduct(productId) {
    if (!window.app || !productId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        console.log('Deleting product:', productId);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée', 'error');
            return;
        }
        
        const response = await fetch(`https://parapharmacie-gaher.onrender.com/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete product response:', response.status);
        
        if (response.ok) {
            window.app.showToast('Produit supprimé avec succès', 'success');
            
            await window.app.fetchProductsFromAPI();
            window.app.loadAdminProducts();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        window.app.showToast(error.message || 'Erreur lors de la suppression du produit', 'error');
    }
}

function showAddProductModal() {
    if (!window.app) return;
    
    const modalHTML = `
        <div id="addProductModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeAddProductModal(event)">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold">Ajouter un nouveau produit</h2>
                        <button onclick="closeAddProductModal()" class="text-white hover:text-emerald-100">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <form id="addProductForm" class="p-6 space-y-4" onsubmit="saveNewProduct(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                            <div class="flex items-center space-x-4">
                                <div class="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                    <img id="addProductImagePreview" src="" alt="Preview" class="w-full h-full object-cover hidden">
                                    <div id="addProductImagePlaceholder" class="w-full h-full flex items-center justify-center bg-gray-50">
                                        <i class="fas fa-image text-4xl text-gray-300"></i>
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <input type="file" id="addProductImageFile" accept="image/*" class="hidden" onchange="previewAddProductImage(this)">
                                    <button type="button" onclick="document.getElementById('addProductImageFile').click()" 
                                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        <i class="fas fa-upload mr-2"></i>Choisir une image
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">JPG, PNG (Max 2MB)</p>
                                </div>
                            </div>
                            <input type="hidden" id="addProductImageUrl" value="">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                            <input type="text" id="addProductNom" required
                                   class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                   placeholder="Ex: Vitamine C 1000mg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                            <select id="addProductCategorie" required
                                    class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none">
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
                            <input type="text" id="addProductMarque"
                                   class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                   placeholder="Ex: Nature's Bounty">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                            <input type="number" id="addProductPrix" required min="0" step="0.01"
                                   class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                   placeholder="0.00">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                            <input type="number" id="addProductStock" required min="0"
                                   class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                   placeholder="0">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                            <textarea id="addProductDescription" rows="3" required
                                      class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                      placeholder="Description détaillée du produit..."></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" id="addProductPromotion" class="w-4 h-4 text-emerald-600 rounded">
                                    <span class="ml-2 text-sm text-gray-700">En promotion</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="addProductVedette" class="w-4 h-4 text-emerald-600 rounded">
                                    <span class="ml-2 text-sm text-gray-700">En vedette</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="addProductActif" checked class="w-4 h-4 text-emerald-600 rounded">
                                    <span class="ml-2 text-sm text-gray-700">Actif</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-end space-x-4 pt-4 border-t">
                        <button type="button" onclick="closeAddProductModal()" 
                                class="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-colors">
                            <i class="fas fa-plus mr-2"></i>Ajouter le produit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAddProductModal(event) {
    if (event && event.target.id !== 'addProductModal') return;
    
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.remove();
    }
}

function previewAddProductImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        window.app.showToast('Image trop volumineuse. Maximum 2MB', 'error');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('addProductImagePreview');
        const placeholder = document.getElementById('addProductImagePlaceholder');
        const imageUrlInput = document.getElementById('addProductImageUrl');
        
        if (preview && placeholder && imageUrlInput) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
            imageUrlInput.value = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

async function saveNewProduct(event) {
    event.preventDefault();
    
    if (!window.app) return;
    
    try {
        const nom = document.getElementById('addProductNom').value.trim();
        const description = document.getElementById('addProductDescription').value.trim();
        
        if (!nom) {
            window.app.showToast('Le nom du produit est requis', 'error');
            return;
        }
        
        if (!description) {
            window.app.showToast('La description est requise', 'error');
            return;
        }
        
        const productData = {
            nom,
            categorie: document.getElementById('addProductCategorie').value,
            marque: document.getElementById('addProductMarque').value.trim(),
            prix: parseFloat(document.getElementById('addProductPrix').value),
            stock: parseInt(document.getElementById('addProductStock').value),
            description,
            image: document.getElementById('addProductImageUrl').value || '',
            enPromotion: document.getElementById('addProductPromotion').checked,
            enVedette: document.getElementById('addProductVedette').checked,
            actif: document.getElementById('addProductActif').checked
        };
        
        console.log('Creating new product:', productData);
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.app.showToast('Session expirée', 'error');
            return;
        }
        
        const response = await fetch('https://parapharmacie-gaher.onrender.com/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Create product response:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Product created successfully:', data);
            
            window.app.showToast('Produit ajouté avec succès', 'success');
            closeAddProductModal();
            
            await window.app.fetchProductsFromAPI();
            window.app.loadAdminProducts();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la création');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        window.app.showToast(error.message || 'Erreur lors de l\'ajout du produit', 'error');
    }
}

function filterOrders(status) {
    console.log('Filter orders by status:', status);
}

// ============================================================================
// INITIALIZE APP WITH URL ROUTING
// ============================================================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Initializing Shifa Parapharmacie App with SEO URL Routing');
    app = new PharmacieGaherApp();
    window.app = app;
});
