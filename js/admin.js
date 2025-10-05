// ============================================================================
// COMPLETE ADMIN.JS - Product & Order Management System
// Compatible with Shifa Parapharmacie Backend API
// ============================================================================

console.log('✅ Loading Complete Admin System...');

// ============================================================================
// SECTION SWITCHER - Navigation between admin sections
// ============================================================================
function switchAdminSection(section) {
    console.log('🔄 Switching to section:', section);
    
    // Update nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
        activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
    }
    
    // Load section content
    switch (section) {
        case 'dashboard':
            if (window.app) window.app.loadAdminDashboard();
            break;
        case 'products':
            loadProductsManagement();
            break;
        case 'orders':
            loadOrdersManagement();
            break;
        case 'featured':
            loadFeaturedManagement();
            break;
        case 'cleanup':
            loadCleanupSection();
            break;
    }
}

// ============================================================================
// PRODUCTS MANAGEMENT SECTION
// ============================================================================
async function loadProductsManagement() {
    console.log('📦 Loading Products Management...');
    
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    adminContent.innerHTML = `
        <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-emerald-800">Gestion des Produits</h2>
                    <p class="text-emerald-600">Ajoutez, modifiez et gérez votre catalogue</p>
                </div>
                <button onclick="showAddProductModal()" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fas fa-plus-circle mr-2"></i>Ajouter un produit
                </button>
            </div>
            
            <!-- Filters -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Rechercher</label>
                    <input type="text" id="productSearchInput" placeholder="Nom, marque..." 
                           class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                           oninput="filterProducts()">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Catégorie</label>
                    <select id="productCategoryFilter" onchange="filterProducts()" 
                            class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all">
                        <option value="">Toutes</option>
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
                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Statut</label>
                    <select id="productStatusFilter" onchange="filterProducts()" 
                            class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all">
                        <option value="">Tous</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Trier par</label>
                    <select id="productSortFilter" onchange="filterProducts()" 
                            class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all">
                        <option value="newest">Plus récents</option>
                        <option value="name_asc">Nom A-Z</option>
                        <option value="name_desc">Nom Z-A</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                        <option value="stock_asc">Stock croissant</option>
                        <option value="stock_desc">Stock décroissant</option>
                    </select>
                </div>
            </div>
            
            <!-- Products Table -->
            <div id="productsTableContainer" class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-emerald-100">
                <div class="p-8 text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p class="text-emerald-600">Chargement des produits...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadAndDisplayProducts();
}

async function loadAndDisplayProducts() {
    try {
        let products = [];
        
        // Try to load from API first
        try {
            const response = await apiCall('/admin/products?limit=100');
            if (response && response.products) {
                products = response.products;
                console.log(`✅ Loaded ${products.length} products from API`);
            }
        } catch (error) {
            console.log('API unavailable, loading from localStorage:', error.message);
        }
        
        // Fallback to localStorage
        if (products.length === 0) {
            products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            console.log(`📦 Loaded ${products.length} products from localStorage`);
        }
        
        displayProductsTable(products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableContainer').innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>
                <p class="text-red-600 font-semibold mb-2">Erreur de chargement</p>
                <p class="text-gray-600">${error.message}</p>
            </div>
        `;
    }
}

