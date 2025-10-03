// API Configuration and Utility Functions
const API_CONFIG = {
    BASE_URL: 'https://parapharmacie-gaher.onrender.com',
    ENDPOINTS: {
        AUTH: '/api/auth',
        PRODUCTS: '/api/products',
        ORDERS: '/api/orders',
        ADMIN: '/api/admin'
    }
};

// Utility Functions
function buildApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
        }
        return;
    }
    
    try {
        // Check for admin credentials first
        if (email === 'pharmaciegaher@gmail.com' && password === 'anesaya75') {
            // Create admin user object
            const adminUser = {
                _id: 'admin_001',
                email: 'pharmaciegaher@gmail.com',
                prenom: 'Admin',
                nom: 'Shifa',
                role: 'admin',
                telephone: '+213123456789',
                wilaya: 'M\'Sila',
                dateInscription: new Date().toISOString()
            };
            
            // Save admin session
            localStorage.setItem('token', 'admin_token_' + Date.now());
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            
            if (window.app) {
                window.app.currentUser = adminUser;
                window.app.updateUserUI();
                window.app.showToast('Connexion administrateur réussie', 'success');
                window.app.showPage('admin');
            }
            return;
        }
        
        // Try API login
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                if (window.app) {
                    window.app.currentUser = response.user;
                    window.app.updateUserUI();
                    window.app.showToast('Connexion réussie', 'success');
                    window.app.showPage('home');
                }
            }
        } catch (apiError) {
            // Fallback to local authentication
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const token = 'local_token_' + Date.now();
                localStorage.setItem('token', token);
                
                if (window.app) {
                    window.app.currentUser = { ...user };
                    delete window.app.currentUser.password; // Remove password from memory
                    window.app.updateUserUI();
                    window.app.showToast('Connexion réussie', 'success');
                    window.app.showPage('home');
                }
            } else {
                throw new Error('Email ou mot de passe incorrect');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (window.app) {
            window.app.showToast(error.message || 'Erreur de connexion', 'error');
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        prenom: document.getElementById('registerPrenom').value.trim(),
        nom: document.getElementById('registerNom').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        telephone: document.getElementById('registerTele
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
            livraisonGratuite: 5000,
            adminEmail: 'pharmaciegaher@gmail.com',
            adminPassword: 'anesaya75'
        };
        this.currentPage = 'home';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoadingOverlay();
            await this.checkAuth();
            await this.loadProductsCache();
            this.initUI();
            this.initAnimations();
            await this.showPage('home');
            this.updateCartUI();
            this.initSearch();
            this.initScrollEffects();
        } catch (error) {
            console.error('Erreur initialisation app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }
    
    showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'initLoadingOverlay';
        overlay.className = 'fixed inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20 backdrop-blur-sm z-50 flex items-center justify-center';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30 animate-pulse mb-6">
                    <i class="fas fa-seedling text-5xl text-white drop-shadow-lg"></i>
                </div>
                <h2 class="text-3xl font-bold text-white mb-4">Shifa</h2>
                <div class="flex space-x-1 justify-center">
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('initLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }
    
    initAnimations() {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add entrance animations to elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate
        setTimeout(() => {
            document.querySelectorAll('.product-card, .category-card, .feature-card').forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }
    
    initScrollEffects() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('header');
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.classList.add('transform', '-translate-y-full');
                } else {
                    header.classList.remove('transform', '-translate-y-full');
                }
                
                if (currentScrollY > 50) {
                    header.classList.add('backdrop-blur-md', 'bg-white/80', 'border-b', 'border-emerald-200/50');
                } else {
                    header.classList.remove('backdrop-blur-md', 'bg-white/80', 'border-b', 'border-emerald-200/50');
                }
            }
            
            lastScrollY = currentScrollY;
        });
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
        
        if (this.currentPage === 'home') {
            this.refreshHomePage();
        } else if (this.currentPage === 'products') {
            this.showPage('products');
        }
    }
    
    refreshHomePage() {
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
            
            // Add search suggestions
            searchInput.addEventListener('input', (e) => {
                this.showSearchSuggestions(e.target.value);
            });
        }
        
        this.updateCartUI();
        window.app = this;
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    showSearchSuggestions(query) {
        if (!query || query.length < 2) return;
        
        const suggestions = this.allProducts
            .filter(p => p.nom.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
            
        // Implementation for search dropdown would go here
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal, .sidebar').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && !cartSidebar.classList.contains('translate-x-full')) {
            toggleCart();
        }
    }
    
    updateUserUI() {
        const guestMenu = document.getElementById('guestMenu');
        const userLoggedMenu = document.getElementById('userLoggedMenu');
        const adminMenuLink = document.getElementById('adminMenuLink');
        
        if (this.currentUser) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userLoggedMenu) {
                userLoggedMenu.style.display = 'block';
                // Add user info to menu
                const userInfo = userLoggedMenu.querySelector('.user-info');
                if (userInfo) {
                    userInfo.innerHTML = `
                        <div class="text-xs text-emerald-600">Connecté en tant que</div>
                        <div class="font-semibold text-emerald-800">${this.currentUser.prenom} ${this.currentUser.nom}</div>
                    `;
                }
            }
            
            // Check if user is admin
            if (this.currentUser.email === this.settings.adminEmail && adminMenuLink) {
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
            
            // Add page transition effect
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.style.opacity = '0';
                mainContent.style.transform = 'translateY(20px)';
            }
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
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
                case 'orders':
                    if (!this.currentUser) {
                        await this.showPage('login');
                        return;
                    }
                    await this.loadOrdersPage();
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
                    if (!this.currentUser || this.currentUser.email !== this.settings.adminEmail) {
                        this.showToast('Accès refusé - Droits administrateur requis', 'error');
                        await this.showPage('home');
                        return;
                    }
                    await this.loadAdminPage();
                    break;
                default:
                    await this.loadHomePage();
            }
            
            // Restore page transition
            if (mainContent) {
                setTimeout(() => {
                    mainContent.style.opacity = '1';
                    mainContent.style.transform = 'translateY(0)';
                }, 50);
            }
            
            this.hideLoading();
            
            // Scroll to top with smooth animation
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erreur chargement page:', error);
            this.hideLoading();
            this.showToast('Erreur de chargement de la page', 'error');
        }
    }

    async loadHomePage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <!-- Hero Section with Enhanced Animations -->
            <section class="hero-gradient text-white py-32 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20"></div>
                
                <!-- Animated Background Elements -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
                    <div class="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-float-delayed"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-gradient-radial from-transparent via-white/5 to-transparent"></div>
                </div>
                
                <div class="container mx-auto px-4 relative z-10">
                    <div class="max-w-5xl mx-auto text-center">
                        <!-- Logo Animation -->
                        <div class="flex justify-center mb-8">
                            <div class="relative">
                                <div class="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30 animate-pulse-slow group hover:scale-110 transition-all duration-700">
                                    <i class="fas fa-seedling text-8xl text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-700"></i>
                                </div>
                                <div class="absolute -inset-4 bg-gradient-to-r from-emerald-400/30 to-green-500/30 rounded-3xl blur-xl animate-pulse"></div>
                            </div>
                        </div>
                        
                        <!-- Enhanced Typography -->
                        <div class="space-y-6 animate-fadeInUp">
                            <h1 class="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
                                Shifa
                            </h1>
                            <h2 class="text-3xl md:text-4xl font-bold mb-8 text-emerald-100 animate-slideInLeft">
                                Parapharmacie de Confiance
                            </h2>
                            <p class="text-xl md:text-2xl mb-12 opacity-90 text-green-50 max-w-3xl mx-auto leading-relaxed animate-slideInRight">
                                Découvrez notre gamme complète de produits de santé et de bien-être. 
                                Votre santé naturelle, notre engagement quotidien.
                            </p>
                        </div>
                        
                        <!-- Enhanced CTA Buttons -->
                        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp">
                            <button onclick="app.showPage('products')" 
                                    class="group relative bg-white text-emerald-600 hover:bg-emerald-50 text-xl font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden">
                                <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <span class="relative flex items-center">
                                    <i class="fas fa-leaf mr-3 group-hover:rotate-12 transition-transform duration-300"></i>
                                    Explorer nos produits
                                </span>
                            </button>
                            
                            <button onclick="app.showPage('contact')" 
                                    class="group bg-transparent border-2 border-white/50 text-white hover:bg-white/10 text-lg font-semibold px-10 py-5 rounded-2xl transition-all duration-300 backdrop-blur-sm">
                                <span class="flex items-center">
                                    <i class="fas fa-phone mr-3 group-hover:ring-2 transition-all duration-300"></i>
                                    Nous contacter
                                </span>
                            </button>
                        </div>
                        
                        <!-- Trust Indicators -->
                        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
                            <div class="text-center animate-fadeInUp" style="animation-delay: 0.1s">
                                <div class="text-3xl font-bold text-white">500+</div>
                                <div class="text-emerald-200">Produits</div>
                            </div>
                            <div class="text-center animate-fadeInUp" style="animation-delay: 0.2s">
                                <div class="text-3xl font-bold text-white">24h</div>
                                <div class="text-emerald-200">Livraison</div>
                            </div>
                            <div class="text-center animate-fadeInUp" style="animation-delay: 0.3s">
                                <div class="text-3xl font-bold text-white">100%</div>
                                <div class="text-emerald-200">Authentique</div>
                            </div>
                            <div class="text-center animate-fadeInUp" style="animation-delay: 0.4s">
                                <div class="text-3xl font-bold text-white">1000+</div>
                                <div class="text-emerald-200">Clients</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Wave Effect -->
                <div class="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="relative block w-full h-16">
                        <path d="M0,60 C300,0 900,120 1200,60 L1200,120 L0,120 Z" class="fill-green-50"></path>
                    </svg>
                </div>
            </section>
            
            <!-- Enhanced Categories Section -->
            <section class="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16 animate-fadeInUp">
                        <h2 class="text-5xl font-black text-emerald-800 mb-6 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            Nos Catégories
                        </h2>
                        <p class="text-xl text-emerald-600 max-w-2xl mx-auto leading-relaxed">
                            Explorez notre large gamme de produits de santé et bien-être, 
                            soigneusement sélectionnés pour votre satisfaction
                        </p>
                        <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto mt-6 rounded-full"></div>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-6" id="categoriesGrid">
                        <!-- Categories will be loaded here with enhanced animations -->
                    </div>
                </div>
            </section>
            
            <!-- Enhanced Featured Products Section -->
            <section class="py-20 bg-white relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-green-50/30"></div>
                
                <div class="container mx-auto px-4 relative z-10">
                    <div class="text-center mb-16 animate-fadeInUp">
                        <h2 class="text-5xl font-black text-emerald-800 mb-6">
                            <i class="fas fa-star text-yellow-400 mr-4"></i>
                            Nos Coups de Cœur
                        </h2>
                        <p class="text-xl text-emerald-600 max-w-2xl mx-auto">
                            Découvrez nos produits les plus populaires, recommandés par nos experts
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" id="featuredProducts">
                        <!-- Featured products will be loaded here with staggered animations -->
                    </div>
                </div>
            </section>
            
            <!-- Enhanced Promotions Section -->
            <section class="py-20 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 relative">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16 animate-fadeInUp">
                        <h2 class="text-5xl font-black text-red-800 mb-6">
                            <i class="fas fa-fire text-red-500 mr-4 animate-bounce"></i>
                            Promotions Exceptionnelles
                        </h2>
                        <p class="text-xl text-red-600 max-w-2xl mx-auto">
                            Profitez de nos offres spéciales et économisez sur vos produits préférés
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" id="promotionProducts">
                        <!-- Promotion products will be loaded here -->
                    </div>
                </div>
            </section>
            
            <!-- Enhanced Features Section -->
            <section class="py-20 bg-gradient-to-br from-emerald-800 to-green-900 text-white relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                
                <div class="container mx-auto px-4 relative z-10">
                    <div class="text-center mb-16">
                        <h2 class="text-5xl font-black mb-6">Pourquoi Choisir Shifa ?</h2>
                        <p class="text-xl opacity-90 max-w-2xl mx-auto">
                            Votre satisfaction et votre bien-être sont notre priorité absolue
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="feature-card text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <div class="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <i class="fas fa-shipping-fast text-3xl text-white"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Livraison Express</h3>
                            <p class="opacity-90">Livraison rapide sous 24-48h dans toute l'Algérie</p>
                        </div>
                        
                        <div class="feature-card text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <div class="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <i class="fas fa-certificate text-3xl text-white"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Produits Authentiques</h3>
                            <p class="opacity-90">100% originaux et certifiés par nos fournisseurs</p>
                        </div>
                        
                        <div class="feature-card text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <div class="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <i class="fas fa-headset text-3xl text-white"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Support 24/7</h3>
                            <p class="opacity-90">Notre équipe vous accompagne à tout moment</p>
                        </div>
                        
                        <div class="feature-card text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <div class="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <i class="fas fa-money-bill-wave text-3xl text-white"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Paiement Sécurisé</h3>
                            <p class="opacity-90">Paiement à la livraison pour votre tranquillité</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        await this.loadCategories();
        await this.loadFeaturedProducts();
        await this.loadPromotionProducts();
        
        // Initialize animations after content loads
        setTimeout(() => {
            this.initAnimations();
        }, 100);
    }

    async loadLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <!-- Animated Background -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute top-20 left-20 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl animate-float"></div>
                    <div class="absolute bottom-20 right-20 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-float-delayed"></div>
                </div>
                
                <div class="max-w-md w-full space-y-8 relative z-10">
                    <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 transform hover:scale-105 transition-all duration-300">
                        <!-- Enhanced Header -->
                        <div class="text-center">
                            <div class="flex justify-center mb-6">
                                <div class="relative">
                                    <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <i class="fas fa-user-circle text-white text-4xl"></i>
                                    </div>
                                    <div class="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 to-green-500/30 rounded-2xl blur-lg animate-pulse"></div>
                                </div>
                            </div>
                            <h2 class="text-4xl font-black text-emerald-800 mb-3 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                                Connexion
                            </h2>
                            <p class="text-emerald-600 mb-8 text-lg">Accédez à votre espace Shifa</p>
                        </div>

                        <!-- Enhanced Login Form -->
                        <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                            <div class="group">
                                <label for="loginEmail" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-envelope mr-2"></i>Adresse email
                                </label>
                                <div class="relative">
                                    <input 
                                        id="loginEmail" 
                                        name="email" 
                                        type="email" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="votre@email.com"
                                    >
                                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                            </div>

                            <div class="group">
                                <label for="loginPassword" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-lock mr-2"></i>Mot de passe
                                </label>
                                <div class="relative">
                                    <input 
                                        id="loginPassword" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm pr-12 group-hover:border-emerald-300"
                                        placeholder="Votre mot de passe"
                                    >
                                    <button 
                                        type="button" 
                                        onclick="togglePasswordVisibility('loginPassword', this)"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                class="group relative w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                            >
                                <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <span class="relative flex items-center justify-center">
                                    <i class="fas fa-sign-in-alt mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                                    Se connecter
                                </span>
                            </button>
                        </form>

                        <!-- Enhanced Divider -->
                        <div class="my-8">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t-2 border-emerald-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white text-emerald-600 font-semibold rounded-full border border-emerald-200">
                                        Nouveau client ?
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Register Link -->
                        <div class="text-center">
                            <button 
                                onclick="app.showPage('register')" 
                                class="group w-full bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105"
                            >
                                <span class="flex items-center justify-center">
                                    <i class="fas fa-user-plus mr-2 group-hover:bounce-sm transition-transform duration-300"></i>
                                    Créer un compte
                                </span>
                            </button>
                        </div>

                        <!-- Back to Home -->
                        <div class="text-center mt-6">
                            <button 
                                onclick="app.showPage('home')" 
                                class="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors duration-300 flex items-center justify-center mx-auto"
                            >
                                <i class="fas fa-arrow-left mr-2 transition-transform duration-300 hover:-translate-x-1"></i>
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRegisterPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <!-- Animated Background -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute top-32 left-32 w-72 h-72 bg-green-300/20 rounded-full blur-3xl animate-float"></div>
                    <div class="absolute bottom-32 right-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float-delayed"></div>
                </div>
                
                <div class="max-w-4xl w-full space-y-8 relative z-10">
                    <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                        <!-- Enhanced Header -->
                        <div class="text-center mb-8">
                            <div class="flex justify-center mb-6">
                                <div class="relative">
                                    <div class="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <i class="fas fa-user-plus text-white text-4xl"></i>
                                    </div>
                                    <div class="absolute -inset-3 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-3xl blur-xl animate-pulse"></div>
                                </div>
                            </div>
                            <h2 class="text-4xl font-black text-emerald-800 mb-3 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                                Rejoignez Shifa
                            </h2>
                            <p class="text-emerald-600 text-lg">Créez votre compte et découvrez nos avantages exclusifs</p>
                        </div>

                        <!-- Enhanced Register Form -->
                        <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                            <!-- Personal Info with Animation -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="group">
                                    <label for="registerPrenom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-user mr-2"></i>Prénom *
                                    </label>
                                    <input 
                                        id="registerPrenom" 
                                        name="prenom" 
                                        type="text" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="Votre prénom"
                                    >
                                </div>
                                
                                <div class="group">
                                    <label for="registerNom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-user mr-2"></i>Nom *
                                    </label>
                                    <input 
                                        id="registerNom" 
                                        name="nom" 
                                        type="text" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="Votre nom de famille"
                                    >
                                </div>
                            </div>

                            <!-- Contact Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="group">
                                    <label for="registerEmail" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-envelope mr-2"></i>Adresse email *
                                    </label>
                                    <input 
                                        id="registerEmail" 
                                        name="email" 
                                        type="email" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="votre@email.com"
                                    >
                                </div>
                                
                                <div class="group">
                                    <label for="registerTelephone" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-phone mr-2"></i>Téléphone *
                                    </label>
                                    <input 
                                        id="registerTelephone" 
                                        name="telephone" 
                                        type="tel" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="+213 XX XX XX XX XX"
                                        pattern="^(\\+213|0)[5-9]\\d{8}$"
                                        title="Numéro de téléphone algérien valide"
                                    >
                                </div>
                            </div>

                            <!-- Password with Strength Indicator -->
                            <div class="group">
                                <label for="registerPassword" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-lock mr-2"></i>Mot de passe *
                                </label>
                                <div class="relative">
                                    <input 
                                        id="registerPassword" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        minlength="6"
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm pr-12 group-hover:border-emerald-300"
                                        placeholder="Minimum 6 caractères"
                                        oninput="checkPasswordStrength(this.value)"
                                    >
                                    <button 
                                        type="button" 
                                        onclick="togglePasswordVisibility('registerPassword', this)"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="passwordStrength" class="mt-2 hidden">
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div id="strengthBar" class="h-2 rounded-full transition-all duration-300"></div>
                                    </div>
                                    <div id="strengthText" class="text-xs mt-1"></div>
                                </div>
                                <div class="mt-2 text-xs text-emerald-600">
                                    Le mot de passe doit contenir au moins 6 caractères
                                </div>
                            </div>

                            <!-- Address Info with Enhanced Styling -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="group">
                                    <label for="registerWilaya" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-map-marker-alt mr-2"></i>Wilaya *
                                    </label>
                                    <select 
                                        id="registerWilaya" 
                                        name="wilaya" 
                                        required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                    >
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
                                        <option value="M'Sila" selected>28 - M'Sila</option>
                                        <option value="Mascara">29 - Mascara</option>
                                        <option value="Ouargla">30 - Ouargla</option>
                                        <option value="Oran">31 - Oran</option>
                                        <option value="El Bayadh">32 - El Bayadh</option>
                                        <option value="Illizi">33 - Illizi</option>
                                        <option value="Bordj Bou Arréridj">34 - Bordj Bou Arréridj</option>
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
                                
                                <div class="group">
                                    <label for="registerAdresse" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-home mr-2"></i>Adresse (optionnel)
                                    </label>
                                    <input 
                                        id="registerAdresse" 
                                        name="adresse" 
                                        type="text" 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                        placeholder="Votre adresse complète"
                                    >
                                </div>
                            </div>

                            <!-- Enhanced Terms and Submit -->
                            <div class="space-y-6">
                                <div class="flex items-center group">
                                    <input 
                                        id="acceptTerms" 
                                        type="checkbox" 
                                        required
                                        class="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded transition-all"
                                    >
                                    <label for="acceptTerms" class="ml-3 text-sm text-emerald-700 group-hover:text-emerald-600 transition-colors">
                                        J'accepte les <a href="#" class="text-emerald-600 hover:text-emerald-800 font-bold underline">conditions d'utilisation</a> et la <a href="#" class="text-emerald-600 hover:text-emerald-800 font-bold underline">politique de confidentialité</a>
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    class="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                                >
                                    <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                    <span class="relative flex items-center justify-center">
                                        <i class="fas fa-user-plus mr-2 group-hover:bounce-sm transition-transform duration-300"></i>
                                        Créer mon compte
                                    </span>
                                </button>
                            </div>
                        </form>

                        <!-- Enhanced Navigation -->
                        <div class="mt-8 space-y-4">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t-2 border-emerald-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white text-emerald-600 font-semibold rounded-full border border-emerald-200">
                                        Déjà membre ?
                                    </span>
                                </div>
                            </div>

                            <button 
                                onclick="app.showPage('login')" 
                                class="group w-full bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105"
                            >
                                <span class="flex items-center justify-center">
                                    <i class="fas fa-sign-in-alt mr-2 group-hover:bounce-sm transition-transform duration-300"></i>
                                    Se connecter
                                </span>
                            </button>

                            <div class="text-center">
                                <button 
                                    onclick="app.showPage('home')" 
                                    class="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors duration-300 flex items-center justify-center mx-auto"
                                >
                                    <i class="fas fa-arrow-left mr-2 transition-transform duration-300 hover:-translate-x-1"></i>
                                    Retour à l'accueil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                function checkPasswordStrength(password) {
                    const strengthDiv = document.getElementById('passwordStrength');
                    const strengthBar = document.getElementById('strengthBar');
                    const strengthText = document.getElementById('strengthText');
                    
                    if (password.length === 0) {
                        strengthDiv.classList.add('hidden');
                        return;
                    }
                    
                    strengthDiv.classList.remove('hidden');
                    
                    let score = 0;
                    let feedback = '';
                    
                    if (password.length >= 6) score += 25;
                    if (password.length >= 10) score += 25;
                    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
                    if (/\\d/.test(password)) score += 15;
                    if (/[^\\w\\s]/.test(password)) score += 10;
                    
                    if (score < 30) {
                        strengthBar.className = 'h-2 rounded-full transition-all duration-300 bg-red-500';
                        strengthBar.style.width = '25%';
                        strengthText.className = 'text-xs mt-1 text-red-600';
                        feedback = 'Mot de passe faible';
                    } else if (score < 60) {
                        strengthBar.className = 'h-2 rounded-full transition-all duration-300 bg-yellow-500';
                        strengthBar.style.width = '50%';
                        strengthText.className = 'text-xs mt-1 text-yellow-600';
                        feedback = 'Mot de passe moyen';
                    } else if (score < 90) {
                        strengthBar.className = 'h-2 rounded-full transition-all duration-300 bg-blue-500';
                        strengthBar.style.width = '75%';
                        strengthText.className = 'text-xs mt-1 text-blue-600';
                        feedback = 'Mot de passe bon';
                    } else {
                        strengthBar.className = 'h-2 rounded-full transition-all duration-300 bg-green-500';
                        strengthBar.style.width = '100%';
                        strengthText.className = 'text-xs mt-1 text-green-600';
                        feedback = 'Mot de passe excellent';
                    }
                    
                    strengthText.textContent = feedback;
                }
            </script>
        `;
    }

    async loadProductsPage(params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        let products = [...this.allProducts];
        let title = 'Tous nos produits';
        
        // Apply filters
        if (params.categorie) {
            products = products.filter(p => p.categorie === params.categorie);
            title = `Catégorie: ${params.categorie}`;
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            products = products.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm) ||
                p.marque?.toLowerCase().includes(searchTerm)
            );
            title = `Recherche: "${params.search}"`;
        }

        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 relative">
                <!-- Enhanced Header with Gradient Background -->
                <div class="text-center mb-12 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-50/50 to-emerald-100/50 rounded-3xl blur-xl"></div>
                    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-xl">
                        <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            ${title}
                        </h1>
                        <p class="text-xl text-emerald-600 mb-4">${products.length} produit(s) trouvé(s)</p>
                        <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
                    </div>
                </div>

                <!-- Enhanced Filters with Animations -->
                <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-emerald-200/50 p-8 mb-12 transform hover:scale-105 transition-all duration-300">
                    <div class="flex flex-wrap gap-6 items-center justify-between">
                        <!-- Category Filters -->
                        <div class="flex flex-wrap gap-3">
                            <button onclick="app.showPage('products')" 
                                    class="filter-btn ${!params.categorie ? 'active' : ''} px-6 py-3 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105">
                                <i class="fas fa-th-large mr-2"></i>Tous
                            </button>
                            ${['Vitalité', 'Sport', 'Visage', 'Cheveux', 'Solaire', 'Intime', 'Soins', 'Bébé', 'Homme', 'Dentaire'].map(cat => `
                                <button onclick="app.filterByCategory('${cat}')" 
                                        class="filter-btn ${params.categorie === cat ? 'active' : ''} px-6 py-3 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105">
                                    ${cat}
                                </button>
                            `).join('')}
                        </div>
                        
                        <!-- Sort Options -->
                        <div class="flex items-center space-x-4">
                            <label class="text-emerald-700 font-semibold">
                                <i class="fas fa-sort mr-2"></i>Trier par:
                            </label>
                            <select id="sortSelect" onchange="app.sortProducts(this.value)" 
                                    class="px-4 py-3 border-2 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm font-semibold">
                                <option value="nom">Nom A-Z</option>
                                <option value="prix-asc">Prix croissant</option>
                                <option value="prix-desc">Prix décroissant</option>
                                <option value="stock">Stock disponible</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Products Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" id="productsGrid">
                    ${products.length > 0 ? products.map((product, index) => this.createEnhancedProductCard(product, index)).join('') : `
                        <div class="col-span-full text-center py-20">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-emerald-200/50 shadow-xl">
                                <i class="fas fa-search text-8xl text-emerald-200 mb-8 animate-pulse"></i>
                                <h3 class="text-3xl font-black text-emerald-800 mb-6">Aucun produit trouvé</h3>
                                <p class="text-emerald-600 mb-8 text-lg">Essayez de modifier vos critères de recherche</p>
                                <button onclick="app.showPage('products')" 
                                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-10 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                                    <i class="fas fa-arrow-left mr-2"></i>Voir tous les produits
                                </button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
            
            <style>
                .filter-btn {
                    background: white;
                    border-color: #d1fae5;
                    color: #059669;
                }
                
                .filter-btn.active {
                    background: linear-gradient(to right, #10b981, #059669);
                    border-color: #059669;
                    color: white;
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                }
                
                .filter-btn:hover {
                    border-color: #10b981;
                    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2);
                }
            </style>
        `;
        
        // Add staggered animation to products
        setTimeout(() => {
            document.querySelectorAll('#productsGrid .product-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('animate-fadeInUp');
            });
        }, 100);
    }

    createEnhancedProductCard(product, index = 0) {
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
            imageUrl = `https://via.placeholder.com/400x400/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        return `
            <div class="product-card group bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 hover:shadow-2xl hover:scale-105 ${isOutOfStock ? 'opacity-75' : ''}"
                 onclick="app.showPage('product', {id: '${product._id}'})"
                 style="animation-delay: ${index * 0.1}s">
                
                <!-- Enhanced Badge System -->
                <div class="absolute top-4 left-4 z-20 flex flex-col space-y-2">
                    ${hasPromotion ? `
                        <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                        </div>
                    ` : ''}
                    ${product.enVedette ? `
                        <div class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            <i class="fas fa-star mr-1"></i>Vedette
                        </div>
                    ` : ''}
                    ${product.stock <= 5 && product.stock > 0 ? `
                        <div class="bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            Stock limité
                        </div>
                    ` : ''}
                </div>
                
                <!-- Out of Stock Overlay -->
                ${isOutOfStock ? `
                    <div class="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-3xl backdrop-blur-sm">
                        <div class="text-center text-white">
                            <i class="fas fa-times-circle text-4xl mb-2"></i>
                            <span class="font-bold text-lg">Rupture de stock</span>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Enhanced Image Container -->
                <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         onerror="this.src='https://via.placeholder.com/400x400/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                    
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    <!-- Quick Actions -->
                    ${!isOutOfStock ? `
                        <div class="absolute bottom-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button onclick="event.stopPropagation(); addToCartFromCard('${product._id}')" 
                                    class="bg-white/90 backdrop-blur-sm text-emerald-600 p-3 rounded-full shadow-lg hover:bg-emerald-500 hover:text-white transition-all duration-300 transform hover:scale-110">
                                <i class="fas fa-cart-plus text-lg"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Enhanced Content -->
                <div class="p-6 space-y-4">
                    <!-- Product Title -->
                    <h3 class="font-black text-emerald-800 text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                        ${product.nom}
                    </h3>
                    
                    <!-- Description -->
                    <p class="text-sm text-emerald-600 line-clamp-2 leading-relaxed">
                        ${product.description || 'Découvrez ce produit de qualité premium'}
                    </p>
                    
                    <!-- Price Section -->
                    <div class="flex items-center justify-between">
                        <div class="space-y-1">
                            ${hasPromotion ? `
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>
                                    <span class="text-xl font-black text-red-600">${product.prix} DA</span>
                                </div>
                                <div class="text-xs text-red-500 font-semibold">
                                    Économisez ${product.prixOriginal - product.prix} DA
                                </div>
                            ` : `
                                <span class="text-2xl font-black text-emerald-700">${product.prix} DA</span>
                            `}
                        </div>
                        
                        <!-- Category Badge -->
                        <div class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                            ${product.categorie}
                        </div>
                    </div>
                    
                    <!-- Stock and Brand Info -->
                    <div class="flex items-center justify-between text-sm pt-2 border-t border-emerald-100">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-boxes text-emerald-500"></i>
                            <span class="text-emerald-600 font-semibold">Stock: ${product.stock}</span>
                        </div>
                        <span class="text-emerald-700 font-semibold">${product.marque || 'Shifa'}</span>
                    </div>
                    
                    <!-- Action Button -->
                    ${!isOutOfStock ? `
                        <button onclick="event.stopPropagation(); addToCartFromCard('${product._id}')" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group-hover:scale-105">
                            <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                        </button>
                    ` : `
                        <button class="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed" disabled>
                            <i class="fas fa-times mr-2"></i>Non disponible
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    async loadCategories() {
        const mainPageCategories = [
            { nom: 'Vitalité', description: 'Vitamines & Énergie', icon: 'fa-seedling', color: 'emerald' },
            { nom: 'Sport', description: 'Nutrition sportive', icon: 'fa-dumbbell', color: 'red' },
            { nom: 'Visage', description: 'Soins du visage', icon: 'fa-smile', color: 'pink' },
            { nom: 'Cheveux', description: 'Soins capillaires', icon: 'fa-cut', color: 'yellow' },
            { nom: 'Solaire', description: 'Protection solaire', icon: 'fa-sun', color: 'orange' },
            { nom: 'Intime', description: 'Hygiène intime', icon: 'fa-heart', color: 'rose' },
            { nom: 'Soins', description: 'Soins corporels', icon: 'fa-spa', color: 'green' },
            { nom: 'Bébé', description: 'Soins bébé', icon: 'fa-baby-carriage', color: 'cyan' },
            { nom: 'Homme', description: 'Soins masculins', icon: 'fa-user-tie', color: 'blue' },
            { nom: 'Dentaire', description: 'Hygiène dentaire', icon: 'fa-tooth', color: 'indigo' }
        ];
        
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = mainPageCategories.map((category, index) => `
                <div class="category-card group text-center cursor-pointer p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-emerald-200/50 hover:border-${category.color}-400/60 transform hover:scale-105 hover:-rotate-1 ${index === 0 ? 'ring-2 ring-emerald-400 bg-gradient-to-br from-emerald-50 to-green-100' : ''}"
                     onclick="app.filterByCategory('${category.nom}')"
                     style="animation-delay: ${index * 0.1}s">
                    
                    <!-- Enhanced Icon Container -->
                    <div class="category-icon mx-auto relative ${index === 0 ? 'animate-pulse' : ''}">
                        <div class="w-20 h-20 bg-gradient-to-br from-${category.color}-400 to-${category.color}-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative">
                            <i class="fas ${category.icon} text-3xl text-white drop-shadow-lg"></i>
                            <div class="absolute -inset-2 bg-gradient-to-r from-${category.color}-400/30 to-${category.color}-600/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                        </div>
                    </div>
                    
                    <!-- Enhanced Content -->
                    <div class="mt-6 space-y-2">
                        <h3 class="font-black text-emerald-800 text-lg group-hover:text-${category.color}-600 transition-colors duration-300">
                            ${category.nom}
                        </h3>
                        <p class="text-sm text-emerald-600 font-semibold group-hover:text-gray-600 transition-colors duration-300">
                            ${category.description}
                        </p>
                        
                        ${index === 0 ? `
                            <div class="mt-3">
                                <span class="text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full font-bold animate-bounce">
                                    ★ POPULAIRE
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Hover Arrow -->
                    <div class="mt-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <i class="fas fa-arrow-right text-${category.color}-500 group-hover:translate-x-1 transition-transform duration-300"></i>
                    </div>
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
                    <div class="col-span-full text-center py-20">
                        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-emerald-200/50 shadow-xl">
                            <i class="fas fa-star text-8xl text-emerald-200 mb-8 animate-pulse"></i>
                            <h3 class="text-3xl font-black text-emerald-800 mb-6">Aucun produit en vedette</h3>
                            <p class="text-emerald-600 mb-8 text-lg">Ajoutez des produits en vedette depuis l'administration</p>
                            ${this.currentUser && this.currentUser.email === this.settings.adminEmail ? `
                            <button onclick="app.showPage('admin')" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-10 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                                <i class="fas fa-cog mr-2"></i>Aller à l'administration
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = featuredProducts.slice(0, 8).map((product, index) => this.createEnhancedProductCard(product, index)).join('');
                
                // Add staggered animation
                setTimeout(() => {
                    container.querySelectorAll('.product-card').forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.1}s`;
                        card.classList.add('animate-fadeInUp');
                    });
                }, 100);
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
                    <div class="col-span-full text-center py-20">
                        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-red-200/50 shadow-xl">
                            <i class="fas fa-tags text-8xl text-red-300 mb-8 animate-pulse"></i>
                            <h3 class="text-3xl font-black text-red-800 mb-6">Aucune promotion active</h3>
                            <p class="text-red-600 mb-8 text-lg">Créez des promotions depuis l'administration</p>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = promotionProducts.slice(0, 8).map((product, index) => this.createEnhancedProductCard(product, index)).join('');
                
                // Add staggered animation
                setTimeout(() => {
                    container.querySelectorAll('.product-card').forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.1}s`;
                        card.classList.add('animate-fadeInUp');
                    });
                }, 100);
            }
        }
    }

    // Continue with remaining methods...
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
            
            // Add cart bounce animation
            const cartButton = document.querySelector('[onclick*="toggleCart"]');
            if (cartButton) {
                cartButton.classList.add('animate-bounce');
                setTimeout(() => cartButton.classList.remove('animate-bounce'), 600);
            }
            
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
                cartCount.classList.add('animate-pulse');
                cartCount.classList.remove('hidden');
            } else {
                cartCount.classList.remove('animate-pulse');
                cartCount.classList.add('hidden');
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
                <div class="text-emerald-600 text-center py-12">
                    <div class="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-shopping-cart text-4xl text-emerald-300"></i>
                    </div>
                    <h3 class="text-lg font-bold text-emerald-800 mb-2">Panier vide</h3>
                    <p class="text-emerald-600">Ajoutez des produits pour commencer</p>
                </div>
            `;
            if (cartSummary) cartSummary.classList.add('hidden');
            return;
        }
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item bg-emerald-50 rounded-xl p-4 border border-emerald-100 hover:border-emerald-200 transition-all">
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.nom}" 
                         class="w-16 h-16 object-cover rounded-xl shadow-md">
                    <div class="flex-1">
                        <h4 class="font-bold text-emerald-800 mb-1">${item.nom}</h4>
                        <p class="text-sm text-emerald-600 mb-2">${item.prix} DA</p>
                        <div class="flex items-center space-x-3">
                            <div class="quantity-selector flex items-center bg-white rounded-lg border border-emerald-200 overflow-hidden">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite - 1})" 
                                        class="px-3 py-1 hover:bg-emerald-50 transition-colors ${item.quantite <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                                    <i class="fas fa-minus text-sm"></i>
                                </button>
                                <input type="number" value="${item.quantite}" min="1" max="${item.stock}"
                                       onchange="app.updateCartQuantity('${item.id}', parseInt(this.value))"
                                       class="w-12 text-center border-0 focus:ring-0 bg-transparent font-semibold">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite + 1})" 
                                        class="px-3 py-1 hover:bg-emerald-50 transition-colors ${item.quantite >= item.stock ? 'opacity-50 cursor-not-allowed' : ''}">
                                    <i class="fas fa-plus text-sm"></i>
                                </button>
                            </div>
                            <button onclick="app.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all">
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
        if (cartShipping) {
            cartShipping.textContent = `${fraisLivraison} DA`;
            cartShipping.className = fraisLivraison === 0 ? 'text-green-600 font-bold' : 'text-emerald-700';
        }
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

    async loadProfilePage() {
        if (!this.currentUser) {
            this.showPage('login');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <!-- Enhanced Header -->
                <div class="text-center mb-12 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-50/50 to-emerald-100/50 rounded-3xl blur-xl"></div>
                    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-xl">
                        <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            Mon Profil
                        </h1>
                        <p class="text-xl text-emerald-600">Gérez vos informations personnelles</p>
                    </div>
                </div>

                <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                    <!-- Enhanced Profile Header -->
                    <div class="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 mb-8 pb-8 border-b-2 border-emerald-200">
                        <div class="relative">
                            <div class="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <i class="fas fa-user text-white text-5xl"></i>
                            </div>
                            <div class="absolute -inset-4 bg-gradient-to-r from-emerald-400/30 to-green-500/30 rounded-3xl blur-lg animate-pulse"></div>
                        </div>
                        <div class="text-center md:text-left">
                            <h2 class="text-3xl font-black text-emerald-800 mb-2">${this.currentUser.prenom} ${this.currentUser.nom}</h2>
                            <p class="text-emerald-600 text-lg mb-2">${this.currentUser.email}</p>
                            <p class="text-sm text-emerald-500">
                                <i class="fas fa-calendar-alt mr-2"></i>
                                Membre depuis ${new Date(this.currentUser.dateInscription || Date.now()).toLocaleDateString('fr-FR')}
                            </p>
                            <div class="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                                    <i class="fas fa-user mr-1"></i>Client
                                </span>
                                ${this.currentUser.email === this.settings.adminEmail ? `
                                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                    <i class="fas fa-crown mr-1"></i>Administrateur
                                </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Profile Form -->
                    <form id="profileForm" onsubmit="handleProfileUpdate(event)" class="space-y-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="group">
                                <label for="profilePrenom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-user mr-2"></i>Prénom
                                </label>
                                <input type="text" id="profilePrenom" value="${this.currentUser.prenom}" 
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                            
                            <div class="group">
                                <label for="profileNom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-user mr-2"></i>Nom
                                </label>
                                <input type="text" id="profileNom" value="${this.currentUser.nom}" 
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="group">
                                <label for="profileEmail" class="block text-sm font-bold text-emerald-700 mb-2">
                                    <i class="fas fa-envelope mr-2"></i>Email
                                </label>
                                <input type="email" id="profileEmail" value="${this.currentUser.email}" disabled
                                       class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed">
                                <p class="text-xs text-emerald-600 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>L'email ne peut pas être modifié
                                </p>
                            </div>
                            
                            <div class="group">
                                <label for="profileTelephone" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-phone mr-2"></i>Téléphone
                                </label>
                                <input type="tel" id="profileTelephone" value="${this.currentUser.telephone}" 
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="group">
                                <label for="profileWilaya" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-map-marker-alt mr-2"></i>Wilaya
                                </label>
                                <select id="profileWilaya" 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                                    ${['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
                                      'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
                                      'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
                                      'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
                                      'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
                                      'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
                                      'Ghardaïa', 'Relizane'].map(w => 
                                        `<option value="${w}" ${w === this.currentUser.wilaya ? 'selected' : ''}>${w}</option>`
                                      ).join('')}
                                </select>
                            </div>
                            
                            <div class="group">
                                <label for="profileVille" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-city mr-2"></i>Ville
                                </label>
                                <input type="text" id="profileVille" value="${this.currentUser.ville || ''}" 
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                        </div>

                        <div class="group">
                            <label for="profileAdresse" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-home mr-2"></i>Adresse complète
                            </label>
                            <textarea id="profileAdresse" rows="3" 
                                      class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                      placeholder="Votre adresse complète...">${this.currentUser.adresse || ''}</textarea>
                        </div>

                        <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                            <button type="submit" 
                                    class="group flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                                <span class="flex items-center justify-center">
                                    <i class="fas fa-save mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                                    Mettre à jour le profil
                                </span>
                            </button>
                            
                            <button type="button" onclick="showChangePasswordForm()" 
                                    class="group flex-1 bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-4 rounded-xl hover:bg-emerald-50 transition-all transform hover:scale-105">
                                <span class="flex items-center justify-center">
                                    <i class="fas fa-key mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                                    Changer le mot de passe
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Enhanced Change Password Modal -->
                <div id="changePasswordModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
                    <div class="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-emerald-200/50 transform scale-95 transition-transform duration-300">
                        <h3 class="text-2xl font-black text-emerald-800 mb-6 text-center">
                            <i class="fas fa-key mr-3 text-emerald-600"></i>
                            Changer le mot de passe
                        </h3>
                        
                        <form id="changePasswordForm" onsubmit="handlePasswordChange(event)" class="space-y-6">
                            <div class="group">
                                <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-lock mr-2"></i>Mot de passe actuel
                                </label>
                                <input type="password" id="currentPassword" required
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                            
                            <div class="group">
                                <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-key mr-2"></i>Nouveau mot de passe
                                </label>
                                <input type="password" id="newPassword" required minlength="6"
                                       class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                            </div>
                            
                            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                                <button type="submit" 
                                        class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105">
                                    <i class="fas fa-check mr-2"></i>Changer
                                </button>
                                <button type="button" onclick="hideChangePasswordForm()" 
                                        class="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-400 transition-all transform hover:scale-105">
                                    <i class="fas fa-times mr-2"></i>Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <script>
                function showChangePasswordForm() {
                    const modal = document.getElementById('changePasswordModal');
                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        modal.querySelector('.bg-white\\/95').classList.remove('scale-95');
                        modal.querySelector('.bg-white\\/95').classList.add('scale-100');
                    }, 50);
                }
                
                function hideChangePasswordForm() {
                    const modal = document.getElementById('changePasswordModal');
                    modal.querySelector('.bg-white\\/95').classList.remove('scale-100');
                    modal.querySelector('.bg-white\\/95').classList.add('scale-95');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        document.getElementById('changePasswordForm').reset();
                    }, 200);
                }
                
                async function handleProfileUpdate(event) {
                    event.preventDefault();
                    
                    const updateData = {
                        prenom: document.getElementById('profilePrenom').value.trim(),
                        nom: document.getElementById('profileNom').value.trim(),
                        telephone: document.getElementById('profileTelephone').value.trim(),
                        wilaya: document.getElementById('profileWilaya').value,
                        ville: document.getElementById('profileVille').value.trim(),
                        adresse: document.getElementById('profileAdresse').value.trim()
                    };
                    
                    try {
                        if (window.authSystem) {
                            await window.authSystem.updateProfile(updateData);
                            if (window.app) {
                                window.app.currentUser = { ...window.app.currentUser, ...updateData };
                                window.app.showToast('Profil mis à jour avec succès', 'success');
                            }
                        }
                    } catch (error) {
                        if (window.app) {
                            window.app.showToast(error.message, 'error');
                        }
                    }
                }
                
                async function handlePasswordChange(event) {
                    event.preventDefault();
                    
                    const currentPassword = document.getElementById('currentPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    
                    try {
                        if (window.authSystem) {
                            await window.authSystem.changePassword(currentPassword, newPassword);
                            if (window.app) {
                                window.app.showToast('Mot de passe changé avec succès', 'success');
                            }
                            hideChangePasswordForm();
                        }
                    } catch (error) {
                        if (window.app) {
                            window.app.showToast(error.message, 'error');
                        }
                    }
                }
            </script>
        `;
    }

    async loadOrdersPage() {
        if (!this.currentUser) {
            this.showPage('login');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        
        // Get user's orders from localStorage
        const allOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const userOrders = allOrders.filter(order => 
            order.client.email === this.currentUser.email
        );

        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <!-- Enhanced Header -->
                <div class="text-center mb-12 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-50/50 to-emerald-100/50 rounded-3xl blur-xl"></div>
                    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-xl">
                        <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            <i class="fas fa-shopping-bag mr-4 text-emerald-600"></i>
                            Mes Commandes
                        </h1>
                        <p class="text-xl text-emerald-600">Suivez l'état de vos commandes en temps réel</p>
                    </div>
                </div>

                <div class="space-y-8">
                    ${userOrders.length === 0 ? `
                        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-16 text-center">
                            <div class="w-32 h-32 mx-auto mb-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-shopping-bag text-6xl text-emerald-300"></i>
                            </div>
                            <h3 class="text-3xl font-black text-emerald-800 mb-6">Aucune commande</h3>
                            <p class="text-emerald-600 mb-8 text-lg">Vous n'avez pas encore passé de commande.</p>
                            <button onclick="app.showPage('products')" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-10 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                                <i class="fas fa-shopping-cart mr-2"></i>Commencer mes achats
                            </button>
                        </div>
                    ` : userOrders.map((order, index) => `
                        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 transform hover:scale-105 transition-all duration-300"
                             style="animation-delay: ${index * 0.1}s">
                            <!-- Enhanced Order Header -->
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 pb-6 border-b-2 border-emerald-200">
                                <div>
                                    <h3 class="text-3xl font-black text-emerald-800 mb-3">
                                        <i class="fas fa-receipt mr-3 text-emerald-600"></i>
                                        Commande ${order.numeroCommande}
                                    </h3>
                                    <div class="space-y-2">
                                        <p class="text-emerald-600 flex items-center">
                                            <i class="fas fa-calendar-alt mr-2"></i>
                                            Passée le ${new Date(order.dateCommande).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p class="text-emerald-600 flex items-center">
                                            <i class="fas fa-truck mr-2"></i>
                                            Livraison à: ${order.livraison.adresse}, ${order.livraison.wilaya}
                                        </p>
                                    </div>
                                </div>
                                <div class="mt-6 lg:mt-0 text-center lg:text-right">
                                    <span class="inline-block px-6 py-3 rounded-full text-sm font-bold ${this.getOrderStatusClass(order.statut)} mb-4">
                                        ${this.getOrderStatusText(order.statut)}
                                    </span>
                                    <div class="text-3xl font-black text-emerald-800">${order.total} DA</div>
                                </div>
                            </div>

                            <!-- Enhanced Order Items -->
                            <div class="mb-8">
                                <h4 class="text-xl font-black text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-boxes mr-3 text-emerald-600"></i>
                                    Articles commandés
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    ${order.articles.map(article => `
                                        <div class="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                            <div class="flex-1">
                                                <h5 class="font-black text-emerald-800 mb-2">${article.nom}</h5>
                                                <p class="text-emerald-600 flex items-center">
                                                    <i class="fas fa-shopping-cart mr-2"></i>
                                                    Quantité: ${article.quantite}
                                                </p>
                                                <p class="text-emerald-600 flex items-center">
                                                    <i class="fas fa-tag mr-2"></i>
                                                    Prix unitaire: ${article.prix} DA
                                                </p>
                                            </div>
                                            <div class="text-right ml-4">
                                                <p class="text-2xl font-black text-emerald-700">${article.prix * article.quantite} DA</p>
                                                <p class="text-sm text-emerald-600">Total article</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Enhanced Order Summary -->
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <!-- Order Details -->
                                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                                    <h4 class="font-black text-blue-800 mb-4 flex items-center">
                                        <i class="fas fa-info-circle mr-3"></i>
                                        Détails de la commande
                                    </h4>
                                    <div class="space-y-3">
                                        <div class="flex justify-between">
                                            <span class="text-blue-700">Sous-total:</span>
                                            <span class="font-bold text-blue-800">${order.sousTotal} DA</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-blue-700">Livraison:</span>
                                            <span class="font-bold text-blue-800">${order.fraisLivraison} DA</span>
                                        </div>
                                        <div class="border-t border-blue-300 pt-3">
                                            <div class="flex justify-between">
                                                <span class="text-lg font-black text-blue-800">Total:</span>
                                                <span class="text-xl font-black text-blue-800">${order.total} DA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Info -->
                                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                                    <h4 class="font-black text-green-800 mb-4 flex items-center">
                                        <i class="fas fa-credit-card mr-3"></i>
                                        Informations de paiement
                                    </h4>
                                    <div class="space-y-3">
                                        <p class="text-green-700 flex items-center">
                                            <i class="fas fa-money-bill-wave mr-2"></i>
                                            Paiement à la livraison
                                        </p>
                                        <p class="text-green-600 text-sm">
                                            Vous paierez directement au livreur lors de la réception
                                        </p>
                                        ${order.livraison.notes ? `
                                        <div class="border-t border-green-300 pt-3">
                                            <p class="text-green-700 font-semibold mb-1">Notes:</p>
                                            <p class="text-green-600 text-sm">${order.livraison.notes}</p>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Enhanced Order Actions -->
                            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                <h4 class="font-black text-gray-800 mb-4 flex items-center">
                                    <i class="fas fa-cogs mr-3"></i>
                                    Actions disponibles
                                </h4>
                                <div class="flex flex-wrap gap-4">
                                    ${order.statut === 'en-attente' ? `
                                        <button onclick="app.cancelOrder('${order.numeroCommande}')" 
                                                class="bg-red-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition-all transform hover:scale-105">
                                            <i class="fas fa-times mr-2"></i>Annuler la commande
                                        </button>
                                    ` : ''}
                                    <button onclick="app.contactSupport('${order.numeroCommande}')" 
                                            class="bg-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105">
                                        <i class="fas fa-headset mr-2"></i>Contacter le support
                                    </button>
                                    <button onclick="app.reorderItems('${order.numeroCommande}')" 
                                            class="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all transform hover:scale-105">
                                        <i class="fas fa-redo mr-2"></i>Recommander ces articles
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add staggered animation to orders
        setTimeout(() => {
            document.querySelectorAll('.bg-white\\/90').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('animate-fadeInUp');
            });
        }, 100);
    }

    getOrderStatusClass(status) {
        const statusClasses = {
            'en-attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'confirmee': 'bg-blue-100 text-blue-800 border-blue-300',
            'en-preparation': 'bg-orange-100 text-orange-800 border-orange-300',
            'expedier': 'bg-purple-100 text-purple-800 border-purple-300',
            'livree': 'bg-green-100 text-green-800 border-green-300',
            'annulee': 'bg-red-100 text-red-800 border-red-300'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    }

    getOrderStatusText(status) {
        const statusTexts = {
            'en-attente': '⏳ En attente',
            'confirmee': '✅ Confirmée',
            'en-preparation': '📦 En préparation',
            'expedier': '🚚 Expédiée',
            'livree': '✅ Livrée',
            'annulee': '❌ Annulée'
        };
        return statusTexts[status] || '❓ Statut inconnu';
    }

    cancelOrder(orderNumber) {
        if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
            const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            const orderIndex = orders.findIndex(o => o.numeroCommande === orderNumber);
            
            if (orderIndex > -1 && orders[orderIndex].statut === 'en-attente') {
                orders[orderIndex].statut = 'annulee';
                localStorage.setItem('adminOrders', JSON.stringify(orders));
                this.showToast('Commande annulée avec succès', 'success');
                this.loadOrdersPage();
            } else {
                this.showToast('Impossible d\'annuler cette commande', 'error');
            }
        }
    }

    contactSupport(orderNumber) {
        this.showToast('Redirection vers le support...', 'info');
        this.showPage('contact');
    }

    reorderItems(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const order = orders.find(o => o.numeroCommande === orderNumber);
        
        if (order) {
            order.articles.forEach(article => {
                const product = this.allProducts.find(p => p.nom === article.nom);
                if (product) {
                    this.addToCart(product._id, article.quantite);
                }
            });
            this.showToast('Articles ajoutés au panier', 'success');
        }
    }

    async loadCheckoutPage() {
        if (!this.cart || this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        const sousTotal = this.getCartTotal();
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;

        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-7xl">
                <!-- Enhanced Header -->
                <div class="text-center mb-12 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-50/50 to-emerald-100/50 rounded-3xl blur-xl"></div>
                    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-xl">
                        <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            <i class="fas fa-credit-card mr-4 text-emerald-600"></i>
                            Finaliser la commande
                        </h1>
                        <p class="text-xl text-emerald-600">Plus qu'une étape avant de recevoir vos produits</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <!-- Enhanced Checkout Form -->
                    <div class="lg:col-span-2 space-y-8">
                        <form id="checkoutForm" onsubmit="handleCheckout(event)" class="space-y-8">
                            <!-- Personal Information -->
                            <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                                <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                    <i class="fas fa-user mr-4 text-emerald-600"></i>
                                    Informations personnelles
                                </h2>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="group">
                                        <label for="checkoutPrenom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Prénom *
                                        </label>
                                        <input type="text" id="checkoutPrenom" name="prenom" required 
                                               value="${this.currentUser?.prenom || ''}"
                                               class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                               placeholder="Votre prénom">
                                    </div>
                                    <div class="group">
                                        <label for="checkoutNom" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Nom *
                                        </label>
                                        <input type="text" id="checkoutNom" name="nom" required 
                                               value="${this.currentUser?.nom || ''}"
                                               class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                               placeholder="Votre nom de famille">
                                    </div>
                                    <div class="group">
                                        <label for="checkoutEmail" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Email *
                                        </label>
                                        <input type="email" id="checkoutEmail" name="email" required 
                                               value="${this.currentUser?.email || ''}"
                                               class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                               placeholder="votre@email.com">
                                    </div>
                                    <div class="group">
                                        <label for="checkoutTelephone" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Téléphone *
                                        </label>
                                        <input type="tel" id="checkoutTelephone" name="telephone" required 
                                               value="${this.currentUser?.telephone || ''}"
                                               class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                               placeholder="+213 XX XX XX XX XX">
                                    </div>
                                </div>
                            </div>

                            <!-- Shipping Address -->
                            <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                                <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                    <i class="fas fa-map-marker-alt mr-4 text-emerald-600"></i>
                                    Adresse de livraison
                                </h2>
                                
                                <div class="space-y-6">
                                    <div class="group">
                                        <label for="checkoutAdresse" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Adresse complète *
                                        </label>
                                        <textarea id="checkoutAdresse" name="adresse" rows="3" required 
                                                  class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                                                  placeholder="Votre adresse complète...">${this.currentUser?.adresse || ''}</textarea>
                                    </div>
                                    <div class="group">
                                        <label for="checkoutWilaya" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                            Wilaya *
                                        </label>
                                        <select id="checkoutWilaya" name="wilaya" required 
                                                class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                                            <option value="">Sélectionner une wilaya</option>
                                            ${['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
                                              'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
                                              'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
                                              'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
                                              'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
                                              'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
                                              'Ghardaïa', 'Relizane'].map(w => 
                                                `<option value="${w}" ${w === this.currentUser?.wilaya ? 'selected' : ''}>${w}</option>`
                                              ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Payment Method -->
                            <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                                <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                    <i class="fas fa-credit-card mr-4 text-emerald-600"></i>
                                    Mode de paiement
                                </h2>
                                
                                <div class="space-y-4">
                                    <label class="group flex items-center p-6 border-2 border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all">
                                        <input type="radio" name="modePaiement" value="Paiement à la livraison" checked 
                                               class="text-emerald-600 focus:ring-emerald-500 mr-4 w-5 h-5">
                                        <div class="flex items-center flex-1">
                                            <i class="fas fa-money-bill-wave text-emerald-600 text-2xl mr-6"></i>
                                            <div>
                                                <div class="font-black text-emerald-800 text-lg">Paiement à la livraison</div>
                                                <div class="text-sm text-emerald-600">Payez en espèces lors de la réception</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Additional Notes -->
                            <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                                <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                    <i class="fas fa-comment mr-4 text-emerald-600"></i>
                                    Commentaires (optionnel)
                                </h2>
                                
                                <textarea id="checkoutCommentaires" name="commentaires" rows="4" 
                                          class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm"
                                          placeholder="Instructions spéciales pour la livraison, allergies, etc."></textarea>
                            </div>

                            <!-- Submit Button -->
                            <div class="text-center">
                                <button type="submit" 
                                        class="group bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-6 px-16 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-xl">
                                    <span class="flex items-center justify-center">
                                        <i class="fas fa-check mr-3 group-hover:rotate-12 transition-transform duration-300"></i>
                                        Confirmer la commande (${total} DA)
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Enhanced Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 sticky top-8">
                            <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                <i class="fas fa-shopping-bag mr-4 text-emerald-600"></i>
                                Résumé
                            </h2>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-8">
                                ${this.cart.map(item => `
                                    <div class="flex items-center space-x-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <img src="${item.image}" alt="${item.nom}" class="w-16 h-16 object-cover rounded-xl">
                                        <div class="flex-1">
                                            <h4 class="font-black text-emerald-800 text-sm mb-1">${item.nom}</h4>
                                            <p class="text-xs text-emerald-600">Qté: ${item.quantite} × ${item.prix} DA</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-black text-emerald-800">${item.prix * item.quantite} DA</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Totals -->
                            <div class="space-y-4 py-6 border-t-2 border-emerald-200">
                                <div class="flex justify-between text-emerald-700">
                                    <span class="font-semibold">Sous-total</span>
                                    <span id="checkoutSousTotal" class="font-bold">${sousTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-emerald-700">
                                    <span class="font-semibold">Frais de livraison</span>
                                    <span id="checkoutFraisLivraison" class="${fraisLivraison === 0 ? 'text-green-600 font-bold' : 'font-bold'}">${fraisLivraison} DA</span>
                                </div>
                                ${sousTotal >= 5000 ? `
                                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p class="text-green-700 text-sm font-bold text-center">
                                        <i class="fas fa-truck mr-2"></i>
                                        Livraison gratuite !
                                    </p>
                                </div>
                                ` : `
                                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p class="text-blue-700 text-sm text-center">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        Livraison gratuite à partir de 5 000 DA
                                    </p>
                                </div>
                                `}
                                <div class="flex justify-between text-2xl font-black text-emerald-800 pt-4 border-t border-emerald-200">
                                    <span>Total</span>
                                    <span id="checkoutTotal">${total} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize checkout system if available
        if (typeof initCheckout === 'function') {
            setTimeout(initCheckout, 100);
        }
    }

    async processOrder() {
        console.log('🛒 App processOrder called');
        
        try {
            if (!this.cart || this.cart.length === 0) {
                this.showToast('Votre panier est vide', 'warning');
                return;
            }
            
            // Validate required fields exist
            const requiredFields = ['checkoutPrenom', 'checkoutNom', 'checkoutEmail', 'checkoutTelephone', 'checkoutAdresse', 'checkoutWilaya'];
            
            for (let fieldId of requiredFields) {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    this.showToast(`Le champ ${fieldId.replace('checkout', '')} est requis`, 'error');
                    return;
                }
            }
            
            // Gather order data
            const orderData = {
                _id: Date.now().toString(),
                numeroCommande: `CMD${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
                client: {
                    prenom: document.getElementById('checkoutPrenom')?.value.trim(),
                    nom: document.getElementById('checkoutNom')?.value.trim(),
                    email: document.getElementById('checkoutEmail')?.value.trim(),
                    telephone: document.getElementById('checkoutTelephone')?.value.trim()
                },
                livraison: {
                    adresse: document.getElementById('checkoutAdresse')?.value.trim(),
                    wilaya: document.getElementById('checkoutWilaya')?.value,
                    notes: document.getElementById('checkoutCommentaires')?.value.trim() || ''
                },
                articles: this.cart.map(item => ({
                    productId: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.quantite,
                    image: item.image
                })),
                sousTotal: this.getCartTotal(),
                fraisLivraison: this.getCartTotal() >= 5000 ? 0 : 300,
                total: this.getCartTotal() + (this.getCartTotal() >= 5000 ? 0 : 300),
                statut: 'en-attente',
                modePaiement: document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison',
                dateCommande: new Date().toISOString()
            };
            
            console.log('Processing order:', orderData);
            
            // Try to save to API
            try {
                const response = await fetch(buildApiUrl('/orders'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.currentUser ? { 'x-auth-token': localStorage.getItem('token') } : {})
                    },
                    body: JSON.stringify({
                        produits: orderData.articles.map(item => ({
                            produit: item.productId,
                            nom: item.nom,
                            prix: item.prix,
                            quantite: item.quantite,
                            total: item.prix * item.quantite
                        })),
                        montantTotal: orderData.total,
                        modeLivraison: 'domicile',
                        adresseLivraison: {
                            nom: orderData.client.nom,
                            prenom: orderData.client.prenom,
                            adresse: orderData.livraison.adresse,
                            ville: orderData.livraison.wilaya,
                            wilaya: orderData.livraison.wilaya,
                            telephone: orderData.client.telephone.replace(/\s+/g, ''),
                            email: orderData.client.email.toLowerCase()
                        },
                        notes: orderData.livraison.notes
                    })
                });
                
                if (response.ok) {
                    console.log('✅ Order saved to API');
                } else {
                    console.log('⚠️ API save failed, using local storage');
                }
            } catch (apiError) {
                console.log('⚠️ API save failed:', apiError.message);
            }
            
            // Always save locally for demo
            const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            orders.unshift(orderData);
            if (orders.length > 100) orders.splice(100);
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            
            // Save to user orders if logged in
            if (this.currentUser) {
                const userOrdersKey = `userOrders_${this.currentUser.email}`;
                let userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
                userOrders.unshift(orderData);
                if (userOrders.length > 50) userOrders = userOrders.slice(0, 50);
                localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
            }
            
            // Clear cart and show success
            this.clearCart();
            this.showToast('Commande passée avec succès !', 'success');
            this.showPage('order-confirmation', { orderNumber: orderData.numeroCommande });
            
        } catch (error) {
            console.error('❌ Error processing order:', error);
            this.showToast('Erreur lors de la validation de la commande', 'error');
        }
    }

    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl text-center">
                <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-16 relative overflow-hidden">
                    <!-- Animated Background -->
                    <div class="absolute inset-0 overflow-hidden">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-green-300/20 rounded-full blur-2xl animate-float"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl animate-float-delayed"></div>
                    </div>
                    
                    <!-- Success Icon -->
                    <div class="flex justify-center mb-8 relative z-10">
                        <div class="relative">
                            <div class="w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                                <i class="fas fa-check text-white text-7xl"></i>
                            </div>
                            <div class="absolute -inset-6 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-2xl animate-pulse"></div>
                        </div>
                    </div>

                    <div class="relative z-10">
                        <h1 class="text-5xl font-black text-emerald-800 mb-6 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            Commande confirmée !
                        </h1>
                        <p class="text-2xl text-emerald-600 mb-12">Merci pour votre confiance</p>

                        <div class="bg-emerald-50 rounded-3xl p-10 mb-12 border-2 border-emerald-200">
                            <h2 class="text-3xl font-black text-emerald-800 mb-6">
                                <i class="fas fa-receipt mr-4 text-emerald-600"></i>
                                Numéro de commande
                            </h2>
                            <p class="text-4xl font-black text-emerald-700 font-mono tracking-wider mb-4">${orderNumber}</p>
                            <p class="text-emerald-600 text-lg">Conservez ce numéro pour suivre votre commande</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div class="bg-blue-50 rounded-2xl p-8 border border-blue-200 transform hover:scale-105 transition-all duration-300">
                                <i class="fas fa-clock text-blue-500 text-4xl mb-6"></i>
                                <h3 class="font-black text-blue-800 mb-4 text-xl">Traitement</h3>
                                <p class="text-blue-600">Votre commande est en cours de préparation</p>
                            </div>
                            
                            <div class="bg-yellow-50 rounded-2xl p-8 border border-yellow-200 transform hover:scale-105 transition-all duration-300">
                                <i class="fas fa-truck text-yellow-500 text-4xl mb-6"></i>
                                <h3 class="font-black text-yellow-800 mb-4 text-xl">Livraison</h3>
                                <p class="text-yellow-600">Livraison sous 24-48h</p>
                            </div>
                            
                            <div class="bg-green-50 rounded-2xl p-8 border border-green-200 transform hover:scale-105 transition-all duration-300">
                                <i class="fas fa-credit-card text-green-500 text-4xl mb-6"></i>
                                <h3 class="font-black text-green-800 mb-4 text-xl">Paiement</h3>
                                <p class="text-green-600">À la livraison</p>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <button onclick="app.showPage('products')" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-6 px-10 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg mb-4">
                                <i class="fas fa-shopping-bag mr-3"></i>Continuer mes achats
                            </button>
                            
                            <button onclick="app.showPage('home')" 
                                    class="w-full bg-white border-2 border-emerald-500 text-emerald-600 font-black py-6 px-10 rounded-2xl hover:bg-emerald-50 transition-all transform hover:scale-105 text-lg">
                                <i class="fas fa-home mr-3"></i>Retour à l'accueil
                            </button>
                        </div>

                        <div class="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-200">
                            <h3 class="text-2xl font-black text-emerald-800 mb-4">
                                <i class="fas fa-phone mr-3"></i>Besoin d'aide ?
                            </h3>
                            <p class="text-emerald-700 mb-6 text-lg">Notre équipe est là pour vous accompagner</p>
                            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                                <a href="tel:+213123456789" 
                                   class="bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all transform hover:scale-105">
                                    <i class="fas fa-phone mr-2"></i>+213 123 456 789
                                </a>
                                <a href="mailto:pharmaciegaher@gmail.com" 
                                   class="bg-white border-2 border-emerald-300 text-emerald-600 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all transform hover:scale-105">
                                    <i class="fas fa-envelope mr-2"></i>Nous écrire
                                </a>
                            </div>
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
                <!-- Enhanced Header -->
                <div class="text-center mb-12 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-50/50 to-emerald-100/50 rounded-3xl blur-xl"></div>
                    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-xl">
                        <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            <i class="fas fa-phone mr-4 text-emerald-600"></i>
                            Contactez-nous
                        </h1>
                        <p class="text-xl text-emerald-600">Nous sommes là pour vous aider</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Enhanced Contact Info -->
                    <div class="space-y-8">
                        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                            <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                                <i class="fas fa-info-circle mr-4 text-emerald-600"></i>
                                Nos coordonnées
                            </h2>
                            
                            <div class="space-y-8">
                                <div class="flex items-start space-x-6 group">
                                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <i class="fas fa-map-marker-alt text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-black text-emerald-800 text-lg mb-2">Adresse</h3>
                                        <p class="text-emerald-600">M'Sila, Algérie</p>
                                        <p class="text-emerald-500 text-sm">Livraison dans toute l'Algérie</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-6 group">
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <i class="fas fa-phone text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-black text-emerald-800 text-lg mb-2">Téléphone</h3>
                                        <a href="tel:+213123456789" class="text-emerald-600 hover:text-emerald-800 transition-colors text-lg font-semibold">
                                            +213 123 456 789
                                        </a>
                                        <p class="text-emerald-500 text-sm">Disponible 7j/7</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-6 group">
                                    <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <i class="fas fa-envelope text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-black text-emerald-800 text-lg mb-2">Email</h3>
                                        <a href="mailto:pharmaciegaher@gmail.com" class="text-emerald-600 hover:text-emerald-800 transition-colors text-lg font-semibold">
                                            pharmaciegaher@gmail.com
                                        </a>
                                        <p class="text-emerald-500 text-sm">Réponse sous 24h</p>
                                    </div>
                                </div>

                                <div class="flex items-start space-x-6 group">
                                    <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <i class="fas fa-clock text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-black text-emerald-800 text-lg mb-2">Horaires</h3>
                                        <p class="text-emerald-600">24h/24 - 7j/7</p>
                                        <p class="text-emerald-500 text-sm">Commandes en ligne</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Social Media -->
                        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                            <h3 class="text-2xl font-black text-emerald-800 mb-6 flex items-center">
                                <i class="fas fa-share-alt mr-3 text-emerald-600"></i>
                                Suivez-nous
                            </h3>
                            <div class="flex space-x-4">
                                <a href="#" class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                    <i class="fab fa-whatsapp"></i>
                                </a>
                                <a href="#" class="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                    <i class="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Enhanced Contact Form -->
                    <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
                        <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                            <i class="fas fa-envelope mr-4 text-emerald-600"></i>
                            Envoyez-nous un message
                        </h2>
                        
                        <form id="contactForm" onsubmit="handleContactForm(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="group">
                                    <label for="contactName" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-user mr-2"></i>Nom complet *
                                    </label>
                                    <input type="text" id="contactName" name="name" required 
                                           class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300" 
                                           placeholder="Votre nom complet">
                                </div>
                                <div class="group">
                                    <label for="contactEmail" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                        <i class="fas fa-envelope mr-2"></i>Email *
                                    </label>
                                    <input type="email" id="contactEmail" name="email" required 
                                           class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300" 
                                           placeholder="votre@email.com">
                                </div>
                            </div>
                            
                            <div class="group">
                                <label for="contactSubject" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-tag mr-2"></i>Sujet *
                                </label>
                                <select id="contactSubject" name="subject" required 
                                        class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                                    <option value="">Sélectionnez un sujet</option>
                                    <option value="question-produit">Question sur un produit</option>
                                    <option value="commande">Suivi de commande</option>
                                    <option value="livraison">Problème de livraison</option>
                                    <option value="remboursement">Remboursement</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                            
                            <div class="group">
                                <label for="contactMessage" class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                    <i class="fas fa-comment mr-2"></i>Message *
                                </label>
                                <textarea id="contactMessage" name="message" rows="6" required 
                                          class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm resize-none group-hover:border-emerald-300" 
                                          placeholder="Votre message..."></textarea>
                            </div>
                            
                            <button type="submit" 
                                    class="group w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105" 
                                    id="contactSubmitBtn">
                                <span id="contactSubmitText" class="flex items-center justify-center">
                                    <i class="fas fa-paper-plane mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                                    Envoyer le message
                                </span>
                                <i id="contactSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Enhanced Admin functionality
    async loadAdminPage() {
        if (!this.currentUser || this.currentUser.email !== this.settings.adminEmail) {
            this.showToast('Accès refusé - Droits administrateur requis', 'error');
            this.showPage('home');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Enhanced Admin Header -->
                <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div>
                            <h1 class="text-5xl font-black text-emerald-800 mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                                <i class="fas fa-cogs mr-4 text-emerald-600"></i>
                                Panel d'Administration
                            </h1>
                            <p class="text-emerald-600 text-xl">Gestion complète de Shifa - Parapharmacie</p>
                        </div>
                        <div class="flex items-center space-x-6">
                            <div class="text-right">
                                <p class="text-sm text-emerald-500">Connecté en tant que</p>
                                <p class="font-black text-emerald-800 text-xl">${this.currentUser.prenom} ${this.currentUser.nom}</p>
                                <p class="text-sm text-emerald-600">${this.currentUser.email}</p>
                            </div>
                            <div class="relative">
                                <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl border-2 border-white/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <i class="fas fa-user-shield text-white text-3xl"></i>
                                </div>
                                <div class="absolute -inset-3 bg-gradient-to-r from-emerald-400/30 to-green-500/30 rounded-3xl blur-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Navigation Admin -->
                <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 mb-8 overflow-hidden">
                    <nav class="flex flex-wrap">
                        <button onclick="switchAdminSection('dashboard')" 
                                class="admin-nav-btn dashboard flex-1 min-w-max px-8 py-6 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white transition-all hover:from-emerald-600 hover:to-green-700">
                            <i class="fas fa-chart-line mr-2"></i>Tableau de bord
                        </button>
                        <button onclick="switchAdminSection('products')" 
                                class="admin-nav-btn products flex-1 min-w-max px-8 py-6 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-pills mr-2"></i>Produits
                        </button>
                        <button onclick="switchAdminSection('orders')" 
                                class="admin-nav-btn orders flex-1 min-w-max px-8 py-6 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-shopping-bag mr-2"></i>Commandes
                        </button>
                        <button onclick="switchAdminSection('featured')" 
                                class="admin-nav-btn featured flex-1 min-w-max px-8 py-6 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                            <i class="fas fa-star mr-2"></i>Coups de Coeur
                        </button>
                        <button onclick="switchAdminSection('cleanup')" 
                                class="admin-nav-btn cleanup flex-1 min-w-max px-8 py-6 text-sm font-semibold text-red-700 hover:bg-red-50 transition-all">
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
                const data = await fetch(buildApiUrl('/admin/dashboard'));
                if (data.ok) {
                    const apiStats = await data.json();
                    if (apiStats && apiStats.stats) {
                        stats = { ...stats, ...apiStats.stats };
                    }
                }
            } catch (error) {
                console.log('API unavailable, using local stats');
            }
            
            document.getElementById('adminContent').innerHTML = `
                <!-- Enhanced Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Produits</p>
                                <p class="text-4xl font-black text-blue-800 mb-1">${stats.totalProducts}</p>
                                <p class="text-xs text-blue-500">Total actifs</p>
                            </div>
                            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-pills text-white text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-bold text-green-600 uppercase tracking-wide mb-2">Commandes</p>
                                <p class="text-4xl font-black text-green-800 mb-1">${stats.totalOrders}</p>
                                <p class="text-xs text-green-500">Total reçues</p>
                            </div>
                            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-shopping-bag text-white text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-bold text-yellow-600 uppercase tracking-wide mb-2">En attente</p>
                                <p class="text-4xl font-black text-yellow-800 mb-1">${stats.pendingOrders}</p>
                                <p class="text-xs text-yellow-500">Commandes</p>
                            </div>
                            <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-clock text-white text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-bold text-purple-600 uppercase tracking-wide mb-2">Revenus</p>
                                <p class="text-4xl font-black text-purple-800 mb-1">${stats.monthlyRevenue.toLocaleString()} DA</p>
                                <p class="text-xs text-purple-500">Total</p>
                            </div>
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-coins text-white text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-300" onclick="switchAdminSection('products')">
                        <i class="fas fa-plus-circle text-5xl mb-6"></i>
                        <h3 class="text-xl font-black mb-4">Gérer les produits</h3>
                        <p class="text-emerald-100">Ajouter, modifier et gérer vos produits</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-300" onclick="switchAdminSection('orders')">
                        <i class="fas fa-shopping-bag text-5xl mb-6"></i>
                        <h3 class="text-xl font-black mb-4">Commandes</h3>
                        <p class="text-blue-100">Voir et gérer les commandes</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-300" onclick="switchAdminSection('featured')">
                        <i class="fas fa-star text-5xl mb-6"></i>
                        <h3 class="text-xl font-black mb-4">Coups de Coeur</h3>
                        <p class="text-yellow-100">Gérer les produits mis en avant</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-300" onclick="switchAdminSection('cleanup')">
                        <i class="fas fa-broom text-5xl mb-6"></i>
                        <h3 class="text-xl font-black mb-4">Nettoyage</h3>
                        <p class="text-red-100">Supprimer produits indésirables</p>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
                    <p class="text-red-800 font-bold">Erreur de chargement du tableau de bord</p>
                </div>
            `;
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUserUI();
        this.showToast('Déconnexion réussie', 'success');
        this.showPage('home');
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
        toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white/95 backdrop-blur-lg border-2 rounded-2xl shadow-2xl transform translate-x-full transition-all duration-500 ${this.getToastColorClass(type)}`;
        toast.innerHTML = `
            <div class="flex items-center p-6">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${this.getToastIconBg(type)}">
                        <i class="fas ${this.getToastIcon(type)} text-white"></i>
                    </div>
                </div>
                <div class="ml-4 flex-1">
                    <p class="text-sm font-bold text-gray-900">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 100);
        
        // Auto remove
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
    
    getToastColorClass(type) {
        const classes = {
            'info': 'border-blue-200',
            'success': 'border-green-200',
            'error': 'border-red-200',
            'warning': 'border-yellow-200'
        };
        return classes[type] || classes.info;
    }
    
    getToastIconBg(type) {
        const classes = {
            'info': 'bg-blue-500',
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500'
        };
        return classes[type] || classes.info;
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
    
    sortProducts(sortBy) {
        console.log('Sort products by:', sortBy);
        // Implementation would depend on current products display
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        let products = [...this.allProducts];
        
        switch (sortBy) {
            case 'nom':
                products.sort((a, b) => a.nom.localeCompare(b.nom));
                break;
            case 'prix-asc':
                products.sort((a, b) => a.prix - b.prix);
                break;
            case 'prix-desc':
                products.sort((a, b) => b.prix - a.prix);
                break;
            case 'stock':
                products.sort((a, b) => b.stock - a.stock);
                break;
        }
        
        productsGrid.innerHTML = products.map((product, index) => this.createEnhancedProductCard(product, index)).join('');
    }
}

// Enhanced Global Functions with Improved Error Handling
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Enhanced Admin Functions
function switchAdminSection(section) {
    // Update navigation with enhanced animations
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
    }
    
    // Load section content with fade transition
    const content = document.getElementById('adminContent');
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        switch (section) {
            case 'dashboard':
                if (window.app) window.app.loadAdminDashboard();
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
        
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 100);
    }, 150);
}

