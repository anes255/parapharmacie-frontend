// Enhanced Admin Panel with Full Product Management and Image Upload Support

// Global variables
let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

// Enhanced API Configuration
const ADMIN_API_CONFIG = {
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://parapharmacie-gaher.onrender.com/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 2
};

// Enhanced API call function with proper auth
async function adminApiCall(endpoint, options = {}) {
    const url = `${ADMIN_API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        mode: 'cors'
    };
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['x-auth-token'] = token;
    }
    
    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    console.log(`🔄 Admin API Call: ${finalOptions.method} ${url}`);
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_CONFIG.TIMEOUT);
        
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📡 Response: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Admin API Success');
        return data;
        
    } catch (error) {
        console.error('❌ Admin API Error:', error.message);
        
        if (error.name === 'AbortError') {
            throw new Error('Timeout - Le serveur met trop de temps à répondre');
        }
        
        throw error;
    }
}

// Enhanced dashboard loading
PharmacieGaherApp.prototype.loadAdminDashboard = async function() {
    try {
        console.log('📊 Loading admin dashboard...');
        
        // Start with local stats
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        let stats = {
            products: {
                total: localProducts.length,
                active: localProducts.filter(p => p.actif !== false).length,
                featured: localProducts.filter(p => p.enVedette).length,
                promotions: localProducts.filter(p => p.enPromotion).length
            },
            orders: {
                total: localOrders.length,
                pending: localOrders.filter(o => o.statut === 'en-attente').length,
                confirmed: localOrders.filter(o => o.statut === 'confirmée').length,
                delivered: localOrders.filter(o => o.statut === 'livrée').length
            },
            users: { total: 1, active: 1 },
            revenue: {
                monthly: localOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                currency: 'DA'
            }
        };
        
        // Try to get real stats from API
        try {
            const data = await adminApiCall('/admin/dashboard');
            if (data && data.stats) {
                stats = { ...stats, ...data.stats };
            }
        } catch (error) {
            console.log('Using local stats, API unavailable:', error.message);
        }
        
        document.getElementById('adminContent').innerHTML = `
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">Produits</p>
                            <p class="text-3xl font-bold text-blue-800">${stats.products.total}</p>
                            <p class="text-xs text-blue-500 mt-1">${stats.products.active} actifs</p>
                        </div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-pills text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-green-600 uppercase tracking-wide">Commandes</p>
                            <p class="text-3xl font-bold text-green-800">${stats.orders.total}</p>
                            <p class="text-xs text-green-500 mt-1">${stats.orders.pending} en attente</p>
                        </div>
                        <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-shopping-bag text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-yellow-600 uppercase tracking-wide">En vedette</p>
                            <p class="text-3xl font-bold text-yellow-800">${stats.products.featured}</p>
                            <p class="text-xs text-yellow-500 mt-1">Coups de coeur</p>
                        </div>
                        <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-star text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-purple-600 uppercase tracking-wide">Revenus</p>
                            <p class="text-3xl font-bold text-purple-800">${stats.revenue.monthly}</p>
                            <p class="text-xs text-purple-500 mt-1">${stats.revenue.currency} ce mois</p>
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
            
            <!-- Recent Activity -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Activité récente</h2>
                <div class="space-y-4">
                    ${stats.orders.total === 0 ? `
                        <div class="text-center py-8">
                            <i class="fas fa-chart-line text-6xl text-emerald-200 mb-4"></i>
                            <p class="text-emerald-600">Aucune activité récente</p>
                        </div>
                    ` : `
                        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <p class="text-emerald-800">📊 Dernière synchronisation des données effectuée</p>
                            <p class="text-emerald-600 text-sm">${new Date().toLocaleString('fr-FR')}</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                <p class="text-red-700">${error.message}</p>
                <button onclick="app.loadAdminDashboard()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Enhanced product management
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        console.log('📦 Loading products for admin...');
        
        // Load from localStorage first
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        // Try to sync with API
        try {
            const data = await adminApiCall('/admin/products?limit=100');
            if (data && data.products && data.products.length > 0) {
                // Merge API products with local ones
                const localIds = products.map(p => p._id);
                const newApiProducts = data.products.filter(p => !localIds.includes(p._id));
                
                if (newApiProducts.length > 0) {
                    products = [...products, ...newApiProducts];
                    localStorage.setItem('demoProducts', JSON.stringify(products));
                }
            }
        } catch (error) {
            console.log('API sync failed, using local products:', error.message);
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
                        <button onclick="syncProducts()" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
                            <i class="fas fa-sync mr-2"></i>Synchroniser
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
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement des produits</h3>
                <p class="text-red-700 mb-4">${error.message}</p>
                <button onclick="app.loadAdminProducts()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Product row renderer
PharmacieGaherApp.prototype.renderProductRow = function(product) {
    const getCategoryColor = (category) => {
        const colors = {
            'Vitalité': '10b981', 'Cheveux': 'f59e0b', 'Visage': 'ec4899',
            'Intime': 'ef4444', 'Solaire': 'f97316', 'Bébé': '06b6d4',
            'Homme': '3b82f6', 'Soins': '22c55e', 'Dentaire': '6366f1', 'Sport': 'f43f5e'
        };
        return colors[category] || '10b981';
    };
    
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const categoryColor = getCategoryColor(product.categorie);
    
    let imageUrl = product.image;
    if (!imageUrl || (!imageUrl.startsWith('data:image') && !imageUrl.startsWith('http'))) {
        imageUrl = `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }

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
                ${product.prixOriginal ? `<div class="text-xs text-gray-400 line-through">${product.prixOriginal} DA</div>` : ''}
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
                ${product.enPromotion ? '<div class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block mt-1">🏷️ Promotion</div>' : ''}
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

// Enhanced product modal with image upload
function openAddProductModal() {
    currentEditingProduct = null;
    showProductModal('Ajouter un nouveau produit', 'Ajouter le produit');
}

async function openEditProductModal(productId) {
    try {
        console.log('Opening edit modal for product:', productId);
        
        // Find product in local storage first
        let product = null;
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        product = localProducts.find(p => p._id === productId);
        
        // If not found locally, try API
        if (!product) {
            try {
                product = await adminApiCall(`/products/${productId}`);
            } catch (error) {
                console.log('Product not found in API');
            }
        }
        
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
            <div class="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 class="text-2xl font-bold text-emerald-800">${title}</h3>
                    <button onclick="closeProductModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[80vh]">
                    <form id="productForm" class="space-y-6">
                        <input type="hidden" id="productId" value="${currentEditingProduct ? currentEditingProduct._id : ''}">
                        
                        <!-- Image Upload Section -->
                        <div class="bg-emerald-50/50 border border-emerald-200 rounded-xl p-6">
                            <h4 class="text-lg font-semibold text-emerald-800 mb-4">Image du produit</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div id="imagePreviewContainer" class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center h-64 flex items-center justify-center">
                                        <div id="imagePreviewPlaceholder">
                                            <i class="fas fa-image text-gray-400 text-4xl mb-2"></i>
                                            <p class="text-gray-500">Aperçu de l'image</p>
                                            <p class="text-xs text-gray-400 mt-2">Formats: JPG, PNG, GIF (max 5MB)</p>
                                        </div>
                                        <img id="imagePreview" src="" alt="Aperçu" class="max-h-56 max-w-full hidden rounded-lg shadow-lg">
                                    </div>
                                </div>
                                <div class="flex flex-col justify-center space-y-4">
                                    <div>
                                        <label for="productImageUpload" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 px-6 rounded-xl text-center cursor-pointer flex items-center justify-center transition-all shadow-lg">
                                            <i class="fas fa-upload mr-2"></i>Télécharger une image
                                            <input type="file" id="productImageUpload" name="image" accept="image/*" class="hidden" onchange="previewImage(this)">
                                        </label>
                                    </div>
                                    <div class="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h5 class="font-semibold text-blue-800 mb-2">Conseils pour une bonne image:</h5>
                                        <ul class="space-y-1 text-blue-700">
                                            <li>• Résolution recommandée: 800x800px</li>
                                            <li>• Fond blanc ou transparent</li>
                                            <li>• Produit centré et bien éclairé</li>
                                            <li>• Format carré de préférence</li>
                                        </ul>
                                    </div>
                                    <input type="hidden" id="productImageUrl" name="imageUrl">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                                <input type="text" id="productNom" name="nom" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Ex: Vitamines C 1000mg">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                                <input type="text" id="productMarque" name="marque" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="Ex: Pharmacia">
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                            <textarea id="productDescription" name="description" required rows="3" 
                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                      placeholder="Description détaillée du produit, ses bienfaits..."></textarea>
                        </div>
                        
                        <!-- Price and Stock -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                                <input type="number" id="productPrix" name="prix" required min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="2500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" id="productPrixOriginal" name="prixOriginal" min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="3000 (pour promotions)">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                                <input type="number" id="productStock" name="stock" required min="0" step="1" 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="50">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                                <select id="productCategorie" name="categorie" required 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all">
                                    <option value="">Sélectionnez</option>
                                    <option value="Vitalité">Vitalité</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Cheveux">Cheveux</option>
                                    <option value="Visage">Visage</option>
                                    <option value="Intime">Intime</option>
                                    <option value="Solaire">Solaire</option>
                                    <option value="Soins">Soins</option>
                                    <option value="Bébé">Bébé</option>
                                    <option value="Homme">Homme</option>
                                    <option value="Dentaire">Dentaire</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Additional Info -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Ingrédients</label>
                                <textarea id="productIngredients" name="ingredients" rows="3" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Vitamine C, Zinc, Magnésium..."></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Mode d'emploi</label>
                                <textarea id="productModeEmploi" name="modeEmploi" rows="3" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="1 comprimé par jour avec un verre d'eau..."></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Précautions</label>
                                <textarea id="productPrecautions" name="precautions" rows="3" 
                                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Ne pas dépasser la dose recommandée..."></textarea>
                            </div>
                        </div>
                        
                        <!-- Options -->
                        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">Options du produit</h4>
                            <div class="flex flex-wrap gap-6">
                                <label class="flex items-center">
                                    <input type="checkbox" id="productEnVedette" name="enVedette" 
                                           class="rounded text-emerald-600 mr-3 w-5 h-5">
                                    <span class="text-sm font-medium text-gray-700">⭐ Mettre en vedette (coup de cœur)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="productEnPromotion" name="enPromotion" 
                                           class="rounded text-emerald-600 mr-3 w-5 h-5">
                                    <span class="text-sm font-medium text-gray-700">🏷️ En promotion</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="productActif" name="actif" checked 
                                           class="rounded text-emerald-600 mr-3 w-5 h-5">
                                    <span class="text-sm font-medium text-gray-700">✅ Produit actif (visible sur le site)</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button type="button" onclick="closeProductModal()" 
                                    class="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                Annuler
                            </button>
                            <button type="button" onclick="saveProduct()" id="productSubmitBtn" 
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
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

// Enhanced image preview function
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    const imageUrl = document.getElementById('productImageUrl');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            app.showToast('Image trop volumineuse. Maximum 5MB.', 'error');
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
            console.log('✅ Image preview generated');
        };
        
        reader.readAsDataURL(file);
    } else {
        // Reset preview if no file selected
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        imageUrl.value = '';
    }
}

