// Enhanced Shopping Cart Management for Shifa Parapharmacie
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.settings = {
            freeShippingThreshold: APP_CONFIG.ECOMMERCE.FREE_SHIPPING_THRESHOLD,
            standardShippingCost: APP_CONFIG.ECOMMERCE.STANDARD_SHIPPING_COST,
            currency: APP_CONFIG.ECOMMERCE.CURRENCY
        };
        
        console.log('🛒 CartManager initialized');
        this.updateCartDisplay();
    }
    
    // Add item to cart
    async addToCart(productId, quantity = 1, options = {}) {
        try {
            console.log('🛒 Adding to cart:', { productId, quantity, options });
            
            // Find product
            const product = this.findProductById(productId);
            if (!product) {
                throw new Error('Produit non trouvé');
            }
            
            // Validate stock
            if (!this.validateStock(product, quantity)) {
                return false;
            }
            
            // Check if item already in cart
            const existingItemIndex = this.cart.findIndex(item => item.id === productId);
            
            if (existingItemIndex > -1) {
                return this.updateCartItemQuantity(existingItemIndex, 
                    this.cart[existingItemIndex].quantite + quantity);
            }
            
            // Create new cart item
            const cartItem = this.createCartItem(product, quantity, options);
            this.cart.push(cartItem);
            
            this.saveCart();
            this.updateCartDisplay();
            
            // Show success notification
            this.showCartNotification(`${product.nom} ajouté au panier`, 'success', product);
            
            // Trigger cart updated event
            this.dispatchCartEvent('cart:item-added', { item: cartItem, cart: this.cart });
            
            return true;
            
        } catch (error) {
            console.error('❌ Add to cart error:', error);
            window.app?.showToast(error.message || 'Erreur lors de l\'ajout au panier', 'error');
            return false;
        }
    }
    
    // Remove item from cart
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            console.warn('⚠️ Item not found in cart:', productId);
            return false;
        }
        
        const removedItem = this.cart[itemIndex];
        this.cart.splice(itemIndex, 1);
        
        this.saveCart();
        this.updateCartDisplay();
        
        // Show notification
        this.showCartNotification(`${removedItem.nom} retiré du panier`, 'info');
        
        // Trigger event
        this.dispatchCartEvent('cart:item-removed', { item: removedItem, cart: this.cart });
        
        return true;
    }
    
    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            console.warn('⚠️ Item not found in cart:', productId);
            return false;
        }
        
        if (newQuantity <= 0) {
            return this.removeFromCart(productId);
        }
        
        return this.updateCartItemQuantity(itemIndex, newQuantity);
    }
    
    // Update cart item quantity (internal method)
    updateCartItemQuantity(itemIndex, newQuantity) {
        const item = this.cart[itemIndex];
        const product = this.findProductById(item.id);
        
        if (!product) {
            console.error('❌ Product not found for cart item:', item.id);
            return false;
        }
        
        // Validate stock
        if (newQuantity > product.stock) {
            window.app?.showToast(
                `Stock insuffisant. Maximum disponible: ${product.stock}`, 
                'warning'
            );
            return false;
        }
        
        const oldQuantity = item.quantite;
        item.quantite = newQuantity;
        item.sousTotal = item.prix * newQuantity;
        
        this.saveCart();
        this.updateCartDisplay();
        
        // Show notification for significant changes
        if (Math.abs(newQuantity - oldQuantity) > 1) {
            this.showCartNotification(
                `Quantité mise à jour: ${item.nom} (${newQuantity})`, 
                'info'
            );
        }
        
        // Trigger event
        this.dispatchCartEvent('cart:item-updated', { 
            item, 
            oldQuantity, 
            newQuantity, 
            cart: this.cart 
        });
        
        return true;
    }
    
    // Clear entire cart
    clearCart() {
        const itemCount = this.cart.length;
        
        if (itemCount === 0) {
            window.app?.showToast('Le panier est déjà vide', 'info');
            return;
        }
        
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        
        this.showCartNotification(`Panier vidé (${itemCount} articles supprimés)`, 'info');
        
        // Trigger event
        this.dispatchCartEvent('cart:cleared', { itemCount });
    }
    
    // Get cart totals
    getCartTotals() {
        const items = this.cart.reduce((sum, item) => sum + item.quantite, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        
        // Calculate shipping
        const shipping = this.calculateShipping(subtotal);
        const total = subtotal + shipping.cost;
        
        // Calculate savings (promotions)
        const savings = this.calculateSavings();
        
        return {
            items,
            subtotal,
            shipping,
            total,
            savings,
            currency: this.settings.currency,
            freeShippingThreshold: this.settings.freeShippingThreshold,
            amountForFreeShipping: shipping.cost > 0 ? 
                Math.max(0, this.settings.freeShippingThreshold - subtotal) : 0
        };
    }
    
    // Calculate shipping cost
    calculateShipping(subtotal) {
        const isFree = subtotal >= this.settings.freeShippingThreshold;
        
        return {
            cost: isFree ? 0 : this.settings.standardShippingCost,
            isFree,
            method: isFree ? 'Livraison gratuite' : 'Livraison standard',
            estimatedDays: isFree ? '2-3 jours' : '3-5 jours'
        };
    }
    
    // Calculate total savings from promotions
    calculateSavings() {
        return this.cart.reduce((total, item) => {
            if (item.prixOriginal && item.prixOriginal > item.prix) {
                return total + ((item.prixOriginal - item.prix) * item.quantite);
            }
            return total;
        }, 0);
    }
    
    // Validate stock availability
    validateStock(product, requestedQuantity) {
        if (product.stock === 0) {
            window.app?.showToast(`${product.nom} est en rupture de stock`, 'error');
            return false;
        }
        
        if (requestedQuantity > product.stock) {
            window.app?.showToast(
                `Stock insuffisant pour ${product.nom}. Disponible: ${product.stock}`,
                'error'
            );
            return false;
        }
        
        // Check if adding to existing cart item would exceed stock
        const existingItem = this.cart.find(item => item.id === product._id);
        if (existingItem) {
            const totalRequested = existingItem.quantite + requestedQuantity;
            if (totalRequested > product.stock) {
                window.app?.showToast(
                    `Stock insuffisant. Vous avez déjà ${existingItem.quantite} dans le panier. Max: ${product.stock}`,
                    'error'
                );
                return false;
            }
        }
        
        return true;
    }
    
    // Create cart item object
    createCartItem(product, quantity, options = {}) {
        const isPromotion = product.enPromotion && product.prixOriginal;
        
        return {
            id: product._id,
            nom: product.nom,
            prix: product.prix,
            prixOriginal: isPromotion ? product.prixOriginal : null,
            image: this.getProductImageUrl(product),
            quantite: quantity,
            stock: product.stock,
            categorie: product.categorie,
            marque: product.marque || '',
            sousTotal: product.prix * quantity,
            enPromotion: isPromotion,
            pourcentagePromotion: isPromotion ? product.pourcentagePromotion : 0,
            dateAjout: new Date().toISOString(),
            options: options // For future use (size, color, etc.)
        };
    }
    
    // Get product image URL
    getProductImageUrl(product) {
        if (product.image) {
            if (product.image.startsWith('data:image') || product.image.startsWith('http')) {
                return product.image;
            }
            return `./images/products/${product.image}`;
        }
        
        // Generate placeholder
        const categoryColor = this.getCategoryColor(product.categorie);
        const initials = product.nom.split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        
        return `https://via.placeholder.com/100x100/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }
    
    // Get category color for placeholder
    getCategoryColor(category) {
        const colors = {
            'Vitalité': '10b981',
            'Sport': 'f43f5e',
            'Visage': 'ec4899',
            'Cheveux': 'f59e0b',
            'Solaire': 'f97316',
            'Intime': 'ef4444',
            'Soins': '22c55e',
            'Bébé': '06b6d4',
            'Homme': '3b82f6',
            'Dentaire': '6366f1'
        };
        return colors[category] || '10b981';
    }
    
    // Find product by ID
    findProductById(productId) {
        return window.app?.allProducts?.find(p => p._id === productId) || null;
    }
    
    // Update cart display
    updateCartDisplay() {
        this.updateCartCounter();
        this.updateCartSidebar();
        this.updateCartSummary();
    }
    
    // Update cart counter
    updateCartCounter() {
        const cartCount = document.getElementById('cartCount');
        const cartItemsCount = document.getElementById('cartItemsCount');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantite, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            
            // Add animation for changes
            if (totalItems > 0) {
                cartCount.classList.add('animate-pulse');
                setTimeout(() => cartCount.classList.remove('animate-pulse'), 1000);
            }
        }
        
        if (cartItemsCount) {
            cartItemsCount.textContent = totalItems === 0 ? '0 articles' : 
                totalItems === 1 ? '1 article' : `${totalItems} articles`;
        }
    }
    
    // Update cart sidebar
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            cartSummary?.classList.add('hidden');
            return;
        }
        
        cartItems.innerHTML = this.cart.map(item => this.generateCartItemHTML(item)).join('');
        cartSummary?.classList.remove('hidden');
    }
    
    // Generate cart item HTML
    generateCartItemHTML(item) {
        const hasPromotion = item.enPromotion && item.prixOriginal;
        const subtotal = item.prix * item.quantite;
        
        return `
            <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-mint-200/50 hover:border-mint-400/60 transition-all shadow-sm hover:shadow-health" data-cart-item="${item.id}">
                <div class="flex items-start space-x-4">
                    <!-- Product Image -->
                    <div class="relative">
                        <img src="${item.image}" alt="${item.nom}" 
                             class="w-20 h-20 object-cover rounded-xl shadow-sm"
                             onerror="this.src='${this.getProductImageUrl({ _id: item.id, nom: item.nom, categorie: item.categorie })}'">
                        ${hasPromotion ? `
                            <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                -${item.pourcentagePromotion}%
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Product Info -->
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-forest-800 text-sm mb-1 line-clamp-2">${item.nom}</h4>
                        
                        <!-- Price -->
                        <div class="flex items-center space-x-2 mb-2">
                            ${hasPromotion ? `
                                <span class="text-sm text-gray-400 line-through">${Utils.formatPrice(item.prixOriginal)}</span>
                                <span class="text-primary font-bold text-lg">${Utils.formatPrice(item.prix)}</span>
                            ` : `
                                <span class="text-forest-800 font-bold text-lg">${Utils.formatPrice(item.prix)}</span>
                            `}
                        </div>
                        
                        <!-- Quantity Controls -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center bg-mint-100 rounded-xl overflow-hidden">
                                <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantite - 1})" 
                                        class="px-3 py-2 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                        ${item.quantite <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus text-sm"></i>
                                </button>
                                <span class="px-4 py-2 text-forest-800 font-semibold min-w-16 text-center">${item.quantite}</span>
                                <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantite + 1})" 
                                        class="px-3 py-2 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                        ${item.quantite >= item.stock ? 'disabled' : ''}>
                                    <i class="fas fa-plus text-sm"></i>
                                </button>
                            </div>
                            
                            <!-- Remove Button -->
                            <button onclick="cartManager.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Retirer du panier">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                        
                        <!-- Item Subtotal -->
                        <div class="mt-2 pt-2 border-t border-mint-200/50 text-right">
                            <span class="text-sm font-semibold text-forest-700">
                                Sous-total: ${Utils.formatPrice(subtotal)}
                            </span>
                            ${item.stock <= 5 ? `
                                <div class="text-xs text-orange-600 mt-1">
                                    <i class="fas fa-exclamation-triangle mr-1"></i>
                                    Plus que ${item.stock} en stock
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get empty cart HTML
    getEmptyCartHTML() {
        return `
            <div class="text-center py-16">
                <div class="w-24 h-24 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-shopping-cart text-4xl text-mint-400"></i>
                </div>
                <p class="text-xl font-semibold text-forest-700 mb-2">Votre panier est vide</p>
                <p class="text-mint-600 mb-8">Découvrez nos produits de qualité pour votre bien-être</p>
                <div class="space-y-3">
                    <button onclick="window.app.showPage('products'); toggleCart();" 
                            class="w-full bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl hover:from-secondary hover:to-mint-600 transition-all duration-300 shadow-health font-medium">
                        <i class="fas fa-leaf mr-2"></i>Explorer nos produits
                    </button>
                    <button onclick="window.app.filterByCategory('Vitalité'); toggleCart();" 
                            class="w-full bg-white text-primary border-2 border-primary px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium">
                        <i class="fas fa-seedling mr-2"></i>Produits Vitalité
                    </button>
                </div>
            </div>
        `;
    }
    
    // Update cart summary
    updateCartSummary() {
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartShipping = document.getElementById('cartShipping');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartSubtotal || !cartShipping || !cartTotal) return;
        
        const totals = this.getCartTotals();
        
        cartSubtotal.textContent = Utils.formatPrice(totals.subtotal);
        cartShipping.textContent = totals.shipping.isFree ? 
            'Gratuit' : Utils.formatPrice(totals.shipping.cost);
        cartTotal.textContent = Utils.formatPrice(totals.total);
        
        // Update shipping message
        this.updateShippingMessage(totals);
    }
    
    // Update shipping message
    updateShippingMessage(totals) {
        let shippingMessage = document.getElementById('shippingMessage');
        
        // Create shipping message if it doesn't exist
        if (!shippingMessage) {
            const cartSummary = document.getElementById('cartSummary');
            if (cartSummary) {
                shippingMessage = document.createElement('div');
                shippingMessage.id = 'shippingMessage';
                shippingMessage.className = 'text-sm text-center py-3 px-4 rounded-xl mb-4';
                cartSummary.insertBefore(shippingMessage, cartSummary.firstChild);
            }
        }
        
        if (!shippingMessage) return;
        
        if (totals.shipping.isFree) {
            shippingMessage.innerHTML = `
                <div class="bg-green-50 text-green-700 border border-green-200">
                    <i class="fas fa-check-circle mr-2"></i>
                    <strong>Félicitations !</strong> Vous bénéficiez de la livraison gratuite
                </div>
            `;
        } else if (totals.amountForFreeShipping > 0) {
            shippingMessage.innerHTML = `
                <div class="bg-blue-50 text-blue-700 border border-blue-200">
                    <i class="fas fa-truck mr-2"></i>
                    Plus que <strong>${Utils.formatPrice(totals.amountForFreeShipping)}</strong> pour la livraison gratuite !
                </div>
            `;
        } else {
            shippingMessage.innerHTML = `
                <div class="bg-gray-50 text-gray-700 border border-gray-200">
                    <i class="fas fa-info-circle mr-2"></i>
                    Livraison standard: ${Utils.formatPrice(totals.shipping.cost)}
                </div>
            `;
        }
    }
    
    // Show cart notification
    showCartNotification(message, type = 'success', product = null) {
        if (!window.app?.showToast) {
            console.log(`Cart: ${message}`);
            return;
        }
        
        // For product additions, show enhanced notification
        if (type === 'success' && product) {
            const notification = document.createElement('div');
            notification.className = `
                fixed top-20 right-6 bg-white border-l-4 border-green-500 rounded-lg shadow-health p-4 z-50 
                transform translate-x-full transition-transform duration-300 max-w-sm
            `;
            
            notification.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${this.getProductImageUrl(product)}" alt="${product.nom}" 
                         class="w-12 h-12 object-cover rounded-lg">
                    <div class="flex-1">
                        <p class="font-semibold text-forest-800 text-sm">${message}</p>
                        <p class="text-xs text-mint-600 mt-1">${Utils.formatPrice(product.prix)}</p>
                    </div>
                    <div class="flex flex-col space-y-1">
                        <button onclick="toggleCart()" 
                                class="bg-primary text-white text-xs px-3 py-1 rounded-lg hover:bg-secondary transition-colors">
                            Voir panier
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-400 hover:text-gray-600 text-xs">
                            ×
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => notification.classList.remove('translate-x-full'), 100);
            
            // Auto remove
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.add('translate-x-full');
                    setTimeout(() => notification.remove(), 300);
                }
            }, 5000);
            
        } else {
            window.app.showToast(message, type);
        }
    }
    
    // Dispatch cart events
    dispatchCartEvent(eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
    
    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            
            // Also save timestamp for cache invalidation
            localStorage.setItem('cartTimestamp', Date.now().toString());
            
        } catch (error) {
            console.error('❌ Failed to save cart:', error);
            window.app?.showToast('Erreur de sauvegarde du panier', 'error');
        }
    }
    
    // Load cart from localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                this.cart = JSON.parse(cartData);
                
                // Validate and clean cart items
                this.cart = this.cart.filter(item => this.validateCartItem(item));
                
                this.updateCartDisplay();
                console.log(`🛒 Cart loaded: ${this.cart.length} items`);
            }
        } catch (error) {
            console.error('❌ Failed to load cart:', error);
            this.cart = [];
        }
    }
    
    // Validate cart item structure
    validateCartItem(item) {
        const requiredFields = ['id', 'nom', 'prix', 'quantite', 'stock'];
        return requiredFields.every(field => item.hasOwnProperty(field));
    }
    
    // Apply coupon code
    async applyCoupon(couponCode) {
        if (!couponCode?.trim()) {
            window.app?.showToast('Veuillez saisir un code promo', 'warning');
            return false;
        }
        
        try {
            // This would typically make an API call to validate the coupon
            // For now, we'll simulate some basic coupons
            const simulatedCoupons = {
                'BIENVENUE10': { type: 'percentage', value: 10, minAmount: 1000 },
                'SHIFA20': { type: 'percentage', value: 20, minAmount: 2000 },
                'LIVRAISON': { type: 'shipping', value: 0 }
            };
            
            const coupon = simulatedCoupons[couponCode.toUpperCase()];
            if (!coupon) {
                window.app?.showToast('Code promo invalide', 'error');
                return false;
            }
            
            const totals = this.getCartTotals();
            
            if (coupon.minAmount && totals.subtotal < coupon.minAmount) {
                window.app?.showToast(
                    `Montant minimum requis: ${Utils.formatPrice(coupon.minAmount)}`, 
                    'warning'
                );
                return false;
            }
            
            // Apply coupon (this would be handled differently in a real app)
            window.app?.showToast(`Code promo "${couponCode}" appliqué avec succès !`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Coupon application error:', error);
            window.app?.showToast('Erreur lors de l\'application du code promo', 'error');
            return false;
        }
    }
    
    // Get cart summary for checkout
    getCheckoutSummary() {
        const totals = this.getCartTotals();
        
        return {
            items: this.cart.map(item => ({
                productId: item.id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.quantite,
                image: item.image,
                sousTotal: item.prix * item.quantite
            })),
            totals,
            timestamp: new Date().toISOString()
        };
    }
    
    // Validate cart before checkout
    validateCartForCheckout() {
        if (this.cart.length === 0) {
            window.app?.showToast('Votre panier est vide', 'warning');
            return false;
        }
        
        const issues = [];
        
        // Check each item
        for (const item of this.cart) {
            const product = this.findProductById(item.id);
            
            if (!product) {
                issues.push(`${item.nom} n'est plus disponible`);
                continue;
            }
            
            if (product.stock < item.quantite) {
                issues.push(`Stock insuffisant pour ${item.nom} (disponible: ${product.stock})`);
            }
            
            if (!product.actif) {
                issues.push(`${item.nom} n'est plus en vente`);
            }
        }
        
        if (issues.length > 0) {
            window.app?.showToast(
                `Problèmes détectés:\n${issues.join('\n')}`, 
                'error'
            );
            return false;
        }
        
        return true;
    }
    
    // Quick add to cart (for product cards)
    async quickAdd(productId) {
        return await this.addToCart(productId, 1);
    }
    
    // Bulk operations
    async addMultipleItems(items) {
        const results = [];
        
        for (const { productId, quantity } of items) {
            const success = await this.addToCart(productId, quantity);
            results.push({ productId, success });
        }
        
        return results;
    }
    
    // Get recommended products based on cart
    getRecommendedProducts() {
        if (this.cart.length === 0) return [];
        
        const cartCategories = [...new Set(this.cart.map(item => item.categorie))];
        const allProducts = window.app?.allProducts || [];
        
        return allProducts
            .filter(product => 
                product.actif && 
                product.stock > 0 &&
                cartCategories.includes(product.categorie) &&
                !this.cart.some(item => item.id === product._id)
            )
            .sort(() => Math.random() - 0.5) // Shuffle
            .slice(0, 4);
    }
}

// Initialize CartManager
const cartManager = new CartManager();

// Make globally available
window.cartManager = cartManager;

// Load cart on initialization
cartManager.loadCart();

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Update cart display when products are loaded
    document.addEventListener('products:loaded', () => {
        cartManager.updateCartDisplay();
    });
    
    // Handle authentication changes
    document.addEventListener('auth:login', () => {
        // Optionally sync cart with user account
        console.log('🛒 User logged in, cart maintained');
    });
    
    document.addEventListener('auth:logout', () => {
        // Keep cart for guest users
        console.log('🛒 User logged out, cart maintained');
    });
});

console.log('✅ Enhanced cart.js loaded successfully');
