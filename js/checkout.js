// Enhanced Products Page Management for Shifa Parapharmacie - Complete Error-Free Version

// Enhanced Products Page Loading
PharmacieGaherApp.prototype.loadProductsPage = async function(params = {}) {
    try {
        console.log('🛍️ Loading products page with params:', params);
        
        const mainContent = document.getElementById('mainContent');
        
        // Show enhanced loading state
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-20">
                    <div class="relative mb-8">
                        <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i class="fas fa-pills text-emerald-500 text-2xl"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-emerald-800 mb-2">Chargement des produits</h3>
                    <p class="text-emerald-600">Découvrez nos produits de santé et beauté...</p>
                </div>
            </div>
        `;
        
        // Load products with comprehensive error handling
        let products = [];
        
        try {
            console.log('📡 Fetching products from API...');
            const response = await this.apiCall('/products');
            
            if (response && response.products) {
                products = response.products;
                console.log(`✅ Loaded ${products.length} products from API`);
                
                // Cache in localStorage for offline use
                localStorage.setItem('cachedProducts', JSON.stringify(products));
                localStorage.setItem('productsCacheTime', Date.now().toString());
            }
        } catch (error) {
            console.warn('⚠️ API failed, using cached products:', error.message);
            
            // Fallback to cached products
            const cachedProducts = localStorage.getItem('cachedProducts');
            const cacheTime = localStorage.getItem('productsCacheTime');
            
            if (cachedProducts && cacheTime) {
                const cacheAge = Date.now() - parseInt(cacheTime);
                if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
                    products = JSON.parse(cachedProducts);
                    console.log(`📦 Using cached products (${products.length} items)`);
                }
            }
            
            // Final fallback to app cache
            if (products.length === 0) {
                products = this.allProducts || [];
                console.log(`🏠 Using app cache products (${products.length} items)`);
            }
        }
        
        // Apply comprehensive filters
        let filteredProducts = this.applyProductFilters(products, params);
        
        // Apply sorting
        filteredProducts = this.sortProducts(filteredProducts, params.sort);
        
        // Render products page with enhanced UI
        this.renderProductsPage(filteredProducts, params, products.length);
        
    } catch (error) {
        console.error('❌ Error loading products page:', error);
        this.renderProductsError(error);
    }
};

// Enhanced API call method
PharmacieGaherApp.prototype.apiCall = async function(endpoint, options = {}) {
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://parapharmacie-gaher.onrender.com/api';
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
    
    try {
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Délai d\'attente dépassé');
        }
        
        throw error;
    }
};

// Enhanced product filtering
PharmacieGaherApp.prototype.applyProductFilters = function(products, params) {
    return products.filter(product => {
        // Only show active products
        if (product.actif === false) return false;
        
        // Category filter
        if (params.categorie && product.categorie !== params.categorie) return false;
        
        // Search filter - comprehensive search
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            const searchableText = [
                product.nom,
                product.description,
                product.marque,
                product.ingredients,
                product.tags?.join(' ')
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        // Price filters
        if (params.priceMin && product.prix < parseFloat(params.priceMin)) return false;
        if (params.priceMax && product.prix > parseFloat(params.priceMax)) return false;
        
        // Feature filters
        if (params.enPromotion && !product.enPromotion) return false;
        if (params.enVedette && !product.enVedette) return false;
        if (params.disponible && product.stock === 0) return false;
        
        // Brand filter
        if (params.marque && product.marque !== params.marque) return false;
        
        // Certification filters
        if (params.certifications && params.certifications.length > 0) {
            if (!product.certifications || !params.certifications.some(cert => product.certifications.includes(cert))) {
                return false;
            }
        }
        
        return true;
    });
};

// Enhanced product sorting
PharmacieGaherApp.prototype.sortProducts = function(products, sortOption = 'newest') {
    const sortedProducts = [...products];
    
    switch (sortOption) {
        case 'price_asc':
            return sortedProducts.sort((a, b) => a.prix - b.prix);
        case 'price_desc':
            return sortedProducts.sort((a, b) => b.prix - a.prix);
        case 'name_asc':
            return sortedProducts.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        case 'name_desc':
            return sortedProducts.sort((a, b) => b.nom.localeCompare(a.nom, 'fr'));
        case 'popularity':
            return sortedProducts.sort((a, b) => (b.statistiques?.ventesTotales || 0) - (a.statistiques?.ventesTotales || 0));
        case 'rating':
            return sortedProducts.sort((a, b) => (b.statistiques?.notemoyenne || 0) - (a.statistiques?.notemoyenne || 0));
        case 'stock':
            return sortedProducts.sort((a, b) => b.stock - a.stock);
        case 'promotion':
            return sortedProducts.sort((a, b) => {
                if (a.enPromotion && !b.enPromotion) return -1;
                if (!a.enPromotion && b.enPromotion) return 1;
                return 0;
            });
        default: // newest
            return sortedProducts.sort((a, b) => new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0));
    }
};

// Enhanced products page rendering
PharmacieGaherApp.prototype.renderProductsPage = function(filteredProducts, params = {}, totalProducts = 0) {
    const mainContent = document.getElementById('mainContent');
    
    const categoryTitle = params.categorie ? ` - ${params.categorie}` : '';
    const searchTitle = params.search ? ` - "${params.search}"` : '';
    
    // Get unique brands and categories from all products for filters
    const availableBrands = [...new Set(this.allProducts.map(p => p.marque).filter(Boolean))].sort();
    const availableCategories = [...new Set(this.allProducts.map(p => p.categorie))].sort();
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <!-- Enhanced Header -->
            <div class="text-center mb-12">
                <div class="flex items-center justify-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-pills text-white text-2xl"></i>
                    </div>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
                    Nos Produits${categoryTitle}${searchTitle}
                </h1>
                <p class="text-xl text-emerald-600 mb-4">
                    ${filteredProducts.length} produit(s) ${totalProducts !== filteredProducts.length ? `sur ${totalProducts}` : 'disponible(s)'}
                </p>
                ${params.search ? `
                    <div class="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                        <i class="fas fa-search mr-2"></i>
                        Recherche: "${params.search}"
                        <button onclick="clearProductSearch()" class="ml-2 text-blue-600 hover:text-blue-800">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <!-- Enhanced Filters -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-emerald-800 flex items-center">
                        <i class="fas fa-filter mr-2"></i>Filtres
                    </h3>
                    <button onclick="clearAllProductFilters()" class="text-gray-500 hover:text-gray-700 text-sm font-medium">
                        <i class="fas fa-times mr-1"></i>Tout effacer
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                    <!-- Search -->
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-search mr-1"></i>Rechercher
                        </label>
                        <input type="text" id="productSearch" value="${params.search || ''}" 
                               placeholder="Nom, marque, ingrédients..."
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all">
                    </div>
                    
                    <!-- Category -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-th-large mr-1"></i>Catégorie
                        </label>
                        <select id="categoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Toutes</option>
                            ${availableCategories.map(cat => `
                                <option value="${cat}" ${params.categorie === cat ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Brand -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-tag mr-1"></i>Marque
                        </label>
                        <select id="brandFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Toutes</option>
                            ${availableBrands.map(brand => `
                                <option value="${brand}" ${params.marque === brand ? 'selected' : ''}>${brand}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Sort -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-sort mr-1"></i>Trier par
                        </label>
                        <select id="sortSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="newest" ${params.sort === 'newest' ? 'selected' : ''}>Plus récent</option>
                            <option value="price_asc" ${params.sort === 'price_asc' ? 'selected' : ''}>Prix croissant</option>
                            <option value="price_desc" ${params.sort === 'price_desc' ? 'selected' : ''}>Prix décroissant</option>
                            <option value="name_asc" ${params.sort === 'name_asc' ? 'selected' : ''}>Nom A-Z</option>
                            <option value="name_desc" ${params.sort === 'name_desc' ? 'selected' : ''}>Nom Z-A</option>
                            <option value="popularity" ${params.sort === 'popularity' ? 'selected' : ''}>Popularité</option>
                            <option value="promotion" ${params.sort === 'promotion' ? 'selected' : ''}>Promotions</option>
                        </select>
                    </div>
                </div>
                
                <!-- Price Range -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-coins mr-1"></i>Prix minimum
                        </label>
                        <input type="number" id="priceMin" value="${params.priceMin || ''}" 
                               placeholder="0" min="0" step="100"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-coins mr-1"></i>Prix maximum
                        </label>
                        <input type="number" id="priceMax" value="${params.priceMax || ''}" 
                               placeholder="50000" min="0" step="100"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    <div class="flex items-end">
                        <button onclick="applyProductFilters()" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-filter mr-2"></i>Appliquer
                        </button>
                    </div>
                </div>
                
                <!-- Quick Filters -->
                <div class="flex flex-wrap gap-3">
                    <label class="flex items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" id="promotionFilter" ${params.enPromotion ? 'checked' : ''} 
                               class="rounded text-emerald-600 mr-2">
                        <i class="fas fa-tags text-red-500 mr-1"></i>
                        <span class="text-sm font-medium text-gray-700">En promotion</span>
                    </label>
                    <label class="flex items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" id="featuredFilter" ${params.enVedette ? 'checked' : ''} 
                               class="rounded text-emerald-600 mr-2">
                        <i class="fas fa-star text-yellow-500 mr-1"></i>
                        <span class="text-sm font-medium text-gray-700">Coups de cœur</span>
                    </label>
                    <label class="flex items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" id="disponibleFilter" ${params.disponible ? 'checked' : ''} 
                               class="rounded text-emerald-600 mr-2">
                        <i class="fas fa-check-circle text-green-500 mr-1"></i>
                        <span class="text-sm font-medium text-gray-700">Disponible</span>
                    </label>
                </div>
            </div>
            
            <!-- Results Info -->
            <div class="flex items-center justify-between mb-8">
                <div class="text-emerald-700">
                    <span class="font-semibold">${filteredProducts.length}</span> produit(s) trouvé(s)
                    ${params.categorie ? ` dans <span class="font-semibold">${params.categorie}</span>` : ''}
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="toggleViewMode('grid')" id="gridViewBtn" 
                            class="p-2 rounded-lg bg-emerald-500 text-white">
                        <i class="fas fa-th-large"></i>
                    </button>
                    <button onclick="toggleViewMode('list')" id="listViewBtn" 
                            class="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                ${filteredProducts.length === 0 ? this.renderNoProducts(params) : filteredProducts.map(product => this.createEnhancedProductCard(product)).join('')}
            </div>
            
            <!-- Load More Button (if many products) -->
            ${filteredProducts.length > 12 ? `
                <div class="text-center mt-12">
                    <button onclick="loadMoreProducts()" id="loadMoreBtn" 
                            class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
                        <i class="fas fa-plus mr-2"></i>Voir plus de produits
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Setup enhanced filter functionality
    this.setupEnhancedProductFilters();
    
    // Initially hide products beyond the first 12
    this.limitDisplayedProducts(12);
};

// Enhanced product card creation
PharmacieGaherApp.prototype.createEnhancedProductCard = function(product) {
    const isOutOfStock = product.stock === 0;
    const hasPromotion = product.enPromotion && product.prixOriginal;
    const stockStatus = product.stock === 0 ? 'rupture' : 
                       product.stock <= 5 ? 'faible' : 'bon';
    
    // Generate image URL with better fallback
    let imageUrl;
    if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:image'))) {
        imageUrl = product.image;
    } else {
        const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const categoryColors = {
            'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
            'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
            'Soins': '22c55e', 'Bébé': '06b6d4', 'Homme': '3b82f6',
            'Dentaire': '6366f1'
        };
        const color = categoryColors[product.categorie] || '10b981';
        imageUrl = `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
    }
    
    return `
        <div class="product-card group bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 hover:shadow-2xl hover:scale-105 ${isOutOfStock ? 'opacity-75' : ''}"
             onclick="app.showPage('product', {id: '${product._id}'})"
             data-product-id="${product._id}">
            
            <!-- Badges -->
            <div class="absolute top-4 left-4 z-20 flex flex-col space-y-2">
                ${hasPromotion ? `
                    <div class="badge-promotion bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                        -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                    </div>
                ` : ''}
                ${product.enVedette ? `
                    <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                        <i class="fas fa-star mr-1"></i>Coup de cœur
                    </div>
                ` : ''}
                ${stockStatus === 'faible' ? `
                    <div class="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                        Stock limité
                    </div>
                ` : ''}
            </div>
            
            <!-- Quick Actions -->
            <div class="absolute top-4 right-4 z-20 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onclick="event.stopPropagation(); toggleWishlist('${product._id}')" 
                        class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-lg"
                        title="Ajouter aux favoris">
                    <i class="fas fa-heart"></i>
                </button>
                <button onclick="event.stopPropagation(); openQuickView('${product._id}')" 
                        class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-white transition-all shadow-lg"
                        title="Aperçu rapide">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            
            <!-- Out of Stock Overlay -->
            ${isOutOfStock ? `
                <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                    <div class="text-center text-white">
                        <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                        <p class="font-bold text-lg">Rupture de stock</p>
                    </div>
                </div>
            ` : ''}
            
            <!-- Product Image -->
            <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                <img src="${imageUrl}" alt="${product.nom}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     loading="lazy"
                     onerror="this.src='${imageUrl}'">
                
                <!-- Rating overlay -->
                ${product.statistiques?.notemoyenne > 0 ? `
                    <div class="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                        <div class="flex items-center">
                            ${Array.from({length: 5}, (_, i) => `
                                <i class="fas fa-star text-xs ${i < Math.floor(product.statistiques.notemoyenne) ? 'text-yellow-400' : 'text-gray-300'}"></i>
                            `).join('')}
                        </div>
                        <span class="text-xs font-semibold text-gray-700">${product.statistiques.notemoyenne.toFixed(1)}</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Product Info -->
            <div class="p-6">
                <!-- Brand and Category -->
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        ${product.categorie}
                    </span>
                    ${product.marque ? `
                        <span class="text-xs text-gray-500 font-medium">${product.marque}</span>
                    ` : ''}
                </div>
                
                <!-- Product Name -->
                <h3 class="font-bold text-emerald-800 mb-3 text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    ${product.nom}
                </h3>
                
                <!-- Description -->
                <p class="text-sm text-emerald-600 mb-4 line-clamp-2">
                    ${product.description || 'Description du produit'}
                </p>
                
                <!-- Price and Stock -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex flex-col">
                        ${hasPromotion ? `
                            <div class="flex items-center space-x-2">
                                <span class="text-xl font-bold text-red-600">${product.prix} DA</span>
                                <span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>
                            </div>
                            <span class="text-xs text-green-600 font-semibold">
                                Économisez ${product.prixOriginal - product.prix} DA
                            </span>
                        ` : `
                            <span class="text-xl font-bold text-emerald-700">${product.prix} DA</span>
                        `}
                    </div>
                    
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Stock: ${product.stock}</div>
                        <div class="text-xs font-semibold ${stockStatus === 'bon' ? 'text-green-600' : stockStatus === 'faible' ? 'text-orange-600' : 'text-red-600'}">
                            ${stockStatus === 'bon' ? 'Disponible' : stockStatus === 'faible' ? 'Stock limité' : 'Rupture'}
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center space-x-2">
                    ${!isOutOfStock ? `
                        <button onclick="event.stopPropagation(); addToCartFromCard('${product._id}')" 
                                class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <i class="fas fa-cart-plus mr-2"></i>Ajouter
                        </button>
                        <button onclick="event.stopPropagation(); buyNow('${product._id}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-bolt"></i>
                        </button>
                    ` : `
                        <button disabled 
                                class="flex-1 bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-xl cursor-not-allowed">
                            <i class="fas fa-ban mr-2"></i>Indisponible
                        </button>
                    `}
                </div>
                
                <!-- Additional Info -->
                <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>${product.statistiques?.ventesTotales || 0} vendu(s)</span>
                    <span>${product.statistiques?.vues || 0} vue(s)</span>
                </div>
            </div>
        </div>
    `;
};

// Enhanced no products message
PharmacieGaherApp.prototype.renderNoProducts = function(params) {
    let message = 'Aucun produit trouvé';
    let suggestion = 'Essayez de modifier vos filtres';
    let icon = 'fa-search';
    
    if (params.search) {
        message = `Aucun résultat pour "${params.search}"`;
        suggestion = 'Vérifiez l\'orthographe ou essayez des mots-clés différents';
        icon = 'fa-search-minus';
    } else if (params.categorie) {
        message = `Aucun produit dans "${params.categorie}"`;
        suggestion = 'Cette catégorie sera bientôt approvisionnée';
        icon = 'fa-inbox';
    } else if (params.priceMin || params.priceMax) {
        message = 'Aucun produit dans cette gamme de prix';
        suggestion = 'Ajustez vos critères de prix';
        icon = 'fa-coins';
    }
    
    return `
        <div class="col-span-full text-center py-20">
            <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl p-12 max-w-md mx-auto">
                <i class="fas ${icon} text-6xl text-emerald-300 mb-6"></i>
                <h3 class="text-2xl font-bold text-emerald-800 mb-4">${message}</h3>
                <p class="text-emerald-600 mb-8">${suggestion}</p>
                <div class="space-y-4">
                    <button onclick="clearAllProductFilters()" 
                            class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                        <i class="fas fa-times mr-2"></i>Effacer les filtres
                    </button>
                    <div class="text-sm text-emerald-600">
                        ou <a href="#" onclick="app.showPage('home')" class="underline hover:text-emerald-800">retourner à l'accueil</a>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Enhanced error rendering
PharmacieGaherApp.prototype.renderProductsError = function(error) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="text-center py-20">
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-12 max-w-md mx-auto">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Erreur de chargement</h3>
                    <p class="text-red-600 mb-8">Impossible de charger les produits</p>
                    <div class="space-y-4">
                        <button onclick="app.showPage('products')" 
                                class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-redo mr-2"></i>Réessayer
                        </button>
                        <div class="text-sm text-red-600">
                            Erreur: ${error.message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Enhanced filter setup
PharmacieGaherApp.prototype.setupEnhancedProductFilters = function() {
    // Search with debounce
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        let searchTimeout;
        productSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyProductFilters();
            }, 500);
        });
    }
    
    // Immediate filter changes
    ['categoryFilter', 'brandFilter', 'sortSelect'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                applyProductFilters();
            });
        }
    });
    
    // Price range with debounce
    ['priceMin', 'priceMax'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            let priceTimeout;
            element.addEventListener('input', () => {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    applyProductFilters();
                }, 1000);
            });
        }
    });
    
    // Checkbox filters
    ['promotionFilter', 'featuredFilter', 'disponibleFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                applyProductFilters();
            });
        }
    });
};

