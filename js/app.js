// ============================================================================
// ADMIN.JS - Fixed with API sync and proper cache refresh
// ============================================================================

// UTILITY: Generate placeholder image using canvas
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

// UTILITY: Preview uploaded image
function previewImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        if (window.app) {
            window.app.showToast('Image trop volumineuse. Maximum 2MB', 'error');
        }
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

// Switch between admin sections
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
            if (window.app) {
                window.app.loadAdminDashboard();
            }
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

// Load Admin Products Section
function loadAdminProducts() {
    const adminContent = document.getElementById('adminContent');
    const products = window.app.allProducts;
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-emerald-800">Gestion des Produits</h2>
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
                            <tr class="border-b border-emerald-100 hover:bg-emerald-50">
                                <td class="px-4 py-3">
                                    <img src="${imageUrl}" 
                                         alt="${product.nom}" 
                                         class="w-12 h-12 object-cover rounded-lg">
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
                                    <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Product Modal -->
        <div id="addProductModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-bold">
                            <i class="fas fa-plus-circle mr-2"></i>
                            Ajouter un produit
                        </h3>
                        <button onclick="closeAddProductModal()" class="text-white hover:text-gray-200">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <form id="addProductForm" onsubmit="handleAddProduct(event)" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
                        <input type="text" id="productNom" required class="form-input" placeholder="Ex: Vitamine C 1000mg">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea id="productDescription" rows="3" class="form-input" placeholder="Description du produit"></textarea>
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
                            <input type="text" id="productMarque" class="form-input" placeholder="Ex: Bioderma">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (DA) *</label>
                            <input type="number" id="productPrix" required min="0" class="form-input" placeholder="1500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                            <input type="number" id="productStock" required min="0" class="form-input" placeholder="50">
                        </div>
                    </div>
                    
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
                                        <input type="file" id="productImageUpload" accept="image/*" class="hidden" onchange="previewImage(this)">
                                    </label>
                                </div>
                                <div class="text-sm text-gray-500">
                                    <p>Formats acceptés: JPG, PNG, GIF</p>
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
                                <input type="number" id="productPrixOriginal" min="0" class="form-input" placeholder="2000">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">% de réduction</label>
                                <input type="number" id="productPourcentagePromotion" min="0" max="100" class="form-input" placeholder="25">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-4 pt-4">
                        <button type="submit" class="btn-primary flex-1">
                            <i class="fas fa-save mr-2"></i>
                            Ajouter le produit
                        </button>
                        <button type="button" onclick="closeAddProductModal()" class="btn-secondary flex-1">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
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
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('addProductForm').reset();
        document.getElementById('promotionFields').classList.add('hidden');
        
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        if (preview && placeholder) {
            preview.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    }
}

