// Fixed Products System for Shifa Parapharmacie - Integrated with App

// Add products page functionality to the main app
PharmacieGaherApp.prototype.loadProductsPage = async function(params = {}) {
    try {
        console.log('Loading products page with params:', params);
        
        // Get current filters
        const filters = {
            categorie: params.categorie || '',
            search: params.search || '',
            sortBy: params.sortBy || 'newest'
        };
        
        // Filter products from cached data
        let filteredProducts = [...this.allProducts];
        
        // Apply category filter
        if (filters.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === filters.categorie);
        }
        
        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower) ||
                p.marque?.toLowerCase().includes(searchLower) ||
                p.categorie.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply sorting
        switch (filters.sortBy) {
            case 'name_asc':
                filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
                break;
            case 'name_desc':
                filteredProducts.sort((a, b) => b.nom.localeCompare(a.nom));
                break;
            case 'price_asc':
                filteredProducts.sort((a, b) => a.prix - b.prix);
                break;
            case 'price_desc':
                filteredProducts.sort((a, b) => b.prix - a.prix);
                break;
            case 'newest':
            default:
                filteredProducts.sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout));
                break;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Page Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">
                        ${filters.categorie ? `Catégorie: ${filters.categorie}` : 
                          filters.search ? `Recherche: "${filters.search}"` : 'Nos Produits'}
                    </h1>
                    <p class="text-xl text-emerald-600">
                        ${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}
                    </p>
                </div>
                
                <!-- Filters and Sort -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <!-- Categories Filter -->
                        <div class="flex flex-wrap gap-2">
                            <button onclick="app.showPage('products')" 
                                    class="filter-btn ${!filters.categorie ? 'active' : ''} px-4 py-2 rounded-xl transition-all">
                                Toutes
                            </button>
                            ${this.getUniqueCategories().map(cat => `
                                <button onclick="app.filterByCategory('${cat}')" 
                                        class="filter-btn ${filters.categorie === cat ? 'active' : ''} px-4 py-2 rounded-xl transition-all">
                                    ${cat}
                                </button>
                            `).join('')}
                        </div>
                        
                        <!-- Search and Sort -->
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="relative">
                                <input type="text" id="productSearch" placeholder="Rechercher un produit..." 
                                       value="${filters.search}" 
                                       class="pl-10 pr-4 py-3 bg-white/80 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 w-full sm:w-64 transition-all"
                                       onkeypress="if(event.key==='Enter') app.performSearch(this.value)">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400"></i>
                                <button onclick="app.performSearch(document.getElementById('productSearch').value)"
                                        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-all">
                                    <i class="fas fa-search text-sm"></i>
                                </button>
                            </div>
                            
                            <select id="sortSelect" onchange="app.changeSortOrder(this.value)" 
                                    class="px-4 py-3 bg-white/80 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all">
                                <option value="newest" ${filters.sortBy === 'newest' ? 'selected' : ''}>Plus récent</option>
                                <option value="name_asc" ${filters.sortBy === 'name_asc' ? 'selected' : ''}>Nom A-Z</option>
                                <option value="name_desc" ${filters.sortBy === 'name_desc' ? 'selected' : ''}>Nom Z-A</option>
                                <option value="price_asc" ${filters.sortBy === 'price_asc' ? 'selected' : ''}>Prix croissant</option>
                                <option value="price_desc" ${filters.sortBy === 'price_desc' ? 'selected' : ''}>Prix décroissant</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Products Grid -->
                ${filteredProducts.length === 0 ? `
                    <div class="text-center py-16">
                        <div class="w-32 h-32 mx-auto mb-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-search text-6xl text-emerald-400"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h2>
                        <p class="text-emerald-600 mb-8 text-lg">
                            ${filters.search ? `Aucun résultat pour "${filters.search}"` : 
                              filters.categorie ? `Aucun produit dans la catégorie "${filters.categorie}"` : 
                              'Aucun produit disponible'}
                        </p>
                        <div class="space-y-4">
                            ${filters.search || filters.categorie ? `
                                <button onclick="app.showPage('products')" 
                                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                    <i class="fas fa-grid-2 mr-2"></i>Voir tous les produits
                                </button>
                            ` : ''}
                            <div>
                                <button onclick="app.showPage('home')" 
                                        class="text-emerald-600 hover:text-emerald-800 font-medium">
                                    <i class="fas fa-home mr-2"></i>Retour à l'accueil
                                </button>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${filteredProducts.map(product => this.createProductCard(product)).join('')}
                    </div>
                    
                    <!-- Load More Button (if needed) -->
                    ${filteredProducts.length >= 12 ? `
                        <div class="text-center mt-12">
                            <button onclick="loadMoreProducts()" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-plus mr-2"></i>Charger plus de produits
                            </button>
                        </div>
                    ` : ''}
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading products page:', error);
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-red-800 mb-4">Erreur de chargement</h2>
                    <p class="text-red-600 mb-6">Impossible de charger les produits</p>
                    <button onclick="app.showPage('products')" 
                            class="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition-all">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }
};

// Add product detail page functionality
PharmacieGaherApp.prototype.loadProductPage = async function(productId) {
    try {
        console.log('Loading product page for ID:', productId);
        
        // Find product in cached data
        let product = this.allProducts.find(p => p._id === productId);
        
        // If not found locally, try API
        if (!product) {
            try {
                product = await apiCall(`/products/${productId}`);
            } catch (error) {
                console.log('Product not found in API');
            }
        }
        
        if (!product) {
            this.showToast('Produit non trouvé', 'error');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        // Generate image URL
        let imageUrl;
        if (product.image && product.image.startsWith('data:image')) {
            imageUrl = product.image;
        } else if (product.image && product.image.startsWith('http')) {
            imageUrl = product.image;
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
            imageUrl = `https://via.placeholder.com/500x500/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <!-- Breadcrumb -->
                <nav class="mb-8">
                    <div class="flex items-center space-x-2 text-sm">
                        <a href="#" onclick="app.showPage('home')" class="text-emerald-600 hover:text-emerald-800">Accueil</a>
                        <span class="text-gray-400">></span>
                        <a href="#" onclick="app.showPage('products')" class="text-emerald-600 hover:text-emerald-800">Produits</a>
                        <span class="text-gray-400">></span>
                        <a href="#" onclick="app.filterByCategory('${product.categorie}')" class="text-emerald-600 hover:text-emerald-800">${product.categorie}</a>
                        <span class="text-gray-400">></span>
                        <span class="text-gray-600">${product.nom}</span>
                    </div>
                </nav>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                    <!-- Product Image -->
                    <div class="relative">
                        ${hasPromotion ? `
                            <div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                                -${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%
                            </div>
                        ` : ''}
                        ${isOutOfStock ? `
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                                <span class="text-white font-bold text-xl">Rupture de stock</span>
                            </div>
                        ` : ''}
                        
                        <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-8 aspect-square">
                            <img src="${imageUrl}" alt="${product.nom}" 
                                 class="w-full h-full object-cover rounded-xl border-2 border-emerald-200 shadow-lg"
                                 onerror="this.src='${imageUrl}'">
                        </div>
                        
                        ${product.enVedette ? `
                            <div class="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                                <i class="fas fa-star mr-1"></i>Coup de cœur
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Product Info -->
                    <div class="space-y-6">
                        <div>
                            <h1 class="text-4xl font-bold text-emerald-800 mb-4">${product.nom}</h1>
                            ${product.marque ? `<p class="text-xl text-emerald-600 mb-2">Par ${product.marque}</p>` : ''}
                            <div class="flex items-center space-x-2">
                                <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">${product.categorie}</span>
                                ${product.enVedette ? '<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold"><i class="fas fa-star mr-1"></i>En vedette</span>' : ''}
                            </div>
                        </div>
                        
                        <!-- Price -->
                        <div class="border-t border-emerald-200 pt-6">
                            <div class="flex items-center space-x-4 mb-4">
                                ${hasPromotion ? `
                                    <span class="text-3xl font-bold text-red-600">${product.prix} DA</span>
                                    <span class="text-xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                ` : `
                                    <span class="text-3xl font-bold text-emerald-700">${product.prix} DA</span>
                                `}
                            </div>
                            
                            <div class="flex items-center space-x-4 text-sm mb-6">
                                <div class="flex items-center">
                                    <i class="fas fa-box text-emerald-600 mr-2"></i>
                                    <span class="text-emerald-700">Stock: ${product.stock} unités</span>
                                </div>
                                ${product.stock <= 5 && product.stock > 0 ? `
                                    <div class="flex items-center">
                                        <i class="fas fa-exclamation-triangle text-orange-600 mr-2"></i>
                                        <span class="text-orange-700 font-medium">Stock faible</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Add to Cart -->
                            ${!isOutOfStock ? `
                                <div class="flex items-center space-x-4 mb-6">
                                    <div class="flex items-center border-2 border-emerald-300 rounded-xl">
                                        <button onclick="decreaseQuantity()" class="w-12 h-12 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-l-xl">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                               class="w-20 h-12 text-center border-0 focus:ring-0 text-lg font-semibold text-emerald-800">
                                        <button onclick="increaseQuantity()" class="w-12 h-12 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-r-xl">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    
                                    <button onclick="addProductToCart()" 
                                            class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                        <i class="fas fa-cart-plus mr-3"></i>Ajouter au panier
                                    </button>
                                </div>
                            ` : `
                                <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                    <div class="flex items-center">
                                        <i class="fas fa-times-circle text-red-500 mr-3"></i>
                                        <span class="text-red-700 font-semibold">Ce produit est actuellement en rupture de stock</span>
                                    </div>
                                </div>
                            `}
                            
                            <!-- Quick Actions -->
                            <div class="flex items-center space-x-4 text-sm">
                                <button onclick="app.showPage('cart')" 
                                        class="text-emerald-600 hover:text-emerald-800 font-medium">
                                    <i class="fas fa-shopping-cart mr-2"></i>Voir le panier
                                </button>
                                <button onclick="app.filterByCategory('${product.categorie}')" 
                                        class="text-emerald-600 hover:text-emerald-800 font-medium">
                                    <i class="fas fa-th-large mr-2"></i>Autres ${product.categorie}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Product Details Tabs -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden mb-12">
                    <div class="border-b border-emerald-100">
                        <nav class="flex">
                            <button onclick="showTab('description')" 
                                    class="tab-btn active px-8 py-4 text-lg font-semibold text-emerald-600 border-b-2 border-emerald-500">
                                Description
                            </button>
                            ${product.ingredients ? `
                                <button onclick="showTab('ingredients')" 
                                        class="tab-btn px-8 py-4 text-lg font-semibold text-gray-600 border-b-2 border-transparent hover:text-emerald-600">
                                    Ingrédients
                                </button>
                            ` : ''}
                            ${product.modeEmploi ? `
                                <button onclick="showTab('usage')" 
                                        class="tab-btn px-8 py-4 text-lg font-semibold text-gray-600 border-b-2 border-transparent hover:text-emerald-600">
                                    Mode d'emploi
                                </button>
                            ` : ''}
                            ${product.precautions ? `
                                <button onclick="showTab('precautions')" 
                                        class="tab-btn px-8 py-4 text-lg font-semibold text-gray-600 border-b-2 border-transparent hover:text-emerald-600">
                                    Précautions
                                </button>
                            ` : ''}
                        </nav>
                    </div>
                    
                    <div class="p-8">
                        <div id="tab-description" class="tab-content">
                            <h3 class="text-xl font-semibold text-emerald-800 mb-4">Description du produit</h3>
                            <p class="text-gray-700 leading-relaxed">${product.description || 'Description non disponible.'}</p>
                        </div>
                        
                        ${product.ingredients ? `
                            <div id="tab-ingredients" class="tab-content hidden">
                                <h3 class="text-xl font-semibold text-emerald-800 mb-4">Ingrédients</h3>
                                <p class="text-gray-700 leading-relaxed">${product.ingredients}</p>
                            </div>
                        ` : ''}
                        
                        ${product.modeEmploi ? `
                            <div id="tab-usage" class="tab-content hidden">
                                <h3 class="text-xl font-semibold text-emerald-800 mb-4">Mode d'emploi</h3>
                                <p class="text-gray-700 leading-relaxed">${product.modeEmploi}</p>
                            </div>
                        ` : ''}
                        
                        ${product.precautions ? `
                            <div id="tab-precautions" class="tab-content hidden">
                                <h3 class="text-xl font-semibold text-emerald-800 mb-4">Précautions d'usage</h3>
                                <p class="text-gray-700 leading-relaxed">${product.precautions}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Related Products -->
                <div class="mb-12">
                    <h2 class="text-3xl font-bold text-emerald-800 mb-8 text-center">Produits similaires</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="relatedProducts">
                        <!-- Related products will be loaded here -->
                    </div>
                </div>
            </div>
            
            <script>
                // Tab functionality
                function showTab(tabName) {
                    // Hide all tabs
                    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        btn.classList.remove('text-emerald-600', 'border-emerald-500');
                        btn.classList.add('text-gray-600', 'border-transparent');
                    });
                    
                    // Show selected tab
                    document.getElementById('tab-' + tabName).classList.remove('hidden');
                    event.target.classList.remove('text-gray-600', 'border-transparent');
                    event.target.classList.add('text-emerald-600', 'border-emerald-500');
                }
                
                // Quantity controls
                window.productId = '${product._id}';
                window.maxStock = ${product.stock};
                
                function increaseQuantity() {
                    const input = document.getElementById('productQuantity');
                    const currentValue = parseInt(input.value);
                    if (currentValue < window.maxStock) {
                        input.value = currentValue + 1;
                    }
                }
                
                function decreaseQuantity() {
                    const input = document.getElementById('productQuantity');
                    const currentValue = parseInt(input.value);
                    if (currentValue > 1) {
                        input.value = currentValue - 1;
                    }
                }
                
                function addProductToCart() {
                    const quantity = parseInt(document.getElementById('productQuantity').value);
                    if (window.app) {
                        window.app.addToCart(window.productId, quantity);
                    }
                }
            </script>
        `;
        
        // Load related products
        this.loadRelatedProducts(product);
        
    } catch (error) {
        console.error('Error loading product page:', error);
        this.showToast('Erreur lors du chargement du produit', 'error');
        this.showPage('products');
    }
};

// Add related products functionality
PharmacieGaherApp.prototype.loadRelatedProducts = function(currentProduct) {
    // Find related products in same category
    const relatedProducts = this.allProducts
        .filter(p => p.categorie === currentProduct.categorie && p._id !== currentProduct._id && p.actif !== false)
        .slice(0, 4);
    
    const relatedContainer = document.getElementById('relatedProducts');
    if (relatedContainer && relatedProducts.length > 0) {
        relatedContainer.innerHTML = relatedProducts.map(product => this.createProductCard(product)).join('');
    } else if (relatedContainer) {
        relatedContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-emerald-600">Aucun produit similaire trouvé</p>
                <button onclick="app.filterByCategory('${currentProduct.categorie}')" 
                        class="mt-4 text-emerald-600 hover:text-emerald-800 font-medium">
                    <i class="fas fa-th-large mr-2"></i>Voir tous les produits ${currentProduct.categorie}
                </button>
            </div>
        `;
    }
};

// Add helper functions
PharmacieGaherApp.prototype.getUniqueCategories = function() {
    const categories = [...new Set(this.allProducts.map(p => p.categorie))];
    return categories.sort();
};

PharmacieGaherApp.prototype.changeSortOrder = function(sortBy) {
    const currentParams = this.getCurrentPageParams();
    this.showPage('products', { ...currentParams, sortBy });
};

PharmacieGaherApp.prototype.getCurrentPageParams = function() {
    // This would typically extract current URL params
    // For now, return empty object
    return {};
};

// Global functions for product interactions
function loadMoreProducts() {
    // Implementation for loading more products
    console.log('Loading more products...');
}

// Product page initialization
document.addEventListener('DOMContentLoaded', () => {
    // Any additional product page initialization
});

console.log('✅ Fixed Products.js loaded with proper API integration');
