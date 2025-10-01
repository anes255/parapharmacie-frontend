// ==========================================
// 🌿 Product Management - Enhanced
// ==========================================

/**
 * Load products page with filters and search
 */
async function loadProductsPage(params = {}) {
    const { categorie, search } = params;
    
    try {
        log('Loading products page', params);
        
        // Show loading state
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Nos Produits</h1>
                    ${categorie ? `<p class="text-xl text-emerald-600">Catégorie: ${categorie}</p>` : ''}
                    ${search ? `<p class="text-xl text-emerald-600">Recherche: "${search}"</p>` : ''}
                </div>
                
                <!-- Filters -->
                <div class="mb-8 bg-white rounded-2xl shadow-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Catégorie</label>
                            <select id="filterCategorie" class="form-select" onchange="applyFilters()">
                                <option value="">Toutes les catégories</option>
                                ${CONFIG.CATEGORIES.map(cat => 
                                    `<option value="${cat.nom}" ${cat.nom === categorie ? 'selected' : ''}>${cat.nom}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Trier par</label>
                            <select id="filterSort" class="form-select" onchange="applyFilters()">
                                <option value="nom-asc">Nom (A-Z)</option>
                                <option value="nom-desc">Nom (Z-A)</option>
                                <option value="prix-asc">Prix (croissant)</option>
                                <option value="prix-desc">Prix (décroissant)</option>
                                <option value="nouveau">Plus récents</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-emerald-700 mb-2">Disponibilité</label>
                            <select id="filterStock" class="form-select" onchange="applyFilters()">
                                <option value="all">Tous les produits</option>
                                <option value="instock">En stock uniquement</option>
                                <option value="promotion">En promotion</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${Array(8).fill(0).map(() => `
                        <div class="loading-skeleton h-96 rounded-2xl"></div>
                    `).join('')}
                </div>
                
                <!-- Pagination -->
                <div id="productsPagination" class="mt-12"></div>
            </div>
        `;
        
        // Load products
        await loadProducts({ categorie, search });
        
    } catch (error) {
        console.error('Error loading products page:', error);
        window.app.showToast('Erreur de chargement des produits', 'error');
    }
}

/**
 * Load products from cache or API
 */
async function loadProducts(filters = {}) {
    try {
        log('Loading products with filters', filters);
        
        let products = [...window.app.allProducts];
        
        // Apply category filter
        if (filters.categorie) {
            products = products.filter(p => p.categorie === filters.categorie);
        }
        
        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter(p => 
                p.nom.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower)) ||
                (p.marque && p.marque.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply stock filter
        const stockFilter = document.getElementById('filterStock')?.value || 'all';
        if (stockFilter === 'instock') {
            products = products.filter(p => p.stock > 0);
        } else if (stockFilter === 'promotion') {
            products = products.filter(p => p.enPromotion);
        }
        
        // Apply sorting
        const sortBy = document.getElementById('filterSort')?.value || 'nom-asc';
        products = sortProducts(products, sortBy);
        
        // Filter out inactive products
        products = products.filter(p => p.actif !== false);
        
        // Display products
        displayProducts(products);
        
        log(`Displayed ${products.length} products`);
        
    } catch (error) {
        console.error('Error loading products:', error);
        throw error;
    }
}

/**
 * Sort products
 */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'nom-asc':
            return sorted.sort((a, b) => a.nom.localeCompare(b.nom));
        case 'nom-desc':
            return sorted.sort((a, b) => b.nom.localeCompare(a.nom));
        case 'prix-asc':
            return sorted.sort((a, b) => a.prix - b.prix);
        case 'prix-desc':
            return sorted.sort((a, b) => b.prix - a.prix);
        case 'nouveau':
            return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        default:
            return sorted;
    }
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-search text-7xl text-emerald-200 mb-6"></i>
                <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                <p class="text-emerald-600 mb-8">Essayez de modifier vos filtres ou votre recherche</p>
                <button onclick="window.app.showPage('home')" class="btn-primary">
                    <i class="fas fa-home mr-2"></i>Retour à l'accueil
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => window.app.createProductCard(product)).join('');
}

/**
 * Apply filters
 */
function applyFilters() {
    const categorie = document.getElementById('filterCategorie')?.value || '';
    const search = new URLSearchParams(window.location.search).get('search') || '';
    
    loadProducts({ categorie, search });
}

/**
 * Load individual product page
 */
