// Shopping Cart Functionality for Shifa Parapharmacie

// Cart related CSS that should be in styles.css
const cartStyles = `
    .cart-item {
        @apply p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50 mb-3;
    }
    
    .quantity-selector {
        @apply flex items-center border border-emerald-200 rounded-lg overflow-hidden;
    }
    
    .quantity-selector button {
        @apply w-8 h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center font-bold;
    }
    
    .quantity-selector input {
        @apply w-12 text-center border-0 bg-white text-emerald-800 font-medium;
        -moz-appearance: textfield;
    }
    
    .quantity-selector input::-webkit-outer-spin-button,
    .quantity-selector input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    
    .badge-promotion {
        @apply bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full;
    }
    
    .category-card {
        @apply hover:scale-105 transition-all duration-300;
    }
    
    .category-icon {
        @apply w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 text-2xl;
    }
    
    .pulse-slow {
        animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .float-animation {
        animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    .hero-gradient {
        background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
    }
    
    .btn-primary {
        @apply bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl;
    }
    
    .form-input {
        @apply w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 transition-all;
    }
    
    .toast {
        @apply fixed top-4 right-4 z-50 bg-white border-l-4 rounded-lg shadow-lg p-4 mb-2 opacity-0 translate-x-full transition-all duration-300;
        min-width: 300px;
    }
    
    .toast.show {
        @apply opacity-100 translate-x-0;
    }
    
    .toast.success {
        @apply border-green-500;
    }
    
    .toast.error {
        @apply border-red-500;
    }
    
    .toast.warning {
        @apply border-yellow-500;
    }
    
    .toast.info {
        @apply border-blue-500;
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .product-card {
        @apply hover:scale-[1.02] transition-all duration-300;
    }
`;

// Inject styles if they don't exist
function injectCartStyles() {
    if (!document.getElementById('cart-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-styles';
        style.textContent = cartStyles;
        document.head.appendChild(style);
    }
}

// Initialize cart styles when script loads
injectCartStyles();

// Cart management functions that extend the main app
PharmacieGaherApp.prototype.initializeCart = function() {
    // Load cart from localStorage
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Update cart UI
    this.updateCartUI();
    
    // Set up cart event listeners
    this.setupCartEventListeners();
};

PharmacieGaherApp.prototype.setupCartEventListeners = function() {
    // Cart sidebar toggle
    const cartToggleBtn = document.querySelector('[onclick="toggleCart()"]');
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCartSidebar();
        });
    }
    
    // Cart overlay click to close
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            this.closeCartSidebar();
        });
    }
    
    // Close cart with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeCartSidebar();
        }
    });
};

PharmacieGaherApp.prototype.toggleCartSidebar = function() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = !cartSidebar.classList.contains('translate-x-full');
        
        if (isOpen) {
            this.closeCartSidebar();
        } else {
            this.openCartSidebar();
        }
    }
};

PharmacieGaherApp.prototype.openCartSidebar = function() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
        
        // Update cart content when opening
        this.updateCartSidebar();
    }
};

PharmacieGaherApp.prototype.closeCartSidebar = function() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore body scroll
    }
};

