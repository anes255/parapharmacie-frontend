// ==========================================
// 🌿 Checkout Process - Complete Implementation
// ==========================================

/**
 * Load checkout page
 */
async function loadCheckoutPage() {
    // Validate cart
    const validation = validateCart();
    if (!validation.valid) {
        window.app.showToast(validation.errors[0], 'error');
        window.app.showPage('home');
        return;
    }
    
    const summary = calculateCartSummary();
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-900 mb-4">Finaliser ma commande</h1>
                    <p class="text-xl text-emerald-600">Dernière étape avant de recevoir vos produits</p>
                </div>
                
                <!-- Progress Steps -->
                <div class="mb-12">
                    <div class="flex items-center justify-center space-x-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                <i class="fas fa-check"></i>
                            </div>
                            <span class="ml-2 font-semibold text-emerald-700">Panier</span>
                        </div>
                        <div class="w-16 h-1 bg-emerald-500"></div>
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                2
                            </div>
                            <span class="ml-2 font-semibold text-emerald-700">Livraison</span>
                        </div>
                        <div class="w-16 h-1 bg-gray-300"></div>
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                3
                            </div>
                            <span class="ml-2 text-gray-500">Confirmation</span>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Checkout Form -->
                    <div class="lg:col-span-2">
                        <form id="checkoutForm" onsubmit="handleCheckout(event)" class="space-y-8">
                            <!-- Customer Information -->
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-user mr-3 text-emerald-500"></i>
                                    Informations personnelles
                                </h2>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                        <input type="text" name="nom" required class="form-input" 
                                               value="${window.app.currentUser?.nom || ''}"
                                               placeholder="Votre nom">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" name="prenom" required class="form-input"
                                               value="${window.app.currentUser?.prenom || ''}"
                                               placeholder="Votre prénom">
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input type="email" name="email" required class="form-input"
                                               value="${window.app.currentUser?.email || ''}"
                                               placeholder="votre@email.com">
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                        <input type="tel" name="telephone" required class="form-input"
                                               value="${window.app.currentUser?.telephone || ''}"
                                               placeholder="+213 555 123 456">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Delivery Address -->
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-map-marker-alt mr-3 text-emerald-500"></i>
                                    Adresse de livraison
                                </h2>
                                
                                <div class="space-y-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                        <select name="wilaya" required class="form-select">
                                            <option value="">Sélectionnez votre wilaya</option>
                                            ${CONFIG.WILAYAS.map(w => `
                                                <option value="${w}" ${w === window.app.currentUser?.wilaya ? 'selected' : ''}>${w}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse complète *</label>
                                        <textarea name="adresse" required class="form-textarea" rows="3"
                                                  placeholder="Rue, numéro, quartier...">${window.app.currentUser?.adresse || ''}</textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Instructions de livraison (optionnel)</label>
                                        <textarea name="instructions" class="form-textarea" rows="2"
                                                  placeholder="Code d'accès, étage, point de repère..."></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Payment Method -->
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-credit-card mr-3 text-emerald-500"></i>
                                    Mode de paiement
                                </h2>
                                
                                <div class="space-y-4">
                                    <label class="flex items-center p-4 border-2 border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                        <input type="radio" name="modePaiement" value="a-la-livraison" checked class="w-5 h-5 text-emerald-600">
                                        <div class="ml-4 flex-1">
                                            <div class="font-semibold text-gray-900">Paiement à la livraison</div>
                                            <div class="text-sm text-gray-600">Payez en espèces lors de la réception</div>
                                        </div>
                                        <i class="fas fa-money-bill-wave text-emerald-500 text-2xl"></i>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <div class="flex space-x-4">
                                <button type="button" onclick="window.app.showPage('home')" class="flex-1 btn-secondary py-4">
                                    <i class="fas fa-arrow-left mr-2"></i>Retour
                                </button>
                                <button type="submit" class="flex-1 btn-primary py-4 text-lg" id="checkoutBtn">
                                    <span id="checkoutBtnText">
                                        <i class="fas fa-check-circle mr-2"></i>Confirmer la commande
                                    </span>
                                    <i id="checkoutBtnSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Récapitulatif</h2>
                            
                            <!-- Cart Items -->
                            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                ${window.app.cart.map(item => `
                                    <div class="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                        <img src="${item.image}" alt="${item.nom}" 
                                             class="w-16 h-16 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <div class="font-semibold text-gray-900 text-sm">${item.nom}</div>
                                            <div class="text-sm text-gray-600">Qté: ${item.quantite}</div>
                                        </div>
                                        <div class="font-bold text-emerald-700">${formatPrice(item.prix * item.quantite)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Totals -->
                            <div class="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                                <div class="flex justify-between text-gray-700">
                                    <span>Sous-total (${summary.itemCount} article${summary.itemCount > 1 ? 's' : ''})</span>
                                    <span class="font-semibold">${formatPrice(summary.subtotal)}</span>
                                </div>
                                
                                <div class="flex justify-between text-gray-700">
                                    <span>Frais de livraison</span>
                                    <span class="font-semibold ${summary.shipping === 0 ? 'text-emerald-600' : ''}">
                                        ${summary.shipping === 0 ? 'Gratuit' : formatPrice(summary.shipping)}
                                    </span>
                                </div>
                                
                                ${summary.remainingForFreeShipping > 0 ? `
                                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                                        <i class="fas fa-truck text-emerald-500 mr-2"></i>
                                        Plus que <strong>${formatPrice(summary.remainingForFreeShipping)}</strong> 
                                        pour la livraison gratuite!
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="flex justify-between items-center text-2xl font-bold text-emerald-900 mb-6">
                                <span>Total</span>
                                <span>${formatPrice(summary.total)}</span>
                            </div>
                            
                            <!-- Trust Badges -->
                            <div class="space-y-3 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-shield-alt text-emerald-500 w-6"></i>
                                    <span>Paiement 100% sécurisé</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-truck text-emerald-500 w-6"></i>
                                    <span>Livraison rapide en Algérie</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-headset text-emerald-500 w-6"></i>
                                    <span>Service client disponible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listener to the form
    setTimeout(() => {
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', handleCheckout);
            console.log('Checkout form listener attached');
        }
    }, 100);
}

/**
 * Handle checkout submission - FIXED
 */
async function handleCheckout(event) {
    event.preventDefault();
    
    console.log('Checkout form submitted');
    
    const btn = document.getElementById('checkoutBtn');
    const btnText = document.getElementById('checkoutBtnText');
    const btnSpinner = document.getElementById('checkoutBtnSpinner');
    
    if (!btn || !btnText || !btnSpinner) {
        console.error('Checkout button elements not found');
        window.app.showToast('Erreur: Éléments du formulaire introuvables', 'error');
        return;
    }
    
    try {
        // Disable button
        btn.disabled = true;
        btnText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
        btnSpinner.classList.remove('hidden');
        
        // Validate cart again
        const validation = validateCart();
        if (!validation.valid) {
            throw new Error(validation.errors[0]);
        }
        
        // Get form data
        const formData = new FormData(event.target);
        const summary = calculateCartSummary();
        
        // Build order object
        const order = {
            numeroCommande: generateOrderNumber(),
            client: {
                nom: formData.get('nom'),
                prenom: formData.get('prenom'),
                email: formData.get('email'),
                telephone: formData.get('telephone')
            },
            livraison: {
                wilaya: formData.get('wilaya'),
                adresse: formData.get('adresse'),
                instructions: formData.get('instructions') || ''
            },
            produits: formatCartForOrder(),
            sousTotal: summary.subtotal,
            fraisLivraison: summary.shipping,
            total: summary.total,
            modePaiement: formData.get('modePaiement'),
            statut: 'en-attente',
            dateCommande: new Date().toISOString()
        };
        
        console.log('Submitting order:', order);
        
        // Try to save to backend
        try {
            await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(order)
            });
            console.log('Order saved to backend');
        } catch (error) {
            console.log('Backend unavailable, saving locally:', error.message);
        }
        
        // Save order locally
        const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        localOrders.push(order);
        localStorage.setItem('adminOrders', JSON.stringify(localOrders));
        
        // Clear cart
        window.app.clearCart();
        
        // Show success and redirect
        window.app.showToast('Commande confirmée avec succès!', 'success');
        
        setTimeout(() => {
            window.app.showPage('order-confirmation', { orderNumber: order.numeroCommande });
        }, 1000);
        
    } catch (error) {
        console.error('Checkout error:', error);
        window.app.showToast(error.message || 'Erreur lors de la validation de la commande', 'error');
        
        // Re-enable button
        if (btn && btnText && btnSpinner) {
            btn.disabled = false;
            btnText.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Confirmer la commande';
            btnSpinner.classList.add('hidden');
        }
    }
}

/**
 * Generate order number
 */
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `SH${year}${month}${day}${random}`;
}

/**
 * Load order confirmation page
 */
async function loadOrderConfirmationPage(orderNumber) {
    const mainContent = document.getElementById('mainContent');
    
    // Get order from localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const order = orders.find(o => o.numeroCommande === orderNumber);
    
    if (!order) {
        window.app.showToast('Commande non trouvée', 'error');
        window.app.showPage('home');
        return;
    }
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-12">
            <div class="max-w-3xl mx-auto">
                <!-- Success Message -->
                <div class="text-center mb-12">
                    <div class="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
                        <i class="fas fa-check-circle text-emerald-500 text-5xl"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-emerald-900 mb-4">Commande confirmée!</h1>
                    <p class="text-xl text-gray-600 mb-2">Merci pour votre confiance</p>
                    <p class="text-lg text-gray-500">Numéro de commande: <strong class="text-emerald-700">${orderNumber}</strong></p>
                </div>
                
                <!-- Order Details -->
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 class="text-2xl font-bold text-emerald-800 mb-6">Détails de la commande</h2>
                    
                    <div class="space-y-6">
                        <!-- Customer Info -->
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Informations client</h3>
                            <div class="bg-emerald-50 rounded-lg p-4 space-y-2 text-sm">
                                <p><strong>Nom:</strong> ${order.client.prenom} ${order.client.nom}</p>
                                <p><strong>Email:</strong> ${order.client.email}</p>
                                <p><strong>Téléphone:</strong> ${order.client.telephone}</p>
                            </div>
                        </div>
                        
                        <!-- Delivery Info -->
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Adresse de livraison</h3>
                            <div class="bg-emerald-50 rounded-lg p-4 space-y-2 text-sm">
                                <p><strong>Wilaya:</strong> ${order.livraison.wilaya}</p>
                                <p><strong>Adresse:</strong> ${order.livraison.adresse}</p>
                                ${order.livraison.instructions ? `<p><strong>Instructions:</strong> ${order.livraison.instructions}</p>` : ''}
                            </div>
                        </div>
                        
                        <!-- Products -->
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Produits commandés</h3>
                            <div class="space-y-3">
                                ${order.produits.map(item => `
                                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div class="font-medium">${item.nom}</div>
                                            <div class="text-sm text-gray-600">Quantité: ${item.quantite}</div>
                                        </div>
                                        <div class="font-bold text-emerald-700">${formatPrice(item.total)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Total -->
                        <div class="border-t-2 border-gray-200 pt-4">
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Sous-total:</span>
                                    <span class="font-semibold">${formatPrice(order.sousTotal)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Livraison:</span>
                                    <span class="font-semibold">${order.fraisLivraison === 0 ? 'Gratuit' : formatPrice(order.fraisLivraison)}</span>
                                </div>
                                <div class="flex justify-between text-2xl font-bold text-emerald-900 pt-2 border-t border-gray-200">
                                    <span>Total:</span>
                                    <span>${formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                    <h3 class="text-xl font-bold text-blue-900 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>Prochaines étapes
                    </h3>
                    <ol class="space-y-3 text-blue-800">
                        <li class="flex items-start">
                            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                            <span>Vous recevrez un email de confirmation à <strong>${order.client.email}</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                            <span>Notre équipe préparera votre commande avec soin</span>
                        </li>
                        <li class="flex items-start">
                            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                            <span>Vous serez contacté par téléphone avant la livraison</span>
                        </li>
                        <li class="flex items-start">
                            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                            <span>Livraison rapide à votre domicile</span>
                        </li>
                    </ol>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <button onclick="window.app.showPage('home')" class="flex-1 btn-primary py-4">
                        <i class="fas fa-home mr-2"></i>Retour à l'accueil
                    </button>
                    <button onclick="window.app.showPage('products')" class="flex-1 btn-secondary py-4">
                        <i class="fas fa-shopping-bag mr-2"></i>Continuer mes achats
                    </button>
                </div>
            </div>
        </div>
    `;
}

console.log('✅ Checkout.js loaded successfully');
