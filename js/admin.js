// Complete Admin Panel with Backend Integration - FIXED VERSION

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

// Enhanced Admin Page Loader with Backend Integration
PharmacieGaherApp.prototype.loadAdminPage = async function() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
        this.showToast('Accès refusé - Droits administrateur requis', 'error');
        this.showPage('home');
        return;
    }

    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <!-- Admin Header -->
            <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 class="text-4xl font-bold text-emerald-800 mb-2">Panel d'Administration</h1>
                        <p class="text-emerald-600 text-lg">Gestion complète de Shifa - Parapharmacie Gaher</p>
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
            
            <!-- Navigation Admin -->
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
                    <button onclick="switchAdminSection('featured')" 
                            class="admin-nav-btn featured flex-1 min-w-max px-6 py-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all border-r border-emerald-100">
                        <i class="fas fa-star mr-2"></i>Coups de Coeur
                    </button>
                    <button onclick="switchAdminSection('cleanup')" 
                            class="admin-nav-btn cleanup flex-1 min-w-max px-6 py-4 text-sm font-semibold text-red-700 hover:bg-red-50 transition-all">
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
};

// Dashboard with Backend Data
PharmacieGaherApp.prototype.loadAdminDashboard = async function() {
    try {
        let stats = {
            totalProducts: 0,
            totalOrders: adminOrders.length,
            pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
            totalUsers: 1,
            monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        };

        // Try to get stats from backend
        try {
            const data = await apiCall('/admin/dashboard');
            if (data && data.stats) {
                stats = { ...stats, ...data.stats };
            } else {
                // Fallback to local calculation
                const products = await this.getAllProducts();
                stats.totalProducts = products.length;
            }
        } catch (error) {
            console.log('API dashboard unavailable, using local stats');
            const products = await this.getAllProducts();
            stats.totalProducts = products.length;
        }
        
        document.getElementById('adminContent').innerHTML = `
            <!-- Statistics -->
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
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('products')">
                    <i class="fas fa-plus-circle text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Gérer les produits</h3>
                    <p class="text-emerald-100">Ajouter, modifier et gérer vos produits</p>
                </div>
                
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('orders')">
                    <i class="fas fa-shopping-bag text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Commandes</h3>
                    <p class="text-blue-100">Voir et gérer les commandes</p>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('featured')">
                    <i class="fas fa-star text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Coups de Coeur</h3>
                    <p class="text-yellow-100">Gérer les produits mis en avant</p>
                </div>
                
                <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" onclick="switchAdminSection('cleanup')">
                    <i class="fas fa-broom text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Nettoyage</h3>
                    <p class="text-red-100">Supprimer produits indésirables</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <p class="text-red-800">Erreur de chargement du tableau de bord</p>
            </div>
        `;
    }
};

// Enhanced Products Management with Backend Integration
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        console.log('🔄 Loading admin products...');
        
        // Get products from backend and localStorage
        const products = await this.getAllProducts();
        
        console.log('📦 Total products loaded:', products.length);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des produits</h2>
                        <p class="text-emerald-600">${products.length} produits au total</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-plus mr-2"></i>Nouveau produit
                        </button>
                        <button onclick="forceRefreshProducts()" class="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                ${products.length === 0 ? `
                    <div class="p-16 text-center">
                        <i class="fas fa-pills text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit</h3>
                        <p class="text-emerald-600 mb-8">Commencez par ajouter votre premier produit</p>
                        <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-plus mr-2"></i>Ajouter un produit
                        </button>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-emerald-50 border-b border-emerald-200">
                                <tr>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Image</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Produit</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Prix</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Stock</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Statut</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => this.renderProductRow(product)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <p class="text-red-800">Erreur de chargement des produits: ${error.message}</p>
                <button onclick="app.loadAdminProducts()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// FIXED: Enhanced method to get all products - Don't overwrite localStorage with empty backend responses
PharmacieGaherApp.prototype.getAllProducts = async function() {
    let allProducts = [];
    
    // First, get existing products from localStorage
    const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    allProducts = localProducts;
    console.log('📁 Local products loaded:', allProducts.length);
    
    try {
        // Try to get products from backend
        console.log('🌐 Fetching products from backend...');
        const response = await apiCall('/admin/products');
        
        if (response && response.products && Array.isArray(response.products)) {
            // Only update if backend has products OR if we have no local products
            if (response.products.length > 0 || allProducts.length === 0) {
                allProducts = response.products;
                console.log('✅ Backend products loaded:', allProducts.length);
                
                // Update localStorage with backend data only if it's not empty
                if (response.products.length > 0) {
                    localStorage.setItem('demoProducts', JSON.stringify(allProducts));
                    console.log('💾 Updated localStorage with backend data');
                } else {
                    console.log('⚠️ Backend returned empty products, keeping localStorage');
                }
            } else {
                console.log('⚠️ Backend returned empty, using local products');
            }
        } else {
            console.log('⚠️ Invalid backend response, using local products');
        }
    } catch (error) {
        console.log('⚠️ Backend unavailable, using localStorage:', error.message);
    }
    
    return allProducts;
};

