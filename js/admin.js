// Complete Enhanced Admin Panel for Shifa Parapharmacie - Error-Free Version

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://parapharmacie-gaher.onrender.com/api';

// Enhanced API helper function with better error handling
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
        
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ 
                message: `Erreur HTTP ${response.status}: ${response.statusText}` 
            }));
            throw new Error(error.message || `Erreur HTTP ${response.status}`);
        }
        
        return response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Délai d\'attente dépassé - Vérifiez votre connexion internet');
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Impossible de se connecter au serveur');
        }
        
        throw error;
    }
}

// Enhanced Admin Dashboard
PharmacieGaherApp.prototype.loadAdminDashboard = async function() {
    try {
        // Get comprehensive stats from localStorage and cached products
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const products = this.allProducts || [];
        
        // Calculate comprehensive statistics
        let stats = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.actif !== false).length,
            featuredProducts: products.filter(p => p.enVedette).length,
            promotionProducts: products.filter(p => p.enPromotion).length,
            outOfStockProducts: products.filter(p => p.stock === 0).length,
            lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 5).length,
            totalOrders: adminOrders.length,
            pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
            confirmedOrders: adminOrders.filter(o => o.statut === 'confirmée').length,
            shippedOrders: adminOrders.filter(o => o.statut === 'expédiée').length,
            deliveredOrders: adminOrders.filter(o => o.statut === 'livrée').length,
            monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0),
            averageOrderValue: adminOrders.length > 0 ? 
                adminOrders.reduce((sum, o) => sum + (o.total || 0), 0) / adminOrders.length : 0,
            totalUsers: 1,
            newOrdersToday: adminOrders.filter(o => {
                const orderDate = new Date(o.dateCommande);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
            }).length
        };

        // Try to get enhanced stats from API
        try {
            const data = await apiCall('/admin/dashboard');
            if (data && data.stats) {
                stats = { ...stats, ...data.stats };
            }
        } catch (error) {
            console.log('API unavailable, using local stats:', error.message);
        }
        
        // Calculate recent trends
        const last7Days = adminOrders.filter(o => {
            const orderDate = new Date(o.dateCommande);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return orderDate >= sevenDaysAgo;
        });
        
        const weeklyRevenue = last7Days.reduce((sum, o) => sum + (o.total || 0), 0);
        const weeklyOrders = last7Days.length;
        
        document.getElementById('adminContent').innerHTML = `
            <!-- Enhanced Statistics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Products Stats -->
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-bold text-blue-600 uppercase tracking-wide">Produits</p>
                            <p class="text-3xl font-bold text-blue-800">${stats.activeProducts}</p>
                            <div class="mt-2 text-xs space-y-1">
                                <p class="text-blue-600">• ${stats.featuredProducts} en vedette</p>
                                <p class="text-blue-600">• ${stats.promotionProducts} en promotion</p>
                                <p class="text-red-600">• ${stats.outOfStockProducts} en rupture</p>
                            </div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-pills text-white text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Orders Stats -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-bold text-green-600 uppercase tracking-wide">Commandes</p>
                            <p class="text-3xl font-bold text-green-800">${stats.totalOrders}</p>
                            <div class="mt-2 text-xs space-y-1">
                                <p class="text-yellow-600">• ${stats.pendingOrders} en attente</p>
                                <p class="text-blue-600">• ${stats.confirmedOrders} confirmées</p>
                                <p class="text-green-600">• ${stats.deliveredOrders} livrées</p>
                            </div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-shopping-bag text-white text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Revenue Stats -->
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-bold text-purple-600 uppercase tracking-wide">Chiffre d'affaires</p>
                            <p class="text-2xl font-bold text-purple-800">${Math.round(stats.monthlyRevenue).toLocaleString()} DA</p>
                            <div class="mt-2 text-xs space-y-1">
                                <p class="text-purple-600">• ${Math.round(stats.averageOrderValue)} DA/commande</p>
                                <p class="text-purple-600">• ${Math.round(weeklyRevenue).toLocaleString()} DA cette semaine</p>
                            </div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-coins text-white text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Today's Activity -->
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-bold text-orange-600 uppercase tracking-wide">Aujourd'hui</p>
                            <p class="text-3xl font-bold text-orange-800">${stats.newOrdersToday}</p>
                            <div class="mt-2 text-xs space-y-1">
                                <p class="text-orange-600">• Nouvelles commandes</p>
                                <p class="text-orange-600">• ${weeklyOrders} cette semaine</p>
                            </div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-calendar-day text-white text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions Enhanced -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 group" onclick="switchAdminSection('products')">
                    <div class="flex items-center justify-between">
                        <div>
                            <i class="fas fa-plus-circle text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <h3 class="text-xl font-bold mb-2">Gérer les produits</h3>
                            <p class="text-emerald-100 text-sm">Ajouter, modifier et gérer vos produits</p>
                        </div>
                        <div class="opacity-20 text-6xl">
                            <i class="fas fa-pills"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 group" onclick="switchAdminSection('orders')">
                    <div class="flex items-center justify-between">
                        <div>
                            <i class="fas fa-shopping-bag text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <h3 class="text-xl font-bold mb-2">Commandes</h3>
                            <p class="text-blue-100 text-sm">Voir et gérer toutes les commandes</p>
                        </div>
                        <div class="opacity-20 text-6xl">
                            <i class="fas fa-list-alt"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 group" onclick="switchAdminSection('featured')">
                    <div class="flex items-center justify-between">
                        <div>
                            <i class="fas fa-star text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <h3 class="text-xl font-bold mb-2">Coups de Cœur</h3>
                            <p class="text-yellow-100 text-sm">Gérer les produits mis en avant</p>
                        </div>
                        <div class="opacity-20 text-6xl">
                            <i class="fas fa-heart"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 group" onclick="switchAdminSection('cleanup')">
                    <div class="flex items-center justify-between">
                        <div>
                            <i class="fas fa-broom text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <h3 class="text-xl font-bold mb-2">Maintenance</h3>
                            <p class="text-red-100 text-sm">Outils de nettoyage et optimisation</p>
                        </div>
                        <div class="opacity-20 text-6xl">
                            <i class="fas fa-tools"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Recent Orders -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-emerald-800">Commandes récentes</h3>
                        <button onclick="switchAdminSection('orders')" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            Voir tout →
                        </button>
                    </div>
                    ${adminOrders.slice(0, 5).length > 0 ? adminOrders.slice(0, 5).map(order => `
                        <div class="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/30 mb-3 hover:bg-emerald-50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    #
                                </div>
                                <div>
                                    <p class="font-semibold text-emerald-800">${order.numeroCommande}</p>
                                    <p class="text-sm text-emerald-600">${order.client?.prenom} ${order.client?.nom}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-emerald-800">${order.total} DA</p>
                                <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.statut)}">
                                    ${getStatusLabel(order.statut)}
                                </span>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8">
                            <i class="fas fa-inbox text-4xl text-emerald-200 mb-4"></i>
                            <p class="text-emerald-600">Aucune commande récente</p>
                        </div>
                    `}
                </div>
                
                <!-- Stock Alerts -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-emerald-800">Alertes stock</h3>
                        <button onclick="switchAdminSection('products')" class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            Gérer →
                        </button>
                    </div>
                    ${stats.outOfStockProducts > 0 || stats.lowStockProducts > 0 ? `
                        ${stats.outOfStockProducts > 0 ? `
                            <div class="p-4 bg-red-50 rounded-xl border border-red-200 mb-3">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                                    <div>
                                        <p class="font-semibold text-red-800">${stats.outOfStockProducts} produit(s) en rupture</p>
                                        <p class="text-sm text-red-600">Réapprovisionnement nécessaire</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${stats.lowStockProducts > 0 ? `
                            <div class="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-3">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-exclamation-circle text-yellow-500 text-xl"></i>
                                    <div>
                                        <p class="font-semibold text-yellow-800">${stats.lowStockProducts} produit(s) stock faible</p>
                                        <p class="text-sm text-yellow-600">Moins de 5 unités restantes</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="text-center py-8">
                            <i class="fas fa-check-circle text-4xl text-green-300 mb-4"></i>
                            <p class="text-green-600">Tous les stocks sont corrects</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-bold text-red-800 mb-2">Erreur de chargement</h3>
                <p class="text-red-600 mb-4">Impossible de charger le tableau de bord</p>
                <button onclick="app.loadAdminDashboard()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Réessayer
                </button>
            </div>
        `;
    }
};

// Enhanced Products Management
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        this.showLoading();
        
        // Get products from localStorage and API
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        try {
            const data = await apiCall('/products');
            if (data && data.products && data.products.length > 0) {
                const localIds = products.map(p => p._id);
                const newApiProducts = data.products.filter(p => !localIds.includes(p._id));
                products = [...products, ...newApiProducts];
                localStorage.setItem('demoProducts', JSON.stringify(products));
            }
        } catch (error) {
            console.log('API unavailable, using local products only');
        }
        
        this.hideLoading();
        
        // Calculate product statistics
        const stats = {
            total: products.length,
            active: products.filter(p => p.actif !== false).length,
            inactive: products.filter(p => p.actif === false).length,
            featured: products.filter(p => p.enVedette).length,
            promotion: products.filter(p => p.enPromotion).length,
            outOfStock: products.filter(p => p.stock === 0).length,
            lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
            categories: [...new Set(products.map(p => p.categorie))].length
        };
        
        document.getElementById('adminContent').innerHTML = `
            <!-- Products Header with Stats -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h2 class="text-3xl font-bold text-emerald-800 mb-2">Gestion des produits</h2>
                        <div class="flex flex-wrap gap-4 text-sm">
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                ${stats.total} produits au total
                            </span>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                ${stats.active} actifs
                            </span>
                            <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                                ${stats.featured} en vedette
                            </span>
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                                ${stats.promotion} en promotion
                            </span>
                            ${stats.outOfStock > 0 ? `
                                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                                    ${stats.outOfStock} en rupture
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            <i class="fas fa-plus mr-2"></i>Nouveau produit
                        </button>
                        <button onclick="app.refreshProductsCache()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-sync-alt mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                        <input type="text" id="adminProductSearch" placeholder="Nom, marque..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <select id="adminCategoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Toutes les catégories</option>
                            <option value="Vitalité">Vitalité</option>
                            <option value="Sport">Sport</option>
                            <option value="Visage">Visage</option>
                            <option value="Cheveux">Cheveux</option>
                            <option value="Solaire">Solaire</option>
                            <option value="Intime">Intime</option>
                            <option value="Soins">Soins</option>
                            <option value="Bébé">Bébé</option>
                            <option value="Homme">Homme</option>
                            <option value="Dentaire">Dentaire</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select id="adminStatusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="inactive">Inactifs</option>
                            <option value="featured">En vedette</option>
                            <option value="promotion">En promotion</option>
                            <option value="outOfStock">En rupture</option>
                            <option value="lowStock">Stock faible</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                        <select id="adminSortFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="dateAjout">Plus récent</option>
                            <option value="nom">Nom A-Z</option>
                            <option value="prix">Prix croissant</option>
                            <option value="stock">Stock</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="applyAdminFilters()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                            <i class="fas fa-filter mr-2"></i>Filtrer
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Products Table -->
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
                        <table class="w-full" id="productsTable">
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
                            <tbody id="productsTableBody">
                                ${products.map(product => this.renderProductRow(product)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
        // Setup search functionality
        this.setupProductFilters();
        
    } catch (error) {
        this.hideLoading();
        console.error('Error loading products:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-bold text-red-800 mb-2">Erreur de chargement</h3>
                <p class="text-red-600 mb-4">Impossible de charger les produits: ${error.message}</p>
                <button onclick="app.loadAdminProducts()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Réessayer
                </button>
            </div>
        `;
    }
};

