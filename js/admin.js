// ========================================
// COMPLETE ADMIN PANEL - PRODUCTION READY
// ========================================
// Features:
// - Full CRUD for Products (Create, Read, Update, Delete)
// - Order Management (View, Delete)
// - Featured Products
// - API-First approach (all changes saved to database)
// - Works for all users across the site
// ========================================

let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = [];

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://parapharmacie-gaher.onrender.com/api';

// Build API URL
function buildApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// API Call Helper with Authentication
async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Add authentication token
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
    
    console.log(`API: ${options.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ 
                message: `HTTP ${response.status}` 
            }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========================================
// PRODUCT MANAGEMENT
// ========================================

// Load Admin Products Page
PharmacieGaherApp.prototype.loadAdminProducts = async function() {
    try {
        let products = [];
        
        // Load from Admin API
        try {
            const data = await apiCall('/admin/products?limit=1000');
            products = data.products || [];
            console.log(`Loaded ${products.length} products from API`);
            
            // Sync to localStorage for offline use
            localStorage.setItem('demoProducts', JSON.stringify(products));
        } catch (error) {
            console.log('API unavailable, using localStorage');
            products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        }
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-emerald-800">Gestion des produits</h2>
                        <p class="text-emerald-600">${products.length} produits au total</p>
                    </div>
                    <button onclick="openAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                        <i class="fas fa-plus mr-2"></i>Nouveau produit
                    </button>
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
                <p class="text-red-800">Erreur: ${error.message}</p>
                <button onclick="app.loadAdminProducts()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Render Product Row
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

// Open Add Product Modal
function openAddProductModal() {
    currentEditingProduct = null;
    showProductModal('Ajouter un nouveau produit', 'Ajouter le produit');
}

// Open Edit Product Modal
async function openEditProductModal(productId) {
    try {
        let product = null;
        
        // Try to get from API
        try {
            const data = await apiCall('/admin/products?limit=1000');
            if (data && data.products) {
                product = data.products.find(p => p._id === productId);
            }
        } catch (error) {
            const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            product = localProducts.find(p => p._id === productId);
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

// Show Product Modal
function showProductModal(title, submitText) {
    const modalHTML = `
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
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                                <input type="text" id="productNom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                                <input type="text" id="productMarque" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                            <textarea id="productDescription" required rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 resize-none"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div id="imagePreviewContainer" class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 h-48 flex items-center justify-center">
                                        <div id="imagePreviewPlaceholder">
                                            <i class="fas fa-image text-gray-400 text-4xl mb-2"></i>
                                            <p class="text-gray-500">Aperçu de l'image</p>
                                        </div>
                                        <img id="imagePreview" src="" alt="Aperçu" class="max-h-40 max-w-full hidden">
                                    </div>
                                </div>
                                <div class="flex flex-col justify-center">
                                    <label for="productImageUpload" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl text-center cursor-pointer flex items-center justify-center mb-4">
                                        <i class="fas fa-upload mr-2"></i>Télécharger une image
                                        <input type="file" id="productImageUpload" accept="image/*" class="hidden" onchange="previewImage(this)">
                                    </label>
                                    <p class="text-sm text-gray-500">Formats: JPG, PNG, GIF (Max: 2MB)</p>
                                    <input type="hidden" id="productImageUrl">
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                                <input type="number" id="productPrix" required min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" id="productPrixOriginal" min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                                <input type="number" id="productStock" required min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                                <select id="productCategorie" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400">
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
                        
                        <div class="flex flex-wrap gap-6">
                            <label class="flex items-center">
                                <input type="checkbox" id="productEnVedette" class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">En vedette</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="productEnPromotion" class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">En promotion</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="productActif" checked class="rounded text-emerald-600 mr-2 w-5 h-5">
                                <span class="text-sm font-medium text-gray-700">Produit actif</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button type="button" onclick="closeProductModal()" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                Annuler
                            </button>
                            <button type="button" onclick="saveProduct()" id="productSubmitBtn" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                                <span id="productSubmitText">${submitText}</span>
                                <i id="productSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Fill Product Form
function fillProductForm(product) {
    document.getElementById('productId').value = product._id || '';
    document.getElementById('productNom').value = product.nom || '';
    document.getElementById('productMarque').value = product.marque || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrix').value = product.prix || '';
    document.getElementById('productPrixOriginal').value = product.prixOriginal || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategorie').value = product.categorie || '';
    document.getElementById('productEnVedette').checked = product.enVedette || false;
    document.getElementById('productEnPromotion').checked = product.enPromotion || false;
    document.getElementById('productActif').checked = product.actif !== false;
    
    if (product.image) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const imageUrl = document.getElementById('productImageUrl');
        
        preview.src = product.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        imageUrl.value = product.image;
    }
}

