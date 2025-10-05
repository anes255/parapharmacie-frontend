// checkout.js - Complete implementation for parapharmacie checkout functionality

// Import configuration (adjust path as needed)
// Assumes config.js exports API_BASE_URL
// Assumes auth.js provides getAuthToken() function
// Assumes cart.js provides getCart() and clearCart() functions

/**
 * Initialize checkout page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

/**
 * Main initialization function for checkout page
 */
function initializeCheckout() {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
        alert('Veuillez vous connecter pour passer une commande');
        window.location.href = 'login.html';
        return;
    }

    // Load cart items and display checkout summary
    loadCheckoutSummary();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user information if available
    loadUserInformation();
}

/**
 * Get authentication token from localStorage or auth.js
 */
function getAuthToken() {
    // Try to get from auth.js function if available
    if (typeof window.getAuthToken === 'function') {
        return window.getAuthToken();
    }
    // Fallback to localStorage
    return localStorage.getItem('token') || localStorage.getItem('authToken');
}

/**
 * Get cart data from localStorage or cart.js
 */
function getCart() {
    // Try to get from cart.js function if available
    if (typeof window.getCart === 'function') {
        return window.getCart();
    }
    // Fallback to localStorage
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

/**
 * Clear cart after successful order
 */
function clearCart() {
    // Try to use cart.js function if available
    if (typeof window.clearCart === 'function') {
        window.clearCart();
    } else {
        // Fallback to localStorage
        localStorage.removeItem('cart');
    }
}

/**
 * Get API base URL from config.js or default
 */
function getApiBaseUrl() {
    // Try to get from config.js
    if (typeof API_BASE_URL !== 'undefined') {
        return API_BASE_URL;
    }
    if (typeof window.API_BASE_URL !== 'undefined') {
        return window.API_BASE_URL;
    }
    // Default fallback
    return 'http://localhost:3000/api';
}

/**
 * Load and display checkout summary
 */
function loadCheckoutSummary() {
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        displayEmptyCart();
        return;
    }
    
    displayCartItems(cart);
    calculateAndDisplayTotals(cart);
}

/**
 * Display empty cart message
 */
function displayEmptyCart() {
    const summaryContainer = document.getElementById('checkout-summary') || 
                            document.getElementById('order-summary') ||
                            document.querySelector('.checkout-summary');
    
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="empty-cart-message">
                <p>Votre panier est vide</p>
                <a href="products.html" class="btn btn-primary">Continuer vos achats</a>
            </div>
        `;
    }
    
    // Disable confirm button
    const confirmButton = document.getElementById('confirm-order-btn') || 
                         document.getElementById('place-order-btn') ||
                         document.querySelector('.confirm-order-btn');
    if (confirmButton) {
        confirmButton.disabled = true;
    }
}

/**
 * Display cart items in checkout summary
 */
function displayCartItems(cart) {
    const summaryContainer = document.getElementById('checkout-summary') || 
                            document.getElementById('order-summary') ||
                            document.querySelector('.checkout-summary');
    
    if (!summaryContainer) {
        console.error('Checkout summary container not found');
        return;
    }
    
    let html = '<div class="checkout-items">';
    
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        html += `
            <div class="checkout-item" data-product-id="${item.id || item._id || item.productId}">
                <div class="item-image">
                    <img src="${item.image || item.imageUrl || 'images/placeholder.jpg'}" alt="${item.name || item.title}">
                </div>
                <div class="item-details">
                    <h4>${item.name || item.title}</h4>
                    <p class="item-quantity">Quantité: ${item.quantity || 1}</p>
                    <p class="item-price">${(item.price || 0).toFixed(2)} DH</p>
                </div>
                <div class="item-total">
                    <p>${itemTotal.toFixed(2)} DH</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    summaryContainer.innerHTML = html;
}

/**
 * Calculate and display order totals
 */
function calculateAndDisplayTotals(cart) {
    const subtotal = cart.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    const shippingCost = subtotal > 200 ? 0 : 30; // Free shipping over 200 DH
    const taxRate = 0.20; // 20% TVA
    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;
    
    const totalsContainer = document.getElementById('order-totals') || 
                           document.getElementById('checkout-totals') ||
                           document.querySelector('.order-totals');
    
    if (totalsContainer) {
        totalsContainer.innerHTML = `
            <div class="totals-row">
                <span>Sous-total:</span>
                <span>${subtotal.toFixed(2)} DH</span>
            </div>
            <div class="totals-row">
                <span>Livraison:</span>
                <span>${shippingCost === 0 ? 'Gratuit' : shippingCost.toFixed(2) + ' DH'}</span>
            </div>
            <div class="totals-row">
                <span>TVA (20%):</span>
                <span>${tax.toFixed(2)} DH</span>
            </div>
            <div class="totals-row total">
                <span><strong>Total:</strong></span>
                <span><strong>${total.toFixed(2)} DH</strong></span>
            </div>
        `;
    }
    
    // Store total for order submission
    window.orderTotal = total;
}

