// Complete Cart Management System - Built from scratch

// Demo products for fallback
const DEMO_PRODUCTS = [
    { _id: '1', nom: 'Multivitamines VitalForce', prix: 2800, stock: 50, categorie: 'Vitalité', description: 'Complexe de vitamines et minéraux' },
    { _id: '2', nom: 'Shampoing Anti-Chute L\'Oréal', prix: 2500, stock: 25, categorie: 'Cheveux', description: 'Shampoing fortifiant' },
    { _id: '3', nom: 'Crème Hydratante Visage Avène', prix: 3200, stock: 30, categorie: 'Visage', description: 'Crème hydratante apaisante' },
    { _id: '4', nom: 'Lait Nettoyant Bébé Mustela', prix: 1800, stock: 20, categorie: 'Bébé', description: 'Lait nettoyant doux' },
    { _id: '5', nom: 'Crème Solaire SPF 50+ La Roche Posay', prix: 4500, stock: 15, categorie: 'Solaire', description: 'Protection solaire très haute' },
    { _id: '6', nom: 'Dentifrice Sensodyne Protection Complète', prix: 950, stock: 40, categorie: 'Dentaire', description: 'Dentifrice pour dents sensibles' },
    { _id: '7', nom: 'Gel Nettoyant Intime Saforelle', prix: 1600, stock: 22, categorie: 'Intime', description: 'Gel doux pour hygiène intime' },
    { _id: '8', nom: 'Gel Douche Homme Vichy', prix: 1400, stock: 18, categorie: 'Homme', description: 'Gel douche hydratant' }
];

// Add to cart functionality
PharmacieGaherApp.prototype.addToCart = async function(productId, quantity = 1) {
    try {
        console.log('Adding to cart:', productId, quantity);
        
        // Get product data
        let product = await this.getProductById(productId);
        if (!product) {
            throw new Error('Produit non trouvé');
        }
        
        // Validate stock
        if (product.stock === 0) {
            this.showToast('Ce produit est en rupture de stock', 'error');
            return false;
        }
        
        if (quantity > product.stock) {
            this.showToast(`Stock insuffisant. Maximum disponible: ${product.stock}`, 'error');
            return false;
        }
        
        // Generate image URL
        const imageUrl = this.generateProductImageUrl(product);
        
        // Check if product already in cart
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            const newQuantity = this.cart[existingIndex].quantite + quantity;
            
            if (newQuantity > product.stock) {
                this.showToast(`Stock insuffisant. Maximum disponible: ${product.stock}`, 'error');
                return false;
            }
            
            this.cart[existingIndex].quantite = newQuantity;
        } else {
            // Add new cart item
            const cartItem = {
                id: product._id,
                nom: product.nom,
                prix: product.prix,
                image: imageUrl,
                quantite: quantity,
                stock: product.stock,
                categorie: product.categorie,
                description: product.description
            };
            
            this.cart.push(cartItem);
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showToast(`${product.nom} ajouté au panier`, 'success');
        return true;
        
    } catch (error) {
        console.error('Erreur ajout au panier:', error);
        this.showToast(error.message || 'Erreur lors de l\'ajout au panier', 'error');
        return false;
    }
};

// Get product by ID (with fallback to demo products)
PharmacieGaherApp.prototype.getProductById = async function(productId) {
    try {
        // Try API first
        const response = await fetch(buildApiUrl(`/products/${productId}`));
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('API unavailable, using demo products');
    }
    
    // Fallback to demo products
    let product = DEMO_PRODUCTS.find(p => p._id === productId);
    
    // Also check admin demo products if available
    if (!product && window.getDemoProducts) {
        const adminProducts = window.getDemoProducts();
        product = adminProducts.find(p => p._id === productId);
    }
    
    return product;
};