function loadAdminProducts() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
                <h2 class="text-3xl font-black text-emerald-800">
                    <i class="fas fa-pills mr-3 text-emerald-600"></i>
                    Gestion des Produits
                </h2>
                <button onclick="showAddProductForm()" 
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                    <i class="fas fa-plus mr-2"></i>Ajouter un produit
                </button>
            </div>
            
            <div class="overflow-x-auto rounded-2xl border border-emerald-200">
                <table class="w-full table-auto">
                    <thead>
                        <tr class="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-200">
                            <th class="text-left p-6 font-black text-emerald-800">Image</th>
                            <th class="text-left p-6 font-black text-emerald-800">Nom</th>
                            <th class="text-left p-6 font-black text-emerald-800">Catégorie</th>
                            <th class="text-left p-6 font-black text-emerald-800">Prix</th>
                            <th class="text-left p-6 font-black text-emerald-800">Stock</th>
                            <th class="text-left p-6 font-black text-emerald-800">Status</th>
                            <th class="text-left p-6 font-black text-emerald-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productsTable">
                        <!-- Products will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Enhanced Add Product Modal -->
        <div id="addProductModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
            <div class="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-200/50">
                <h3 class="text-3xl font-black text-emerald-800 mb-8 text-center">
                    <i class="fas fa-plus-circle mr-3 text-emerald-600"></i>
                    Ajouter un nouveau produit
                </h3>
                
                <form id="addProductForm" onsubmit="handleAddProduct(event)" class="space-y-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="group">
                            <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-tag mr-2"></i>Nom du produit *
                            </label>
                            <input type="text" id="productName" required 
                                   class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                        </div>
                        <div class="group">
                            <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-list mr-2"></i>Catégorie *
                            </label>
                            <select id="productCategory" required 
                                    class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                                <option value="">Sélectionnez une catégorie</option>
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
                    </div>
                    
                    <div class="group">
                        <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                            <i class="fas fa-align-left mr-2"></i>Description
                        </label>
                        <textarea id="productDescription" rows="4" 
                                  class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm resize-none group-hover:border-emerald-300"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="group">
                            <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-dollar-sign mr-2"></i>Prix (DA) *
                            </label>
                            <input type="number" id="productPrice" required min="0" step="1" 
                                   class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                        </div>
                        <div class="group">
                            <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-boxes mr-2"></i>Stock *
                            </label>
                            <input type="number" id="productStock" required min="0" step="1" 
                                   class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                        </div>
                        <div class="group">
                            <label class="block text-sm font-bold text-emerald-700 mb-2 group-focus-within:text-emerald-600 transition-colors">
                                <i class="fas fa-copyright mr-2"></i>Marque
                            </label>
                            <input type="text" id="productBrand" 
                                   class="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm group-hover:border-emerald-300">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                            <h4 class="font-bold text-emerald-800 mb-4">Options spéciales</h4>
                            <div class="space-y-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="productFeatured" class="mr-3 w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded">
                                    <span class="text-emerald-700 font-semibold">Produit en vedette</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="productPromotion" class="mr-3 w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded">
                                    <span class="text-emerald-700 font-semibold">En promotion</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <h4 class="font-bold text-blue-800 mb-4">Prix promotion</h4>
                            <div class="space-y-4">
                                <div class="group">
                                    <label class="block text-sm font-bold text-blue-700 mb-2">Prix original (DA)</label>
                                    <input type="number" id="productOriginalPrice" min="0" step="1" 
                                           class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all">
                                </div>
                                <div class="group">
                                    <label class="block text-sm font-bold text-blue-700 mb-2">Pourcentage (%)</label>
                                    <input type="number" id="productDiscountPercent" min="0" max="100" step="1" 
                                           class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
                        <button type="submit" 
                                class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                            <i class="fas fa-plus mr-2"></i>Ajouter le produit
                        </button>
                        <button type="button" onclick="hideAddProductForm()" 
                                class="flex-1 bg-gray-300 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-400 transition-all transform hover:scale-105">
                            <i class="fas fa-times mr-2"></i>Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    loadProductsTable();
}