/**
 * Set up event listeners for checkout page
 */
function setupEventListeners() {
    // Confirm order button - try multiple possible IDs/classes
    const confirmButton = document.getElementById('confirm-order-btn') || 
                         document.getElementById('place-order-btn') ||
                         document.getElementById('submit-order-btn') ||
                         document.querySelector('.confirm-order-btn') ||
                         document.querySelector('.place-order-btn') ||
                         document.querySelector('button[type="submit"]');
    
    if (confirmButton) {
        // Remove any existing event listeners by cloning the button
        const newButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newButton, confirmButton);
        
        // Add click event listener
        newButton.addEventListener('click', handleConfirmOrder);
        console.log('Confirm order button event listener attached');
    } else {
        console.error('Confirm order button not found. Please ensure your HTML has a button with id="confirm-order-btn" or class="confirm-order-btn"');
    }
    
    // Form submission (if checkout is in a form)
    const checkoutForm = document.getElementById('checkout-form') || 
                        document.querySelector('.checkout-form') ||
                        document.querySelector('form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleConfirmOrder(e);
        });
    }
}

/**
 * Load user information from profile or localStorage
 */
function loadUserInformation() {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Pre-fill form fields if they exist
    const fields = {
        'fullName': userInfo.fullName || userInfo.name || '',
        'email': userInfo.email || '',
        'phone': userInfo.phone || '',
        'address': userInfo.address || '',
        'city': userInfo.city || '',
        'postalCode': userInfo.postalCode || userInfo.zipCode || ''
    };
    
    Object.keys(fields).forEach(fieldName => {
        const field = document.getElementById(fieldName) || 
                     document.querySelector(`[name="${fieldName}"]`);
        if (field && fields[fieldName]) {
            field.value = fields[fieldName];
        }
    });
}

/**
 * Handle confirm order button click - MAIN FUNCTION
 */
