// Complete Admin Panel with Full Product Management and Order System - FIXED VERSION

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://parapharmacie-gaher.onrender.com/api';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
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
    
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

// Products Management - Add to app prototype
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        // Get products from localStorage
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Try to get products from API as well
        try {
            const data = await apiCall('/products');
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

// Orders Management - FIXED
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
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
                                            <div class="font-medium text-gray-900">${order.client?.prenom || 'N/A'} ${order.client?.nom || ''}</div>
                                            <div class="text-sm text-gray-600">${order.client?.email || 'N/A'}</div>
                                            <div class="text-xs text-gray-500">${order.client?.adresse || order.client?.wilaya || 'N/A'}</div>
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

// Featured Products Management
PharmacieGaherApp.prototype.loadAdminFeatured = async function() {
    try {
        // Get products from local storage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        let featuredProducts = localProducts.filter(p => p.enVedette);
        let allProducts = localProducts.filter(p => !p.enVedette);
        
        // Try to get products from API
        try {
            const allData = await apiCall('/products');
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

// Function to add order to demo (called from checkout) - FIXED
window.addOrderToDemo = function(orderData) {
    console.log('Adding order to demo:', orderData);
    
    try {
        // Ensure the order has a valid structure with proper client data
        const validOrder = {
            _id: orderData._id || Date.now().toString(),
            numeroCommande: orderData.numeroCommande,
            client: {
                userId: orderData.client?.userId || null,
                prenom: orderData.client?.prenom || 'N/A',
                nom: orderData.client?.nom || 'N/A',
                email: orderData.client?.email || 'N/A',
                telephone: orderData.client?.telephone || 'N/A',
                adresse: orderData.client?.adresse || 'N/A',
                wilaya: orderData.client?.wilaya || 'N/A'
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

// Enhanced Product Modal Functions with Image Upload
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
        
        // If not found locally, try API
        if (!product) {
            try {
                const response = await fetch(buildApiUrl(`/products/${productId}`));
                if (response.ok) {
                    product = await response.json();
                }
            } catch (error) {
                console.log('API unavailable, unable to find product');
            }
        }
        
        // If still not found, show error
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

// Improved image preview function
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

// New function to save product directly
function saveProduct() {
    const form = document.getElementById('productForm');
    const isEditing = !!currentEditingProduct;
    
    // Validate form
    const nom = document.getElementById('productNom').value.trim();
    const prix = document.getElementById('productPrix').value;
    const stock = document.getElementById('productStock').value;
    const categorie = document.getElementById('productCategorie').value;
    const description = document.getElementById('productDescription').value.trim();
    
    if (!nom || !prix || !stock || !categorie || !description) {
        app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
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
            dateAjout: new Date().toISOString()
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
        
        // Save to localStorage first
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
            // Add new product
            localProducts.push(productData);
        }
        
        // Save back to localStorage
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        console.log('Product saved to localStorage');
        
        // Update the app's product cache to refresh main page immediately
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        // Try to save to API (optional)
        const saveToApi = async () => {
            try {
                const endpoint = isEditing ? `/products/${productData._id}` : '/products';
                const method = isEditing ? 'PUT' : 'POST';
                
                const response = await fetch(buildApiUrl(endpoint), {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    console.log('Product saved to API successfully');
                } else {
                    console.log('API save failed but product saved locally');
                }
            } catch (error) {
                console.log('API save failed, but product saved locally:', error);
            }
        };
        
        // Save to API in background
        saveToApi();
        
        // Show success message
        app.showToast(isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
        closeProductModal();
        
        // Refresh admin section
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured' && productData.enVedette) {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        app.showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
        // Re-enable button
        button.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

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
            
            // Update the app's product cache
            if (window.app) {
                window.app.refreshProductsCache();
            }
        }
        
        // Try to update via API
        try {
            await apiCall(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ enVedette: newStatus })
            });
            console.log('Product featured status updated via API');
        } catch (error) {
            console.log('API update failed, but local update succeeded');
        }
        
        app.showToast(`Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de coeur`, 'success');
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error toggling featured:', error);
        app.showToast('Erreur lors de la modification', 'error');
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
            
            // Update the app's product cache
            if (window.app) {
                window.app.refreshProductsCache();
            }
            
            // Try to delete from API
            try {
                await apiCall(`/products/${productId}`, {
                    method: 'DELETE'
                });
                console.log('Product deleted from API successfully');
            } catch (error) {
                console.log('API delete failed, but product deleted locally:', error);
            }
            
            // Refresh the products list
            app.showToast('Produit supprimé avec succès', 'success');
            
            if (adminCurrentSection === 'products') {
                app.loadAdminProducts();
            } else if (adminCurrentSection === 'featured') {
                app.loadAdminFeatured();
            }
            
        } catch (error) {
            console.error('Error deleting product:', error);
            app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

// Order detail modal - FIXED
async function viewOrderDetails(orderId) {
    try {
        console.log('Viewing order details for:', orderId);
        
        // Find order in localStorage first
        let order = adminOrders.find(o => o._id === orderId || o.numeroCommande === orderId);
        
        if (!order) {
            // Try to get from API
            try {
                const response = await fetch(buildApiUrl(`/orders/${orderId}`), {
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                if (response.ok) {
                    order = await response.json();
                }
            } catch (error) {
                console.log('Order not found in API');
            }
        }
        
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
                                        <p><strong>Nom:</strong> ${order.client?.prenom || 'N/A'} ${order.client?.nom || ''}</p>
                                        <p><strong>Email:</strong> ${order.client?.email || 'N/A'}</p>
                                        <p><strong>Téléphone:</strong> ${order.client?.telephone || 'N/A'}</p>
                                        <p><strong>Adresse:</strong> ${order.client?.adresse || 'N/A'}</p>
                                        <p><strong>Wilaya:</strong> ${order.client?.wilaya || 'N/A'}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-semibold text-emerald-800 mb-4">Détails commande</h4>
                                    <div class="space-y-2 text-sm">
                                        <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleDateString('fr-FR')} à ${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</p>
                                        <p><strong>Statut:</strong> <span class="px-2 py-1 rounded text-xs ${getStatusColor(order.statut)}">${getStatusLabel(order.statut)}</span></p>
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
            app.showToast('Commande non trouvée', 'error');
        }
        
    } catch (error) {
        console.error('Error viewing order details:', error);
        app.showToast('Erreur lors de l\'affichage des détails', 'error');
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
        
        // Try to update via API
        try {
            await apiCall(`/orders/${orderId}`, {
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
        
        app.showToast('Statut de la commande mis à jour', 'success');
        
        // Close modal if open
        closeOrderDetailModal();
        
        // Refresh orders list
        if (adminCurrentSection === 'orders') {
            app.loadAdminOrders();
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        app.showToast('Erreur lors de la mise à jour du statut', 'error');
    }
}

// Utility functions
async function refreshProductCache() {
    if (window.app) {
        window.app.refreshProductsCache();
    }
    app.showToast('Cache actualisé', 'success');
}

async function validateAllProducts() {
    app.showToast('Validation terminée', 'success');
}

async function clearAllProducts() {
    if (confirm('ATTENTION: Cette action supprimera TOUS les produits. Êtes-vous absolument sûr ?')) {
        localStorage.removeItem('demoProducts');
        
        // Update the app's product cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        app.showToast('Tous les produits ont été supprimés', 'success');
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        }
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

// Error handling for API calls
window.handleApiError = function(error, context = '') {
    console.error(`❌ API Error ${context}:`, error);
    
    if (error.message.includes('401') || error.message.includes('Token invalide')) {
        // Token expired or invalid
        localStorage.removeItem('token');
        if (window.app) {
            window.app.currentUser = null;
            window.app.updateUserUI();
            window.app.showToast('Session expirée. Veuillez vous reconnecter.', 'warning');
            window.app.showPage('login');
        }
    } else if (error.message.includes('403')) {
        if (window.app) {
            window.app.showToast('Accès refusé', 'error');
        }
    } else if (error.message.includes('404')) {
        if (window.app) {
            window.app.showToast('Ressource non trouvée', 'error');
        }
    } else if (error.message.includes('500')) {
        if (window.app) {
            window.app.showToast('Erreur serveur. Veuillez réessayer plus tard.', 'error');
        }
    } else {
        if (window.app) {
            window.app.showToast(error.message || 'Une erreur est survenue', 'error');
        }
    }
};

// Export functions for global access
window.switchAdminSection = switchAdminSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.refreshProductCache = refreshProductCache;
window.validateAllProducts = validateAllProducts;
window.clearAllProducts = clearAllProducts;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderDetailModal = closeOrderDetailModal;
window.previewImage = previewImage;

console.log('✅ Fixed Admin.js loaded with proper app integration');
