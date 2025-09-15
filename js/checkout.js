// Fixed Checkout functionality with proper API integration

PharmacieGaherApp.prototype.loadCheckoutPage = async function() {
    if (this.cart.length === 0) {
        this.showToast('Votre panier est vide', 'warning');
        this.showPage('products');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    
    // Calculate totals
    const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
    const total = sousTotal + fraisLivraison;
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold text-emerald-800 mb-8 text-center">Finaliser votre commande</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Order Form -->
                    <div class="bg-white rounded-2xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                        
                        <form id="checkoutForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                    <input type="text" id="prenom" name="prenom" required 
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                    <input type="text" id="nom" name="nom" required 
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input type="email" id="email" name="email" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                <input type="tel" id="telephone" name="telephone" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       placeholder="+213 123 456 789">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                <textarea id="adresse" name="adresse" required rows="3" 
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                          placeholder="Adresse complète avec détails"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                <select id="wilaya" name="wilaya" required 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                    <option value="">Sélectionnez votre wilaya</option>
                                    <option value="Adrar">01 - Adrar</option>
                                    <option value="Chlef">02 - Chlef</option>
                                    <option value="Laghouat">03 - Laghouat</option>
                                    <option value="Oum El Bouaghi">04 - Oum El Bouaghi</option>
                                    <option value="Batna">05 - Batna</option>
                                    <option value="Béjaïa">06 - Béjaïa</option>
                                    <option value="Biskra">07 - Biskra</option>
                                    <option value="Béchar">08 - Béchar</option>
                                    <option value="Blida">09 - Blida</option>
                                    <option value="Bouira">10 - Bouira</option>
                                    <option value="Tamanrasset">11 - Tamanrasset</option>
                                    <option value="Tébessa">12 - Tébessa</option>
                                    <option value="Tlemcen">13 - Tlemcen</option>
                                    <option value="Tiaret">14 - Tiaret</option>
                                    <option value="Tizi Ouzou">15 - Tizi Ouzou</option>
                                    <option value="Alger">16 - Alger</option>
                                    <option value="Djelfa">17 - Djelfa</option>
                                    <option value="Jijel">18 - Jijel</option>
                                    <option value="Sétif">19 - Sétif</option>
                                    <option value="Saïda">20 - Saïda</option>
                                    <option value="Skikda">21 - Skikda</option>
                                    <option value="Sidi Bel Abbès">22 - Sidi Bel Abbès</option>
                                    <option value="Annaba">23 - Annaba</option>
                                    <option value="Guelma">24 - Guelma</option>
                                    <option value="Constantine">25 - Constantine</option>
                                    <option value="Médéa">26 - Médéa</option>
                                    <option value="Mostaganem">27 - Mostaganem</option>
                                    <option value="M'Sila">28 - M'Sila</option>
                                    <option value="Mascara">29 - Mascara</option>
                                    <option value="Ouargla">30 - Ouargla</option>
                                    <option value="Oran">31 - Oran</option>
                                    <option value="El Bayadh">32 - El Bayadh</option>
                                    <option value="Illizi">33 - Illizi</option>
                                    <option value="Bordj Bou Arréridj">34 - Bordj Bou Arréridj</option>
                                    <option value="Boumerdès">35 - Boumerdès</option>
                                    <option value="El Tarf">36 - El Tarf</option>
                                    <option value="Tindouf">37 - Tindouf</option>
                                    <option value="Tissemsilt">38 - Tissemsilt</option>
                                    <option value="El Oued">39 - El Oued</option>
                                    <option value="Khenchela">40 - Khenchela</option>
                                    <option value="Souk Ahras">41 - Souk Ahras</option>
                                    <option value="Tipaza" selected>42 - Tipaza</option>
                                    <option value="Mila">43 - Mila</option>
                                    <option value="Aïn Defla">44 - Aïn Defla</option>
                                    <option value="Naâma">45 - Naâma</option>
                                    <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
                                    <option value="Ghardaïa">47 - Ghardaïa</option>
                                    <option value="Relizane">48 - Relizane</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
                                <textarea id="commentaires" name="commentaires" rows="3" 
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                          placeholder="Instructions spéciales pour la livraison (optionnel)"></textarea>
                            </div>
                            
                            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h3 class="font-semibold text-emerald-800 mb-2">Mode de paiement</h3>
                                <div class="flex items-center">
                                    <input type="radio" id="paiementLivraison" name="modePaiement" value="Paiement à la livraison" checked 
                                           class="text-emerald-600 mr-3">
                                    <label for="paiementLivraison" class="text-emerald-700">
                                        <i class="fas fa-truck mr-2"></i>Paiement à la livraison
                                    </label>
                                </div>
                                <p class="text-sm text-emerald-600 mt-2">Payez en espèces lors de la réception de votre commande</p>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Récapitulatif de commande</h2>
                        
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-3 bg-white/70 rounded-lg p-4">
                                    <img src="${item.image}" alt="${item.nom}" 
                                         class="w-16 h-16 object-cover rounded-lg border-2 border-emerald-200">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800">${item.nom}</h4>
                                        <p class="text-sm text-emerald-600">${item.quantite} × ${item.prix} DA</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-semibold text-emerald-800">${item.quantite * item.prix} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="border-t border-emerald-200 pt-6 space-y-3">
                            <div class="flex justify-between text-emerald-700">
                                <span>Sous-total:</span>
                                <span class="font-medium">${sousTotal} DA</span>
                            </div>
                            <div class="flex justify-between text-emerald-700">
                                <span>Frais de livraison:</span>
                                <span class="font-medium">${fraisLivraison} DA</span>
                            </div>
                            ${sousTotal >= 5000 ? `
                                <div class="bg-green-100 border border-green-300 rounded-lg p-3">
                                    <p class="text-green-800 text-sm font-medium">
                                        <i class="fas fa-gift mr-2"></i>Livraison gratuite pour les commandes ≥ 5000 DA
                                    </p>
                                </div>
                            ` : ''}
                            <div class="flex justify-between text-xl font-bold text-emerald-800 border-t border-emerald-300 pt-3">
                                <span>Total:</span>
                                <span>${total} DA</span>
                            </div>
                        </div>
                        
                        <button onclick="submitOrder()" id="submitOrderBtn" 
                                class="w-full mt-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
                            <span id="submitOrderText">
                                <i class="fas fa-check-circle mr-2"></i>Confirmer la commande
                            </span>
                            <i id="submitOrderSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                        
                        <div class="mt-4 text-center">
                            <button onclick="app.showPage('products')" 
                                    class="text-emerald-600 hover:text-emerald-700 font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Continuer mes achats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Pre-fill form if user is logged in
    if (this.currentUser) {
        setTimeout(() => {
            document.getElementById('prenom').value = this.currentUser.prenom || '';
            document.getElementById('nom').value = this.currentUser.nom || '';
            document.getElementById('email').value = this.currentUser.email || '';
            document.getElementById('telephone').value = this.currentUser.telephone || '';
            document.getElementById('adresse').value = this.currentUser.adresse || '';
            document.getElementById('wilaya').value = this.currentUser.wilaya || '';
        }, 100);
    }
};

PharmacieGaherApp.prototype.loadOrderConfirmationPage = async function(orderNumber) {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto text-center">
                <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <i class="fas fa-check text-white text-4xl"></i>
                    </div>
                    
                    <h1 class="text-4xl font-bold text-emerald-800 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-emerald-600 mb-6">Merci pour votre confiance</p>
                    
                    <div class="bg-white/70 rounded-xl p-6 mb-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-4">Numéro de commande</h2>
                        <p class="text-3xl font-bold text-emerald-600">#${orderNumber}</p>
                    </div>
                    
                    <div class="text-left bg-white/50 rounded-xl p-6 mb-8">
                        <h3 class="text-lg font-semibold text-emerald-800 mb-4">Prochaines étapes :</h3>
                        <div class="space-y-3">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-clock text-white text-sm"></i>
                                </div>
                                <span class="text-emerald-700">Confirmation de votre commande sous 24h</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-box text-white text-sm"></i>
                                </div>
                                <span class="text-emerald-700">Préparation et emballage de votre commande</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-truck text-white text-sm"></i>
                                </div>
                                <span class="text-emerald-700">Livraison à votre adresse sous 2-3 jours</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onclick="app.showPage('products')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg font-bold">
                            <i class="fas fa-shopping-bag mr-2"></i>Continuer mes achats
                        </button>
                        <button onclick="app.showPage('home')" 
                                class="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold">
                            <i class="fas fa-home mr-2"></i>Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// FIXED ORDER SUBMISSION WITH PROPER API INTEGRATION
async function submitOrder() {
    const form = document.getElementById('checkoutForm');
    const submitBtn = document.getElementById('submitOrderBtn');
    const submitText = document.getElementById('submitOrderText');
    const submitSpinner = document.getElementById('submitOrderSpinner');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        // Get form data
        const formData = new FormData(form);
        const clientData = {
            prenom: formData.get('prenom').trim(),
            nom: formData.get('nom').trim(),
            email: formData.get('email').trim(),
            telephone: formData.get('telephone').trim(),
            adresse: formData.get('adresse').trim(),
            wilaya: formData.get('wilaya'),
            commentaires: formData.get('commentaires').trim()
        };
        
        // Calculate totals
        const sousTotal = app.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        // Generate order number
        const orderNumber = 'CMD' + Date.now();
        
        // Prepare order data
        const orderData = {
            numeroCommande: orderNumber,
            client: clientData,
            articles: app.cart.map(item => ({
                id: item.id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.quantite,
                image: item.image,
                categorie: item.categorie
            })),
            sousTotal: sousTotal,
            fraisLivraison: fraisLivraison,
            total: total,
            statut: 'en-attente',
            modePaiement: formData.get('modePaiement'),
            dateCommande: new Date().toISOString(),
            commentaires: clientData.commentaires
        };
        
        console.log('🚀 Submitting order to API:', orderData);
        
        let apiSuccess = false;
        let savedOrder = null;
        
        // Try to save to API first - CRITICAL FIX
        try {
            console.log('📡 Calling API /orders...');
            const response = await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            
            if (response && response.success) {
                savedOrder = response.order;
                apiSuccess = true;
                console.log('✅ Order saved to API successfully:', savedOrder._id);
            } else {
                throw new Error('API response unsuccessful');
            }
        } catch (error) {
            console.error('❌ API save failed:', error.message);
            
            // Show user the error but continue with local storage
            app.showToast('Connexion limitée - commande sauvée localement', 'warning');
        }
        
        // Always save to localStorage as backup
        let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Use API data if available, otherwise use local data
        const finalOrderData = savedOrder || { ...orderData, _id: Date.now().toString() };
        
        // Check for duplicates
        const existingIndex = orders.findIndex(o => o.numeroCommande === finalOrderData.numeroCommande);
        if (existingIndex > -1) {
            orders[existingIndex] = finalOrderData;
        } else {
            orders.unshift(finalOrderData);
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        console.log('✅ Order saved to localStorage');
        
        // Update stock for products
        await updateProductStock(orderData.articles);
        
        // Clear cart
        app.clearCart();
        
        // Show success message
        app.showToast(
            `Commande ${orderNumber} ${apiSuccess ? 'confirmée' : 'enregistrée'}!`, 
            'success'
        );
        
        // Redirect to confirmation page
        app.showPage('order-confirmation', { orderNumber: orderNumber });
        
    } catch (error) {
        console.error('💥 Order submission failed:', error);
        app.showToast('Erreur lors de la commande. Veuillez réessayer.', 'error');
        
        // Re-enable button
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

// Function to update product stock after order
async function updateProductStock(articles) {
    try {
        for (const article of articles) {
            // Update in localStorage
            let localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            const productIndex = localProducts.findIndex(p => p._id === article.id);
            
            if (productIndex !== -1) {
                localProducts[productIndex].stock = Math.max(0, localProducts[productIndex].stock - article.quantite);
                localStorage.setItem('demoProducts', JSON.stringify(localProducts));
            }
            
            // Try to update via API
            try {
                await apiCall(`/products/${article.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        stock: Math.max(0, (localProducts[productIndex]?.stock || 0))
                    })
                });
                console.log(`✅ Stock updated for product ${article.id}`);
            } catch (error) {
                console.warn(`⚠️ API stock update failed for ${article.id}:`, error.message);
            }
        }
        
        // Refresh app product cache
        if (window.app) {
            window.app.refreshProductsCache();
        }
        
    } catch (error) {
        console.error('Error updating product stock:', error);
    }
}

// Export functions
window.submitOrder = submitOrder;

console.log('✅ Fixed Checkout.js loaded with proper API integration');
