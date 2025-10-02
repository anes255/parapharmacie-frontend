// Fixed Cart System for Shifa Parapharmacie

class CartSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.isOpen = false;
        this.settings = {
            fraisLivraison: 300,
            livraisonGratuite: 5000,
            maxQuantity: 10
        };
        
        console.log('Initializing cart system...'); // FIXED: was 'log' now 'console.log'
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    // Setup cart event listeners
    setupEventListeners() {
        // Cart toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-cart-toggle]') || e.target.closest('[data-cart-toggle]')) {
                this.toggle();
            }
        });

        // Cart overlay click to close
        document.addEventListener('click', (e) => {
            if (e.target.matches('#cartOverlay')) {
                this.close();
            }
        });

        // Escape key to close cart
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Update cart when storage changes (multiple tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.cart = JSON.parse(e.newValue || '[]');
                this.updateUI();
            }
        });
    }

    // Add item to cart
    async addItem(productId, quantity = 1, product = null) {
        try {
            console.log('Adding to cart:', productId, quantity);

            // Find product if not provided
            if (!product && window.app?.allProducts) {
                product = window.app.allProducts.find(p => p._id === productId);
            }

            if (!product) {
                // Try to fetch from API
                try {
                    product = await apiCall(`/products/${productId}`);
                } catch (error) {
                    throw new Error('Produit non trouvé');
                }
            }

            // Validate product
            if (!product) {
                throw new Error('Produit non trouvé');
            }

            if (product.stock === 0) {
                throw new Error('Ce produit est en rupture de stock');
            }

            if (quantity > product.stock) {
                throw new Error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
            }

            if (quantity > this.settings.maxQuantity) {
                throw new Error(`Quantité maximum autorisée: ${this.settings.maxQuantity}`);
            }

            // Generate image URL
            const imageUrl = this.generateImageUrl(product);

            // Check if item already exists in cart
            const existingIndex = this.cart.findIndex(item => item.id === productId);

            if (existingIndex > -1) {
                const newQuantity = this.cart[existingIndex].quantite + quantity;
                
                if (newQuantity > product.stock) {
                    throw new Error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
                }
                
                if (newQuantity > this.settings.maxQuantity) {
                    throw new Error(`Quantité maximum autorisée: ${this.settings.maxQuantity}`);
                }

                this.cart[existingIndex].quantite = newQuantity;
            } else {
                // Add new item
                const cartItem = {
                    id: product._id,
                    nom: product.nom,
                    prix: product.prix,
                    image: imageUrl,
                    quantite: quantity,
                    stock: product.stock,
                    categorie: product.categorie,
                    marque: product.marque || '',
                    dateAjout: new Date().toISOString()
                };

                this.cart.push(cartItem);
            }

            this.saveCart();
            this.updateUI();
            this.showAddedNotification(product.nom, quantity);

            console.log('✅ Item added to cart successfully');
            return true;

        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            if (window.app) {
                window.app.showToast(error.message, 'error');
            }
            return false;
        }
    }

    // Remove item from cart
    removeItem(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateUI();
            
            if (window.app) {
                window.app.showToast(`${item.nom} retiré du panier`, 'success');
            }
            
            console.log('Item removed from cart:', item.nom);
            return true;
        }
        
        return false;
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            console.error('Item not found in cart');
            return false;
        }

        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }

        const item = this.cart[itemIndex];

        // Validate new quantity
        if (newQuantity > item.stock) {
            if (window.app) {
                window.app.showToast(`Stock insuffisant. Maximum disponible: ${item.stock}`, 'error');
            }
            return false;
        }

        if (newQuantity > this.settings.maxQuantity) {
            if (window.app) {
                window.app.showToast(`Quantité maximum autorisée: ${this.settings.maxQuantity}`, 'error');
            }
            return false;
        }

        item.quantite = newQuantity;
        this.saveCart();
        this.updateUI();
        
        console.log('Quantity updated:', item.nom, newQuantity);
        return true;
    }

    // Clear entire cart
    clear() {
        this.cart = [];
        this.saveCart();
        this.updateUI();
        
        if (window.app) {
            window.app.showToast('Panier vidé', 'success');
        }
        
        console.log('Cart cleared');
    }

    // Get cart totals
    getTotals() {
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= this.settings.livraisonGratuite ? 0 : this.settings.fraisLivraison;
        const total = sousTotal + fraisLivraison;
        
        return {
            sousTotal,
            fraisLivraison,
            total,
            itemCount: this.cart.reduce((sum, item) => sum + item.quantite, 0),
            uniqueItems: this.cart.length
        };
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cart',
            newValue: JSON.stringify(this.cart)
        }));
    }

    // Update cart UI
    updateUI() {
        this.updateCartCount();
        this.updateCartSidebar();
        this.updateCartTotals();
    }

    // Update cart count badge
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totals = this.getTotals();
            cartCount.textContent = totals.itemCount;
            
            // Add pulse animation for new items
            if (totals.itemCount > 0) {
                cartCount.classList.add('animate-pulse');
                setTimeout(() => cartCount.classList.remove('animate-pulse'), 1000);
            }
        }
    }

    // Update cart sidebar content
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            if (cartSummary) cartSummary.classList.add('hidden');
            return;
        }

        cartItems.innerHTML = this.cart.map(item => this.getCartItemHTML(item)).join('');
        if (cartSummary) cartSummary.classList.remove('hidden');
    }

    // Get empty cart HTML
    getEmptyCartHTML() {
        return `
            <div class="text-emerald-600 text-center py-12">
                <div class="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-3xl text-emerald-400"></i>
                </div>
                <h3 class="text-lg font-medium text-emerald-800 mb-2">Votre panier est vide</h3>
                <p class="text-emerald-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
                <button onclick="cartSystem.close(); window.app?.showPage('products')" 
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                    <i class="fas fa-shopping-bag mr-2"></i>Découvrir nos produits
                </button>
            </div>
        `;
    }

    // Get cart item HTML
    getCartItemHTML(item) {
        return `
            <div class="cart-item bg-white/60 rounded-xl p-4 border border-emerald-100 hover:shadow-md transition-all">
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <img src="${item.image}" alt="${item.nom}" 
                             class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200 shadow-sm"
                             onerror="this.src='${this.generatePlaceholderImage(item)}'">
                        ${item.stock <= 5 ? `
                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" 
                                 title="Stock faible"></div>
                        ` : ''}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-emerald-800 truncate">${item.nom}</h4>
                        <p class="text-sm text-emerald-600">${item.prix} DA</p>
                        ${item.marque ? `<p class="text-xs text-gray-500">${item.marque}</p>` : ''}
                        
                        <div class="flex items-center justify-between mt-2">
                            <div class="quantity-controls flex items-center border border-emerald-200 rounded-lg">
                                <button onclick="cartSystem.updateQuantity('${item.id}', ${item.quantite - 1})" 
                                        class="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors"
                                        ${item.quantite <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                
                                <input type="number" value="${item.quantite}" min="1" max="${item.stock}" 
                                       class="w-12 h-8 text-center border-0 focus:ring-0 text-sm font-medium text-emerald-800"
                                       onchange="cartSystem.updateQuantity('${item.id}', parseInt(this.value) || 1)"
                                       onclick="this.select()">
                                
                                <button onclick="cartSystem.updateQuantity('${item.id}', ${item.quantite + 1})" 
                                        class="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors"
                                        ${item.quantite >= item.stock ? 'disabled' : ''}>
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                            
                            <button onclick="cartSystem.removeItem('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                    title="Supprimer du panier">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="font-bold text-emerald-700">${item.prix * item.quantite} DA</p>
                        <p class="text-xs text-gray-500">Stock: ${item.stock}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Update cart totals display
    updateCartTotals() {
        const totals = this.getTotals();
        
        const elements = {
            cartSubtotal: document.getElementById('cartSubtotal'),
            cartShipping: document.getElementById('cartShipping'), 
            cartTotal: document.getElementById('cartTotal')
        };

        if (elements.cartSubtotal) {
            elements.cartSubtotal.textContent = `${totals.sousTotal} DA`;
        }
        
        if (elements.cartShipping) {
            elements.cartShipping.textContent = `${totals.fraisLivraison} DA`;
            
            // Style free shipping
            if (totals.fraisLivraison === 0 && totals.sousTotal > 0) {
                elements.cartShipping.classList.add('text-green-600', 'font-semibold');
                elements.cartShipping.innerHTML = `<span class="line-through text-gray-400">${this.settings.fraisLivraison} DA</span> <span class="text-green-600">GRATUIT</span>`;
            } else {
                elements.cartShipping.classList.remove('text-green-600', 'font-semibold');
            }
        }
        
        if (elements.cartTotal) {
            elements.cartTotal.textContent = `${totals.total} DA`;
        }

        // Show free shipping progress
        this.updateShippingProgress(totals.sousTotal);
    }

    // Update shipping progress indicator
    updateShippingProgress(sousTotal) {
        const progressContainer = document.getElementById('shippingProgress');
        if (!progressContainer) return;

        const needed = this.settings.livraisonGratuite - sousTotal;
        
        if (needed <= 0) {
            progressContainer.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div class="flex items-center">
                        <i class="fas fa-truck text-green-600 mr-2"></i>
                        <span class="text-green-800 font-medium text-sm">Livraison gratuite !</span>
                    </div>
                </div>
            `;
        } else {
            const progress = (sousTotal / this.settings.livraisonGratuite) * 100;
            progressContainer.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-center justify-between text-sm text-blue-800 mb-2">
                        <span>Livraison gratuite à partir de ${this.settings.livraisonGratuite} DA</span>
                        <span class="font-medium">${needed} DA restants</span>
                    </div>
                    <div class="w-full bg-blue-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
            `;
        }
    }

    // Generate image URL for product
    generateImageUrl(product) {
        if (product.image && product.image.startsWith('data:image')) {
            return product.image;
        } else if (product.image && product.image.startsWith('http')) {
            return product.image;
        } else {
            return this.generatePlaceholderImage(product);
        }
    }

    // Generate placeholder image
    generatePlaceholderImage(product) {
        const getCategoryColor = (category) => {
            const colors = {
                'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
                'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
                'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
                'Dentaire': '6366f1'
            };
            return colors[category] || '10b981';
        };
        
        const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const categoryColor = getCategoryColor(product.categorie);
        return `https://via.placeholder.com/64x64/${categoryColor}/ffffff?text=${encodeURIComponent(initials)}`;
    }

    // Show notification when item is added
    showAddedNotification(productName, quantity) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-3"></i>
                <div>
                    <p class="font-medium">${productName}</p>
                    <p class="text-sm opacity-90">Ajouté au panier (${quantity})</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Open cart sidebar
    open() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            this.isOpen = true;
            
            // Update cart content
            this.updateUI();
        }
    }

    // Close cart sidebar
    close() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            this.isOpen = false;
        }
    }

    // Toggle cart sidebar
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            if (window.app) {
                window.app.showToast('Votre panier est vide', 'warning');
            }
            return;
        }

        this.close();
        
        if (window.app) {
            window.app.showPage('checkout');
        }
    }

    // Get cart summary for checkout
    getCartSummary() {
        return {
            items: [...this.cart],
            totals: this.getTotals(),
            timestamp: new Date().toISOString()
        };
    }

    // Import cart (useful for merging with server cart)
    importCart(cartData) {
        if (Array.isArray(cartData)) {
            this.cart = cartData;
            this.saveCart();
            this.updateUI();
            console.log('Cart imported successfully');
        }
    }

    // Export cart data
    exportCart() {
        return {
            items: this.cart,
            totals: this.getTotals(),
            exportDate: new Date().toISOString()
        };
    }
}

// Global cart system instance
let cartSystem;

// Initialize cart system
function initCart() {
    cartSystem = new CartSystem();
    window.cartSystem = cartSystem;
    console.log('✅ Cart system initialized');
}

// Global cart functions
function toggleCart() {
    if (cartSystem) {
        cartSystem.toggle();
    }
}

function addToCart(productId, quantity = 1) {
    if (cartSystem) {
        return cartSystem.addItem(productId, quantity);
    }
}

function removeFromCart(productId) {
    if (cartSystem) {
        return cartSystem.removeItem(productId);
    }
}

function updateCartQuantity(productId, quantity) {
    if (cartSystem) {
        return cartSystem.updateQuantity(productId, quantity);
    }
}

function clearCart() {
    if (cartSystem) {
        cartSystem.clear();
    }
}

function proceedToCheckout() {
    if (cartSystem) {
        cartSystem.proceedToCheckout();
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

// Export for global access
window.initCart = initCart;
window.cartSystem = cartSystem;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

console.log('✅ Cart.js loaded successfully');