// FIXED: Add product to BOTH API and localStorage, then refresh cache
async function handleAddProduct(event) {
    event.preventDefault();
    
    if (!window.app || !window.app.currentUser) {
        window.app.showToast('Vous devez être connecté', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    
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
        // Try API first
        const response = await fetch(buildApiUrl('/products'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(productData)
        });
        
        let newProduct;
        
        if (response.ok) {
            const data = await response.json();
            newProduct = data.product;
            console.log('✅ Product added to API:', newProduct);
        } else {
            // API failed, create local product
            newProduct = {
                ...productData,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            console.log('⚠️ API failed, creating local product');
        }
        
        // CRITICAL: Add to localStorage
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        localProducts.push(newProduct);
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        // CRITICAL: Refresh app cache to update main page
        window.app.refreshProductsCache();
        
        window.app.showToast('Produit ajouté avec succès !', 'success');
        closeAddProductModal();
        loadAdminProducts();
        
    } catch (error) {
        console.error('Error adding product:', error);
        
        // Fallback: create local product
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const newProduct = {
            ...productData,
            _id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        localProducts.push(newProduct);
        localStorage.setItem('demoProducts', JSON.stringify(localProducts));
        
        // CRITICAL: Refresh app cache
        window.app.refreshProductsCache();
        
        window.app.showToast('Produit ajouté localement', 'warning');
        closeAddProductModal();
        loadAdminProducts();
    }
}

// FIXED: Delete product from BOTH API and localStorage, then refresh cache
async function deleteProduct(productId) {
    if (!confirm('Supprimer ce produit ?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        // Try API delete first
        if (token) {
            await fetch(buildApiUrl(`/products/${productId}`), {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });
            console.log('✅ Product deleted from API');
        }
    } catch (error) {
        console.log('⚠️ API delete failed, continuing with local delete');
    }
    
    // CRITICAL: Delete from localStorage
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const filtered = products.filter(p => p._id !== productId);
    localStorage.setItem('demoProducts', JSON.stringify(filtered));
    
    // CRITICAL: Refresh app cache to update main page
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast('Produit supprimé', 'success');
        loadAdminProducts();
    }
}

function editProduct(productId) {
    window.app.showToast('Fonctionnalité en cours de développement', 'info');
}

// Load Orders Section
function loadAdminOrders() {
    const adminContent = document.getElementById('adminContent');
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-200">
            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Gestion des Commandes</h2>
            
            ${orders.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Aucune commande</h3>
                    <p class="text-gray-500">Les commandes apparaîtront ici</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${orders.reverse().map((order, index) => `
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
                                        <button onclick="deleteOrder(${index})" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
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

function deleteOrder(orderIndex) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const reversedOrders = [...orders].reverse();
    reversedOrders.splice(orderIndex, 1);
    const ordersBackToNormal = reversedOrders.reverse();
    localStorage.setItem('adminOrders', JSON.stringify(ordersBackToNormal));
    
    if (window.app) {
        window.app.showToast('Commande supprimée avec succès', 'success');
    }
    
    loadAdminOrders();
}

// Load Featured Products Section
function loadAdminFeatured() {
    const adminContent = document.getElementById('adminContent');
    const products = window.app.allProducts;
    const featuredProducts = products.filter(p => p.enVedette);
    
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
                    <div class="border-2 border-emerald-200 rounded-xl p-4 relative">
                        <img src="${imageUrl}" 
                             alt="${product.nom}" 
                             class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" 
                                class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
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
                        <img src="${imageUrl}" 
                             alt="${product.nom}" 
                             class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="font-bold text-emerald-800 mb-2">${product.nom}</h3>
                        <p class="text-emerald-700 font-semibold mb-4">${product.prix} DA</p>
                        <button onclick="toggleFeatured('${product._id}')" 
                                class="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">
                            <i class="fas fa-star mr-2"></i>Mettre en vedette
                        </button>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
}

function toggleFeatured(productId) {
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const productIndex = products.findIndex(p => p._id === productId);
    
    if (productIndex > -1) {
        products[productIndex].enVedette = !products[productIndex].enVedette;
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.refreshProductsCache();
            loadAdminFeatured();
            window.app.showToast('Produit mis à jour', 'success');
        }
    }
}

// Load Cleanup Section
function loadAdminCleanup() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <h2 class="text-2xl font-bold text-red-800 mb-6">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Zone de Nettoyage
            </h2>
            
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-red-800 mb-4">⚠️ Attention</h3>
                <p class="text-red-700 mb-4">
                    Cette section permet de supprimer en masse les produits indésirables. 
                    Ces actions sont <strong>irréversibles</strong>.
                </p>
            </div>
            
            <div class="space-y-4">
                <div class="border-2 border-gray-200 rounded-xl p-6">
                    <h4 class="font-bold text-gray-800 mb-3">Supprimer les produits en rupture de stock</h4>
                    <p class="text-gray-600 mb-4">Supprime tous les produits avec un stock de 0</p>
                    <button onclick="cleanupOutOfStock()" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
                    </button>
                </div>
                
                <div class="border-2 border-gray-200 rounded-xl p-6">
                    <h4 class="font-bold text-gray-800 mb-3">Supprimer les produits inactifs</h4>
                    <p class="text-gray-600 mb-4">Supprime tous les produits marqués comme inactifs</p>
                    <button onclick="cleanupInactive()" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
                    </button>
                </div>
                
                <div class="border-2 border-red-300 rounded-xl p-6 bg-red-50">
                    <h4 class="font-bold text-red-800 mb-3">⚠️ Réinitialiser tous les produits</h4>
                    <p class="text-red-700 mb-4">
                        <strong>DANGER:</strong> Supprime TOUS les produits de la base de données
                    </p>
                    <button onclick="confirmResetAllProducts()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                        <i class="fas fa-trash-alt mr-2"></i>Tout réinitialiser
                    </button>
                </div>
            </div>
        </div>
    `;
}

function cleanupOutOfStock() {
    if (!confirm('Supprimer tous les produits en rupture de stock ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const filtered = products.filter(p => p.stock > 0);
    
    localStorage.setItem('demoProducts', JSON.stringify(filtered));
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast(`${products.length - filtered.length} produits supprimés`, 'success');
        loadAdminCleanup();
    }
}

function cleanupInactive() {
    if (!confirm('Supprimer tous les produits inactifs ?')) return;
    
    const products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    const filtered = products.filter(p => p.actif !== false);
    
    localStorage.setItem('demoProducts', JSON.stringify(filtered));
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast(`${products.length - filtered.length} produits supprimés`, 'success');
        loadAdminCleanup();
    }
}

function confirmResetAllProducts() {
    if (!confirm('⚠️ ATTENTION: Voulez-vous vraiment supprimer TOUS les produits ? Cette action est IRRÉVERSIBLE !')) return;
    if (!confirm('Dernière confirmation: Êtes-vous ABSOLUMENT sûr ?')) return;
    
    localStorage.setItem('demoProducts', '[]');
    
    if (window.app) {
        window.app.refreshProductsCache();
        window.app.showToast('Tous les produits ont été supprimés', 'success');
        switchAdminSection('dashboard');
    }
}

console.log('✅ Admin.js loaded - Fixed with API sync and cache refresh!');
