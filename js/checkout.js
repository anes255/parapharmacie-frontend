// ==========================================
// 🌿 Checkout - WORKING VERSION
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
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-emerald-900 mb-4">Finaliser ma commande</h1>
                    <p class="text-xl text-emerald-600">Dernière étape avant de recevoir vos produits</p>
                </div>
                
                <div class="flex items-center justify-center space-x-4 mb-12">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="ml-2 font-semibold text-emerald-700">Panier</span>
                    </div>
                    <div class="w-16 h-1 bg-emerald-500"></div>
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        <span class="ml-2 font-semibold text-emerald-700">Livraison</span>
                    </div>
                    <div class="w-16 h-1 bg-gray-300"></div>
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">3</div>
                        <span class="ml-2 text-gray-500">Confirmation</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <form id="checkoutForm" class="space-y-8">
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-user mr-3 text-emerald-500"></i>
                                    Informations personnelles
                                </h2>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                        <input type="text" name="nom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" value="${window.app.currentUser?.nom || ''}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                        <input type="text" name="prenom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" value="${window.app.currentUser?.prenom || ''}">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input type="email" name="email" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" value="${window.app.currentUser?.email || ''}">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                                        <input type="tel" name="telephone" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" value="${window.app.currentUser?.telephone || ''}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-map-marker-alt mr-3 text-emerald-500"></i>
                                    Adresse de livraison
                                </h2>
                                
                                <div class="space-y-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Wilaya *</label>
                                        <select name="wilaya" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                                            <option value="">Sélectionnez...</option>
                                            ${CONFIG.WILAYAS.map(w => `<option value="${w}" ${w === window.app.currentUser?.wilaya ? 'selected' : ''}>${w}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse complète *</label>
                                        <textarea name="adresse" required rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">${window.app.currentUser?.adresse || ''}</textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Instructions (optionnel)</label>
                                        <textarea name="instructions" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-2xl shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                                    <i class="fas fa-credit-card mr-3 text-emerald-500"></i>
                                    Mode de paiement
                                </h2>
                                
                                <label class="flex items-center p-4 border-2 border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50">
                                    <input type="radio" name="modePaiement" value="a-la-livraison" checked class="w-5 h-5 text-emerald-600">
                                    <div class="ml-4 flex-1">
                                        <div class="font-semibold text-gray-900">Paiement à la livraison</div>
                                        <div class="text-sm text-gray-600">Payez en espèces lors de la réception</div>
                                    </div>
                                    <i class="fas fa-money-bill-wave text-emerald-500 text-2xl"></i>
                                </label>
                            </div>
                            
                            <div class="flex space-x-4">
                                <button type="button" onclick="window.app.showPage('home')" class="flex-1 bg-white text-emerald-600 border-2 border-emerald-600 font-bold py-4 px-6 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                                    <i class="fas fa-arrow-left mr-2"></i>Retour
                                </button>
                                <button type="submit" class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg text-lg disabled:opacity-50">
                                    <span class="submit-text">
                                        <i class="fas fa-check-circle mr-2"></i>Confirmer la commande
                                    </span>
                                    <i class="fas fa-spinner fa-spin ml-2 hidden submit-spinner"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                            <h2 class="text-2xl font-bold text-emerald-800 mb-6">Récapitulatif</h2>
                            
                            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                ${window.app.cart.map(item => `
                                    <div class="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                        <img src="${item.image}" alt="${item.nom}" class="w-16 h-16 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <div class="font-semibold text-gray-900 text-sm">${item.nom}</div>
                                            <div class="text-sm text-gray-600">Qté: ${item.quantite}</div>
                                        </div>
                                        <div class="font-bold text-emerald-700">${formatPrice(item.prix * item.quantite)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            
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
                            </div>
                            
                            <div class="flex justify-between items-center text-2xl font-bold text-emerald-900 mb-6">
                                <span>Total</span>
                                <span>${formatPrice(summary.total)}</span>
                            </div>
                            
                            <div class="space-y-3 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-shield-alt text-emerald-500 w-6"></i>
                                    <span>Paiement 100% sécurisé</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-truck text-emerald-500 w-6"></i>
                                    <span>Livraison rapide</span>
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
    
    // Attach form listener
    setTimeout(() => {
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                console.log('✅ Checkout form submitted');
                
                const button = form.querySelector('button[type="submit"]');
                const submitText = button.querySelector('.submit-text');
                const submitSpinner = button.querySelector('.submit-spinner');
                
                try {
                    button.disabled = true;
                    submitText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement...';
                    submitSpinner.classList.remove('hidden');
                    
                    const formData = new FormData(form);
                    const summary = calculateCartSummary();
                    
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
                    
                    console.log('Order created:', order);
                    
                    // Save locally
                    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
                    orders.push(order);
                    localStorage.setItem('adminOrders', JSON.stringify(orders));
                    
                    // Clear cart
                    window.app.clearCart();
                    
                    window.app.showToast('Commande confirmée!', 'success');
                    
                    setTimeout(() => {
                        window.app.showPage('order-confirmation', { orderNumber: order.numeroCommande });
                    }, 500);
                    
                } catch (error) {
                    console.error('Checkout error:', error);
                    window.app.showToast(error.message || 'Erreur', 'error');
                    button.disabled = false;
                    submitText.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Confirmer la commande';
                    submitSpinner.classList.add('hidden');
                }
            });
            console.log('✅ Checkout form listener attached');
        }
    }, 100);
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
                <div class="text-center mb-12">
                    <div class="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
                        <i class="fas fa-check-circle text-emerald-500 text-5xl"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-emerald-900 mb-4">Commande confirmée!</h1>
                    <p class="text-xl text-gray-600 mb-2">Merci pour votre confiance</p>
                    <p class="text-lg text-gray-500">N° de commande: <strong class="text-emerald-700">${orderNumber}</strong></p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 class="text-2xl font-bold text-emerald-800 mb-6">Détails de la commande</h2>
                    
                    <div class="space-y-6">
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Informations client</h3>
                            <div class="bg-emerald-50 rounded-lg p-4 space-y-2 text-sm">
                                <p><strong>Nom:</strong> ${order.client.prenom} ${order.client.nom}</p>
                                <p><strong>Email:</strong> ${order.client.email}</p>
                                <p><strong>Téléphone:</strong> ${order.client.telephone}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Adresse de livraison</h3>
                            <div class="bg-emerald-50 rounded-lg p-4 space-y-2 text-sm">
                                <p><strong>Wilaya:</strong> ${order.livraison.wilaya}</p>
                                <p><strong>Adresse:</strong> ${order.livraison.adresse}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-gray-700 mb-3">Produits</h3>
                            <div class="space-y-3">
                                ${order.produits.map(item => `
                                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div class="font-medium">${item.nom}</div>
                                            <div class="text-sm text-gray-600">Qté: ${item.quantite}</div>
                                        </div>
                                        <div class="font-bold text-emerald-700">${formatPrice(item.total)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="border-t-2 border-gray-200 pt-4">
                            <div class="flex justify-between text-2xl font-bold text-emerald-900">
                                <span>Total:</span>
                                <span>${formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-4">
                    <button onclick="window.app.showPage('home')" class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                        <i class="fas fa-home mr-2"></i>Retour à l'accueil
                    </button>
                    <button onclick="window.app.showPage('products')" class="flex-1 bg-white text-emerald-600 border-2 border-emerald-600 font-bold py-4 px-6 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                        <i class="fas fa-shopping-bag mr-2"></i>Continuer mes achats
                    </button>
                </div>
            </div>
        </div>
    `;
}

console.log('✅ Checkout.js (WORKING) loaded');