// Fill form with product data
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

// Enhanced save product function
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
            dateAjout: isEditing ? currentEditingProduct.dateAjout : new Date().toISOString()
        };
        
        // Add optional fields
        if (prixOriginal) {
            productData.prixOriginal = parseInt(prixOriginal);
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
        
        console.log('💾 Saving product:', productData);
        
        // Save to localStorage first (immediate)
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        if (isEditing) {
            const index = localProducts.findIndex(p => p._id === productData._id);
            if (index !== -1) {
                localProducts[index] = productData;
            } else {
                localProducts.push(productData);
            }
        } else {
            localProducts.push(productData);
        }
        
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        console.log('✅ Product saved to localStorage');
        
        // Update the app's product cache immediately
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        // Try to save to API (background)
        const saveToApi = async () => {
            try {
                const endpoint = isEditing ? `/admin/products/${productData._id}` : '/admin/products';
                const method = isEditing ? 'PUT' : 'POST';
                
                // Prepare FormData for file upload
                const formData = new FormData();
                
                // Add all product fields
                Object.keys(productData).forEach(key => {
                    if (key !== 'image' && productData[key] !== undefined && productData[key] !== null) {
                        formData.append(key, productData[key]);
                    }
                });
                
                // Handle image
                const fileInput = document.getElementById('productImageUpload');
                if (fileInput.files && fileInput.files[0]) {
                    formData.append('image', fileInput.files[0]);
                } else if (imageUrl && imageUrl.startsWith('data:image')) {
                    formData.append('imageUrl', imageUrl);
                }
                
                const response = await adminApiCall(endpoint, {
                    method: method,
                    body: formData
                });
                
                console.log('✅ Product saved to API:', response);
                
            } catch (error) {
                console.log('⚠️ API save failed, but product saved locally:', error.message);
            }
        };
        
        // Save to API in background
        saveToApi();
        
        // Show success message and close modal
        app.showToast(isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
        closeProductModal();
        
        // Refresh admin section
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured' && productData.enVedette) {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('❌ Error saving product:', error);
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
        console.log('🌟 Toggling featured status:', productId, newStatus);
        
        // Update in localStorage first
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = localProducts.findIndex(p => p._id === productId);
        
        if (productIndex !== -1) {
            localProducts[productIndex].enVedette = newStatus;
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            
            // Update the app's product cache
            if (window.app) {
                window.app.refreshProductsCache();
            }
        }
        
        // Try to update via API
        try {
            await adminApiCall(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ enVedette: newStatus })
            });
        } catch (error) {
            console.log('API update failed, but local update succeeded');
        }
        
        app.showToast(`Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de cœur`, 'success');
        
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        console.log('🗑️ Deleting product:', productId);
        
        // Delete from local storage first
        let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const initialCount = localProducts.length;
        localProducts = localProducts.filter(p => p._id !== productId);
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        // Update the app's product cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        // Try to delete from API
        try {
            await adminApiCall(`/admin/products/${productId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.log('API delete failed, but product deleted locally');
        }
        
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

// Sync products with API
async function syncProducts() {
    try {
        app.showToast('Synchronisation en cours...', 'info');
        
        const data = await adminApiCall('/admin/products?limit=200');
        
        if (data && data.products) {
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
            
            // Update the app's product cache
            if (window.app) {
                window.app.refreshProductsCache();
            }
            
            app.showToast(`${data.products.length} produits synchronisés`, 'success');
            app.loadAdminProducts();
        } else {
            app.showToast('Aucun produit à synchroniser', 'info');
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        app.showToast('Erreur de synchronisation: ' + error.message, 'error');
    }
}

// Enhanced featured products management
PharmacieGaherApp.prototype.loadAdminFeatured = async function() {
    try {
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        let featuredProducts = localProducts.filter(p => p.enVedette);
        let allProducts = localProducts.filter(p => !p.enVedette);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-emerald-800">Gestion des Coups de Cœur</h2>
                    <div class="text-emerald-600 font-medium">
                        ${featuredProducts.length} produits en vedette
                    </div>
                </div>
                
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-emerald-700 mb-4">Produits en vedette</h3>
                    ${featuredProducts.length === 0 ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                            <i class="fas fa-star text-yellow-400 text-5xl mb-4"></i>
                            <h4 class="text-lg font-semibold text-yellow-800 mb-2">Aucun produit en vedette</h4>
                            <p class="text-yellow-700 mb-4">Les produits en vedette apparaissent en premier sur votre site</p>
                            <p class="text-yellow-600 text-sm">Sélectionnez des produits ci-dessous pour les mettre en avant</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            ${featuredProducts.map(product => `
                                <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 relative">
                                    <div class="absolute top-2 right-2">
                                        <span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">★</span>
                                    </div>
                                    <div class="flex items-center space-x-3 mb-3">
                                        <img src="${product.image || this.generatePlaceholderImage(product)}" 
                                             alt="${product.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-yellow-200">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-amber-800 text-sm">${product.nom}</h4>
                                            <p class="text-amber-600 text-xs">${product.categorie}</p>
                                            <p class="text-amber-700 text-sm font-medium">${product.prix} DA</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-amber-600">Stock: ${product.stock}</span>
                                        <button onclick="toggleFeatured('${product._id}', false)" 
                                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-all">
                                            <i class="fas fa-times mr-1"></i>Retirer
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <div class="border-t-2 border-emerald-200 pt-6">
                    <h3 class="text-lg font-semibold text-emerald-700 mb-4">Autres produits disponibles</h3>
                    ${allProducts.length === 0 ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                            <i class="fas fa-info-circle text-blue-500 text-2xl mb-2"></i>
                            <p class="text-blue-700">Tous vos produits sont déjà en vedette !</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            ${allProducts.slice(0, 12).map(product => `
                                <div class="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all">
                                    <div class="flex items-center space-x-3 mb-3">
                                        <img src="${product.image || this.generatePlaceholderImage(product)}" 
                                             alt="${product.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-gray-800 text-sm">${product.nom}</h4>
                                            <p class="text-gray-600 text-xs">${product.categorie}</p>
                                            <p class="text-gray-700 text-sm font-medium">${product.prix} DA</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-gray-600">Stock: ${product.stock}</span>
                                        <button onclick="toggleFeatured('${product._id}', true)" 
                                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs transition-all">
                                            <i class="fas fa-star mr-1"></i>Mettre en vedette
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${allProducts.length > 12 ? `
                            <div class="text-center mt-4">
                                <p class="text-gray-500 text-sm">... et ${allProducts.length - 12} autres produits</p>
                            </div>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                <p class="text-red-700">${error.message}</p>
            </div>
        `;
    }
};

// Generate placeholder image helper
PharmacieGaherApp.prototype.generatePlaceholderImage = function(product) {
    const getCategoryColor = (category) => {
        const colors = {
            'Vitalité': '10b981', 'Cheveux': 'f59e0b', 'Visage': 'ec4899',
            'Intime': 'ef4444', 'Solaire': 'f97316', 'Bébé': '06b6d4',
            'Homme': '3b82f6', 'Soins': '22c55e', 'Dentaire': '6366f1', 'Sport': 'f43f5e'
        };
        return colors[category] || '10b981';
    };
    
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const categoryColor = getCategoryColor(product.categorie);
    return `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
};

// Enhanced order management
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
        console.log('📋 Loading orders for admin...');
        
        let orders = [...adminOrders];
        
        // Try to merge with API orders
        try {
            const data = await adminApiCall('/admin/orders?limit=100');
            if (data && data.orders && data.orders.length > 0) {
                const apiOrders = data.orders.filter(apiOrder => 
                    !orders.some(localOrder => localOrder.numeroCommande === apiOrder.numeroCommande)
                );
                orders = [...orders, ...apiOrders];
            }
        } catch (error) {
            console.log('API unavailable, using only local orders');
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
                        <button onclick="app.loadAdminOrders()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
                
                ${orders.length === 0 ? `
                    <div class="text-center py-16">
                        <i class="fas fa-shopping-bag text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucune commande</h3>
                        <p class="text-emerald-600 mb-4">Les commandes apparaîtront ici une fois passées</p>
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                            <h4 class="font-semibold text-blue-800 mb-2">💡 Information</h4>
                            <p class="text-sm text-blue-700">Les commandes sont automatiquement ajoutées lors du processus de checkout sur votre site</p>
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
        console.error('Error loading orders:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement des commandes</h3>
                <p class="text-red-700 mb-4">${error.message}</p>
                <button onclick="app.loadAdminOrders()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Cleanup section
PharmacieGaherApp.prototype.loadCleanupSection = async function() {
    try {
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const duplicates = findDuplicateProducts(localProducts);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 class="text-2xl font-bold text-red-800 mb-6">Nettoyage de la base de données</h2>
                
                ${duplicates.length === 0 ? `
                    <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-green-600 text-2xl mr-4"></i>
                            <div>
                                <h3 class="text-lg font-semibold text-green-800">Base de données propre</h3>
                                <p class="text-green-600">Aucun produit problématique détecté</p>
                                <p class="text-green-500 text-sm mt-1">${localProducts.length} produits au total</p>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-4"></i>
                            <div>
                                <h3 class="text-lg font-semibold text-yellow-800">Doublons détectés</h3>
                                <p class="text-yellow-600">${duplicates.length} produits en double trouvés</p>
                            </div>
                        </div>
                    </div>
                `}
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-blue-800 mb-4">Actions de maintenance</h3>
                        <div class="space-y-3">
                            <button onclick="refreshProductCache()" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                <i class="fas fa-sync mr-2"></i>Actualiser le cache produits
                            </button>
                            <button onclick="validateAllProducts()" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                <i class="fas fa-check-double mr-2"></i>Valider tous les produits
                            </button>
                            <button onclick="syncProducts()" 
                                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                <i class="fas fa-cloud-download-alt mr-2"></i>Synchroniser avec le serveur
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-red-800 mb-4">Actions dangereuses</h3>
                        <p class="text-red-600 mb-4 text-sm">⚠️ Attention : Ces actions sont irréversibles</p>
                        <div class="space-y-3">
                            ${duplicates.length > 0 ? `
                                <button onclick="removeDuplicates()" 
                                        class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                    <i class="fas fa-clone mr-2"></i>Supprimer les doublons (${duplicates.length})
                                </button>
                            ` : ''}
                            <button onclick="clearAllProducts()" 
                                    class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                <i class="fas fa-trash-alt mr-2"></i>Supprimer TOUS les produits
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Statistiques</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div class="bg-white p-4 rounded-lg">
                            <div class="text-2xl font-bold text-emerald-600">${localProducts.length}</div>
                            <div class="text-sm text-gray-600">Produits total</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <div class="text-2xl font-bold text-green-600">${localProducts.filter(p => p.actif !== false).length}</div>
                            <div class="text-sm text-gray-600">Actifs</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <div class="text-2xl font-bold text-yellow-600">${localProducts.filter(p => p.enVedette).length}</div>
                            <div class="text-sm text-gray-600">En vedette</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <div class="text-2xl font-bold text-red-600">${duplicates.length}</div>
                            <div class="text-sm text-gray-600">Doublons</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading cleanup section:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                <p class="text-red-700">${error.message}</p>
            </div>
        `;
    }
};

// Helper functions
function findDuplicateProducts(products) {
    const seen = new Map();
    const duplicates = [];
    
    products.forEach(product => {
        const key = `${product.nom}-${product.categorie}`;
        if (seen.has(key)) {
            duplicates.push(product);
        } else {
            seen.set(key, product);
        }
    });
    
    return duplicates;
}

function removeDuplicates() {
    if (!confirm('Supprimer tous les produits en double ? Cette action est irréversible.')) {
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const seen = new Map();
    const unique = [];
    
    products.forEach(product => {
        const key = `${product.nom}-${product.categorie}`;
        if (!seen.has(key)) {
            seen.set(key, true);
            unique.push(product);
        }
    });
    
    localStorage.setItem('demoProducts', JSON.stringify(unique));
    
    if (window.app) {
        window.app.refreshProductsCache();
    }
    
    app.showToast(`${products.length - unique.length} doublons supprimés`, 'success');
    app.loadCleanupSection();
}

// Utility functions
async function refreshProductCache() {
    if (window.app) {
        window.app.refreshProductsCache();
    }
    app.showToast('Cache actualisé', 'success');
}

async function validateAllProducts() {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    let fixedCount = 0;
    
    products.forEach(product => {
        if (!product._id) {
            product._id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            fixedCount++;
        }
        if (product.actif === undefined) {
            product.actif = true;
            fixedCount++;
        }
        if (!product.dateAjout) {
            product.dateAjout = new Date().toISOString();
            fixedCount++;
        }
    });
    
    if (fixedCount > 0) {
        localStorage.setItem('demoProducts', JSON.stringify(products));
        if (window.app) {
            window.app.refreshProductsCache();
        }
        app.showToast(`${fixedCount} problèmes corrigés`, 'success');
    } else {
        app.showToast('Aucun problème trouvé', 'info');
    }
}

async function clearAllProducts() {
    if (!confirm('ATTENTION: Cette action supprimera TOUS les produits de manière définitive. Êtes-vous absolument sûr ?')) {
        return;
    }
    
    if (!confirm('Dernière confirmation: Supprimer TOUS les produits ?')) {
        return;
    }
    
    localStorage.removeItem('demoProducts');
    
    if (window.app) {
        window.app.refreshProductsCache();
    }
    
    app.showToast('Tous les produits ont été supprimés', 'warning');
    
    if (adminCurrentSection === 'products') {
        app.loadAdminProducts();
    } else if (adminCurrentSection === 'cleanup') {
        app.loadCleanupSection();
    }
}

// Order management functions
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

async function viewOrderDetails(orderId) {
    // This function will be implemented similar to the previous version
    // but with enhanced UI and API integration
}

async function updateOrderStatus(orderId, newStatus) {
    try {
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
        }
        
        // Try to update via API
        try {
            await adminApiCall(`/admin/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ statut: newStatus })
            });
        } catch (error) {
            console.log('API update failed, but local update succeeded');
        }
        
        app.showToast('Statut de la commande mis à jour', 'success');
        
        if (adminCurrentSection === 'orders') {
            app.loadAdminOrders();
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        app.showToast('Erreur lors de la mise à jour du statut', 'error');
    }
}

// Function to add order to demo (called from checkout)
window.addOrderToDemo = function(orderData) {
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
        
        console.log('✅ Order added to admin demo:', validOrder.numeroCommande);
        return validOrder;
        
    } catch (error) {
        console.error('❌ Error adding order to demo:', error);
        return null;
    }
};

// Section switching
function switchAdminSection(section) {
    // Update navigation
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
    
    // Load appropriate section
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
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('productModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeProductModal();
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
window.syncProducts = syncProducts;
window.refreshProductCache = refreshProductCache;
window.validateAllProducts = validateAllProducts;
window.clearAllProducts = clearAllProducts;
window.removeDuplicates = removeDuplicates;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.previewImage = previewImage;

console.log('✅ Enhanced Admin.js loaded with full functionality');
