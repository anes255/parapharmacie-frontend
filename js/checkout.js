// Enhanced Checkout System for Shifa Parapharmacie
class PharmacieGaherApp {
    // Method to load checkout page with beautiful design
    async loadCheckoutPage() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'warning');
            this.showPage('products');
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-8 max-w-7xl">
                    <!-- Checkout Header -->
                    <div class="text-center mb-12">
                        <div class="flex justify-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/80">
                                <i class="fas fa-shopping-cart text-white text-3xl"></i>
                            </div>
                        </div>
                        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-4">
                            Finaliser votre commande
                        </h1>
                        <p class="text-xl text-emerald-600">Nous livrons partout en Algérie avec soin</p>
                        <div class="flex justify-center mt-6">
                            <div class="flex items-center space-x-8 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-emerald-200/50">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                        <i class="fas fa-check text-white text-sm"></i>
                                    </div>
                                    <span class="text-emerald-700 font-semibold">Panier</span>
                                </div>
                                <div class="w-8 h-1 bg-emerald-300 rounded"></div>
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                        <span class="text-white font-bold text-sm">2</span>
                                    </div>
                                    <span class="text-emerald-700 font-semibold">Livraison</span>
                                </div>
                                <div class="w-8 h-1 bg-emerald-200 rounded"></div>
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center mr-2">
                                        <span class="text-emerald-600 font-bold text-sm">3</span>
                                    </div>
                                    <span class="text-emerald-500">Confirmation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Left Column - Forms -->
                        <div class="lg:col-span-2 space-y-8">
                            <!-- Client Information -->
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                                <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-user mr-3"></i>
                                        Informations personnelles
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <form id="checkoutForm" class="space-y-6">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Nom *</label>
                                                <input type="text" name="nom" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Votre nom de famille">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Prénom</label>
                                                <input type="text" name="prenom" 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Votre prénom">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Téléphone *</label>
                                                <input type="tel" name="telephone" required 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="+213 XXX XXX XXX">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Email (optionnel)</label>
                                                <input type="email" name="email" 
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="votre@email.com">
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                            <!-- Delivery Address -->
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 overflow-hidden">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-map-marker-alt mr-3"></i>
                                        Adresse de livraison
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <div class="space-y-6">
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Wilaya *</label>
                                            <select name="wilaya" required form="checkoutForm"
                                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm">
                                                <option value="">Sélectionnez votre wilaya</option>
                                                ${this.getAlgerianWilayas().map(w => `<option value="${w}">${w}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Ville</label>
                                                <input type="text" name="ville" form="checkoutForm"
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="Nom de votre ville">
                                            </div>
                                            <div>
                                                <label class="block text-emerald-700 font-semibold mb-2">Code postal</label>
                                                <input type="text" name="codePostal" form="checkoutForm"
                                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                       placeholder="16000">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Adresse complète *</label>
                                            <textarea name="adresse" required rows="3" form="checkoutForm"
                                                      class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm resize-none"
                                                      placeholder="Rue, quartier, numéro de bâtiment..."></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-emerald-700 font-semibold mb-2">Complément d'adresse</label>
                                            <input type="text" name="complementAdresse" form="checkoutForm"
                                                   class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white/80 backdrop-blur-sm"
                                                   placeholder="Étage, interphone, code d'accès...">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column - Order Summary -->
                        <div class="lg:col-span-1">
                            <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 sticky top-8 overflow-hidden">
                                <div class="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6">
                                    <h2 class="text-2xl font-bold text-white flex items-center">
                                        <i class="fas fa-receipt mr-3"></i>
                                        Récapitulatif
                                    </h2>
                                </div>
                                <div class="p-8">
                                    <!-- Cart Items -->
                                    <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                        ${this.cart.map(item => `
                                            <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50">
                                                <img src="${item.image}" alt="${item.nom}" 
                                                     class="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-lg">
                                                <div class="flex-1">
                                                    <h4 class="font-bold text-emerald-800 text-sm line-clamp-2">${item.nom}</h4>
                                                    <div class="flex items-center justify-between mt-2">
                                                        <span class="text-emerald-600 font-semibold">${item.prix} DA</span>
                                                        <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">×${item.quantite}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <!-- Totals -->
                                    <div class="border-t-2 border-emerald-200 pt-6 space-y-4">
                                        <div class="flex justify-between text-emerald-700">
                                            <span class="font-semibold">Sous-total:</span>
                                            <span class="font-bold">${this.getCartTotal()} DA</span>
                                        </div>
                                        <div class="flex justify-between text-emerald-700">
                                            <span class="font-semibold">Frais de livraison:</span>
                                            <span class="font-bold" id="shippingCost">${this.getCartTotal() >= 5000 ? '0' : '300'} DA</span>
                                        </div>
                                        ${this.getCartTotal() >= 5000 ? `
                                            <div class="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-l-4 border-green-500">
                                                <p class="text-green-700 font-semibold text-sm flex items-center">
                                                    <i class="fas fa-gift mr-2"></i>
                                                    Livraison gratuite !
                                                </p>
                                            </div>
                                        ` : `
                                            <div class="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-xl border-l-4 border-yellow-500">
                                                <p class="text-yellow-700 text-sm">
                                                    <i class="fas fa-info-circle mr-2"></i>
                                                    Plus que <strong>${5000 - this.getCartTotal()} DA</strong> pour la livraison gratuite
                                                </p>
                                            </div>
                                        `}
                                        <div class="flex justify-between text-lg font-bold text-emerald-800 border-t-2 border-emerald-300 pt-4">
                                            <span>Total:</span>
                                            <span id="finalTotal" class="text-2xl">${this.getCartTotal() + (this.getCartTotal() >= 5000 ? 0 : 300)} DA</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Order Button -->
                                    <div class="mt-8">
                                        <button type="submit" form="checkoutForm" 
                                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg">
                                            <span id="orderButtonText">
                                                <i class="fas fa-check-circle mr-3"></i>
                                                Confirmer la commande
                                            </span>
                                            <div id="orderSpinner" class="hidden">
                                                <i class="fas fa-spinner fa-spin mr-3"></i>
                                                Traitement en cours...
                                            </div>
                                        </button>
                                        <p class="text-center text-emerald-600 text-sm mt-4">
                                            <i class="fas fa-shield-alt mr-1"></i>
                                            Commande sécurisée • Paiement à la livraison
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add form handler
        this.initCheckoutForm();
    }
    
    getAlgerianWilayas() {
        return [
            "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
            "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
            "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
            "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
            "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
            "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
            "Ghardaïa", "Relizane"
        ];
    }
    
    initCheckoutForm() {
        const form = document.getElementById('checkoutForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processOrder(e);
        });
        
        // Pre-fill if user is logged in
        if (this.currentUser) {
            form.nom.value = this.currentUser.nom || '';
            form.prenom.value = this.currentUser.prenom || '';
            form.telephone.value = this.currentUser.telephone || '';
            form.email.value = this.currentUser.email || '';
            
            if (this.currentUser.adresse) {
                form.adresse.value = this.currentUser.adresse;
            }
            if (this.currentUser.wilaya) {
                form.wilaya.value = this.currentUser.wilaya;
            }
        }
    }
    
    async processOrder(event) {
        const form = event.target;
        const formData = new FormData(form);
        
        // Get form data
        const clientInfo = {
            nom: formData.get('nom').trim(),
            prenom: formData.get('prenom').trim(),
            telephone: formData.get('telephone').trim(),
            email: formData.get('email').trim()
        };
        
        const adresseLivraison = {
            adresse: formData.get('adresse').trim(),
            ville: formData.get('ville').trim(),
            wilaya: formData.get('wilaya'),
            codePostal: formData.get('codePostal').trim(),
            complementAdresse: formData.get('complementAdresse').trim()
        };
        
        // Validation
        if (!clientInfo.nom || !clientInfo.telephone || !adresseLivraison.adresse || !adresseLivraison.wilaya) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Phone validation
        const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
        if (!phoneRegex.test(clientInfo.telephone.replace(/\s+/g, ''))) {
            this.showToast('Veuillez entrer un numéro de téléphone algérien valide', 'error');
            return;
        }
        
        // Email validation (if provided)
        if (clientInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
            this.showToast('Veuillez entrer un email valide', 'error');
            return;
        }
        
        // Show loading state
        this.showOrderLoading(true);
        
        try {
            // Calculate totals
            const sousTotal = this.getCartTotal();
            const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
            const total = sousTotal + fraisLivraison;
            
            // Prepare order data
            const orderData = {
                produits: this.cart.map(item => ({
                    produit: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.quantite,
                    image: item.image
                })),
                clientInfo,
                adresseLivraison,
                sousTotal,
                fraisLivraison,
                total
            };
            
            console.log('📤 Sending order to backend:', orderData);
            
            // Submit order with retry logic
            const maxAttempts = 3;
            let lastError;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`📡 Attempt ${attempt}/${maxAttempts}: Submitting order to backend...`);
                    
                    const response = await apiCall('/orders', {
                        method: 'POST',
                        body: JSON.stringify(orderData)
                    });
                    
                    console.log('✅ Order created successfully:', response);
                    
                    // Clear cart and redirect to confirmation
                    this.clearCart();
                    this.showToast('Commande créée avec succès !', 'success');
                    this.showPage('order-confirmation', { orderNumber: response.numeroCommande });
                    return;
                    
                } catch (error) {
                    console.log(`⚠️ Backend attempt ${attempt} failed:`, error.message);
                    lastError = error;
                    
                    if (attempt < maxAttempts) {
                        console.log(`🔄 Retrying in ${2 * attempt} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                    }
                }
            }
            
            console.log('❌ All backend attempts failed');
            
            // Fallback: Save order locally
            const localOrder = {
                id: Date.now().toString(),
                numeroCommande: `LOCAL-${Date.now()}`,
                ...orderData,
                dateCommande: new Date().toISOString(),
                statut: 'en-attente-serveur'
            };
            
            // Save to localStorage for later sync
            const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
            pendingOrders.push(localOrder);
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
            
            // Also save to admin orders for immediate visibility
            const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            adminOrders.push(localOrder);
            localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
            
            console.log('💾 Order saved locally:', localOrder.numeroCommande);
            
            this.clearCart();
            this.showToast('Commande enregistrée localement. Nous vous contacterons sous peu.', 'success');
            this.showPage('order-confirmation', { orderNumber: localOrder.numeroCommande });
            
        } catch (error) {
            console.error('❌ Order processing error:', error);
            this.showToast('Une erreur est survenue. Veuillez réessayer ou nous contacter.', 'error');
        } finally {
            this.showOrderLoading(false);
        }
    }
    
    showOrderLoading(show) {
        const orderButtonText = document.getElementById('orderButtonText');
        const orderSpinner = document.getElementById('orderSpinner');
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (show) {
            orderButtonText.classList.add('hidden');
            orderSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            orderButtonText.classList.remove('hidden');
            orderSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    // Method to load order confirmation page
    async loadOrderConfirmationPage(orderNumber) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <div class="container mx-auto px-4 py-16 max-w-4xl">
                    <div class="text-center mb-12">
                        <!-- Success Animation -->
                        <div class="flex justify-center mb-8">
                            <div class="relative">
                                <div class="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                    <i class="fas fa-check text-white text-5xl"></i>
                                </div>
                                <div class="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                                    <i class="fas fa-star text-white text-xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-6">
                            Commande confirmée !
                        </h1>
                        <p class="text-2xl text-emerald-600 mb-8">Merci pour votre confiance</p>
                        
                        <!-- Order Number -->
                        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                            <div class="flex items-center justify-center mb-6">
                                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                                    <i class="fas fa-receipt text-white text-2xl"></i>
                                </div>
                                <div class="text-left">
                                    <p class="text-emerald-600 font-semibold">Numéro de commande</p>
                                    <p class="text-3xl font-bold text-emerald-800" id="orderNumberDisplay">${orderNumber}</p>
                                </div>
                            </div>
                            
                            <div class="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-6 border border-emerald-200">
                                <h3 class="text-xl font-bold text-emerald-800 mb-4">📱 Prochaines étapes</h3>
                                <div class="space-y-3 text-left">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-phone text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Nous vous contacterons dans les 2 heures pour confirmer votre commande</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-truck text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Livraison sous 24-48h (selon votre wilaya)</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-emerald-300 rounded-full flex items-center justify-center mr-4">
                                            <i class="fas fa-money-bill-wave text-white text-sm"></i>
                                        </div>
                                        <span class="text-emerald-700">Paiement à la livraison (espèces uniquement)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Contact Info -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 mb-8">
                            <h3 class="text-xl font-bold text-emerald-800 mb-4">📞 Besoin d'aide ?</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="text-center">
                                    <i class="fas fa-phone-alt text-2xl text-emerald-500 mb-2"></i>
                                    <p class="font-semibold text-emerald-700">Téléphone</p>
                                    <p class="text-emerald-600">+213 123 456 789</p>
                                </div>
                                <div class="text-center">
                                    <i class="fas fa-envelope text-2xl text-emerald-500 mb-2"></i>
                                    <p class="font-semibold text-emerald-700">Email</p>
                                    <p class="text-emerald-600">pharmaciegaher@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="app.showPage('home')" 
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-home mr-2"></i>
                                Retour à l'accueil
                            </button>
                            <button onclick="app.showPage('products')" 
                                    class="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Continuer mes achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global function to copy order number
function copyOrderNumber() {
    const orderNumber = document.getElementById('orderNumberDisplay').textContent;
    navigator.clipboard.writeText(orderNumber).then(() => {
        if (window.app) {
            window.app.showToast('Numéro de commande copié !', 'success');
        }
    });
}

console.log('✅ Enhanced checkout system loaded');