// Generate product image URL
PharmacieGaherApp.prototype.generateProductImageUrl = function(product) {
    if (product.image && product.image.startsWith('http')) {
        return product.image;
    } else if (product.image) {
        return `./images/products/${product.image}`;
    } else {
        const getCategoryColor = (category) => {
            const colors = {
                'Vitalité': '10b981', 'Cheveux': 'f59e0b', 'Visage': 'ec4899',
                'Intime': 'ef4444', 'Solaire': 'f97316', 'Bébé': '06b6d4',
                'Maman': 'd946ef', 'Minceur': '8b5cf6', 'Homme': '3b82f6',
                'Soins': '22c55e', 'Dentaire': '6366f1'
            };
            return colors[category] || '10b981';
        };
        
        const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const categoryColor = getCategoryColor(product.categorie);
        return `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }
};

// Update cart UI
PharmacieGaherApp.prototype.updateCartUI = function() {
    this.updateCartCount();
    this.updateCartSidebar();
};

// Update cart count
PharmacieGaherApp.prototype.updateCartCount = function() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.classList.remove('hidden');
            cartCount.classList.add('pulse');
        } else {
            cartCount.classList.remove('pulse');
        }
    }
};

// Update cart sidebar
PharmacieGaherApp.prototype.updateCartSidebar = function() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItems) return;
    
    if (this.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-emerald-600 text-center py-12">
                <i class="fas fa-shopping-cart text-6xl mb-6 opacity-30"></i>
                <p class="text-xl font-medium mb-2">Votre panier est vide</p>
                <p class="text-emerald-500 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
                <button onclick="app.showPage('products'); toggleCart();" 
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fas fa-shopping-bag mr-2"></i>Voir nos produits
                </button>
            </div>
        `;
        if (cartSummary) cartSummary.classList.add('hidden');
        return;
    }
    
    cartItems.innerHTML = this.cart.map(item => `
        <div class="bg-white/60 border border-emerald-200/50 rounded-xl p-4 mb-4 hover:shadow-lg transition-all cart-item">
            <div class="flex items-center space-x-3">
                <img src="${item.image}" alt="${item.nom}" 
                     class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-emerald-800 text-sm line-clamp-2">${item.nom}</h4>
                    <p class="text-sm text-emerald-600 mt-1">${item.prix} DA</p>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-2">
                            <div class="flex items-center border-2 border-emerald-200 rounded-lg bg-white overflow-hidden">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite - 1})" 
                                        class="px-3 py-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <input type="number" value="${item.quantite}" min="1" max="${item.stock}"
                                       onchange="app.updateCartQuantity('${item.id}', parseInt(this.value))"
                                       class="w-12 text-center py-1 border-0 text-sm focus:ring-0">
                                <button onclick="app.updateCartQuantity('${item.id}', ${item.quantite + 1})" 
                                        class="px-3 py-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <button onclick="app.removeFromCart('${item.id}')" 
                                class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                    <p class="text-sm font-medium text-emerald-800 mt-1">
                        Total: ${item.quantite * item.prix} DA
                    </p>
                </div>
            </div>
        </div>
    `).join('');
    
    this.updateCartTotals();
    if (cartSummary) cartSummary.classList.remove('hidden');
};

// Update cart totals
PharmacieGaherApp.prototype.updateCartTotals = async function() {
    const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    
    // Get shipping costs
    let fraisLivraison = 300; // Default
    let livraisonGratuite = 5000; // Default
    
    try {
        const response = await fetch(buildApiUrl('/settings/shipping'));
        if (response.ok) {
            const shippingInfo = await response.json();
            fraisLivraison = shippingInfo.fraisLivraison || 300;
            livraisonGratuite = shippingInfo.livraisonGratuite || 5000;
        }
    } catch (error) {
        console.log('Using default shipping rates');
    }
    
    const actualShippingCost = sousTotal >= livraisonGratuite ? 0 : fraisLivraison;
    const total = sousTotal + actualShippingCost;
    
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartSubtotal) cartSubtotal.textContent = `${sousTotal} DA`;
    if (cartShipping) {
        cartShipping.textContent = actualShippingCost === 0 ? 'Gratuit' : `${actualShippingCost} DA`;
        if (actualShippingCost === 0) {
            cartShipping.classList.add('text-green-600', 'font-semibold');
        } else {
            cartShipping.classList.remove('text-green-600', 'font-semibold');
        }
    }
    if (cartTotal) cartTotal.textContent = `${total} DA`;
    
    // Update free shipping progress
    this.updateFreeShippingProgress(sousTotal, livraisonGratuite);
};

