// Complete Admin Panel with Full Product Management and Order System - FIXED Independent Version

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.allProducts = [];
        this.orders = [];
    }

    // Initialize admin manager
    async init() {
        console.log('Initializing Admin Manager...');
        await this.loadProducts();
        this.loadOrders();
    }

    // Load products from storage
    async loadProducts() {
        try {
            // Get products from localStorage first
            let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            
            // Try to get products from API as well
            try {
                const data = await window.apiCall('/products');
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
            
            this.allProducts = products;
            console.log(`Loaded ${this.allProducts.length} products`);
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.allProducts = [];
        }
    }

    // Load orders
    loadOrders() {
        try {
            this.orders = [...adminOrders];
            console.log(`Loaded ${this.orders.length} orders`);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }

    // Show toast message
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
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

    // Load orders management
    async loadAdminOrders() {
        try {
            console.log('Loading orders from admin panel...');
            
            // Always start with localStorage orders
            let orders = [...adminOrders];
            console.log('Local orders loaded:', orders.length);
            
            // Try to merge with API orders
            try {
                const data = await window.apiCall('/orders');
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
            
            document.getElementById('adminContent').innerHTML = `
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des commandes</h2>
                        <div class="flex gap-2">
                            <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ${orders.length} commande(s)
                            </span>
                            <button onclick="adminManager.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
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

// Product management functions (simplified for independent operation)
function openAddProductModal() {
    console.log('Opening add product modal...');
    // This would open a product modal - implementation would depend on your UI framework
    adminManager.showToast('Feature coming soon - Add product modal', 'info');
}

function openEditProductModal(productId) {
    console.log('Opening edit product modal for:', productId);
    adminManager.showToast('Feature coming soon - Edit product modal', 'info');
}

async function toggleFeatured(productId, newStatus) {
    try {
        console.log('Toggling featured status:', productId, newStatus);
        
        // Update in localStorage
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = localProducts.findIndex(p => p._id === productId);
        
        if (productIndex !== -1) {
            localProducts[productIndex].enVedette = newStatus;
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            console.log('Product featured status updated locally');
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

function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        try {
            console.log('Deleting product:', productId);
            
            // Delete from local storage
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            localProducts = localProducts.filter(p => p._id !== productId);
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            
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

// Order management functions
function viewOrderDetails(orderId) {
    console.log('Viewing order details for:', orderId);
    adminManager.showToast('Feature coming soon - Order details modal', 'info');
}

function updateOrderStatus(orderId, newStatus) {
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
        
        adminManager.showToast('Statut de la commande mis à jour', 'success');
        
        // Refresh orders list
        if (adminCurrentSection === 'orders') {
            adminManager.loadAdminOrders();
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        adminManager.showToast('Erreur lors de la mise à jour du statut', 'error');
    }
}

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
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;

console.log('✅ Enhanced Admin.js loaded successfully');
