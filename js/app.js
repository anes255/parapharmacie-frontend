// Simple encoding fix - add this at the very top of app.js
function fixText(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/Ã©/g, 'é')
        .replace(/Ã¨/g, 'è')
        .replace(/Ã /g, 'à')
        .replace(/Ã´/g, 'ô')
        .replace(/Ãª/g, 'ê')
        .replace(/Ã§/g, 'ç')
        .replace(/VitalitÃ©/g, 'Vitalité')
        .replace(/BÃ©bÃ©/g, 'Bébé')
        .replace(/AlgÃ©rie/g, 'Algérie')
        .replace(/TÃ©lÃ©phone/g, 'Téléphone')
        .replace(/confirmÃ©e/g, 'confirmée')
        .replace(/prÃ©parÃ©e/g, 'préparée')
        .replace(/expÃ©diÃ©e/g, 'expédiée')
        .replace(/livrÃ©e/g, 'livrée')
        .replace(/annulÃ©e/g, 'annulée');
}

// Apply fix when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.querySelectorAll('*').forEach(function(element) {
            if (element.children.length === 0 && element.textContent) {
                element.textContent = fixText(element.textContent);
            }
        });
    }, 1000);
});


class PharmacieGaherApp {
    constructor() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.settings = {
            couleurPrimaire: '#10b981',
            couleurSecondaire: '#059669',
            couleurAccent: '#34d399',
            nomSite: 'Shifa - Parapharmacie Gaher',
            fraisLivraison: 300,
            livraisonGratuite: 5000
        };
        this.currentPage = 'home';
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkAuth();
            this.initUI();
            await this.showPage('home');
            this.updateCartUI();
            this.initSearch();
        } catch (error) {
            console.error('Erreur initialisation app:', error);
            this.showToast('Erreur de chargement de l\'application', 'error');
        }
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
            
            <section class="py-20 bg-gradient-to-b from-green-50 to-emerald-50 section-with-decoration">
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
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-teal-700/20"></div>
                <div class="container mx-auto px-4 relative z-10">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-truck-fast text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Livraison Express</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Livraison rapide dans toute l'Algérie avec suivi en temps réel
                            </p>
                        </div>
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-certificate text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Qualité Certifiée</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Produits authentiques avec garantie qualité pharmaceutique
                            </p>
                        </div>
                        <div class="text-center group">
                            <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                <i class="fas fa-user-md text-3xl drop-shadow-lg"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Conseil Expert</h3>
                            <p class="text-lg opacity-90 text-green-100">
                                Accompagnement par nos pharmaciens qualifiés 24h/7j
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
        // Get products from localStorage that include ALL categories
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        // Filter for featured products from all categories
        const filteredProducts = localProducts.filter(p => p.enVedette && p.actif !== false);
        
        const container = document.getElementById('featuredProducts');
        if (container) {
            if (filteredProducts.length === 0) {
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
                container.innerHTML = filteredProducts.slice(0, 8).map(product => this.createProductCard(product)).join('');
            }
        }
    }
    
    async loadPromotionProducts() {
        // Get products from localStorage that include ALL categories  
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        // Filter for promotion products from all categories
        const promotionProducts = localProducts.filter(p => p.enPromotion && p.actif !== false);
        
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
    
    // ADD TO CART FUNCTIONALITY - FIXED
    async addToCart(productId, quantity = 1) {
        try {
            console.log('Adding to cart:', productId, quantity);
            
            // Get all products from localStorage (includes all categories)
            const allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const product = allProducts.find(p => p._id === productId);
            
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
// FIXED: Add these functions to your app.js file

// Enhanced authentication handling
PharmacieGaherApp.prototype.loadUserFromToken = function() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            // Decode JWT token to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.log('Token expired, removing...');
                localStorage.removeItem('token');
                this.currentUser = null;
                this.updateUserInterface();
                return;
            }
            
            // Set user from token
            this.currentUser = {
                id: payload.user?.id,
                nom: payload.user?.nom || 'Admin',
                prenom: payload.user?.prenom || 'User',
                email: payload.user?.email || 'admin@example.com',
                role: payload.user?.role || 'admin'
            };
            
            console.log('✅ User loaded from token:', this.currentUser);
            this.updateUserInterface();
            
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
            this.currentUser = null;
            this.updateUserInterface();
        }
    }
};

