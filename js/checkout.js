// Fixed Checkout System with Persistent Backend Saving

// Process order submission - FIXED to ensure backend saving
PharmacieGaherApp.prototype.processOrder = async function() {
    try {
        const submitBtn = document.getElementById('submitOrderBtn');
        const submitText = document.getElementById('submitOrderText');
        const submitSpinner = document.getElementById('submitOrderSpinner');
        
        // Disable form
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        submitSpinner.classList.remove('hidden');
        
        // Get form data
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const requiredFields = ['prenom', 'nom', 'email', 'telephone', 'adresse', 'wilaya'];
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!formData.get(field)?.trim()) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            throw new Error('Veuillez remplir tous les champs obligatoires');
        }
        
        // Validate email
        const email = formData.get('email').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Veuillez entrer une adresse email valide');
        }
        
        // Validate phone
        const telephone = formData.get('telephone').trim();
        const phoneRegex = /^(\+213|0)[0-9]{9}$/;
        if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
            throw new Error('Veuillez entrer un numéro de téléphone algérien valide');
        }
        
        // Calculate totals
        const sousTotal = this.cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
        const fraisLivraison = sousTotal >= 5000 ? 0 : 300;
        const total = sousTotal + fraisLivraison;
        
        // Prepare order data
        const orderData = {
            client: {
                prenom: formData.get('prenom').trim(),
                nom: formData.get('nom').trim(),
                email: email,
                telephone: telephone.replace(/\s/g, ''),
                adresse: formData.get('adresse').trim(),
                wilaya: formData.get('wilaya'),
                codePostal: formData.get('codePostal')?.trim() || ''
            },
            articles: this.cart.map(item => ({
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
            modePaiement: formData.get('modePaiement') || 'paiement-livraison',
            commentaires: formData.get('commentaires')?.trim() || ''
        };
        
        console.log('🛒 Processing order:', orderData);
        
        // Wake up the backend service first
        await this.wakeUpBackend();
        
        // Try multiple times to save to backend - BE PERSISTENT!
        let orderResult = null;
        let backendSuccess = false;
        let lastError = null;
        
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 Attempt ${attempt}/${maxRetries}: Submitting order to backend...`);
                
                // Show progress to user
                if (attempt > 1) {
                    submitSpinner.parentElement.querySelector('span').textContent = `Tentative ${attempt}/${maxRetries}...`;
                }
                
                const response = await apiCall('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });
                
                if (response && response.success && response.order) {
                    orderResult = response.order;
                    backendSuccess = true;
                    console.log('✅ Order successfully saved to backend:', orderResult.numeroCommande);
                    
                    this.showToast('Commande créée avec succès et sauvegardée !', 'success');
                    break; // Success! Exit retry loop
                } else {
                    throw new Error('Réponse backend invalide');
                }
                
            } catch (error) {
                console.warn(`⚠️ Backend attempt ${attempt} failed:`, error.message);
                lastError = error;
                
                // If this isn't the last attempt, wait and retry
                if (attempt < maxRetries) {
                    console.log(`🔄 Retrying in 3 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    console.error('❌ All backend attempts failed');
                }
            }
        }
        
        // If backend failed after all retries, DO NOT CREATE LOCAL ORDER
        if (!backendSuccess) {
            throw new Error(`Impossible de sauvegarder la commande sur le serveur après ${maxRetries} tentatives. Veuillez vérifier votre connexion internet et réessayer. Dernière erreur: ${lastError?.message || 'Erreur inconnue'}`);
        }
        
        // Add order to local storage for admin panel (as backup/cache)
        if (orderResult && window.addOrderToDemo) {
            window.addOrderToDemo({
                ...orderResult,
                ...orderData,
                _id: orderResult._id,
                numeroCommande: orderResult.numeroCommande,
                statut: 'en-attente',
                dateCommande: new Date().toISOString()
            });
        }
        
        // Clear cart only after successful backend save
        this.clearCart();
        
        // Show success page
        this.showPage('order-confirmation', { 
            orderNumber: orderResult.numeroCommande,
            backendSuccess: true,
            orderId: orderResult._id
        });
        
    } catch (error) {
        console.error('❌ Order processing error:', error);
        
        // Show specific error message to user
        let userMessage = error.message;
        
        if (error.message.includes('connexion') || error.message.includes('fetch')) {
            userMessage = 'Problème de connexion internet. Veuillez vérifier votre connexion et réessayer.';
        } else if (error.message.includes('serveur')) {
            userMessage = 'Problème temporaire avec nos serveurs. Veuillez réessayer dans quelques instants.';
        }
        
        this.showToast(userMessage, 'error');
        
        // Re-enable form
        const submitBtn = document.getElementById('submitOrderBtn');
        const submitText = document.getElementById('submitOrderText');
        const submitSpinner = document.getElementById('submitOrderSpinner');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
        }
    }
};

