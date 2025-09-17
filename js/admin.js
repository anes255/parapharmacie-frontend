// Complete Admin Panel with Full Product Management and Order System - FIXED VERSION WITH DASHBOARD

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://parapharmacie-gaher.onrender.com/api';

// Helper function to make authenticated API calls
async function authenticatedApiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('No auth token found');
        if (window.app) {
            window.app.showToast('Session expirée. Veuillez vous reconnecter.', 'error');
            window.app.showPage('login');
        }
        throw new Error('No authentication token');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    console.log('🌐 API Call:', endpoint);
    
    try {
        const response = await fetch(url, finalOptions);
        
        console.log('📡 Response:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText || `HTTP error! status: ${response.status}` };
            }
            
            // Handle auth errors
            if (response.status === 401) {
                localStorage.removeItem('token');
                if (window.app) {
                    window.app.currentUser = null;
                    window.app.updateUserUI();
                    window.app.showToast('Session expirée. Veuillez vous reconnecter.', 'error');
                    window.app.showPage('login');
                }
                throw new Error('Session expirée');
            }
            
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API Success:', endpoint);
        return data;
        
    } catch (error) {
        console.error('❌ API call failed for', endpoint + ':', error.message);
        throw error;
    }
}

// DASHBOARD FUNCTIONALITY - FIXED
PharmacieGaherApp.prototype.loadAdminDashboard = async function() {
    try {
        console.log('📊 Loading admin dashboard...');
        
        // Show loading state
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex items-center justify-center py-16">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <span class="ml-4 text-emerald-600 font-medium">Chargement du dashboard...</span>
                </div>
            </div>
        `;
        
        // Get dashboard data from API
        const dashboardData = await authenticatedApiCall('/admin/dashboard');
        
        console.log('📊 Dashboard data received:', dashboardData);
        
        // Render dashboard
        document.getElementById('adminContent').innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
                    <h1 class="text-3xl font-bold mb-2">Tableau de bord</h1>
                    <p class="text-emerald-100">Vue d'ensemble de votre parapharmacie</p>
                    <div class="text-xs opacity-75 mt-2">Dernière mise à jour: ${new Date(dashboardData.timestamp || Date.now()).toLocaleString('fr-FR')}</div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Products Stats -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-emerald-100 rounded-full">
                                <i class="fas fa-pills text-emerald-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-sm font-medium text-gray-600">Produits</h3>
                                <p class="text-2xl font-bold text-emerald-700">${dashboardData.products?.total || 0}</p>
                                <p class="text-xs text-emerald-600">${dashboardData.products?.active || 0} actifs</p>
                            </div>
                        </div>
                    </div>

                    <!-- Orders Stats -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-blue-100 rounded-full">
                                <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-sm font-medium text-gray-600">Commandes</h3>
                                <p class="text-2xl font-bold text-blue-700">${dashboardData.orders?.total || 0}</p>
                                <p class="text-xs text-orange-600">${dashboardData.orders?.pending || 0} en attente</p>
                            </div>
                        </div>
                    </div>

                    <!-- Users Stats -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 rounded-full">
                                <i class="fas fa-users text-purple-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-sm font-medium text-gray-600">Utilisateurs</h3>
                                <p class="text-2xl font-bold text-purple-700">${dashboardData.users?.total || 0}</p>
                                <p class="text-xs text-purple-600">${dashboardData.users?.active || 0} actifs</p>
                            </div>
                        </div>
                    </div>

                    <!-- Revenue Stats -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-200/50 p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-green-100 rounded-full">
                                <i class="fas fa-chart-line text-green-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-sm font-medium text-gray-600">CA mensuel</h3>
                                <p class="text-2xl font-bold text-green-700">${(dashboardData.revenue?.monthly || 0).toLocaleString()} DA</p>
                                <p class="text-xs text-green-600">Moyenne: ${(dashboardData.revenue?.average || 0).toLocaleString()} DA</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Orders -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-bold text-emerald-800 mb-4">
                            <i class="fas fa-clock mr-2"></i>Commandes récentes
                        </h3>
                        ${dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? `
                            <div class="space-y-3">
                                ${dashboardData.recentOrders.map(order => `
                                    <div class="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                                        <div>
                                            <div class="font-medium text-emerald-800">#${order.numeroCommande}</div>
                                            <div class="text-sm text-emerald-600">${order.client?.prenom} ${order.client?.nom}</div>
                                            <div class="text-xs text-gray-500">${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-emerald-700">${order.total} DA</div>
                                            <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(order.statut)}">${getStatusLabel(order.statut)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <i class="fas fa-shopping-cart text-gray-300 text-4xl mb-4"></i>
                                <p class="text-gray-500">Aucune commande récente</p>
                            </div>
                        `}
                    </div>

                    <!-- Top Products -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-bold text-emerald-800 mb-4">
                            <i class="fas fa-star mr-2"></i>Produits populaires
                        </h3>
                        ${dashboardData.topProducts && dashboardData.topProducts.length > 0 ? `
                            <div class="space-y-3">
                                ${dashboardData.topProducts.map((product, index) => `
                                    <div class="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                ${index + 1}
                                            </div>
                                            <div>
                                                <div class="font-medium text-emerald-800">${product.nom}</div>
                                                <div class="text-sm text-emerald-600">${product.totalSold} vendus</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-emerald-700">${(product.revenue || 0).toLocaleString()} DA</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <i class="fas fa-chart-bar text-gray-300 text-4xl mb-4"></i>
                                <p class="text-gray-500">Aucune donnée de vente</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Orders by Status -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                    <h3 class="text-lg font-bold text-emerald-800 mb-4">
                        <i class="fas fa-chart-pie mr-2"></i>Commandes par statut
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        ${Object.entries(dashboardData.orders?.byStatus || {}).map(([status, count]) => `
                            <div class="text-center p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                                <div class="text-2xl font-bold text-emerald-700">${count}</div>
                                <div class="text-sm text-emerald-600">${getStatusLabel(status)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                    <h3 class="text-lg font-bold text-emerald-800 mb-4">
                        <i class="fas fa-bolt mr-2"></i>Actions rapides
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onclick="switchAdminSection('products')" 
                                class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-pills mr-2"></i>Gérer produits
                        </button>
                        <button onclick="switchAdminSection('orders')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-shopping-cart mr-2"></i>Voir commandes
                        </button>
                        <button onclick="openAddProductModal()" 
                                class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-plus mr-2"></i>Nouveau produit
                        </button>
                        <button onclick="switchAdminSection('featured')" 
                                class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                            <i class="fas fa-star mr-2"></i>Coups de cœur
                        </button>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Dashboard loaded successfully');
        
    } catch (error) {
        console.error('❌ Dashboard loading error:', error);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
                    <div>
                        <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement du dashboard</h3>
                        <p class="text-red-700 mb-4">Détails: ${error.message}</p>
                        <div class="space-x-4">
                            <button onclick="app.loadAdminDashboard()" 
                                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                <i class="fas fa-redo mr-2"></i>Réessayer
                            </button>
                            <button onclick="switchAdminSection('orders')" 
                                    class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                                <i class="fas fa-list mr-2"></i>Voir les commandes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (window.app) {
            window.app.showToast('Erreur de chargement du dashboard', 'error');
        }
    }
};

// Products Management - Add to app prototype
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        // Get products from localStorage
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Try to get products from API as well
        try {
            const data = await authenticatedApiCall('/admin/products');
            if (data && data.products && data.products.length > 0) {
                // Merge API products with local ones, avoiding duplicates
                const localIds = products.map(p => p._id);
                const newApiProducts = data.products.filter(p => !localIds.includes(p._id));
                products = [...products, ...newApiProducts];
                
                // Update localStorage with merged data
                localStorage.setItem('demoProducts', JSON.stringify(products));
            }
        } catch (error) {
            console.log('API unavailable, using local products only');
        }
        
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
                <p class="text-red-800">Erreur de chargement des produits</p>
            </div>
        `;
    }
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
};

// Orders Management - FIXED WITH API CONNECTION
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
        console.log('📦 Loading admin orders...');
        
        // Show loading state
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex items-center justify-center py-16">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <span class="ml-4 text-emerald-600 font-medium">Chargement des commandes...</span>
                </div>
            </div>
        `;
        
        // Get orders from API
        const data = await authenticatedApiCall('/admin/orders');
        let orders = data.orders || [];
        
        console.log(`📦 Loaded ${orders.length} orders from API`);
        
        // Also get local orders for backup
        const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Merge orders avoiding duplicates
        const allOrderIds = orders.map(o => o.numeroCommande);
        const uniqueLocalOrders = localOrders.filter(o => !allOrderIds.includes(o.numeroCommande));
        orders = [...orders, ...uniqueLocalOrders];
        
        // Sort by date, newest first
        orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
        
        console.log('📦 Total orders to display:', orders.length);
        
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
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                            <h4 class="font-semibold text-blue-800 mb-2">Info:</h4>
                            <p class="text-sm text-blue-700">Les commandes sont automatiquement ajoutées ici lors du checkout</p>
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
                                ${orders.map(order => `
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
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement des commandes</h3>
                <p class="text-red-700 mb-4">Détails: ${error.message}</p>
                <button onclick="app.loadAdminOrders()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    <i class="fas fa-redo mr-2"></i>Réessayer
                </button>
            </div>
        `;
    }
};

// Featured Products Management
PharmacieGaherApp.prototype.loadAdminFeatured = async function() {
    try {
        // Get products from local storage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        let featuredProducts = localProducts.filter(p => p.enVedette);
        let allProducts = localProducts.filter(p => !p.enVedette);
        
        // Try to get products from API
        try {
            const allData = await authenticatedApiCall('/admin/products');
            if (allData && allData.products && allData.products.length > 0) {
                // Merge API products, avoiding duplicates
                const localIds = localProducts.map(p => p._id);
                const newApiProducts = allData.products.filter(p => !localIds.includes(p._id));
                
                featuredProducts = [...featuredProducts, ...newApiProducts.filter(p => p.enVedette)];
                allProducts = [...allProducts, ...newApiProducts.filter(p => !p.enVedette)];
            }
        } catch (error) {
            console.log('API unavailable, using local products');
        }
        
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
                            <p class="text-green-600">Aucun produit problématique détecté</p>
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
                        <button onclick="validateAllProducts()" 
                                class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl">
                            <i class="fas fa-check-double mr-2"></i>Valider tous les produits
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

// Function to add order to demo (called from checkout) - FIXED
window.addOrderToDemo = function(orderData) {
    console.log('Adding order to demo:', orderData);
    
    try {
        // Ensure the order has a valid structure
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
        
        // Add to localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Check for duplicates based on numeroCommande
        const existingIndex = orders.findIndex(o => o.numeroCommande === validOrder.numeroCommande);
        if (existingIndex > -1) {
            console.log('Order already exists, updating...');
            orders[existingIndex] = validOrder;
        } else {
            orders.unshift(validOrder);
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        // Update global variable
        adminOrders = orders;
        
        console.log('Order added successfully. Total orders:', orders.length);
        console.log('Order details:', validOrder);
        
        return validOrder;
        
    } catch (error) {
        console.error('Error adding order to demo:', error);
        return null;
    }
};

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

// Export functions for global access
window.switchAdminSection = switchAdminSection;

console.log('✅ Fixed Admin.js loaded with dashboard functionality');
