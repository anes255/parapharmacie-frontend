// Complete Checkout System with Official PREST Express Shipping Rates
// Based on PREST Express Tarification from Algiers

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
        
        // Official PREST Express shipping rates (Domicile - Home Delivery)
        // Departing from Algiers - Updated from official tarification table
        this.shippingRates = {
            // Zone 21 (400-850 DA)
            'Alger': 400,
            'Blida': 650,
            'Bouira': 650,
            'Boumerdès': 650,
            'Béjaïa': 750,
            'Tizi Ouzou': 750,
            'Tipaza': 650,
            'Mila': 750,
            'Aïn Defla': 700,
            'Bordj Bou Arreridj': 700,
            'Jijel': 750,
            'Skikda': 750,
            'Annaba': 800,
            'Guelma': 800,
            'Constantine': 750,
            'Mostaganem': 750,
            'Relizane': 700,
            'Oran': 750,
            'Chlef': 700,
            'Batna': 750,
            'Tlemcen': 850,
            'Sétif': 700,
            'El Tarf': 850,
            
            // Zone 22 (700-850 DA)
            'Médéa': 750,
            'Sidi Bel Abbès': 750,
            'Mascara': 750,
            'Oum El Bouaghi': 750,
            'Khenchela': 800,
            'Souk Ahras': 850,
            'Aïn Témouchent': 850,
            'Saïda': 800,
            'Ouargla': 1000,
            
            // Zone 23 (750-1200 DA)
            'Laghouat': 950,
            'Biskra': 950,
            'Tébessa': 850,
            'Tiaret': 750,
            'Djelfa': 950,
            'Naâma': 950,
            'Ghardaïa': 1000,
            'El Bayadh': 950,
            'Tissemsilt': 750,
            'El Oued': 950,
            'M\'Sila': 750,
            'Ouled Djellal': 1200,
            'Touggourt': 1200,
            'Djanet': 2400,
            
            // Zone 24 (1200-2400 DA)
            'Adrar': 1400,
            'Béchar': 1200,
            'Tamanrasset': 1800,
            'Tindouf': 1800,
            'Timimoun': 1800,
            'Béni Abbès': 1600,
            'In Salah': 1800,
            'Illizi': 1800,
            'El M\'Ghair': 1200,
            'El Meniaa': 1200
        };
    }

    init() {
        console.log('🚚 Initializing checkout with PREST Express rates...');
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
        const sousTotal = window.app ? window.app.cart.reduce((total, item) => total + (item.prix * item.quantite), 0) : 0;
        
        let fraisLivraison = 0;
        
        // Free shipping for orders over 5000 DA
        if (sousTotal >= 5000) {
            fraisLivraison = 0;
        } else if (wilaya) {
            // Get PREST Express rate for selected wilaya, default to 400 DA if not found
            fraisLivraison = this.shippingRates[wilaya] || 400;
        } else {
            fraisLivraison = 400; // Default Algiers rate
        }

        this.updateShippingDisplay(fraisLivraison);
        this.calculateTotals();
        
        return fraisLivraison;
    }

    updateShippingDisplay(fraisLivraison) {
        const shippingElement = document.getElementById('checkoutFraisLivraison');
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

        const sousTotal = window.app.cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
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
        const sousTotal = window.app ? window.app.cart.reduce((total, item) => total + (item.prix * item.quantite), 0) : 0;
        
        if (sousTotal >= 5000) {
            return 0;
        }
        
        return wilaya ? (this.shippingRates[wilaya] || 400) : 400;
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

            const prenom = document.getElementById('checkoutPrenom')?.value.trim();
            const nom = document.getElementById('checkoutNom')?.value.trim();
            const email = document.getElementById('checkoutEmail')?.value.trim().toLowerCase();
            const telephone = document.getElementById('checkoutTelephone')?.value.trim().replace(/\s+/g, '');
            const adresse = document.getElementById('checkoutAdresse')?.value.trim();
            const wilaya = document.getElementById('checkoutWilaya')?.value;
            const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
            const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';

            if (!prenom || !nom || !email || !telephone || !adresse || !wilaya) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            const sousTotal = window.app ? window.app.cart.reduce((total, item) => total + (item.prix * item.quantite), 0) : 0;
            const fraisLivraison = this.getCurrentShippingCost();
            const total = sousTotal + fraisLivraison;

            const orderNumber = this.generateOrderNumber();

            const orderData = {
                _id: Date.now().toString(),
                numeroCommande: orderNumber,
                client: {
                    userId: window.app?.currentUser?.id || null,
                    prenom: prenom,
                    nom: nom,
                    email: email,
                    telephone: telephone,
                    adresse: adresse,
                    wilaya: wilaya
                },
                articles: window.app ? window.app.cart.map(item => ({
                    productId: item.id,
                    nom: item.nom,
                    prix: parseFloat(item.prix),
                    quantite: parseInt(item.quantite),
                    image: item.image || ''
                })) : [],
                sousTotal: parseFloat(sousTotal),
                fraisLivraison: parseFloat(fraisLivraison),
                total: parseFloat(total),
                statut: 'en-attente',
                modePaiement: modePaiement,
                commentaires: commentaires,
                dateCommande: new Date().toISOString()
            };

            console.log('📦 Order data prepared:', orderData);

            // Save locally first
            if (window.addOrderToDemo) {
                const localOrder = window.addOrderToDemo(orderData);
                if (localOrder) {
                    console.log('✅ Order saved locally');
                }
            }

            // Try API save
            try {
                const API_BASE_URL = window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000/api'
                    : 'https://parapharmacie-gaher.onrender.com/api';

                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                if (response.ok) {
                    console.log('✅ Order saved to API');
                } else {
                    const errorData = await response.json();
                    console.log('⚠️ API save failed:', errorData.message);
                }
            } catch (apiError) {
                console.log('⚠️ API unavailable:', apiError.message);
            }

            // Save to user history
            if (window.app && window.app.currentUser) {
                this.saveToUserOrders(orderData);
            }

            // Clear cart
            if (window.app) {
                window.app.clearCart();
            }

            // Success
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
        } finally {
            this.isProcessing = false;
        }
    }

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

// Global instance
let checkoutSystem;

function initCheckout() {
    checkoutSystem = new CheckoutSystem();
    checkoutSystem.init();
    window.checkoutSystem = checkoutSystem;
    console.log('✅ Checkout initialized with PREST Express rates');
}

window.initCheckout = initCheckout;
window.checkoutSystem = checkoutSystem;

console.log('✅ Checkout.js loaded with official PREST Express rates');
