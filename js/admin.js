// ============================================================================
// ADMIN.JS - Complete CRUD with Force Delete and Full Logging
// ============================================================================

function generatePlaceholder(width, height, bgColor, textColor, text) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = `#${bgColor}`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = `#${textColor}`;
    ctx.font = `bold ${Math.floor(width / 4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL('image/png');
}

function previewImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        window.app?.showToast('Image trop volumineuse. Maximum 2MB', 'error');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const imageUrlInput = document.getElementById('productImageUrl');
        
        if (preview && placeholder && imageUrlInput) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
            imageUrlInput.value = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

function switchAdminSection(section) {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
    }
    
    switch(section) {
        case 'dashboard':
            window.app?.loadAdminDashboard();
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

// ============================================================================
// PRODUCTS SECTION
// ============================================================================

async function loadAdminProducts() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-emerald-500"></i><p class="mt-4">Chargement des produits...</p></div>';
    
    try {
        const token = localStorage.getItem('token');
        let products = [];
        
        console.log('Fetching products from API...');
        const response = await fetch(buildApiUrl('/products'), {
            headers: token ? { 'x-auth-token': token } : {}
        });
        
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            console.log(`✅ Loaded ${products.length} products from API`);
            
            localStorage.setItem('demoProducts', JSON.stringify(products));
            window.app.allProducts = products;
        } else {
            throw new Error(`API returned ${response.status}`);
        }
        
        renderProductsTable(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        renderProductsTable(localProducts);
        window.app?.showToast('Chargement depuis le cache local', 'warning');
    }
}

function renderProductsTable(products) {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-emerald-800">Gestion des Produits (${products.length})</h2>
                <button onclick="showAddProductModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Ajouter un produit
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-emerald-50 border-b-2 border-emerald-200">
                            <th class="px-4 py-3 text-left text-emerald-800">Image</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Nom</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Catégorie</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Prix</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Stock</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Statut</th>
                            <th class="px-4 py-3 text-left text-emerald-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => {
                            let imageUrl = product.image;
                            if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                                const initials = product.nom.substring(0, 2).toUpperCase();
                                imageUrl = generatePlaceholder(50, 50, '10b981', 'ffffff', initials);
                            }
                            return `
                            <tr class="border-b border-emerald-100 hover:bg-emerald-50" data-product-id="${product._id}">
                                <td class="px-4 py-3">
                                    <img src="${imageUrl}" alt="${product.nom}" class="w-12 h-12 object-cover rounded-lg">
                                </td>
                                <td class="px-4 py-3 font-semibold text-emerald-800">${product.nom}</td>
                                <td class="px-4 py-3 text-gray-700">${product.categorie}</td>
                                <td class="px-4 py-3 text-emerald-700 font-bold">${product.prix} DA</td>
                                <td class="px-4 py-3 ${product.stock === 0 ? 'text-red-600' : 'text-emerald-600'} font-semibold">
                                    ${product.stock}
                                </td>
                                <td class="px-4 py-3">
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                        product.actif !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }">
                                        ${product.actif !== false ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}', '${product.nom.replace(/'/g, "\\'")}', false)" class="text-red-600 hover:text-red-800 mr-3" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}', '${product.nom.replace(/'/g, "\\'")}', true)" class="text-orange-600 hover:text-orange-800" title="Forcer suppression">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${renderProductModal()}
    `;
    
    setupProductModalListeners();
}

function renderProductModal() {
    return `
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-bold" id="modalTitle">
                            <i class="fas fa-plus-circle mr-2"></i>Ajouter un produit
                        </h3>
                        <button onclick="closeProductModal()" class="text-white hover:text-gray-200">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <form id="productForm" onsubmit="handleProductSubmit(event)" class="p-6 space-y-4">
                    <input type="hidden" id="productId">
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                        <input type="text" id="productNom" required class="form-input">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea id="productDescription" rows="3" class="form-input"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                            <select id="productCategorie" required class="form-input">
                                <option value="">Sélectionner...</option>
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
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                            <input type="text" id="productMarque" class="form-input">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                            <input type="number" id="productPrix" required min="0" class="form-input">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                            <input type="number" id="productStock" required min="0" class="form-input">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div id="imagePreviewContainer" class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center h-48 flex items-center justify-center">
                                    <div id="imagePreviewPlaceholder">
                                        <i class="fas fa-image text-gray-400 text-4xl mb-2"></i>
                                        <p class="text-gray-500">Aperçu de l'image</p>
                                    </div>
                                    <img id="imagePreview" src="" alt="Aperçu" class="max-h-40 max-w-full hidden">
                                </div>
                            </div>
                            <div class="flex flex-col justify-center">
                                <label for="productImageUpload" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl text-center cursor-pointer flex items-center justify-center">
                                    <i class="fas fa-upload mr-2"></i>Télécharger une image
                                    <input type="file" id="productImageUpload" accept="image/*" class="hidden" onchange="previewImage(this)">
                                </label>
                                <div class="text-sm text-gray-500 mt-4">
                                    <p>Formats: JPG, PNG, GIF</p>
                                    <p>Taille max: 2MB</p>
                                </div>
                                <input type="hidden" id="productImageUrl">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="productActif" checked class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">Produit actif</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" id="productVedette" class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">En vedette</span>
                        </label>
                        
                        <label class="flex items-center">
                            <input type="checkbox" id="productPromotion" class="mr-2">
                            <span class="text-sm font-semibold text-gray-700">En promotion</span>
                        </label>
                    </div>
                    
                    <div id="promotionFields" class="hidden space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix original (DA)</label>
                                <input type="number" id="productPrixOriginal" min="0" class="form-input">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">% de réduction</label>
                                <input type="number" id="productPourcentagePromotion" min="0" max="100" class="form-input">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-4 pt-4">
                        <button type="submit" class="btn-primary flex-1">
                            <i class="fas fa-save mr-2"></i>
                            <span id="submitButtonText">Ajouter le produit</span>
                        </button>
                        <button type="button" onclick="closeProductModal()" class="btn-secondary flex-1">
                            <i class="fas fa-times mr-2"></i>Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function setupProductModalListeners() {
    setTimeout(() => {
        const promotionCheckbox = document.getElementById('productPromotion');
        const promotionFields = document.getElementById('promotionFields');
        
        if (promotionCheckbox && promotionFields) {
            promotionCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    promotionFields.classList.remove('hidden');
                } else {
                    promotionFields.classList.add('hidden');
                }
            });
        }
    }, 100);
}

function showAddProductModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle mr-2"></i>Ajouter un produit';
    document.getElementById('submitButtonText').textContent = 'Ajouter le produit';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    if (preview && placeholder) {
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
    
    document.getElementById('productModal').classList.remove('hidden');
}

async function editProduct(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`/products/${productId}`), {
            headers: token ? { 'x-auth-token': token } : {}
        });
        
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const data = await response.json();
        const product = data.product;
        
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit mr-2"></i>Modifier le produit';
        document.getElementById('submitButtonText').textContent = 'Enregistrer les modifications';
        document.getElementById('productId').value = product._id;
        document.getElementById('productNom').value = product.nom;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategorie').value = product.categorie;
        document.getElementById('productMarque').value = product.marque || '';
        document.getElementById('productPrix').value = product.prix;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImageUrl').value = product.image || '';
        document.getElementById('productActif').checked = product.actif !== false;
        document.getElementById('productVedette').checked = product.enVedette || false;
        document.getElementById('productPromotion').checked = product.enPromotion || false;
        
        if (product.enPromotion) {
            document.getElementById('promotionFields').classList.remove('hidden');
            document.getElementById('productPrixOriginal').value = product.prixOriginal || '';
            document.getElementById('productPourcentagePromotion').value = product.pourcentagePromotion || '';
        }
        
        if (product.image) {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.getElementById('imagePreviewPlaceholder');
            preview.src = product.image;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        
        document.getElementById('productModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading product:', error);
        window.app?.showToast('Erreur de chargement du produit', 'error');
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

async function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.app?.showToast('Session expirée. Reconnexion nécessaire.', 'error');
        return;
    }
    
    const productData = {
        nom: document.getElementById('productNom').value,
        description: document.getElementById('productDescription').value,
        categorie: document.getElementById('productCategorie').value,
        marque: document.getElementById('productMarque').value,
        prix: parseFloat(document.getElementById('productPrix').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImageUrl').value || '',
        actif: document.getElementById('productActif').checked,
        enVedette: document.getElementById('productVedette').checked,
        enPromotion: document.getElementById('productPromotion').checked
    };
    
    if (productData.enPromotion) {
        productData.prixOriginal = parseFloat(document.getElementById('productPrixOriginal').value);
        productData.pourcentagePromotion = parseInt(document.getElementById('productPourcentagePromotion').value);
    }
    
    try {
        const url = productId ? `/products/${productId}` : '/products';
        const method = productId ? 'PUT' : 'POST';
        
        console.log(`${method} request to ${url}`);
        
        const response = await fetch(buildApiUrl(url), {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }
        
        const data = await response.json();
        console.log('Product saved:', data);
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        if (productId) {
            const index = localProducts.findIndex(p => p._id === productId);
            if (index > -1) localProducts[index] = data.product;
        } else {
            localProducts.push(data.product);
        }
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        window.app.allProducts = localProducts;
        window.app.refreshProductsCache();
        
        window.app?.showToast(productId ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
        closeProductModal();
        loadAdminProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        window.app?.showToast(error.message, 'error');
    }
}

// FORCE DELETE - Deletes from API AND localStorage
async function deleteProduct(productId, productName, forceDelete = false) {
    const confirmMsg = forceDelete 
        ? `FORCE DELETE: Êtes-vous sûr de vouloir supprimer définitivement "${productName}" de la base de données ET du cache ?`
        : `Êtes-vous sûr de vouloir supprimer "${productName}" ?`;
    
    if (!confirm(confirmMsg)) return;
    
    const token = localStorage.getItem('token');
    
    console.log(`🗑️ Attempting to delete product: ${productId}`);
    console.log(`   Name: ${productName}`);
    console.log(`   Force delete: ${forceDelete}`);
    console.log(`   Token: ${token ? 'Present' : 'Missing'}`);
    
    let apiDeleteSuccess = false;
    
    try {
        console.log(`📡 Sending DELETE request to: ${buildApiUrl(`/products/${productId}`)}`);
        
        const response = await fetch(buildApiUrl(`/products/${productId}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });
        
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API delete successful:', data);
            apiDeleteSuccess = true;
        } else {
            const errorData = await response.json();
            console.error('❌ API delete failed:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ DELETE request error:', error);
        
        if (!forceDelete) {
            window.app?.showToast(`Erreur API: ${error.message}. Utilisez le bouton orange pour forcer la suppression.`, 'error');
            return;
        }
        
        console.log('⚠️ Force delete mode: continuing despite API error');
    }
    
    // Delete from localStorage regardless of API success if force delete
    if (apiDeleteSuccess || forceDelete) {
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const beforeCount = localProducts.length;
        const filtered = localProducts.filter(p => p._id !== productId);
        const afterCount = filtered.length;
        
        console.log(`💾 localStorage: ${beforeCount} products before, ${afterCount} after`);
        
        localStorage.setItem('demoProducts', JSON.stringify(filtered));
        
        window.app.allProducts = filtered;
        window.app.refreshProductsCache();
        
        // Remove row from table immediately
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            row.remove();
            console.log('✅ Removed row from table');
        }
        
        const msg = apiDeleteSuccess 
            ? 'Produit supprimé avec succès de la base de données'
            : 'Produit supprimé du cache local (API non disponible)';
        
        window.app?.showToast(msg, 'success');
    }
}

// ============================================================================
// ORDERS SECTION
// ============================================================================

async function loadAdminOrders() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-emerald-500"></i></div>';
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) throw new Error('No authentication token');
        
        const response = await fetch(buildApiUrl('/orders'), {
            headers: { 'x-auth-token': token }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        const orders = data.orders || [];
        
        console.log(`Loaded ${orders.length} orders from API`);
        renderOrdersTable(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        
        const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        renderOrdersTable(localOrders);
        window.app?.showToast('Chargement depuis le cache local', 'warning');
    }
}

function renderOrdersTable(orders) {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Gestion des Commandes (${orders.length})</h2>
            
            ${orders.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Aucune commande</h3>
                    <p class="text-gray-500">Les commandes apparaîtront ici</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${orders.reverse().map(order => `
                        <div class="border-2 border-emerald-100 rounded-xl p-6 hover:border-emerald-300 transition-all">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h3 class="font-bold text-emerald-800 text-lg">Commande #${order.numero}</h3>
                                    <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                    <p class="text-sm text-gray-700 mt-1">
                                        <i class="fas fa-user mr-2"></i>
                                        ${order.client.prenom} ${order.client.nom}
                                    </p>
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-phone mr-2"></i>
                                        ${order.client.telephone}
                                    </p>
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-map-marker-alt mr-2"></i>
                                        ${order.client.adresse}, ${order.client.wilaya}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-3xl font-bold text-emerald-700 mb-2">${order.total} DA</p>
                                    <span class="px-4 py-2 rounded-full text-sm font-semibold ${
                                        order.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                        order.statut === 'en-cours' ? 'bg-blue-100 text-blue-800' :
                                        order.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }">
                                        ${order.statut}
                                    </span>
                                    <div class="mt-3">
                                        <button onclick="deleteOrder('${order._id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                                            <i class="fas fa-trash mr-2"></i>Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <h4 class="font-semibold text-emerald-800 mb-2">Produits:</h4>
                                <div class="space-y-2">
                                    ${order.produits.map(item => `
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-700">${item.quantite}x Produit</span>
                                            <span class="font-semibold text-emerald-700">${item.prix * item.quantite} DA</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${order.notes ? `
                                <div class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p class="text-sm text-gray-700">
                                        <i class="fas fa-sticky-note mr-2 text-yellow-600"></i>
                                        <strong>Notes:</strong> ${order.notes}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(buildApiUrl(`/orders/${orderId}`), {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        console.log('Order deleted from API');
        window.app?.showToast('Commande supprimée avec succès', 'success');
        loadAdminOrders();
        
    } catch (error) {
        console.error('Error deleting order:', error);
        window.app?.showToast('Erreur lors de la suppression', 'error');
    }
}

// ============================================================================
// FEATURED SECTION
// ============================================================================

async function loadAdminFeatured() {
    const products = window.app.allProducts;
    const featuredProducts = products.filter(p => p.enVedette);
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Produits en Vedette</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                ${featuredProducts.map(product => {
                    let imageUrl = product.image;
                    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                        const initials = product.nom.substring(0, 2).toUpperCase();
                        imageUrl = generatePlaceholder(200, 200, '10b981', 'ffffff', initials);
                    }
                    return `
                    <div class="border-2 border-emerald-200 rounded-xl p-4">
                        <img src="${imageUrl}" alt="${product.nom}" class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                            <i class="fas fa-times mr-2"></i>Retirer
                        </button>
                    </div>
                `}).join('')}
            </div>
            
            <h3 class="text-xl font-bold text-emerald-800 mb-4">Ajouter des produits en vedette</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${products.filter(p => !p.enVedette).slice(0, 9).map(product => {
                    let imageUrl = product.image;
                    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
                        const initials = product.nom.substring(0, 2).toUpperCase();
                        imageUrl = generatePlaceholder(200, 200, '10b981', 'ffffff', initials);
                    }
                    return `
                    <div class="border border-emerald-200 rounded-xl p-4">
                        <img src="${imageUrl}" alt="${product.nom}" class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" class="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">
                            <i class="fas fa-star mr-2"></i>Mettre en vedette
                        </button>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
}

async function toggleFeatured(productId) {
    const product = window.app.allProducts.find(p => p._id === productId);
    if (!product) return;
    
    const updatedData = {
        ...product,
        enVedette: !product.enVedette
    };
    
    const token = localStorage.getItem('token');
    
    try {
        await fetch(buildApiUrl(`/products/${productId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(updatedData)
        });
        
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const index = localProducts.findIndex(p => p._id === productId);
        if (index > -1) {
            localProducts[index].enVedette = !localProducts[index].enVedette;
            localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        }
        
        window.app.allProducts = localProducts;
        window.app.refreshProductsCache();
        
        loadAdminFeatured();
        
    } catch (error) {
        console.error('Error toggling featured:', error);
    }
}

// ============================================================================
// CLEANUP SECTION
// ============================================================================

function loadAdminCleanup() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <h2 class="text-2xl font-bold text-red-800 mb-6">
                <i class="fas fa-exclamation-triangle mr-2"></i>Zone de Nettoyage
            </h2>
            
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-red-800 mb-4">Attention</h3>
                <p class="text-red-700">Ces actions sont irréversibles.</p>
            </div>
            
            <div class="space-y-4">
                <div class="border-2 border-gray-200 rounded-xl p-6">
                    <h4 class="font-bold text-gray-800 mb-3">Supprimer produits en rupture de stock</h4>
                    <button onclick="cleanupOutOfStock()" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function cleanupOutOfStock() {
    if (!confirm('Supprimer tous les produits en rupture de stock ?')) return;
    
    const token = localStorage.getItem('token');
    const products = window.app.allProducts.filter(p => p.stock === 0);
    
    let deletedCount = 0;
    
    for (const product of products) {
        try {
            await fetch(buildApiUrl(`/products/${product._id}`), {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            deletedCount++;
        } catch (error) {
            console.error(`Failed to delete ${product._id}`);
        }
    }
    
    const remaining = window.app.allProducts.filter(p => p.stock > 0);
    localStorage.setItem('demoProducts', JSON.stringify(remaining));
    window.app.allProducts = remaining;
    window.app.refreshProductsCache();
    
    window.app?.showToast(`${deletedCount} produits supprimés`, 'success');
    loadAdminCleanup();
}

console.log('Admin.js loaded - Force delete enabled');
