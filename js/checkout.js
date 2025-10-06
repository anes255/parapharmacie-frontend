
class CheckoutSystem {
    constructor(app) {
        this.app = app;
        this.shippingCost = 400; // Default shipping cost in DA
        this.apiBaseUrl = 'https://parapharmacie-gaher.onrender.com/api';
    }
    
    /**
     * Initialize the checkout system
     */
    init() {
        console.log('🛒 Initializing checkout system...');
        this.setupEventListeners();
        this.updateOrderSummary();
    }
    
    /**
     * Setup event listeners for checkout page
     */
    setupEventListeners() {
        const wilayaSelect = document.getElementById('checkoutWilaya');
        if (wilayaSelect) {
            wilayaSelect.addEventListener('change', () => this.updateShippingCost());
        }
    }
    
    /**
     * Update shipping cost based on wilaya (can be customized)
     */
    updateShippingCost() {
        // You can implement different shipping costs per wilaya here
        // For now, using fixed cost
        this.updateOrderSummary();
    }
    
    /**
     * Update the order summary display
     */
    updateOrderSummary() {
        const cartTotal = this.app.getCartTotal();
        const shippingCost = this.shippingCost;
        const total = cartTotal + shippingCost;
        
        const sousTotal = document.getElementById('checkoutSousTotal');
        const fraisLivraison = document.getElementById('checkoutFraisLivraison');
        const totalElement = document.getElementById('checkoutTotal');
        
        if (sousTotal) sousTotal.textContent = `${cartTotal} DA`;
        if (fraisLivraison) fraisLivraison.textContent = `${shippingCost} DA`;
        if (totalElement) totalElement.textContent = `${total} DA`;
    }
    
