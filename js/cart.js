// ==========================================
// 🌿 Cart Management - Complete Implementation
// ==========================================

/**
 * Initialize cart functionality
 */
function initializeCart() {
    log('Initializing cart');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            window.app.cart = JSON.parse(savedCart);
            window.app.updateCartUI();
        } catch (error) {
            console.error('Error loading cart:', error);
            window.app.cart = [];
        }
    }
}

/**
 * Add item to cart
 */
function addToCart(productId, quantity = 1) {
    if (!window.app) {
        console.error('App not initialized');
        return;
    }
    
    window.app.addToCart(productId, quantity);
}

/**
 * Update cart item quantity
 */
function updateCartQuantity(productId, newQuantity) {
    if (!window.app) {
        console.error('App not initialized');
        return;
    }
    
    window.app.updateCartQuantity(productId, newQuantity);
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
    if (!window.app) {
        console.error('App not initialized');
        return;
    }
    
    window.app.removeFromCart(productId);
}

/**
 * Get cart total
 */
function getCartTotal() {
    if (!window.app) {
        return 0;
    }
    
    return window.app.getCartTotal();
}

/**
 * Get cart item count
 */
function getCartItemCount() {
    if (!window.app) {
        return 0;
    }
    
    return window.app.getCartItemCount();
}

/**
 * Calculate cart summary
 */
function calculateCartSummary() {
    if (!window.app || !window.app.cart) {
        return {
            subtotal: 0,
            shipping: 0,
            total: 0,
            itemCount: 0
        };
    }
    
    const subtotal = window.app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const shipping = subtotal >= CONFIG.LIVRAISON_GRATUITE_SEUIL ? 0 : CONFIG.FRAIS_LIVRAISON;
    const total = subtotal + shipping;
    const itemCount = window.app.cart.reduce((count, item) => count + item.quantite, 0);
    
    return {
        subtotal,
        shipping,
        total,
        itemCount,
        freeShippingThreshold: CONFIG.LIVRAISON_GRATUITE_SEUIL,
        remainingForFreeShipping: Math.max(0, CONFIG.LIVRAISON_GRATUITE_SEUIL - subtotal)
    };
}

/**
 * Validate cart items
 */
function validateCart() {
    if (!window.app || !window.app.cart || window.app.cart.length === 0) {
        return {
            valid: false,
            errors: ['Le panier est vide']
        };
    }
    
    const errors = [];
    const updatedCart = [];
    
    for (const item of window.app.cart) {
        // Find product in cache
        const product = window.app.allProducts.find(p => p._id === item.id);
        
        if (!product) {
            errors.push(`Le produit "${item.nom}" n'existe plus`);
            continue;
        }
        
        if (product.actif === false) {
            errors.push(`Le produit "${item.nom}" n'est plus disponible`);
            continue;
        }
        
        if (product.stock === 0) {
            errors.push(`Le produit "${item.nom}" est en rupture de stock`);
            continue;
        }
        
        if (item.quantite > product.stock) {
            errors.push(`Stock insuffisant pour "${item.nom}". Disponible: ${product.stock}`);
            // Update quantity to available stock
            item.quantite = product.stock;
        }
        
        // Update price if changed
        if (item.prix !== product.prix) {
            item.prix = product.prix;
        }
        
        updatedCart.push(item);
    }
    
    // Update cart if items were removed or modified
    if (updatedCart.length !== window.app.cart.length) {
        window.app.cart = updatedCart;
        window.app.saveCart();
        window.app.updateCartUI();
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Clear cart
 */
function clearCart() {
    if (!window.app) {
        console.error('App not initialized');
        return;
    }
    
    window.app.clearCart();
}

/**
 * Toggle cart sidebar
 */
function toggleCartSidebar() {
    toggleCart();
}

/**
 * Show cart sidebar
 */
function showCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
    }
}

/**
 * Hide cart sidebar
 */
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    }
}

/**
 * Export cart as JSON
 */
function exportCart() {
    if (!window.app || !window.app.cart) {
        return null;
    }
    
    return {
        items: window.app.cart,
        summary: calculateCartSummary(),
        timestamp: new Date().toISOString()
    };
}

/**
 * Import cart from JSON
 */
function importCart(cartData) {
    try {
        if (!cartData || !cartData.items) {
            throw new Error('Invalid cart data');
        }
        
        window.app.cart = cartData.items;
        window.app.saveCart();
        window.app.updateCartUI();
        
        return true;
    } catch (error) {
        console.error('Error importing cart:', error);
        return false;
    }
}

/**
 * Get recommended products based on cart
 */
function getRecommendedProducts() {
    if (!window.app || !window.app.cart || window.app.cart.length === 0) {
        return [];
    }
    
    // Get categories from cart items
    const cartCategories = [...new Set(window.app.cart.map(item => item.categorie))];
    
    // Find products from same categories not in cart
    const cartProductIds = window.app.cart.map(item => item.id);
    const recommended = window.app.allProducts.filter(product => 
        cartCategories.includes(product.categorie) &&
        !cartProductIds.includes(product._id) &&
        product.actif !== false &&
        product.stock > 0
    );
    
    // Shuffle and return top 4
    return recommended.sort(() => 0.5 - Math.random()).slice(0, 4);
}

/**
 * Apply coupon code
 */
function applyCoupon(couponCode) {
    // Placeholder for coupon functionality
    // This can be implemented with backend validation
    
    const validCoupons = {
        'BIENVENUE10': { type: 'percentage', value: 10, description: '10% de réduction' },
        'SANTE20': { type: 'percentage', value: 20, description: '20% de réduction' },
        'LIVRAISON': { type: 'shipping', value: 0, description: 'Livraison gratuite' }
    };
    
    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (!coupon) {
        return {
            valid: false,
            message: 'Code promo invalide'
        };
    }
    
    return {
        valid: true,
        coupon: coupon,
        message: `Code promo appliqué: ${coupon.description}`
    };
}

/**
 * Format cart for order
 */
function formatCartForOrder() {
    if (!window.app || !window.app.cart) {
        return [];
    }
    
    return window.app.cart.map(item => ({
        produit: item.id,
        nom: item.nom,
        quantite: item.quantite,
        prix: item.prix,
        total: item.prix * item.quantite
    }));
}

/**
 * Cart event handlers
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart on page load
    if (window.app) {
        initializeCart();
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', (event) => {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartButton = event.target.closest('[onclick*="toggleCart"]');
        
        if (cartSidebar && 
            !cartSidebar.contains(event.target) && 
            !cartButton &&
            !cartSidebar.classList.contains('translate-x-full')) {
            hideCartSidebar();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Press 'C' to toggle cart
        if (event.key === 'c' && event.ctrlKey) {
            event.preventDefault();
            toggleCartSidebar();
        }
        
        // Press 'Escape' to close cart
        if (event.key === 'Escape') {
            hideCartSidebar();
        }
    });
});

console.log('✅ Cart.js loaded successfully');