// FIXED: Enhanced login function with proper token handling
PharmacieGaherApp.prototype.login = async function(email, password) {
    try {
        console.log('🔐 Attempting login...');
        
        const response = await apiCall('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            // Store token
            localStorage.setItem('token', response.token);
            
            // Set current user
            this.currentUser = response.user;
            
            // Update UI
            this.updateUserInterface();
            
            console.log('✅ Login successful:', this.currentUser);
            this.showToast(`Bienvenue ${this.currentUser.prenom}!`, 'success');
            
            // Redirect based on role
            if (this.currentUser.role === 'admin') {
                this.showPage('admin');
            } else {
                this.showPage('home');
            }
            
            return true;
        } else {
            throw new Error('Pas de token reçu');
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        
        // For demo purposes, allow admin login even if backend fails
        if (email === 'pharmaciegaher@gmail.com' && password === 'anesaya75') {
            console.log('🎭 Using demo admin credentials');
            
            // Create demo admin user
            this.currentUser = {
                id: 'demo_admin',
                nom: 'Gaher',
                prenom: 'Parapharmacie',
                email: 'pharmaciegaher@gmail.com',
                role: 'admin'
            };
            
            // Create demo token
            const demoToken = btoa(JSON.stringify({
                user: this.currentUser,
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            }));
            localStorage.setItem('token', 'demo.' + demoToken + '.demo');
            
            this.updateUserInterface();
            this.showToast(`Bienvenue ${this.currentUser.prenom} (Mode démo)!`, 'success');
            this.showPage('admin');
            return true;
        }
        
        this.showToast('Email ou mot de passe incorrect', 'error');
        return false;
    }
};

// Enhanced initialization with proper event listeners
PharmacieGaherApp.prototype.init = function() {
    console.log('🚀 Initializing Shifa Parapharmacie App...');
    
    // Load user from stored token
    this.loadUserFromToken();
    
    // Load initial page
    this.showPage('home');
    
    // FIXED: Add product update event listeners
    this.setupProductUpdateListeners();
    
    // Initialize search functionality
    this.initializeSearch();
    
    console.log('✅ App initialization complete');
};

// FIXED: Setup product update listeners
PharmacieGaherApp.prototype.setupProductUpdateListeners = function() {
    console.log('📱 Setting up product update listeners...');
    
    // Listen for products updated events from admin
    document.addEventListener('productsUpdated', (event) => {
        console.log('📢 Products updated event received:', event.detail);
        
        // Clear product cache
        localStorage.removeItem('demoProducts');
        
        // Refresh current page if needed
        setTimeout(() => {
            if (this.currentPage === 'products') {
                this.runProductsLoad({});
            } else if (this.currentPage === 'home') {
                this.loadFeaturedProducts();
            }
        }, 500);
    });
    
    // Listen for admin product changes
    document.addEventListener('adminProductChange', (event) => {
        console.log('🔧 Admin product change:', event.detail);
        this.refreshProductDisplays();
    });
    
    console.log('✅ Product update listeners set up');
};

// FIXED: Method to refresh product displays
PharmacieGaherApp.prototype.refreshProductDisplays = function() {
    console.log('🔄 Refreshing product displays...');
    
    // Clear cache
    localStorage.removeItem('demoProducts');
    
    // Refresh based on current page
    if (this.currentPage === 'home') {
        this.loadFeaturedProducts();
    } else if (this.currentPage === 'products') {
        this.runProductsLoad({});
    }
};

// FIXED: Enhanced cart management with proper product sync
PharmacieGaherApp.prototype.addToCart = async function(productId, quantity = 1) {
    try {
        console.log(`🛒 Adding to cart: ${productId} x${quantity}`);
        
        // Get fresh product data
        let product = null;
        
        // Try to get from localStorage first (faster)
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        product = localProducts.find(p => p._id === productId);
        
        // If not found locally, try backend
        if (!product) {
            try {
                product = await apiCall(`/products/${productId}`);
            } catch (error) {
                console.warn('Could not fetch product from backend');
            }
        }
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            return;
        }
        
        // Check stock
        if (product.stock === 0) {
            this.showToast('Produit en rupture de stock', 'error');
            return;
        }
        
        if (quantity > product.stock) {
            this.showToast(`Stock insuffisant (${product.stock} disponibles)`, 'error');
            return;
        }
        
        // Get current cart
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item._id === productId);
        
        if (existingIndex !== -1) {
            // Update quantity
            const newQuantity = cart[existingIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                this.showToast(`Stock insuffisant (${product.stock} disponibles)`, 'error');
                return;
            }
            cart[existingIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        this.updateCartUI();
        this.showToast(`${product.nom} ajouté au panier`, 'success');
        
        console.log('✅ Product added to cart successfully');
        
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        this.showToast('Erreur lors de l\'ajout au panier', 'error');
    }
};

// FIXED: Global function to refresh products from admin
window.refreshMainPageProducts = function() {
    console.log('🔄 Refreshing main page products...');
    
    if (window.app) {
        // Clear cache
        localStorage.removeItem('demoProducts');
        
        // Refresh current page
        if (window.app.currentPage === 'products') {
            window.app.runProductsLoad({});
        } else if (window.app.currentPage === 'home') {
            window.app.loadFeaturedProducts();
        }
        
        // Also refresh cart to ensure product info is up to date
        window.app.updateCartUI();
    }
};

// FIXED: Initialize app with all event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, initializing app...');
    
    // Create app instance
    window.app = new PharmacieGaherApp();
    
    // Initialize
    window.app.init();
    
    // Test backend connection
    if (typeof testBackendConnection === 'function') {
        setTimeout(testBackendConnection, 2000);
    }
    
    console.log('✅ App ready!');
});

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    app = new PharmacieGaherApp();
    window.app = app;
    console.log('App initialized and made globally available');
});


console.log('✅ Updated app.js loaded with all 10 categories (Vitalité, Sport, Visage, Cheveux, Solaire, Intime, Soins, Bébé, Homme, Dentaire) on homepage');