// Close Product Modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
    currentEditingProduct = null;
}

// Preview Image Upload
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    const imageUrl = document.getElementById('productImageUrl');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 2 * 1024 * 1024) {
            app.showToast('Image trop volumineuse. Maximum 2MB.', 'error');
            input.value = '';
            return;
        }
        
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
            imageUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Save Product (Create or Update)
async function saveProduct() {
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
    
    button.disabled = true;
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const productData = {
            nom: nom,
            description: description,
            marque: document.getElementById('productMarque').value.trim(),
            prix: parseInt(prix),
            stock: parseInt(stock),
            categorie: categorie,
            actif: document.getElementById('productActif').checked,
            enVedette: document.getElementById('productEnVedette').checked,
            enPromotion: document.getElementById('productEnPromotion').checked
        };
        
        const prixOriginal = document.getElementById('productPrixOriginal').value;
        if (prixOriginal) {
            productData.prixOriginal = parseInt(prixOriginal);
            if (productData.enPromotion && productData.prixOriginal > productData.prix) {
                productData.pourcentagePromotion = Math.round(
                    (productData.prixOriginal - productData.prix) / productData.prixOriginal * 100
                );
            }
        }
        
        const imageUrl = document.getElementById('productImageUrl').value;
        if (imageUrl) {
            productData.image = imageUrl;
        }
        
        // SAVE TO API
        const productId = document.getElementById('productId').value;
        const endpoint = isEditing ? `/admin/products/${productId}` : '/admin/products';
        const method = isEditing ? 'PUT' : 'POST';
        
        await apiCall(endpoint, {
            method: method,
            body: JSON.stringify(productData)
        });
        
        console.log('✅ Product saved to database');
        
        // Refresh products from API
        const data = await apiCall('/products?limit=1000');
        if (data && data.products) {
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
        }
        
        // Refresh app cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        app.showToast(
            isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 
            'success'
        );
        
        closeProductModal();
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        app.showToast(`Erreur: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        // DELETE FROM API
        await apiCall(`/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ Product deleted from database');
        
        // Refresh products from API
        const data = await apiCall('/products?limit=1000');
        if (data && data.products) {
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
        }
        
        // Refresh app cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        app.showToast('Produit supprimé avec succès', 'success');
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        app.showToast(`Erreur: ${error.message}`, 'error');
    }
}