// Limit displayed products for performance
PharmacieGaherApp.prototype.limitDisplayedProducts = function(limit) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        if (index >= limit) {
            card.style.display = 'none';
            card.classList.add('hidden-product');
        }
    });
};

// Enhanced Product Detail Page
PharmacieGaherApp.prototype.loadProductPage = async function(productId) {
    try {
        console.log('📖 Loading product page for:', productId);
        
        const mainContent = document.getElementById('mainContent');
        
        // Show loading state
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p class="text-emerald-600">Chargement du produit...</p>
                </div>
            </div>
        `;
        
        // Find product in cache first
        let product = this.allProducts.find(p => p._id === productId);
        
        // If not found, try API
        if (!product) {
            try {
                const response = await this.apiCall(`/products/${productId}`);
                product = response.product || response;
            } catch (error) {
                console.error('Product not found in API:', error);
            }
        }
        
        if (!product) {
            this.showProductNotFound();
            return;
        }
        
        // Increment view count
        this.incrementProductViews(productId);
        
        this.renderEnhancedProductDetail(product);
        
    } catch (error) {
        console.error('Error loading product page:', error);
        this.showProductNotFound();
    }
};

// Increment product views
PharmacieGaherApp.prototype.incrementProductViews = function(productId) {
    try {
        // Update local storage
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex > -1) {
            if (!products[productIndex].statistiques) {
                products[productIndex].statistiques = { vues: 0, ventesTotales: 0 };
            }
            products[productIndex].statistiques.vues = (products[productIndex].statistiques.vues || 0) + 1;
            localStorage.setItem('demoProducts', JSON.stringify(products));
        }
        
        // Try to update via API (fire and forget)
        if (navigator.onLine) {
            fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://parapharmacie-gaher.onrender.com/api'}/products/${productId}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => {}); // Ignore errors
        }
        
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
};

// Enhanced product detail rendering
PharmacieGaherApp.prototype.renderEnhancedProductDetail = function(product) {
    const mainContent = document.getElementById('mainContent');
    
    const isOutOfStock = product.stock === 0;
    const hasPromotion = product.enPromotion && product.prixOriginal;
    
    // Generate image URL
    let imageUrl;
    if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:image'))) {
        imageUrl = product.image;
    } else {
        const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        imageUrl = `https://via.placeholder.com/600x600/10b981/ffffff?text=${encodeURIComponent(initials)}`;
    }
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <!-- Enhanced Breadcrumb -->
            <nav class="mb-8" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-2 text-sm bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-200/50">
                    <li><a href="#" onclick="showPage('home')" class="text-emerald-600 hover:text-emerald-700 font-medium">🏠 Accueil</a></li>
                    <li><i class="fas fa-chevron-right text-gray-400 text-xs"></i></li>
                    <li><a href="#" onclick="showPage('products')" class="text-emerald-600 hover:text-emerald-700 font-medium">Produits</a></li>
                    <li><i class="fas fa-chevron-right text-gray-400 text-xs"></i></li>
                    <li><a href="#" onclick="filterByCategory('${product.categorie}')" class="text-emerald-600 hover:text-emerald-700 font-medium">${product.categorie}</a></li>
                    <li><i class="fas fa-chevron-right text-gray-400 text-xs"></i></li>
                    <li><span class="text-gray-900 font-medium">${product.nom}</span></li>
                </ol>
            </nav>
            
            <!-- Product Detail -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                <!-- Product Images -->
                <div class="space-y-4">
                    <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden relative group">
                        ${hasPromotion ? `
                            <div class="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg">
                                -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                            </div>
                        ` : ''}
                        ${product.enVedette ? `
                            <div class="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-2 rounded-lg font-bold shadow-lg">
                                <i class="fas fa-star mr-1"></i>Coup de cœur
                            </div>
                        ` : ''}
                        ${isOutOfStock ? `
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                <div class="text-center text-white">
                                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                                    <p class="font-bold text-2xl">Rupture de stock</p>
                                </div>
                            </div>
                        ` : ''}
                        <img src="${imageUrl}" alt="${product.nom}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                             onerror="this.src='https://via.placeholder.com/600x600/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                        
                        <!-- Image zoom button -->
                        <button onclick="openImageModal('${imageUrl}', '${product.nom}')" 
                                class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-lg hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="space-y-6">
                    <!-- Header -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <span class="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                ${product.categorie}
                            </span>
                            ${product.marque ? `
                                <span class="text-gray-500 font-medium">${product.marque}</span>
                            ` : ''}
                        </div>
                        <h1 class="text-3xl lg:text-4xl font-bold text-emerald-800 mb-2">${product.nom}</h1>
                        ${product.statistiques?.notemoyenne > 0 ? `
                            <div class="flex items-center space-x-2 mb-4">
                                <div class="flex items-center">
                                    ${Array.from({length: 5}, (_, i) => `
                                        <i class="fas fa-star ${i < Math.floor(product.statistiques.notemoyenne) ? 'text-yellow-400' : 'text-gray-300'}"></i>
                                    `).join('')}
                                </div>
                                <span class="text-gray-600">${product.statistiques.notemoyenne.toFixed(1)}</span>
                                <span class="text-gray-400">•</span>
                                <span class="text-gray-600">${product.statistiques.nombreAvis || 0} avis</span>
                                <span class="text-gray-400">•</span>
                                <span class="text-gray-600">${product.statistiques.ventesTotales || 0} vendu(s)</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Price -->
                    <div class="border-t border-b border-gray-200 py-6">
                        ${hasPromotion ? `
                            <div class="flex items-center space-x-4 mb-2">
                                <span class="text-4xl font-bold text-red-600">${product.prix} DA</span>
                                <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                    Économisez ${product.prixOriginal - product.prix} DA
                                </span>
                                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                                    -${Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                                </span>
                            </div>
                        ` : `
                            <div class="text-4xl font-bold text-emerald-700">${product.prix} DA</div>
                        `}
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p class="text-gray-600 leading-relaxed">${product.description || 'Description non disponible'}</p>
                    </div>
                    
                    <!-- Stock and Shipping Info -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-boxes text-emerald-600"></i>
                                <div>
                                    <p class="text-sm text-gray-500">Stock disponible</p>
                                    <p class="font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
                                        ${product.stock > 0 ? `${product.stock} unités` : 'Rupture de stock'}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-truck text-emerald-600"></i>
                                <div>
                                    <p class="text-sm text-gray-500">Livraison</p>
                                    <p class="font-semibold text-emerald-600">
                                        ${window.app?.getCartTotal() + product.prix >= 5000 ? 'Gratuite' : 'À partir de 200 DA'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Add to Cart Section -->
                    ${!isOutOfStock ? `
                        <div class="space-y-4 bg-emerald-50 rounded-lg p-6">
                            <div class="flex items-center space-x-4">
                                <label class="text-gray-700 font-medium">Quantité:</label>
                                <div class="flex items-center border-2 border-emerald-200 rounded-lg bg-white">
                                    <button onclick="decreaseQuantity()" 
                                            class="px-3 py-2 text-emerald-600 hover:bg-emerald-100 font-bold">-</button>
                                    <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                           class="w-20 text-center border-0 focus:ring-0 bg-transparent font-semibold">
                                    <button onclick="increaseQuantity()" 
                                            class="px-3 py-2 text-emerald-600 hover:bg-emerald-100 font-bold">+</button>
                                </div>
                                <span class="text-sm text-gray-500">Maximum: ${product.stock}</span>
                            </div>
                            
                            <div class="flex space-x-4">
                                <button onclick="addProductToCart('${product._id}')" 
                                        class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
                                    <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                                </button>
                                <button onclick="buyNow('${product._id}')" 
                                        class="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl transition-all shadow-lg font-bold">
                                    <i class="fas fa-bolt mr-2"></i>Acheter maintenant
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                                <div>
                                    <p class="text-red-800 font-medium text-lg">Produit temporairement indisponible</p>
                                    <p class="text-red-600 text-sm">Nous travaillons pour remettre ce produit en stock rapidement.</p>
                                </div>
                            </div>
                            <button onclick="notifyWhenAvailable('${product._id}')" 
                                    class="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all">
                                <i class="fas fa-bell mr-2"></i>Me notifier quand disponible
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Product Details Tabs -->
            ${this.renderProductTabs(product)}
            
            <!-- Related Products -->
            ${this.renderRelatedProducts(product)}
        </div>
    `;
    
    // Setup quantity controls
    this.setupQuantityControls(product.stock);
};

// Render product tabs
PharmacieGaherApp.prototype.renderProductTabs = function(product) {
    return `
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-200">
                <button onclick="switchTab('details')" id="detailsTab" 
                        class="tab-btn active px-6 py-4 font-semibold text-emerald-600 border-b-2 border-emerald-500">
                    Détails
                </button>
                ${product.ingredients ? `
                    <button onclick="switchTab('ingredients')" id="ingredientsTab" 
                            class="tab-btn px-6 py-4 font-semibold text-gray-600 hover:text-emerald-600">
                        Ingrédients
                    </button>
                ` : ''}
                ${product.modeEmploi ? `
                    <button onclick="switchTab('usage')" id="usageTab" 
                            class="tab-btn px-6 py-4 font-semibold text-gray-600 hover:text-emerald-600">
                        Mode d'emploi
                    </button>
                ` : ''}
                <button onclick="switchTab('reviews')" id="reviewsTab" 
                        class="tab-btn px-6 py-4 font-semibold text-gray-600 hover:text-emerald-600">
                    Avis (${product.statistiques?.nombreAvis || 0})
                </button>
            </div>
            
            <!-- Tab Content -->
            <div class="p-6">
                <div id="detailsContent" class="tab-content">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-3">Informations générales</h4>
                            <dl class="space-y-2">
                                <div class="flex justify-between">
                                    <dt class="text-gray-600">Catégorie:</dt>
                                    <dd class="font-medium">${product.categorie}</dd>
                                </div>
                                ${product.marque ? `
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Marque:</dt>
                                        <dd class="font-medium">${product.marque}</dd>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between">
                                    <dt class="text-gray-600">Référence:</dt>
                                    <dd class="font-medium">${product.reference || product._id}</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-600">Stock:</dt>
                                    <dd class="font-medium">${product.stock} unités</dd>
                                </div>
                            </dl>
                        </div>
                        ${product.contenance ? `
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-3">Contenance</h4>
                                <p class="text-gray-600">${product.contenance.valeur} ${product.contenance.unite}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${product.ingredients ? `
                    <div id="ingredientsContent" class="tab-content hidden">
                        <h4 class="font-semibold text-gray-900 mb-3">Composition</h4>
                        <p class="text-gray-600 leading-relaxed">${product.ingredients}</p>
                    </div>
                ` : ''}
                
                ${product.modeEmploi ? `
                    <div id="usageContent" class="tab-content hidden">
                        <h4 class="font-semibold text-gray-900 mb-3">Mode d'emploi</h4>
                        <p class="text-gray-600 leading-relaxed">${product.modeEmploi}</p>
                        ${product.precautions ? `
                            <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h5 class="font-semibold text-yellow-800 mb-2">⚠️ Précautions d'usage</h5>
                                <p class="text-yellow-700 text-sm">${product.precautions}</p>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div id="reviewsContent" class="tab-content hidden">
                    <div class="text-center py-8">
                        <i class="fas fa-star text-4xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-600 mb-2">Aucun avis pour le moment</h4>
                        <p class="text-gray-500 mb-4">Soyez le premier à donner votre avis sur ce produit</p>
                        <button onclick="openReviewModal('${product._id}')" 
                                class="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all">
                            <i class="fas fa-edit mr-2"></i>Écrire un avis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Render related products
PharmacieGaherApp.prototype.renderRelatedProducts = function(product) {
    // Find related products (same category, exclude current product)
    const relatedProducts = this.allProducts
        .filter(p => p.categorie === product.categorie && p._id !== product._id && p.actif !== false)
        .slice(0, 4);
    
    if (relatedProducts.length === 0) return '';
    
    return `
        <div class="mt-12">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Produits similaires</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${relatedProducts.map(p => this.createEnhancedProductCard(p)).join('')}
            </div>
        </div>
    `;
};

// Setup quantity controls
PharmacieGaherApp.prototype.setupQuantityControls = function(maxStock) {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value < 1) this.value = 1;
            if (value > maxStock) this.value = maxStock;
        });
    }
};

// Global filter functions with enhanced functionality
function applyProductFilters() {
    const params = {
        categorie: document.getElementById('categoryFilter')?.value || '',
        search: document.getElementById('productSearch')?.value || '',
        marque: document.getElementById('brandFilter')?.value || '',
        priceMin: document.getElementById('priceMin')?.value || '',
        priceMax: document.getElementById('priceMax')?.value || '',
        sort: document.getElementById('sortSelect')?.value || 'newest',
        enPromotion: document.getElementById('promotionFilter')?.checked || false,
        enVedette: document.getElementById('featuredFilter')?.checked || false,
        disponible: document.getElementById('disponibleFilter')?.checked || false
    };
    
    // Remove empty params
    Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === false) {
            delete params[key];
        }
    });
    
    if (window.app) {
        window.app.showPage('products', params);
    }
}

