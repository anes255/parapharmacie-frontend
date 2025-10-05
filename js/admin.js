// DEBUG VERSION - Admin Panel with Detailed Logging

let adminCurrentSection = 'dashboard';
let currentEditingProduct = null;
let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://parapharmacie-gaher.onrender.com/api';

function buildApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

async function apiCall(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const token = localStorage.getItem('token');
    console.log('🔑 Token available:', !!token);
    
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
    
    console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
    console.log('📦 Request options:', finalOptions);
    
    try {
        const response = await fetch(url, finalOptions);
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error:', errorText);
            
            let error;
            try {
                error = JSON.parse(errorText);
            } catch {
                error = { message: `HTTP error! status: ${response.status}` };
            }
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Response data:', data);
        return data;
        
    } catch (error) {
        console.error('❌ API Call failed:', error);
        throw error;
    }
}

// DELETE PRODUCT - WITH DEBUG
async function deleteProduct(productId) {
    console.log('🗑️ DELETE PRODUCT CALLED');
    console.log('Product ID:', productId);
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        console.log('❌ User cancelled deletion');
        return;
    }
    
    try {
        console.log('▶️ Starting deletion process...');
        console.log('Step 1: Calling DELETE /admin/products/' + productId);
        
        const result = await apiCall(`/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ API DELETE successful:', result);
        console.log('Step 2: Reloading products from API...');
        
        const data = await apiCall('/products?limit=1000');
        if (data && data.products) {
            console.log('✅ Reloaded products:', data.products.length);
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
        }
        
        if (window.app) {
            console.log('Step 3: Refreshing app cache...');
            window.app.refreshProductsCache();
        }
        
        console.log('✅ Product deletion complete!');
        app.showToast('Produit supprimé avec succès', 'success');
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        } else if (adminCurrentSection === 'featured') {
            app.loadAdminFeatured();
        }
        
    } catch (error) {
        console.error('❌ DELETE FAILED:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        app.showToast(`Erreur de suppression: ${error.message}`, 'error');
    }
}

// EDIT PRODUCT - WITH DEBUG
async function openEditProductModal(productId) {
    console.log('✏️ EDIT PRODUCT CALLED');
    console.log('Product ID:', productId);
    
    try {
        console.log('Step 1: Loading product from API...');
        
        let product = null;
        
        try {
            const data = await apiCall('/admin/products?limit=1000');
            console.log('✅ Got products from API:', data.products?.length);
            
            if (data && data.products) {
                product = data.products.find(p => p._id === productId);
                console.log('Product found:', !!product);
                if (product) {
                    console.log('Product details:', product);
                }
            }
        } catch (error) {
            console.log('⚠️ API unavailable, trying localStorage');
            const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            product = localProducts.find(p => p._id === productId);
        }
        
        if (!product) {
            console.error('❌ Product not found!');
            app.showToast('Produit non trouvé', 'error');
            return;
        }
        
        console.log('Step 2: Setting currentEditingProduct...');
        currentEditingProduct = product;
        
        console.log('Step 3: Showing modal...');
        showProductModal('Modifier le produit', 'Modifier le produit');
        
        console.log('Step 4: Filling form with product data...');
        setTimeout(() => {
            fillProductForm(product);
            console.log('✅ Form filled successfully');
        }, 100);
        
    } catch (error) {
        console.error('❌ EDIT FAILED:', error);
        console.error('Error message:', error.message);
        app.showToast('Erreur lors du chargement du produit', 'error');
    }
}

function showProductModal(title, submitText) {
    console.log('📋 Creating product modal...');
    
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
                            <button type="button" onclick="closeProductModal()" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                                Annuler
                            </button>
                            <button type="button" onclick="saveProduct()" id="productSubmitBtn" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700">
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
    console.log('✅ Modal created');
}

function fillProductForm(product) {
    console.log('📝 Filling form with product data:', product);
    
    try {
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
        
        console.log('✅ Form filled successfully');
    } catch (error) {
        console.error('❌ Error filling form:', error);
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
    currentEditingProduct = null;
}

async function saveProduct() {
    console.log('💾 SAVE PRODUCT CALLED');
    const isEditing = !!currentEditingProduct;
    console.log('Is editing:', isEditing);
    console.log('Current product:', currentEditingProduct);
    
    // Get form values
    const nom = document.getElementById('productNom').value.trim();
    const prix = document.getElementById('productPrix').value;
    const stock = document.getElementById('productStock').value;
    const categorie = document.getElementById('productCategorie').value;
    const description = document.getElementById('productDescription').value.trim();
    
    console.log('Form values:', { nom, prix, stock, categorie, description });
    
    if (!nom || !prix || !stock || !categorie || !description) {
        console.error('❌ Validation failed - missing required fields');
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
        }
        
        const imageUrl = document.getElementById('productImageUrl').value;
        if (imageUrl) {
            productData.image = imageUrl;
        }
        
        console.log('Product data to save:', productData);
        
        const productId = document.getElementById('productId').value;
        const endpoint = isEditing ? `/admin/products/${productId}` : '/admin/products';
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log(`Calling API: ${method} ${endpoint}`);
        
        const result = await apiCall(endpoint, {
            method: method,
            body: JSON.stringify(productData)
        });
        
        console.log('✅ Save successful:', result);
        
        // Refresh from API
        const data = await apiCall('/products?limit=1000');
        if (data && data.products) {
            localStorage.setItem('demoProducts', JSON.stringify(data.products));
        }
        
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
        app.showToast(isEditing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
        closeProductModal();
        
        if (adminCurrentSection === 'products') {
            app.loadAdminProducts();
        }
        
    } catch (error) {
        console.error('❌ SAVE FAILED:', error);
        app.showToast(`Erreur: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

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

// Export functions
window.deleteProduct = deleteProduct;
window.openEditProductModal = openEditProductModal;
window.saveProduct = saveProduct;
window.closeProductModal = closeProductModal;
window.previewImage = previewImage;

console.log('✅ DEBUG Admin.js loaded - Check console for detailed logs');
