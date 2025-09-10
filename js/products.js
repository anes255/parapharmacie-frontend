// Complete products.js with all categories including the new ones

// Page des produits avec gestion d'images améliorée
PharmacieGaherApp.prototype.loadProductsPage = async function(params = {}) {
    console.log('Loading products page with params:', params);
    
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <!-- Header et filtres -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-emerald-800 mb-2">
                            ${params.categorie ? `Catégorie: ${params.categorie}` : 'Nos Produits'}
                        </h1>
                        <p class="text-emerald-600">
                            Découvrez notre large gamme de produits de santé et beauté
                        </p>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4">
                        <!-- Recherche -->
                        <div class="relative">
                            <input type="text" id="productSearch" placeholder="Rechercher un produit..."
                                   value="${params.search || ''}"
                                   class="pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all w-64">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400"></i>
                        </div>
                        
                        <!-- Tri -->
                        <select id="sortSelect" class="px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all">
                            <option value="newest">Plus récents</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="name_asc">Nom A-Z</option>
                            <option value="name_desc">Nom Z-A</option>
                        </select>
                    </div>
                </div>
                
                <!-- Filtres avancés -->
                <div class="mt-6 border-t border-emerald-200 pt-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <!-- Catégories -->
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Catégorie</label>
                            <select id="categoryFilter" class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800">
                                <option value="">Toutes les catégories</option>
                                <option value="Vitalité" ${params.categorie === 'Vitalité' ? 'selected' : ''}>Vitalité</option>
                                <option value="Cheveux" ${params.categorie === 'Cheveux' ? 'selected' : ''}>Cheveux</option>
                                <option value="Visage" ${params.categorie === 'Visage' ? 'selected' : ''}>Visage</option>
                                <option value="Intime" ${params.categorie === 'Intime' ? 'selected' : ''}>Intime</option>
                                <option value="Solaire" ${params.categorie === 'Solaire' ? 'selected' : ''}>Solaire</option>
                                <option value="Maman" ${params.categorie === 'Maman' ? 'selected' : ''}>Maman</option>
                                <option value="Minceur" ${params.categorie === 'Minceur' ? 'selected' : ''}>Minceur</option>
                                <option value="Sport" ${params.categorie === 'Sport' ? 'selected' : ''}>Sport</option>
                                <option value="Bébé" ${params.categorie === 'Bébé' ? 'selected' : ''}>Bébé</option>
                                <option value="Homme" ${params.categorie === 'Homme' ? 'selected' : ''}>Homme</option>
                                <option value="Dentaire" ${params.categorie === 'Dentaire' ? 'selected' : ''}>Dentaire</option>
                                <option value="Soins" ${params.categorie === 'Soins' ? 'selected' : ''}>Soins</option>
                            </select>
                        </div>
                        
                        <!-- Prix minimum -->
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Prix min (DA)</label>
                            <input type="number" id="priceMin" class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" min="0" placeholder="0">
                        </div>
                        
                        <!-- Prix maximum -->
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Prix max (DA)</label>
                            <input type="number" id="priceMax" class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" min="0" placeholder="10000">
                        </div>
                        
                        <!-- Options -->
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Options</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" id="promotionFilter" class="rounded text-emerald-600 mr-2 w-4 h-4">
                                    <span class="text-sm text-emerald-700">En promotion</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="featuredFilter" class="rounded text-emerald-600 mr-2 w-4 h-4">
                                    <span class="text-sm text-emerald-700">En vedette</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        <button onclick="applyFilters()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            <i class="fas fa-filter mr-2"></i>Appliquer les filtres
                        </button>
                        <button onclick="clearFilters()" class="bg-white text-emerald-600 border-2 border-emerald-200 font-semibold py-3 px-6 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                            <i class="fas fa-times mr-2"></i>Effacer
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Résultats -->
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <p id="resultsInfo" class="text-emerald-600 font-medium">Chargement des produits...</p>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-emerald-500">Affichage:</span>
                        <button onclick="toggleView('grid')" id="gridViewBtn" class="p-2 text-white bg-emerald-500 border border-emerald-500 rounded-lg">
                            <i class="fas fa-th-large"></i>
                        </button>
                        <button onclick="toggleView('list')" id="listViewBtn" class="p-2 text-emerald-400 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Grille de produits -->
            <div id="productsContainer">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="productsGrid">
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-spinner fa-spin text-4xl text-emerald-400 mb-4"></i>
                        <p class="text-emerald-600">Chargement des produits...</p>
                    </div>
                </div>
            </div>
            
            <!-- Pagination -->
            <div id="paginationContainer" class="mt-12 flex justify-center">
                <!-- La pagination sera chargée ici -->
            </div>
        </div>
    `;
    
    // Initialiser les événements
    this.initProductsPageEvents(params);
    
    // Charger les produits
    await this.runProductsLoad(params);
};

// Fixed product loading - ALWAYS try API first
PharmacieGaherApp.prototype.runProductsLoad = async function(params = {}) {
    try {
        console.log('🔄 Loading products from API first...');
        await this.loadProductsFromBackend(params);
    } catch (error) {
        console.log('⚠️ API failed, using localStorage as fallback');
        await this.loadDemoProducts(params);
    }
};

// Fixed API loading with better error handling
PharmacieGaherApp.prototype.loadProductsFromBackend = async function(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.categorie) urlParams.append('categorie', params.categorie);
    if (params.search) urlParams.append('search', params.search);
    if (params.sort) urlParams.append('sort', params.sort);
    if (params.priceMin) urlParams.append('priceMin', params.priceMin);
    if (params.priceMax) urlParams.append('priceMax', params.priceMax);
    if (params.enPromotion) urlParams.append('enPromotion', 'true');
    if (params.enVedette) urlParams.append('enVedette', 'true');
    if (params.page) urlParams.append('page', params.page);
    
    try {
        console.log('🌐 Fetching from API:', `https://parapharmacie-gaher.onrender.com/api/products?${urlParams.toString()}`);
        const data = await apiCall(`/products?${urlParams.toString()}`);
        
        if (data && data.products) {
            console.log('✅ API products loaded:', data.products.length);
            // Update localStorage with fresh API data
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
            this.displayProducts(data.products || [], data.pagination);
        } else {
            throw new Error('No products data from API');
        }
    } catch (error) {
        console.error('❌ API call failed:', error);
        throw error; // Re-throw to trigger fallback
    }
};