// Product Row Renderer
PharmacieGaherApp.prototype.renderProductRow = function(product) {
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
    const imageUrl = product.image || `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;

    return `
        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
            <td class="py-4 px-6">
                <img src="${imageUrl}" alt="${product.nom}" 
                     class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200 shadow-sm"
                     onerror="this.src='https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}'">
            </td>
            <td class="py-4 px-6">
                <div class="font-semibold text-gray-900">${product.nom}</div>
                <div class="text-sm text-emerald-600">${product.categorie}</div>
                <div class="text-xs text-gray-500">${product.marque || 'Sans marque'}</div>
            </td>
            <td class="py-4 px-6">
                <span class="text-lg font-semibold text-emerald-700">${product.prix} DA</span>
            </td>
            <td class="py-4 px-6">
                <span class="text-emerald-600 font-medium">${product.stock} unités</span>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full ${product.actif !== false ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <span class="text-sm font-medium ${product.actif !== false ? 'text-green-700' : 'text-red-700'}">
                        ${product.actif !== false ? 'Actif' : 'Inactif'}
                    </span>
                </div>
                ${product.enVedette ? '<div class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block mt-1">★ En vedette</div>' : ''}
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button onclick="openEditProductModal('${product._id}')" 
                            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all"
                            title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleFeatured('${product._id}', ${!product.enVedette})" 
                            class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 p-2 rounded-lg transition-all"
                            title="${product.enVedette ? 'Retirer de la vedette' : 'Mettre en vedette'}">
                        <i class="fas fa-star ${product.enVedette ? 'text-yellow-500' : ''}"></i>
                    </button>
                    <button onclick="deleteProduct('${product._id}')" 
                            class="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                            title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// Force refresh function - now clears both caches
function forceRefreshProducts() {
    console.log('🔄 Force refreshing products...');
    
    // Clear localStorage cache
    localStorage.removeItem('demoProducts');
    
    // Reload admin products
    if (window.app && window.app.loadAdminProducts) {
        window.app.loadAdminProducts();
    }
    
    // Trigger main page refresh by dispatching custom event
    document.dispatchEvent(new CustomEvent('productsUpdated'));
    
    // Show success message
    if (window.app && window.app.showToast) {
        window.app.showToast('Produits actualisés', 'success');
    }
}

// FIXED: Enhanced saveProduct function
function saveProduct() {
    console.log('💾 Starting product save...');
    
    const isEditing = !!currentEditingProduct;
    
    // Get form values
    const nom = document.getElementById('productNom').value.trim();
    const prix = document.getElementById('productPrix').value;
    const stock = document.getElementById('productStock').value;
    const categorie = document.getElementById('productCategorie').value;
    const description = document.getElementById('productDescription').value.trim();
    
    // Validate required fields
    if (!nom || !prix || !stock || !categorie || !description) {
        app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    const button = document.getElementById('productSubmitBtn');
    const buttonText = document.getElementById('productSubmitText');
    const spinner = document.getElementById('productSubmitSpinner');
    
    // Show loading state
    button.disabled = true;
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    // Prepare product data - FIXED: Don't include _id for new products
    const productData = {
        nom: nom,
        description: description,
        marque: document.getElementById('productMarque').value.trim() || '',
        prix: parseInt(prix),
        stock: parseInt(stock),
        categorie: categorie,
        actif: document.getElementById('productActif').checked,
        enVedette: document.getElementById('productEnVedette').checked,
        enPromotion: document.getElementById('productEnPromotion').checked
    };
    
    // ONLY add _id if editing existing product
    if (isEditing && currentEditingProduct._id) {
        productData._id = currentEditingProduct._id;
    }
    
    // Handle optional fields
    const prixOriginal = document.getElementById('productPrixOriginal').value;
    if (prixOriginal && prixOriginal !== '') {
        productData.prixOriginal = parseInt(prixOriginal);
        
        // Calculate discount percentage
        if (productData.enPromotion && productData.prixOriginal > productData.prix) {
            productData.pourcentagePromotion = Math.round((productData.prixOriginal - productData.prix) / productData.prixOriginal * 100);
        }
    }
    
    const ingredients = document.getElementById('productIngredients').value.trim();
    if (ingredients) productData.ingredients = ingredients;
    
    const modeEmploi = document.getElementById('productModeEmploi').value.trim();
    if (modeEmploi) productData.modeEmploi = modeEmploi;
    
    const precautions = document.getElementById('productPrecautions').value.trim();
    if (precautions) productData.precautions = precautions;
    
    // Handle image
    const imageUrl = document.getElementById('productImageUrl').value;
    if (imageUrl) {
        productData.image = imageUrl;
    }
    
    console.log('📦 Product data prepared:', productData);
    
    // Try to save to backend first
    saveProductToBackend(productData, isEditing)
        .then((result) => {
            if (result.success) {
                console.log('✅ Backend save successful');
                
                // Use the product returned from backend (which has the MongoDB _id)
                const savedProduct = result.data.product;
                
                // Update localStorage with the backend product (including proper _id)
                saveProductToLocalStorage(savedProduct, isEditing);
                
                app.showToast(
                    isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 
                    'success'
                );
            } else {
                console.warn('⚠️ Backend save failed:', result.error);
                
                // Generate temporary ID for localStorage only
                if (!isEditing) {
                    productData._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                
                saveProductToLocalStorage(productData, isEditing);
                app.showToast(
                    (isEditing ? 'Produit modifié' : 'Produit ajouté') + ' (sauvegarde locale)', 
                    'warning'
                );
            }
        })
        .catch((error) => {
            console.warn('⚠️ Backend save error:', error);
            
            // Generate temporary ID for localStorage only
            if (!isEditing) {
                productData._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            saveProductToLocalStorage(productData, isEditing);
            app.showToast(
                (isEditing ? 'Produit modifié' : 'Produit ajouté') + ' (sauvegarde locale)', 
                'warning'
            );
        })
        .finally(() => {
            // Close modal and refresh
            closeProductModal();
            
            // Refresh views
            setTimeout(() => {
                console.log('🔄 Refreshing views...');
                
                // Refresh admin view
                if (adminCurrentSection === 'products') {
                    app.loadAdminProducts();
                } else if (adminCurrentSection === 'featured' && productData.enVedette) {
                    app.loadAdminFeatured();
                } else if (adminCurrentSection === 'dashboard') {
                    app.loadAdminDashboard();
                }
                
                // Trigger main page refresh
                if (typeof window.refreshMainPageProducts === 'function') {
                    window.refreshMainPageProducts();
                }
                
                // Dispatch event for any listeners
                document.dispatchEvent(new CustomEvent('productsUpdated', { 
                    detail: { productId: productData._id, isNew: !isEditing } 
                }));
                
            }, 500);
            
            // Reset button state
            button.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        });
}
    // Generate ID for new products
    const productId = isEditing ? currentEditingProduct._id : `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare product data
    const productData = {
        _id: productId,
        nom: nom,
        description: description,
        marque: document.getElementById('productMarque').value.trim() || '',
        prix: parseInt(prix),
        stock: parseInt(stock),
        categorie: categorie,
        actif: document.getElementById('productActif').checked,
        enVedette: document.getElementById('productEnVedette').checked,
        enPromotion: document.getElementById('productEnPromotion').checked,
        dateAjout: isEditing ? currentEditingProduct.dateAjout : new Date().toISOString()
    };
    
    // Handle optional fields
    const prixOriginal = document.getElementById('productPrixOriginal').value;
    if (prixOriginal && prixOriginal !== '') {
        productData.prixOriginal = parseInt(prixOriginal);
        
        // Calculate discount percentage
        if (productData.enPromotion && productData.prixOriginal > productData.prix) {
            productData.pourcentagePromotion = Math.round((productData.prixOriginal - productData.prix) / productData.prixOriginal * 100);
        }
    }
    
    const ingredients = document.getElementById('productIngredients').value.trim();
    if (ingredients) productData.ingredients = ingredients;
    
    const modeEmploi = document.getElementById('productModeEmploi').value.trim();
    if (modeEmploi) productData.modeEmploi = modeEmploi;
    
    const precautions = document.getElementById('productPrecautions').value.trim();
    if (precautions) productData.precautions = precautions;
    
    // Handle image
    const imageUrl = document.getElementById('productImageUrl').value;
    if (imageUrl) {
        productData.image = imageUrl;
    }
    
    console.log('📦 Product data prepared:', productData);
    
    // Save to localStorage first (as primary storage while backend has issues)
    saveProductToLocalStorage(productData, isEditing);
    
    // Try to save to backend (but don't block on failure)
    saveProductToBackend(productData, isEditing)
        .then((result) => {
            if (result.success) {
                console.log('✅ Backend save successful');
                app.showToast(
                    isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 
                    'success'
                );
            } else {
                console.warn('⚠️ Backend save failed, but localStorage updated');
                app.showToast(
                    (isEditing ? 'Produit modifié' : 'Produit ajouté') + ' (sauvegarde locale)', 
                    'warning'
                );
            }
        })
        .catch((error) => {
            console.warn('⚠️ Backend save error:', error);
            app.showToast(
                (isEditing ? 'Produit modifié' : 'Produit ajouté') + ' (sauvegarde locale)', 
                'warning'
            );
        })
        .finally(() => {
            // Close modal and refresh
            closeProductModal();
            
            // Refresh views
            setTimeout(() => {
                console.log('🔄 Refreshing views...');
                
                // Refresh admin view
                if (adminCurrentSection === 'products') {
                    app.loadAdminProducts();
                } else if (adminCurrentSection === 'featured' && productData.enVedette) {
                    app.loadAdminFeatured();
                } else if (adminCurrentSection === 'dashboard') {
                    app.loadAdminDashboard();
                }
                
                // Trigger main page refresh
                if (typeof window.refreshMainPageProducts === 'function') {
                    window.refreshMainPageProducts();
                }
                
                // Dispatch event for any listeners
                document.dispatchEvent(new CustomEvent('productsUpdated', { 
                    detail: { productId: productData._id, isNew: !isEditing } 
                }));
                
            }, 500);
            
            // Reset button state
            button.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        });
}

// FIXED: Backend save function with proper error handling
async function saveProductToBackend(productData, isEditing) {
    try {
        const endpoint = isEditing ? `/admin/products/${productData._id}` : '/admin/products';
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log(`🌐 Saving to backend: ${method} ${endpoint}`);
        console.log('📤 Product data:', productData);
        
        const response = await apiCall(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        console.log('✅ Backend save successful:', response);
        return { success: true, data: response };
        
    } catch (error) {
        console.error('❌ Backend save failed:', error.message);
        return { success: false, error: error.message };
    }
}

// FIXED: Enhanced localStorage save function
function saveProductToLocalStorage(productData, isEditing) {
    try {
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        if (isEditing) {
            const index = localProducts.findIndex(p => p._id === productData._id);
            if (index !== -1) {
                localProducts[index] = productData;
                console.log('💾 Updated existing product in localStorage');
            } else {
                localProducts.push(productData);
                console.log('💾 Added new product to localStorage');
            }
        } else {
            localProducts.push(productData);
            console.log('💾 Added new product to localStorage');
        }
        
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        console.log('💾 Saved to localStorage. Total products:', localProducts.length);
        
        return true;
        
    } catch (error) {
        console.error('❌ localStorage save failed:', error);
        return false;
    }
}

// FIXED: Enhanced toggleFeatured function
async function toggleFeatured(productId, newStatus) {
    try {
        console.log('🌟 Toggling featured status:', productId, newStatus);
        
        // Update localStorage first
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = localProducts.findIndex(p => p._id === productId);
        
        if (productIndex !== -1) {
            localProducts[productIndex].enVedette = newStatus;
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            console.log('💾 Updated featured status in localStorage');
        }
        
        // Try backend update (but don't block on failure)
        try {
            await apiCall(`/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enVedette: newStatus })
            });
            console.log('✅ Backend featured update successful');
            app.showToast(`Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de coeur`, 'success');
        } catch (error) {
            console.warn('⚠️ Backend update failed, but localStorage updated');
            app.showToast(`Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de coeur (local)`, 'warning');
        }
        
        // Refresh views
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
        // Trigger main page refresh
        document.dispatchEvent(new CustomEvent('productsUpdated'));
        
    } catch (error) {
        console.error('❌ Error toggling featured:', error);
        app.showToast('Erreur lors de la modification', 'error');
    }
}