    /**
     * Validate the checkout form
     */
    validateForm() {
        const requiredFields = [
            { id: 'checkoutPrenom', name: 'Prénom' },
            { id: 'checkoutNom', name: 'Nom' },
            { id: 'checkoutEmail', name: 'Email' },
            { id: 'checkoutTelephone', name: 'Téléphone' },
            { id: 'checkoutAdresse', name: 'Adresse' },
            { id: 'checkoutWilaya', name: 'Wilaya' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                this.app.showToast(`Le champ "${field.name}" est requis`, 'error');
                element?.focus();
                return false;
            }
        }
        
        // Validate email
        const email = document.getElementById('checkoutEmail').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.app.showToast('Email invalide', 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * Process the order
     */
    async processOrder() {
        console.log('🔄 Processing order...');
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Check if cart is empty
        if (!this.app.cart || this.app.cart.length === 0) {
            this.app.showToast('Votre panier est vide', 'error');
            return;
        }
        
        // Prepare order data
        const orderData = this.prepareOrderData();
        
        console.log('📦 Order data prepared:', orderData);
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Submit order to API
            const result = await this.submitOrderToAPI(orderData);
            
            // Success - clear cart and show confirmation
            this.app.clearCart();
            this.app.showToast('Commande confirmée !', 'success');
            
            // Redirect to confirmation page
            setTimeout(() => {
                this.app.showPage('order-confirmation', { 
                    orderNumber: result.orderNumber 
                });
            }, 500);
            
        } catch (error) {
            console.error('❌ Order submission error:', error);
            this.app.showToast(error.message || 'Erreur lors de la commande', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * Prepare order data in the exact format the backend expects
     */
    prepareOrderData() {
        // Get form values
        const prenom = document.getElementById('checkoutPrenom').value.trim();
        const nom = document.getElementById('checkoutNom').value.trim();
        const email = document.getElementById('checkoutEmail').value.trim();
        const telephone = document.getElementById('checkoutTelephone').value.trim();
        const adresse = document.getElementById('checkoutAdresse').value.trim();
        const wilaya = document.getElementById('checkoutWilaya').value;
        const commentaires = document.getElementById('checkoutCommentaires')?.value.trim() || '';
        const modePaiement = document.querySelector('input[name="modePaiement"]:checked')?.value || 'Paiement à la livraison';
        
        // Calculate totals
        const cartTotal = this.app.getCartTotal();
        const shippingCost = this.shippingCost;
        const total = cartTotal + shippingCost;
        
        // Generate unique order number
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const numeroCommande = `CMD${timestamp}${random}`;
        
        // Format articles array exactly as backend expects
        const articles = this.app.cart.map(item => ({
            productId: String(item.id), // Ensure it's a string
            nom: item.nom,
            prix: parseFloat(item.prix),
            quantite: parseInt(item.quantite),
            image: item.image || ''
        }));
        
        // Build order data object matching backend Order schema
        const orderData = {
            // Order identification - CRITICAL: Include BOTH fields
            numeroCommande: numeroCommande,
            orderNumber: numeroCommande, // Backend database has index on this field
            
            // Client information
            client: {
                prenom: prenom,
                nom: nom,
                email: email,
                telephone: telephone,
                adresse: adresse,
                wilaya: wilaya,
                ville: '',
                codePostal: ''
            },
            
            // Order items - backend expects field name 'articles'
            articles: articles,
            
            // Pricing
            sousTotal: parseFloat(cartTotal),
            fraisLivraison: parseFloat(shippingCost),
            total: parseFloat(total),
            
            // Payment and notes
            modePaiement: modePaiement,
            commentaires: commentaires
        };
        
        // Log for debugging
        console.log('✅ Order data formatted:');
        console.log('   - numeroCommande:', orderData.numeroCommande);
        console.log('   - orderNumber:', orderData.orderNumber);
        console.log('   - articles count:', orderData.articles.length);
        console.log('   - total:', orderData.total);
        
        return orderData;
    }
    
    /**
     * Submit order to the API
     */
    async submitOrderToAPI(orderData) {
        const token = localStorage.getItem('token');
        const url = `${this.apiBaseUrl}/orders`;
        
        console.log('📤 Submitting order to:', url);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token && { 'x-auth-token': token })
                },
                body: JSON.stringify(orderData)
            });
            
            console.log('📥 Response status:', response.status);
            
            // Parse response
            let data;
            try {
                data = await response.json();
                console.log('📥 Response data:', data);
            } catch (e) {
                console.error('Failed to parse response:', e);
                throw new Error('Invalid server response');
            }
            
            // Check if request was successful
            if (!response.ok) {
                const errorMessage = data.message || data.error || data.msg || `Erreur ${response.status}`;
                console.error('❌ API Error:', errorMessage);
                console.error('❌ Full error details:', data);
                throw new Error(errorMessage);
            }
            
            // Success
            console.log('✅ Order submitted successfully');
            const orderNumber = data.order?.numeroCommande || data.order?.orderNumber || orderData.numeroCommande;
            
            // Save locally as backup
            this.saveOrderLocally({
                ...orderData,
                _id: data.order?._id,
                statut: 'en-attente',
                createdAt: new Date().toISOString()
            });
            
            return { orderNumber };
            
        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Fallback: Save locally
            console.log('💾 Saving order locally as fallback...');
            this.saveOrderLocally({
                ...orderData,
                statut: 'en-attente',
                createdAt: new Date().toISOString()
            });
            
            // Still throw error to show user
            throw error;
        }
    }
    
    /**
     * Save order locally for admin panel access
     */
    saveOrderLocally(orderData) {
        try {
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            
            const localOrder = {
                numero: orderData.numeroCommande || orderData.orderNumber,
                _id: orderData._id,
                client: orderData.client,
                produits: orderData.articles || [],
                articles: orderData.articles || [],
                total: orderData.total,
                sousTotal: orderData.sousTotal,
                fraisLivraison: orderData.fraisLivraison,
                statut: orderData.statut || 'en-attente',
                modePaiement: orderData.modePaiement,
                commentaires: orderData.commentaires,
                createdAt: orderData.createdAt || new Date().toISOString()
            };
            
            adminOrders.push(localOrder);
            localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
            console.log('💾 Order saved locally');
        } catch (error) {
            console.error('Failed to save order locally:', error);
        }
    }
    
    /**
     * Set loading state for the page
     */
    setLoadingState(isLoading) {
        const submitButton = document.querySelector('button[onclick*="processOrder"]');
        const allButtons = document.querySelectorAll('button, input[type="submit"]');
        
        allButtons.forEach(btn => {
            btn.disabled = isLoading;
        });
        
        if (submitButton) {
            if (isLoading) {
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            } else {
                submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmer la commande';
            }
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckoutSystem;
}

// Make globally available
window.CheckoutSystem = CheckoutSystem;

console.log('✅ Checkout system loaded successfully');