function displayProductsTable(products) {
    const container = document.getElementById('productsTableContainer');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-inbox text-6xl text-emerald-200 mb-4"></i>
                <p class="text-emerald-600 font-semibold mb-2">Aucun produit trouvé</p>
                <p class="text-gray-600">Commencez par ajouter votre premier produit</p>
                <button onclick="showAddProductModal()" class="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                    <i class="fas fa-plus mr-2"></i>Ajouter un produit
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    <tr>
                        <th class="px-6 py-4 text-left text-sm font-bold">Image</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Nom</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Catégorie</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Prix</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Stock</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Statut</th>
                        <th class="px-6 py-4 text-center text-sm font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-emerald-100">
                    ${products.map((product, index) => `
                        <tr class="hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}">
                            <td class="px-6 py-4">
                                <img src="${getProductImage(product)}" alt="${product.nom}" 
                                     class="w-16 h-16 object-cover rounded-lg shadow-md"
                                     onerror="this.src='https://via.placeholder.com/64x64/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-semibold text-emerald-800">${product.nom}</div>
                                <div class="text-sm text-gray-600">${product.marque || 'Sans marque'}</div>
                                ${product.enVedette ? '<span class="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full"><i class="fas fa-star mr-1"></i>Vedette</span>' : ''}
                                ${product.enPromotion ? '<span class="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full"><i class="fas fa-tag mr-1"></i>Promo</span>' : ''}
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-lg">
                                    ${product.categorie}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-emerald-700">${product.prix} DA</div>
                                ${product.prixOriginal ? `<div class="text-sm text-gray-400 line-through">${product.prixOriginal} DA</div>` : ''}
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-3 py-1 rounded-lg font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                    ${product.stock}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" ${product.actif !== false ? 'checked' : ''} 
                                           onchange="toggleProductStatus('${product._id}')" 
                                           class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex justify-center space-x-2">
                                    <button onclick="editProduct('${product._id}')" 
                                            class="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all shadow-sm hover:shadow-md" 
                                            title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}')" 
                                            class="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all shadow-sm hover:shadow-md" 
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
        <div class="bg-emerald-50 px-6 py-4 border-t-2 border-emerald-200">
            <p class="text-emerald-700 font-semibold">
                <i class="fas fa-box mr-2"></i>Total: ${products.length} produit(s)
            </p>
        </div>
    `;
}

function getProductImage(product) {
    if (product.image && product.image.startsWith('http')) {
        return product.image;
    } else if (product.image && product.image.startsWith('data:image')) {
        return product.image;
    } else {
        const categoryColors = {
            'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
            'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
            'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
            'Dentaire': '6366f1'
        };
        const color = categoryColors[product.categorie] || '10b981';
        const initials = product.nom.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(initials)}`;
    }
}

function filterProducts() {
    const search = document.getElementById('productSearchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('productCategoryFilter')?.value || '';
    const status = document.getElementById('productStatusFilter')?.value || '';
    const sort = document.getElementById('productSortFilter')?.value || 'newest';
    
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
    
    if (status === 'active') {
        products = products.filter(p => p.actif !== false);
    } else if (status === 'inactive') {
        products = products.filter(p => p.actif === false);
    }
    
    // Apply sorting
    products.sort((a, b) => {
        switch (sort) {
            case 'name_asc': return a.nom.localeCompare(b.nom);
            case 'name_desc': return b.nom.localeCompare(a.nom);
            case 'price_asc': return a.prix - b.prix;
            case 'price_desc': return b.prix - a.prix;
            case 'stock_asc': return a.stock - b.stock;
            case 'stock_desc': return b.stock - a.stock;
            default: return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0);
        }
    });
    
    displayProductsTable(products);
}

// ============================================================================
// ADD/EDIT PRODUCT MODAL
// ============================================================================
function showAddProductModal() {
    showProductModal(null);
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const product = products.find(p => p._id === productId);
    if (product) {
        showProductModal(product);
    }
}

function showProductModal(product = null) {
    const isEdit = product !== null;
    const modalTitle = isEdit ? 'Modifier le produit' : 'Ajouter un produit';
    
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-3xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">${modalTitle}</h3>
                    <button onclick="closeProductModal()" class="text-white hover:text-emerald-200 p-2 hover:bg-white/20 rounded-lg transition-all">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            
            <form id="productForm" class="p-8 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Nom -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Nom du produit *</label>
                        <input type="text" name="nom" required value="${product?.nom || ''}"
                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                               placeholder="Ex: Huile d'argan bio">
                    </div>
                    
                    <!-- Description -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Description *</label>
                        <textarea name="description" required rows="3"
                                  class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none"
                                  placeholder="Description détaillée du produit...">${product?.description || ''}</textarea>
                    </div>
                    
                    <!-- Catégorie -->
                    <div>
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Catégorie *</label>
                        <select name="categorie" required
                                class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all">
                            <option value="">Sélectionner...</option>
                            <option value="Vitalité" ${product?.categorie === 'Vitalité' ? 'selected' : ''}>Vitalité</option>
                            <option value="Sport" ${product?.categorie === 'Sport' ? 'selected' : ''}>Sport</option>
                            <option value="Visage" ${product?.categorie === 'Visage' ? 'selected' : ''}>Visage</option>
                            <option value="Cheveux" ${product?.categorie === 'Cheveux' ? 'selected' : ''}>Cheveux</option>
                            <option value="Solaire" ${product?.categorie === 'Solaire' ? 'selected' : ''}>Solaire</option>
                            <option value="Intime" ${product?.categorie === 'Intime' ? 'selected' : ''}>Intime</option>
                            <option value="Soins" ${product?.categorie === 'Soins' ? 'selected' : ''}>Soins</option>
                            <option value="Bébé" ${product?.categorie === 'Bébé' ? 'selected' : ''}>Bébé</option>
                            <option value="Homme" ${product?.categorie === 'Homme' ? 'selected' : ''}>Homme</option>
                            <option value="Dentaire" ${product?.categorie === 'Dentaire' ? 'selected' : ''}>Dentaire</option>
                        </select>
                    </div>
                    
                    <!-- Marque -->
                    <div>
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Marque</label>
                        <input type="text" name="marque" value="${product?.marque || ''}"
                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                               placeholder="Ex: Garnier">
                    </div>
                    
                    <!-- Prix -->
                    <div>
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Prix (DA) *</label>
                        <input type="number" name="prix" required min="0" step="0.01" value="${product?.prix || ''}"
                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                               placeholder="0.00">
                    </div>
                    
                    <!-- Stock -->
                    <div>
                        <label class="block text-sm font-bold text-emerald-700 mb-2">Stock *</label>
                        <input type="number" name="stock" required min="0" value="${product?.stock || 0}"
                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                               placeholder="0">
                    </div>
                    
                    <!-- Promotion -->
                    <div class="md:col-span-2 border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50/30">
                        <div class="flex items-center mb-3">
                            <input type="checkbox" id="enPromotion" name="enPromotion" ${product?.enPromotion ? 'checked' : ''}
                                   class="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded focus:ring-emerald-500"
                                   onchange="togglePromotionFields(this)">
                            <label for="enPromotion" class="ml-2 text-sm font-bold text-emerald-700">
                                <i class="fas fa-tag mr-1"></i>Produit en promotion
                            </label>
                        </div>
                        <div id="promotionFields" class="grid grid-cols-2 gap-4 ${product?.enPromotion ? '' : 'hidden'}">
                            <div>
                                <label class="block text-xs font-semibold text-emerald-600 mb-1">Prix original (DA)</label>
                                <input type="number" name="prixOriginal" min="0" step="0.01" value="${product?.prixOriginal || ''}"
                                       class="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-emerald-600 mb-1">% de réduction</label>
                                <input type="number" name="pourcentagePromotion" min="0" max="100" value="${product?.pourcentagePromotion || ''}"
                                       class="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Image URL -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-bold text-emerald-700 mb-2">URL de l'image</label>
                        <input type="text" name="image" value="${product?.image || ''}"
                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                               placeholder="https://... ou data:image/...">
                        <p class="text-xs text-gray-500 mt-1">Laisser vide pour utiliser l'image par défaut</p>
                    </div>
                    
                    <!-- Flags -->
                    <div class="md:col-span-2 flex space-x-6">
                        <div class="flex items-center">
                            <input type="checkbox" id="enVedette" name="enVedette" ${product?.enVedette ? 'checked' : ''}
                                   class="w-5 h-5 text-yellow-600 border-2 border-yellow-300 rounded focus:ring-yellow-500">
                            <label for="enVedette" class="ml-2 text-sm font-bold text-yellow-700">
                                <i class="fas fa-star mr-1"></i>Produit en vedette (Coups de Cœur)
                            </label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" id="actif" name="actif" ${product?.actif !== false ? 'checked' : ''}
                                   class="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded focus:ring-emerald-500">
                            <label for="actif" class="ml-2 text-sm font-bold text-emerald-700">
                                <i class="fas fa-check-circle mr-1"></i>Produit actif
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Buttons -->
                <div class="flex justify-end space-x-4 pt-6 border-t-2 border-emerald-200">
                    <button type="button" onclick="closeProductModal()"
                            class="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all">
                        Annuler
                    </button>
                    <button type="submit"
                            class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl">
                        <i class="fas fa-save mr-2"></i>${isEdit ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Form submission handler
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleProductSubmit(e, product?._id);
    });
}

function togglePromotionFields(checkbox) {
    const fields = document.getElementById('promotionFields');
    if (fields) {
        fields.classList.toggle('hidden', !checkbox.checked);
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.remove();
}

async function handleProductSubmit(event, productId = null) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const productData = {
        nom: formData.get('nom').trim(),
        description: formData.get('description').trim(),
        prix: parseFloat(formData.get('prix')),
        stock: parseInt(formData.get('stock')),
        categorie: formData.get('categorie'),
        marque: formData.get('marque')?.trim() || '',
        image: formData.get('image')?.trim() || '',
        enPromotion: formData.get('enPromotion') === 'on',
        prixOriginal: formData.get('enPromotion') === 'on' ? parseFloat(formData.get('prixOriginal') || 0) : null,
        pourcentagePromotion: formData.get('enPromotion') === 'on' ? parseInt(formData.get('pourcentagePromotion') || 0) : 0,
        enVedette: formData.get('enVedette') === 'on',
        actif: formData.get('actif') === 'on',
        dateAjout: productId ? undefined : new Date().toISOString()
    };
    
    try {
        if (productId) {
            // UPDATE PRODUCT
            await updateProduct(productId, productData);
        } else {
            // CREATE PRODUCT
            await createProduct(productData);
        }
        
        closeProductModal();
        await loadAndDisplayProducts();
        filterProducts();
        
        // Refresh app cache
        if (window.app && typeof window.app.refreshProductsCache === 'function') {
            window.app.refreshProductsCache();
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de l\'enregistrement: ' + error.message, 'error');
        } else {
            alert('Erreur: ' + error.message);
        }
    }
}

async function createProduct(productData) {
    console.log('➕ Creating new product...');
    
    // Generate ID and add to localStorage FIRST
    productData._id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    productData.dateAjout = new Date().toISOString();
    
    let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    products.push(productData);
    localStorage.setItem('demoProducts', JSON.stringify(products));
    console.log(`✅ Product added to localStorage with ID: ${productData._id}`);
    
    // Try API creation (non-blocking)
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await apiCall('/admin/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            
            if (response && response.product && response.product._id) {
                // Update with API-generated ID
                products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
                const localProduct = products.find(p => p._id === productData._id);
                if (localProduct) {
                    localProduct._id = response.product._id;
                    localStorage.setItem('demoProducts', JSON.stringify(products));
                    console.log(`✅ Product synced with API, new ID: ${response.product._id}`);
                }
            }
        } else {
            console.log('⚠️ No auth token, API creation skipped');
        }
    } catch (error) {
        console.log('⚠️ API creation failed:', error.message);
        // Continue anyway since localStorage creation succeeded
    }
    
    if (window.app) {
        window.app.showToast('Produit ajouté avec succès!', 'success');
    }
}

async function updateProduct(productId, productData) {
    console.log('📝 Updating product:', productId);
    
    // Update localStorage FIRST
    let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const index = products.findIndex(p => p._id === productId);
    
    if (index === -1) {
        throw new Error('Produit non trouvé');
    }
    
    products[index] = { ...products[index], ...productData, _id: productId };
    localStorage.setItem('demoProducts', JSON.stringify(products));
    console.log(`✅ Product updated in localStorage`);
    
    // Try API update (non-blocking)
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await apiCall(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            console.log('✅ Product updated in API');
        } else {
            console.log('⚠️ No auth token, API update skipped');
        }
    } catch (error) {
        console.log('⚠️ API update failed:', error.message);
        // Continue anyway since localStorage update succeeded
    }
    
    if (window.app) {
        window.app.showToast('Produit mis à jour avec succès!', 'success');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
        console.log('🗑️ Deleting product:', productId);
        
        // Delete from localStorage FIRST
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const originalLength = products.length;
        products = products.filter(p => p._id !== productId);
        
        if (products.length === originalLength) {
            console.warn('Product not found in localStorage');
            if (window.app) {
                window.app.showToast('Produit non trouvé', 'error');
            }
            return;
        }
        
        localStorage.setItem('demoProducts', JSON.stringify(products));
        console.log(`✅ Deleted from localStorage. ${originalLength} -> ${products.length} products`);
        
        // Try API deletion (non-blocking)
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await apiCall(`/admin/products/${productId}`, {
                    method: 'DELETE'
                });
                console.log('✅ Product deleted from API');
            } else {
                console.log('⚠️ No auth token, API deletion skipped');
            }
        } catch (error) {
            console.log('⚠️ API deletion failed:', error.message);
            // Continue anyway since localStorage deletion succeeded
        }
        
        // Refresh app cache with localStorage data
        if (window.app && typeof window.app.refreshProductsCache === 'function') {
            window.app.refreshProductsCache();
        }
        
        // Reload display from localStorage (not API)
        displayProductsTable(products);
        
        if (window.app) {
            window.app.showToast('Produit supprimé avec succès!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression: ' + error.message, 'error');
        }
    }
}

async function toggleProductStatus(productId) {
    try {
        console.log('🔄 Toggling product status:', productId);
        
        // Update localStorage FIRST
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const product = products.find(p => p._id === productId);
        
        if (!product) {
            console.warn('Product not found in localStorage');
            return;
        }
        
        product.actif = !product.actif;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        console.log(`✅ Status toggled in localStorage: ${product.actif}`);
        
        // Try API update (non-blocking)
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await apiCall(`/admin/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ actif: product.actif })
                });
                console.log('✅ Status updated in API');
            } else {
                console.log('⚠️ No auth token, API update skipped');
            }
        } catch (error) {
            console.log('⚠️ API update failed:', error.message);
            // Continue anyway since localStorage update succeeded
        }
        
        // Refresh cache with localStorage data
        if (window.app && typeof window.app.refreshProductsCache === 'function') {
            window.app.refreshProductsCache();
        }
        
        // Reload display from localStorage
        displayProductsTable(products);
        
        if (window.app) {
            window.app.showToast(`Produit ${product.actif ? 'activé' : 'désactivé'}`, 'success');
        }
        
    } catch (error) {
        console.error('❌ Error toggling product status:', error);
    }
}

