// Complete Checkout System with Order Storage for Admin - COMPLETE VERSION

PharmacieGaherApp.prototype.loadCheckoutPage = async function() {
    if (this.cart.length === 0) {
        this.showToast('Votre panier est vide', 'warning');
        this.showPage('products');
        return;
    }
    
    const wilayas = [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 
        'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 
        'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 
        'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 
        'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 
        'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumeerdès', 
        'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 
        'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 
        'Ghardaïa', 'Relizane'
    ];
    
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-emerald-900 mb-4">Finaliser la commande</h1>
                
                <!-- Étapes -->
                <div class="flex items-center space-x-4 mb-8">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            1
                        </div>
                        <span class="ml-2 text-sm font-medium text-emerald-600">Panier</span>
                    </div>
                    <div class="flex-1 h-1 bg-emerald-600"></div>
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            2
                        </div>
                        <span class="ml-2 text-sm font-medium text-emerald-600">Informations</span>
                    </div>
                    <div class="flex-1 h-1 bg-gray-200"></div>
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            3
                        </div>
                        <span class="ml-2 text-sm font-medium text-gray-600">Confirmation</span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Formulaire de commande -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Informations personnelles -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h2 class="text-xl font-semibold text-emerald-800 mb-6">
                            <i class="fas fa-user mr-2"></i>
                            Informations personnelles
                        </h2>
                        
                        <form id="checkoutForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="checkoutNom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        Nom *
                                    </label>
                                    <input type="text" id="checkoutNom" name="nom" required
                                           value="${this.currentUser ? this.currentUser.nom : ''}"
                                           class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" placeholder="Votre nom">
                                </div>
                                
                                <div>
                                    <label for="checkoutPrenom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                        Prénom *
                                    </label>
                                    <input type="text" id="checkoutPrenom" name="prenom" required
                                           value="${this.currentUser ? this.currentUser.prenom : ''}"
                                           class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" placeholder="Votre prénom">
                                </div>
                            </div>
                            
                            <div>
                                <label for="checkoutEmail" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Email *
                                </label>
                                <input type="email" id="checkoutEmail" name="email" required
                                       value="${this.currentUser ? this.currentUser.email : ''}"
                                       class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" placeholder="votre@email.com">
                            </div>
                            
                            <div>
                                <label for="checkoutTelephone" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Téléphone *
                                </label>
                                <input type="tel" id="checkoutTelephone" name="telephone" required
                                       value="${this.currentUser ? (this.currentUser.telephone || '') : ''}"
                                       class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" placeholder="+213 xxx xxx xxx">
                            </div>
                            
                            <div>
                                <label for="checkoutAdresse" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Adresse complète *
                                </label>
                                <input type="text" id="checkoutAdresse" name="adresse" required
                                       value="${this.currentUser ? (this.currentUser.adresse || '') : ''}"
                                       class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800" placeholder="Rue, ville, code postal">
                            </div>
                            
                            <div>
                                <label for="checkoutWilaya" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Wilaya *
                                </label>
                                <select id="checkoutWilaya" name="wilaya" required class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800">
                                    <option value="">Sélectionnez votre wilaya</option>
                                    ${wilayas.map(wilaya => `
                                        <option value="${wilaya}" ${this.currentUser && this.currentUser.wilaya === wilaya ? 'selected' : ''}>
                                            ${wilaya}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label for="checkoutCommentaires" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Commentaires (optionnel)
                                </label>
                                <textarea id="checkoutCommentaires" name="commentaires" rows="3"
                                          class="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-emerald-800 resize-none" 
                                          placeholder="Instructions de livraison, commentaires..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Mode de paiement -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h2 class="text-xl font-semibold text-emerald-800 mb-6">
                            <i class="fas fa-credit-card mr-2"></i>
                            Mode de paiement
                        </h2>
                        
                        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div class="flex items-center">
                                <input type="radio" id="cashPayment" name="payment" value="cash" checked
                                       class="text-emerald-600 focus:ring-emerald-600">
                                <label for="cashPayment" class="ml-3">
                                    <div class="flex items-center">
                                        <i class="fas fa-money-bill-wave text-green-600 mr-3"></i>
                                        <div>
                                            <p class="font-medium text-gray-900">Paiement à la livraison</p>
                                            <p class="text-sm text-gray-600">Payez en espèces lors de la réception</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div class="flex items-start">
                                <i class="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
                                <div class="text-sm text-blue-700">
                                    <p class="font-medium">Important :</p>
                                    <p>Le paiement s'effectue uniquement à la livraison. Aucun paiement en ligne n'est requis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Résumé de la commande -->
                <div class="lg:col-span-1">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6 sticky top-4">
                        <h2 class="text-xl font-semibold text-emerald-800 mb-6">
                            <i class="fas fa-shopping-bag mr-2"></i>
                            Résumé de la commande
                        </h2>
                        
                        <!-- Articles -->
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
                                    <img src="${item.image}" alt="${item.nom}" 
                                         class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800 text-sm line-clamp-2">${item.nom}</h4>
                                        <p class="text-sm text-emerald-600">
                                            ${item.quantite} × ${item.prix} DA
                                        </p>
                                        <p class="text-sm font-medium text-emerald-800">
                                            ${item.quantite * item.prix} DA
                                        </p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Totaux -->
                        <div class="border-t border-emerald-200 pt-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-emerald-600">Sous-total :</span>
                                <span id="checkoutSubtotal" class="text-emerald-800">${this.getCartTotal()} DA</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-emerald-600">Livraison :</span>
                                <span id="checkoutShipping" class="text-emerald-800">Calcul en cours...</span>
                            </div>
                            <div class="border-t border-emerald-200 pt-2">
                                <div class="flex justify-between text-lg font-semibold">
                                    <span class="text-emerald-800">Total :</span>
                                    <span id="checkoutTotal" class="text-emerald-600">Calcul en cours...</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Informations de livraison -->
                        <div class="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div class="flex items-start">
                                <i class="fas fa-truck text-emerald-600 mr-3 mt-1"></i>
                                <div class="text-sm">
                                    <p class="font-medium text-emerald-800">Livraison</p>
                                    <p class="text-emerald-700">Délai de livraison : 2-5 jours ouvrables</p>
                                    <p id="freeShippingInfo" class="text-emerald-600 font-medium mt-1"></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bouton de commande -->
                        <button onclick="submitOrder()" 
                                class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                                id="orderButton">
                            <span id="orderButtonText">
                                <i class="fas fa-check-circle mr-2"></i>
                                Confirmer la commande
                            </span>
                            <i id="orderSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                        
                        <div id="checkoutError" class="mt-4 hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        </div>
                        
                        <p class="text-xs text-emerald-600 text-center mt-4">
                            En passant commande, vous acceptez nos conditions de vente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Calculer les frais de livraison
    await this.calculateShippingCosts();
};

// Calculate shipping costs
PharmacieGaherApp.prototype.calculateShippingCosts = async function() {
    try {
        const response = await fetch(buildApiUrl('/settings/shipping'));
        let shippingInfo;
        
        if (response.ok) {
            shippingInfo = await response.json();
        } else {
            // Fallback values
            shippingInfo = {
                fraisLivraison: 300,
                livraisonGratuite: 5000
            };
        }
        
        const subtotal = this.getCartTotal();
        const shippingCost = subtotal >= shippingInfo.livraisonGratuite ? 0 : shippingInfo.fraisLivraison;
        const total = subtotal + shippingCost;
        
        // Update display
        const shippingElement = document.getElementById('checkoutShipping');
        const totalElement = document.getElementById('checkoutTotal');
        const freeShippingInfo = document.getElementById('freeShippingInfo');
        
        if (shippingElement) shippingElement.textContent = `${shippingCost} DA`;
        if (totalElement) totalElement.textContent = `${total} DA`;
        
        if (freeShippingInfo) {
            if (shippingCost === 0) {
                freeShippingInfo.textContent = '🎉 Livraison gratuite !';
            } else {
                const remaining = shippingInfo.livraisonGratuite - subtotal;
                freeShippingInfo.textContent = `Plus que ${remaining} DA pour la livraison gratuite`;
            }
        }
        
    } catch (error) {
        console.error('Erreur calcul frais livraison:', error);
        const shippingElement = document.getElementById('checkoutShipping');
        const totalElement = document.getElementById('checkoutTotal');
        
        if (shippingElement) shippingElement.textContent = '300 DA';
        if (totalElement) totalElement.textContent = `${this.getCartTotal() + 300} DA`;
    }
};

// Order confirmation page
PharmacieGaherApp.prototype.loadOrderConfirmationPage = async function(orderNumber) {
    try {
        let order = null;
        
        // Try to get order from API
        try {
            const response = await fetch(buildApiUrl(`/orders/${orderNumber}`));
            if (response.ok) {
                order = await response.json();
            }
        } catch (apiError) {
            console.log('API unavailable, using localStorage order');
        }
        
        // Fallback to localStorage if API fails
        if (!order) {
            const storedOrder = localStorage.getItem('lastOrder');
            if (storedOrder) {
                order = JSON.parse(storedOrder);
            } else {
                throw new Error('Commande non trouvée');
            }
        }
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-4xl">
                <div class="text-center mb-12">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-check-circle text-green-600 text-4xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600">Merci pour votre commande</p>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 class="font-semibold text-emerald-800 mb-4">Détails de la commande</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Numéro de commande :</span>
                                    <span class="font-medium text-emerald-800">${order.numeroCommande || orderNumber}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Date :</span>
                                    <span class="text-emerald-800">${new Date(order.dateCommande || Date.now()).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Statut :</span>
                                    <span class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">En attente</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-emerald-600">Mode de paiement :</span>
                                    <span class="text-emerald-800">${order.modePaiement || 'Paiement à la livraison'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-emerald-800 mb-4">Adresse de livraison</h3>
                            <div class="text-sm text-emerald-700">
                                <p class="font-medium">${order.client.prenom} ${order.client.nom}</p>
                                <p>${order.client.adresse}</p>
                                <p>${order.client.wilaya}, Algérie</p>
                                <p class="mt-2">
                                    <i class="fas fa-phone mr-2 text-emerald-400"></i>
                                    ${order.client.telephone}
                                </p>
                                <p>
                                    <i class="fas fa-envelope mr-2 text-emerald-400"></i>
                                    ${order.client.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Articles commandés -->
                    <div class="border-t border-emerald-200 pt-6">
                        <h3 class="font-semibold text-emerald-800 mb-4">Articles commandés</h3>
                        <div class="space-y-3">
                            ${order.articles.map(article => `
                                <div class="flex items-center space-x-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
                                    <img src="${article.image || 'https://via.placeholder.com/64x64/10b981/ffffff?text=' + encodeURIComponent(article.nom.substring(0, 2))}" 
                                         alt="${article.nom}" 
                                         class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800">${article.nom}</h4>
                                        <p class="text-sm text-emerald-600">
                                            Quantité: ${article.quantite} × ${article.prix} DA
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-medium text-emerald-800">${article.quantite * article.prix} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Totaux -->
                        <div class="border-t border-emerald-200 mt-6 pt-4">
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-emerald-600">Sous-total :</span>
                                    <span class="text-emerald-800">${order.sousTotal} DA</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-emerald-600">Frais de livraison :</span>
                                    <span class="text-emerald-800">${order.fraisLivraison} DA</span>
                                </div>
                                <div class="flex justify-between text-lg font-semibold border-t border-emerald-200 pt-2">
                                    <span class="text-emerald-800">Total :</span>
                                    <span class="text-emerald-600">${order.total} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Informations importantes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-medium text-blue-900 mb-2">Prochaines étapes</h4>
                                <div class="text-blue-800 text-sm space-y-1">
                                    <p>• Nous préparons votre commande</p>
                                    <p>• Vous recevrez un suivi par email</p>
                                    <p>• Livraison sous 2-5 jours ouvrables</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div class="flex items-start">
                            <i class="fas fa-headset text-green-600 mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-medium text-green-900 mb-2">Besoin d'aide ?</h4>
                                <div class="text-green-800 text-sm space-y-1">
                                    <p>Email: pharmaciegaher@gmail.com</p>
                                    <p>Téléphone: +213 123 456 789</p>
                                    <p>Numéro de commande: ${order.numeroCommande || orderNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="text-center space-y-4">
                    <button onclick="app.showPage('products')" class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mr-4">
                        <i class="fas fa-shopping-bag mr-2"></i>
                        Continuer mes achats
                    </button>
                    ${this.currentUser ? `
                    <button onclick="app.showPage('profile')" class="bg-white text-emerald-600 border-2 border-emerald-200 font-semibold py-3 px-8 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                        <i class="fas fa-user mr-2"></i>
                        Mon compte
                    </button>
                    ` : ''}
                    
                    <p class="text-sm text-emerald-600 mt-4">
                        Vous pouvez suivre l'état de votre commande en nous contactant avec votre numéro de commande.
                    </p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erreur chargement confirmation:', error);
        this.showToast('Erreur lors du chargement de la confirmation', 'error');
        this.showPage('home');
    }
};

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'wilaya'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input || !input.value.trim()) {
            input?.classList.add('border-red-500');
            isValid = false;
        } else {
            input?.classList.remove('border-red-500');
        }
    });
    
    // Validate email format
    const emailInput = form.querySelector('[name="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.classList.add('border-red-500');
            isValid = false;
        } else {
            emailInput.classList.remove('border-red-500');
        }
    }
    
    return isValid;
}

