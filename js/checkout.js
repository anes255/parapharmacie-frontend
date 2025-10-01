// Fixed Checkout System for Shifa Parapharmacie

class CheckoutSystem {
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
        if (!window.app || !window.app.cart || window.app.cart.length === 0) {
            console.error('Cart is empty');
            if (window.app) {
                window.app.showToast('Votre panier est vide', 'warning');
                window.app.showPage('products');
            }
            return false;
        }

        // Check stock availability
        for (let item of window.app.cart) {
            if (item.stock === 0) {
                if (window.app) {
                    window.app.showToast(`${item.nom} n'est plus en stock`, 'error');
                }
                return false;
            }
            if (item.quantite > item.stock) {
                if (window.app) {
                    window.app.showToast(`Stock insuffisant pour ${item.nom}`, 'error');
                }
                return false;
            }
        }

        return true;
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
        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        
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
        if (!window.app || !window.app.cart) return;

        const sousTotal = window.app.getCartTotal();
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
        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        
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

    // CRITICAL FIX: Validate articles before sending
    validateArticles(articles) {
        console.log('🔍 Validating articles:', articles);
        
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            console.error('❌ Articles array is invalid');
            return false;
        }

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            console.log(`Validating article ${i + 1}:`, article);
            
            // Check all required fields
            if (!article.productId || typeof article.productId !== 'string') {
                console.error(`❌ Article ${i + 1}: productId is missing or invalid`);
                return false;
            }
            
            if (!article.nom || typeof article.nom !== 'string' || article.nom.trim() === '') {
                console.error(`❌ Article ${i + 1}: nom is missing or invalid`);
                return false;
            }
            
            if (article.prix === undefined || article.prix === null || typeof article.prix !== 'number' || article.prix < 0) {
                console.error(`❌ Article ${i + 1}: prix is missing or invalid`);
                return false;
            }
            
            if (!article.quantite || typeof article.quantite !== 'number' || article.quantite < 1) {
                console.error(`❌ Article ${i + 1}: quantite is missing or invalid`);
                return false;
            }

            // Image is optional but should be a string if present
            if (article.image === undefined || article.image === null) {
                article.image = ''; // Set default empty string
            }
        }

        console.log('✅ All articles validated successfully');
        return true;
    }

    // Process the order - MAIN FUNCTION WITH FIXES
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
            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            }

            // Gather form data
            const orderData = this.gatherOrderData();
            
            // CRITICAL: Validate articles before sending
            if (!this.validateArticles(orderData.articles)) {
                throw new Error('Les informations des articles sont incomplètes');
            }

            console.log('📦 Order data prepared:', orderData);

            // Try to submit to API first
            let orderSaved = false;
            try {
                console.log('📡 Sending to API...');
                const response = await apiCall('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });
                
                console.log('📡 API Response status:', response ? 'success' : 'failed');
                
                if (response) {
                    console.log('✅ Order saved to API successfully');
                    orderSaved = true;
                } else {
                    console.log('⚠️ API returned empty response');
                }
            } catch (apiError) {
                console.log('❌ API submission failed:', apiError.message);
                
                // Show the actual API error to the user for debugging
                if (window.app) {
                    window.app.showToast(`Erreur API: ${apiError.message}`, 'error');
                }
            }

            // Always save locally for admin panel
            if (window.addOrderToDemo) {
                try {
                    const localOrder = window.addOrderToDemo(orderData);
                    if (localOrder) {
                        console.log('✅ Order saved locally for admin panel');
                    }
                } catch (localError) {
                    console.error('⚠️ Local save failed:', localError);
                }
            }

            // Save to user's order history
            if (window.app && window.app.currentUser) {
                this.saveToUserOrders(orderData);
            }

            // Clear cart
            if (window.app) {
                window.app.clearCart();
            }

            // Show success and redirect
            if (window.app) {
                window.app.showToast('Commande passée avec succès !', 'success');
                window.app.showPage('order-confirmation', { orderNumber: orderData.numeroCommande });
            }

            console.log('✅ Order processing completed');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            if (window.app) {
                window.app.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
            }
            
            // Re-enable submit button
            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // Gather all order data from form - WITH FIXES
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
        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        const fraisLivraison = this.getCurrentShippingCost();
        const total = sousTotal + fraisLivraison;

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // CRITICAL FIX: Ensure all article fields are properly formatted
        const articles = window.app ? window.app.cart.map(item => {
            // Ensure all fields are present and properly typed
            return {
                productId: String(item.id || ''), // Ensure it's a string
                nom: String(item.nom || '').trim(), // Ensure it's a string and trimmed
                prix: Number(item.prix) || 0, // Ensure it's a number
                quantite: Number(item.quantite) || 1, // Ensure it's a number
                image: String(item.image || '') // Ensure it's a string, even if empty
            };
        }) : [];

        // Prepare order data
        const orderData = {
            _id: Date.now().toString(),
            numeroCommande: orderNumber,
            client: {
                userId: window.app?.currentUser?.id || null,
                prenom,
                nom,
                email: email.toLowerCase(),
                telephone: telephone.replace(/\s+/g, ''),
                adresse,
                wilaya
            },
            articles,
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
        if (!window.app?.currentUser?.id) return;

        try {
            const userOrdersKey = `userOrders_${window.app.currentUser.id}`;
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

    // Apply coupon code
    async applyCoupon(code) {
        try {
            // This would normally call an API to validate the coupon
            console.log('Applying coupon:', code);
            
            // Placeholder for coupon logic
            if (code.toUpperCase() === 'WELCOME10') {
                const discount = Math.round(window.app.getCartTotal() * 0.1);
                this.appliedDiscount = discount;
                this.calculateTotals();
                
                if (window.app) {
                    window.app.showToast(`Coupon appliqué ! Réduction de ${discount} DA`, 'success');
                }
                return true;
            } else {
                throw new Error('Code coupon invalide');
            }
            
        } catch (error) {
            if (window.app) {
                window.app.showToast(error.message, 'error');
            }
            return false;
        }
    }

    // Remove applied coupon
    removeCoupon() {
        this.appliedDiscount = 0;
        this.calculateTotals();
        
        if (window.app) {
            window.app.showToast('Coupon retiré', 'info');
        }
    }
}

// Global checkout system instance
let checkoutSystem;

// Initialize checkout when page loads
function initCheckout() {
    checkoutSystem = new CheckoutSystem();
    checkoutSystem.init();
    window.checkoutSystem = checkoutSystem;
    console.log('✅ Checkout system initialized');
}

// Global functions for checkout
function validateCheckoutField(field) {
    if (checkoutSystem) {
        return checkoutSystem.validateField(field);
    }
}

function processCheckoutOrder() {
    if (checkoutSystem) {
        return checkoutSystem.processOrder();
    }
}

function applyCheckoutCoupon() {
    const couponInput = document.getElementById('couponCode');
    if (couponInput && checkoutSystem) {
        const code = couponInput.value.trim();
        if (code) {
            checkoutSystem.applyCoupon(code);
        }
    }
}

function removeCheckoutCoupon() {
    if (checkoutSystem) {
        checkoutSystem.removeCoupon();
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}

// Export for global access
window.initCheckout = initCheckout;
window.checkoutSystem = checkoutSystem;
window.validateCheckoutField = validateCheckoutField;
window.processCheckoutOrder = processCheckoutOrder;
window.applyCheckoutCoupon = applyCheckoutCoupon;
window.removeCheckoutCoupon = removeCheckoutCoupon;

console.log('✅ Checkout.js loaded successfully with article validation fixes');
