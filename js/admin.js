// Fixed PharmacieGaherApp Admin functionality with proper API authentication
class PharmacieGaherApp {
    constructor() {
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.authToken = localStorage.getItem('authToken');
        console.log('Admin JS initialized with auth token:', !!this.authToken);
    }

    // Enhanced API call with proper authentication
    async apiCall(endpoint, method = 'GET', data = null, requireAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authentication token if available or required
            if (requireAuth || this.authToken) {
                headers['x-auth-token'] = this.authToken;
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const options = {
                method,
                headers
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            console.log(`📡 API Call: ${method} ${endpoint}`, { requireAuth, hasToken: !!this.authToken });

            const response = await fetch(`${this.apiUrl}${endpoint}`, options);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentication required or token expired');
                    // Don't redirect here, let the calling function handle it
                    throw new Error('Authentication required');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ API Success: ${method} ${endpoint}`);
            return result;

        } catch (error) {
            console.error(`❌ API Error: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    // Load admin dashboard with proper authentication
    async loadAdminDashboard() {
        try {
            console.log('📊 Loading admin dashboard...');
            
            // Check if user is admin
            if (!this.currentUser || this.currentUser.role !== 'admin') {
                console.log('❌ Not authorized for admin dashboard');
                this.showLogin();
                return;
            }

            let dashboardStats = {
                totalProducts: 0,
                activeProducts: 0,
                featuredProducts: 0,
                totalOrders: 0,
                pendingOrders: 0,
                monthlyRevenue: 0
            };

            // Try to get stats from API first
            try {
                const apiStats = await this.apiCall('/api/admin/dashboard', 'GET', null, true);
                dashboardStats = { ...dashboardStats, ...apiStats };
                console.log('📊 Dashboard stats loaded from API');
            } catch (error) {
                console.log('📊 API unavailable, calculating local stats');
                
                // Calculate from localStorage as fallback
                const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
                const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                
                dashboardStats.totalProducts = localProducts.length;
                dashboardStats.activeProducts = localProducts.filter(p => p.actif !== false).length;
                dashboardStats.featuredProducts = localProducts.filter(p => p.enVedette).length;
                dashboardStats.totalOrders = localOrders.length;
                dashboardStats.pendingOrders = localOrders.filter(o => o.statut === 'en-attente').length;
                dashboardStats.monthlyRevenue = localOrders
                    .filter(o => o.statut !== 'annulee')
                    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            }

            // Update dashboard UI
            document.getElementById('admin-content').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-emerald-600 text-sm font-medium">Total Produits</p>
                                <p class="text-3xl font-bold text-gray-800">${dashboardStats.totalProducts}</p>
                            </div>
                            <div class="bg-emerald-100 p-3 rounded-lg">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-600 text-sm font-medium">Commandes</p>
                                <p class="text-3xl font-bold text-gray-800">${dashboardStats.totalOrders}</p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-lg">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-600 text-sm font-medium">Chiffre d'Affaires</p>
                                <p class="text-3xl font-bold text-gray-800">${dashboardStats.monthlyRevenue.toFixed(2)}€</p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-lg">
                                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Commandes Récentes</h3>
                        <div id="recent-orders" class="space-y-3">
                            <div class="text-gray-500 text-center py-4">Chargement...</div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
                        <div class="space-y-3">
                            <button onclick="app.switchAdminSection('products')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Gérer les Produits
                            </button>
                            <button onclick="app.switchAdminSection('orders')" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Voir les Commandes
                            </button>
                            <button onclick="app.switchAdminSection('featured')" class="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Produits Vedette
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Load recent orders for dashboard
            this.loadRecentOrders();
            
            console.log('✅ Admin dashboard loaded successfully');

        } catch (error) {
            console.error('❌ Error loading admin dashboard:', error);
            document.getElementById('admin-content').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-600">Erreur lors du chargement du tableau de bord: ${error.message}</p>
                    <button onclick="location.reload()" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Recharger
                    </button>
                </div>
            `;
        }
    }

    // Load recent orders for dashboard
    async loadRecentOrders() {
        try {
            let orders = [];
            
            // Try API first
            try {
                const response = await this.apiCall('/api/orders?limit=5&sortBy=dateCommande&sortOrder=desc', 'GET', null, true);
                orders = response.orders || response;
            } catch (error) {
                console.log('Using local orders for recent orders');
                orders = JSON.parse(localStorage.getItem('orders') || '[]')
                    .sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande))
                    .slice(0, 5);
            }

            const recentOrdersContainer = document.getElementById('recent-orders');
            
            if (orders.length === 0) {
                recentOrdersContainer.innerHTML = `
                    <div class="text-gray-500 text-center py-4">Aucune commande récente</div>
                `;
                return;
            }

            recentOrdersContainer.innerHTML = orders.map(order => `
                <div class="border border-gray-100 rounded-lg p-3">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-medium text-gray-800">#${order.numeroCommande}</p>
                            <p class="text-sm text-gray-600">${order.client?.prenom} ${order.client?.nom}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-medium text-gray-800">${parseFloat(order.total).toFixed(2)}€</p>
                            <span class="inline-block px-2 py-1 text-xs rounded-full ${
                                order.statut === 'en-attente' ? 'bg-yellow-100 text-yellow-600' :
                                order.statut === 'confirmee' ? 'bg-blue-100 text-blue-600' :
                                order.statut === 'expediee' ? 'bg-purple-100 text-purple-600' :
                                order.statut === 'livree' ? 'bg-green-100 text-green-600' :
                                'bg-gray-100 text-gray-600'
                            }">
                                ${order.statut}
                            </span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500">
                        ${new Date(order.dateCommande).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading recent orders:', error);
            document.getElementById('recent-orders').innerHTML = `
                <div class="text-red-500 text-center py-4">Erreur de chargement</div>
            `;
        }
    }

    // Save product with API authentication
    async saveProduct() {
        try {
            const formData = {
                nom: document.getElementById('product-nom').value.trim(),
                description: document.getElementById('product-description').value.trim(),
                prix: parseFloat(document.getElementById('product-prix').value) || 0,
                prixOriginal: parseFloat(document.getElementById('product-prix-original').value) || null,
                categorie: document.getElementById('product-categorie').value.trim(),
                marque: document.getElementById('product-marque').value.trim(),
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                images: [document.getElementById('product-image').value.trim()].filter(img => img),
                enPromotion: document.getElementById('product-en-promotion').checked,
                enVedette: document.getElementById('product-en-vedette').checked,
                actif: document.getElementById('product-actif')?.checked !== false
            };

            // Validation
            if (!formData.nom || !formData.description || !formData.prix || !formData.categorie) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            if (formData.prix <= 0) {
                alert('Le prix doit être supérieur à 0');
                return;
            }

            console.log('Product data to save:', formData);

            // Generate ID for new products
            if (!this.currentEditingProduct) {
                formData._id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            } else {
                formData._id = this.currentEditingProduct._id;
            }

            // Save to localStorage first (always works)
            let products = JSON.parse(localStorage.getItem('products') || '[]');
            
            if (this.currentEditingProduct) {
                const index = products.findIndex(p => p._id === this.currentEditingProduct._id);
                if (index !== -1) {
                    products[index] = { ...products[index], ...formData };
                } else {
                    products.push(formData);
                }
            } else {
                products.push(formData);
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Product saved to localStorage');

            // Refresh app products cache
            if (window.app && typeof window.app.loadProducts === 'function') {
                console.log('Refreshing products cache...');
                await window.app.loadProducts();
            }

            // Try to save to API
            try {
                if (!this.authToken) {
                    throw new Error('No auth token available');
                }

                const endpoint = this.currentEditingProduct 
                    ? `/api/products/${this.currentEditingProduct._id}` 
                    : '/api/products';
                const method = this.currentEditingProduct ? 'PUT' : 'POST';

                await this.apiCall(endpoint, method, formData, true);
                console.log('✅ Product saved to API successfully');
                
            } catch (apiError) {
                console.log('API save failed but product saved locally', apiError.message);
                // Don't show error to user since local save worked
            }

            // Close modal and refresh products
            this.closeProductModal();
            this.loadAdminProducts();
            
            const message = this.currentEditingProduct ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!';
            this.showMessage(message, 'success');

        } catch (error) {
            console.error('❌ Error saving product:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    // Load admin orders with proper authentication
    async loadAdminOrders() {
        try {
            console.log('📋 Loading orders from admin panel...');
            
            // Load from localStorage first
            let orders = JSON.parse(localStorage.getItem('orders') || '[]');
            console.log('Local orders loaded:', orders.length);

            // Try to get orders from API
            try {
                const response = await this.apiCall('/api/orders', 'GET', null, true);
                const apiOrders = response.orders || response;
                if (Array.isArray(apiOrders) && apiOrders.length > 0) {
                    orders = apiOrders;
                    console.log('✅ Orders loaded from API:', orders.length);
                    // Update localStorage with API data
                    localStorage.setItem('orders', JSON.stringify(orders));
                }
            } catch (error) {
                console.log('📋 API unavailable, using only local orders');
            }

            console.log('Total orders to display:', orders.length);

            const ordersContainer = document.getElementById('admin-content');
            
            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div class="mb-4">
                            <svg class="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Aucune commande</h3>
                        <p class="text-gray-600">Les commandes apparaîtront ici une fois créées.</p>
                    </div>
                `;
                return;
            }

            // Sort orders by date (newest first)
            orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));

            ordersContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <h2 class="text-xl font-semibold text-gray-800">Gestion des Commandes</h2>
                        <p class="text-gray-600 mt-1">Total: ${orders.length} commande(s)</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="text-left p-4 font-medium text-gray-700">N° Commande</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Client</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Date</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Total</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Statut</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map((order, index) => {
                                    const client = order.client || {};
                                    const orderDate = new Date(order.dateCommande);
                                    
                                    return `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td class="p-4">
                                                <span class="font-medium text-gray-800">#${order.numeroCommande}</span>
                                            </td>
                                            <td class="p-4">
                                                <div>
                                                    <p class="font-medium text-gray-800">${client.prenom || 'N/A'} ${client.nom || 'N/A'}</p>
                                                    <p class="text-sm text-gray-600">${client.email || 'N/A'}</p>
                                                    <p class="text-sm text-gray-600">${client.adresse || 'Adresse non disponible'}</p>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <div class="text-sm">
                                                    <p class="text-gray-800">${orderDate.toLocaleDateString('fr-FR')}</p>
                                                    <p class="text-gray-600">${orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <span class="font-medium text-gray-800">${parseFloat(order.total || 0).toFixed(2)}€</span>
                                            </td>
                                            <td class="p-4">
                                                <select onchange="app.updateOrderStatus('${order._id || order.numeroCommande}', this.value)" 
                                                        class="px-2 py-1 text-sm rounded-full border ${
                                                    order.statut === 'en-attente' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                                    order.statut === 'confirmee' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                    order.statut === 'en-preparation' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                    order.statut === 'expediee' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                                                    order.statut === 'livree' ? 'bg-green-100 text-green-600 border-green-200' :
                                                    order.statut === 'annulee' ? 'bg-red-100 text-red-600 border-red-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }">
                                                    <option value="en-attente" ${order.statut === 'en-attente' ? 'selected' : ''}>En attente</option>
                                                    <option value="confirmee" ${order.statut === 'confirmee' ? 'selected' : ''}>Confirmée</option>
                                                    <option value="en-preparation" ${order.statut === 'en-preparation' ? 'selected' : ''}>En préparation</option>
                                                    <option value="expediee" ${order.statut === 'expediee' ? 'selected' : ''}>Expédiée</option>
                                                    <option value="livree" ${order.statut === 'livree' ? 'selected' : ''}>Livrée</option>
                                                    <option value="annulee" ${order.statut === 'annulee' ? 'selected' : ''}>Annulée</option>
                                                </select>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex space-x-2">
                                                    <button onclick="app.viewOrderDetails('${order._id || order.numeroCommande}')" 
                                                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                                        Détails
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading admin orders:', error);
            document.getElementById('admin-content').innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-600">Erreur lors du chargement des commandes: ${error.message}</p>
                    <button onclick="app.loadAdminOrders()" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }

    // Update order status with API call
    async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`📋 Updating order ${orderId} to status: ${newStatus}`);
            
            // Update in localStorage first
            let orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const orderIndex = orders.findIndex(o => (o._id || o.numeroCommande) === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].statut = newStatus;
                orders[orderIndex].dateMiseAJour = new Date().toISOString();
                localStorage.setItem('orders', JSON.stringify(orders));
            }

            // Try to update via API
            try {
                await this.apiCall(`/api/orders/${orderId}/status`, 'PUT', { statut: newStatus }, true);
                console.log('✅ Order status updated in API');
            } catch (apiError) {
                console.log('❌ API update failed, but local update completed');
            }

            this.showMessage('Statut de commande mis à jour', 'success');

        } catch (error) {
            console.error('❌ Error updating order status:', error);
            this.showMessage('Erreur lors de la mise à jour', 'error');
        }
    }

    // Show success/error messages
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Switch admin sections
    switchAdminSection(section) {
        console.log('🔄 Switching admin section to:', section);
        
        // Update navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('bg-emerald-100', 'text-emerald-700');
            item.classList.add('text-gray-600', 'hover:bg-gray-50');
        });
        
        const currentNav = document.querySelector(`[onclick*="${section}"]`);
        if (currentNav) {
            currentNav.classList.remove('text-gray-600', 'hover:bg-gray-50');
            currentNav.classList.add('bg-emerald-100', 'text-emerald-700');
        }

        // Load section content
        switch (section) {
            case 'dashboard':
                this.loadAdminDashboard();
                break;
            case 'products':
                this.loadAdminProducts();
                break;
            case 'orders':
                this.loadAdminOrders();
                break;
            case 'featured':
                this.loadFeaturedProducts();
                break;
            case 'cleanup':
                this.loadCleanupSection();
                break;
            default:
                console.log('Unknown admin section:', section);
        }
    }

    // Load admin products section
    async loadAdminProducts() {
        try {
            console.log('📦 Loading admin products section...');
            
            // Load products from localStorage and API
            let products = JSON.parse(localStorage.getItem('products') || '[]');
            
            // Try to get from API
            try {
                const response = await this.apiCall('/api/products?limit=100', 'GET');
                const apiProducts = response.products || response;
                if (Array.isArray(apiProducts)) {
                    products = apiProducts;
                    localStorage.setItem('products', JSON.stringify(products));
                }
            } catch (error) {
                console.log('Using localStorage products');
            }

            document.getElementById('admin-content').innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-semibold text-gray-800">Gestion des Produits</h2>
                            <p class="text-gray-600 mt-1">Total: ${products.length} produit(s)</p>
                        </div>
                        <button onclick="app.openAddProductModal()" 
                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                            Ajouter un Produit
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="text-left p-4 font-medium text-gray-700">Image</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Nom</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Prix</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Stock</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Statut</th>
                                    <th class="text-left p-4 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => {
                                    const imageUrl = (product.images && product.images[0]) || 'https://via.placeholder.com/60x60?text=Produit';
                                    return `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td class="p-4">
                                                <img src="${imageUrl}" alt="${product.nom}" class="w-12 h-12 object-cover rounded-lg">
                                            </td>
                                            <td class="p-4">
                                                <div>
                                                    <p class="font-medium text-gray-800">${product.nom}</p>
                                                    <p class="text-sm text-gray-600">${product.categorie}</p>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <span class="font-medium text-gray-800">${parseFloat(product.prix).toFixed(2)}€</span>
                                            </td>
                                            <td class="p-4">
                                                <span class="text-gray-800">${product.stock || 0}</span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex flex-col space-y-1">
                                                    <span class="inline-block px-2 py-1 text-xs rounded-full ${
                                                        product.actif !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }">
                                                        ${product.actif !== false ? 'Actif' : 'Inactif'}
                                                    </span>
                                                    ${product.enVedette ? '<span class="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Vedette</span>' : ''}
                                                    ${product.enPromotion ? '<span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Promo</span>' : ''}
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex space-x-2">
                                                    <button onclick="app.openEditProductModal('${product._id}')" 
                                                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                                        Modifier
                                                    </button>
                                                    <button onclick="app.deleteProduct('${product._id}')" 
                                                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading admin products:', error);
        }
    }

    // Open add product modal
    openAddProductModal() {
        this.currentEditingProduct = null;
        this.showProductModal();
    }

    // Open edit product modal
    openEditProductModal(productId) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        this.currentEditingProduct = products.find(p => p._id === productId);
        this.showProductModal();
    }

    // Show product modal
    showProductModal() {
        const isEdit = !!this.currentEditingProduct;
        const product = this.currentEditingProduct || {};

        const modalHTML = `
            <div id="product-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-gray-800">
                                ${isEdit ? 'Modifier le Produit' : 'Ajouter un Produit'}
                            </h3>
                            <button onclick="app.closeProductModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                                <input type="text" id="product-nom" value="${product.nom || ''}" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prix (€) *</label>
                                <input type="number" id="product-prix" value="${product.prix || ''}" step="0.01" min="0"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prix original (€)</label>
                                <input type="number" id="product-prix-original" value="${product.prixOriginal || ''}" step="0.01" min="0"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                                <input type="text" id="product-categorie" value="${product.categorie || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                                <input type="text" id="product-marque" value="${product.marque || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                <input type="number" id="product-stock" value="${product.stock || 0}" min="0"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea id="product-description" rows="4" 
                                      class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">${product.description || ''}</textarea>
                        </div>
                        
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de l'image</label>
                            <input type="url" id="product-image" value="${product.images?.[0] || ''}"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>
                        
                        <div class="mt-6 grid grid-cols-2 gap-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="product-en-promotion" ${product.enPromotion ? 'checked' : ''}
                                       class="mr-2 text-emerald-500 focus:ring-emerald-500">
                                <span class="text-sm font-medium text-gray-700">En promotion</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="product-en-vedette" ${product.enVedette ? 'checked' : ''}
                                       class="mr-2 text-emerald-500 focus:ring-emerald-500">
                                <span class="text-sm font-medium text-gray-700">En vedette</span>
                            </label>
                        </div>
                        
                        ${isEdit ? `
                            <div class="mt-6">
                                <label class="flex items-center">
                                    <input type="checkbox" id="product-actif" ${product.actif !== false ? 'checked' : ''}
                                           class="mr-2 text-emerald-500 focus:ring-emerald-500">
                                    <span class="text-sm font-medium text-gray-700">Actif</span>
                                </label>
                            </div>
                        ` : ''}
                    </div>
                    <div class="p-6 border-t border-gray-100 flex justify-end space-x-3">
                        <button onclick="app.closeProductModal()" 
                                class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                            Annuler
                        </button>
                        <button onclick="app.saveProduct()" 
                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors">
                            ${isEdit ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Close product modal
    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.remove();
        }
        this.currentEditingProduct = null;
    }

    // Delete product
    async deleteProduct(productId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            return;
        }

        try {
            // Remove from localStorage
            let products = JSON.parse(localStorage.getItem('products') || '[]');
            products = products.filter(p => p._id !== productId);
            localStorage.setItem('products', JSON.stringify(products));

            // Try to delete from API
            try {
                await this.apiCall(`/api/products/${productId}`, 'DELETE', null, true);
                console.log('✅ Product deleted from API');
            } catch (apiError) {
                console.log('❌ API deletion failed but local deletion completed');
            }

            this.loadAdminProducts();
            this.showMessage('Produit supprimé avec succès', 'success');

        } catch (error) {
            console.error('❌ Error deleting product:', error);
            this.showMessage('Erreur lors de la suppression', 'error');
        }
    }

    // Load featured products management
    loadFeaturedProducts() {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const featuredProducts = products.filter(p => p.enVedette);

        document.getElementById('admin-content').innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="p-6 border-b border-gray-100">
                    <h2 class="text-xl font-semibold text-gray-800">Produits en Vedette</h2>
                    <p class="text-gray-600 mt-1">Gérez les produits mis en avant sur votre site</p>
                </div>
                <div class="p-6">
                    ${featuredProducts.length === 0 ? `
                        <div class="text-center py-8">
                            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                            <h3 class="text-lg font-medium text-gray-800 mb-2">Aucun produit en vedette</h3>
                            <p class="text-gray-600">Marquez des produits comme "vedette" pour les afficher ici.</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${featuredProducts.map(product => {
                                const imageUrl = (product.images && product.images[0]) || 'https://via.placeholder.com/200x200?text=Produit';
                                return `
                                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                                        <img src="${imageUrl}" alt="${product.nom}" class="w-full h-48 object-cover">
                                        <div class="p-4">
                                            <h3 class="font-semibold text-gray-800 mb-2">${product.nom}</h3>
                                            <p class="text-sm text-gray-600 mb-2">${product.categorie}</p>
                                            <p class="text-lg font-bold text-emerald-600">${parseFloat(product.prix).toFixed(2)}€</p>
                                            <div class="mt-4 flex justify-between">
                                                <button onclick="app.openEditProductModal('${product._id}')" 
                                                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                                    Modifier
                                                </button>
                                                <button onclick="app.toggleFeatured('${product._id}')" 
                                                        class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // Toggle featured status
    toggleFeatured(productId) {
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex !== -1) {
            products[productIndex].enVedette = !products[productIndex].enVedette;
            localStorage.setItem('products', JSON.stringify(products));
            this.loadFeaturedProducts();
            
            const status = products[productIndex].enVedette ? 'ajouté aux' : 'retiré des';
            this.showMessage(`Produit ${status} produits vedette`, 'success');
        }
    }

    // Load cleanup section
    loadCleanupSection() {
        document.getElementById('admin-content').innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="p-6 border-b border-gray-100">
                    <h2 class="text-xl font-semibold text-gray-800">Nettoyage et Maintenance</h2>
                    <p class="text-gray-600 mt-1">Outils de maintenance pour votre boutique</p>
                </div>
                <div class="p-6 space-y-6">
                    <div class="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <h3 class="font-semibold text-yellow-800 mb-2">Nettoyer les données locales</h3>
                        <p class="text-yellow-700 text-sm mb-4">Supprime toutes les données stockées localement (produits, commandes, cache).</p>
                        <button onclick="app.clearLocalData()" 
                                class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">
                            Nettoyer les données
                        </button>
                    </div>
                    
                    <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <h3 class="font-semibold text-blue-800 mb-2">Synchroniser avec l'API</h3>
                        <p class="text-blue-700 text-sm mb-4">Tente de synchroniser toutes les données locales avec l'API.</p>
                        <button onclick="app.syncWithAPI()" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                            Synchroniser
                        </button>
                    </div>
                    
                    <div class="border border-green-200 bg-green-50 rounded-lg p-4">
                        <h3 class="font-semibold text-green-800 mb-2">Vérifier l'état de l'API</h3>
                        <p class="text-green-700 text-sm mb-4">Teste la connectivité avec l'API backend.</p>
                        <button onclick="app.testAPIConnection()" 
                                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                            Tester la connexion
                        </button>
                        <div id="api-status" class="mt-4"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Clear local data
    clearLocalData() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données locales ? Cette action est irréversible.')) {
            return;
        }

        localStorage.removeItem('products');
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        
        this.showMessage('Données locales supprimées avec succès', 'success');
        setTimeout(() => location.reload(), 1000);
    }

    // Test API connection
    async testAPIConnection() {
        const statusDiv = document.getElementById('api-status');
        statusDiv.innerHTML = '<div class="text-blue-600">Test en cours...</div>';

        try {
            const response = await fetch(`${this.apiUrl}/api/products?limit=1`);
            const data = await response.json();

            statusDiv.innerHTML = `
                <div class="text-green-600 font-medium">✅ API connectée</div>
                <div class="text-sm text-gray-600 mt-1">
                    Statut: ${response.status}<br>
                    URL: ${this.apiUrl}
                </div>
            `;

        } catch (error) {
            statusDiv.innerHTML = `
                <div class="text-red-600 font-medium">❌ API inaccessible</div>
                <div class="text-sm text-gray-600 mt-1">
                    Erreur: ${error.message}<br>
                    URL: ${this.apiUrl}
                </div>
            `;
        }
    }

    // View order details
    viewOrderDetails(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => (o._id || o.numeroCommande) === orderId);
        
        if (!order) {
            alert('Commande non trouvée');
            return;
        }

        const client = order.client || {};
        const articles = order.articles || [];

        const modalHTML = `
            <div id="order-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-gray-800">
                                Détails de la commande #${order.numeroCommande}
                            </h3>
                            <button onclick="document.getElementById('order-details-modal').remove()" 
                                    class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold text-gray-800 mb-3">Informations Client</h4>
                                <div class="space-y-2 text-sm">
                                    <p><strong>Nom:</strong> ${client.prenom} ${client.nom}</p>
                                    <p><strong>Email:</strong> ${client.email}</p>
                                    <p><strong>Téléphone:</strong> ${client.telephone}</p>
                                    <p><strong>Adresse:</strong> ${client.adresse}</p>
                                    <p><strong>Wilaya:</strong> ${client.wilaya}</p>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800 mb-3">Informations Commande</h4>
                                <div class="space-y-2 text-sm">
                                    <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleString('fr-FR')}</p>
                                    <p><strong>Statut:</strong> 
                                        <span class="px-2 py-1 text-xs rounded-full ${
                                            order.statut === 'en-attente' ? 'bg-yellow-100 text-yellow-600' :
                                            order.statut === 'confirmee' ? 'bg-blue-100 text-blue-600' :
                                            order.statut === 'expediee' ? 'bg-purple-100 text-purple-600' :
                                            order.statut === 'livree' ? 'bg-green-100 text-green-600' :
                                            'bg-gray-100 text-gray-600'
                                        }">
                                            ${order.statut}
                                        </span>
                                    </p>
                                    <p><strong>Mode de paiement:</strong> ${order.modePaiement || 'Paiement à la livraison'}</p>
                                    ${order.commentaires ? `<p><strong>Commentaires:</strong> ${order.commentaires}</p>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <h4 class="font-semibold text-gray-800 mb-3">Articles commandés</h4>
                            <div class="overflow-x-auto">
                                <table class="w-full border border-gray-200 rounded-lg">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="text-left p-3 font-medium text-gray-700">Produit</th>
                                            <th class="text-left p-3 font-medium text-gray-700">Prix unitaire</th>
                                            <th class="text-left p-3 font-medium text-gray-700">Quantité</th>
                                            <th class="text-left p-3 font-medium text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${articles.map(article => `
                                            <tr class="border-t border-gray-100">
                                                <td class="p-3">${article.nom}</td>
                                                <td class="p-3">${parseFloat(article.prix).toFixed(2)}€</td>
                                                <td class="p-3">${article.quantite}</td>
                                                <td class="p-3">${(parseFloat(article.prix) * parseInt(article.quantite)).toFixed(2)}€</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="mt-6 border-t pt-4">
                            <div class="flex justify-end">
                                <div class="text-right space-y-1">
                                    <p><strong>Sous-total:</strong> ${parseFloat(order.sousTotal || 0).toFixed(2)}€</p>
                                    <p><strong>Frais de livraison:</strong> ${parseFloat(order.fraisLivraison || 0).toFixed(2)}€</p>
                                    <p class="text-lg font-bold text-emerald-600">
                                        <strong>Total:</strong> ${parseFloat(order.total || 0).toFixed(2)}€
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Make sure the class is available globally
if (typeof window !== 'undefined') {
    window.PharmacieGaherApp = PharmacieGaherApp;
}