// ============================================================================
// ORDERS MANAGEMENT SECTION
// ============================================================================
async function loadOrdersManagement() {
    console.log('📦 Loading Orders Management...');
    
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    adminContent.innerHTML = `
        <div class="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200/50 p-8 mb-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-blue-800">Gestion des Commandes</h2>
                    <p class="text-blue-600">Gérez toutes les commandes de vos clients</p>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-semibold text-blue-700 mb-2">Rechercher</label>
                    <input type="text" id="orderSearchInput" placeholder="N° commande, client..." 
                           class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all"
                           oninput="filterOrders()">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-blue-700 mb-2">Statut</label>
                    <select id="orderStatusFilter" onchange="filterOrders()" 
                            class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all">
                        <option value="">Tous</option>
                        <option value="en-attente">En attente</option>
                        <option value="confirmée">Confirmée</option>
                        <option value="préparée">Préparée</option>
                        <option value="expédiée">Expédiée</option>
                        <option value="livrée">Livrée</option>
                        <option value="annulée">Annulée</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-blue-700 mb-2">Trier par</label>
                    <select id="orderSortFilter" onchange="filterOrders()" 
                            class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all">
                        <option value="newest">Plus récentes</option>
                        <option value="oldest">Plus anciennes</option>
                        <option value="amount_desc">Montant décroissant</option>
                        <option value="amount_asc">Montant croissant</option>
                    </select>
                </div>
            </div>
            
            <!-- Orders Table -->
            <div id="ordersTableContainer" class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-100">
                <div class="p-8 text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p class="text-blue-600">Chargement des commandes...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadAndDisplayOrders();
}

async function loadAndDisplayOrders() {
    try {
        let orders = [];
        
        // Try API first
        try {
            const response = await apiCall('/admin/orders?limit=100');
            if (response && response.orders) {
                orders = response.orders;
                console.log(`✅ Loaded ${orders.length} orders from API`);
            }
        } catch (error) {
            console.log('API unavailable, loading from localStorage:', error.message);
        }
        
        // Fallback to localStorage
        if (orders.length === 0) {
            orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            console.log(`📦 Loaded ${orders.length} orders from localStorage`);
        } else {
            // Sync API orders to localStorage
            localStorage.setItem('adminOrders', JSON.stringify(orders));
        }
        
        displayOrdersTable(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTableContainer').innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>
                <p class="text-red-600 font-semibold mb-2">Erreur de chargement</p>
                <p class="text-gray-600">${error.message}</p>
            </div>
        `;
    }
}