async function loadProductPage(productId) {
    try {
        log('Loading product page', productId);
        
        // Find product in cache
        const product = window.app.allProducts.find(p => p._id === productId);
        
        if (!product) {
            throw new Error('Produit non trouvé');
        }
        
        const mainContent = document.getElementById('mainContent');
        
        const hasPromotion = product.enPromotion && product.prixOriginal;
        const isOutOfStock = product.stock === 0;
        
        // Generate image URL
        let imageUrl;
        if (product.image && product.image.startsWith('http')) {
            imageUrl = product.image;
        } else if (product.image && product.image.startsWith('data:image')) {
            imageUrl = product.image;
        } else {
            imageUrl = generatePlaceholderImage(product.nom, product.categorie);
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Breadcrumb -->
                <nav class="mb-8 text-sm">
                    <ol class="flex items-center space-x-2 text-emerald-600">
                        <li><a href="#" onclick="window.app.showPage('home')" class="hover:text-emerald-800">Accueil</a></li>
                        <li><i class="fas fa-chevron-right text-xs"></i></li>
                        <li><a href="#" onclick="window.app.showPage('products')" class="hover:text-emerald-800">Produits</a></li>
                        <li><i class="fas fa-chevron-right text-xs"></i></li>
                        <li><a href="#" onclick="window.app.filterByCategory('${product.categorie}')" class="hover:text-emerald-800">${product.categorie}</a></li>
                        <li><i class="fas fa-chevron-right text-xs"></i></li>
                        <li class="text-emerald-800 font-semibold">${product.nom}</li>
                    </ol>
                </nav>
                
                <!-- Product Details -->
                <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Product Image -->
                        <div class="relative bg-gradient-to-br from-emerald-50 to-green-100 p-8">
                            ${hasPromotion ? `
                                <div class="badge-promotion absolute top-6 left-6 z-10">
                                    -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                                </div>
                            ` : ''}
                            ${isOutOfStock ? `
                                <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                    <span class="text-white font-bold text-2xl">Rupture de stock</span>
                                </div>
                            ` : ''}
                            <img src="${imageUrl}" alt="${product.nom}" 
                                 class="w-full h-auto rounded-2xl shadow-xl"
                                 onerror="this.src='${generatePlaceholderImage(product.nom, product.categorie)}'">
                        </div>
                        
                        <!-- Product Info -->
                        <div class="p-8 lg:p-12">
                            <div class="mb-6">
                                <span class="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                                    <i class="fas ${CONFIG.CATEGORIES.find(c => c.nom === product.categorie)?.icon || 'fa-tag'} mr-2"></i>
                                    ${product.categorie}
                                </span>
                                <h1 class="text-4xl font-bold text-emerald-900 mb-4">${product.nom}</h1>
                                ${product.marque ? `<p class="text-lg text-emerald-600 font-medium mb-2">${product.marque}</p>` : ''}
                            </div>
                            
                            <!-- Price -->
                            <div class="mb-8">
                                <div class="flex items-baseline gap-4 mb-2">
                                    ${hasPromotion ? `
                                        <span class="text-3xl font-bold text-red-600">${formatPrice(product.prix)}</span>
                                        <span class="text-xl text-gray-400 line-through">${formatPrice(product.prixOriginal)}</span>
                                        <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                                            -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                                        </span>
                                    ` : `
                                        <span class="text-4xl font-bold text-emerald-700">${formatPrice(product.prix)}</span>
                                    `}
                                </div>
                                <p class="text-sm text-gray-500">Prix TTC</p>
                            </div>
                            
                            <!-- Description -->
                            ${product.description ? `
                                <div class="mb-8">
                                    <h3 class="text-lg font-bold text-emerald-800 mb-3">Description</h3>
                                    <p class="text-gray-700 leading-relaxed">${product.description}</p>
                                </div>
                            ` : ''}
                            
                            <!-- Stock Info -->
                            <div class="mb-8 p-4 bg-emerald-50 rounded-xl">
                                <div class="flex items-center justify-between">
                                    <span class="text-emerald-700 font-semibold">
                                        <i class="fas fa-box mr-2"></i>Stock disponible
                                    </span>
                                    <span class="font-bold ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}">
                                        ${isOutOfStock ? 'Rupture de stock' : `${product.stock} unités`}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Add to Cart -->
                            ${!isOutOfStock ? `
                                <div class="space-y-4">
                                    <div class="flex items-center space-x-4">
                                        <label class="font-semibold text-emerald-800">Quantité:</label>
                                        <div class="quantity-selector flex-shrink-0">
                                            <button onclick="adjustQuantity(-1)">-</button>
                                            <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" readonly>
                                            <button onclick="adjustQuantity(1)">+</button>
                                        </div>
                                    </div>
                                    
                                    <button onclick="addProductToCart('${product._id}')" 
                                            class="w-full btn-primary text-lg py-4">
                                        <i class="fas fa-shopping-cart mr-3"></i>
                                        Ajouter au panier
                                    </button>
                                </div>
                            ` : `
                                <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                    <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
                                    <p class="text-red-700 font-semibold">Ce produit est actuellement en rupture de stock</p>
                                </div>
                            `}
                            
                            <!-- Additional Info -->
                            <div class="mt-8 space-y-3 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-truck text-emerald-500 w-6"></i>
                                    <span>Livraison rapide partout en Algérie</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-shield-alt text-emerald-500 w-6"></i>
                                    <span>Paiement sécurisé à la livraison</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-emerald-500 w-6"></i>
                                    <span>Service client disponible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Related Products -->
                <div class="mt-16">
                    <h2 class="text-3xl font-bold text-emerald-800 mb-8">Produits similaires</h2>
                    <div id="relatedProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Related products will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Load related products
        loadRelatedProducts(product);
        
    } catch (error) {
        console.error('Error loading product page:', error);
        window.app.showToast('Erreur de chargement du produit', 'error');
        window.app.showPage('products');
    }
}

/**
 * Load related products
 */
function loadRelatedProducts(currentProduct) {
    const relatedProducts = window.app.allProducts
        .filter(p => 
            p._id !== currentProduct._id && 
            p.categorie === currentProduct.categorie &&
            p.actif !== false &&
            p.stock > 0
        )
        .slice(0, 4);
    
    const container = document.getElementById('relatedProducts');
    if (container) {
        if (relatedProducts.length > 0) {
            container.innerHTML = relatedProducts.map(p => window.app.createProductCard(p)).join('');
        } else {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Aucun produit similaire disponible</p>
                </div>
            `;
        }
    }
}

/**
 * Adjust product quantity
 */
function adjustQuantity(change) {
    const input = document.getElementById('productQuantity');
    if (!input) return;
    
    const current = parseInt(input.value);
    const max = parseInt(input.max);
    const newValue = Math.max(1, Math.min(max, current + change));
    
    input.value = newValue;
}

/**
 * Add product to cart from product page
 */
function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (window.app) {
        window.app.addToCart(productId, quantity);
    }
}

console.log('✅ Products.js loaded successfully');