// Fixed demo products - don't auto-initialize
PharmacieGaherApp.prototype.loadDemoProducts = async function(params = {}) {
    console.log('📦 Loading from localStorage...');
    
    // Get products from localStorage (don't auto-create if empty)
    let allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    
    if (allProducts.length === 0) {
        console.log('📭 No products in localStorage');
        this.displayProducts([], null, true);
        return;
    }
    
    // Apply filters
    let filteredProducts = allProducts.filter(product => {
        if (params.categorie && product.categorie !== params.categorie) return false;
        if (params.search && !product.nom.toLowerCase().includes(params.search.toLowerCase())) return false;
        if (params.priceMin && product.prix < parseFloat(params.priceMin)) return false;
        if (params.priceMax && product.prix > parseFloat(params.priceMax)) return false;
        if (params.enPromotion && !product.enPromotion) return false;
        if (params.enVedette && !product.enVedette) return false;
        return true;
    });
    
    // Apply sorting
    if (params.sort === 'price_asc') {
        filteredProducts.sort((a, b) => a.prix - b.prix);
    } else if (params.sort === 'price_desc') {
        filteredProducts.sort((a, b) => b.prix - a.prix);
    } else if (params.sort === 'name_asc') {
        filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (params.sort === 'name_desc') {
        filteredProducts.sort((a, b) => b.nom.localeCompare(a.nom));
    }
    
    console.log('📦 Filtered products:', filteredProducts.length);
    this.displayProducts(filteredProducts, null, true);
};

// Afficher les produits avec des images fonctionnelles
PharmacieGaherApp.prototype.displayProducts = function(products, pagination = null, isDemoMode = false) {
    const resultsInfo = document.getElementById('resultsInfo');
    const productsGrid = document.getElementById('productsGrid');
    
    if (resultsInfo) {
        resultsInfo.textContent = `${products.length} produits trouvés${isDemoMode ? ' (mode démo)' : ''}`;
    }
    
    if (productsGrid) {
        if (products.length === 0) {
            productsGrid.innerHTML = this.getNoProductsHTML();
        } else {
            productsGrid.innerHTML = products.map(product => this.createProductCard(product)).join('');
        }
    }
    
    if (pagination && !isDemoMode) {
        this.updatePagination(pagination);
    } else {
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    }
};

// Créer une carte produit avec images fonctionnelles
PharmacieGaherApp.prototype.createProductCard = function(product) {
    const isOutOfStock = product.stock === 0;
    const hasPromotion = product.enPromotion && product.prixOriginal;
    
    // Générer une image de placeholder avec les initiales du produit et couleur de catégorie
    const getCategoryColor = (category) => {
        const colors = {
            'Vitalité': '10b981',  // emerald-500
            'Cheveux': 'f59e0b',   // amber-500  
            'Visage': 'ec4899',    // pink-500
            'Intime': 'ef4444',    // red-500
            'Solaire': 'f97316',   // orange-500
            'Bébé': '06b6d4',      // cyan-500
            'Maman': 'd946ef',     // fuchsia-500
            'Minceur': '8b5cf6',   // violet-500
            'Homme': '3b82f6',     // blue-500
            'Soins': '22c55e',     // green-500
            'Dentaire': '6366f1',  // indigo-500
            'Sport': 'f43f5e'      // rose-500
        };
        return colors[category] || '10b981';
    };
    
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const categoryColor = getCategoryColor(product.categorie);
    const imageUrl = product.image || `https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    
    return `
        <div class="product-card bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer relative border border-emerald-200/50 hover:border-emerald-400/60 hover:shadow-2xl transform hover:scale-[1.02] ${isOutOfStock ? 'opacity-75' : ''}"
             onclick="app.showPage('product', {id: '${product._id}'})">
            ${hasPromotion ? `<div class="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">-${product.pourcentagePromotion}%</div>` : ''}
            ${product.enVedette ? `<div class="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">★ VEDETTE</div>` : ''}
            ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                <span class="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">Rupture de stock</span>
            </div>` : ''}
            
            <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden relative">
                <img src="${imageUrl}" 
                     alt="${product.nom}" 
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}'">
                <div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700">
                    ${product.categorie}
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-3">
                    <h3 class="font-bold text-emerald-800 mb-2 text-lg line-clamp-2 leading-tight">${product.nom}</h3>
                    <p class="text-sm text-emerald-600 mb-2 line-clamp-2">${product.description || ''}</p>
                    ${product.marque ? `<p class="text-xs text-emerald-500 font-medium">${product.marque}</p>` : ''}
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex flex-col">
                        ${hasPromotion ? `
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>
                                <span class="text-lg font-bold text-red-600">${product.prix} DA</span>
                            </div>
                        ` : `
                            <span class="text-xl font-bold text-emerald-700">${product.prix} DA</span>
                        `}
                    </div>
                    
                    ${!isOutOfStock ? `
                        <button onclick="event.stopPropagation(); app.addToCart('${product._id}')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    ` : `
                        <span class="bg-gray-300 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium">
                            Indisponible
                        </span>
                    `}
                </div>
                
                <div class="flex items-center justify-between text-sm border-t border-emerald-100 pt-3">
                    <span class="text-emerald-600 font-medium">
                        Stock: <span class="${product.stock === 0 ? 'text-red-600 font-bold' : product.stock < 10 ? 'text-orange-600 font-semibold' : 'text-emerald-600'}">${product.stock}</span>
                    </span>
                    ${product.enVedette ? '<span class="text-yellow-600 font-semibold text-xs">⭐ EN VEDETTE</span>' : ''}
                </div>
            </div>
        </div>
    `;
};

// Page de détail produit
PharmacieGaherApp.prototype.loadProductPage = async function(productId) {
    try {
        let product = null;
        
        // Essayer de charger depuis localStorage
        const allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        product = allProducts.find(p => p._id === productId);
        
        // Essayer de charger depuis l'API si non trouvé localement
        if (!product) {
            try {
                const response = await fetch(buildApiUrl(`/products/${productId}`));
                if (response.ok) {
                    product = await response.json();
                }
            } catch (error) {
                console.log('API unavailable, product not found');
            }
        }
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }
        
        // Générer l'image du produit
        const getCategoryColor = (category) => {
            const colors = {
                'Vitalité': '10b981', 'Cheveux': 'f59e0b', 'Visage': 'ec4899',
                'Intime': 'ef4444', 'Solaire': 'f97316', 'Bébé': '06b6d4',
                'Maman': 'd946ef', 'Minceur': '8b5cf6', 'Homme': '3b82f6',
                'Soins': '22c55e', 'Dentaire': '6366f1', 'Sport': 'f43f5e'
            };
            return colors[category] || '10b981';
        };
        
        const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const categoryColor = getCategoryColor(product.categorie);
        const imageUrl = product.image || `https://via.placeholder.com/400x400/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <!-- Breadcrumb -->
                <div class="flex items-center space-x-2 text-sm mb-8">
                    <a href="#" onclick="app.showPage('home')" class="text-emerald-600 hover:text-emerald-800 transition-colors">Accueil</a>
                    <i class="fas fa-chevron-right text-emerald-400"></i>
                    <a href="#" onclick="app.showPage('products')" class="text-emerald-600 hover:text-emerald-800 transition-colors">Produits</a>
                    <i class="fas fa-chevron-right text-emerald-400"></i>
                    <a href="#" onclick="app.filterByCategory('${product.categorie}')" class="text-emerald-600 hover:text-emerald-800 transition-colors">${product.categorie}</a>
                    <i class="fas fa-chevron-right text-emerald-400"></i>
                    <span class="text-emerald-700 font-medium">${product.nom}</span>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Images du produit -->
                    <div class="space-y-4">
                        <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden border-2 border-emerald-200/50">
                            <img src="${imageUrl}" alt="${product.nom}" 
                                 class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                 id="mainProductImage">
                        </div>
                        
                        ${product.enVedette ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <div class="flex items-center justify-center space-x-2">
                                <i class="fas fa-star text-yellow-500"></i>
                                <span class="text-yellow-800 font-semibold">Produit en vedette</span>
                                <i class="fas fa-star text-yellow-500"></i>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${product.enPromotion ? `
                        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <div class="flex items-center justify-center space-x-2">
                                <i class="fas fa-tags text-red-500"></i>
                                <span class="text-red-800 font-semibold">Économisez ${product.pourcentagePromotion}% (${product.prixOriginal - product.prix} DA)</span>
                                <i class="fas fa-tags text-red-500"></i>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Informations du produit -->
                    <div class="space-y-6">
                        <div>
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">${product.nom}</h1>
                                    <p class="text-emerald-600 font-medium">${product.marque || 'Shifa'}</p>
                                </div>
                                <div class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    ${product.categorie}
                                </div>
                            </div>
                            
                            <!-- Prix -->
                            <div class="mb-6">
                                ${product.enPromotion && product.prixOriginal ? `
                                    <div class="flex items-center space-x-4 mb-2">
                                        <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                        <span class="text-4xl font-bold text-red-600">${product.prix} DA</span>
                                        <span class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                            -${product.pourcentagePromotion}%
                                        </span>
                                    </div>
                                    <p class="text-green-600 font-medium">
                                        Vous économisez ${product.prixOriginal - product.prix} DA !
                                    </p>
                                ` : `
                                    <span class="text-4xl font-bold text-emerald-600">${product.prix} DA</span>
                                `}
                            </div>
                            
                            <!-- Disponibilité -->
                            <div class="mb-6 p-4 rounded-xl ${product.stock > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                                <div class="flex items-center space-x-3">
                                    <i class="fas ${product.stock > 0 ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'}"></i>
                                    <div>
                                        <p class="font-semibold ${product.stock > 0 ? 'text-green-800' : 'text-red-800'}">
                                            ${product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                                        </p>
                                        <p class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                                            ${product.stock > 0 ? `${product.stock} unités disponibles` : 'Produit temporairement indisponible'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                            <h3 class="text-lg font-semibold text-emerald-800 mb-3">Description</h3>
                            <p class="text-emerald-700 leading-relaxed">${product.description}</p>
                        </div>
                        
                        <!-- Actions d'achat -->
                        ${product.stock > 0 ? `
                        <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                            <div class="flex items-center space-x-4 mb-4">
                                <label class="text-emerald-700 font-semibold">Quantité :</label>
                                <div class="flex items-center border-2 border-emerald-200 rounded-xl bg-white">
                                    <button onclick="updateQuantity(-1)" class="px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-l-xl transition-all">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                           class="w-16 text-center py-2 border-0 focus:ring-0">
                                    <button onclick="updateQuantity(1)" class="px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-r-xl transition-all">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <button onclick="addToCartFromDetail()" 
                                    class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
                                <i class="fas fa-cart-plus mr-2"></i>
                                Ajouter au panier
                            </button>
                        </div>
                        ` : `
                        <div class="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
                            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
                            <p class="text-red-800 font-semibold mb-2">Produit indisponible</p>
                            <p class="text-red-600">Ce produit est temporairement en rupture de stock.</p>
                        </div>
                        `}
                    </div>
                </div>
                
                <!-- Informations détaillées -->
                <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${product.ingredients ? `
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                            <i class="fas fa-leaf mr-2"></i>Ingrédients
                        </h3>
                        <p class="text-emerald-700">${product.ingredients}</p>
                    </div>
                    ` : ''}
                    
                    ${product.modeEmploi ? `
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                            <i class="fas fa-info-circle mr-2"></i>Mode d'emploi
                        </h3>
                        <p class="text-emerald-700">${product.modeEmploi}</p>
                    </div>
                    ` : ''}
                    
                    ${product.precautions ? `
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Précautions
                        </h3>
                        <p class="text-emerald-700">${product.precautions}</p>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Produits similaires -->
                <div class="mt-16">
                    <h2 class="text-2xl font-bold text-emerald-800 mb-8 text-center">Produits similaires</h2>
                    <div id="similarProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="col-span-full text-center py-8">
                            <i class="fas fa-spinner fa-spin text-2xl text-emerald-400 mb-4"></i>
                            <p class="text-emerald-600">Chargement des produits similaires...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                window.currentProduct = ${JSON.stringify(product)};
                
                function updateQuantity(change) {
                    const input = document.getElementById('productQuantity');
                    let newValue = parseInt(input.value) + change;
                    if (newValue < 1) newValue = 1;
                    if (newValue > ${product.stock}) newValue = ${product.stock};
                    input.value = newValue;
                }
                
                function addToCartFromDetail() {
                    const quantity = parseInt(document.getElementById('productQuantity').value);
                    app.addToCart('${product._id}', quantity);
                }
            </script>
        `;
        
        // Charger les produits similaires
        this.loadSimilarProducts(product.categorie, product._id);
        
    } catch (error) {
        console.error('Erreur chargement produit:', error);
        this.showToast('Erreur lors du chargement du produit', 'error');
        this.showPage('products');
    }
};

// Charger les produits similaires
PharmacieGaherApp.prototype.loadSimilarProducts = async function(category, excludeId) {
    try {
        let similarProducts = [];
        
        // Get products from localStorage
        const allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        similarProducts = allProducts.filter(p => p.categorie === category && p._id !== excludeId).slice(0, 4);
        
        // Try API as fallback
        if (similarProducts.length === 0) {
            try {
                const response = await fetch(buildApiUrl(`/products?categorie=${category}&limit=4`));
                if (response.ok) {
                    const data = await response.json();
                    similarProducts = data.products.filter(p => p._id !== excludeId).slice(0, 4);
                }
            } catch (error) {
                console.log('API unavailable for similar products');
            }
        }
        
        const container = document.getElementById('similarProducts');
        if (container && similarProducts.length > 0) {
            container.innerHTML = similarProducts.map(product => this.createProductCard(product)).join('');
        } else if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-search text-4xl text-emerald-200 mb-4"></i>
                    <p class="text-emerald-600">Aucun produit similaire trouvé</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur chargement produits similaires:', error);
    }
};

// HTML pour aucun produit trouvé
PharmacieGaherApp.prototype.getNoProductsHTML = function() {
    return `
        <div class="col-span-full text-center py-16">
            <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
            <p class="text-emerald-600 mb-8 text-lg">Essayez de modifier vos critères de recherche</p>
            <button onclick="clearFilters()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <i class="fas fa-refresh mr-2"></i>Voir tous les produits
            </button>
        </div>
    `;
};

// Initialiser les événements de la page produits
PharmacieGaherApp.prototype.initProductsPageEvents = function(params) {
    const searchInput = document.getElementById('productSearch');
    const sortSelect = document.getElementById('sortSelect');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const promotionFilter = document.getElementById('promotionFilter');
    const featuredFilter = document.getElementById('featuredFilter');
    
    // Remplir les valeurs des filtres existants
    if (params.priceMin && priceMin) priceMin.value = params.priceMin;
    if (params.priceMax && priceMax) priceMax.value = params.priceMax;
    if (params.enPromotion && promotionFilter) promotionFilter.checked = true;
    if (params.enVedette && featuredFilter) featuredFilter.checked = true;
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                params.search = e.target.value;
                this.runProductsLoad(params);
            }, 500);
        });
    }
    
    if (sortSelect) {
        sortSelect.value = params.sort || 'newest';
        sortSelect.addEventListener('change', (e) => {
            params.sort = e.target.value;
            this.runProductsLoad(params);
        });
    }
    
    // Ajouter des événements pour les filtres de catégorie
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            params.categorie = e.target.value;
            this.runProductsLoad({...params, categorie: e.target.value});
        });
    }
};