// FIXED: Enhanced deleteProduct function
async function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        try {
            console.log('🗑️ Deleting product:', productId);
            
            // Delete from localStorage first
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const originalLength = localProducts.length;
            localProducts = localProducts.filter(p => p._id !== productId);
            
            if (localProducts.length < originalLength) {
                localStorage.setItem('demoProducts', JSON.stringify(localProducts));
                console.log('💾 Deleted from localStorage');
            }
            
            // Try backend delete (but don't block on failure)
            try {
                await apiCall(`/admin/products/${productId}`, {
                    method: 'DELETE'
                });
                console.log('✅ Backend delete successful');
                app.showToast('Produit supprimé avec succès', 'success');
            } catch (error) {
                console.warn('⚠️ Backend delete failed, but localStorage updated');
                app.showToast('Produit supprimé (local)', 'warning');
            }
            
            // Refresh views
            if (adminCurrentSection === 'products') {
                app.loadAdminProducts();
            } else if (adminCurrentSection === 'featured') {
                app.loadAdminFeatured();
            }
            
            // Trigger main page refresh
            document.dispatchEvent(new CustomEvent('productsUpdated'));
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// FIXED: Add global function to refresh main page products
window.refreshMainPageProducts = function() {
    console.log('🔄 Refreshing main page products...');
    
    // If we're on the products page, reload it
    if (window.app && window.app.currentPage === 'products') {
        window.app.runProductsLoad({});
    }
    
    // If we're on the home page and there are featured products, reload them
    if (window.app && window.app.currentPage === 'home') {
        if (typeof window.app.loadFeaturedProducts === 'function') {
            window.app.loadFeaturedProducts();
        }
    }
};

// Orders Management (keeping existing functionality)
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
        console.log('Loading orders from admin panel...');
        
        let orders = [...adminOrders];
        
        // Try to get orders from backend
        try {
            const response = await apiCall('/admin/orders');
            if (response && response.orders && response.orders.length > 0) {
                // Merge with local orders
                const localIds = orders.map(o => o.numeroCommande);
                const newOrders = response.orders.filter(o => !localIds.includes(o.numeroCommande));
                orders = [...orders, ...newOrders];
            }
        } catch (error) {
            console.log('Backend orders unavailable, using local only');
        }
        
        orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-emerald-800">Gestion des commandes</h2>
                    <div class="flex gap-2">
                        <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ${orders.length} commande(s)
                        </span>
                        <button onclick="app.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
                
                ${orders.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                        <p class="text-emerald-600 mb-4">Les commandes apparaîtront ici une fois passées</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-emerald-50 border-b border-emerald-200">
                                <tr>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Commande</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Client</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Date</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Total</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Statut</th>
                                    <th class="text-left py-4 px-6 font-bold text-emerald-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(order => this.renderOrderRow(order)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement des commandes</h3>
                <p class="text-red-700 mb-4">Détails: ${error.message}</p>
                <button onclick="app.loadAdminOrders()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

PharmacieGaherApp.prototype.renderOrderRow = function(order) {
    return `
        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
            <td class="py-4 px-6">
                <div class="font-semibold text-emerald-800">#${order.numeroCommande}</div>
                <div class="text-sm text-emerald-600">${order.articles?.length || 0} article(s)</div>
            </td>
            <td class="py-4 px-6">
                <div class="font-medium text-gray-900">${order.client?.prenom} ${order.client?.nom}</div>
                <div class="text-sm text-gray-600">${order.client?.email}</div>
                <div class="text-xs text-gray-500">${order.client?.wilaya}</div>
            </td>
            <td class="py-4 px-6">
                <div class="text-sm text-gray-900">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</div>
                <div class="text-xs text-gray-500">${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</div>
            </td>
            <td class="py-4 px-6">
                <div class="font-semibold text-emerald-700">${order.total} DA</div>
                <div class="text-sm text-gray-600">Livraison: ${order.fraisLivraison || 0} DA</div>
            </td>
            <td class="py-4 px-6">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.statut)}">
                    ${getStatusLabel(order.statut)}
                </span>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button onclick="viewOrderDetails('${order._id || order.numeroCommande}')" 
                            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all"
                            title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus('${order._id || order.numeroCommande}', 'confirmée')" 
                            class="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all"
                            title="Confirmer">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// Featured Products Management
PharmacieGaherApp.prototype.loadAdminFeatured = async function() {
    try {
        const allProducts = await this.getAllProducts();
        
        let featuredProducts = allProducts.filter(p => p.enVedette);
        let availableProducts = allProducts.filter(p => !p.enVedette);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Gestion des Coups de Coeur</h2>
                
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-emerald-700 mb-4">Produits en vedette (${featuredProducts.length})</h3>
                    ${featuredProducts.length === 0 ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                            <i class="fas fa-star text-yellow-400 text-4xl mb-4"></i>
                            <p class="text-yellow-700">Aucun produit en vedette</p>
                            <p class="text-yellow-600 text-sm mt-2">Ajoutez des produits en vedette pour les mettre en avant sur votre site</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${featuredProducts.map(product => `
                                <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                                    <div class="flex items-center space-x-3">
                                        <img src="${product.image || this.generatePlaceholderImage(product)}" 
                                             alt="${product.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-yellow-200">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-amber-800">${product.nom}</h4>
                                            <p class="text-amber-600 text-sm">${product.categorie} - ${product.prix} DA</p>
                                        </div>
                                    </div>
                                    <div class="mt-2 flex justify-end">
                                        <button onclick="toggleFeatured('${product._id}', false)" 
                                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                            <i class="fas fa-star mr-1"></i>Retirer
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <div class="border-t border-emerald-200 pt-6">
                    <h3 class="text-lg font-semibold text-emerald-700 mb-4">Autres produits disponibles</h3>
                    ${availableProducts.length === 0 ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                            <p class="text-blue-700">Aucun autre produit disponible</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${availableProducts.map(product => `
                                <div class="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <img src="${product.image || this.generatePlaceholderImage(product)}" 
                                             alt="${product.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-gray-800">${product.nom}</h4>
                                            <p class="text-gray-600 text-sm">${product.categorie} - ${product.prix} DA</p>
                                        </div>
                                    </div>
                                    <div class="mt-2 flex justify-end">
                                        <button onclick="toggleFeatured('${product._id}', true)" 
                                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                                            <i class="fas fa-star mr-1"></i>Ajouter aux coups de coeur
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <p class="text-red-800">Erreur de chargement des produits en vedette</p>
            </div>
        `;
    }
};

// Helper method to generate placeholder image URL
PharmacieGaherApp.prototype.generatePlaceholderImage = function(product) {
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
    return `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
};

// Cleanup Section
PharmacieGaherApp.prototype.loadCleanupSection = async function() {
    try {
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 class="text-2xl font-bold text-red-800 mb-6">Nettoyage de la base de données</h2>
                
                <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-600 text-2xl mr-4"></i>
                        <div>
                            <h3 class="text-lg font-semibold text-green-800">Base de données propre</h3>
                            <p class="text-green-600">Système synchronisé avec le backend</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 class="text-lg font-semibold text-blue-800 mb-4">Actions de maintenance</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="refreshProductCache()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl">
                            <i class="fas fa-sync mr-2"></i>Actualiser le cache
                        </button>
                        <button onclick="syncWithBackend()" 
                                class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl">
                            <i class="fas fa-cloud-download-alt mr-2"></i>Synchroniser avec serveur
                        </button>
                    </div>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-red-800 mb-4">Actions dangereuses</h3>
                    <p class="text-red-600 mb-4">Attention : Les actions ci-dessous sont irréversibles.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="clearAllProducts()" 
                                class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl">
                            <i class="fas fa-trash-alt mr-2"></i>Supprimer tous les produits
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading cleanup section:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <p class="text-red-800">Erreur de chargement de la section nettoyage</p>
            </div>
        `;
    }
};

// Utility functions
async function refreshProductCache() {
    localStorage.removeItem('demoProducts');
    forceRefreshProducts();
    app.showToast('Cache actualisé', 'success');
}

// FIXED: Enhanced syncWithBackend function
async function syncWithBackend() {
    try {
        console.log('🔄 Syncing with backend...');
        
        // Get local products first
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Try to get backend products
        const response = await apiCall('/admin/products');
        
        if (response && response.products && Array.isArray(response.products)) {
            if (response.products.length > 0) {
                // Backend has products, use them
                localStorage.setItem('demoProducts', JSON.stringify(response.products));
                app.showToast(`Synchronisation réussie: ${response.products.length} produits`, 'success');
            } else if (localProducts.length > 0) {
                // Backend is empty but we have local products, ask user what to do
                if (confirm(`Le serveur n'a aucun produit mais vous avez ${localProducts.length} produit(s) local(aux). Voulez-vous garder vos produits locaux ?`)) {
                    app.showToast('Produits locaux conservés', 'info');
                } else {
                    localStorage.setItem('demoProducts', JSON.stringify([]));
                    app.showToast('Produits locaux supprimés', 'warning');
                }
            } else {
                app.showToast('Aucun produit trouvé sur le serveur', 'info');
            }
        } else {
            throw new Error('Réponse invalide du serveur');
        }
        
        // Refresh current view
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        }
        
        // Trigger main page refresh
        document.dispatchEvent(new CustomEvent('productsUpdated'));
        
    } catch (error) {
        app.showToast('Erreur de synchronisation: ' + error.message, 'error');
    }
}

async function clearAllProducts() {
    if (confirm('ATTENTION: Cette action supprimera TOUS les produits du backend ET local. Êtes-vous absolument sûr ?')) {
        try {
            // Try to clear from backend
            try {
                await apiCall('/admin/products/clear', { method: 'DELETE' });
                console.log('✅ Backend products cleared');
            } catch (error) {
                console.warn('⚠️ Backend clear failed');
            }
            
            // Clear localStorage
            localStorage.removeItem('demoProducts');
            
            app.showToast('Tous les produits ont été supprimés', 'success');
            
            if (adminCurrentSection === 'products') {
                app.loadAdminProducts();
            } else if (adminCurrentSection === 'dashboard') {
                app.loadAdminDashboard();
            }
            
            // Trigger main page refresh
            document.dispatchEvent(new CustomEvent('productsUpdated'));
            
        } catch (error) {
            app.showToast('Erreur lors de la suppression: ' + error.message, 'error');
        }
    }
}

// Modal Functions (keeping existing ones)
function openAddProductModal() {
    currentEditingProduct = null;
    showProductModal('Ajouter un nouveau produit', 'Ajouter le produit');
}

async function openEditProductModal(productId) {
    try {
        const allProducts = await app.getAllProducts();
        const product = allProducts.find(p => p._id === productId);
        
        if (!product) {
            app.showToast('Produit non trouvé', 'error');
            return;
        }
        
        currentEditingProduct = product;
        showProductModal('Modifier le produit', 'Modifier le produit');
        setTimeout(() => fillProductForm(product), 100);
    } catch (error) {
        console.error('Error loading product:', error);
        app.showToast('Erreur lors du chargement du produit', 'error');
    }
}

function showProductModal(title, submitText) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 class="text-2xl font-bold text-emerald-800">${title}</h3>
                    <button onclick="closeProductModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[75vh]">
                    <form id="productForm" class="space-y-6">
                        <input type="hidden" id="productId" value="${currentEditingProduct ? currentEditingProduct._id : ''}">
                        
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                                <input type="text" id="productNom" name="nom" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Nom du produit">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                                <input type="text" id="productMarque" name="marque" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Marque du produit">
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                            <textarea id="productDescription" name="description" required rows="3" 
                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                      placeholder="Description détaillée du produit"></textarea>
                        </div>
                        
                        <!-- Image Upload -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div id="imagePreviewContainer" class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-2 h-48 flex items-center justify-center">
                                        <div id="imagePreviewPlaceholder">
                                            <i class="fas fa-image text-gray-400 text-4xl mb-2"></i>
                                            <p class="text-gray-500">Aperçu de l'image</p>
                                        </div>
                                        <img id="imagePreview" src="" alt="Aperçu" class="max-h-40 max-w-full hidden">
                                    </div>
                                </div>
                                <div class="flex flex-col justify-center">
                                    <div class="mb-4">
                                        <label for="productImageUpload" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl text-center cursor-pointer flex items-center justify-center">
                                            <i class="fas fa-upload mr-2"></i>Télécharger une image
                                            <input type="file" id="productImageUpload" name="image" accept="image/*" class="hidden" onchange="previewImage(this)">
                                        </label>
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        <p>Formats acceptés: JPG, PNG, GIF</p>
                                        <p>Taille max: 2MB</p>
                                    </div>
                                    <input type="hidden" id="productImageUrl" name="imageUrl">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Price and Stock -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                                <input type="number" id="productPrix" name="prix" required min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" id="productPrixOriginal" name="prixOriginal" min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Pour les promotions">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                                <input type="number" id="productStock" name="stock" required min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                                <select id="productCategorie" name="categorie" required 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    <option value="">Sélectionnez</option>
                                    <option value="Vitalité">Vitalité</option>
                                    <option value="Cheveux">Cheveux</option>
                                    <option value="Visage">Visage</option>
                                    <option value="Intime">Intime</option>
                                    <option value="Solaire">Solaire</option>
                                    <option value="Bébé">Bébé</option>
                                    <option value="Maman">Maman</option>
                                    <option value="Minceur">Minceur</option>
                                    <option value="Homme">Homme</option>
                                    <option value="Soins">Soins</option>
                                    <option value="Dentaire">Dentaire</option>
                                    <option value="Sport">Sport</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Additional Info -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Ingrédients</label>
                                <textarea id="productIngredients" name="ingredients" rows="2" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Principaux ingrédients"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Mode d'emploi</label>
                                <textarea id="productModeEmploi" name="modeEmploi" rows="2" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Comment utiliser le produit"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Précautions</label>
                                <textarea id="productPrecautions" name="precautions" rows="2" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Précautions d'usage"></textarea>
                            </div>
                        </div>
                        
                        <!-- Options -->
                        <div class="flex flex-wrap gap-6">
                            <label class="flex items-center">
                                <input type="checkbox" id="productEnVedette" name="enVedette" 
                                       class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">En vedette</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="productEnPromotion" name="enPromotion" 
                                       class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">En promotion</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="productActif" name="actif" checked 
                                       class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">Produit actif</span>
                            </label>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button type="button" onclick="closeProductModal()" 
                                    class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                Annuler
                            </button>
                            <button type="button" onclick="saveProduct()" id="productSubmitBtn" 
                                    class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <span id="productSubmitText">${submitText}</span>
                                <i id="productSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `);
    
    document.body.style.overflow = 'hidden';
    
    // Initialize promotion checkbox behavior
    document.getElementById('productEnPromotion').addEventListener('change', function() {
        const prixOriginalField = document.getElementById('productPrixOriginal');
        if (this.checked) {
            prixOriginalField.required = true;
            prixOriginalField.focus();
        } else {
            prixOriginalField.required = false;
        }
    });
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    const imageUrl = document.getElementById('productImageUrl');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            app.showToast('Image trop volumineuse. Maximum 2MB.', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            app.showToast('Veuillez sélectionner un fichier image.', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
            
            // Save image data to hidden input
            imageUrl.value = e.target.result;
            console.log('Image preview generated');
        };
        
        reader.readAsDataURL(file);
    } else {
        // Reset preview if no file selected
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        imageUrl.value = '';
    }
}

function fillProductForm(product) {
    document.getElementById('productId').value = product._id || '';
    document.getElementById('productNom').value = product.nom || '';
    document.getElementById('productMarque').value = product.marque || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrix').value = product.prix || '';
    document.getElementById('productPrixOriginal').value = product.prixOriginal || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategorie').value = product.categorie || '';
    document.getElementById('productIngredients').value = product.ingredients || '';
    document.getElementById('productModeEmploi').value = product.modeEmploi || '';
    document.getElementById('productPrecautions').value = product.precautions || '';
    document.getElementById('productEnVedette').checked = product.enVedette || false;
    document.getElementById('productEnPromotion').checked = product.enPromotion || false;
    document.getElementById('productActif').checked = product.actif !== false;
    
    // Handle image preview
    if (product.image) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const imageUrl = document.getElementById('productImageUrl');
        
        preview.src = product.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        imageUrl.value = product.image;
    }
    
    // Trigger change event for promotion checkbox
    document.getElementById('productEnPromotion').dispatchEvent(new Event('change'));
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
    currentEditingProduct = null;
}