// Enhanced add to cart with better error handling
PharmacieGaherApp.prototype.addToCartWithValidation = async function(productId, quantity = 1, showToast = true) {
    try {
        console.log('Adding to cart with validation:', productId, quantity);
        
        // Find product in cached products
        const product = this.allProducts.find(p => p._id === productId);
        
        if (!product) {
            throw new Error('Produit non trouvé');
        }
        
        // Validate stock
        if (product.stock === 0) {
            throw new Error('Ce produit est en rupture de stock');
        }
        
        if (quantity <= 0) {
            throw new Error('Quantité invalide');
        }
        
        if (quantity > product.stock) {
            throw new Error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
        }
        
        // Check if adding this quantity would exceed stock
        const existingItem = this.cart.find(item => item.id === productId);
        const currentQuantity = existingItem ? existingItem.quantite : 0;
        const totalQuantity = currentQuantity + quantity;
        
        if (totalQuantity > product.stock) {
            throw new Error(`Stock insuffisant. Vous avez déjà ${currentQuantity} dans votre panier. Maximum: ${product.stock}`);
        }
        
        // Generate image URL for cart item
        let imageUrl = product.image;
        if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image'))) {
            const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            const categoryColors = {
                'Vitalité': '10b981', 'Sport': 'f43f5e', 'Visage': 'ec4899',
                'Cheveux': 'f59e0b', 'Solaire': 'f97316', 'Intime': 'ef4444',
                'Bébé': '06b6d4', 'Homme': '3b82f6', 'Soins': '22c55e',
                'Dentaire': '6366f1'
            };
            const color = categoryColors[product.categorie] || '10b981';
            imageUrl = `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(initials)}`;
        }
        
        // Add or update cart item
        if (existingItem) {
            existingItem.quantite = totalQuantity;
        } else {
            const cartItem = {
                id: product._id,
                nom: product.nom,
                prix: product.prix,
                image: imageUrl,
                quantite: quantity,
                stock: product.stock,
                categorie: product.categorie || 'Général'
            };
            this.cart.push(cartItem);
        }
        
        // Save and update UI
        this.saveCart();
        this.updateCartUI();
        
        if (showToast) {
            this.showToast(`${product.nom} ajouté au panier`, 'success');
        }
        
        return true;
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (showToast) {
            this.showToast(error.message, 'error');
        }
        return false;
    }
};

// Enhanced cart quantity update with validation
PharmacieGaherApp.prototype.updateCartQuantityWithValidation = function(productId, newQuantity) {
    try {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            throw new Error('Article non trouvé dans le panier');
        }
        
        const item = this.cart[itemIndex];
        
        // If quantity is 0 or negative, remove item
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        // Validate against stock
        if (newQuantity > item.stock) {
            this.showToast(`Stock insuffisant. Maximum disponible: ${item.stock}`, 'error');
            return;
        }
        
        // Update quantity
        item.quantite = newQuantity;
        this.saveCart();
        this.updateCartUI();
        
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        this.showToast(error.message, 'error');
    }
};

// Enhanced remove from cart
PharmacieGaherApp.prototype.removeFromCartWithConfirmation = function(productId, showConfirmation = false) {
    const itemIndex = this.cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        const item = this.cart[itemIndex];
        
        if (showConfirmation) {
            if (!confirm(`Êtes-vous sûr de vouloir retirer "${item.nom}" du panier ?`)) {
                return;
            }
        }
        
        this.cart.splice(itemIndex, 1);
        this.saveCart();
        this.updateCartUI();
        this.showToast(`${item.nom} retiré du panier`, 'success');
    }
};

// Get cart statistics
PharmacieGaherApp.prototype.getCartStats = function() {
    const itemCount = this.cart.reduce((count, item) => count + item.quantite, 0);
    const subtotal = this.cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
    const shippingCost = subtotal >= 5000 ? 0 : 300;
    const total = subtotal + shippingCost;
    
    return {
        itemCount,
        subtotal,
        shippingCost,
        total,
        isEmpty: this.cart.length === 0,
        hasItems: this.cart.length > 0,
        qualifiesForFreeShipping: subtotal >= 5000
    };
};

// Clear cart with confirmation
PharmacieGaherApp.prototype.clearCartWithConfirmation = function() {
    if (this.cart.length === 0) {
        this.showToast('Votre panier est déjà vide', 'info');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showToast('Panier vidé', 'success');
        this.closeCartSidebar();
    }
};

// Cart validation before checkout
PharmacieGaherApp.prototype.validateCartForCheckout = function() {
    if (this.cart.length === 0) {
        this.showToast('Votre panier est vide', 'warning');
        return false;
    }
    
    // Check each item for stock availability
    for (const item of this.cart) {
        const product = this.allProducts.find(p => p._id === item.id);
        
        if (!product) {
            this.showToast(`Le produit "${item.nom}" n'est plus disponible`, 'error');
            this.removeFromCart(item.id);
            return false;
        }
        
        if (product.stock === 0) {
            this.showToast(`"${item.nom}" est en rupture de stock`, 'error');
            this.removeFromCart(item.id);
            return false;
        }
        
        if (item.quantite > product.stock) {
            this.showToast(`Stock insuffisant pour "${item.nom}". Quantité ajustée.`, 'warning');
            item.quantite = product.stock;
            item.stock = product.stock;
            this.saveCart();
            this.updateCartUI();
        }
    }
    
    return true;
};