async function handleConfirmOrder(event) {
    event.preventDefault();
    
    console.log('Confirm order button clicked');
    
    // Disable button to prevent double submission
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Traitement en cours...';
    
    try {
        // Validate form
        if (!validateCheckoutForm()) {
            throw new Error('Veuillez remplir tous les champs obligatoires');
        }
        
        // Get cart data
        const cart = getCart();
        if (!cart || cart.length === 0) {
            throw new Error('Votre panier est vide');
        }
        
        // Prepare order data
        const orderData = prepareOrderData(cart);
        console.log('Order data prepared:', orderData);
        
        // Submit order to API
        const response = await submitOrder(orderData);
        console.log('Order submitted successfully:', response);
        
        // Handle success
        handleOrderSuccess(response);
        
    } catch (error) {
        console.error('Order submission error:', error);
        handleOrderError(error);
        
        // Re-enable button
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Validate checkout form
 */
function validateCheckoutForm() {
    const requiredFields = [
        'fullName', 'name', 'customerName',
        'email', 'customerEmail',
        'phone', 'phoneNumber', 'tel',
        'address', 'shippingAddress',
        'city', 'ville'
    ];
    
    let isValid = true;
    const errors = [];
    
    // Check for at least name, email, phone, address
    const nameField = findField(['fullName', 'name', 'customerName']);
    const emailField = findField(['email', 'customerEmail']);
    const phoneField = findField(['phone', 'phoneNumber', 'tel']);
    const addressField = findField(['address', 'shippingAddress']);
    
    if (!nameField || !nameField.value.trim()) {
        errors.push('Nom complet requis');
        isValid = false;
    }
    
    if (!emailField || !emailField.value.trim()) {
        errors.push('Email requis');
        isValid = false;
    } else if (!isValidEmail(emailField.value)) {
        errors.push('Email invalide');
        isValid = false;
    }
    
    if (!phoneField || !phoneField.value.trim()) {
        errors.push('Téléphone requis');
        isValid = false;
    }
    
    if (!addressField || !addressField.value.trim()) {
        errors.push('Adresse requise');
        isValid = false;
    }
    
    if (!isValid) {
        displayValidationErrors(errors);
    }
    
    return isValid;
}

/**
 * Find form field by multiple possible names
 */
function findField(fieldNames) {
    for (const name of fieldNames) {
        const field = document.getElementById(name) || 
                     document.querySelector(`[name="${name}"]`);
        if (field) return field;
    }
    return null;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display validation errors
 */
function displayValidationErrors(errors) {
    const errorContainer = document.getElementById('checkout-errors') || 
                          document.querySelector('.checkout-errors');
    
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="alert alert-danger">
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Erreurs:\n' + errors.join('\n'));
    }
}

/**
 * Prepare order data for API submission
 */
function prepareOrderData(cart) {
    // Get form values
    const getFieldValue = (names) => {
        const field = findField(names);
        return field ? field.value.trim() : '';
    };
    
    const fullName = getFieldValue(['fullName', 'name', 'customerName']);
    const email = getFieldValue(['email', 'customerEmail']);
    const phone = getFieldValue(['phone', 'phoneNumber', 'tel']);
    const address = getFieldValue(['address', 'shippingAddress']);
    const city = getFieldValue(['city', 'ville']);
    const postalCode = getFieldValue(['postalCode', 'zipCode', 'codePostal']);
    const notes = getFieldValue(['notes', 'orderNotes', 'additionalInfo']);
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    const shippingCost = subtotal > 200 ? 0 : 30;
    const tax = subtotal * 0.20;
    const total = subtotal + shippingCost + tax;
    
    // Format items for API
    const items = cart.map(item => ({
        product: item.id || item._id || item.productId,
        productId: item.id || item._id || item.productId,
        name: item.name || item.title,
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
    }));
    
    // Prepare order data matching typical backend Order model
    const orderData = {
        // Customer information
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        
        // Shipping information
        shippingAddress: {
            address: address,
            city: city,
            postalCode: postalCode
        },
        
        // Order items
        items: items,
        products: items, // Some APIs use 'products' instead of 'items'
        
        // Order totals
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total,
        totalAmount: total, // Some APIs use 'totalAmount'
        
        // Additional information
        notes: notes,
        paymentMethod: getFieldValue(['paymentMethod']) || 'cash_on_delivery',
        status: 'pending',
        
        // Timestamp
        orderDate: new Date().toISOString()
    };
    
    return orderData;
}

/**
 * Submit order to API
 */
async function submitOrder(orderData) {
    const apiBaseUrl = getApiBaseUrl();
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Authentification requise. Veuillez vous reconnecter.');
    }
    
    const apiUrl = `${apiBaseUrl}/orders`;
    console.log('Submitting order to:', apiUrl);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token // Some APIs use this header instead
        },
        body: JSON.stringify(orderData)
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Erreur HTTP: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const result = await response.json();
    return result;
}

/**
 * Handle successful order submission
 */
function handleOrderSuccess(response) {
    console.log('Order successful:', response);
    
    // Clear cart
    clearCart();
    
    // Store order ID for confirmation page
    const orderId = response.order?._id || response.order?.id || response._id || response.id;
    if (orderId) {
        localStorage.setItem('lastOrderId', orderId);
    }
    
    // Show success message
    const successMessage = `
        <div class="order-success">
            <div class="success-icon">✓</div>
            <h2>Commande confirmée!</h2>
            <p>Merci pour votre commande.</p>
            ${orderId ? `<p>Numéro de commande: <strong>${orderId}</strong></p>` : ''}
            <p>Vous recevrez un email de confirmation à ${response.order?.customerEmail || 'votre adresse email'}.</p>
            <div class="success-actions">
                <a href="orders.html" class="btn btn-primary">Voir mes commandes</a>
                <a href="products.html" class="btn btn-secondary">Continuer vos achats</a>
            </div>
        </div>
    `;
    
    // Display success message
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.checkout-container') ||
                       document.body;
    
    mainContent.innerHTML = successMessage;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Redirect after 5 seconds
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 5000);
}

/**
 * Handle order submission error
 */
function handleOrderError(error) {
    console.error('Order error:', error);
    
    let errorMessage = 'Une erreur est survenue lors de la confirmation de votre commande.';
    
    if (error.message) {
        errorMessage = error.message;
    }
    
    // Check for specific error types
    if (error.message && error.message.includes('Authentification')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
    
    // Display error message
    const errorContainer = document.getElementById('checkout-errors') || 
                          document.querySelector('.checkout-errors');
    
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="alert alert-danger">
                <strong>Erreur:</strong> ${errorMessage}
            </div>
        `;
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Erreur: ' + errorMessage);
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return `${parseFloat(amount).toFixed(2)} DH`;
}

// Export functions for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCheckout,
        handleConfirmOrder,
        submitOrder,
        prepareOrderData,
        validateCheckoutForm
    };
}

// Make key functions available globally
window.initializeCheckout = initializeCheckout;
window.handleConfirmOrder = handleConfirmOrder;
