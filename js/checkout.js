// Fixed Checkout System for Shifa Parapharmacie - Independent Implementation

class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
    }

    // Initialize checkout process
    init() {
        console.log('Initializing checkout system...');
        this.validateCart();
        this.setupEventListeners();
        this.calculateTotals();
    }

    // Validate cart before checkout
    validateCart() {
        const cart = this.getCart();
        if (!cart || cart.length === 0) {
            console.error('Cart is empty');
            this.showToast('Votre panier est vide', 'warning');
            this.redirectToProducts();
            return false;
        }

        // Check stock availability
        for (let item of cart) {
            if (item.stock === 0) {
                this.showToast(`${item.nom} n'est plus en stock`, 'error');
                return false;
            }
            if (item.quantite > item.stock) {
                this.showToast(`Stock insuffisant pour ${item.nom}`, 'error');
                return false;
            }
        }

        return true;
    }

    // Get cart from cartSystem or localStorage
    getCart() {
        if (window.cartSystem && window.cartSystem.cart) {
            return window.cartSystem.cart;
        }
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    // Get cart total
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    }

    // Clear cart
    clearCart() {
        if (window.cartSystem) {
            window.cartSystem.clear();
        } else {
            localStorage.setItem('cart', '[]');
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Redirect to products page
    redirectToProducts() {
        if (window.app && window.app.showPage) {
            window.app.showPage('products');
        } else if (window.loadProductsPage) {
            window.loadProductsPage();
        }
    }

    // Setup form event listeners
    setupEventListeners() {
        // Real-time form validation
        const inputs = document.querySelectorAll('#checkoutForm input, #checkoutForm select, #checkoutForm textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Payment method selection
        const paymentInputs = document.querySelectorAll('input[name="modePaiement"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', () => this.handlePaymentMethodChange(input.value));
        });

        // Wilaya change for shipping calculation
        const wilayaSelect = document.getElementById('checkoutWilaya');
        if (wilayaSelect) {
            wilayaSelect.addEventListener('change', () => this.calculateShipping());
        }
    }

    // Validate individual form field
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'checkoutPrenom':
            case 'checkoutNom':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Ce champ est requis';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Minimum 2 caractères';
                }
                break;

            case 'checkoutEmail':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email requis';
                } else if (!this.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Format d\'email invalide';
                }
                break;

            case 'checkoutTelephone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Téléphone requis';
                } else if (!this.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Format de téléphone invalide';
                }
                break;

            case 'checkoutAdresse':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Adresse requise';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Adresse trop courte';
                }
                break;

            case 'checkoutWilaya':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Wilaya requise';
                }
                break;
        }

        this.displayFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    // Display field validation result
    displayFieldValidation(field, isValid, errorMessage) {
        // Remove existing validation classes
        field.classList.remove('border-red-400', 'border-green-400');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('border-red-400');
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error text-red-500 text-sm mt-1';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        } else if (field.value.trim()) {
            field.classList.add('border-green-400');
        }
    }

    // Clear field error styling
    clearFieldError(field) {
        field.classList.remove('border-red-400');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Handle payment method change
    handlePaymentMethodChange(method) {
        console.log('Payment method changed to:', method);
        
        // Update UI based on payment method
        const paymentInfo = document.getElementById('paymentMethodInfo');
        if (paymentInfo) {
            switch (method) {
                case 'Paiement à la livraison':
                    paymentInfo.innerHTML = `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                            <p class="text-green-700 text-sm">
                                <i class="fas fa-info-circle mr-2"></i>
                                Vous paierez en espèces lors de la réception de votre commande.
                            </p>
                        </div>
                    `;
                    break;
                case 'Carte bancaire':
                    paymentInfo.innerHTML = `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <p class="text-blue-700 text-sm">
                                <i class="fas fa-credit-card mr-2"></i>
                                Paiement sécurisé par carte bancaire (bientôt disponible).
                            </p>
                        </div>
                    `;
                    break;
            }
        }
    }

    // Calculate shipping costs
    calculateShipping() {
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const sousTotal = this.getCartTotal();
        
        let fraisLivraison = 0;
        
        // Free shipping for orders over 5000 DA
        if (sousTotal >= 5000) {
            fraisLivraison = 0;
        } else {
            // Different shipping costs by wilaya
            const shippingRates = {
                'Alger': 250,
                'Blida': 250,
                'Boumerdès': 250,
                'Tipaza': 200,
                'Médéa': 300,
                // Default rate for other wilayas
                'default': 350
            };
            
            fraisLivraison = shippingRates[wilaya] || shippingRates.default;
        }

        this.updateShippingDisplay(fraisLivraison);
        this.calculateTotals();
        
        return fraisLivraison;
    }

    // Update shipping display
    updateShippingDisplay(fraisLivraison) {
        const shippingElement = document.getElementById('shippingCost');
        if (shippingElement) {
            shippingElement.textContent = `${fraisLivraison} DA`;
            
            if (fraisLivraison === 0) {
                shippingElement.classList.add('text-green-600', 'font-semibold');
                shippingElement.classList.remove('text-gray-700');
            } else {
                shippingElement.classList.remove('text-green-600', 'font-semibold');
                shippingElement.classList.add('text-gray-700');
            }
        }
    }

    // Calculate and update totals
    calculateTotals() {
        const sousTotal = this.getCartTotal();
        const fraisLivraison = this.getCurrentShippingCost();
        const total = sousTotal + fraisLivraison;

        // Update display
        const elements = {
            sousTotal: document.getElementById('checkoutSousTotal'),
            fraisLivraison: document.getElementById('checkoutFraisLivraison'),
            total: document.getElementById('checkoutTotal')
        };

        if (elements.sousTotal) elements.sousTotal.textContent = `${sousTotal} DA`;
        if (elements.fraisLivraison) elements.fraisLivraison.textContent = `${fraisLivraison} DA`;
        if (elements.total) elements.total.textContent = `${total} DA`;

        // Show free shipping message
        if (sousTotal >= 5000) {
            this.showFreeShippingMessage();
        }
    }

    // Get current shipping cost
    getCurrentShippingCost() {
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const sousTotal = this.getCartTotal();
        
        if (sousTotal >= 5000) {
            return 0;
        }
        
        const shippingRates = {
            'Alger': 250,
            'Blida': 250,
            'Boumerdès': 250,
            'Tipaza': 200,
            'Médéa': 300,
            'default': 350
        };
        
        return shippingRates[wilaya] || shippingRates.default;
    }

    // Show free shipping message
    showFreeShippingMessage() {
        const container = document.getElementById('shippingMessage');
        if (container) {
            container.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p class="text-green-700 text-sm font-medium">
                        <i class="fas fa-truck mr-2"></i>
                        Félicitations ! Livraison gratuite pour cette commande.
                    </p>
                </div>
            `;
        }
    }

    // Validate entire form
    validateForm() {
        const requiredFields = [
            'checkoutPrenom',
            'checkoutNom', 
            'checkoutEmail',
            'checkoutTelephone',
            'checkoutAdresse',
            'checkoutWilaya'
        ];

        let isValid = true;

        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        }

        return isValid;
    }

    // Process the order - MAIN FUNCTION
    async processOrder() {
        try {
            if (this.isProcessing) {
                console.log('Order already being processed');
                return;
            }

            console.log('🛒 Starting order processing...');
            this.isProcessing = true;

            // Validate cart
            if (!this.validateCart()) {
                throw new Error('Panier invalide');
            }

            // Validate form
            if (!this.validateForm()) {
                throw new Error('Veuillez corriger les erreurs dans le formulaire');
            }

            // Disable submit button
            const submitBtn = document.querySelector('button[onclick="processCheckoutOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            }

            // Gather form data
            const orderData = this.gatherOrderData();
            
            console.log('Order data prepared:', orderData);

            // Try to submit to API first
            let orderSaved = false;
            try {
                const response = await window.apiCall('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });
                
                if (response) {
                    console.log('✅ Order saved to API successfully');
                    orderSaved = true;
                }
            } catch (apiError) {
                console.log('⚠️ API save failed, will save locally:', apiError.message);
            }

            // Always save locally for admin panel
            if (window.addOrderToDemo) {
                const localOrder = window.addOrderToDemo(orderData);
                if (localOrder) {
                    console.log('✅ Order saved locally for admin panel');
                }
            }

            // Save to user's order history
            this.saveToUserOrders(orderData);

            // Clear cart
            this.clearCart();

            // Show success and redirect
            this.showToast('Commande passée avec succès !', 'success');
            this.redirectToConfirmation(orderData.numeroCommande);

            console.log('✅ Order processing completed successfully');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            this.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
            
            // Re-enable submit button
            const submitBtn = document.querySelector('button[onclick="processCheckoutOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // Gather all order data from form
    gatherOrderData() {
        // Get form values
        const prenom = document.getElementById('checkoutPrenom')?.value.trim();
        const nom = document.getElementById('checkoutNom')?.value.trim();
        const email = document.getElementById('checkoutEmail')?.value.trim();
        const telephone = document.getElementById('checkoutTelephone')?.value.trim();
        const adresse = document.getElementById('checkoutAdresse')?.value.trim();
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
        const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';

        // Calculate totals
        const sousTotal = this.getCartTotal();
        const fraisLivraison = this.getCurrentShippingCost();
        const total = sousTotal + fraisLivraison;

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Get current user if available
        const currentUser = window.authSystem?.currentUser || window.app?.currentUser;

        // Prepare order data
        const orderData = {
            _id: Date.now().toString(),
            numeroCommande: orderNumber,
            client: {
                userId: currentUser?.id || null,
                prenom,
                nom,
                email: email.toLowerCase(),
                telephone: telephone.replace(/\s+/g, ''),
                adresse,
                wilaya
            },
            articles: this.getCart().map(item => ({
                productId: item.id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.quantite,
                image: item.image
            })),
            sousTotal,
            fraisLivraison,
            total,
            statut: 'en-attente',
            modePaiement,
            commentaires,
            dateCommande: new Date().toISOString()
        };

        return orderData;
    }

    // Save order to user's order history
    saveToUserOrders(orderData) {
        const currentUser = window.authSystem?.currentUser || window.app?.currentUser;
        if (!currentUser?.id) return;

        try {
            const userOrdersKey = `userOrders_${currentUser.id}`;
            let userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
            
            // Add new order to the beginning
            userOrders.unshift(orderData);
            
            // Keep only last 50 orders
            if (userOrders.length > 50) {
                userOrders = userOrders.slice(0, 50);
            }
            
            localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
            console.log('✅ Order saved to user history');
            
        } catch (error) {
            console.error('Error saving to user orders:', error);
        }
    }

    // Generate unique order number
    generateOrderNumber() {
        const prefix = 'CMD';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (Algerian format)
    validatePhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        return phoneRegex.test(cleanPhone);
    }

    // Redirect to confirmation page
    redirectToConfirmation(orderNumber) {
        if (window.app && window.app.showPage) {
            window.app.showPage('order-confirmation', { orderNumber });
        } else {
            // Simple confirmation display
            alert(`Commande ${orderNumber} confirmée !`);
            if (window.loadProductsPage) {
                window.loadProductsPage();
            }
        }
    }

    // Update order progress
    updateProgress(step) {
        this.currentStep = step;
        
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (index === step - 1) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
    }

    // Apply coupon code
    async applyCoupon(code) {
        try {
            // This would normally call an API to validate the coupon
            console.log('Applying coupon:', code);
            
            // Placeholder for coupon logic
            if (code.toUpperCase() === 'WELCOME10') {
                const discount = Math.round(this.getCartTotal() * 0.1);
                this.appliedDiscount = discount;
                this.calculateTotals();
                
                this.showToast(`Coupon appliqué ! Réduction de ${discount} DA`, 'success');
                return true;
            } else {
                throw new Error('Code coupon invalide');
            }
            
        } catch (error) {
            this.showToast(error.message, 'error');
            return false;
        }
    }

    // Remove applied coupon
    removeCoupon() {
        this.appliedDiscount = 0;
        this.calculateTotals();
        
        this.showToast('Coupon retiré', 'info');
    }
}

// Global checkout manager instance
let checkoutManager;

// Initialize checkout when page loads
function initCheckout() {
    checkoutManager = new CheckoutManager();
    checkoutManager.init();
    window.checkoutManager = checkoutManager;
    console.log('✅ Checkout manager initialized');
}

// Global functions for checkout
function validateCheckoutField(field) {
    if (checkoutManager) {
        return checkoutManager.validateField(field);
    }
}

function processCheckoutOrder() {
    if (checkoutManager) {
        return checkoutManager.processOrder();
    }
}

function applyCheckoutCoupon() {
    const couponInput = document.getElementById('couponCode');
    if (couponInput && checkoutManager) {
        const code = couponInput.value.trim();
        if (code) {
            checkoutManager.applyCoupon(code);
        }
    }
}

function removeCheckoutCoupon() {
    if (checkoutManager) {
        checkoutManager.removeCoupon();
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    // Small delay to ensure other scripts are loaded
    setTimeout(initCheckout, 100);
}

// Export for global access
window.initCheckout = initCheckout;
window.checkoutManager = checkoutManager;
window.validateCheckoutField = validateCheckoutField;
window.processCheckoutOrder = processCheckoutOrder;
window.applyCheckoutCoupon = applyCheckoutCoupon;
window.removeCheckoutCoupon = removeCheckoutCoupon;

console.log('✅ Enhanced Checkout.js loaded successfully');