// Toggle Featured Status
async function toggleFeatured(productId, newStatus) {
    try {
        // UPDATE API
        await apiCall(`/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ enVedette: newStatus })
        });
        
        console.log('✅ Featured status updated in database');
        
        // Refresh products from API
        const data = await apiCall('/products?limit=1000');
        if (data && data.products) {
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
        }
        
        // Refresh app cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        app.showToast(
            `Produit ${newStatus ? 'ajouté aux' : 'retiré des'} coups de coeur`, 
            'success'
        );
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('Error toggling featured:', error);
        app.showToast(`Erreur: ${error.message}`, 'error');
    }
}

// ========================================
// ORDER MANAGEMENT
// ========================================

// Load Admin Orders Page
PharmacieGaherApp.prototype.loadAdminOrders = async function() {
    try {
        let orders = [];
        
        // Load from Admin API
        try {
            const data = await apiCall('/admin/orders?limit=1000');
            orders = data.orders || [];
            console.log(`Loaded ${orders.length} orders from API`);
            
            // Sync to localStorage
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            adminOrders = orders;
        } catch (error) {
            console.log('API unavailable, using localStorage');
            orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        }
        
        // Sort by date, newest first
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
                        <p class="text-emerald-600">Les commandes apparaîtront ici une fois passées par les clients</p>
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
                                            <div class="text-xs text-gray-500">${order.client?.telephone}</div>
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
                <button onclick="app.loadAdminOrders()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Delete Order
async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }
    
    try {
        // Try admin endpoint first, then fallback to regular orders endpoint
        try {
            await apiCall(`/admin/orders/${orderId}`, { method: 'DELETE' });
        } catch (error) {
            // Fallback to regular orders endpoint
            await apiCall(`/orders/${orderId}`, { method: 'DELETE' });
        }
        
        console.log('✅ Order deleted from database');
        
        // Refresh orders from API
        try {
            const data = await apiCall('/admin/orders?limit=1000');
            if (data && data.orders) {
                localStorage.setItem('adminOrders', JSON.stringify(data.orders));
                adminOrders = data.orders;
            }
        } catch (error) {
            // Delete from localStorage manually
            let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            orders = orders.filter(o => o._id !== orderId && o.numeroCommande !== orderId);
            localStorage.setItem('adminOrders', JSON.stringify(orders));
            adminOrders = orders;
        }
        
        app.showToast('Commande supprimée avec succès', 'success');
        app.loadAdminOrders();
        
    } catch (error) {
        console.error('Error deleting order:', error);
        app.showToast(`Erreur: ${error.message}`, 'error');
    }
}

// View Order Details
async function viewOrderDetails(orderId) {
    try {
        let order = null;
        
        // Try to get from API
        try {
            order = await apiCall(`/orders/${orderId}`);
        } catch (error) {
            const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            order = orders.find(o => o._id === orderId || o.numeroCommande === orderId);
        }
        
        if (!order) {
            app.showToast('Commande non trouvée', 'error');
            return;
        }
        
        document.body.insertAdjacentHTML('beforeend', `
            <div id="orderDetailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div class="flex justify-between items-center p-6 border-b">
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
                                    <p><strong>Date:</strong> ${new Date(order.dateCommande).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Heure:</strong> ${new Date(order.dateCommande).toLocaleTimeString('fr-FR')}</p>
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
                                    <div class="flex items-center space-x-4 p-4 bg-emerald-50 rounded-xl">
                                        <div class="flex-1">
                                            <h5 class="font-medium text-emerald-800">${article.nom}</h5>
                                            <p class="text-sm text-gray-600">Quantité: ${article.quantite} × ${article.prix} DA</p>
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
                    
                    <div class="flex justify-end p-6 border-t">
                        <button onclick="closeOrderDetailModal()" class="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error viewing order:', error);
        app.showToast('Erreur lors de l\'affichage', 'error');
    }
}

// Close Order Detail Modal
function closeOrderDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// ========================================
// FEATURED PRODUCTS MANAGEMENT
// ========================================

PharmacieGaherApp.prototype.loadAdminFeatured = async function() {
    try {
        let products = [];
        
        try {
            const data = await apiCall('/products?limit=1000');
            products = data.products || [];
        } catch (error) {
            products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        }
        
        const featuredProducts = products.filter(p => p.enVedette);
        const allProducts = products.filter(p => !p.enVedette);
        
        document.getElementById('adminContent').innerHTML = `
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Gestion des Coups de Coeur</h2>
                
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-emerald-700 mb-4">Produits en vedette (${featuredProducts.length})</h3>
                    ${featuredProducts.length === 0 ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                            <i class="fas fa-star text-yellow-400 text-4xl mb-4"></i>
                            <p class="text-yellow-700">Aucun produit en vedette</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${featuredProducts.map(product => `
                                <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                                    <div class="flex items-center space-x-3">
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
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-gray-800">${product.nom}</h4>
                                            <p class="text-gray-600 text-sm">${product.categorie} - ${product.prix} DA</p>
                                        </div>
                                    </div>
                                    <div class="mt-2 flex justify-end">
                                        <button onclick="toggleFeatured('${product._id}', true)" 
                                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                                            <i class="fas fa-star mr-1"></i>Ajouter
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
    }
};

// ========================================
// DASHBOARD
// ========================================

PharmacieGaherApp.prototype.loadAdminDashboard = async function() {
    try {
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        
        let stats = {
            totalProducts: products.length,
            totalOrders: adminOrders.length,
            pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
            monthlyRevenue: adminOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        };

        try {
            const data = await apiCall('/admin/dashboard');
            if (data) {
                stats = { ...stats, ...data };
            }
        } catch (error) {
            console.log('Using local stats');
        }
        
        document.getElementById('adminContent').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-blue-600 uppercase">Produits</p>
                            <p class="text-3xl font-bold text-blue-800">${stats.totalProducts}</p>
                        </div>
                        <div class="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-pills text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-green-600 uppercase">Commandes</p>
                            <p class="text-3xl font-bold text-green-800">${stats.totalOrders}</p>
                        </div>
                        <div class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-shopping-bag text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-yellow-600 uppercase">En attente</p>
                            <p class="text-3xl font-bold text-yellow-800">${stats.pendingOrders}</p>
                        </div>
                        <div class="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-clock text-white text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-purple-600 uppercase">Revenus</p>
                            <p class="text-3xl font-bold text-purple-800">${stats.monthlyRevenue} DA</p>
                        </div>
                        <div class="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-coins text-white text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

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

// Section Switching
function switchAdminSection(section) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('hover:bg-emerald-50', 'text-emerald-700');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('hover:bg-emerald-50', 'text-emerald-700');
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
    }
}

// ========================================
// EXPORT GLOBAL FUNCTIONS
// ========================================

window.switchAdminSection = switchAdminSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.toggleFeatured = toggleFeatured;
window.deleteOrder = deleteOrder;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetailModal = closeOrderDetailModal;
window.previewImage = previewImage;

console.log('✅ Complete Admin.js loaded - All CRUD operations ready');
