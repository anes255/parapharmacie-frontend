// Fixed PharmacieGaherApp Products functionality with createProductCard function
class PharmacieGaherApp {
    constructor() {
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.authToken = localStorage.getItem('authToken');
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        this.currentProductsFilter = null;
        this.currentSearchQuery = '';
        
        console.log('Products JS initialized');
    }

    // Load products page with proper error handling
    async loadProductsPage(params = {}) {
        try {
            console.log('📦 Loading products page with params:', params);
            
            const { 
                category = '', 
                search = '', 
                featured = false, 
                promotion = false,
                page = 1,
                limit = 20
            } = params;

            // Update internal state
            this.currentProductsFilter = params;
            this.currentSearchQuery = search;

            let filteredProducts = [];
            
            // Try to load from API first
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    ...(category && { categorie: category }),
                    ...(search && { search }),
                    ...(featured && { enVedette: 'true' }),
                    ...(promotion && { enPromotion: 'true' })
                });

                const response = await fetch(`${this.apiUrl}/api/products?${queryParams}`);
                if (response.ok) {
                    const data = await response.json();
                    filteredProducts = data.products || data;
                    
                    // Update local cache
                    if (!search && !category && !featured && !promotion) {
                        this.allProducts = filteredProducts;
                        localStorage.setItem('products', JSON.stringify(filteredProducts));
                    }
                    
                    console.log('✅ Products loaded from API:', filteredProducts.length);
                } else {
                    throw new Error('API not available');
                }
                
            } catch (apiError) {
                console.log('⚠️ API unavailable, using cached products');
                
                // Filter local products
                filteredProducts = this.allProducts.filter(product => {
                    if (!product.actif && product.actif !== undefined) return false;
                    if (category && product.categorie !== category) return false;
                    if (search && !product.nom.toLowerCase().includes(search.toLowerCase()) && 
                        !product.description.toLowerCase().includes(search.toLowerCase())) return false;
                    if (featured && !product.enVedette) return false;
                    if (promotion && !product.enPromotion) return false;
                    return true;
                });
            }

            // Build page title
            let pageTitle = 'Nos Produits';
            let pageSubtitle = 'Découvrez notre large gamme de produits parapharmaceutiques';
            
            if (category) {
                pageTitle = `Catégorie: ${category}`;
                pageSubtitle = `Produits dans la catégorie ${category}`;
            } else if (search) {
                pageTitle = `Recherche: "${search}"`;
                pageSubtitle = `${filteredProducts.length} produit(s) trouvé(s)`;
            } else if (featured) {
                pageTitle = 'Produits en Vedette';
                pageSubtitle = 'Nos produits les plus populaires';
            } else if (promotion) {
                pageTitle = 'Produits en Promotion';
                pageSubtitle = 'Profitez de nos offres spéciales';
            }

            // Get categories for filter
            const categories = [...new Set(this.allProducts.map(p => p.categorie).filter(Boolean))].sort();

            document.getElementById('main-content').innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <!-- Header Section -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">${pageTitle}</h1>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto">${pageSubtitle}</p>
                    </div>

                    <!-- Filters and Search -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div class="flex flex-col lg:flex-row gap-4 items-center">
                            <!-- Search Bar -->
                            <div class="flex-1 w-full lg:w-auto">
                                <div class="relative">
                                    <input type="text" id="product-search" placeholder="Rechercher un produit..." 
                                           value="${search}"
                                           class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>

                            <!-- Category Filter -->
                            <div class="w-full lg:w-auto">
                                <select id="category-filter" class="w-full lg:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="">Toutes les catégories</option>
                                    ${categories.map(cat => `
                                        <option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <!-- Filter Buttons -->
                            <div class="flex flex-wrap gap-2">
                                <button onclick="app.loadProductsPage({featured: true})" 
                                        class="px-4 py-2 rounded-lg transition-colors ${featured ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                    ⭐ Vedette
                                </button>
                                <button onclick="app.loadProductsPage({promotion: true})" 
                                        class="px-4 py-2 rounded-lg transition-colors ${promotion ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                    🏷️ Promotion
                                </button>
                                <button onclick="app.loadProductsPage()" 
                                        class="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                                    🔄 Tout afficher
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <div id="products-container">
                        ${filteredProducts.length === 0 ? `
                            <div class="text-center py-16">
                                <svg class="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                                <h3 class="text-2xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h3>
                                <p class="text-gray-600 mb-6">Aucun produit ne correspond à vos critères de recherche.</p>
                                <button onclick="app.loadProductsPage()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors">
                                    Voir tous les produits
                                </button>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                ${filteredProducts.map(product => this.createProductCard(product)).join('')}
                            </div>
                        `}
                    </div>

                    <!-- Load More Button (if needed) -->
                    ${filteredProducts.length >= limit ? `
                        <div class="text-center mt-12">
                            <button onclick="app.loadMoreProducts()" id="load-more-btn" 
                                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg transition-colors">
                                Charger plus de produits
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;

            // Add event listeners
            this.initProductsEventListeners();
            
            console.log('✅ Products page loaded successfully');

        } catch (error) {
            console.error('❌ Error loading products page:', error);
            document.getElementById('main-content').innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="text-center">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-8">
                            <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h2 class="text-2xl font-bold text-red-600 mb-2">Erreur de chargement</h2>
                            <p class="text-red-700 mb-4">Impossible de charger les produits: ${error.message}</p>
                            <button onclick="location.reload()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Create product card HTML - CRITICAL FUNCTION
    createProductCard(product) {
        if (!product) return '';
        
        const imageUrl = (product.images && product.images[0]) || 'https://via.placeholder.com/300x300?text=Produit';
        const hasPromotion = product.enPromotion && product.prixOriginal && product.prixOriginal > product.prix;
        const discountPercent = hasPromotion ? Math.round(((product.prixOriginal - product.prix) / product.prixOriginal) * 100) : 0;
        
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <!-- Product Image -->
                <div class="relative overflow-hidden">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                         onerror="this.src='https://via.placeholder.com/300x300?text=Image+non+disponible'">
                    
                    <!-- Badges -->
                    <div class="absolute top-3 left-3 flex flex-col space-y-1">
                        ${product.enVedette ? `
                            <span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                ⭐ Vedette
                            </span>
                        ` : ''}
                        ${hasPromotion ? `
                            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                -${discountPercent}%
                            </span>
                        ` : ''}
                        ${product.stock <= 5 && product.stock > 0 ? `
                            <span class="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                Stock limité
                            </span>
                        ` : ''}
                        ${product.stock === 0 ? `
                            <span class="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                Rupture
                            </span>
                        ` : ''}
                    </div>

                    <!-- Quick Actions -->
                    <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onclick="app.viewProductDetails('${product._id}')" 
                                class="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all">
                            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="p-4">
                    <div class="mb-2">
                        <span class="text-sm text-emerald-600 font-medium">${product.categorie || 'Santé'}</span>
                        ${product.marque ? `<span class="text-sm text-gray-500"> • ${product.marque}</span>` : ''}
                    </div>
                    
                    <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]" title="${product.nom}">
                        ${product.nom}
                    </h3>
                    
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                        ${product.description || 'Description non disponible'}
                    </p>

                    <!-- Price -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <span class="text-xl font-bold text-emerald-600">
                                ${parseFloat(product.prix).toFixed(2)}€
                            </span>
                            ${hasPromotion ? `
                                <span class="text-sm text-gray-500 line-through">
                                    ${parseFloat(product.prixOriginal).toFixed(2)}€
                                </span>
                            ` : ''}
                        </div>
                        ${product.stock !== undefined ? `
                            <span class="text-xs text-gray-500">
                                Stock: ${product.stock || 0}
                            </span>
                        ` : ''}
                    </div>

                    <!-- Add to Cart Button -->
                    <div class="flex items-center space-x-2">
                        ${product.stock > 0 || product.stock === undefined ? `
                            <div class="flex-1 flex items-center border border-gray-300 rounded-lg">
                                <button onclick="app.decreaseQuantity('${product._id}')" 
                                        class="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                    </svg>
                                </button>
                                <input type="number" id="qty-${product._id}" value="1" min="1" max="${product.stock || 99}" 
                                       class="flex-1 text-center py-2 border-0 focus:outline-none focus:ring-0" 
                                       style="max-width: 60px;">
                                <button onclick="app.increaseQuantity('${product._id}')" 
                                        class="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </button>
                            </div>
                            <button onclick="app.addToCart('${product._id}')" 
                                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"></path>
                                </svg>
                                <span class="hidden sm:inline">Ajouter</span>
                            </button>
                        ` : `
                            <button disabled class="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed">
                                Rupture de stock
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize products event listeners
    initProductsEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = e.target.value.trim();
                    this.loadProductsPage({ ...this.currentProductsFilter, search: query });
                }, 500);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const category = e.target.value;
                this.loadProductsPage({ 
                    ...this.currentProductsFilter, 
                    category: category || undefined,
                    search: this.currentSearchQuery 
                });
            });
        }
    }

    // Increase quantity in product card
    increaseQuantity(productId) {
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            const maxValue = parseInt(input.max) || 99;
            if (currentValue < maxValue) {
                input.value = currentValue + 1;
            }
        }
    }

    // Decrease quantity in product card
    decreaseQuantity(productId) {
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        }
    }

    // Add product to cart
    addToCart(productId) {
        try {
            console.log('🛒 Adding product to cart:', productId);
            
            const product = this.allProducts.find(p => p._id === productId);
            if (!product) {
                console.error('Product not found:', productId);
                alert('Produit non trouvé');
                return;
            }

            const quantityInput = document.getElementById(`qty-${productId}`);
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            // Check stock
            if (product.stock !== undefined && quantity > product.stock) {
                alert(`Stock insuffisant. Stock disponible: ${product.stock}`);
                return;
            }

            // Check if product already in cart
            const existingItemIndex = this.cart.findIndex(item => item._id === productId);
            
            if (existingItemIndex !== -1) {
                // Update quantity
                const newQuantity = this.cart[existingItemIndex].quantite + quantity;
                
                if (product.stock !== undefined && newQuantity > product.stock) {
                    alert(`Stock insuffisant. Quantité maximum: ${product.stock}`);
                    return;
                }
                
                this.cart[existingItemIndex].quantite = newQuantity;
            } else {
                // Add new item
                this.cart.push({
                    _id: product._id,
                    nom: product.nom,
                    prix: product.prix,
                    images: product.images,
                    categorie: product.categorie,
                    quantite: quantity,
                    stock: product.stock
                });
            }

            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(this.cart));
            
            // Update UI
            this.updateCartUI();
            
            // Show success message
            this.showMessage(`${product.nom} ajouté au panier (${quantity})`, 'success');
            
            // Reset quantity input
            if (quantityInput) {
                quantityInput.value = 1;
            }

            console.log('✅ Product added to cart successfully');

        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            alert('Erreur lors de l\'ajout au panier');
        }
    }

    // View product details
    viewProductDetails(productId) {
        const product = this.allProducts.find(p => p._id === productId);
        if (!product) {
            alert('Produit non trouvé');
            return;
        }

        const imageUrl = (product.images && product.images[0]) || 'https://via.placeholder.com/400x400?text=Produit';
        const hasPromotion = product.enPromotion && product.prixOriginal && product.prixOriginal > product.prix;
        const discountPercent = hasPromotion ? Math.round(((product.prixOriginal - product.prix) / product.prixOriginal) * 100) : 0;

        const modalHTML = `
            <div id="product-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">Détails du produit</h2>
                        <button onclick="document.getElementById('product-details-modal').remove()" 
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Product Image -->
                            <div class="relative">
                                <img src="${imageUrl}" alt="${product.nom}" 
                                     class="w-full h-96 object-cover rounded-xl"
                                     onerror="this.src='https://via.placeholder.com/400x400?text=Image+non+disponible'">
                                
                                <!-- Badges -->
                                <div class="absolute top-4 left-4 flex flex-col space-y-2">
                                    ${product.enVedette ? `
                                        <span class="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                            ⭐ Vedette
                                        </span>
                                    ` : ''}
                                    ${hasPromotion ? `
                                        <span class="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                            -${discountPercent}% de remise
                                        </span>
                                    ` : ''}
                                </div>
                            </div>

                            <!-- Product Info -->
                            <div>
                                <div class="mb-4">
                                    <span class="text-sm text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded">
                                        ${product.categorie || 'Santé'}
                                    </span>
                                    ${product.marque ? `<span class="text-sm text-gray-500 ml-2">par ${product.marque}</span>` : ''}
                                </div>
                                
                                <h1 class="text-3xl font-bold text-gray-800 mb-4">${product.nom}</h1>
                                
                                <p class="text-gray-600 mb-6 leading-relaxed">
                                    ${product.description || 'Description non disponible'}
                                </p>

                                <!-- Price -->
                                <div class="mb-6">
                                    <div class="flex items-center space-x-3 mb-2">
                                        <span class="text-3xl font-bold text-emerald-600">
                                            ${parseFloat(product.prix).toFixed(2)}€
                                        </span>
                                        ${hasPromotion ? `
                                            <span class="text-xl text-gray-500 line-through">
                                                ${parseFloat(product.prixOriginal).toFixed(2)}€
                                            </span>
                                            <span class="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                                Économisez ${(product.prixOriginal - product.prix).toFixed(2)}€
                                            </span>
                                        ` : ''}
                                    </div>
                                    ${product.stock !== undefined ? `
                                        <p class="text-sm ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}">
                                            ${product.stock > 5 ? '✅ En stock' : 
                                              product.stock > 0 ? `⚠️ Stock limité (${product.stock} restant)` : 
                                              '❌ Rupture de stock'}
                                        </p>
                                    ` : ''}
                                </div>

                                <!-- Add to Cart Section -->
                                ${product.stock > 0 || product.stock === undefined ? `
                                    <div class="space-y-4">
                                        <div class="flex items-center space-x-4">
                                            <label class="text-sm font-medium text-gray-700">Quantité:</label>
                                            <div class="flex items-center border border-gray-300 rounded-lg">
                                                <button onclick="app.decreaseQuantity('detail-${product._id}')" 
                                                        class="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                                    </svg>
                                                </button>
                                                <input type="number" id="qty-detail-${product._id}" value="1" min="1" max="${product.stock || 99}" 
                                                       class="text-center py-2 border-0 focus:outline-none focus:ring-0" 
                                                       style="width: 80px;">
                                                <button onclick="app.increaseQuantity('detail-${product._id}')" 
                                                        class="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <button onclick="app.addToCartFromDetails('${product._id}')" 
                                                class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"></path>
                                            </svg>
                                            <span>Ajouter au panier</span>
                                        </button>
                                    </div>
                                ` : `
                                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p class="text-red-600 font-medium">❌ Produit en rupture de stock</p>
                                        <p class="text-red-500 text-sm mt-1">Ce produit sera bientôt disponible</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Add to cart from details modal
    addToCartFromDetails(productId) {
        const quantityInput = document.getElementById(`qty-detail-${productId}`);
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        // Update the quantity input in the main product card if it exists
        const mainQuantityInput = document.getElementById(`qty-${productId}`);
        if (mainQuantityInput) {
            mainQuantityInput.value = quantity;
        }
        
        this.addToCart(productId);
        
        // Close modal after adding to cart
        setTimeout(() => {
            const modal = document.getElementById('product-details-modal');
            if (modal) modal.remove();
        }, 1000);
    }

    // Update cart UI
    updateCartUI() {
        const cartButton = document.querySelector('.cart-button');
        const cartCount = document.getElementById('cart-count');
        
        if (cartButton && cartCount) {
            const totalItems = this.cart.reduce((total, item) => total + parseInt(item.quantite), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }

        console.log('🛒 Cart UI updated, items:', this.cart.length);
    }

    // Show success/error messages
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // Load more products (pagination)
    loadMoreProducts() {
        // This would typically load the next page
        // For now, just hide the button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// CSS for line-clamp utility (add to your CSS file)
const style = document.createElement('style');
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .min-h-[2.5rem] {
        min-height: 2.5rem;
    }
`;
document.head.appendChild(style);

// Ensure the class is available globally
if (typeof window !== 'undefined') {
    window.PharmacieGaherApp = PharmacieGaherApp;
}

console.log('✅ Products JS loaded with createProductCard function');