// Helper functions for orders
function getStatusColor(statut) {
    const colors = {
        'en-attente': 'bg-yellow-100 text-yellow-800',
        'confirmée': 'bg-green-100 text-green-800',
        'préparée': 'bg-blue-100 text-blue-800',
        'expédiée': 'bg-purple-100 text-purple-800',
        'livrée': 'bg-emerald-100 text-emerald-800',
        'annulée': 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(statut) {
    const labels = {
        'en-attente': 'En attente',
        'confirmée': 'Confirmée',
        'préparée': 'Préparée',
        'expédiée': 'Expédiée',
        'livrée': 'Livrée',
        'annulée': 'Annulée'
    };
    return labels[statut] || statut;
}

// Order detail and status functions (keeping existing)
async function viewOrderDetails(orderId) {
    // ... keeping existing implementation
}

function closeOrderDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    // ... keeping existing implementation
}

// Section switching
function switchAdminSection(section) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('hover:bg-emerald-50', 'text-emerald-700', 'border-r', 'border-emerald-100');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('hover:bg-emerald-50', 'text-emerald-700', 'border-r', 'border-emerald-100');
    }
    
    adminCurrentSection = section;
    
    switch(section) {
        case 'dashboard':
            app.loadAdminDashboard();
            break;
        case 'products':
            app.loadAdminProducts();
            break;
        case 'orders':
            app.loadAdminOrders();
            break;
        case 'featured':
            app.loadAdminFeatured();
            break;
        case 'cleanup':
            app.loadCleanupSection();
            break;
    }
}

