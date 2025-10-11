// Fixed Checkout System for Shifa Parapharmacie
// EMAIL FIELD COMPLETELY REMOVED - Customers only provide: Name, Phone, Address, Wilaya

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
    }

    // Initialize checkout process
    init() {
        console.log('🛒 Initializing checkout system...');
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

    // Validate individual form field (NO EMAIL VALIDATION)
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
        field.classList.remove('border-red-400', 'border-green-400');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('border-red-400');
            
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
        
        if (sousTotal >= 5000) {
            fraisLivraison = 0;
        } else {
            const shippingRates = {
                'Alger': 250,
                'Blida': 250,
                'Boumerdès': 250,
                'Tipaza': 200,
                'Médéa': 300,
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

        const elements = {
            sousTotal: document.getElementById('checkoutSousTotal'),
            fraisLivraison: document.getElementById('checkoutFraisLivraison'),
            total: document.getElementById('checkoutTotal')
        };

        if (elements.sousTotal) elements.sousTotal.textContent = `${sousTotal} DA`;
        if (elements.fraisLivraison) elements.fraisLivraison.textContent = `${fraisLivraison} DA`;
        if (elements.total) elements.total.textContent = `${total} DA`;

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

    // Validate entire form (NO EMAIL REQUIRED)
    validateForm() {
        const requiredFields = [
            'checkoutPrenom',
            'checkoutNom', 
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

    // MAIN FUNCTION - Process the order
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
            const submitBtn = document.querySelector('button[onclick*="processOrder"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            }

            // Gather form data (WITHOUT EMAIL)
            const orderData = this.gatherOrderData();
            
            console.log('📦 Order data prepared:', orderData);
            console.log('📦 Has orderNumber?', !!orderData.orderNumber, orderData.orderNumber);

            // Try to submit to API first
            let apiSuccess = false;
            try {
                const response = await this.submitToAPI(orderData);
                if (response) {
                    console.log('✅ Order saved to API successfully');
                    apiSuccess = true;
                }
            } catch (apiError) {
                console.log('⚠️ API save failed:', apiError.message);
            }

            // Always save locally for admin panel
            this.saveLocallyForAdmin(orderData);

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
                window.app.showToast(
                    apiSuccess ? 'Commande passée avec succès !' : 'Commande enregistrée localement',
                    apiSuccess ? 'success' : 'warning'
                );
                window.app.showPage('order-confirmation', { orderNumber: orderData.numeroCommande });
            }

            console.log('✅ Order processing completed successfully');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            if (window.app) {
                window.app.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
            }
            
            // Re-enable submit button
            const submitBtn = document.querySelector('button[onclick*="processOrder"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // Gather order data (NO EMAIL - ONLY NAME, PHONE, ADDRESS, WILAYA)
    gatherOrderData() {
        const prenom = document.getElementById('checkoutPrenom')?.value.trim();
        const nom = document.getElementById('checkoutNom')?.value.trim();
        const telephone = document.getElementById('checkoutTelephone')?.value.trim();
        const adresse = document.getElementById('checkoutAdresse')?.value.trim();
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
        const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';

        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        const fraisLivraison = this.getCurrentShippingCost();
        const total = sousTotal + fraisLivraison;

        // Generate unique order number
        const orderNumber = this.generateOrderNumber();

        // Build order data WITHOUT EMAIL
        const orderData = {
            numeroCommande: orderNumber,
            orderNumber: orderNumber,  // For MongoDB unique index
            client: {
                userId: window.app?.currentUser?.id || null,
                prenom,
                nom,
                // NO EMAIL FIELD
                telephone: telephone.replace(/\s+/g, ''),
                adresse,
                wilaya
            },
            articles: window.app ? window.app.cart.map(item => ({
                productId: item.id.toString(),
                nom: item.nom,
                prix: parseFloat(item.prix),
                quantite: parseInt(item.quantite),
                image: item.image || ''
            })) : [],
            sousTotal: parseFloat(sousTotal),
            fraisLivraison: parseFloat(fraisLivraison),
            total: parseFloat(total),
            statut: 'en-attente',
            modePaiement,
            commentaires,
            dateCommande: new Date().toISOString()
        };

        return orderData;
    }

    // Submit order to API
    async submitToAPI(orderData) {
        const token = localStorage.getItem('token');
        const apiUrl = 'https://parapharmacie-gaher.onrender.com/api/orders';
        
        console.log('📤 Submitting to:', apiUrl);
        console.log('📤 Order data:', JSON.stringify(orderData, null, 2));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { 'x-auth-token': token })
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Response data:', data);
        
        if (!response.ok) {
            const errorMessage = data.message || data.error || data.msg || `Erreur ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return data;
    }

    // Save order locally for admin panel
    saveLocallyForAdmin(orderData) {
        try {
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            const localOrder = {
                numero: orderData.numeroCommande,
                client: orderData.client,
                produits: orderData.articles || [],
                total: orderData.total,
                statut: orderData.statut || 'en-attente',
                createdAt: orderData.dateCommande || new Date().toISOString()
            };
            
            adminOrders.unshift(localOrder);
            localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
            console.log('💾 Order saved locally for admin panel');
        } catch (error) {
            console.error('Error saving locally:', error);
        }
    }

    // Save order to user's order history
    saveToUserOrders(orderData) {
        if (!window.app?.currentUser?.id) return;

        try {
            const userOrdersKey = `userOrders_${window.app.currentUser.id}`;
            let userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
            
            userOrders.unshift(orderData);
            
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
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }

    // Phone validation (Algerian format)
    validatePhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        return phoneRegex.test(cleanPhone);
    }
}

// Global checkout system instance
let checkoutSystem;

// Initialize checkout when page loads
function initCheckout() {
    checkoutSystem = new CheckoutSystem();
    checkoutSystem.init();
    window.checkoutSystem = checkoutSystem;
    console.log('✅ Checkout system initialized - NO EMAIL REQUIRED');
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

console.log('✅ Checkout.js loaded - Email field completely removed!');
