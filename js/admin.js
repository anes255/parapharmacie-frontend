// Complete Admin Panel with Fixed API Integration and Order Display

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.allProducts = [];
        this.orders = [];
        this.isProcessing = false;
    }

    // Initialize admin manager
    async init() {
        console.log('Initializing Admin Manager...');
        await this.loadProducts();
        await this.loadOrders();
    }

    // Check if user is admin
    isUserAdmin() {
        const user = window.authSystem?.currentUser || window.app?.currentUser;
        return user && user.role === 'admin';
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('token') || window.authSystem?.getToken() || null;
    }

    // Enhanced API call with proper auth
    async apiCallWithAuth(endpoint, options = {}) {
        try {
            const token = this.getAuthToken();
            
            if (!token) {
                console.log('No auth token available, skipping API call');
                throw new Error('Non authentifié');
            }

            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': token
                },
                mode: 'cors'
            };

            const finalOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            };

            const url = window.API_CONFIG.BASE_URL + endpoint;
            console.log('Making authenticated API call to:', url);

            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid, clearing auth');
                    localStorage.removeItem('token');
                    if (window.authSystem) {
                        window.authSystem.logout();
                    }
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Auth API call error:', error);
            throw error;
        }
    }

    // Load products from storage and API
    async loadProducts() {
        try {
            // Get products from localStorage first
            let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            
            // Try to get products from API
            try {
                const data = await window.apiCall('/products'); // Use public endpoint first
                if (data && data.products && data.products.length > 0) {
                    // Merge API products with local ones, avoiding duplicates
                    const localIds = products.map(p => p._id);
                    const newApiProducts = data.products.filter(p => !localIds.includes(p._id));
                    products = [...products, ...newApiProducts];
                    
                    // Update localStorage with merged data
                    localStorage.setItem('demoProducts', JSON.stringify(products));
                }
            } catch (error) {
                console.log('Public API unavailable for products:', error.message);
            }
            
            this.allProducts = products;
            console.log(`✅ Loaded ${this.allProducts.length} products`);
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.allProducts = [];
        }
    }

    // Load orders from all sources
    async loadOrders() {
        try {
            console.log('📦 Loading orders from all sources...');
            
            // Start with localStorage orders
            let orders = [...adminOrders];
            console.log(`📁 Local orders loaded: ${orders.length}`);
            
            // Try to get orders from API if authenticated
            if (this.isUserAdmin()) {
                try {
                    // Try different endpoints
                    let apiOrders = [];
                    
                    // Try admin endpoint first
                    try {
                        const adminData = await this.apiCallWithAuth('/admin/orders');
                        if (adminData && adminData.orders) {
                            apiOrders = adminData.orders;
                        }
                    } catch (adminError) {
                        console.log('Admin orders endpoint failed, trying general orders:', adminError.message);
                        
                        // Try general orders endpoint
                        try {
                            const generalData = await this.apiCallWithAuth('/orders');
                            if (generalData && generalData.orders) {
                                apiOrders = generalData.orders;
                            }
                        } catch (generalError) {
                            console.log('General orders endpoint also failed:', generalError.message);
                        }
                    }
                    
                    if (apiOrders.length > 0) {
                        console.log(`🌐 API orders loaded: ${apiOrders.length}`);
                        
                        // Merge with local orders, avoiding duplicates
                        const localOrderNumbers = orders.map(o => o.numeroCommande);
                        const newApiOrders = apiOrders.filter(o => 
                            o.numeroCommande && !localOrderNumbers.includes(o.numeroCommande)
                        );
                        
                        orders = [...orders, ...newApiOrders];
                        console.log(`📋 Merged orders: ${orders.length} total`);
                    }
                    
                } catch (error) {
                    console.log('🚫 API orders unavailable:', error.message);
                }
            }
            
            // Also check user-specific orders from localStorage
            const user = window.authSystem?.currentUser || window.app?.currentUser;
            if (user && user.id) {
                try {
                    const userOrdersKey = `userOrders_${user.id}`;
                    const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
                    
                    if (userOrders.length > 0) {
                        console.log(`👤 User-specific orders found: ${userOrders.length}`);
                        
                        // Merge user orders
                        const allOrderNumbers = orders.map(o => o.numeroCommande);
                        const newUserOrders = userOrders.filter(o => 
                            o.numeroCommande && !allOrderNumbers.includes(o.numeroCommande)
                        );
                        
                        orders = [...orders, ...newUserOrders];
                        console.log(`👥 Including user orders: ${orders.length} total`);
                    }
                } catch (error) {
                    console.log('Error loading user-specific orders:', error);
                }
            }
            
            // Sort by date, newest first
            orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
            
            this.orders = orders;
            console.log(`✅ Total orders loaded: ${this.orders.length}`);
            
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [...adminOrders];
        }
    }

    // Show toast message
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            // Create a simple toast if no app toast available
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 
                type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 3000);
        }
    }

    // Load dashboard
    loadAdminDashboard() {
        try {
            const totalProducts = this.allProducts.length;
            const activeProducts = this.allProducts.filter(p => p.actif !== false).length;
            const featuredProducts = this.allProducts.filter(p => p.enVedette).length;
            const totalOrders = this.orders.length;
            const pendingOrders = this.orders.filter(o => o.statut === 'en-attente').length;
            
            document.getElementById('adminContent').innerHTML = `
                <div class="space-y-8">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-3xl font-bold text-emerald-800 mb-2">Tableau de bord</h2>
                        <p class="text-emerald-600 mb-8">Aperçu de votre parapharmacie</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-xl border border-emerald-200">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-emerald-500 p-3 rounded-xl">
                                        <i class="fas fa-pills text-white text-xl"></i>
                                    </div>
                                    <span class="text-3xl font-bold text-emerald-700">${totalProducts}</span>
                                </div>
                                <h3 class="text-emerald-800 font-semibold">Produits total</h3>
                                <p class="text-emerald-600 text-sm">${activeProducts} actifs</p>
                            </div>
                            
                            <div class="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-xl border border-yellow-200">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-yellow-500 p-3 rounded-xl">
                                        <i class="fas fa-star text-white text-xl"></i>
                                    </div>
                                    <span class="text-3xl font-bold text-yellow-700">${featuredProducts}</span>
                                </div>
                                <h3 class="text-yellow-800 font-semibold">En vedette</h3>
                                <p class="text-yellow-600 text-sm">Coups de cœur</p>
                            </div>
                            
                            <div class="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border border-blue-200">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-blue-500 p-3 rounded-xl">
                                        <i class="fas fa-shopping-bag text-white text-xl"></i>
                                    </div>
                                    <span class="text-3xl font-bold text-blue-700">${totalOrders}</span>
                                </div>
                                <h3 class="text-blue-800 font-semibold">Commandes</h3>
                                <p class="text-blue-600 text-sm">Au total</p>
                            </div>
                            
                            <div class="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-orange-500 p-3 rounded-xl">
                                        <i class="fas fa-clock text-white text-xl"></i>
                                    </div>
                                    <span class="text-3xl font-bold text-orange-700">${pendingOrders}</span>
                                </div>
                                <h3 class="text-orange-800 font-semibold">En attente</h3>
                                <p class="text-orange-600 text-sm">À traiter</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                            <h3 class="text-xl font-bold text-emerald-800 mb-4">Actions rapides</h3>
                            <div class="space-y-3">
                                <button onclick="switchAdminSection('products')" 
                                        class="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-4 rounded-xl text-left transition-all">
                                    <i class="fas fa-plus mr-3"></i>Ajouter un produit
                                </button>
                                <button onclick="switchAdminSection('orders')" 
                                        class="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-xl text-left transition-all">
                                    <i class="fas fa-list mr-3"></i>Gérer les commandes
                                </button>
                                <button onclick="switchAdminSection('featured')" 
                                        class="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded-xl text-left transition-all">
                                    <i class="fas fa-star mr-3"></i>Coups de cœur
                                </button>
                            </div>
                        </div>
                        
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                            <h3 class="text-xl font-bold text-emerald-800 mb-4">Commandes récentes</h3>
                            <div class="space-y-3 max-h-64 overflow-y-auto">
                                ${this.orders.slice(0, 5).map(order => `
                                    <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <p class="font-semibold text-emerald-800">#${order.numeroCommande}</p>
                                                <p class="text-sm text-emerald-600">${order.client?.prenom} ${order.client?.nom}</p>
                                                <p class="text-xs text-emerald-500">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-bold text-emerald-700">${order.total} DA</p>
                                                <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${this.getStatusColor(order.statut)}">
                                                    ${this.getStatusLabel(order.statut)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') || '<p class="text-gray-500 text-center py-4">Aucune commande récente</p>'}
                            </div>
                        </div>
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
    }

    // Load products management
    async loadAdminProducts() {
        try {
            await this.loadProducts();
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-bold text-emerald-800">Gestion des produits</h2>
                            <p class="text-emerald-600">${this.allProducts.length} produits au total</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <i class="fas fa-plus mr-2"></i>Nouveau produit
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                    ${this.allProducts.length === 0 ? `
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
                                    ${this.allProducts.map(product => this.renderProductRow(product)).join('')}
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
                    <p class="text-red-800">Erreur de chargement des produits</p>
                </div>
            `;
        }
    }

    // Render product row
    renderProductRow(product) {
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
                        <div class="w-2 h-2 rounded-full ${product.actif ? 'bg-green-500' : 'bg-red-500'}"></div>
                        <span class="text-sm font-medium ${product.actif ? 'text-green-700' : 'text-red-700'}">
                            ${product.actif ? 'Actif' : 'Inactif'}
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
    }

    // Load orders management with improved loading
    async loadAdminOrders() {
        try {
            console.log('📦 Loading orders admin page...');
            
            // Show loading state first
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="text-center py-16">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                        <p class="text-emerald-600">Chargement des commandes...</p>
                    </div>
                </div>
            `;
            
            // Load orders from all sources
            await this.loadOrders();
            
            console.log(`📊 Displaying ${this.orders.length} orders`);
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des commandes</h2>
                        <div class="flex gap-2">
                            <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ${this.orders.length} commande(s)
                            </span>
                            <button onclick="adminManager.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-sync mr-2"></i>Actualiser
                            </button>
                        </div>
                    </div>
                    
                    ${this.orders.length === 0 ? `
                        <div class="text-center py-16">
                            <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                            <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                            <p class="text-emerald-600 mb-4">Les commandes apparaîtront ici une fois passées</p>
                            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                                <h4 class="font-semibold text-blue-800 mb-2">Pour tester:</h4>
                                <p class="text-sm text-blue-700">1. Ajoutez des produits au panier</p>
                                <p class="text-sm text-blue-700">2. Procédez au checkout</p>
                                <p class="text-sm text-blue-700">3. Les commandes apparaîtront ici</p>
                            </div>
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
                                    ${this.orders.map(order => `
                                        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                            <td class="py-4 px-6">
                                                <div class="font-semibold text-emerald-800">#${order.numeroCommande}</div>
                                                <div class="text-sm text-emerald-600">${order.articles?.length || 0} article(s)</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="font-medium text-gray-900">${order.client?.prenom || 'N/A'} ${order.client?.nom || ''}</div>
                                                <div class="text-sm text-gray-600">${order.client?.email || 'N/A'}</div>
                                                <div class="text-xs text-gray-500">${order.client?.wilaya || 'N/A'}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-sm text-gray-900">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</div>
                                                <div class="text-xs text-gray-500">${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="font-semibold text-emerald-700">${order.total || 0} DA</div>
                                                <div class="text-sm text-gray-600">Livraison: ${order.fraisLivraison || 0} DA</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${this.getStatusColor(order.statut)}">
                                                    ${this.getStatusLabel(order.statut)}
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
                                                    <button onclick="deleteOrder('${order._id || order.numeroCommande}')" 
                                                            class="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                                                            title="Supprimer">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
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
                    <button onclick="adminManager.loadAdminOrders()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }

    // Load featured products management
    async loadAdminFeatured() {
        try {
            await this.loadProducts();
            
            const featuredProducts = this.allProducts.filter(p => p.enVedette);
            const allProducts = this.allProducts.filter(p => !p.enVedette);
            
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
                        ${allProducts.length === 0 ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                                <p class="text-blue-700">Aucun autre produit disponible</p>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${allProducts.map(product => `
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
    }

    // Generate placeholder image
    generatePlaceholderImage(product) {
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
    }

    // Helper functions
    getStatusColor(statut) {
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

    getStatusLabel(statut) {
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

    // FIXED: Save product with correct API endpoint
    async saveProduct(productData, isEditing = false) {
        try {
            console.log('💾 Saving product:', productData);
            this.isProcessing = true;

            // Save to localStorage first (always works)
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            
            if (isEditing) {
                // Update existing product
                const index = localProducts.findIndex(p => p._id === productData._id);
                if (index !== -1) {
                    localProducts[index] = productData;
                } else {
                    localProducts.push(productData);
                }
            } else {
                // Add new product - generate ID if not present
                if (!productData._id) {
                    productData._id = Date.now().toString();
                }
                localProducts.push(productData);
            }
            
            // Save back to localStorage
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            console.log('✅ Product saved to localStorage');
            
            // Try to save to API - CORRECTED ENDPOINT
            let apiSaved = false;
            try {
                // Use correct endpoint based on authentication
                if (this.isUserAdmin()) {
                    const endpoint = isEditing ? `/admin/products/${productData._id}` : '/admin/products';
                    const method = isEditing ? 'PUT' : 'POST';
                    
                    console.log(`🌐 Attempting API save: ${method} ${endpoint}`);
                    
                    const response = await this.apiCallWithAuth(endpoint, {
                        method: method,
                        body: JSON.stringify(productData)
                    });
                    
                    console.log('✅ Product saved to API successfully:', response);
                    apiSaved = true;
                } else {
                    // Try public endpoint for non-admin users (if available)
                    try {
                        const endpoint = isEditing ? `/products/${productData._id}` : '/products';
                        const method = isEditing ? 'PUT' : 'POST';
                        
                        console.log(`🌐 Attempting public API save: ${method} ${endpoint}`);
                        
                        const response = await window.apiCall(endpoint, {
                            method: method,
                            body: JSON.stringify(productData)
                        });
                        
                        console.log('✅ Product saved to public API successfully:', response);
                        apiSaved = true;
                    } catch (publicError) {
                        console.log('⚠️ Public API save failed:', publicError.message);
                    }
                }
            } catch (apiError) {
                console.log('⚠️ API save failed but product saved locally:', apiError.message);
            }
            
            // Refresh products cache
            await this.loadProducts();
            
            // Show success message
            const message = isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès';
            const fullMessage = apiSaved ? `${message} (API et local)` : `${message} (local uniquement)`;
            this.showToast(fullMessage, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving product:', error);
            this.showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
            return false;
        } finally {
            this.isProcessing = false;
        }
    }

    // Delete order
    async deleteOrder(orderId) {
        try {
            console.log('🗑️ Deleting order:', orderId);
            
            // Delete from localStorage
            let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            const initialCount = orders.length;
            orders = orders.filter(o => o._id !== orderId && o.numeroCommande !== orderId);
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            adminOrders = orders;
            
            const localDeleteSuccess = orders.length < initialCount;
            console.log('✅ Order deleted locally:', localDeleteSuccess);
            
            // Try to delete from API if authenticated
            if (this.isUserAdmin()) {
                try {
                    await this.apiCallWithAuth(`/admin/orders/${orderId}`, {
                        method: 'DELETE'
                    });
                    console.log('✅ Order deleted from API successfully');
                } catch (error) {
                    console.log('⚠️ API delete failed but order deleted locally:', error.message);
                }
            }
            
            // Refresh orders list
            await this.loadOrders();
            this.showToast('Commande supprimée avec succès', 'success');
            
            if (adminCurrentSection === 'orders') {
                this.loadAdminOrders();
            }
            
        } catch (error) {
            console.error('❌ Error deleting order:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// Global admin manager instance
let adminManager;

// Initialize admin manager
async function initAdminManager() {
    adminManager = new AdminManager();
    await adminManager.init();
    window.adminManager = adminManager;
    console.log('✅ Admin manager initialized');
}

// IMPROVED: Function to add order to demo - FIXED for proper display
window.addOrderToDemo = function(orderData) {
    console.log('📦 Adding order to admin system:', orderData);
    
    try {
        // Ensure the order has a valid structure with all required fields
        const validOrder = {
            _id: orderData._id || Date.now().toString(),
            numeroCommande: orderData.numeroCommande,
            client: {
                prenom: orderData.client?.prenom || 'Client',
                nom: orderData.client?.nom || 'Anonyme', 
                email: orderData.client?.email || 'client@example.com',
                telephone: orderData.client?.telephone || '0000000000',
                adresse: orderData.client?.adresse || 'Adresse non spécifiée',
                wilaya: orderData.client?.wilaya || 'Alger'
            },
            articles: orderData.articles || [],
            sousTotal: orderData.sousTotal || 0,
            fraisLivraison: orderData.fraisLivraison || 0,
            total: orderData.total || 0,
            statut: orderData.statut || 'en-attente',
            modePaiement: orderData.modePaiement || 'Paiement à la livraison',
            dateCommande: orderData.dateCommande || new Date().toISOString(),
            commentaires: orderData.commentaires || ''
        };
        
        // Add to localStorage for admin
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Check for duplicates based on numeroCommande
        const existingIndex = orders.findIndex(o => o.numeroCommande === validOrder.numeroCommande);
        if (existingIndex > -1) {
            console.log('🔄 Order already exists, updating...');
            orders[existingIndex] = validOrder;
        } else {
            console.log('➕ Adding new order to admin list');
            orders.unshift(validOrder); // Add to beginning
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        // Update global variable
        adminOrders = orders;
        
        console.log(`✅ Order added successfully. Total admin orders: ${orders.length}`);
        console.log('📋 Order details:', validOrder);
        
        // If admin manager is loaded, refresh the orders
        if (window.adminManager) {
            window.adminManager.loadOrders().then(() => {
                console.log('🔄 Admin orders refreshed after new order');
                // Refresh the admin orders display if currently viewing
                if (adminCurrentSection === 'orders') {
                    window.adminManager.loadAdminOrders();
                }
            });
        }
        
        return validOrder;
        
    } catch (error) {
        console.error('❌ Error adding order to admin:', error);
        return null;
    }
};

// All the modal and CRUD functions remain the same from previous version
// ... (keeping all the modal functions from the previous complete version)

// COMPLETE PRODUCT MODAL FUNCTIONS
function openAddProductModal() {
    currentEditingProduct = null;
    showProductModal('Ajouter un nouveau produit', 'Ajouter le produit');
}

async function openEditProductModal(productId) {
    try {
        // Look for product in local storage first
        let product = null;
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        product = localProducts.find(p => p._id === productId);
        
        // If not found, show error
        if (!product) {
            adminManager.showToast('Produit non trouvé', 'error');
            return;
        }
        
        currentEditingProduct = product;
        showProductModal('Modifier le produit', 'Modifier le produit');
        setTimeout(() => fillProductForm(product), 100);
    } catch (error) {
        console.error('Error loading product:', error);
        adminManager.showToast('Erreur lors du chargement du produit', 'error');
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

// Image preview function
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    const imageUrl = document.getElementById('productImageUrl');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            adminManager.showToast('Image trop volumineuse. Maximum 2MB.', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            adminManager.showToast('Veuillez sélectionner un fichier image.', 'error');
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
        console.log('No file selected');
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
    document.getElementById('productActif').checked = product.actif !== false; // Default to true
    
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

// Save product function
async function saveProduct() {
    const form = document.getElementById('productForm');
    const isEditing = !!currentEditingProduct;
    
    // Validate form
    const nom = document.getElementById('productNom').value.trim();
    const prix = document.getElementById('productPrix').value;
    const stock = document.getElementById('productStock').value;
    const categorie = document.getElementById('productCategorie').value;
    const description = document.getElementById('productDescription').value.trim();
    
    if (!nom || !prix || !stock || !categorie || !description) {
        adminManager.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    const button = document.getElementById('productSubmitBtn');
    const buttonText = document.getElementById('productSubmitText');
    const spinner = document.getElementById('productSubmitSpinner');
    
    // Disable button and show loading
    button.disabled = true;
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        // Get form values
        const productId = document.getElementById('productId').value || Date.now().toString();
        const marque = document.getElementById('productMarque').value.trim();
        const prixOriginal = document.getElementById('productPrixOriginal').value;
        const ingredients = document.getElementById('productIngredients').value.trim();
        const modeEmploi = document.getElementById('productModeEmploi').value.trim();
        const precautions = document.getElementById('productPrecautions').value.trim();
        const enVedette = document.getElementById('productEnVedette').checked;
        const enPromotion = document.getElementById('productEnPromotion').checked;
        const actif = document.getElementById('productActif').checked;
        const imageUrl = document.getElementById('productImageUrl').value;
        
        // Prepare product data
        const productData = {
            _id: productId,
            nom: nom,
            description: description,
            marque: marque,
            prix: parseInt(prix),
            stock: parseInt(stock),
            categorie: categorie,
            actif: actif,
            enVedette: enVedette,
            enPromotion: enPromotion,
            dateAjout: currentEditingProduct?.dateAjout || new Date().toISOString()
        };
        
        // Add optional fields
        if (prixOriginal) {
            productData.prixOriginal = parseInt(prixOriginal);
            
            // Calculate discount percentage
            if (enPromotion && productData.prixOriginal > productData.prix) {
                productData.pourcentagePromotion = Math.round((productData.prixOriginal - productData.prix) / productData.prixOriginal * 100);
            }
        }
        
        if (ingredients) productData.ingredients = ingredients;
        if (modeEmploi) productData.modeEmploi = modeEmploi;
        if (precautions) productData.precautions = precautions;
        
        // Handle image
        if (imageUrl) {
            productData.image = imageUrl;
        }
        
        console.log('Product data to save:', productData);
        
        // Save product using admin manager
        const success = await adminManager.saveProduct(productData, isEditing);
        
        if (success) {
            closeProductModal();
            
            // Refresh admin section
            if (adminCurrentSection === 'products') {
                adminManager.loadAdminProducts();
            } else if (adminCurrentSection === 'featured' && productData.enVedette) {
                adminManager.loadAdminFeatured();
            }
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        adminManager.showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
        // Re-enable button
        button.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// All other functions remain the same...
// Product operations, order management, modals, etc.

// Product operations
async function toggleFeatured(productId, newStatus) {
    try {
        console.log('Toggling featured status:', productId, newStatus);
        
        // Update in localStorage first
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = localProducts.findIndex(p => p._id === productId);
        
        if (productIndex !== -1) {
            localProducts[productIndex].enVedette = newStatus;
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            console.log('Product featured status updated locally');
        }
        
        // Try to update via API if authenticated
        if (adminManager.isUserAdmin()) {
            try {
                await adminManager.apiCallWithAuth(`/admin/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ enVedette: newStatus })
                });
                console.log('Product featured status updated via API');
            } catch (error) {
                console.log('API update failed, but local update succeeded');
            }
        }
        
        adminManager.showToast(`Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de coeur`, 'success');
        
        if (adminCurrentSection === 'products') {
            adminManager.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            adminManager.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error toggling featured:', error);
        adminManager.showToast('Erreur lors de la modification', 'error');
    }
}

async function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        try {
            console.log('Deleting product:', productId);
            
            // Delete from local storage first
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const initialCount = localProducts.length;
            localProducts = localProducts.filter(p => p._id !== productId);
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            
            const localDeleteSuccess = localProducts.length < initialCount;
            console.log('Product deleted locally:', localDeleteSuccess);
            
            // Try to delete from API if authenticated
            if (adminManager.isUserAdmin()) {
                try {
                    await adminManager.apiCallWithAuth(`/admin/products/${productId}`, {
                        method: 'DELETE'
                    });
                    console.log('Product deleted from API successfully');
                } catch (error) {
                    console.log('API delete failed, but product deleted locally:', error.message);
                }
            }
            
            // Refresh the products list
            adminManager.showToast('Produit supprimé avec succès', 'success');
            
            if (adminCurrentSection === 'products') {
                adminManager.loadAdminProducts();
            }
            
        } catch (error) {
            console.error('Error deleting product:', error);
            adminManager.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// Order detail modal
async function viewOrderDetails(orderId) {
    try {
        console.log('Viewing order details for:', orderId);
        
        // Find order in orders array first
        let order = adminManager.orders.find(o => o._id === orderId || o.numeroCommande === orderId);
        
        if (order) {
            // Create detailed order modal
            document.body.insertAdjacentHTML('beforeend', `
                <div id="orderDetailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div class="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 class="text-2xl font-bold text-emerald-800">Commande #${order.numeroCommande}</h3>
                            <button onclick="closeOrderDetailModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="p-6 overflow-y-auto max-h-[75vh]">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h4 class="font-semibold text-emerald-800 mb-4">Informations client</h4>
                                    <div class="space-y-2 text-sm">
                                        <p><strong>Nom:</strong> ${order.client?.prenom} ${order.client?.nom}</p>
                                        <p><strong>Email:</strong> ${order.client?.email}</p>
                                        <p><strong>Téléphone:</strong> ${order.client?.telephone}</p>
                                        <p><strong>Adresse:</strong> ${order.client?.adresse}</p>
                                        <p><strong>Wilaya:</strong> ${order.client?.wilaya}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-semibold text-emerald-800 mb-4">Détails commande</h4>
                                    <div class="space-y-2 text-sm">
                                        <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleDateString('fr-FR')} à ${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</p>
                                        <p><strong>Statut:</strong> <span class="px-2 py-1 rounded text-xs ${adminManager.getStatusColor(order.statut)}">${adminManager.getStatusLabel(order.statut)}</span></p>
                                        <p><strong>Paiement:</strong> ${order.modePaiement}</p>
                                        ${order.commentaires ? `<p><strong>Commentaires:</strong> ${order.commentaires}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-6">
                                <h4 class="font-semibold text-emerald-800 mb-4">Articles commandés</h4>
                                <div class="space-y-3">
                                    ${order.articles?.map(article => `
                                        <div class="flex items-center space-x-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
                                            <img src="${article.image || 'https://via.placeholder.com/64x64/10b981/ffffff?text=' + encodeURIComponent((article.nom || '').substring(0, 2))}" 
                                                 alt="${article.nom}" 
                                                 class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                            <div class="flex-1">
                                                <h5 class="font-medium text-emerald-800">${article.nom}</h5>
                                                <p class="text-sm text-emerald-600">Quantité: ${article.quantite} × ${article.prix} DA</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-medium text-emerald-800">${(article.quantite || 0) * (article.prix || 0)} DA</p>
                                            </div>
                                        </div>
                                    `).join('') || '<p class="text-gray-500">Aucun article</p>'}
                                </div>
                            </div>
                            
                            <div class="border-t border-emerald-200 pt-4">
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-emerald-600">Sous-total:</span>
                                        <span class="text-emerald-800">${order.sousTotal || 0} DA</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-emerald-600">Frais de livraison:</span>
                                        <span class="text-emerald-800">${order.fraisLivraison || 0} DA</span>
                                    </div>
                                    <div class="flex justify-between text-lg font-semibold border-t border-emerald-200 pt-2">
                                        <span class="text-emerald-800">Total:</span>
                                        <span class="text-emerald-600">${order.total || 0} DA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-4 p-6 border-t border-gray-200">
                            <button onclick="closeOrderDetailModal()" 
                                    class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                Fermer
                            </button>
                            <button onclick="updateOrderStatus('${order._id || order.numeroCommande}', 'confirmée')" 
                                    class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
                                Confirmer la commande
                            </button>
                        </div>
                    </div>
                </div>
            `);
            
            document.body.style.overflow = 'hidden';
        } else {
            adminManager.showToast('Commande non trouvée', 'error');
        }
        
    } catch (error) {
        console.error('Error viewing order details:', error);
        adminManager.showToast('Erreur lors de l\'affichage des détails', 'error');
    }
}

function closeOrderDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log('Updating order status:', orderId, 'to', newStatus);
        
        // Update in localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const orderIndex = orders.findIndex(o => o._id === orderId || o.numeroCommande === orderId);
        
        if (orderIndex > -1) {
            orders[orderIndex].statut = newStatus;
            if (newStatus === 'livrée') {
                orders[orderIndex].dateLivraison = new Date().toISOString();
            }
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            adminOrders = orders;
            console.log('Order status updated locally');
        }
        
        // Try to update via API if authenticated
        if (adminManager.isUserAdmin()) {
            try {
                await adminManager.apiCallWithAuth(`/admin/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        statut: newStatus,
                        dateLivraison: newStatus === 'livrée' ? new Date().toISOString() : null
                    })
                });
                console.log('Order status updated via API');
            } catch (error) {
                console.log('API update failed, but local update succeeded');
            }
        }
        
        adminManager.showToast('Statut de la commande mis à jour', 'success');
        
        // Close modal if open
        closeOrderDetailModal();
        
        // Refresh orders list
        if (adminCurrentSection === 'orders') {
            adminManager.loadAdminOrders();
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        adminManager.showToast('Erreur lors de la mise à jour du statut', 'error');
    }
}

// Delete order function
async function deleteOrder(orderId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        await adminManager.deleteOrder(orderId);
    }
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
    
    if (!adminManager) {
        initAdminManager().then(() => {
            executeSection(section);
        });
    } else {
        executeSection(section);
    }
}

function executeSection(section) {
    switch(section) {
        case 'dashboard':
            adminManager.loadAdminDashboard();
            break;
        case 'products':
            adminManager.loadAdminProducts();
            break;
        case 'orders':
            adminManager.loadAdminOrders();
            break;
        case 'featured':
            adminManager.loadAdminFeatured();
            break;
    }
}

// Modal event handlers
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

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminManager);
} else {
    // Small delay to ensure other scripts are loaded
    setTimeout(initAdminManager, 100);
}

// Export functions for global access
window.initAdminManager = initAdminManager;
window.adminManager = adminManager;
window.switchAdminSection = switchAdminSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderDetailModal = closeOrderDetailModal;
window.deleteOrder = deleteOrder;
window.previewImage = previewImage;

console.log('✅ Fixed Admin System loaded with API integration and order display');
