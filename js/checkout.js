// Complete Fixed Checkout System for Shifa Parapharmacie

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
        this.appliedDiscount = 0;
    }

    // Initialize checkout process
    init() {
        console.log('Initializing checkout system...');
        this.validateCart();
        this.setupEventListeners();
        this.calculateTotals();
        this.loadUserData();
    }

    // Load user data if logged in
    loadUserData() {
        if (window.app && window.app.currentUser) {
            const user = window.app.currentUser;
            
            // Pre-fill form with user data
            const fields = {
                'checkoutPrenom': user.prenom,
                'checkoutNom': user.nom,
                'checkoutEmail': user.email,
                'checkoutTelephone': user.telephone,
                'checkoutAdresse': user.adresse,
                'checkoutWilaya': user.wilaya
            };
            
            Object.entries(fields).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field && value) {
                    field.value = value;
                }
            });
        }
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

        // Form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
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
                default:
                    paymentInfo.innerHTML = '';
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
        const shippingElement = document.getElementById('checkoutFraisLivraison');
        if (shippingElement) {
            if (fraisLivraison === 0) {
                shippingElement.innerHTML = `<span class="line-through text-gray-400">${this.getDefaultShippingRate()} DA</span> <span class="text-green-600 font-semibold">GRATUIT</span>`;
            } else {
                shippingElement.textContent = `${fraisLivraison} DA`;
            }
        }
    }

    // Get default shipping rate for display
    getDefaultShippingRate() {
        const wilaya = document.getElementById('checkoutWilaya')?.value;
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

    // Calculate and update totals
    calculateTotals() {
        if (!window.app || !window.app.cart) return;

        const sousTotal = window.app.getCartTotal();
        const fraisLivraison = this.getCurrentShippingCost();
        const discount = this.appliedDiscount;
        const total = sousTotal + fraisLivraison - discount;

        // Update display
        const elements = {
            sousTotal: document.getElementById('checkoutSousTotal'),
            fraisLivraison: document.getElementById('checkoutFraisLivraison'),
            discount: document.getElementById('checkoutDiscount'),
            total: document.getElementById('checkoutTotal')
        };

        if (elements.sousTotal) elements.sousTotal.textContent = `${sousTotal} DA`;
        if (elements.fraisLivraison) {
            if (fraisLivraison === 0 && sousTotal >= 5000) {
                elements.fraisLivraison.innerHTML = `<span class="line-through text-gray-400">${this.getDefaultShippingRate()} DA</span> <span class="text-green-600 font-semibold">GRATUIT</span>`;
            } else {
                elements.fraisLivraison.textContent = `${fraisLivraison} DA`;
            }
        }
        if (elements.discount && discount > 0) {
            elements.discount.textContent = `-${discount} DA`;
            elements.discount.parentNode.style.display = 'flex';
        } else if (elements.discount) {
            elements.discount.parentNode.style.display = 'none';
        }
        if (elements.total) elements.total.textContent = `${total} DA`;

        // Show free shipping message
        if (sousTotal >= 5000) {
            this.showFreeShippingMessage();
        } else {
            this.showShippingProgress(sousTotal);
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

    // Show shipping progress
    showShippingProgress(sousTotal) {
        const needed = 5000 - sousTotal;
        const container = document.getElementById('shippingMessage');
        if (container && needed > 0) {
            const progress = (sousTotal / 5000) * 100;
            container.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-center justify-between text-sm text-blue-800 mb-2">
                        <span>Livraison gratuite à partir de 5000 DA</span>
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

        // Validate payment method
        const paymentMethod = document.querySelector('input[name="modePaiement"]:checked');
        if (!paymentMethod) {
            isValid = false;
            if (window.app) {
                window.app.showToast('Veuillez sélectionner un mode de paiement', 'error');
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
            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]') || 
                              document.querySelector('button[type="submit"]') ||
                              document.querySelector('[data-checkout-submit]');
            
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
                const response = await apiCall('/orders', {
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

            console.log('✅ Order processing completed successfully');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            if (window.app) {
                window.app.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
            }
            
            // Re-enable submit button
            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]') || 
                              document.querySelector('button[type="submit"]') ||
                              document.querySelector('[data-checkout-submit]');
            
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
        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        const fraisLivraison = this.getCurrentShippingCost();
        const discount = this.appliedDiscount;
        const total = sousTotal + fraisLivraison - discount;

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Prepare order data
        const orderData = {
            _id: Date.now().toString(),
            numeroCommande: orderNumber,
            client: {
                userId: window.app?.currentUser?._id || null,
                prenom,
                nom,
                email: email.toLowerCase(),
                telephone: telephone.replace(/\s+/g, ''),
                adresse,
                wilaya
            },
            articles: window.app ? window.app.cart.map(item => ({
                productId: item.id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.quantite,
                image: item.image
            })) : [],
            sousTotal,
            fraisLivraison,
            discount,
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
        if (!window.app?.currentUser?._id) return;

        try {
            const userOrdersKey = `userOrders_${window.app.currentUser._id}`;
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
            console.log('Applying coupon:', code);
            
            // Placeholder for coupon logic
            const validCoupons = {
                'WELCOME10': { type: 'percentage', value: 10, minOrder: 2000 },
                'SAVE500': { type: 'fixed', value: 500, minOrder: 3000 },
                'NEWUSER': { type: 'percentage', value: 15, minOrder: 1500 }
            };
            
            const coupon = validCoupons[code.toUpperCase()];
            if (!coupon) {
                throw new Error('Code coupon invalide');
            }
            
            const sousTotal = window.app ? window.app.getCartTotal() : 0;
            if (sousTotal < coupon.minOrder) {
                throw new Error(`Commande minimum de ${coupon.minOrder} DA requise`);
            }
            
            let discount = 0;
            if (coupon.type === 'percentage') {
                discount = Math.round(sousTotal * coupon.value / 100);
            } else {
                discount = coupon.value;
            }
            
            this.appliedDiscount = discount;
            this.calculateTotals();
            
            if (window.app) {
                window.app.showToast(`Coupon appliqué ! Réduction de ${discount} DA`, 'success');
            }
            
            // Update coupon UI
            this.updateCouponUI(code, discount);
            
            return true;
            
        } catch (error) {
            if (window.app) {
                window.app.showToast(error.message, 'error');
            }
            return false;
        }
    }

    // Update coupon UI
    updateCouponUI(code, discount) {
        const couponContainer = document.getElementById('appliedCoupon');
        if (couponContainer) {
            couponContainer.innerHTML = `
                <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                        <span class="text-green-800 font-medium">Coupon "${code}" appliqué</span>
                        <p class="text-green-600 text-sm">Économie: ${discount} DA</p>
                    </div>
                    <button onclick="checkoutSystem.removeCoupon()" class="text-red-600 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }

    // Remove applied coupon
    removeCoupon() {
        this.appliedDiscount = 0;
        this.calculateTotals();
        
        const couponContainer = document.getElementById('appliedCoupon');
        if (couponContainer) {
            couponContainer.innerHTML = '';
        }
        
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.value = '';
        }
        
        if (window.app) {
            window.app.showToast('Coupon retiré', 'info');
        }
    }

    // Get order summary
    getOrderSummary() {
        return {
            sousTotal: window.app ? window.app.getCartTotal() : 0,
            fraisLivraison: this.getCurrentShippingCost(),
            discount: this.appliedDiscount,
            total: (window.app ? window.app.getCartTotal() : 0) + this.getCurrentShippingCost() - this.appliedDiscount,
            items: window.app ? window.app.cart : [],
            itemCount: window.app ? window.app.cart.reduce((sum, item) => sum + item.quantite, 0) : 0
        };
    }
}

// Global checkout system instance
let checkoutSystem;

// Initialize checkout when page loads
function initCheckout() {
    checkoutSystem = new CheckoutSystem();
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
        } else {
            if (window.app) {
                window.app.showToast('Veuillez entrer un code coupon', 'warning');
            }
        }
    }
}

function removeCheckoutCoupon() {
    if (checkoutSystem) {
        checkoutSystem.removeCoupon();
    }
}

function calculateCheckoutShipping() {
    if (checkoutSystem) {
        checkoutSystem.calculateShipping();
    }
}

// Auto-initialize when DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure app is initialized first
        setTimeout(initCheckout, 100);
    });
} else {
    setTimeout(initCheckout, 100);
}

// Export for global access
window.initCheckout = initCheckout;
window.checkoutSystem = checkoutSystem;
window.validateCheckoutField = validateCheckoutField;
window.processCheckoutOrder = processCheckoutOrder;
window.applyCheckoutCoupon = applyCheckoutCoupon;
window.removeCheckoutCoupon = removeCheckoutCoupon;
window.calculateCheckoutShipping = calculateCheckoutShipping;

console.log('✅ Complete Checkout.js loaded successfully');
