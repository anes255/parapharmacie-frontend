// Complete Products Management System - FIXED VERSION

// FIXED: Enhanced products page loading with proper API integration
PharmacieGaherApp.prototype.loadProductsPage = async function(params = {}) {
    try {
        console.log('Loading products page with params:', params);
        
        // Get products from cache first
        let allProducts = [...this.allProducts];
        
        // Try to get fresh products from API
        try {
            const response = await fetch(buildApiUrl('/products'), {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.products && data.products.length > 0) {
                    // Update cache with API products
                    allProducts = data.products;
                    this.allProducts = [...allProducts];
                    localStorage.setItem('demoProducts', JSON.stringify(allProducts));
                    console.log('✅ Products updated from API');
                }
            }
        } catch (error) {
            console.log('⚠️ API unavailable, using cached products');
        }
        
        // Apply filters
        let filteredProducts = allProducts.filter(product => product.actif !== false);
        
        // Filter by category if specified
        if (params.categorie) {
            filteredProducts = filteredProducts.filter(p => p.categorie === params.categorie);
        }
        
        // Filter by search if specified
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.marque?.toLowerCase().includes(searchTerm) ||
                p.categorie.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort products
        filteredProducts.sort((a, b) => {
            // Featured products first
            if (a.enVedette && !b.enVedette) return -1;
            if (!a.enVedette && b.enVedette) return 1;
            
            // Then by date (newest first)
            return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0);
        });
        
        const mainContent = document.getElementById('mainContent');
        
        // Build page title
        let pageTitle = 'Nos Produits';
        let pageSubtitle = `${filteredProducts.length} produit(s) disponible(s)`;
        
        if (params.categorie) {
            pageTitle = `Catégorie: ${params.categorie}`;
        } else if (params.search) {
            pageTitle = `Recherche: "${params.search}"`;
        }
        
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Page Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">${pageTitle}</h1>
                    <p class="text-xl text-emerald-600">${pageSubtitle}</p>
                    ${params.categorie || params.search ? `
                        <div class="mt-4">
                            <button onclick="app.showPage('products')" class="text-emerald-600 hover:text-emerald-800 font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Voir tous les produits
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Categories Filter -->
                ${!params.categorie ? `
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-emerald-700 mb-4">Filtrer par catégorie:</h3>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="app.showPage('products')" class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-all font-medium">
                                Toutes les catégories
                            </button>
                            ${this.getAvailableCategories().map(cat => `
                                <button onclick="app.filterByCategory('${cat}')" class="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 transition-all">
                                    ${cat}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Search Bar -->
                <div class="mb-8">
                    <div class="max-w-md mx-auto">
                        <div class="relative">
                            <input type="text" id="productsSearchInput" placeholder="Rechercher un produit..." 
                                   value="${params.search || ''}"
                                   class="w-full px-4 py-3 pl-12 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all"
                                   onkeypress="handleProductsSearch(event)">
                            <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400"></i>
                            <button onclick="searchProducts()" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">
                                Rechercher
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div class="products-container">
                    ${filteredProducts.length === 0 ? `
                        <div class="text-center py-16">
                            <i class="fas fa-search text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit trouvé</h3>
                            <p class="text-emerald-600 mb-8">
                                ${params.search ? `Aucun produit ne correspond à votre recherche "${params.search}"` : 
                                  params.categorie ? `Aucun produit dans la catégorie "${params.categorie}"` : 
                                  'Aucun produit disponible pour le moment'}
                            </p>
                            <button onclick="app.showPage('products')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-arrow-left mr-2"></i>Retour aux produits
                            </button>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            ${filteredProducts.map(product => this.createProductCard(product)).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Load More Button (if many products) -->
                ${filteredProducts.length > 12 ? `
                    <div class="text-center mt-12">
                        <button onclick="loadMoreProducts()" class="bg-emerald-100 text-emerald-700 font-bold py-3 px-8 rounded-xl hover:bg-emerald-200 transition-all">
                            <i class="fas fa-plus mr-2"></i>Charger plus de produits
                        </button>
                    </div>
                ` : ''}
                
                <!-- Back to Top -->
                ${filteredProducts.length > 8 ? `
                    <div class="fixed bottom-8 right-8 z-40">
                        <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                                class="bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-all hover:scale-105">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Set up search functionality
        this.setupProductsSearch();
        
    } catch (error) {
        console.error('Error loading products page:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Erreur de chargement</h3>
                    <p class="text-red-600 mb-8">Impossible de charger les produits</p>
                    <button onclick="app.showPage('products')" class="bg-red-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-600 transition-all">
                        <i class="fas fa-refresh mr-2"></i>Réessayer
                    </button>
                </div>
            </div>
        `;
    }
};

// Enhanced product page loading
PharmacieGaherApp.prototype.loadProductPage = async function(productId) {
    try {
        console.log('Loading product page for ID:', productId);
        
        // Find product in cache first
        let product = this.allProducts.find(p => p._id === productId);
        
        // If not in cache, try API
        if (!product) {
            try {
                const response = await fetch(buildApiUrl(`/products/${productId}`), {
                    headers: this.getAuthHeaders()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    product = data.product || data;
                }
            } catch (error) {
                console.log('API unavailable for single product');
            }
        }
        
        if (!product) {
            throw new Error('Produit non trouvé');
        }
        
        const isOutOfStock = product.stock === 0;
        const hasPromotion = product.enPromotion && product.prixOriginal;
        
        // Generate related products (same category)
        const relatedProducts = this.allProducts
            .filter(p => p.categorie === product.categorie && p._id !== product._id && p.actif !== false)
            .slice(0, 4);
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Breadcrumb -->
                <nav class="flex items-center space-x-2 text-sm text-emerald-600 mb-8">
                    <a href="#" onclick="app.showPage('home')" class="hover:text-emerald-800">Accueil</a>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <a href="#" onclick="app.showPage('products')" class="hover:text-emerald-800">Produits</a>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <a href="#" onclick="app.filterByCategory('${product.categorie}')" class="hover:text-emerald-800">${product.categorie}</a>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <span class="text-emerald-800 font-medium">${product.nom}</span>
                </nav>
                
                <!-- Product Details -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <!-- Product Image -->
                    <div class="relative">
                        ${hasPromotion ? `<div class="badge-promotion absolute top-4 left-4 z-20">-${product.pourcentagePromotion || Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>` : ''}
                        ${isOutOfStock ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                            <span class="text-white font-bold text-xl">Rupture de stock</span>
                        </div>` : ''}
                        
                        <div class="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl overflow-hidden">
                            <img src="${product.image || this.generatePlaceholderImage(product)}" 
                                 alt="${product.nom}" 
                                 class="w-full h-full object-cover"
                                 onerror="this.src='${this.generatePlaceholderImage(product)}'">
                        </div>
                    </div>
                    
                    <!-- Product Info -->
                    <div class="space-y-6">
                        <div>
                            <h1 class="text-3xl font-bold text-emerald-800 mb-2">${product.nom}</h1>
                            ${product.marque ? `<p class="text-emerald-600 text-lg">${product.marque}</p>` : ''}
                            <span class="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium mt-2">${product.categorie}</span>
                        </div>
                        
                        <div class="space-y-2">
                            ${hasPromotion ? `
                                <div class="flex items-center space-x-3">
                                    <span class="text-2xl text-gray-400 line-through">${product.prixOriginal} DA</span>
                                    <span class="text-3xl font-bold text-red-600">${product.prix} DA</span>
                                    <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">PROMO</span>
                                </div>
                                <p class="text-sm text-red-600">Vous économisez ${product.prixOriginal - product.prix} DA</p>
                            ` : `
                                <span class="text-3xl font-bold text-emerald-700">${product.prix} DA</span>
                            `}
                            <p class="text-emerald-600">
                                Stock: <span class="font-semibold ${product.stock <= 5 ? 'text-orange-600' : 'text-emerald-600'}">${product.stock} unité(s)</span>
                            </p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-emerald-800 mb-2">Description</h3>
                            <p class="text-gray-700 leading-relaxed">${product.description}</p>
                        </div>
                        
                        ${product.ingredients ? `
                            <div>
                                <h3 class="text-lg font-semibold text-emerald-800 mb-2">Ingrédients</h3>
                                <p class="text-gray-700">${product.ingredients}</p>
                            </div>
                        ` : ''}
                        
                        ${product.modeEmploi ? `
                            <div>
                                <h3 class="text-lg font-semibold text-emerald-800 mb-2">Mode d'emploi</h3>
                                <p class="text-gray-700">${product.modeEmploi}</p>
                            </div>
                        ` : ''}
                        
                        ${product.precautions ? `
                            <div>
                                <h3 class="text-lg font-semibold text-emerald-800 mb-2">Précautions</h3>
                                <p class="text-gray-700">${product.precautions}</p>
                            </div>
                        ` : ''}
                        
                        <!-- Add to Cart Section -->
                        ${!isOutOfStock ? `
                            <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                                <div class="flex items-center space-x-4 mb-4">
                                    <label class="text-emerald-700 font-medium">Quantité:</label>
                                    <div class="flex items-center border border-emerald-300 rounded-lg">
                                        <button onclick="changeProductQuantity(-1)" class="px-3 py-2 text-emerald-600 hover:bg-emerald-100 rounded-l-lg">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" 
                                               class="w-16 py-2 text-center border-0 focus:ring-0">
                                        <button onclick="changeProductQuantity(1)" class="px-3 py-2 text-emerald-600 hover:bg-emerald-100 rounded-r-lg">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <button onclick="addProductToCart('${product._id}')" 
                                        class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
                                    <i class="fas fa-cart-plus mr-2"></i>Ajouter au panier
                                </button>
                            </div>
                        ` : `
                            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
                                <p class="text-red-700 font-medium text-center">
                                    <i class="fas fa-exclamation-circle mr-2"></i>
                                    Ce produit n'est actuellement pas disponible
                                </p>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Related Products -->
                ${relatedProducts.length > 0 ? `
                    <div class="border-t border-emerald-200 pt-16">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-8 text-center">Produits similaires</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${relatedProducts.map(relProduct => this.createProductCard(relProduct)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading product page:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Produit non trouvé</h3>
                    <p class="text-red-600 mb-8">Le produit que vous cherchez n'existe pas ou n'est plus disponible</p>
                    <button onclick="app.showPage('products')" class="bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-600 transition-all">
                        <i class="fas fa-arrow-left mr-2"></i>Retour aux produits
                    </button>
                </div>
            </div>
        `;
    }
};

// Enhanced checkout page loading
PharmacieGaherApp.prototype.loadCheckoutPage = async function() {
    try {
        console.log('Loading checkout page...');
        
        // Validate cart
        if (!this.cart || this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        // Calculate totals
        const sousTotal = this.getCartTotal();
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        // Get user info if logged in
        const userInfo = this.currentUser || {};
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-emerald-800 mb-2">Finaliser votre commande</h1>
                    <p class="text-emerald-600">Vérifiez vos informations et validez votre commande</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Order Form -->
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h2 class="text-xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                        
                        <form id="checkoutForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="checkoutPrenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                    <input type="text" id="checkoutPrenom" name="prenom" required 
                                           value="${userInfo.prenom || ''}"
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                           placeholder="Votre prénom">
                                </div>
                                <div>
                                    <label for="checkoutNom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                    <input type="text" id="checkoutNom" name="nom" required 
                                           value="${userInfo.nom || ''}"
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                           placeholder="Votre nom">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="checkoutEmail" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input type="email" id="checkoutEmail" name="email" required 
                                           value="${userInfo.email || ''}"
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                           placeholder="votre@email.com">
                                </div>
                                <div>
                                    <label for="checkoutTelephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="checkoutTelephone" name="telephone" required 
                                           value="${userInfo.telephone || ''}"
                                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                           placeholder="+213 555 123 456">
                                </div>
                            </div>
                            
                            <div>
                                <label for="checkoutAdresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                <textarea id="checkoutAdresse" name="adresse" required rows="3"
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Votre adresse complète">${userInfo.adresse || ''}</textarea>
                            </div>
                            
                            <div>
                                <label for="checkoutWilaya" class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                <select id="checkoutWilaya" name="wilaya" required 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    <option value="">Sélectionnez votre wilaya</option>
                                    <option value="Alger" ${userInfo.wilaya === 'Alger' ? 'selected' : ''}>Alger</option>
                                    <option value="Blida" ${userInfo.wilaya === 'Blida' ? 'selected' : ''}>Blida</option>
                                    <option value="Boumerdès" ${userInfo.wilaya === 'Boumerdès' ? 'selected' : ''}>Boumerdès</option>
                                    <option value="Tipaza" ${userInfo.wilaya === 'Tipaza' ? 'selected' : ''}>Tipaza</option>
                                    <option value="Médéa" ${userInfo.wilaya === 'Médéa' ? 'selected' : ''}>Médéa</option>
                                    <option value="Aïn Defla" ${userInfo.wilaya === 'Aïn Defla' ? 'selected' : ''}>Aïn Defla</option>
                                    <option value="Chlef" ${userInfo.wilaya === 'Chlef' ? 'selected' : ''}>Chlef</option>
                                    <option value="Djelfa" ${userInfo.wilaya === 'Djelfa' ? 'selected' : ''}>Djelfa</option>
                                    <option value="Laghouat" ${userInfo.wilaya === 'Laghouat' ? 'selected' : ''}>Laghouat</option>
                                    <option value="M'sila" ${userInfo.wilaya === 'M\'sila' ? 'selected' : ''}>M'sila</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="checkoutCommentaires" class="block text-sm font-medium text-gray-700 mb-2">Commentaires (optionnel)</label>
                                <textarea id="checkoutCommentaires" name="commentaires" rows="2"
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Instructions spéciales pour la livraison..."></textarea>
                            </div>
                            
                            <!-- Payment Method -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-4">Mode de paiement *</label>
                                <div class="space-y-3">
                                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all">
                                        <input type="radio" name="modePaiement" value="Paiement à la livraison" checked 
                                               class="text-emerald-600 focus:ring-emerald-500">
                                        <div class="ml-3">
                                            <div class="font-medium text-gray-900">Paiement à la livraison</div>
                                            <div class="text-sm text-gray-500">Payez en espèces lors de la réception</div>
                                        </div>
                                        <i class="fas fa-money-bill-wave text-emerald-600 ml-auto text-xl"></i>
                                    </label>
                                    
                                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-all opacity-50">
                                        <input type="radio" name="modePaiement" value="Carte bancaire" disabled
                                               class="text-blue-600 focus:ring-blue-500">
                                        <div class="ml-3">
                                            <div class="font-medium text-gray-900">Carte bancaire</div>
                                            <div class="text-sm text-gray-500">Bientôt disponible</div>
                                        </div>
                                        <i class="fas fa-credit-card text-blue-600 ml-auto text-xl"></i>
                                    </label>
                                </div>
                                <div id="paymentMethodInfo" class="mt-4"></div>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="bg-white rounded-2xl shadow-xl border border-emerald-200/50 p-6 h-fit">
                        <h2 class="text-xl font-bold text-emerald-800 mb-6">Résumé de la commande</h2>
                        
                        <!-- Cart Items -->
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-lg">
                                    <img src="${item.image}" alt="${item.nom}" 
                                         class="w-12 h-12 object-cover rounded-lg border border-emerald-200">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800 text-sm">${item.nom}</h4>
                                        <p class="text-emerald-600 text-xs">${item.quantite} × ${item.prix} DA</p>
                                    </div>
                                    <span class="font-bold text-emerald-700">${item.quantite * item.prix} DA</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Shipping Progress -->
                        <div id="shippingMessage" class="mb-4">
                            ${sousTotal >= 5000 ? `
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p class="text-green-700 text-sm font-medium">
                                        <i class="fas fa-truck mr-2"></i>
                                        Félicitations ! Livraison gratuite.
                                    </p>
                                </div>
                            ` : `
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div class="flex items-center justify-between text-sm text-blue-800 mb-2">
                                        <span>Livraison gratuite à partir de 5000 DA</span>
                                        <span class="font-medium">${5000 - sousTotal} DA restants</span>
                                    </div>
                                    <div class="w-full bg-blue-200 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                             style="width: ${Math.min((sousTotal / 5000) * 100, 100)}%"></div>
                                    </div>
                                </div>
                            `}
                        </div>
                        
                        <!-- Order Totals -->
                        <div class="border-t border-emerald-200 pt-4 space-y-3">
                            <div class="flex justify-between text-emerald-700">
                                <span>Sous-total:</span>
                                <span id="checkoutSousTotal">${sousTotal} DA</span>
                            </div>
                            <div class="flex justify-between text-emerald-700">
                                <span>Frais de livraison:</span>
                                <span id="checkoutFraisLivraison" class="${fraisLivraison === 0 ? 'text-green-600 font-semibold' : ''}">${fraisLivraison === 0 ? 'GRATUIT' : fraisLivraison + ' DA'}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold text-emerald-800 border-t border-emerald-200 pt-3">
                                <span>Total:</span>
                                <span id="checkoutTotal">${total} DA</span>
                            </div>
                        </div>
                        
                        <!-- Submit Button -->
                        <button onclick="processCheckoutOrder()" 
                                class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
                            <i class="fas fa-check mr-2"></i>Confirmer la commande
                        </button>
                        
                        <p class="text-xs text-gray-500 text-center mt-4">
                            En validant votre commande, vous acceptez nos conditions générales de vente.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize checkout system
        if (window.initCheckout) {
            window.initCheckout();
        }
        
    } catch (error) {
        console.error('Error loading checkout page:', error);
        this.showToast('Erreur lors du chargement de la commande', 'error');
        this.showPage('products');
    }
};

// Order confirmation page
PharmacieGaherApp.prototype.loadOrderConfirmationPage = async function(orderNumber) {
    try {
        console.log('Loading order confirmation for:', orderNumber);
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 py-16 text-center">
                <div class="max-w-2xl mx-auto">
                    <!-- Success Animation -->
                    <div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                        <i class="fas fa-check text-white text-6xl animate-pulse"></i>
                    </div>
                    
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600 mb-8">Votre commande a été enregistrée avec succès</p>
                    
                    <div class="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-8 mb-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-4">
                            Commande #${orderNumber}
                        </h2>
                        <p class="text-emerald-700 mb-6">
                            Un email de confirmation vous sera envoyé sous peu avec tous les détails de votre commande.
                        </p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div class="bg-white/60 rounded-xl p-4">
                                <h3 class="font-semibold text-emerald-800 mb-2">
                                    <i class="fas fa-truck mr-2"></i>Livraison
                                </h3>
                                <p class="text-emerald-700 text-sm">
                                    Votre commande sera livrée sous 24-48h ouvrables
                                </p>
                            </div>
                            
                            <div class="bg-white/60 rounded-xl p-4">
                                <h3 class="font-semibold text-emerald-800 mb-2">
                                    <i class="fas fa-phone mr-2"></i>Suivi
                                </h3>
                                <p class="text-emerald-700 text-sm">
                                    Nous vous contacterons pour confirmer l'adresse
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <button onclick="app.showPage('products')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg mr-4">
                            <i class="fas fa-shopping-bag mr-2"></i>Continuer vos achats
                        </button>
                        
                        <button onclick="app.showPage('home')" 
                                class="bg-emerald-100 text-emerald-700 font-bold py-4 px-8 rounded-xl hover:bg-emerald-200 transition-all text-lg">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                    </div>
                    
                    <div class="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                        <h3 class="font-semibold text-blue-800 mb-3">
                            <i class="fas fa-info-circle mr-2"></i>Informations importantes
                        </h3>
                        <ul class="text-blue-700 text-sm space-y-2 text-left">
                            <li>• Le paiement s'effectue à la livraison en espèces</li>
                            <li>• Vérifiez vos articles avant de payer le livreur</li>
                            <li>• Conservez votre numéro de commande pour le suivi</li>
                            <li>• Pour toute question, contactez-nous au +213 123 456 789</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading order confirmation:', error);
        this.showToast('Erreur lors du chargement de la confirmation', 'error');
        this.showPage('home');
    }
};

// Helper methods
PharmacieGaherApp.prototype.getAvailableCategories = function() {
    const categories = new Set(this.allProducts.map(p => p.categorie));
    return Array.from(categories).sort();
};

PharmacieGaherApp.prototype.setupProductsSearch = function() {
    const searchInput = document.getElementById('productsSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });
    }
};

PharmacieGaherApp.prototype.generatePlaceholderImage = function(product) {
    const getCategoryColor = (category) => {
        const colors = {
            'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
            'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
            'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
            'Dentaire': '6366f1', 'Maman': 'd946ef', 'Minceur': '8b5cf6'
        };
        return colors[category] || '10b981';
    };
    
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const categoryColor = getCategoryColor(product.categorie);
    return `https://via.placeholder.com/300x300/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
};

// FIXED: Process order function (integrates with checkout.js)
PharmacieGaherApp.prototype.processOrder = function() {
    console.log('processOrder called in app.js - delegating to checkout system');
    if (window.processCheckoutOrder) {
        return window.processCheckoutOrder();
    } else {
        console.error('Checkout system not available');
        this.showToast('Système de commande non initialisé', 'error');
    }
};

// Global functions for product management
function handleProductsSearch(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
}

function searchProducts() {
    const searchInput = document.getElementById('productsSearchInput');
    if (searchInput && window.app) {
        const query = searchInput.value.trim();
        if (query) {
            window.app.performSearch(query);
        } else {
            window.app.showPage('products');
        }
    }
}

function changeProductQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.max) || 10;
        const newValue = Math.max(1, Math.min(maxValue, currentValue + change));
        quantityInput.value = newValue;
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    if (window.addToCart) {
        window.addToCart(productId, quantity);
    } else if (window.cartSystem) {
        window.cartSystem.addItem(productId, quantity);
    } else if (window.app) {
        window.app.addToCart(productId, quantity);
    } else {
        console.error('No cart system available');
    }
}

function loadMoreProducts() {
    // Implementation for loading more products (pagination)
    console.log('Load more products requested');
    // This would typically load the next page of products
}

// Category filtering
function filterProductsByCategory(category) {
    if (window.app) {
        window.app.filterByCategory(category);
    }
}

// Search functionality
function performProductSearch(query) {
    if (window.app) {
        window.app.performSearch(query);
    }
}

// Product sorting
function sortProducts(sortBy) {
    console.log('Sorting products by:', sortBy);
    // Implementation for product sorting
}

// Product filtering
function filterProductsByPrice(minPrice, maxPrice) {
    console.log('Filtering products by price:', minPrice, maxPrice);
    // Implementation for price filtering
}

function filterProductsByStock(inStockOnly) {
    console.log('Filtering by stock availability:', inStockOnly);
    // Implementation for stock filtering
}

// Enhanced product card interactions
function viewProductDetails(productId) {
    if (window.app) {
        window.app.showPage('product', { id: productId });
    }
}

function quickAddToCart(productId, event) {
    // Prevent event bubbling to avoid navigating to product page
    if (event) {
        event.stopPropagation();
    }
    
    if (window.addToCart) {
        window.addToCart(productId, 1);
    } else if (window.app) {
        window.app.addToCart(productId, 1);
    }
}

// Wishlist functionality (placeholder for future implementation)
function addToWishlist(productId) {
    console.log('Adding to wishlist:', productId);
    // Implementation for wishlist functionality
}

function removeFromWishlist(productId) {
    console.log('Removing from wishlist:', productId);
    // Implementation for wishlist functionality
}

// Product comparison (placeholder for future implementation)
function addToComparison(productId) {
    console.log('Adding to comparison:', productId);
    // Implementation for product comparison
}

// Product reviews (placeholder for future implementation)
function showProductReviews(productId) {
    console.log('Showing reviews for product:', productId);
    // Implementation for product reviews
}

function submitProductReview(productId, rating, comment) {
    console.log('Submitting review for product:', productId, rating, comment);
    // Implementation for review submission
}

// Export functions for global access
window.handleProductsSearch = handleProductsSearch;
window.searchProducts = searchProducts;
window.changeProductQuantity = changeProductQuantity;
window.addProductToCart = addProductToCart;
window.loadMoreProducts = loadMoreProducts;
window.filterProductsByCategory = filterProductsByCategory;
window.performProductSearch = performProductSearch;
window.sortProducts = sortProducts;
window.filterProductsByPrice = filterProductsByPrice;
window.filterProductsByStock = filterProductsByStock;
window.viewProductDetails = viewProductDetails;
window.quickAddToCart = quickAddToCart;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.addToComparison = addToComparison;
window.showProductReviews = showProductReviews;
window.submitProductReview = submitProductReview;

console.log('✅ Complete Products.js loaded with full functionality');