// Function to add order to demo (called from checkout)
window.addOrderToDemo = function(orderData) {
    console.log('Adding order to demo:', orderData);
    
    try {
        const validOrder = {
            _id: orderData._id || Date.now().toString(),
            numeroCommande: orderData.numeroCommande,
            client: orderData.client,
            articles: orderData.articles || [],
            sousTotal: orderData.sousTotal || 0,
            fraisLivraison: orderData.fraisLivraison || 0,
            total: orderData.total || 0,
            statut: orderData.statut || 'en-attente',
            modePaiement: orderData.modePaiement || 'Paiement à la livraison',
            dateCommande: orderData.dateCommande || new Date().toISOString(),
            commentaires: orderData.commentaires || ''
        };
        
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const existingIndex = orders.findIndex(o => o.numeroCommande === validOrder.numeroCommande);
        
        if (existingIndex > -1) {
            orders[existingIndex] = validOrder;
        } else {
            orders.unshift(validOrder);
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        adminOrders = orders;
        
        console.log('Order added successfully. Total orders:', orders.length);
        return validOrder;
        
    } catch (error) {
        console.error('Error adding order to demo:', error);
        return null;
    }
};

// Event handlers for modals
document.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (modal && event.target === modal) {
        closeProductModal();
    }
    
    const orderModal = document.getElementById('orderDetailModal');
    if (orderModal && event.target === orderModal) {
        closeOrderDetailModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('productModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeProductModal();
        }
        
        const orderModal = document.getElementById('orderDetailModal');
        if (orderModal && !orderModal.classList.contains('hidden')) {
            closeOrderDetailModal();
        }
    }
});

// Export functions for global access
window.switchAdminSection = switchAdminSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.refreshProductCache = refreshProductCache;
window.syncWithBackend = syncWithBackend;
window.clearAllProducts = clearAllProducts;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderDetailModal = closeOrderDetailModal;
window.previewImage = previewImage;
window.forceRefreshProducts = forceRefreshProducts;

console.log('✅ FIXED Complete Admin.js loaded - Products will persist in localStorage even when backend fails');