// Submit order - COMPLETE FIXED VERSION WITH PROPER ADMIN INTEGRATION
async function submitOrder() {
    console.log('📦 submitOrder called - Starting order submission process');
    
    if (!validateCheckoutForm()) {
        app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (app.cart.length === 0) {
        app.showToast('Votre panier est vide', 'error');
        return;
    }
    
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    const orderButton = document.getElementById('orderButton');
    const orderButtonText = document.getElementById('orderButtonText');
    const orderSpinner = document.getElementById('orderSpinner');
    const errorDiv = document.getElementById('checkoutError');
    
    // Disable button and show loading
    orderButton.disabled = true;
    orderButtonText.textContent = 'Traitement en cours...';
    orderSpinner.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    
    try {
        // Calculate totals
        const subtotal = app.getCartTotal();
        let shippingCost = 300; // Default shipping
        
        try {
            const shippingResponse = await fetch(buildApiUrl('/settings/shipping'));
            if (shippingResponse.ok) {
                const shippingInfo = await shippingResponse.json();
                shippingCost = subtotal >= shippingInfo.livraisonGratuite ? 0 : shippingInfo.fraisLivraison;
            }
        } catch (error) {
            console.log('Using default shipping cost');
        }
        
        const total = subtotal + shippingCost;
        
        // Generate order number
        const timestamp = Date.now();
        const orderNumber = `PG${timestamp.toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        // Prepare comprehensive order data
        const orderData = {
            _id: timestamp.toString(),
            numeroCommande: orderNumber,
            client: {
                nom: formData.get('nom').trim(),
                prenom: formData.get('prenom').trim(),
                email: formData.get('email').trim().toLowerCase(),
                telephone: formData.get('telephone').trim(),
                adresse: formData.get('adresse').trim(),
                wilaya: formData.get('wilaya')
            },
            articles: app.cart.map(item => ({
                produitId: item.id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.quantite,
                image: item.image
            })),
            commentaires: formData.get('commentaires')?.trim() || '',
            sousTotal: subtotal,
            fraisLivraison: shippingCost,
            total: total,
            modePaiement: 'Paiement à la livraison',
            dateCommande: new Date().toISOString(),
            statut: 'en-attente'
        };
        
        console.log('📋 Order data prepared:', {
            orderNumber: orderData.numeroCommande,
            total: orderData.total,
            articlesCount: orderData.articles.length,
            client: `${orderData.client.prenom} ${orderData.client.nom}`
        });
        
        // PRIMARY: Add to admin orders (ALWAYS do this)
        let orderSavedToAdmin = false;
        try {
            if (window.addOrderToDemo && typeof window.addOrderToDemo === 'function') {
                console.log('💾 Adding order to admin demo...');
                const createdOrder = window.addOrderToDemo(orderData);
                if (createdOrder) {
                    orderSavedToAdmin = true;
                    console.log('✅ Order successfully added to admin panel');
                } else {
                    console.warn('⚠️ addOrderToDemo returned null/undefined');
                }
            } else {
                console.warn('⚠️ addOrderToDemo function not found, using direct localStorage');
                // Fallback: directly add to localStorage
                let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                adminOrders.unshift(orderData);
                localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
                orderSavedToAdmin = true;
                console.log('✅ Order added directly to localStorage');
            }
        } catch (error) {
            console.error('❌ Error adding order to admin:', error);
            orderSavedToAdmin = false;
        }
        
        // SECONDARY: Try to send to API (optional, don't fail if this doesn't work)
        let orderSavedToAPI = false;
        try {
            console.log('🌐 Attempting to send order to API...');
            const response = await fetch(buildApiUrl('/orders'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (response.ok) {
                const result = await response.json();
                orderSavedToAPI = true;
                console.log('✅ Order successfully sent to API:', result);
            } else {
                console.log('⚠️ API returned error status:', response.status);
            }
        } catch (apiError) {
            console.log('⚠️ API unavailable:', apiError.message);
        }
        
        // Store for confirmation page
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Verify order was saved properly
        if (!orderSavedToAdmin) {
            console.error('❌ CRITICAL: Order was not saved to admin panel');
            throw new Error('Erreur critique: la commande n\'a pas pu être enregistrée');
        }
        
        // Clear cart
        console.log('🛒 Clearing cart...');
        app.clearCart(true);
        
        // Show success message
        app.showToast('Commande créée avec succès !', 'success');
        
        console.log('🎉 Order submission completed successfully');
        console.log(`📊 Summary: Admin=${orderSavedToAdmin ? 'OK' : 'FAILED'}, API=${orderSavedToAPI ? 'OK' : 'FAILED'}`);
        
        // Redirect to confirmation page
        setTimeout(() => {
            app.showPage('order-confirmation', { orderNumber: orderNumber });
        }, 500);
        
    } catch (error) {
        console.error('❌ Critical error during order submission:', error);
        errorDiv.textContent = error.message || 'Erreur lors de la création de la commande';
        errorDiv.classList.remove('hidden');
        
        // Re-enable button
        orderButton.disabled = false;
        orderButtonText.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Confirmer la commande
        `;
        orderSpinner.classList.add('hidden');
    }
}

// Handle checkout form submit
function handleCheckout(event) {
    event.preventDefault();
    submitOrder();
}

// Export global functions
window.submitOrder = submitOrder;
window.validateCheckoutForm = validateCheckoutForm;
window.handleCheckout = handleCheckout;

console.log('✅ Checkout system loaded with complete order management integration');