// Wake up backend service
PharmacieGaherApp.prototype.wakeUpBackend = async function() {
    try {
        console.log('⏰ Waking up backend service...');
        
        // Make a simple health check call to wake up the service
        const response = await fetch(buildApiUrl('/health'), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            console.log('✅ Backend is awake and responding');
        } else {
            console.warn('⚠️ Backend responded but with error status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Could not wake up backend:', error.message);
    }
};

// Enhanced order confirmation page
PharmacieGaherApp.prototype.loadOrderConfirmationPage = async function(orderNumber, backendSuccess = false, orderId = null) {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="text-center">
                <div class="mb-8">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-check text-green-600 text-4xl"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
                    <p class="text-xl text-gray-600 mb-4">Merci pour votre confiance</p>
                    
                    ${backendSuccess ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                            <div class="flex items-center justify-center">
                                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                                <p class="text-green-800 font-semibold">Commande sauvegardée avec succès</p>
                            </div>
                            <p class="text-green-700 text-sm mt-1">Votre commande est visible dans tous nos systèmes</p>
                        </div>
                    ` : `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                            <div class="flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                                <p class="text-yellow-800 font-semibold">Commande enregistrée localement</p>
                            </div>
                            <p class="text-yellow-700 text-sm mt-1">Sera synchronisée automatiquement</p>
                        </div>
                    `}
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Détails de votre commande</h2>
                    
                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                        <div class="text-center">
                            <p class="text-sm text-emerald-600 mb-2">Numéro de commande</p>
                            <p class="text-3xl font-bold text-emerald-800">${orderNumber}</p>
                            ${orderId ? `<p class="text-xs text-emerald-500 mt-1">ID: ${orderId}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="space-y-4 text-left">
                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-gray-600">Statut:</span>
                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">En attente de confirmation</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-gray-600">Mode de paiement:</span>
                            <span class="font-medium">Paiement à la livraison</span>
                        </div>
                        <div class="flex items-center justify-between py-3">
                            <span class="text-gray-600">Date de commande:</span>
                            <span class="font-medium">${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-6">
                    <h3 class="text-xl font-bold text-gray-900">Que se passe-t-il maintenant ?</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div class="bg-blue-50 rounded-lg p-6">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-clock text-blue-600 text-xl"></i>
                            </div>
                            <h4 class="font-bold text-blue-800 mb-2">1. Confirmation</h4>
                            <p class="text-blue-600 text-sm">Nous confirmons votre commande sous 2h</p>
                        </div>
                        
                        <div class="bg-purple-50 rounded-lg p-6">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-box text-purple-600 text-xl"></i>
                            </div>
                            <h4 class="font-bold text-purple-800 mb-2">2. Préparation</h4>
                            <p class="text-purple-600 text-sm">Préparation soignée de votre commande</p>
                        </div>
                        
                        <div class="bg-green-50 rounded-lg p-6">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-truck text-green-600 text-xl"></i>
                            </div>
                            <h4 class="font-bold text-green-800 mb-2">3. Livraison</h4>
                            <p class="text-green-600 text-sm">Livraison rapide à votre domicile</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-12 space-y-6">
                    ${backendSuccess ? `
                        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                            <h4 class="font-bold text-emerald-800 mb-2">
                                <i class="fas fa-shield-alt mr-2"></i>
                                Commande sécurisée
                            </h4>
                            <p class="text-emerald-700 mb-4">Votre commande est enregistrée dans notre système sécurisé et sera traitée rapidement</p>
                            <div class="space-y-2 text-sm text-emerald-600">
                                <p><i class="fas fa-envelope mr-2"></i>Confirmation envoyée par email</p>
                                <p><i class="fas fa-bell mr-2"></i>Notifications de suivi activées</p>
                            </div>
                        </div>
                    ` : `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h4 class="font-bold text-blue-800 mb-2">
                                <i class="fas fa-info-circle mr-2"></i>
                                Important
                            </h4>
                            <p class="text-blue-700 mb-4">Votre commande est enregistrée et sera traitée. En cas de problème, contactez-nous avec votre numéro de commande.</p>
                        </div>
                    `}
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-2">
                            <i class="fas fa-phone mr-2"></i>
                            Besoin d'aide ?
                        </h4>
                        <p class="text-gray-700 mb-4">Notre équipe est là pour vous accompagner</p>
                        <div class="space-y-2 text-sm text-gray-600">
                            <p><i class="fas fa-envelope mr-2"></i>pharmaciegaher@gmail.com</p>
                            <p><i class="fas fa-phone mr-2"></i>+213 123 456 789</p>
                            <p><i class="fas fa-map-marker-alt mr-2"></i>Tipaza, Algérie</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button onclick="app.showPage('home')" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-home mr-2"></i>
                            Retour à l'accueil
                        </button>
                        <button onclick="app.showPage('products')" 
                                class="bg-white text-emerald-600 font-bold py-3 px-8 rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition-all">
                            <i class="fas fa-shopping-bag mr-2"></i>
                            Continuer les achats
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Checkout page implementation (keeping existing loadCheckoutPage method)
PharmacieGaherApp.prototype.loadCheckoutPage = async function() {
    // Check if cart is empty
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
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <!-- Header with backend status -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Finaliser votre commande</h1>
                <p class="text-xl text-gray-600">Vérifiez vos informations avant de confirmer</p>
                <div class="mt-4">
                    <div id="backendStatus" class="inline-block px-4 py-2 rounded-lg text-sm font-medium">
                        <i class="fas fa-circle-notch fa-spin mr-2"></i>Vérification du serveur...
                    </div>
                </div>
            </div>
            
            <form id="checkoutForm" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Customer Information -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Personal Info -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="prenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                <input type="text" id="prenom" name="prenom" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.prenom || ''}"
                                       placeholder="Votre prénom">
                            </div>
                            <div>
                                <label for="nom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                <input type="text" id="nom" name="nom" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.nom || ''}"
                                       placeholder="Votre nom">
                            </div>
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input type="email" id="email" name="email" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.email || ''}"
                                       placeholder="votre@email.com">
                            </div>
                            <div>
                                <label for="telephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                <input type="tel" id="telephone" name="telephone" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                       value="${this.currentUser?.telephone || ''}"
                                       placeholder="+213 XX XX XX XX XX">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Delivery Address -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Adresse de livraison</h2>
                        <div class="space-y-6">
                            <div>
                                <label for="adresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                <textarea id="adresse" name="adresse" required rows="3" 
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                          placeholder="Rue, numéro, quartier...">${this.currentUser?.adresse || ''}</textarea>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="wilaya" class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                    <select id="wilaya" name="wilaya" required 
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="">Sélectionnez votre wilaya</option>
                                        <option value="Adrar" ${this.currentUser?.wilaya === 'Adrar' ? 'selected' : ''}>01 - Adrar</option>
                                        <option value="Chlef" ${this.currentUser?.wilaya === 'Chlef' ? 'selected' : ''}>02 - Chlef</option>
                                        <option value="Laghouat" ${this.currentUser?.wilaya === 'Laghouat' ? 'selected' : ''}>03 - Laghouat</option>
                                        <option value="Oum El Bouaghi" ${this.currentUser?.wilaya === 'Oum El Bouaghi' ? 'selected' : ''}>04 - Oum El Bouaghi</option>
                                        <option value="Batna" ${this.currentUser?.wilaya === 'Batna' ? 'selected' : ''}>05 - Batna</option>
                                        <option value="Béjaïa" ${this.currentUser?.wilaya === 'Béjaïa' ? 'selected' : ''}>06 - Béjaïa</option>
                                        <option value="Biskra" ${this.currentUser?.wilaya === 'Biskra' ? 'selected' : ''}>07 - Biskra</option>
                                        <option value="Béchar" ${this.currentUser?.wilaya === 'Béchar' ? 'selected' : ''}>08 - Béchar</option>
                                        <option value="Blida" ${this.currentUser?.wilaya === 'Blida' ? 'selected' : ''}>09 - Blida</option>
                                        <option value="Bouira" ${this.currentUser?.wilaya === 'Bouira' ? 'selected' : ''}>10 - Bouira</option>
                                        <option value="Tamanrasset" ${this.currentUser?.wilaya === 'Tamanrasset' ? 'selected' : ''}>11 - Tamanrasset</option>
                                        <option value="Tébessa" ${this.currentUser?.wilaya === 'Tébessa' ? 'selected' : ''}>12 - Tébessa</option>
                                        <option value="Tlemcen" ${this.currentUser?.wilaya === 'Tlemcen' ? 'selected' : ''}>13 - Tlemcen</option>
                                        <option value="Tiaret" ${this.currentUser?.wilaya === 'Tiaret' ? 'selected' : ''}>14 - Tiaret</option>
                                        <option value="Tizi Ouzou" ${this.currentUser?.wilaya === 'Tizi Ouzou' ? 'selected' : ''}>15 - Tizi Ouzou</option>
                                        <option value="Alger" ${this.currentUser?.wilaya === 'Alger' ? 'selected' : ''}>16 - Alger</option>
                                        <option value="Djelfa" ${this.currentUser?.wilaya === 'Djelfa' ? 'selected' : ''}>17 - Djelfa</option>
                                        <option value="Jijel" ${this.currentUser?.wilaya === 'Jijel' ? 'selected' : ''}>18 - Jijel</option>
                                        <option value="Sétif" ${this.currentUser?.wilaya === 'Sétif' ? 'selected' : ''}>19 - Sétif</option>
                                        <option value="Saïda" ${this.currentUser?.wilaya === 'Saïda' ? 'selected' : ''}>20 - Saïda</option>
                                        <option value="Skikda" ${this.currentUser?.wilaya === 'Skikda' ? 'selected' : ''}>21 - Skikda</option>
                                        <option value="Sidi Bel Abbès" ${this.currentUser?.wilaya === 'Sidi Bel Abbès' ? 'selected' : ''}>22 - Sidi Bel Abbès</option>
                                        <option value="Annaba" ${this.currentUser?.wilaya === 'Annaba' ? 'selected' : ''}>23 - Annaba</option>
                                        <option value="Guelma" ${this.currentUser?.wilaya === 'Guelma' ? 'selected' : ''}>24 - Guelma</option>
                                        <option value="Constantine" ${this.currentUser?.wilaya === 'Constantine' ? 'selected' : ''}>25 - Constantine</option>
                                        <option value="Médéa" ${this.currentUser?.wilaya === 'Médéa' ? 'selected' : ''}>26 - Médéa</option>
                                        <option value="Mostaganem" ${this.currentUser?.wilaya === 'Mostaganem' ? 'selected' : ''}>27 - Mostaganem</option>
                                        <option value="M'Sila" ${this.currentUser?.wilaya === 'M\'Sila' ? 'selected' : ''}>28 - M'Sila</option>
                                        <option value="Mascara" ${this.currentUser?.wilaya === 'Mascara' ? 'selected' : ''}>29 - Mascara</option>
                                        <option value="Ouargla" ${this.currentUser?.wilaya === 'Ouargla' ? 'selected' : ''}>30 - Ouargla</option>
                                        <option value="Oran" ${this.currentUser?.wilaya === 'Oran' ? 'selected' : ''}>31 - Oran</option>
                                        <option value="El Bayadh" ${this.currentUser?.wilaya === 'El Bayadh' ? 'selected' : ''}>32 - El Bayadh</option>
                                        <option value="Illizi" ${this.currentUser?.wilaya === 'Illizi' ? 'selected' : ''}>33 - Illizi</option>
                                        <option value="Bordj Bou Arréridj" ${this.currentUser?.wilaya === 'Bordj Bou Arréridj' ? 'selected' : ''}>34 - Bordj Bou Arréridj</option>
                                        <option value="Boumerdès" ${this.currentUser?.wilaya === 'Boumerdès' ? 'selected' : ''}>35 - Boumerdès</option>
                                        <option value="El Tarf" ${this.currentUser?.wilaya === 'El Tarf' ? 'selected' : ''}>36 - El Tarf</option>
                                        <option value="Tindouf" ${this.currentUser?.wilaya === 'Tindouf' ? 'selected' : ''}>37 - Tindouf</option>
                                        <option value="Tissemsilt" ${this.currentUser?.wilaya === 'Tissemsilt' ? 'selected' : ''}>38 - Tissemsilt</option>
                                        <option value="El Oued" ${this.currentUser?.wilaya === 'El Oued' ? 'selected' : ''}>39 - El Oued</option>
                                        <option value="Khenchela" ${this.currentUser?.wilaya === 'Khenchela' ? 'selected' : ''}>40 - Khenchela</option>
                                        <option value="Souk Ahras" ${this.currentUser?.wilaya === 'Souk Ahras' ? 'selected' : ''}>41 - Souk Ahras</option>
                                        <option value="Tipaza" ${this.currentUser?.wilaya === 'Tipaza' ? 'selected' : ''}>42 - Tipaza</option>
                                        <option value="Mila" ${this.currentUser?.wilaya === 'Mila' ? 'selected' : ''}>43 - Mila</option>
                                        <option value="Aïn Defla" ${this.currentUser?.wilaya === 'Aïn Defla' ? 'selected' : ''}>44 - Aïn Defla</option>
                                        <option value="Naâma" ${this.currentUser?.wilaya === 'Naâma' ? 'selected' : ''}>45 - Naâma</option>
                                        <option value="Aïn Témouchent" ${this.currentUser?.wilaya === 'Aïn Témouchent' ? 'selected' : ''}>46 - Aïn Témouchent</option>
                                        <option value="Ghardaïa" ${this.currentUser?.wilaya === 'Ghardaïa' ? 'selected' : ''}>47 - Ghardaïa</option>
                                        <option value="Relizane" ${this.currentUser?.wilaya === 'Relizane' ? 'selected' : ''}>48 - Relizane</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="codePostal" class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                                    <input type="text" id="codePostal" name="codePostal" 
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                           value="${this.currentUser?.codePostal || ''}"
                                           placeholder="Code postal (optionnel)">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Method -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Mode de paiement</h2>
                        <div class="space-y-4">
                            <label class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="radio" name="modePaiement" value="paiement-livraison" checked 
                                       class="text-emerald-600 focus:ring-emerald-500">
                                <div class="ml-3">
                                    <div class="font-medium text-gray-900">Paiement à la livraison</div>
                                    <div class="text-sm text-gray-600">Payez en espèces lors de la réception</div>
                                </div>
                            </label>
                            
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p class="text-blue-800 text-sm">
                                    <i class="fas fa-info-circle mr-2"></i>
                                    D'autres modes de paiement seront disponibles prochainement
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Comments -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Commentaires (optionnel)</h2>
                        <textarea id="commentaires" name="commentaires" rows="3" 
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  placeholder="Instructions spéciales, préférences de livraison..."></textarea>
                    </div>
                </div>
                
                <!-- Order Summary -->
                <div class="space-y-6">
                    <!-- Cart Items -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Votre commande</h2>
                        <div class="space-y-4">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                                    <img src="${item.image}" alt="${item.nom}" 
                                         class="w-16 h-16 object-cover rounded-lg">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-gray-900">${item.nom}</h4>
                                        <p class="text-sm text-gray-600">${item.prix} DA × ${item.quantite}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-medium text-gray-900">${item.prix * item.quantite} DA</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Order Total -->
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="space-y-3">
                            <div class="flex justify-between text-gray-600">
                                <span>Sous-total:</span>
                                <span>${sousTotal} DA</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>Frais de livraison:</span>
                                <span>${fraisLivraison} DA</span>
                            </div>
                            ${sousTotal >= 5000 ? `
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p class="text-green-800 text-sm font-medium">
                                        <i class="fas fa-check-circle mr-2"></i>
                                        Livraison gratuite !
                                    </p>
                                </div>
                            ` : `
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p class="text-blue-800 text-sm">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        Livraison gratuite à partir de 5 000 DA
                                    </p>
                                </div>
                            `}
                            <div class="border-t border-gray-200 pt-3">
                                <div class="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span class="text-emerald-600">${total} DA</span>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" id="submitOrderBtn" 
                                class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
                            <span id="submitOrderText">
                                <i class="fas fa-shield-alt mr-2"></i>
                                Confirmer la commande
                            </span>
                            <span id="submitOrderSpinner" class="hidden">
                                <i class="fas fa-spinner fa-spin mr-2"></i>
                                Traitement en cours...
                            </span>
                        </button>
                        
                        <div class="mt-4 text-center">
                            <button type="button" onclick="app.showPage('products')" 
                                    class="text-emerald-600 hover:text-emerald-700 font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Continuer les achats
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    // Add form submission handler
    this.setupCheckoutForm();
    
    // Check backend status
    this.checkBackendStatus();
};

// Check backend status
PharmacieGaherApp.prototype.checkBackendStatus = async function() {
    const statusElement = document.getElementById('backendStatus');
    
    try {
        const response = await fetch(buildApiUrl('/health'), {
            method: 'GET',
            timeout: 10000
        });
        
        if (response.ok) {
            statusElement.innerHTML = `
                <i class="fas fa-check-circle mr-2 text-green-600"></i>
                <span class="text-green-800">Serveur connecté - Commandes sauvegardées de façon sécurisée</span>
            `;
            statusElement.className = 'inline-block px-4 py-2 rounded-lg text-sm font-medium bg-green-100 border border-green-200';
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        statusElement.innerHTML = `
            <i class="fas fa-exclamation-triangle mr-2 text-red-600"></i>
            <span class="text-red-800">Problème de connexion - Votre commande sera traitée dès que possible</span>
        `;
        statusElement.className = 'inline-block px-4 py-2 rounded-lg text-sm font-medium bg-red-100 border border-red-200';
    }
};

// Setup checkout form validation and submission
PharmacieGaherApp.prototype.setupCheckoutForm = function() {
    const form = document.getElementById('checkoutForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processOrder();
        });
    }
};

// Generate order number
PharmacieGaherApp.prototype.generateOrderNumber = function() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD${timestamp.slice(-6)}${random}`;
};

console.log('✅ Fixed checkout.js loaded with persistent backend saving');