// Mise à jour de la pagination
PharmacieGaherApp.prototype.updatePagination = function(pagination) {
    const container = document.getElementById('paginationContainer');
    if (!container || !pagination) return;
    
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex items-center space-x-2">';
    
    // Bouton précédent
    if (hasPrevPage) {
        paginationHTML += `
            <button onclick="loadProductPage(${currentPage - 1})" 
                    class="px-4 py-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <button class="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold">
                    ${i}
                </button>
            `;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button onclick="loadProductPage(${i})" 
                        class="px-4 py-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="px-2">...</span>';
        }
    }
    
    // Bouton suivant
    if (hasNextPage) {
        paginationHTML += `
            <button onclick="loadProductPage(${currentPage + 1})" 
                    class="px-4 py-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
};

// Fonctions globales
function applyFilters() {
    const params = {
        categorie: document.getElementById('categoryFilter')?.value || '',
        priceMin: document.getElementById('priceMin')?.value || '',
        priceMax: document.getElementById('priceMax')?.value || '',
        search: document.getElementById('productSearch')?.value || '',
        sort: document.getElementById('sortSelect')?.value || 'newest'
    };
    
    if (document.getElementById('promotionFilter')?.checked) {
        params.enPromotion = true;
    }
    
    if (document.getElementById('featuredFilter')?.checked) {
        params.enVedette = true;
    }
    
    if (window.app) {
        window.app.runProductsLoad(params);
    }
}

function clearFilters() {
    ['categoryFilter', 'priceMin', 'priceMax', 'productSearch'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'newest';
    
    ['promotionFilter', 'featuredFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = false;
    });
    
    if (window.app) {
        window.app.runProductsLoad({});
    }
}

function toggleView(viewType) {
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const productsGrid = document.getElementById('productsGrid');
    
    if (viewType === 'grid') {
        gridBtn.className = 'p-2 text-white bg-emerald-500 border border-emerald-500 rounded-lg';
        listBtn.className = 'p-2 text-emerald-400 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all';
        productsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    } else {
        listBtn.className = 'p-2 text-white bg-emerald-500 border border-emerald-500 rounded-lg';
        gridBtn.className = 'p-2 text-emerald-400 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all';
        productsGrid.className = 'grid grid-cols-1 gap-4';
        
        // Ajouter des styles spécifiques pour la vue liste
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.classList.add('flex', 'flex-row');
            const image = card.querySelector('.aspect-square');
            if (image) {
                image.classList.add('w-1/4');
                image.classList.remove('aspect-square');
            }
            const content = card.querySelector('.p-6');
            if (content) {
                content.classList.add('flex-1');
            }
        });
    }
}

function loadProductPage(page) {
    const params = {};
    const categoryFilter = document.getElementById('categoryFilter');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const searchInput = document.getElementById('productSearch');
    const sortSelect = document.getElementById('sortSelect');
    const promotionFilter = document.getElementById('promotionFilter');
    const featuredFilter = document.getElementById('featuredFilter');
    
    if (categoryFilter && categoryFilter.value) params.categorie = categoryFilter.value;
    if (priceMin && priceMin.value) params.priceMin = priceMin.value;
    if (priceMax && priceMax.value) params.priceMax = priceMax.value;
    if (searchInput && searchInput.value) params.search = searchInput.value;
    if (sortSelect && sortSelect.value) params.sort = sortSelect.value;
    if (promotionFilter && promotionFilter.checked) params.enPromotion = true;
    if (featuredFilter && featuredFilter.checked) params.enVedette = true;
    
    params.page = page;
    
    if (window.app) {
        window.app.runProductsLoad(params);
    }
}

// Global pour exposer les fonctions
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.toggleView = toggleView;

window.loadProductPage = loadProductPage;