function loadAdminOrders() {
    const content = document.getElementById('adminContent');
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    
    content.innerHTML = `
        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
            <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                <i class="fas fa-shopping-bag mr-4 text-emerald-600"></i>
                Gestion des Commandes
            </h2>
            
            ${orders.length === 0 ? `
                <div class="text-center py-20">
                    <div class="w-32 h-32 mx-auto mb-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-shopping-bag text-6xl text-emerald-300"></i>
                    </div>
                    <h3 class="text-3xl font-black text-emerald-800 mb-6">Aucune commande</h3>
                    <p class="text-emerald-600 text-lg">Les commandes apparaîtront ici dès qu'elles seront passées.</p>
                </div>
            ` : `
                <div class="space-y-8">
                    ${orders.map((order, index) => `
                        <div class="border-2 border-emerald-200 rounded-3xl p-8 bg-gradient-to-br from-emerald-50/50 to-green-50/50 hover:shadow-xl transition-all duration-300"
                             style="animation-delay: ${index * 0.1}s">
                            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-6">
                                <div>
                                    <h3 class="text-2xl font-black text-emerald-800 mb-3">
                                        <i class="fas fa-receipt mr-3"></i>
                                        Commande ${order.numeroCommande}
                                    </h3>
                                    <div class="space-y-2">
                                        <p class="text-emerald-600 font-semibold">
                                            <i class="fas fa-user mr-2"></i>
                                            Client: ${order.client.prenom} ${order.client.nom}
                                        </p>
                                        <p class="text-emerald-600">
                                            <i class="fas fa-envelope mr-2"></i>
                                            ${order.client.email}
                                        </p>
                                        <p class="text-emerald-600">
                                            <i class="fas fa-phone mr-2"></i>
                                            ${order.client.telephone}
                                        </p>
                                        <p class="text-emerald-500 text-sm">
                                            <i class="fas fa-calendar-alt mr-2"></i>
                                            Passée le ${new Date(order.dateCommande).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-center lg:text-right">
                                    <select onchange="updateOrderStatus('${order.numeroCommande}', this.value)" 
                                            class="px-4 py-2 border-2 border-emerald-300 rounded-xl text-sm font-bold mb-4 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all">
                                        <option value="en-attente" ${order.statut === 'en-attente' ? 'selected' : ''}>⏳ En attente</option>
                                        <option value="confirmee" ${order.statut === 'confirmee' ? 'selected' : ''}>✅ Confirmée</option>
                                        <option value="en-preparation" ${order.statut === 'en-preparation' ? 'selected' : ''}>📦 En préparation</option>
                                        <option value="expedier" ${order.statut === 'expedier' ? 'selected' : ''}>🚚 Expédiée</option>
                                        <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>✅ Livrée</option>
                                        <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>❌ Annulée</option>
                                    </select>
                                    <p class="text-3xl font-black text-emerald-800">${order.total} DA</p>
                                </div>
                            </div>
                            
                            <div class="border-t-2 border-emerald-200 pt-6">
                                <h4 class="font-black text-emerald-800 mb-4 text-lg">
                                    <i class="fas fa-boxes mr-2"></i>Articles:
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    ${order.articles.map(article => `
                                        <div class="flex justify-between items-center bg-white rounded-xl p-4 border border-emerald-100">
                                            <div>
                                                <span class="font-bold text-emerald-800">${article.nom}</span>
                                                <p class="text-sm text-emerald-600">Quantité: ${article.quantite}</p>
                                            </div>
                                            <span class="font-black text-emerald-700">${article.prix * article.quantite} DA</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="border-t-2 border-emerald-200 pt-6 mt-6">
                                <h4 class="font-black text-emerald-800 mb-4 text-lg">
                                    <i class="fas fa-truck mr-2"></i>Livraison:
                                </h4>
                                <div class="bg-white rounded-xl p-4 border border-emerald-100">
                                    <p class="text-emerald-600 font-semibold">${order.livraison.adresse}, ${order.livraison.wilaya}</p>
                                    ${order.livraison.notes ? `<p class="text-emerald-500 text-sm mt-2">Notes: ${order.livraison.notes}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function loadAdminFeatured() {
    const content = document.getElementById('adminContent');
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const featuredProducts = products.filter(p => p.enVedette);
    const regularProducts = products.filter(p => !p.enVedette);
    
    content.innerHTML = `
        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
            <h2 class="text-3xl font-black text-emerald-800 mb-8 flex items-center">
                <i class="fas fa-star mr-4 text-yellow-500"></i>
                Gestion des Coups de Cœur
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Featured Products -->
                <div>
                    <h3 class="text-2xl font-black text-emerald-800 mb-6 flex items-center">
                        <i class="fas fa-star mr-3 text-yellow-500"></i>
                        Produits en vedette (${featuredProducts.length})
                    </h3>
                    <div class="space-y-4 max-h-96 overflow-y-auto">
                        ${featuredProducts.length === 0 ? `
                            <div class="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-200">
                                <i class="fas fa-star text-4xl text-emerald-300 mb-4"></i>
                                <p class="text-emerald-600 font-semibold">Aucun produit en vedette</p>
                            </div>
                        ` : featuredProducts.map(product => `
                            <div class="flex items-center justify-between p-6 bg-yellow-50 rounded-2xl border border-yellow-200 hover:border-yellow-300 transition-all">
                                <div class="flex-1">
                                    <h4 class="font-black text-emerald-800 mb-2">${product.nom}</h4>
                                    <p class="text-emerald-600 flex items-center">
                                        <i class="fas fa-tag mr-2"></i>
                                        ${product.categorie} - ${product.prix} DA
                                    </p>
                                </div>
                                <button onclick="toggleFeatured('${product._id}', false)" 
                                        class="bg-red-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition-all transform hover:scale-105">
                                    <i class="fas fa-times mr-1"></i>Retirer
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Regular Products -->
                <div>
                    <h3 class="text-2xl font-black text-emerald-800 mb-6 flex items-center">
                        <i class="fas fa-list mr-3 text-emerald-600"></i>
                        Produits disponibles
                    </h3>
                    <div class="space-y-4 max-h-96 overflow-y-auto">
                        ${regularProducts.map(product => `
                            <div class="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all">
                                <div class="flex-1">
                                    <h4 class="font-black text-gray-800 mb-2">${product.nom}</h4>
                                    <p class="text-gray-600 flex items-center">
                                        <i class="fas fa-tag mr-2"></i>
                                        ${product.categorie} - ${product.prix} DA
                                    </p>
                                </div>
                                <button onclick="toggleFeatured('${product._id}', true)" 
                                        class="bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all transform hover:scale-105">
                                    <i class="fas fa-star mr-1"></i>Mettre en vedette
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadAdminCleanup() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-200/50 p-8">
            <h2 class="text-3xl font-black text-red-800 mb-8 flex items-center">
                <i class="fas fa-exclamation-triangle mr-4 text-red-600"></i>
                Nettoyage des Données
            </h2>
            <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                <p class="text-red-800 font-bold text-lg flex items-center">
                    <i class="fas fa-exclamation-triangle mr-3"></i>
                    Attention: Ces actions sont irréversibles!
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-red-50 border-2 border-red-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                    <h3 class="text-2xl font-black text-red-800 mb-6 flex items-center">
                        <i class="fas fa-trash mr-3"></i>Supprimer tous les produits
                    </h3>
                    <p class="text-red-600 mb-6 text-lg">Supprime tous les produits du catalogue</p>
                    <button onclick="confirmCleanup('products')" 
                            class="w-full bg-red-500 text-white font-black py-4 rounded-2xl hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                        <i class="fas fa-trash mr-2"></i>Supprimer tous les produits
                    </button>
                </div>
                
                <div class="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                    <h3 class="text-2xl font-black text-orange-800 mb-6 flex items-center">
                        <i class="fas fa-shopping-bag mr-3"></i>Supprimer toutes les commandes
                    </h3>
                    <p class="text-orange-600 mb-6 text-lg">Supprime toutes les commandes</p>
                    <button onclick="confirmCleanup('orders')" 
                            class="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                        <i class="fas fa-shopping-bag mr-2"></i>Supprimer toutes les commandes
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Enhanced Admin utility functions
function showAddProductForm() {
    const modal = document.getElementById('addProductModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.bg-white\\/95').classList.add('scale-100');
    }, 50);
}

function hideAddProductForm() {
    const modal = document.getElementById('addProductModal');
    modal.querySelector('.bg-white\\/95').classList.remove('scale-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('addProductForm').reset();
    }, 200);
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    
    const newProduct = {
        _id: 'prod_' + Date.now(),
        nom: document.getElementById('productName').value.trim(),
        categorie: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value.trim(),
        prix: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        marque: document.getElementById('productBrand').value.trim() || 'Shifa',
        enVedette: document.getElementById('productFeatured').checked,
        enPromotion: document.getElementById('productPromotion').checked,
        prixOriginal: document.getElementById('productOriginalPrice').value ? parseInt(document.getElementById('productOriginalPrice').value) : null,
        pourcentagePromotion: document.getElementById('productDiscountPercent').value ? parseInt(document.getElementById('productDiscountPercent').value) : null,
        actif: true,
        dateAjout: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('demoProducts', JSON.stringify(products));
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast('Produit ajouté avec succès', 'success');
    }
    
    hideAddProductForm();
    loadProductsTable();
}

function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const tbody = document.getElementById('productsTable');
    
    if (tbody) {
        tbody.innerHTML = products.map((product, index) => `
            <tr class="border-b border-emerald-100 hover:bg-emerald-50 transition-all"
                style="animation-delay: ${index * 0.05}s">
                <td class="p-6">
                    <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <i class="fas fa-pills text-emerald-600 text-xl"></i>
                    </div>
                </td>
                <td class="p-6">
                    <div>
                        <p class="font-black text-emerald-800 mb-1">${product.nom}</p>
                        <p class="text-sm text-emerald-600">${product.marque || 'Sans marque'}</p>
                    </div>
                </td>
                <td class="p-6">
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                        ${product.categorie}
                    </span>
                </td>
                <td class="p-6">
                    <div>
                        <p class="font-black text-emerald-800">${product.prix} DA</p>
                        ${product.enPromotion && product.prixOriginal ? `
                            <p class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</p>
                        ` : ''}
                    </div>
                </td>
                <td class="p-6">
                    <span class="px-3 py-1 rounded-full text-sm font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.stock} unités
                    </span>
                </td>
                <td class="p-6">
                    <div class="flex flex-wrap gap-2">
                        ${product.enVedette ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Vedette</span>' : ''}
                        ${product.enPromotion ? '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Promo</span>' : ''}
                    </div>
                </td>
                <td class="p-6">
                    <div class="flex space-x-2">
                        <button onclick="editProduct('${product._id}')" 
                                class="bg-blue-500 text-white font-bold px-3 py-2 rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${product._id}')" 
                                class="bg-red-500 text-white font-bold px-3 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function editProduct(productId) {
    if (window.app) {
        window.app.showToast('Fonction de modification en développement', 'info');
    }
}

function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        products = products.filter(p => p._id !== productId);
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast('Produit supprimé', 'success');
        }
        
        loadProductsTable();
    }
}

function toggleFeatured(productId, featured) {
    let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const productIndex = products.findIndex(p => p._id === productId);
    
    if (productIndex > -1) {
        products[productIndex].enVedette = featured;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            window.app.showToast(featured ? 'Produit mis en vedette' : 'Produit retiré de la vedette', 'success');
        }
        
        loadAdminFeatured();
    }
}

function updateOrderStatus(orderNumber, newStatus) {
    let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.numeroCommande === orderNumber);
    
    if (orderIndex > -1) {
        orders[orderIndex].statut = newStatus;
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        if (window.app) {
            window.app.showToast('Statut de la commande mis à jour', 'success');
        }
    }
}

function confirmCleanup(type) {
    let message = '';
    if (type === 'products') {
        message = 'Êtes-vous sûr de vouloir supprimer TOUS les produits ? Cette action est irréversible !';
    } else if (type === 'orders') {
        message = 'Êtes-vous sûr de vouloir supprimer TOUTES les commandes ? Cette action est irréversible !';
    }
    
    if (confirm(message)) {
        if (type === 'products') {
            localStorage.removeItem('demoProducts');
            if (window.app) {
                window.app.allProducts = [];
                window.app.refreshProductsCache();
                window.app.showToast('Tous les produits ont été supprimés', 'success');
            }
        } else if (type === 'orders') {
            localStorage.removeItem('adminOrders');
            if (window.app) {
                window.app.showToast('Toutes les commandes ont été supprimées', 'success');
            }
            loadAdminOrders();
        }
    }
}

// Enhanced Global Functions
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
    submitText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
    submitSpinner.classList.remove('hidden');
    
    setTimeout(() => {
        submitBtn.disabled = false;
        submitText.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Envoyer le message';
        submitSpinner.classList.add('hidden');
        
        event.target.reset();
        
        if (window.app) {
            window.app.showToast('Message envoyé avec succès !', 'success');
        }
    }, 2000);
}

async function handleCheckout(event) {
    event.preventDefault();
    
    console.log('🛒 Checkout form submitted');
    
    if (window.app && typeof window.app.processOrder === 'function') {
        await window.app.processOrder();
    } else {
        console.error('App or processOrder method not available');
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize enhanced app with error handling
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing enhanced Shifa app...');
    try {
        app = new PharmacieGaherApp();
        window.app = app;
        console.log('✅ Enhanced app initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
    }
});

// Add enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    @keyframes float-delayed {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
    }
    
    @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    
    @keyframes bounce-slow {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    .animate-fadeInUp {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .animate-slideInLeft {
        animation: slideInLeft 0.8s ease-out forwards;
    }
    
    .animate-slideInRight {
        animation: slideInRight 0.8s ease-out forwards;
    }
    
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
    
    .animate-float-delayed {
        animation: float-delayed 8s ease-in-out infinite;
    }
    
    .animate-pulse-slow {
        animation: pulse-slow 3s ease-in-out infinite;
    }
    
    .animate-bounce-slow {
        animation: bounce-slow 2s ease-in-out infinite;
    }
    
    .hero-gradient {
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
    }
    
    .category-card:hover {
        transform: scale(1.05) rotate(-1deg);
    }
    
    .product-card:hover {
        transform: scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .feature-card:hover {
        transform: scale(1.05);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .bg-gradient-radial {
        background: radial-gradient(circle, var(--tw-gradient-stops));
    }
`;
document.head.appendChild(style);

console.log('✅ Enhanced Shifa E-commerce App.js loaded with ALL functionality and aesthetic improvements');
