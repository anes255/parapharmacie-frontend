// Fixed Products Page Management - Independent Implementation

class ProductsManager {
    constructor() {
        this.allProducts = [];
        this.filteredProducts = [];
        this.currentFilters = {};
    }

    // Initialize products manager
    async init() {
        console.log('Initializing Products Manager...');
        await this.loadProducts();
    }

    // Load products from API or localStorage
    async loadProducts() {
        try {
            console.log('Loading products...');
            
            // Try to load from API first
            try {
                const response = await window.apiCall('/products');
                if (response && response.products) {
                    this.allProducts = response.products;
                    console.log(`Loaded ${this.allProducts.length} products from API`);
                    return;
                }
            } catch (error) {
                console.warn('Failed to load from API, trying localStorage...');
            }
            
            // Fallback to localStorage
            const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            if (localProducts.length > 0) {
                this.allProducts = localProducts;
                console.log(`Loaded ${this.allProducts.length} products from localStorage`);
            } else {
                console.log('No products found');
                this.allProducts = [];
            }
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.allProducts = [];
        }
    }

    // Load products page with filters
    async loadProductsPage(params = {}) {
        try {
            console.log('Loading products page with params:', params);
            
            const mainContent = document.getElementById('mainContent');
            
            // Show loading state
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="text-center py-16">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p class="text-emerald-600 mt-4">Chargement des produits...</p>
                    </div>
                </div>
            `;
            
            // Refresh products data
            await this.loadProducts();
            
            // Apply filters
            let filteredProducts = this.allProducts.filter(product => {
                // Only show active products
                if (product.actif === false) return false;
                
                // Category filter
                if (params.categorie && product.categorie !== params.categorie) return false;
                
                // Search filter
                if (params.search) {
                    const searchTerm = params.search.toLowerCase();
                    const searchable = `${product.nom} ${product.description} ${product.marque || ''}`.toLowerCase();
                    if (!searchable.includes(searchTerm)) return false;
                }
                
                // Price filters
                if (params.priceMin && product.prix < parseFloat(params.priceMin)) return false;
                if (params.priceMax && product.prix > parseFloat(params.priceMax)) return false;
                
                // Feature filters
                if (params.enPromotion && !product.enPromotion) return false;
                if (params.enVedette && !product.enVedette) return false;
                
                return true;
            });
            
            // Apply sorting
            this.applySorting(filteredProducts, params.sort || 'newest');
            
            // Store current filters
            this.currentFilters = params;
            this.filteredProducts = filteredProducts;
            
            // Render products page
            this.renderProductsPage(filteredProducts, params);
            
        } catch (error) {
            console.error('Error loading products page:', error);
            this.showErrorPage();
        }
    }

    // Apply sorting to products array
    applySorting(products, sortType) {
        switch (sortType) {
            case 'price_asc':
                products.sort((a, b) => a.prix - b.prix);
                break;
            case 'price_desc':
                products.sort((a, b) => b.prix - a.prix);
                break;
            case 'name_asc':
                products.sort((a, b) => a.nom.localeCompare(b.nom));
                break;
            case 'name_desc':
                products.sort((a, b) => b.nom.localeCompare(a.nom));
                break;
            default:
                // Default: newest first
                products.sort((a, b) => new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0));
        }
    }

    // Render products page
    renderProductsPage(products, params = {}) {
        const mainContent = document.getElementById('mainContent');
        
        const categoryTitle = params.categorie ? ` - ${params.categorie}` : '';
        const searchTitle = params.search ? ` - Recherche: "${params.search}"` : '';
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Nos Produits${categoryTitle}${searchTitle}</h1>
                    <p class="text-xl text-emerald-600">${products.length} produit(s) trouvé(s)</p>
                </div>
                
                <!-- Filters -->
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <!-- Category Filter -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                            <select id="categoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="">Toutes</option>
                                <option value="Vitalité" ${params.categorie === 'Vitalité' ? 'selected' : ''}>Vitalité</option>
                                <option value="Sport" ${params.categorie === 'Sport' ? 'selected' : ''}>Sport</option>
                                <option value="Visage" ${params.categorie === 'Visage' ? 'selected' : ''}>Visage</option>
                                <option value="Cheveux" ${params.categorie === 'Cheveux' ? 'selected' : ''}>Cheveux</option>
                                <option value="Solaire" ${params.categorie === 'Solaire' ? 'selected' : ''}>Solaire</option>
                                <option value="Intime" ${params.categorie === 'Intime' ? 'selected' : ''}>Intime</option>
                                <option value="Soins" ${params.categorie === 'Soins' ? 'selected' : ''}>Soins</option>
                                <option value="Bébé" ${params.categorie === 'Bébé' ? 'selected' : ''}>Bébé</option>
                                <option value="Homme" ${params.categorie === 'Homme' ? 'selected' : ''}>Homme</option>
                                <option value="Dentaire" ${params.categorie === 'Dentaire' ? 'selected' : ''}>Dentaire</option>
                            </select>
                        </div>
                        
                        <!-- Search -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                            <input type="text" id="productSearch" value="${params.search || ''}" 
                                   placeholder="Nom du produit..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <!-- Price Range -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prix min</label>
                            <input type="number" id="priceMin" value="${params.priceMin || ''}" 
                                   placeholder="0" min="0"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prix max</label>
                            <input type="number" id="priceMax" value="${params.priceMax || ''}" 
                                   placeholder="999999" min="0"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <!-- Sort -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                            <select id="sortSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="newest" ${params.sort === 'newest' ? 'selected' : ''}>Plus récent</option>
                                <option value="price_asc" ${params.sort === 'price_asc' ? 'selected' : ''}>Prix croissant</option>
                                <option value="price_desc" ${params.sort === 'price_desc' ? 'selected' : ''}>Prix décroissant</option>
                                <option value="name_asc" ${params.sort === 'name_asc' ? 'selected' : ''}>Nom A-Z</option>
                                <option value="name_desc" ${params.sort === 'name_desc' ? 'selected' : ''}>Nom Z-A</option>
                            </select>
                        </div>
                        
                        <!-- Filter Actions -->
                        <div class="flex flex-col justify-end space-y-2">
                            <button onclick="applyProductFilters()" 
                                    class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">
                                <i class="fas fa-filter mr-2"></i>Filtrer
                            </button>
                            <button onclick="clearProductFilters()" 
                                    class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all">
                                <i class="fas fa-times mr-2"></i>Effacer
                            </button>
                        </div>
                    </div>
                    
                    <!-- Quick Filters -->
                    <div class="mt-4 flex flex-wrap gap-2">
                        <label class="flex items-center">
                            <input type="checkbox" id="promotionFilter" ${params.enPromotion ? 'checked' : ''} 
                                   class="rounded text-emerald-600 mr-2">
                            <span class="text-sm font-medium text-gray-700">En promotion</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="featuredFilter" ${params.enVedette ? 'checked' : ''} 
                                   class="rounded text-emerald-600 mr-2">
                            <span class="text-sm font-medium text-gray-700">En vedette</span>
                        </label>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    ${products.length === 0 ? this.renderNoProducts(params) : products.map(product => this.createProductCard(product)).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners for filters
        this.setupProductFilters();
    }

    // Render no products message
    renderNoProducts(params) {
        let message = 'Aucun produit trouvé';
        let suggestion = 'Essayez de modifier vos filtres';
        
        if (params.search) {
            message = `Aucun produit trouvé pour "${params.search}"`;
            suggestion = 'Vérifiez l\'orthographe ou essayez des mots-clés différents';
        } else if (params.categorie) {
            message = `Aucun produit dans la catégorie "${params.categorie}"`;
            suggestion = 'Cette catégorie sera bientôt approvisionnée';
        }
        
        return `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                <h3 class="text-2xl font-bold text-emerald-800 mb-4">${message}</h3>
                <p class="text-emerald-600 mb-8">${suggestion}</p>
                <button onclick="clearProductFilters()" 
                        class="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all">
                    <i class="fas fa-times mr-2"></i>Effacer les filtres
                </button>
            </div>
        `;
    }

    // Create product card HTML
    createProductCard(product) {
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        // Generate image URL
        let imageUrl;
        if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:image'))) {
            imageUrl = product.image;
        } else {
            imageUrl = this.generatePlaceholderImage(product);
        }
        
        return `
            <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${isOutOfStock ? 'opacity-75' : ''}">
                <div class="relative aspect-square bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden">
                    ${hasPromotion ? `<div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                    ${product.enVedette ? `<div class="absolute top-4 right-4 z-10 bg-yellow-500 text-white p-2 rounded-full"><i class="fas fa-star text-sm"></i></div>` : ''}
                    ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span class="text-white font-bold text-lg">Rupture de stock</span>
                    </div>` : ''}
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-full h-full object-cover cursor-pointer" 
                         onclick="loadProductPage('${product._id}')"
                         onerror="this.src='${this.generatePlaceholderImage(product)}'">
                </div>
                
                <div class="p-6">
                    <div class="mb-3">
                        <span class="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-2">${product.categorie}</span>
                        ${product.marque ? `<span class="block text-sm text-gray-500">${product.marque}</span>` : ''}
                    </div>
                    
                    <h3 class="font-bold text-gray-900 mb-2 cursor-pointer hover:text-emerald-700 transition-colors" onclick="loadProductPage('${product._id}')">${product.nom}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description || 'Description non disponible'}</p>
                    
                    <div class="flex items-center justify-between mb-4">
                        ${hasPromotion ? `
                            <div class="flex items-center space-x-2">
                                <span class="text-2xl font-bold text-red-600">${product.prix} DA</span>
                                <span class="text-lg text-gray-400 line-through">${product.prixOriginal} DA</span>
                            </div>
                        ` : `
                            <span class="text-2xl font-bold text-emerald-700">${product.prix} DA</span>
                        `}
                        <div class="text-right">
                            <div class="text-sm text-gray-500">Stock: ${product.stock}</div>
                        </div>
                    </div>
                    
                    ${!isOutOfStock ? `
                        <button onclick="addToCart('${product._id}', 1)" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium">
                            <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                        </button>
                    ` : `
                        <button disabled class="w-full bg-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed font-medium">
                            <i class="fas fa-times mr-2"></i>Non disponible
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // Generate placeholder image
    generatePlaceholderImage(product) {
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
        return `https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }

    // Setup product filters
    setupProductFilters() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                applyProductFilters();
            });
        }
        
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
        
        // Sort filter
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                applyProductFilters();
            });
        }
        
        // Checkbox filters
        ['promotionFilter', 'featuredFilter'].forEach(id => {
            const filter = document.getElementById(id);
            if (filter) {
                filter.addEventListener('change', () => {
                    applyProductFilters();
                });
            }
        });
    }

    // Load product detail page
    async loadProductPage(productId) {
        try {
            console.log('Loading product page for:', productId);
            
            const mainContent = document.getElementById('mainContent');
            
            // Show loading
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="text-center py-16">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p class="text-emerald-600 mt-4">Chargement du produit...</p>
                    </div>
                </div>
            `;
            
            // Find product
            let product = this.allProducts.find(p => p._id === productId);
            
            if (!product) {
                try {
                    product = await window.apiCall(`/products/${productId}`);
                } catch (error) {
                    this.showProductNotFound();
                    return;
                }
            }
            
            if (!product) {
                this.showProductNotFound();
                return;
            }
            
            this.renderProductDetail(product);
            
        } catch (error) {
            console.error('Error loading product page:', error);
            this.showProductNotFound();
        }
    }

    // Show product not found
    showProductNotFound() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Produit non trouvé</h3>
                    <p class="text-red-600 mb-8">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
                    <button onclick="loadProductsPage()" class="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600">
                        Retour aux produits
                    </button>
                </div>
            </div>
        `;
    }

    // Show error page
    showErrorPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Erreur de chargement</h3>
                    <p class="text-red-600 mb-8">Impossible de charger les produits</p>
                    <button onclick="loadProductsPage()" class="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }

    // Render product detail page
    renderProductDetail(product) {
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
                <!-- Breadcrumb -->
                <nav class="mb-8">
                    <ol class="flex items-center space-x-2 text-sm">
                        <li><a href="#" onclick="loadHomePage()" class="text-emerald-600 hover:text-emerald-700">Accueil</a></li>
                        <li><span class="text-gray-500">/</span></li>
                        <li><a href="#" onclick="loadProductsPage()" class="text-emerald-600 hover:text-emerald-700">Produits</a></li>
                        <li><span class="text-gray-500">/</span></li>
                        <li><a href="#" onclick="filterByCategory('${product.categorie}')" class="text-emerald-600 hover:text-emerald-700">${product.categorie}</a></li>
                        <li><span class="text-gray-500">/</span></li>
                        <li><span class="text-gray-900">${product.nom}</span></li>
                    </ol>
                </nav>
                
                <!-- Product Detail -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Product Image -->
                    <div class="space-y-4">
                        <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden relative">
                            ${hasPromotion ? `<div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                            ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                <span class="text-white font-bold text-2xl">Rupture de stock</span>
                            </div>` : ''}
                            <img src="${imageUrl}" alt="${product.nom}" 
                                 class="w-full h-full object-cover"
                                 onerror="this.src='https://via.placeholder.com/600x600/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                        </div>
                    </div>
                    
                    <!-- Product Info -->
                    <div class="space-y-6">
                        <div>
                            <h1 class="text-3xl font-bold text-emerald-800 mb-2">${product.nom}</h1>
                            <p class="text-emerald-600">${product.marque || ''}</p>
                            <span class="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mt-2">${product.categorie}</span>
                        </div>
                        
                        <!-- Price -->
                        <div class="space-y-2">
                            ${hasPromotion ? `
                                <div class="flex items-center space-x-3">
                                    <span class="text-3xl font-bold text-red-600">${product.prix} DA</span>
                                    <span class="text-xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                </div>
                                <p class="text-green-600 font-medium">Économisez ${product.prixOriginal - product.prix} DA</p>
                            ` : `
                                <div class="text-3xl font-bold text-emerald-700">${product.prix} DA</div>
                            `}
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p class="text-gray-600 leading-relaxed">${product.description || 'Description non disponible'}</p>
                        </div>
                        
                        <!-- Additional Info -->
                        ${product.ingredients ? `
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Ingrédients</h3>
                                <p class="text-gray-600">${product.ingredients}</p>
                            </div>
                        ` : ''}
                        
                        ${product.modeEmploi ? `
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Mode d'emploi</h3>
                                <p class="text-gray-600">${product.modeEmploi}</p>
                            </div>
                        ` : ''}
                        
                        ${product.precautions ? `
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Précautions</h3>
                                <p class="text-gray-600">${product.precautions}</p>
                            </div>
                        ` : ''}
                        
                        <!-- Stock Info -->
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <span class="text-gray-600 mr-2">Stock:</span>
                                <span class="font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
                                    ${product.stock > 0 ? `${product.stock} unités` : 'Rupture de stock'}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Add to Cart -->
                        ${!isOutOfStock ? `
                            <div class="space-y-4">
                                <div class="flex items-center space-x-4">
                                    <label class="text-gray-700 font-medium">Quantité:</label>
                                    <div class="flex items-center border border-gray-300 rounded-lg">
                                        <button onclick="decreaseQuantity()" class="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                               class="w-16 text-center border-0 focus:ring-0">
                                        <button onclick="increaseQuantity()" class="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                                    </div>
                                </div>
                                
                                <button onclick="addProductToCart('${product._id}')" 
                                        class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
                                    <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                                </button>
                            </div>
                        ` : `
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p class="text-red-800 font-medium">Ce produit est actuellement en rupture de stock</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
}

// Global products manager instance
let productsManager;

// Initialize products manager
async function initProductsManager() {
    productsManager = new ProductsManager();
    await productsManager.init();
    window.productsManager = productsManager;
    console.log('✅ Products manager initialized');
}

// Global functions for products
async function loadProductsPage(params = {}) {
    if (!productsManager) {
        await initProductsManager();
    }
    return productsManager.loadProductsPage(params);
}

async function loadProductPage(productId) {
    if (!productsManager) {
        await initProductsManager();
    }
    return productsManager.loadProductPage(productId);
}

// Global filter functions
function applyProductFilters() {
    const params = {
        categorie: document.getElementById('categoryFilter')?.value || '',
        search: document.getElementById('productSearch')?.value || '',
        priceMin: document.getElementById('priceMin')?.value || '',
        priceMax: document.getElementById('priceMax')?.value || '',
        sort: document.getElementById('sortSelect')?.value || 'newest',
        enPromotion: document.getElementById('promotionFilter')?.checked || false,
        enVedette: document.getElementById('featuredFilter')?.checked || false
    };
    
    // Remove empty params
    Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === false) {
            delete params[key];
        }
    });
    
    loadProductsPage(params);
}

function clearProductFilters() {
    ['categoryFilter', 'productSearch', 'priceMin', 'priceMax'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'newest';
    
    ['promotionFilter', 'featuredFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = false;
    });
    
    loadProductsPage();
}

// Filter by category (called from navigation)
function filterByCategory(category) {
    loadProductsPage({ categorie: category });
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
    
    if (window.addToCart) {
        window.addToCart(productId, quantity);
    }
}

// Navigation functions
function loadHomePage() {
    if (window.app && window.app.showPage) {
        window.app.showPage('home');
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsManager);
} else {
    // Small delay to ensure other scripts are loaded
    setTimeout(initProductsManager, 100);
}

// Export functions for global access
window.initProductsManager = initProductsManager;
window.productsManager = productsManager;
window.loadProductsPage = loadProductsPage;
window.loadProductPage = loadProductPage;
window.applyProductFilters = applyProductFilters;
window.clearProductFilters = clearProductFilters;
window.filterByCategory = filterByCategory;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addProductToCart = addProductToCart;

console.log('✅ Enhanced Products.js loaded successfully');