// Update free shipping progress
PharmacieGaherApp.prototype.updateFreeShippingProgress = function(sousTotal, livraisonGratuite) {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems || this.cart.length === 0) return;
    
    let progressContainer = document.getElementById('freeShippingProgress');
    
    if (!progressContainer) {
        const cartSummary = document.getElementById('cartSummary');
        if (cartSummary) {
            const progressHTML = `
                <div id="freeShippingProgress" class="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                </div>
            `;
            cartSummary.insertAdjacentHTML('afterbegin', progressHTML);
            progressContainer = document.getElementById('freeShippingProgress');
        }
    }
    
    if (progressContainer) {
        const remaining = livraisonGratuite - sousTotal;
        const progress = Math.min((sousTotal / livraisonGratuite) * 100, 100);
        
        if (sousTotal >= livraisonGratuite) {
            progressContainer.innerHTML = `
                <div class="flex items-center text-green-700">
                    <i class="fas fa-check-circle text-green-600 mr-2"></i>
                    <span class="font-semibold">Félicitations ! Livraison gratuite obtenue</span>
                </div>
            `;
        } else {
            progressContainer.innerHTML = `
                <div class="text-emerald-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium">Livraison gratuite</span>
                        <span class="text-sm font-semibold">${remaining} DA restants</span>
                    </div>
                    <div class="w-full bg-emerald-200 rounded-full h-2">
                        <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }
    }
};

// Update cart quantity
PharmacieGaherApp.prototype.updateCartQuantity = function(productId, newQuantity) {
    const itemIndex = this.cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
        this.showToast('Article non trouvé dans le panier', 'error');
        return;
    }
    
    if (newQuantity <= 0) {
        this.removeFromCart(productId);
        return;
    }
    
    const item = this.cart[itemIndex];
    
    if (newQuantity > item.stock) {
        this.showToast(`Stock insuffisant. Maximum disponible: ${item.stock}`, 'error');
        // Reset the input to the current quantity
        const input = document.querySelector(`input[onchange*="${productId}"]`);
        if (input) input.value = item.quantite;
        return;
    }
    
    item.quantite = newQuantity;
    this.saveCart();
    this.updateCartUI();
};

// Remove from cart
PharmacieGaherApp.prototype.removeFromCart = function(productId) {
    const itemIndex = this.cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        const item = this.cart[itemIndex];
        
        // Animate removal
        const cartItemElement = document.querySelector(`[onclick*="removeFromCart('${productId}')"]`)?.closest('.cart-item');
        if (cartItemElement) {
            cartItemElement.style.opacity = '0';
            cartItemElement.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                this.cart.splice(itemIndex, 1);
                this.saveCart();
                this.updateCartUI();
                this.showToast(`${item.nom} retiré du panier`, 'success');
            }, 300);
        } else {
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartUI();
            this.showToast(`${item.nom} retiré du panier`, 'success');
        }
    }
};

// Clear cart
PharmacieGaherApp.prototype.clearCart = function(skipConfirmation = false) {
    if (!skipConfirmation && this.cart.length > 0) {
        if (!confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            return;
        }
    }
    
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
    if (!skipConfirmation) {
        this.showToast('Panier vidé', 'success');
    }
};

// Save cart to localStorage
PharmacieGaherApp.prototype.saveCart = function() {
    try {
        // Validate cart items before saving
        this.cart = this.cart.filter(item => 
            item && item.id && item.nom && item.prix && item.quantite > 0
        );
        localStorage.setItem('cart', JSON.stringify(this.cart));
    } catch (error) {
        console.error('Erreur sauvegarde panier:', error);
        this.showToast('Erreur lors de la sauvegarde du panier', 'error');
    }
};

// Get cart total
PharmacieGaherApp.prototype.getCartTotal = function() {
    return this.cart.reduce((total, item) => {
        return total + ((item.prix || 0) * (item.quantite || 0));
    }, 0);
};

// Get cart item count
PharmacieGaherApp.prototype.getCartItemCount = function() {
    return this.cart.reduce((count, item) => {
        return count + (item.quantite || 0);
    }, 0);
};

// Get cart summary
PharmacieGaherApp.prototype.getCartSummary = function() {
    const subtotal = this.getCartTotal();
    const itemCount = this.getCartItemCount();
    
    return {
        items: this.cart.length,
        totalItems: itemCount,
        subtotal: subtotal,
        isEmpty: this.cart.length === 0
    };
};

// Validate cart items
PharmacieGaherApp.prototype.validateCart = async function() {
    let hasChanges = false;
    const updatedCart = [];
    
    for (let item of this.cart) {
        try {
            const currentProduct = await this.getProductById(item.id);
            
            if (!currentProduct || !currentProduct.actif) {
                this.showToast(`${item.nom} n'est plus disponible et a été retiré du panier`, 'warning');
                hasChanges = true;
                continue;
            }
            
            if (currentProduct.stock === 0) {
                this.showToast(`${item.nom} est en rupture de stock et a été retiré du panier`, 'warning');
                hasChanges = true;
                continue;
            }
            
            if (item.quantite > currentProduct.stock) {
                item.quantite = currentProduct.stock;
                this.showToast(`Quantité de ${item.nom} ajustée selon le stock disponible`, 'warning');
                hasChanges = true;
            }
            
            if (item.prix !== currentProduct.prix) {
                item.prix = currentProduct.prix;
                hasChanges = true;
            }
            
            updatedCart.push(item);
            
        } catch (error) {
            console.error('Erreur validation produit:', error);
            updatedCart.push(item);
        }
    }
    
    if (hasChanges) {
        this.cart = updatedCart;
        this.saveCart();
        this.updateCartUI();
    }
    
    return !hasChanges;
};

// Global functions for cart operations
function addToCartFromCard(productId, quantity = 1) {
    console.log('Add to cart from card called:', productId);
    if (window.app && typeof window.app.addToCart === 'function') {
        window.app.addToCart(productId, quantity);
    } else {
        console.error('App not available');
    }
}

function updateCartQuantity(productId, quantity) {
    if (window.app) {
        window.app.updateCartQuantity(productId, quantity);
    }
}

function removeFromCart(productId) {
    if (window.app) {
        window.app.removeFromCart(productId);
    }
}

function clearCart(skipConfirmation = false) {
    if (window.app) {
        window.app.clearCart(skipConfirmation);
    }
}

function validateCart() {
    if (window.app) {
        return window.app.validateCart();
    }
    return false;
}