// Enhanced Product Row Renderer
PharmacieGaherApp.prototype.renderProductRow = function(product) {
    const getCategoryColor = (category) => {
        const colors = {
            'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
            'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
            'Soins': '22c55e', 'Bébé': '06b6d4', 'Homme': '3b82f6',
            'Dentaire': '6366f1'
        };
        return colors[category] || '10b981';
    };
    
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const categoryColor = getCategoryColor(product.categorie);
    const imageUrl = product.image || `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;

    const stockStatus = product.stock === 0 ? 'rupture' : 
                       product.stock <= 5 ? 'faible' : 'bon';
    
    const stockColor = stockStatus === 'rupture' ? 'text-red-600' :
                      stockStatus === 'faible' ? 'text-yellow-600' : 'text-green-600';

    return `
        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors group">
            <td class="py-4 px-6">
                <div class="relative">
                    <img src="${imageUrl}" alt="${product.nom}" 
                         class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200 shadow-sm group-hover:scale-105 transition-transform duration-200"
                         onerror="this.src='https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}'">
                    ${product.enVedette ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"><i class="fas fa-star text-xs text-white"></i></div>' : ''}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="max-w-xs">
                    <div class="font-semibold text-gray-900 truncate" title="${product.nom}">${product.nom}</div>
                    <div class="text-sm text-emerald-600">${product.categorie}</div>
                    <div class="text-xs text-gray-500">${product.marque || 'Sans marque'}</div>
                    ${product.enPromotion ? '<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">Promo</span>' : ''}
                </div>
            </td>
            <td class="py-4 px-6">
                <div>
                    ${product.enPromotion && product.prixOriginal ? `
                        <div class="flex items-center space-x-2">
                            <span class="text-lg font-semibold text-red-600">${product.prix} DA</span>
                            <span class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</span>
                        </div>
                        <div class="text-xs text-green-600">-${Math.round((product.prixOriginal - product.prix) / product.prixOriginal * 100)}%</div>
                    ` : `
                        <span class="text-lg font-semibold text-emerald-700">${product.prix} DA</span>
                    `}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <span class="font-medium ${stockColor}">${product.stock}</span>
                    <span class="text-sm text-gray-500">unités</span>
                </div>
                ${stockStatus === 'rupture' ? '<div class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block mt-1">Rupture</div>' :
                  stockStatus === 'faible' ? '<div class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block mt-1">Stock faible</div>' : ''}
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 rounded-full ${product.actif !== false ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <span class="text-sm font-medium ${product.actif !== false ? 'text-green-700' : 'text-red-700'}">
                        ${product.actif !== false ? 'Actif' : 'Inactif'}
                    </span>
                </div>
                <div class="flex flex-wrap gap-1">
                    ${product.enVedette ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">★ Vedette</span>' : ''}
                    ${product.enPromotion ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">% Promo</span>' : ''}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button onclick="openEditProductModal('${product._id}')" 
                            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all group"
                            title="Modifier">
                        <i class="fas fa-edit group-hover:scale-110 transition-transform"></i>
                    </button>
                    <button onclick="toggleFeatured('${product._id}', ${!product.enVedette})" 
                            class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 p-2 rounded-lg transition-all group"
                            title="${product.enVedette ? 'Retirer de la vedette' : 'Mettre en vedette'}">
                        <i class="fas fa-star ${product.enVedette ? 'text-yellow-500' : ''} group-hover:scale-110 transition-transform"></i>
                    </button>
                    <button onclick="duplicateProduct('${product._id}')" 
                            class="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all group"
                            title="Dupliquer">
                        <i class="fas fa-copy group-hover:scale-110 transition-transform"></i>
                    </button>
                    <button onclick="deleteProduct('${product._id}')" 
                            class="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all group"
                            title="Supprimer">
                        <i class="fas fa-trash group-hover:scale-110 transition-transform"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// Enhanced Orders Management  
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
        this.showLoading();
        console.log('Loading orders from admin panel...');
        
        // Always start with localStorage orders
        let orders = [...adminOrders];
        console.log('Local orders loaded:', orders.length);
        
        // Try to merge with API orders
        try {
            const data = await apiCall('/orders');
            if (data && data.orders && data.orders.length > 0) {
                console.log('API orders loaded:', data.orders.length);
                const apiOrders = data.orders.filter(apiOrder => 
                    !orders.some(localOrder => localOrder.numeroCommande === apiOrder.numeroCommande)
                );
                orders = [...orders, ...apiOrders];
            }
        } catch (error) {
            console.log('API unavailable, using only local orders');
        }
        
        // Sort by date, newest first
        orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
        
        console.log('Total orders to display:', orders.length);
        this.hideLoading();
        
        // Calculate order statistics
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.statut === 'en-attente').length,
            confirmed: orders.filter(o => o.statut === 'confirmée').length,
            shipped: orders.filter(o => o.statut === 'expédiée').length,
            delivered: orders.filter(o => o.statut === 'livrée').length,
            cancelled: orders.filter(o => o.statut === 'annulée').length,
            todayOrders: orders.filter(o => {
                const orderDate = new Date(o.dateCommande);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
            }).length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
        };
        
        document.getElementById('adminContent').innerHTML = `
            <!-- Orders Header with Stats -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h2 class="text-3xl font-bold text-emerald-800 mb-2">Gestion des commandes</h2>
                        <div class="flex flex-wrap gap-4 text-sm">
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                ${stats.total} commandes
                            </span>
                            <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                                ${stats.pending} en attente
                            </span>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                ${stats.confirmed} confirmées
                            </span>
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                                ${stats.delivered} livrées
                            </span>
                            <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                                ${stats.todayOrders} aujourd'hui
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="app.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                        <button onclick="exportOrders()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-download mr-2"></i>Exporter
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Order Filters -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                        <input type="text" id="orderSearch" placeholder="Numéro, nom, email..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select id="orderStatusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Tous les statuts</option>
                            <option value="en-attente">En attente</option>
                            <option value="confirmée">Confirmées</option>
                            <option value="préparée">Préparées</option>
                            <option value="expédiée">Expédiées</option>
                            <option value="livrée">Livrées</option>
                            <option value="annulée">Annulées</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
                        <select id="orderPeriodFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Toutes les périodes</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                            <option value="quarter">Ce trimestre</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Montant</label>
                        <select id="orderAmountFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Tous les montants</option>
                            <option value="0-1000">0 - 1 000 DA</option>
                            <option value="1000-5000">1 000 - 5 000 DA</option>
                            <option value="5000-10000">5 000 - 10 000 DA</option>
                            <option value="10000+">10 000+ DA</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="applyOrderFilters()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                            <i class="fas fa-filter mr-2"></i>Filtrer
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Orders Table -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                ${orders.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                        <p class="text-emerald-600 mb-4">Les commandes apparaîtront ici une fois passées</p>
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                            <h4 class="font-semibold text-blue-800 mb-2">Comment ça marche :</h4>
                            <p class="text-sm text-blue-700">Les commandes sont automatiquement ajoutées ici lors du checkout sur le site</p>
                        </div>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full" id="ordersTable">
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
                            <tbody id="ordersTableBody">
                                ${orders.map(order => this.renderOrderRow(order)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
        // Setup order filters
        this.setupOrderFilters();
        
    } catch (error) {
        this.hideLoading();
        console.error('Error loading orders:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-bold text-red-800 mb-2">Erreur de chargement des commandes</h3>
                <p class="text-red-600 mb-4">Détails: ${error.message}</p>
                <button onclick="app.loadAdminOrders()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Réessayer
                </button>
            </div>
        `;
    }
};

// Enhanced Order Row Renderer
PharmacieGaherApp.prototype.renderOrderRow = function(order) {
    return `
        <tr class="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors group">
            <td class="py-4 px-6">
                <div class="font-semibold text-emerald-800">#${order.numeroCommande}</div>
                <div class="text-sm text-emerald-600">${order.articles?.length || 0} article(s)</div>
                <div class="text-xs text-gray-500">${order.modePaiement}</div>
            </td>
            <td class="py-4 px-6">
                <div class="max-w-xs">
                    <div class="font-medium text-gray-900">${order.client?.prenom} ${order.client?.nom}</div>
                    <div class="text-sm text-gray-600 truncate" title="${order.client?.email}">${order.client?.email}</div>
                    <div class="text-xs text-gray-500">${order.client?.telephone}</div>
                    <div class="text-xs text-gray-500">${order.client?.wilaya}</div>
                </div>
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
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.statut)}">
                    ${getStatusLabel(order.statut)}
                </span>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button onclick="viewOrderDetails('${order._id || order.numeroCommande}')" 
                            class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all group"
                            title="Voir détails">
                        <i class="fas fa-eye group-hover:scale-110 transition-transform"></i>
                    </button>
                    ${order.statut === 'en-attente' ? `
                        <button onclick="updateOrderStatus('${order._id || order.numeroCommande}', 'confirmée')" 
                                class="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all group"
                                title="Confirmer">
                            <i class="fas fa-check group-hover:scale-110 transition-transform"></i>
                        </button>
                    ` : ''}
                    ${order.statut === 'confirmée' ? `
                        <button onclick="updateOrderStatus('${order._id || order.numeroCommande}', 'expédiée')" 
                                class="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-2 rounded-lg transition-all group"
                                title="Expédier">
                            <i class="fas fa-shipping-fast group-hover:scale-110 transition-transform"></i>
                        </button>
                    ` : ''}
                    ${order.statut === 'expédiée' ? `
                        <button onclick="updateOrderStatus('${order._id || order.numeroCommande}', 'livrée')" 
                                class="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-2 rounded-lg transition-all group"
                                title="Marquer comme livrée">
                            <i class="fas fa-check-double group-hover:scale-110 transition-transform"></i>
                        </button>
                    ` : ''}
                    <div class="relative group">
                        <button class="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button onclick="printOrder('${order._id || order.numeroCommande}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fas fa-print mr-2"></i>Imprimer
                            </button>
                            <button onclick="sendOrderEmail('${order._id || order.numeroCommande}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fas fa-envelope mr-2"></i>Envoyer email
                            </button>
                            <button onclick="duplicateOrder('${order._id || order.numeroCommande}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <i class="fas fa-copy mr-2"></i>Dupliquer
                            </button>
                            <hr class="my-1">
                            <button onclick="deleteOrder('${order._id || order.numeroCommande}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <i class="fas fa-trash mr-2"></i>Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
};

// Setup enhanced product filters
PharmacieGaherApp.prototype.setupProductFilters = function() {
    const searchInput = document.getElementById('adminProductSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.applyProductFilters();
            }, 500);
        });
    }

    ['adminCategoryFilter', 'adminStatusFilter', 'adminSortFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                this.applyProductFilters();
            });
        }
    });
};

// Apply product filters
PharmacieGaherApp.prototype.applyProductFilters = function() {
    const search = document.getElementById('adminProductSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('adminCategoryFilter')?.value || '';
    const status = document.getElementById('adminStatusFilter')?.value || '';
    const sort = document.getElementById('adminSortFilter')?.value || 'dateAjout';
    
    let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    
    // Apply filters
    if (search) {
        products = products.filter(p => 
            p.nom.toLowerCase().includes(search) ||
            (p.marque && p.marque.toLowerCase().includes(search)) ||
            (p.description && p.description.toLowerCase().includes(search))
        );
    }
    
    if (category) {
        products = products.filter(p => p.categorie === category);
    }
    
    if (status) {
        switch(status) {
            case 'active':
                products = products.filter(p => p.actif !== false);
                break;
            case 'inactive':
                products = products.filter(p => p.actif === false);
                break;
            case 'featured':
                products = products.filter(p => p.enVedette);
                break;
            case 'promotion':
                products = products.filter(p => p.enPromotion);
                break;
            case 'outOfStock':
                products = products.filter(p => p.stock === 0);
                break;
            case 'lowStock':
                products = products.filter(p => p.stock > 0 && p.stock <= 5);
                break;
        }
    }
    
    // Apply sorting
    switch(sort) {
        case 'nom':
            products.sort((a, b) => a.nom.localeCompare(b.nom));
            break;
        case 'prix':
            products.sort((a, b) => a.prix - b.prix);
            break;
        case 'stock':
            products.sort((a, b) => a.stock - b.stock);
            break;
        default: // dateAjout
            products.sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout));
    }
    
    // Update table body
    const tableBody = document.getElementById('productsTableBody');
    if (tableBody) {
        tableBody.innerHTML = products.map(product => this.renderProductRow(product)).join('');
    }
};

// Setup order filters
PharmacieGaherApp.prototype.setupOrderFilters = function() {
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.applyOrderFilters();
            }, 500);
        });
    }

    ['orderStatusFilter', 'orderPeriodFilter', 'orderAmountFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                this.applyOrderFilters();
            });
        }
    });
};

// Apply order filters
PharmacieGaherApp.prototype.applyOrderFilters = function() {
    const search = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('orderStatusFilter')?.value || '';
    const period = document.getElementById('orderPeriodFilter')?.value || '';
    const amount = document.getElementById('orderAmountFilter')?.value || '';
    
    let orders = [...adminOrders];
    
    // Apply search filter
    if (search) {
        orders = orders.filter(o => 
            o.numeroCommande.toLowerCase().includes(search) ||
            (o.client?.nom && o.client.nom.toLowerCase().includes(search)) ||
            (o.client?.prenom && o.client.prenom.toLowerCase().includes(search)) ||
            (o.client?.email && o.client.email.toLowerCase().includes(search)) ||
            (o.client?.telephone && o.client.telephone.includes(search))
        );
    }
    
    // Apply status filter
    if (status) {
        orders = orders.filter(o => o.statut === status);
    }
    
    // Apply period filter
    if (period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(period) {
            case 'today':
                orders = orders.filter(o => new Date(o.dateCommande) >= today);
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                orders = orders.filter(o => new Date(o.dateCommande) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                orders = orders.filter(o => new Date(o.dateCommande) >= monthAgo);
                break;
            case 'quarter':
                const quarterAgo = new Date(today);
                quarterAgo.setMonth(today.getMonth() - 3);
                orders = orders.filter(o => new Date(o.dateCommande) >= quarterAgo);
                break;
        }
    }
    
    // Apply amount filter
    if (amount) {
        switch(amount) {
            case '0-1000':
                orders = orders.filter(o => o.total >= 0 && o.total <= 1000);
                break;
            case '1000-5000':
                orders = orders.filter(o => o.total > 1000 && o.total <= 5000);
                break;
            case '5000-10000':
                orders = orders.filter(o => o.total > 5000 && o.total <= 10000);
                break;
            case '10000+':
                orders = orders.filter(o => o.total > 10000);
                break;
        }
    }
    
    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
    
    // Update table body
    const tableBody = document.getElementById('ordersTableBody');
    if (tableBody) {
        tableBody.innerHTML = orders.map(order => this.renderOrderRow(order)).join('');
    }
};

// Global function to add order to demo (called from checkout) - ENHANCED
window.addOrderToDemo = function(orderData) {
    console.log('🛒 Adding order to admin demo system:', orderData);
    
    try {
        // Ensure the order has a valid structure with all required fields
        const validOrder = {
            _id: orderData._id || Date.now().toString(),
            numeroCommande: orderData.numeroCommande,
            client: {
                userId: orderData.client?.userId || null,
                prenom: orderData.client?.prenom || '',
                nom: orderData.client?.nom || '',
                email: orderData.client?.email || '',
                telephone: orderData.client?.telephone || '',
                adresse: orderData.client?.adresse || '',
                ville: orderData.client?.ville || '',
                wilaya: orderData.client?.wilaya || '',
                codePostal: orderData.client?.codePostal || ''
            },
            articles: (orderData.articles || []).map(article => ({
                productId: article.productId || article.id,
                nom: article.nom,
                prix: article.prix || 0,
                quantite: article.quantite || 1,
                image: article.image || '',
                categorie: article.categorie || '',
                sousTotal: (article.prix || 0) * (article.quantite || 1)
            })),
            sousTotal: orderData.sousTotal || 0,
            fraisLivraison: orderData.fraisLivraison || 0,
            total: orderData.total || 0,
            statut: orderData.statut || 'en-attente',
            modePaiement: orderData.modePaiement || 'Paiement à la livraison',
            statutPaiement: orderData.statutPaiement || 'en-attente',
            dateCommande: orderData.dateCommande || new Date().toISOString(),
            dateConfirmation: orderData.dateConfirmation || null,
            dateExpedition: orderData.dateExpedition || null,
            dateLivraison: orderData.dateLivraison || null,
            commentaires: orderData.commentaires || '',
            notesAdmin: '',
            historiqueStatut: [{
                statut: 'en-attente',
                date: new Date(),
                commentaire: 'Commande créée'
            }],
            informationsLivraison: {
                transporteur: 'Shifa Livraison',
                numeroSuivi: '',
                delaiEstime: '2-5 jours ouvrables',
                adresseLivraison: orderData.client?.adresse || ''
            }
        };
        
        // Add to localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Check for duplicates based on numeroCommande
        const existingIndex = orders.findIndex(o => o.numeroCommande === validOrder.numeroCommande);
        if (existingIndex > -1) {
            console.log('⚠️ Order already exists, updating...');
            orders[existingIndex] = validOrder;
        } else {
            orders.unshift(validOrder); // Add at beginning (newest first)
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        // Update global variable
        adminOrders = orders;
        
        console.log('✅ Order added successfully to admin system. Total orders:', orders.length);
        console.log('📋 Order details:', {
            numeroCommande: validOrder.numeroCommande,
            client: `${validOrder.client.prenom} ${validOrder.client.nom}`,
            total: validOrder.total,
            articles: validOrder.articles.length
        });
        
        return validOrder;
        
    } catch (error) {
        console.error('❌ Error adding order to admin demo:', error);
        return null;
    }
};

// Helper functions for order management
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

// Export functions for global access
window.switchAdminSection = switchAdminSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.duplicateProduct = duplicateProduct;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.printOrder = printOrder;
window.sendOrderEmail = sendOrderEmail;
window.duplicateOrder = duplicateOrder;
window.exportOrders = exportOrders;
window.applyAdminFilters = applyAdminFilters;
window.applyOrderFilters = applyOrderFilters;
window.previewImage = previewImage;

console.log('✅ Enhanced Admin.js loaded with comprehensive features');