function displayOrdersTable(orders) {
    const container = document.getElementById('ordersTableContainer');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-inbox text-6xl text-blue-200 mb-4"></i>
                <p class="text-blue-600 font-semibold mb-2">Aucune commande trouvée</p>
                <p class="text-gray-600">Les commandes apparaîtront ici</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                        <th class="px-6 py-4 text-left text-sm font-bold">N° Commande</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Client</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Date</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Articles</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Total</th>
                        <th class="px-6 py-4 text-left text-sm font-bold">Statut</th>
                        <th class="px-6 py-4 text-center text-sm font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-blue-100">
                    ${orders.map((order, index) => `
                        <tr class="hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}">
                            <td class="px-6 py-4">
                                <div class="font-bold text-blue-800">${order.numeroCommande}</div>
                                <div class="text-xs text-gray-500">${order._id ? order._id.substring(0, 8) : ''}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-semibold text-gray-800">${order.client.prenom} ${order.client.nom}</div>
                                <div class="text-sm text-gray-600">${order.client.telephone}</div>
                                <div class="text-xs text-gray-500">${order.client.wilaya}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-700">${formatDate(order.dateCommande)}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg">
                                    ${order.articles.length} article(s)
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-blue-700 text-lg">${order.total} DA</div>
                            </td>
                            <td class="px-6 py-4">
                                ${getOrderStatusBadge(order.statut)}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex justify-center space-x-2">
                                    <button onclick="viewOrderDetails('${order._id}')" 
                                            class="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all shadow-sm hover:shadow-md" 
                                            title="Voir détails">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="updateOrderStatus('${order._id}')" 
                                            class="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all shadow-sm hover:shadow-md" 
                                            title="Changer statut">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteOrder('${order._id}')" 
                                            class="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all shadow-sm hover:shadow-md" 
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
        <div class="bg-blue-50 px-6 py-4 border-t-2 border-blue-200">
            <p class="text-blue-700 font-semibold">
                <i class="fas fa-shopping-bag mr-2"></i>Total: ${orders.length} commande(s) | 
                <i class="fas fa-coins ml-4 mr-2"></i>Revenus: ${orders.reduce((sum, o) => sum + (o.total || 0), 0)} DA
            </p>
        </div>
    `;
}

function getOrderStatusBadge(status) {
    const statusConfig = {
        'en-attente': { color: 'yellow', icon: 'clock', text: 'En attente' },
        'confirmée': { color: 'blue', icon: 'check', text: 'Confirmée' },
        'préparée': { color: 'purple', icon: 'box', text: 'Préparée' },
        'expédiée': { color: 'indigo', icon: 'truck', text: 'Expédiée' },
        'livrée': { color: 'green', icon: 'check-circle', text: 'Livrée' },
        'annulée': { color: 'red', icon: 'times-circle', text: 'Annulée' }
    };
    
    const config = statusConfig[status] || statusConfig['en-attente'];
    return `
        <span class="inline-flex items-center px-3 py-2 bg-${config.color}-100 text-${config.color}-800 text-sm font-bold rounded-lg">
            <i class="fas fa-${config.icon} mr-2"></i>${config.text}
        </span>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function filterOrders() {
    const search = document.getElementById('orderSearchInput')?.value.toLowerCase() || '';
    const status = document.getElementById('orderStatusFilter')?.value || '';
    const sort = document.getElementById('orderSortFilter')?.value || 'newest';
    
    let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    
    // Apply filters
    if (search) {
        orders = orders.filter(o => 
            o.numeroCommande.toLowerCase().includes(search) ||
            `${o.client.prenom} ${o.client.nom}`.toLowerCase().includes(search) ||
            o.client.telephone.includes(search) ||
            o.client.email.toLowerCase().includes(search)
        );
    }
    
    if (status) {
        orders = orders.filter(o => o.statut === status);
    }
    
    // Apply sorting
    orders.sort((a, b) => {
        switch (sort) {
            case 'oldest':
                return new Date(a.dateCommande) - new Date(b.dateCommande);
            case 'amount_asc':
                return a.total - b.total;
            case 'amount_desc':
                return b.total - a.total;
            default: // newest
                return new Date(b.dateCommande) - new Date(a.dateCommande);
        }
    });
    
    displayOrdersTable(orders);
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
        alert('Commande non trouvée');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'orderDetailsModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-bold">Détails de la commande</h3>
                        <p class="text-blue-100">${order.numeroCommande}</p>
                    </div>
                    <button onclick="this.closest('#orderDetailsModal').remove()" 
                            class="text-white hover:text-blue-200 p-2 hover:bg-white/20 rounded-lg transition-all">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-8 space-y-6">
                <!-- Client Info -->
                <div class="bg-blue-50 rounded-2xl p-6">
                    <h4 class="text-lg font-bold text-blue-800 mb-4"><i class="fas fa-user mr-2"></i>Informations Client</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div><span class="font-semibold">Nom:</span> ${order.client.prenom} ${order.client.nom}</div>
                        <div><span class="font-semibold">Email:</span> ${order.client.email}</div>
                        <div><span class="font-semibold">Téléphone:</span> ${order.client.telephone}</div>
                        <div><span class="font-semibold">Wilaya:</span> ${order.client.wilaya}</div>
                        <div class="col-span-2"><span class="font-semibold">Adresse:</span> ${order.client.adresse}</div>
                    </div>
                </div>
                
                <!-- Articles -->
                <div>
                    <h4 class="text-lg font-bold text-gray-800 mb-4"><i class="fas fa-shopping-bag mr-2"></i>Articles (${order.articles.length})</h4>
                    <div class="space-y-3">
                        ${order.articles.map(article => `
                            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                                <img src="${article.image || 'https://via.placeholder.com/64x64'}" 
                                     alt="${article.nom}" class="w-16 h-16 object-cover rounded-lg">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">${article.nom}</div>
                                    <div class="text-sm text-gray-600">${article.prix} DA × ${article.quantite}</div>
                                </div>
                                <div class="font-bold text-emerald-700">${article.prix * article.quantite} DA</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Totals -->
                <div class="bg-emerald-50 rounded-2xl p-6">
                    <div class="space-y-2">
                        <div class="flex justify-between"><span>Sous-total:</span><span class="font-semibold">${order.sousTotal} DA</span></div>
                        <div class="flex justify-between"><span>Frais de livraison:</span><span class="font-semibold">${order.fraisLivraison} DA</span></div>
                        <div class="flex justify-between text-lg font-bold text-emerald-800 pt-2 border-t-2 border-emerald-200">
                            <span>Total:</span><span>${order.total} DA</span>
                        </div>
                    </div>
                </div>
                
                <!-- Status & Payment -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-xl p-4">
                        <div class="text-sm text-gray-600 mb-1">Statut</div>
                        ${getOrderStatusBadge(order.statut)}
                    </div>
                    <div class="bg-gray-50 rounded-xl p-4">
                        <div class="text-sm text-gray-600 mb-1">Mode de paiement</div>
                        <div class="font-semibold text-gray-800">${order.modePaiement || 'Paiement à la livraison'}</div>
                    </div>
                </div>
                
                ${order.commentaires ? `
                    <div class="bg-yellow-50 rounded-xl p-4">
                        <div class="text-sm font-semibold text-yellow-800 mb-2"><i class="fas fa-comment mr-2"></i>Commentaires</div>
                        <div class="text-gray-700">${order.commentaires}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const order = orders.find(o => o._id === orderId);
    
    if (!order) return;
    
    const modal = document.createElement('div');
    modal.id = 'updateStatusModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-3xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold">Changer le statut</h3>
                    <button onclick="this.closest('#updateStatusModal').remove()" 
                            class="text-white hover:text-green-200 p-2 hover:bg-white/20 rounded-lg transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-green-100 text-sm mt-1">${order.numeroCommande}</p>
            </div>
            
            <form id="statusUpdateForm" class="p-6">
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-3">Nouveau statut</label>
                    <div class="space-y-2">
                        ${['en-attente', 'confirmée', 'préparée', 'expédiée', 'livrée', 'annulée'].map(status => `
                            <label class="flex items-center p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 ${order.statut === status ? 'border-green-500 bg-green-50' : 'border-gray-200'}">
                                <input type="radio" name="statut" value="${status}" ${order.statut === status ? 'checked' : ''}
                                       class="w-4 h-4 text-green-600 focus:ring-green-500">
                                <span class="ml-3 font-semibold text-gray-800">${getStatusText(status)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex space-x-4">
                    <button type="button" onclick="this.closest('#updateStatusModal').remove()"
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all">
                        Annuler
                    </button>
                    <button type="submit"
                            class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
                        <i class="fas fa-check mr-2"></i>Confirmer
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('statusUpdateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newStatus = new FormData(e.target).get('statut');
        await handleOrderStatusUpdate(orderId, newStatus);
        modal.remove();
    });
}

function getStatusText(status) {
    const texts = {
        'en-attente': '⏳ En attente',
        'confirmée': '✓ Confirmée',
        'préparée': '📦 Préparée',
        'expédiée': '🚚 Expédiée',
        'livrée': '✅ Livrée',
        'annulée': '❌ Annulée'
    };
    return texts[status] || status;
}

async function handleOrderStatusUpdate(orderId, newStatus) {
    try {
        // Try API first
        try {
            await apiCall(`/admin/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ statut: newStatus })
            });
            console.log('✅ Order status updated in API');
        } catch (error) {
            console.log('API unavailable, updating localStorage only:', error.message);
        }
        
        // Update localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const orderIndex = orders.findIndex(o => o._id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].statut = newStatus;
            if (newStatus === 'livrée') {
                orders[orderIndex].dateLivraison = new Date().toISOString();
            }
            localStorage.setItem('adminOrders', JSON.stringify(orders));
        }
        
        await loadAndDisplayOrders();
        filterOrders();
        
        if (window.app) {
            window.app.showToast('Statut mis à jour avec succès!', 'success');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        if (window.app) {
            window.app.showToast('Erreur: ' + error.message, 'error');
        }
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    try {
        // Try API first
        try {
            await apiCall(`/admin/orders/${orderId}`, {
                method: 'DELETE'
            });
            console.log('✅ Order deleted from API');
        } catch (error) {
            console.log('API unavailable, deleting from localStorage only:', error.message);
        }
        
        // Delete from localStorage
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        orders = orders.filter(o => o._id !== orderId);
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        await loadAndDisplayOrders();
        filterOrders();
        
        if (window.app) {
            window.app.showToast('Commande supprimée avec succès!', 'success');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        if (window.app) {
            window.app.showToast('Erreur: ' + error.message, 'error');
        }
    }
}

// ============================================================================
// FEATURED MANAGEMENT SECTION
// ============================================================================
async function loadFeaturedManagement() {
    console.log('⭐ Loading Featured Management...');
    
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const featured = products.filter(p => p.enVedette);
    const notFeatured = products.filter(p => !p.enVedette && p.actif !== false);
    
    adminContent.innerHTML = `
        <div class="bg-gradient-to-br from-white/90 to-yellow-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-yellow-200/50 p-8 mb-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-yellow-800 mb-2">Gestion des Coups de Cœur</h2>
                <p class="text-yellow-600">Sélectionnez les produits à mettre en avant sur la page d'accueil</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Featured Products -->
                <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                    <h3 class="text-xl font-bold text-yellow-800 mb-4">
                        <i class="fas fa-star mr-2"></i>Produits en vedette (${featured.length})
                    </h3>
                    <div class="space-y-3 max-h-[600px] overflow-y-auto">
                        ${featured.length === 0 ? `
                            <div class="text-center py-8 text-yellow-600">
                                <i class="fas fa-star text-4xl mb-3 opacity-30"></i>
                                <p>Aucun produit en vedette</p>
                            </div>
                        ` : featured.map(p => `
                            <div class="flex items-center space-x-4 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                                <img src="${getProductImage(p)}" alt="${p.nom}" class="w-12 h-12 object-cover rounded-lg">
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-gray-800 truncate">${p.nom}</div>
                                    <div class="text-sm text-gray-600">${p.prix} DA</div>
                                </div>
                                <button onclick="toggleFeatured('${p._id}')" 
                                        class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-semibold">
                                    <i class="fas fa-times mr-1"></i>Retirer
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Available Products -->
                <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-box mr-2"></i>Produits disponibles (${notFeatured.length})
                    </h3>
                    <div class="mb-4">
                        <input type="text" id="featuredSearchInput" placeholder="Rechercher..." 
                               class="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all"
                               oninput="filterFeaturedProducts()">
                    </div>
                    <div id="availableProductsList" class="space-y-3 max-h-[500px] overflow-y-auto">
                        ${notFeatured.map(p => `
                            <div class="available-product flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors" data-name="${p.nom.toLowerCase()}">
                                <img src="${getProductImage(p)}" alt="${p.nom}" class="w-12 h-12 object-cover rounded-lg">
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-gray-800 truncate">${p.nom}</div>
                                    <div class="text-sm text-gray-600">${p.prix} DA • ${p.categorie}</div>
                                </div>
                                <button onclick="toggleFeatured('${p._id}')" 
                                        class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all text-sm font-semibold">
                                    <i class="fas fa-star mr-1"></i>Ajouter
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function filterFeaturedProducts() {
    const search = document.getElementById('featuredSearchInput')?.value.toLowerCase() || '';
    const products = document.querySelectorAll('.available-product');
    
    products.forEach(product => {
        const name = product.dataset.name;
        if (name.includes(search)) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
}

async function toggleFeatured(productId) {
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const product = products.find(p => p._id === productId);
        
        if (product) {
            product.enVedette = !product.enVedette;
            
            // Try API
            try {
                await apiCall(`/admin/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ enVedette: product.enVedette })
                });
            } catch (error) {
                console.log('API unavailable:', error.message);
            }
            
            // Save to localStorage
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            // Refresh
            await loadFeaturedManagement();
            
            // Refresh app cache
            if (window.app && typeof window.app.refreshProductsCache === 'function') {
                window.app.refreshProductsCache();
            }
            
            if (window.app) {
                window.app.showToast(
                    product.enVedette ? 'Produit ajouté aux coups de cœur!' : 'Produit retiré des coups de cœur!',
                    'success'
                );
            }
        }
    } catch (error) {
        console.error('Error toggling featured:', error);
    }
}

// ============================================================================
// CLEANUP SECTION
// ============================================================================
async function loadCleanupSection() {
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const inactiveProducts = products.filter(p => p.actif === false);
    
    adminContent.innerHTML = `
        <div class="bg-gradient-to-br from-white/90 to-red-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 p-8 mb-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-red-800 mb-2">
                    <i class="fas fa-broom mr-3"></i>Nettoyage
                </h2>
                <p class="text-red-600">Supprimez les produits indésirables ou inactifs</p>
            </div>
            
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
                <div class="flex items-start space-x-4">
                    <i class="fas fa-exclamation-triangle text-3xl text-yellow-600"></i>
                    <div>
                        <h3 class="text-lg font-bold text-yellow-800 mb-2">Attention</h3>
                        <p class="text-yellow-700">La suppression de produits est irréversible. Assurez-vous de bien vouloir supprimer ces éléments.</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    Produits inactifs (${inactiveProducts.length})
                </h3>
                
                ${inactiveProducts.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-check-circle text-5xl mb-4 text-green-400"></i>
                        <p class="font-semibold">Aucun produit inactif</p>
                        <p class="text-sm">Tout est en ordre!</p>
                    </div>
                ` : `
                    <div class="space-y-3 mb-6">
                        ${inactiveProducts.map(p => `
                            <div class="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
                                <img src="${getProductImage(p)}" alt="${p.nom}" class="w-16 h-16 object-cover rounded-lg">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">${p.nom}</div>
                                    <div class="text-sm text-gray-600">${p.categorie} • ${p.prix} DA</div>
                                </div>
                                <button onclick="deleteProduct('${p._id}')" 
                                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold">
                                    <i class="fas fa-trash mr-2"></i>Supprimer
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button onclick="deleteAllInactive()" 
                            class="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg">
                        <i class="fas fa-trash-alt mr-2"></i>Supprimer tous les produits inactifs (${inactiveProducts.length})
                    </button>
                `}
            </div>
        </div>
    `;
}

async function deleteAllInactive() {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const inactiveProducts = products.filter(p => p.actif === false);
    
    if (inactiveProducts.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${inactiveProducts.length} produit(s) inactif(s) ? Cette action est irréversible.`)) {
        return;
    }
    
    try {
        // Try API deletion
        for (const product of inactiveProducts) {
            try {
                await apiCall(`/admin/products/${product._id}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.log('API unavailable for product:', product._id);
            }
        }
        
        // Delete from localStorage
        const activeProducts = products.filter(p => p.actif !== false);
        localStorage.setItem('demoProducts', JSON.stringify(activeProducts));
        
        // Refresh
        await loadCleanupSection();
        
        // Refresh app cache
        if (window.app && typeof window.app.refreshProductsCache === 'function') {
            window.app.refreshProductsCache();
        }
        
        if (window.app) {
            window.app.showToast(`${inactiveProducts.length} produit(s) supprimé(s) avec succès!`, 'success');
        }
    } catch (error) {
        console.error('Error deleting inactive products:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression: ' + error.message, 'error');
        }
    }
}

// ============================================================================
// EXPORT GLOBAL FUNCTIONS
// ============================================================================
window.switchAdminSection = switchAdminSection;
window.loadProductsManagement = loadProductsManagement;
window.filterProducts = filterProducts;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleProductStatus = toggleProductStatus;
window.togglePromotionFields = togglePromotionFields;
window.closeProductModal = closeProductModal;
window.loadOrdersManagement = loadOrdersManagement;
window.filterOrders = filterOrders;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.loadFeaturedManagement = loadFeaturedManagement;
window.filterFeaturedProducts = filterFeaturedProducts;
window.toggleFeatured = toggleFeatured;
window.loadCleanupSection = loadCleanupSection;
window.deleteAllInactive = deleteAllInactive;

console.log('✅ Complete Admin System Loaded Successfully');
