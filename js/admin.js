// ==========================================
// 🌿 Admin Panel - Complete Implementation
// ==========================================

/**
 * Switch admin section
 */
function switchAdminSection(section) {
    log('Switching to admin section', section);
    
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
    }
    
    // Load section
    switch (section) {
        case 'dashboard':
            window.app.loadAdminDashboard();
            break;
        case 'products':
            loadAdminProducts();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'featured':
            loadAdminFeatured();
            break;
        case 'cleanup':
            loadAdminCleanup();
            break;
    }
}

/**
 * Load admin products section
 */
async function loadAdminProducts() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-emerald-800">Gestion des Produits</h2>
                <button onclick="showAddProductModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Ajouter un produit
                </button>
            </div>
            
            <!-- Products List -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-emerald-50">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Image</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Nom</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Catégorie</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Prix</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Stock</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Statut</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-emerald-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminProductsTable" class="divide-y divide-gray-200">
                            <tr>
                                <td colspan="7" class="px-6 py-12 text-center">
                                    <div class="spinner mx-auto mb-4"></div>
                                    <p class="text-gray-500">Chargement des produits...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Load products
    await loadAdminProductsTable();
}

/**
 * Load admin products table
 */
async function loadAdminProductsTable() {
    try {
        const products = window.app.allProducts;
        const tbody = document.getElementById('adminProductsTable');
        
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">Aucun produit</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = products.map(product => {
            let imageUrl;
            if (product.image && product.image.startsWith('http')) {
                imageUrl = product.image;
            } else if (product.image && product.image.startsWith('data:image')) {
                imageUrl = product.image;
            } else {
                imageUrl = generatePlaceholderImage(product.nom, product.categorie);
            }
            
            return `
                <tr class="hover:bg-emerald-50 transition-colors">
                    <td class="px-6 py-4">
                        <img src="${imageUrl}" alt="${product.nom}" 
                             class="w-16 h-16 object-cover rounded-lg shadow"
                             onerror="this.src='${generatePlaceholderImage(product.nom, product.categorie)}'">
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-semibold text-gray-900">${product.nom}</div>
                        ${product.marque ? `<div class="text-sm text-gray-500">${product.marque}</div>` : ''}
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                            ${product.categorie}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold text-emerald-700">${formatPrice(product.prix)}</div>
                        ${product.enPromotion && product.prixOriginal ? `
                            <div class="text-xs text-gray-500 line-through">${formatPrice(product.prixOriginal)}</div>
                        ` : ''}
                    </td>
                    <td class="px-6 py-4">
                        <span class="font-semibold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}">
                            ${product.stock}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="space-y-1">
                            ${product.actif !== false ? `
                                <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Actif</span>
                            ` : `
                                <span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">Inactif</span>
                            `}
                            ${product.enVedette ? `
                                <span class="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                                    <i class="fas fa-star"></i> Vedette
                                </span>
                            ` : ''}
                            ${product.enPromotion ? `
                                <span class="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                    <i class="fas fa-tag"></i> Promo
                                </span>
                            ` : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="editProduct('${product._id}')" 
                                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="toggleProductFeatured('${product._id}', ${!product.enVedette})" 
                                    class="p-2 ${product.enVedette ? 'text-yellow-600' : 'text-gray-400'} hover:bg-yellow-50 rounded-lg transition-colors"
                                    title="En vedette">
                                <i class="fas fa-star"></i>
                            </button>
                            <button onclick="toggleProductPromotion('${product._id}', ${!product.enPromotion})" 
                                    class="p-2 ${product.enPromotion ? 'text-red-600' : 'text-gray-400'} hover:bg-red-50 rounded-lg transition-colors"
                                    title="En promotion">
                                <i class="fas fa-tag"></i>
                            </button>
                            <button onclick="deleteProduct('${product._id}')" 
                                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading products table:', error);
    }
}

/**
 * Show add product modal
 */
function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
                <h3 class="text-2xl font-bold text-emerald-800">Ajouter un produit</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="addProductForm" onsubmit="handleAddProduct(event)" class="p-8 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                        <input type="text" name="nom" required class="form-input" placeholder="Ex: Vitamine C 1000mg">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                        <select name="categorie" required class="form-select">
                            <option value="">Sélectionner...</option>
                            ${CONFIG.CATEGORIES.map(cat => `<option value="${cat.nom}">${cat.nom}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                        <input type="text" name="marque" class="form-input" placeholder="Ex: Pharmex">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                        <input type="number" name="prix" required min="0" step="10" class="form-input" placeholder="1500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                        <input type="number" name="stock" required min="0" class="form-input" placeholder="50">
                    </div>
                    
                    <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea name="description" rows="3" class="form-textarea" placeholder="Description du produit..."></textarea>
                    </div>
                    
                    <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                        <input type="file" name="image" accept="image/*" class="form-input" onchange="previewProductImage(event)">
                        <div id="imagePreview" class="mt-4 hidden">
                            <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg shadow">
                        </div>
                    </div>
                    
                    <div class="md:col-span-2 space-y-3">
                        <label class="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="enVedette" class="w-5 h-5 text-emerald-600 rounded">
                            <span class="text-sm font-semibold text-gray-700">
                                <i class="fas fa-star text-yellow-500 mr-2"></i>Produit en vedette
                            </span>
                        </label>
                        
                        <label class="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="enPromotion" class="w-5 h-5 text-emerald-600 rounded" onchange="togglePromotionFields(this)">
                            <span class="text-sm font-semibold text-gray-700">
                                <i class="fas fa-tag text-red-500 mr-2"></i>En promotion
                            </span>
                        </label>
                        
                        <div id="promotionFields" class="hidden pl-8 space-y-3">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" name="prixOriginal" min="0" step="10" class="form-input" placeholder="2000">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Pourcentage de réduction</label>
                                <input type="number" name="pourcentagePromotion" min="1" max="99" class="form-input" placeholder="25">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-4 pt-6 border-t border-gray-200">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">
                        Annuler
                    </button>
                    <button type="submit" class="flex-1 btn-primary" id="addProductBtn">
                        <span id="addProductBtnText">Ajouter le produit</span>
                        <i id="addProductBtnSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Toggle promotion fields
 */
function togglePromotionFields(checkbox) {
    const fields = document.getElementById('promotionFields');
    if (fields) {
        fields.classList.toggle('hidden', !checkbox.checked);
        
        // Make fields required/optional based on checkbox
        const inputs = fields.querySelectorAll('input');
        inputs.forEach(input => {
            input.required = checkbox.checked;
        });
    }
}

/**
 * Preview product image
 */
function previewProductImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    const img = preview?.querySelector('img');
    
    if (!file || !preview || !img) return;
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        window.app.showToast(validation.error, 'error');
        event.target.value = '';
        preview.classList.add('hidden');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

/**
 * Handle add product
 */
async function handleAddProduct(event) {
    event.preventDefault();
    
    const btn = document.getElementById('addProductBtn');
    const btnText = document.getElementById('addProductBtnText');
    const btnSpinner = document.getElementById('addProductBtnSpinner');
    
    try {
        btn.disabled = true;
        btnText.textContent = 'Ajout en cours...';
        btnSpinner.classList.remove('hidden');
        
        const formData = new FormData(event.target);
        
        // Build product object
        const product = {
            _id: generateId(),
            nom: formData.get('nom'),
            categorie: formData.get('categorie'),
            marque: formData.get('marque') || '',
            prix: parseInt(formData.get('prix')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description') || '',
            enVedette: formData.get('enVedette') === 'on',
            enPromotion: formData.get('enPromotion') === 'on',
            actif: true,
            createdAt: new Date().toISOString()
        };
        
        // Handle promotion
        if (product.enPromotion) {
            product.prixOriginal = parseInt(formData.get('prixOriginal')) || product.prix;
            product.pourcentagePromotion = parseInt(formData.get('pourcentagePromotion')) || 0;
        }
        
        // Handle image
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            product.image = await fileToBase64(imageFile);
        }
        
        // Add to localStorage
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        products.push(product);
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        // Refresh app cache
        window.app.refreshProductsCache();
        
        window.app.showToast('Produit ajouté avec succès!', 'success');
        
        // Close modal
        event.target.closest('.fixed').remove();
        
        // Refresh table
        await loadAdminProductsTable();
        
    } catch (error) {
        console.error('Error adding product:', error);
        window.app.showToast('Erreur lors de l\'ajout du produit', 'error');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Ajouter le produit';
        btnSpinner.classList.add('hidden');
    }
}

/**
 * Toggle product featured status
 */
async function toggleProductFeatured(productId, featured) {
    try {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex === -1) {
            throw new Error('Produit non trouvé');
        }
        
        products[productIndex].enVedette = featured;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        window.app.refreshProductsCache();
        window.app.showToast(featured ? 'Produit mis en vedette' : 'Produit retiré des vedettes', 'success');
        
        await loadAdminProductsTable();
        
    } catch (error) {
        console.error('Error toggling featured:', error);
        window.app.showToast('Erreur lors de la mise à jour', 'error');
    }
}

/**
 * Toggle product promotion status
 */
async function toggleProductPromotion(productId, promotion) {
    try {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex === -1) {
            throw new Error('Produit non trouvé');
        }
        
        products[productIndex].enPromotion = promotion;
        
        if (!promotion) {
            delete products[productIndex].prixOriginal;
            delete products[productIndex].pourcentagePromotion;
        }
        
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        window.app.refreshProductsCache();
        window.app.showToast(promotion ? 'Produit mis en promotion' : 'Promotion retirée', 'success');
        
        await loadAdminProductsTable();
        
    } catch (error) {
        console.error('Error toggling promotion:', error);
        window.app.showToast('Erreur lors de la mise à jour', 'error');
    }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }
    
    try {
        const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const filteredProducts = products.filter(p => p._id !== productId);
        
        localStorage.setItem('demoProducts', JSON.stringify(filteredProducts));
        
        window.app.refreshProductsCache();
        window.app.showToast('Produit supprimé', 'success');
        
        await loadAdminProductsTable();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        window.app.showToast('Erreur lors de la suppression', 'error');
    }
}

