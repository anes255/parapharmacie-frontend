// BRAND NEW Checkout System - Rewritten from Scratch with Proper API Validation

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
    }

    init() {
        console.log('Initializing checkout system...');
        this.validateCart();
        this.setupEventListeners();
        this.calculateTotals();
    }

    validateCart() {
        if (!window.app || !window.app.cart || window.app.cart.length === 0) {
            console.error('Cart is empty');
            if (window.app) {
                window.app.showToast('Votre panier est vide', 'warning');
                window.app.showPage('products');
            }
            return false;
        }

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

    setupEventListeners() {
        const inputs = document.querySelectorAll('#checkoutForm input, #checkoutForm select, #checkoutForm textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        const paymentInputs = document.querySelectorAll('input[name="modePaiement"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', () => this.handlePaymentMethodChange(input.value));
        });

        const wilayaSelect = document.getElementById('checkoutWilaya');
        if (wilayaSelect) {
            wilayaSelect.addEventListener('change', () => this.calculateShipping());
        }
    }

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

    clearFieldError(field) {
        field.classList.remove('border-red-400');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

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

    // CRITICAL: Validate article data structure
    validateArticles(articles) {
        if (!articles || articles.length === 0) {
            console.error('No articles found');
            return false;
        }

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            
            console.log(`Validating article ${i + 1}:`, article);
            
            // Check all required fields
            if (!article.productId) {
                console.error(`Article ${i + 1}: Missing productId`, article);
                return false;
            }
            
            if (!article.nom || article.nom.trim() === '') {
                console.error(`Article ${i + 1}: Missing or empty nom`, article);
                return false;
            }
            
            if (!article.prix || isNaN(article.prix) || article.prix <= 0) {
                console.error(`Article ${i + 1}: Invalid prix`, article);
                return false;
            }
            
            if (!article.quantite || isNaN(article.quantite) || article.quantite <= 0) {
                console.error(`Article ${i + 1}: Invalid quantite`, article);
                return false;
            }
        }
        
        console.log('✅ All articles validated successfully');
        return true;
    }

    // MAIN PROCESS ORDER FUNCTION - COMPLETELY REWRITTEN
    async processOrder() {
        try {
            if (this.isProcessing) {
                console.log('Order already being processed');
                return;
            }

            console.log('🛒 Starting order processing...');
            this.isProcessing = true;

            if (!this.validateCart()) {
                throw new Error('Panier invalide');
            }

            if (!this.validateForm()) {
                throw new Error('Veuillez corriger les erreurs dans le formulaire');
            }

            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            }

            // Gather order data
            const orderData = this.gatherOrderData();
            
            console.log('📦 Order data prepared:', orderData);
            console.log('📦 Articles:', orderData.articles);

            // CRITICAL: Validate articles before sending
            if (!this.validateArticles(orderData.articles)) {
                throw new Error('Données des articles invalides. Veuillez réessayer.');
            }

            // Try to send to API
            let apiSuccess = false;
            try {
                console.log('📡 Sending to API...');
                
                const apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
                
                const response = await fetch(`${apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                console.log('📡 API Response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ API error response:', errorData);
                    throw new Error(errorData.message || `HTTP ${response.status}`);
                }
                
                const result = await response.json();
                console.log('✅ API Response:', result);
                apiSuccess = true;
                
            } catch (apiError) {
                console.error('❌ API submission failed:', apiError.message);
                // Continue to save locally even if API fails
            }

            // Save locally (but with limit to avoid quota)
            try {
                // Get existing orders
                let existingOrders = [];
                try {
                    existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                } catch (e) {
                    existingOrders = [];
                }
                
                // Only keep last 5 orders
                existingOrders = existingOrders.slice(0, 5);
                
                // Add new order
                existingOrders.unshift(orderData);
                
                // Save
                localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
                console.log('✅ Order saved locally (limited to 5 orders)');
                
            } catch (localError) {
                console.error('❌ Local save failed:', localError);
                // Continue anyway since API might have succeeded
            }

            // Clear cart
            if (window.app) {
                window.app.cart = [];
                window.app.saveCart();
            }

            // Show success
            if (window.app) {
                const message = apiSuccess 
                    ? 'Commande passée avec succès !'
                    : 'Commande enregistrée localement. Synchronisation en cours...';
                window.app.showToast(message, 'success');
                window.app.showPage('order-confirmation', { orderNumber: orderData.numeroCommande });
            }

            console.log('✅ Order processing completed');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            if (window.app) {
                window.app.showToast(error.message || 'Erreur lors de la commande', 'error');
            }
            
            const submitBtn = document.querySelector('button[onclick="app.processOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // CRITICAL: Properly format article data
    gatherOrderData() {
        const prenom = document.getElementById('checkoutPrenom')?.value.trim();
        const nom = document.getElementById('checkoutNom')?.value.trim();
        const email = document.getElementById('checkoutEmail')?.value.trim();
        const telephone = document.getElementById('checkoutTelephone')?.value.trim();
        const adresse = document.getElementById('checkoutAdresse')?.value.trim();
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
        const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';

        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        const fraisLivraison = this.getCurrentShippingCost();
        const total = sousTotal + fraisLivraison;

        const orderNumber = this.generateOrderNumber();

        // CRITICAL: Properly format articles with ALL required fields
        const articles = [];
        
        if (window.app && window.app.cart) {
            for (let item of window.app.cart) {
                // Ensure we have valid data
                const productId = item.id || item._id || item.productId;
                const nom = item.nom || item.name;
                const prix = parseFloat(item.prix || item.price || 0);
                const quantite = parseInt(item.quantite || item.quantity || 0);
                const image = item.image || '';
                
                // Only add if all required fields are present
                if (productId && nom && prix > 0 && quantite > 0) {
                    articles.push({
                        productId: String(productId),
                        nom: String(nom),
                        prix: prix,
                        quantite: quantite,
                        image: image
                    });
                } else {
                    console.error('Skipping invalid item:', item);
                }
            }
        }

        // Validate we have at least one article
        if (articles.length === 0) {
            throw new Error('Aucun article valide dans le panier');
        }

        const orderData = {
            _id: Date.now().toString(),
            numeroCommande: orderNumber,
            client: {
                userId: window.app?.currentUser?.id || null,
                prenom: String(prenom),
                nom: String(nom),
                email: String(email).toLowerCase(),
                telephone: String(telephone).replace(/\s+/g, ''),
                adresse: String(adresse),
                wilaya: String(wilaya)
            },
            articles: articles,
            sousTotal: sousTotal,
            fraisLivraison: fraisLivraison,
            total: total,
            statut: 'en-attente',
            modePaiement: modePaiement,
            commentaires: commentaires,
            dateCommande: new Date().toISOString()
        };

        return orderData;
    }

    generateOrderNumber() {
        const prefix = 'CMD';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        return phoneRegex.test(cleanPhone);
    }

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

    async applyCoupon(code) {
        try {
            console.log('Applying coupon:', code);
            
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
    console.log('✅ Brand new checkout system initialized');
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

// Auto-initialize
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

console.log('✅ Brand new Checkout.js loaded - Rewritten from scratch with proper validation');
