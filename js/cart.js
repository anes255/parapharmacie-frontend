// Cart Management System for Shifa Parapharmacie

// This file provides cart functionality that complements the main app
// Most cart functions are in app.js, this provides additional utilities

// Cart storage key
const CART_STORAGE_KEY = 'cart';

// Get cart from localStorage
function getCartFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch (error) {
        console.error('Error reading cart from storage:', error);
        return [];
    }
}

// Save cart to localStorage
function saveCartToStorage(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Error saving cart to storage:', error);
        return false;
    }
}

// Calculate cart totals
function calculateCartTotals(cart) {
    const sousTotal = cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
    const total = sousTotal + fraisLivraison;
    
    return {
        sousTotal: Math.round(sousTotal),
        fraisLivraison: Math.round(fraisLivraison),
        total: Math.round(total),
        itemCount: cart.reduce((sum, item) => sum + item.quantite, 0)
    };
}

// Validate cart item
function validateCartItem(item) {
    return item && 
           item.id && 
           item.nom && 
           typeof item.prix === 'number' && item.prix > 0 &&
           typeof item.quantite === 'number' && item.quantite > 0;
}

// Clean cart - remove invalid items
function cleanCart(cart) {
    return cart.filter(item => validateCartItem(item));
}

// Find item in cart
function findCartItem(cart, productId) {
    return cart.find(item => item.id === productId);
}

// Get item index in cart
function getCartItemIndex(cart, productId) {
    return cart.findIndex(item => item.id === productId);
}

// Format price for display
function formatPrice(price) {
    return `${Math.round(price).toLocaleString('fr-FR')} DA`;
}

// Generate cart summary HTML
function generateCartSummaryHTML(cart) {
    const totals = calculateCartTotals(cart);
    
    return `
        <div class="space-y-3">
            <div class="flex justify-between text-gray-600">
                <span>Sous-total:</span>
                <span>${formatPrice(totals.sousTotal)}</span>
            </div>
            <div class="flex justify-between text-gray-600">
                <span>Frais de livraison:</span>
                <span>${formatPrice(totals.fraisLivraison)}</span>
            </div>
            ${totals.sousTotal >= 5000 ? `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p class="text-green-800 text-sm font-medium">
                        <i class="fas fa-check-circle mr-2"></i>
                        Livraison gratuite !
                    </p>
                </div>
            ` : `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-blue-800 text-sm">
                        <i class="fas fa-info-circle mr-2"></i>
                        Livraison gratuite à partir de 5 000 DA
                    </p>
                </div>
            `}
            <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span class="text-emerald-600">${formatPrice(totals.total)}</span>
                </div>
            </div>
        </div>
    `;
}

// Generate cart item HTML
function generateCartItemHTML(item, index) {
    return `
        <div class="cart-item flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <img src="${item.image || 'https://via.placeholder.com/64x64/10b981/ffffff?text=' + encodeURIComponent((item.nom || '').substring(0, 2))}" 
                 alt="${item.nom}" 
                 class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
            <div class="flex-1">
                <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                <p class="text-sm text-emerald-600">${formatPrice(item.prix)}</p>
                <div class="flex items-center space-x-2 mt-2">
                    <div class="quantity-selector flex items-center border border-gray-300 rounded-lg">
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantite - 1})" 
                                class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg ${item.quantite <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <input type="number" value="${item.quantite}" min="1" max="${item.stock || 999}"
                               onchange="updateCartItemQuantity('${item.id}', parseInt(this.value))"
                               class="w-16 text-center border-0 focus:ring-0 py-1">
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantite + 1})" 
                                class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg ${item.quantite >= (item.stock || 999) ? 'opacity-50 cursor-not-allowed' : ''}">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                    <button onclick="removeCartItem('${item.id}')" 
                            class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium text-emerald-800">${formatPrice(item.prix * item.quantite)}</p>
                <p class="text-xs text-gray-500">${item.quantite} × ${formatPrice(item.prix)}</p>
            </div>
        </div>
    `;
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    if (window.app && typeof window.app.updateCartQuantity === 'function') {
        window.app.updateCartQuantity(productId, newQuantity);
    } else {
        console.error('App updateCartQuantity method not available');
    }
}

// Remove cart item
function removeCartItem(productId) {
    if (window.app && typeof window.app.removeFromCart === 'function') {
        window.app.removeFromCart(productId);
    } else {
        console.error('App removeFromCart method not available');
    }
}

// Add to cart with validation
function addToCartValidated(productId, quantity = 1, productData = null) {
    try {
        // Validate inputs
        if (!productId) {
            throw new Error('ID du produit requis');
        }
        
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Quantité invalide');
        }
        
        // Use app method if available
        if (window.app && typeof window.app.addToCart === 'function') {
            return window.app.addToCart(productId, quantity);
        }
        
        // Fallback implementation
        console.warn('Using fallback cart implementation');
        
        if (!productData) {
            throw new Error('Données du produit requises pour l\'ajout au panier');
        }
        
        const cart = getCartFromStorage();
        const existingIndex = getCartItemIndex(cart, productId);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantite += quantity;
        } else {
            cart.push({
                id: productId,
                nom: productData.nom,
                prix: productData.prix,
                quantite: quantity,
                image: productData.image,
                stock: productData.stock
            });
        }
        
        saveCartToStorage(cart);
        
        // Show success message
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(`${productData.nom} ajouté au panier`, 'success');
        }
        
        return true;
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(error.message || 'Erreur lors de l\'ajout au panier', 'error');
        }
        
        return false;
    }
}

// Clear entire cart
function clearCartCompletely() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        
        // Update app if available
        if (window.app) {
            window.app.cart = [];
            if (typeof window.app.updateCartUI === 'function') {
                window.app.updateCartUI();
            }
            if (typeof window.app.showToast === 'function') {
                window.app.showToast('Panier vidé', 'success');
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
}

// Get cart item count
function getCartItemCount() {
    try {
        const cart = getCartFromStorage();
        return cart.reduce((count, item) => count + (item.quantite || 0), 0);
    } catch (error) {
        console.error('Error getting cart item count:', error);
        return 0;
    }
}

// Get cart total value
function getCartTotalValue() {
    try {
        const cart = getCartFromStorage();
        const totals = calculateCartTotals(cart);
        return totals.total;
    } catch (error) {
        console.error('Error getting cart total:', error);
        return 0;
    }
}

// Sync cart with app
function syncCartWithApp() {
    if (window.app) {
        const cart = getCartFromStorage();
        window.app.cart = cart;
        
        if (typeof window.app.updateCartUI === 'function') {
            window.app.updateCartUI();
        }
    }
}

// Initialize cart on page load
function initializeCart() {
    try {
        const cart = getCartFromStorage();
        const cleanedCart = cleanCart(cart);
        
        // Save cleaned cart if it was modified
        if (cleanedCart.length !== cart.length) {
            saveCartToStorage(cleanedCart);
        }
        
        // Sync with app
        syncCartWithApp();
        
        console.log('Cart initialized with', cleanedCart.length, 'items');
        
    } catch (error) {
        console.error('Error initializing cart:', error);
    }
}

// Cart event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart after a short delay to ensure app is loaded
    setTimeout(initializeCart, 100);
});

// Export functions for global access
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.addToCartValidated = addToCartValidated;
window.clearCartCompletely = clearCartCompletely;
window.getCartItemCount = getCartItemCount;
window.getCartTotalValue = getCartTotalValue;
window.syncCartWithApp = syncCartWithApp;
window.calculateCartTotals = calculateCartTotals;
window.formatPrice = formatPrice;

console.log('✅ Cart.js loaded with utility functions');