/**
 * Load admin orders section
 */
async function loadAdminOrders() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-emerald-800">Gestion des Commandes</h2>
            
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <p class="text-gray-500">Fonctionnalité de gestion des commandes à venir...</p>
            </div>
        </div>
    `;
}

/**
 * Load admin featured section
 */
async function loadAdminFeatured() {
    const adminContent = document.getElementById('adminContent');
    
    const featuredProducts = window.app.allProducts.filter(p => p.enVedette);
    
    adminContent.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-emerald-800">Produits en Vedette</h2>
            
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <p class="text-gray-600 mb-6">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                    ${featuredProducts.length} produit(s) en vedette
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${featuredProducts.length > 0 ? featuredProducts.map(product => window.app.createProductCard(product)).join('') : `
                        <div class="col-span-full text-center py-12">
                            <i class="fas fa-star text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500">Aucun produit en vedette</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

/**
 * Load admin cleanup section
 */
async function loadAdminCleanup() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-red-800">
                <i class="fas fa-broom mr-2"></i>Nettoyage de la Base de Données
            </h2>
            
            <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <p class="text-red-700 mb-6">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <strong>Attention:</strong> Ces actions sont irréversibles!
                </p>
                
                <div class="space-y-4">
                    <button onclick="clearAllProducts()" class="w-full btn-secondary text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3">
                        <i class="fas fa-trash mr-2"></i>Supprimer tous les produits
                    </button>
                    
                    <button onclick="clearCart()" class="w-full btn-secondary text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white py-3">
                        <i class="fas fa-shopping-cart mr-2"></i>Vider le panier
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Clear all products
 */
function clearAllProducts() {
    if (!confirm('Êtes-vous ABSOLUMENT sûr de vouloir supprimer TOUS les produits? Cette action est IRRÉVERSIBLE!')) {
        return;
    }
    
    if (!confirm('Dernière confirmation: Supprimer tous les produits?')) {
        return;
    }
    
    localStorage.removeItem('demoProducts');
    window.app.refreshProductsCache();
    window.app.showToast('Tous les produits ont été supprimés', 'success');
    loadAdminProducts();
}

/**
 * Clear cart
 */
function clearCart() {
    if (!confirm('Vider le panier?')) {
        return;
    }
    
    window.app.clearCart();
    window.app.showToast('Panier vidé', 'success');
}

console.log('✅ Admin.js loaded successfully');
