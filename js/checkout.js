// Complete Fixed Checkout System for Shifa Parapharmacie with All 58 Algerian Wilayas

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {};
        this.isProcessing = false;
        
        // Shipping rates for all 58 Algerian wilayas
        this.shippingRates = {
            // Major cities - Lower rates
            'Alger': 250, 'Oran': 300, 'Constantine': 350, 'Annaba': 350,
            'Blida': 250, 'Batna': 350, 'Sétif': 350, 'Sidi Bel Abbès': 350,
            
            // Coastal wilayas
            'Tipaza': 200, 'Boumerdès': 250, 'Béjaïa': 350, 'Jijel': 400,
            'Skikda': 400, 'Mostaganem': 350, 'Chlef': 350, 'Aïn Témouchent': 350,
            'Tlemcen': 400, 'El Tarf': 450,
            
            // Center wilayas
            'Médéa': 300, 'Bouira': 350, 'Tizi Ouzou': 350, 'Bordj Bou Arreridj': 350,
            'Aïn Defla': 350, 'Tissemsilt': 400, 'Tiaret': 400, 'Relizane': 400,
            'Djelfa': 400, 'M\'Sila': 400, 'Mila': 400,
            
            // East wilayas
            'Oum El Bouaghi': 400, 'Tébessa': 450, 'Khenchela': 450, 'Souk Ahras': 450,
            'Guelma': 400, 'Biskra': 450, 'El Oued': 500,
            
            // West wilayas
            'Mascara': 400, 'Saïda': 400, 'Naâma': 500, 'El Bayadh': 500,
            
            // South wilayas - Higher rates due to distance
            'Laghouat': 500, 'Ouargla': 600, 'Ghardaïa': 550, 'Béchar': 650,
            'Tamanrasset': 800, 'Adrar': 700, 'Illizi': 800, 'Tindouf': 750,
            
            // New wilayas (2019-2021)
            'Timimoun': 700, 'Bordj Badji Mokhtar': 850, 'Ouled Djellal': 550,
            'Béni Abbès': 750, 'In Salah': 800, 'In Guezzam': 900,
            'Touggourt': 550, 'Djanet': 850, 'El M\'Ghair': 600, 'El Meniaa': 650
        };
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

    // Calculate shipping costs based on wilaya
    calculateShipping() {
        const wilaya = document.getElementById('checkoutWilaya')?.value;
        const sousTotal = window.app ? window.app.getCartTotal() : 0;
        
        let fraisLivraison = 0;
        
        // Free shipping for orders over 5000 DA
        if (sousTotal >= 5000) {
            fraisLivraison = 0;
        } else if (wilaya) {
            // Get rate for selected wilaya, default to 400 DA if not found
            fraisLivraison = this.shippingRates[wilaya] || 400;
        } else {
            fraisLivraison = 300; // Default
        }

        this.updateShippingDisplay(fraisLivraison);
        this.calculateTotals();
        
        return fraisLivraison;
    }

    // Update shipping display
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
        
        return wilaya ? (this.shippingRates[wilaya] || 400) : 300;
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

    // Process the order - FIXED VERSION
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

            // Gather form data - ENSURE ALL REQUIRED FIELDS
            const prenom = document.getElementById('checkoutPrenom')?.value.trim();
            const nom = document.getElementById('checkoutNom')?.value.trim();
            const email = document.getElementById('checkoutEmail')?.value.trim().toLowerCase();
            const telephone = document.getElementById('checkoutTelephone')?.value.trim().replace(/\s+/g, '');
            const adresse = document.getElementById('checkoutAdresse')?.value.trim();
            const wilaya = document.getElementById('checkoutWilaya')?.value;
            const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
            const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';

            // Validate all required fields exist
            if (!prenom || !nom || !email || !telephone || !adresse || !wilaya) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            // Calculate totals
            const sousTotal = window.app ? window.app.getCartTotal() : 0;
            const fraisLivraison = this.getCurrentShippingCost();
            const total = sousTotal + fraisLivraison;

            // Generate order number
            const orderNumber = this.generateOrderNumber();

            // Prepare order data with ALL required fields
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

            // Always save locally first for admin panel
            if (window.addOrderToDemo) {
                const localOrder = window.addOrderToDemo(orderData);
                if (localOrder) {
                    console.log('✅ Order saved locally for admin panel');
                }
            }

            // Try to save to API (but don't fail if API is down)
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
                    console.log('✅ Order saved to API successfully');
                } else {
                    const errorData = await response.json();
                    console.log('⚠️ API save failed but order saved locally:', errorData.message);
                }
            } catch (apiError) {
                console.log('⚠️ API unavailable, but order saved locally:', apiError.message);
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
        } finally {
            this.isProcessing = false;
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
}

// Global checkout system instance
let checkoutSystem;

// Initialize checkout when page loads
function initCheckout() {
    checkoutSystem = new CheckoutSystem();
    checkoutSystem.init();
    window.checkoutSystem = checkoutSystem;
    console.log('✅ Checkout system initialized with all 58 Algerian wilayas');
}

// Export for global access
window.initCheckout = initCheckout;
window.checkoutSystem = checkoutSystem;

console.log('✅ Fixed Checkout.js loaded successfully with all wilayas');
