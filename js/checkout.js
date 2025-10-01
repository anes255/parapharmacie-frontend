// Complete Checkout System for Shifa Parapharmacie - API Integrated

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
        const shippingElement = document.getElementById('checkoutFraisLivraison');
        if (shippingElement) {
            if (fraisLivraison === 0) {
                shippingElement.innerHTML = '<span class="text-green-600 font-semibold">GRATUIT</span>';
            } else {
                shippingElement.textContent = `${fraisLivraison} DA`;
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
        if (elements.fraisLivraison) {
            if (fraisLivraison === 0) {
                elements.fraisLivraison.innerHTML = '<span class="text-green-600 font-semibold">GRATUIT</span>';
            } else {
                elements.fraisLivraison.textContent = `${fraisLivraison} DA`;
            }
        }
        if (elements.total) elements.total.textContent = `${total} DA`;
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

    // MAIN PROCESS ORDER - SAVES TO API
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

            const submitBtn = document.querySelector('button[onclick*="processOrder"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi au serveur...';
            }

            const orderData = this.gatherOrderData();
            
            console.log('📦 Order data to send:', orderData);

            // SAVE TO API - THIS IS THE CRITICAL PART
            console.log('📡 Sending order to API...');
            const apiResponse = await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            
            console.log('✅ Order saved to API successfully:', apiResponse);

            // Also save locally as backup
            if (window.addOrderToDemo) {
                window.addOrderToDemo(orderData);
                console.log('✅ Order saved locally as backup');
            }

            if (window.app && window.app.currentUser) {
                this.saveToUserOrders(orderData);
            }

            if (window.app) {
                window.app.clearCart();
            }

            if (window.app) {
                window.app.showToast('✅ Commande enregistrée dans la base de données !', 'success');
                
                setTimeout(() => {
                    window.app.showPage('order-confirmation', { 
                        orderNumber: apiResponse.numeroCommande || orderData.numeroCommande 
                    });
                }, 1000);
            }

            console.log('✅ Order processing completed successfully');

        } catch (error) {
            console.error('❌ Error processing order:', error);
            
            if (window.app) {
                window.app.showToast(
                    '❌ Erreur: ' + (error.message || 'Impossible d\'enregistrer la commande'), 
                    'error'
                );
            }
            
            const submitBtn = document.querySelector('button[onclick*="processOrder"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        } finally {
            this.isProcessing = false;
        }
    }

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

        const orderData = {
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
            total,
            statut: 'en-attente',
            modePaiement,
            commentaires,
            dateCommande: new Date().toISOString()
        };

        return orderData;
    }

    saveToUserOrders(orderData) {
        if (!window.app?.currentUser?._id) return;

        try {
            const userOrdersKey = `userOrders_${window.app.currentUser._id}`;
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
}

let checkoutSystem;

function initCheckout() {
    checkoutSystem = new CheckoutSystem();
    checkoutSystem.init();
    window.checkoutSystem = checkoutSystem;
    console.log('✅ Checkout system initialized');
}

window.processCheckoutOrder = function() {
    console.log('processCheckoutOrder called');
    if (checkoutSystem) {
        return checkoutSystem.processOrder();
    } else {
        console.error('Checkout system not initialized');
        if (window.app) {
            window.app.showToast('Système de commande non initialisé', 'error');
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}

window.initCheckout = initCheckout;
window.checkoutSystem = checkoutSystem;

console.log('✅ Checkout.js loaded successfully - API integrated');