// Enhanced proceed to checkout
PharmacieGaherApp.prototype.proceedToCheckoutWithValidation = function() {
    // Validate cart
    if (!this.validateCartForCheckout()) {
        return;
    }
    
    // Close cart sidebar
    this.closeCartSidebar();
    
    // Go to checkout page
    this.showPage('checkout');
};

// Mini cart display for header
PharmacieGaherApp.prototype.renderMiniCart = function() {
    const stats = this.getCartStats();
    
    return `
        <div class="mini-cart-content">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-emerald-800">Panier (${stats.itemCount})</h3>
                <span class="text-emerald-600 font-semibold">${stats.total} DA</span>
            </div>
            
            ${stats.isEmpty ? `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-cart text-emerald-200 text-2xl mb-2"></i>
                    <p class="text-emerald-600 text-sm">Panier vide</p>
                </div>
            ` : `
                <div class="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    ${this.cart.slice(0, 3).map(item => `
                        <div class="flex items-center space-x-2 text-sm">
                            <img src="${item.image}" alt="${item.nom}" class="w-8 h-8 object-cover rounded">
                            <span class="flex-1 truncate">${item.nom}</span>
                            <span class="text-emerald-600">${item.quantite}×</span>
                        </div>
                    `).join('')}
                    ${this.cart.length > 3 ? `<p class="text-xs text-gray-500 text-center">+${this.cart.length - 3} autres articles</p>` : ''}
                </div>
                
                <button onclick="app.proceedToCheckoutWithValidation()" 
                        class="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all">
                    Voir le panier
                </button>
            `}
        </div>
    `;
};

// Global cart functions that work with the updated cart system
window.toggleCartSidebar = function() {
    if (window.app) {
        window.app.toggleCartSidebar();
    }
};

window.addToCartFromCard = function(productId, quantity = 1) {
    if (window.app) {
        window.app.addToCartWithValidation(productId, quantity);
    }
};

window.updateCartQuantity = function(productId, newQuantity) {
    if (window.app) {
        window.app.updateCartQuantityWithValidation(productId, newQuantity);
    }
};

window.removeFromCart = function(productId) {
    if (window.app) {
        window.app.removeFromCartWithConfirmation(productId, false);
    }
};

window.clearCart = function() {
    if (window.app) {
        window.app.clearCartWithConfirmation();
    }
};

window.proceedToCheckout = function() {
    if (window.app) {
        window.app.proceedToCheckoutWithValidation();
    }
};

// Enhanced cart item renderer for sidebar
PharmacieGaherApp.prototype.renderCartItem = function(item) {
    return `
        <div class="cart-item">
            <div class="flex items-start space-x-3">
                <img src="${item.image}" alt="${item.nom}" 
                     class="w-16 h-16 object-cover rounded-lg border border-emerald-200 flex-shrink-0">
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-emerald-800 truncate">${item.nom}</h4>
                    <p class="text-sm text-emerald-600 mb-2">${item.prix} DA / unité</p>
                    
                    <div class="flex items-center justify-between">
                        <div class="quantity-selector">
                            <button onclick="updateCartQuantity('${item.id}', ${Math.max(1, item.quantite - 1)})"
                                    ${item.quantite <= 1 ? 'disabled class="opacity-50"' : ''}>-</button>
                            <input type="number" value="${item.quantite}" min="1" max="${item.stock}"
                                   onchange="updateCartQuantity('${item.id}', parseInt(this.value) || 1)"
                                   class="text-center">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantite + 1})"
                                    ${item.quantite >= item.stock ? 'disabled class="opacity-50"' : ''}>+</button>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <span class="font-semibold text-emerald-700">${item.prix * item.quantite} DA</span>
                            <button onclick="removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all"
                                    title="Supprimer">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${item.quantite >= item.stock ? `
                        <p class="text-xs text-orange-600 mt-1">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Quantité maximale atteinte
                        </p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
};

console.log('✅ Cart.js loaded successfully with enhanced functionality');