function clearAllProductFilters() {
    ['categoryFilter', 'brandFilter', 'productSearch', 'priceMin', 'priceMax'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'newest';
    
    ['promotionFilter', 'featuredFilter', 'disponibleFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = false;
    });
    
    if (window.app) {
        window.app.showPage('products');
    }
}

function clearProductSearch() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.value = '';
        applyProductFilters();
    }
}

// Product detail page functions
function increaseQuantity() {
    const input = document.getElementById('productQuantity');
    if (input) {
        const current = parseInt(input.value);
        const max = parseInt(input.max);
        if (current < max) {
            input.value = current + 1;
        }
    }
}

function decreaseQuantity() {
    const input = document.getElementById('productQuantity');
    if (input) {
        const current = parseInt(input.value);
        if (current > 1) {
            input.value = current - 1;
        }
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (window.app) {
        window.app.addToCart(productId, quantity);
    }
}

function buyNow(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (window.app) {
        // Clear cart and add this product only
        window.app.clearCart();
        window.app.addToCart(productId, quantity);
        
        // Go directly to checkout
        setTimeout(() => {
            window.app.showPage('checkout');
        }, 500);
    }
}

// Additional utility functions
function toggleViewMode(mode) {
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const productsGrid = document.getElementById('productsGrid');
    
    if (mode === 'grid') {
        gridBtn.classList.add('bg-emerald-500', 'text-white');
        gridBtn.classList.remove('bg-gray-200', 'text-gray-600');
        listBtn.classList.add('bg-gray-200', 'text-gray-600');
        listBtn.classList.remove('bg-emerald-500', 'text-white');
        
        productsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
    } else {
        listBtn.classList.add('bg-emerald-500', 'text-white');
        listBtn.classList.remove('bg-gray-200', 'text-gray-600');
        gridBtn.classList.add('bg-gray-200', 'text-gray-600');
        gridBtn.classList.remove('bg-emerald-500', 'text-white');
        
        productsGrid.className = 'grid grid-cols-1 gap-4';
    }
}

function loadMoreProducts() {
    const hiddenProducts = document.querySelectorAll('.hidden-product');
    const showCount = 12;
    
    hiddenProducts.forEach((product, index) => {
        if (index < showCount) {
            product.style.display = 'block';
            product.classList.remove('hidden-product');
        }
    });
    
    // Hide button if no more products
    if (hiddenProducts.length <= showCount) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-emerald-600', 'border-emerald-500');
        btn.classList.add('text-gray-600');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName + 'Content');
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Activate selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active', 'text-emerald-600', 'border-b-2', 'border-emerald-500');
        selectedTab.classList.remove('text-gray-600');
    }
}

// Export functions
window.applyProductFilters = applyProductFilters;
window.clearAllProductFilters = clearAllProductFilters;
window.clearProductSearch = clearProductSearch;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addProductToCart = addProductToCart;
window.buyNow = buyNow;
window.toggleViewMode = toggleViewMode;
window.loadMoreProducts = loadMoreProducts;
window.switchTab = switchTab;

console.log('✅ Enhanced Products.js loaded successfully');
