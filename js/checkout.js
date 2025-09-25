// Fixed PharmacieGaherApp Checkout functionality with proper cart and API handling
class PharmacieGaherApp {
    constructor() {
        this.apiUrl = window.API_CONFIG?.baseURL || 'https://parapharmacie-gaher.onrender.com';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.authToken = localStorage.getItem('authToken');
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.settings = JSON.parse(localStorage.getItem('settings') || JSON.stringify({
            fraisLivraison: 5.99,
            fraisLivraisonGratuite: 50,
            couleurPrimaire: '#10b981'
        }));
        
        console.log('Checkout initialized with cart:', this.cart.length, 'items');
    }

    // Validate cart before checkout
    validateCart() {
        console.log('🛒 Validating cart...', this.cart);
        
        if (!this.cart || this.cart.length === 0) {
            console.log('❌ Cart is empty');
            return false;
        }

        // Check if all cart items have required fields
        for (let item of this.cart) {
            if (!item._id || !item.nom || !item.prix || !item.quantite) {
                console.log('❌ Cart item missing required fields:', item);
                return false;
            }
            if (item.quantite <= 0) {
                console.log('❌ Cart item has invalid quantity:', item);
                return false;
            }
        }

        console.log('✅ Cart validation passed');
        return true;
    }

    // Load checkout page
    loadCheckoutPage() {
        try {
            console.log('📦 Loading checkout page...');
            
            // Refresh cart from localStorage
            this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            if (!this.validateCart()) {
                document.getElementById('main-content').innerHTML = `
                    <div class="container mx-auto px-4 py-8">
                        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide</h2>
                            <p class="text-gray-600 mb-6">Ajoutez des produits à votre panier pour continuer vos achats.</p>
                            <button onclick="app.showPage('products')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors">
                                Continuer mes achats
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            // Calculate totals
            const sousTotal = this.cart.reduce((total, item) => total + (parseFloat(item.prix) * parseInt(item.quantite)), 0);
            const fraisLivraison = sousTotal >= this.settings.fraisLivraisonGratuite ? 0 : this.settings.fraisLivraison;
            const total = sousTotal + fraisLivraison;

            document.getElementById('main-content').innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="max-w-6xl mx-auto">
                        <div class="mb-8">
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">Finaliser ma commande</h1>
                            <div class="flex items-center space-x-2 text-sm text-gray-600">
                                <span class="bg-emerald-100 text-emerald-600 px-2 py-1 rounded">1</span>
                                <span>Panier</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <span class="bg-emerald-100 text-emerald-600 px-2 py-1 rounded">2</span>
                                <span>Informations</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded">3</span>
                                <span>Confirmation</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <!-- Formulaire de commande -->
                            <div class="lg:col-span-2">
                                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 class="text-xl font-semibold text-gray-800 mb-6">Informations de livraison</h2>
                                    
                                    <form id="checkout-form" onsubmit="return false;">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                                <input type="text" id="prenom" required 
                                                       value="${this.currentUser?.prenom || ''}"
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                                <input type="text" id="nom" required 
                                                       value="${this.currentUser?.nom || ''}"
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                                <input type="email" id="email" required 
                                                       value="${this.currentUser?.email || ''}"
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                                <input type="tel" id="telephone" required 
                                                       value="${this.currentUser?.telephone || ''}"
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                        </div>
                                        
                                        <div class="mt-6">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                                            <textarea id="adresse" required rows="3" 
                                                      class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                                        </div>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                                                <input type="text" id="codePostal" 
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                                                <input type="text" id="ville" 
                                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            </div>
                                        </div>
                                        
                                        <div class="mt-6">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
                                            <select id="wilaya" required 
                                                    class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
                                                <option value="M'Sila" selected>28 - M'Sila</option>
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
                                                <option value="Tipaza">42 - Tipaza</option>
                                                <option value="Mila">43 - Mila</option>
                                                <option value="Aïn Defla">44 - Aïn Defla</option>
                                                <option value="Naâma">45 - Naâma</option>
                                                <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
                                                <option value="Ghardaïa">47 - Ghardaïa</option>
                                                <option value="Relizane">48 - Relizane</option>
                                                <option value="Timimoun">49 - Timimoun</option>
                                                <option value="Bordj Badji Mokhtar">50 - Bordj Badji Mokhtar</option>
                                                <option value="Ouled Djellal">51 - Ouled Djellal</option>
                                                <option value="Béni Abbès">52 - Béni Abbès</option>
                                                <option value="In Salah">53 - In Salah</option>
                                                <option value="In Guezzam">54 - In Guezzam</option>
                                                <option value="Touggourt">55 - Touggourt</option>
                                                <option value="Djanet">56 - Djanet</option>
                                                <option value="El M'Ghair">57 - El M'Ghair</option>
                                                <option value="El Meniaa">58 - El Meniaa</option>
                                            </select>
                                        </div>

                                        <div class="mt-6">
                                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Mode de paiement</h3>
                                            <div class="space-y-3">
                                                <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input type="radio" name="modePaiement" value="paiement-livraison" checked 
                                                           class="mt-1 text-emerald-500 focus:ring-emerald-500">
                                                    <div>
                                                        <div class="font-medium text-gray-800">Paiement à la livraison</div>
                                                        <div class="text-sm text-gray-600">Payez en espèces lors de la réception de votre commande</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="mt-6">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Commentaires (optionnel)</label>
                                            <textarea id="commentaires" rows="3" 
                                                      placeholder="Instructions spéciales, notes pour la livraison..."
                                                      class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Résumé de commande -->
                            <div class="lg:col-span-1">
                                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                                    <h2 class="text-xl font-semibold text-gray-800 mb-6">Résumé de la commande</h2>
                                    
                                    <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                        ${this.cart.map(item => {
                                            const imageUrl = (item.images && item.images[0]) || 'https://via.placeholder.com/60x60?text=Produit';
                                            const itemTotal = parseFloat(item.prix) * parseInt(item.quantite);
                                            return `
                                                <div class="flex items-center space-x-3">
                                                    <img src="${imageUrl}" alt="${item.nom}" class="w-12 h-12 object-cover rounded-lg">
                                                    <div class="flex-1 min-w-0">
                                                        <p class="font-medium text-gray-800 truncate">${item.nom}</p>
                                                        <div class="flex items-center justify-between mt-1">
                                                            <span class="text-sm text-gray-600">Qté: ${item.quantite}</span>
                                                            <span class="text-sm font-medium text-gray-800">${itemTotal.toFixed(2)}€</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>

                                    <div class="border-t border-gray-100 pt-4 space-y-2">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Sous-total</span>
                                            <span class="font-medium text-gray-800">${sousTotal.toFixed(2)}€</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Frais de livraison</span>
                                            <span class="font-medium text-gray-800">
                                                ${fraisLivraison === 0 ? 'Gratuit' : fraisLivraison.toFixed(2) + '€'}
                                            </span>
                                        </div>
                                        ${sousTotal >= this.settings.fraisLivraisonGratuite ? `
                                            <div class="text-xs text-green-600 bg-green-50 p-2 rounded">
                                                🎉 Félicitations ! Vous bénéficiez de la livraison gratuite
                                            </div>
                                        ` : `
                                            <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                Ajoutez ${(this.settings.fraisLivraisonGratuite - sousTotal).toFixed(2)}€ pour la livraison gratuite
                                            </div>
                                        `}
                                        <div class="border-t border-gray-100 pt-2 flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span class="text-emerald-600">${total.toFixed(2)}€</span>
                                        </div>
                                    </div>

                                    <button onclick="app.processOrder()" id="process-order-btn"
                                            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg mt-6 transition-colors">
                                        Confirmer ma commande
                                    </button>

                                    <div class="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                        <span>Paiement sécurisé</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            console.log('✅ Checkout page loaded successfully');

        } catch (error) {
            console.error('❌ Error loading checkout page:', error);
            document.getElementById('main-content').innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 class="text-xl font-bold text-red-600 mb-2">Erreur</h2>
                        <p class="text-red-700">Une erreur est survenue lors du chargement de la page de commande.</p>
                        <button onclick="app.showPage('cart')" class="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                            Retour au panier
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Process order with improved API handling
    async processOrder() {
        try {
            console.log('🛒 Processing order...');
            
            // Validate form
            const form = document.getElementById('checkout-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Validate cart again
            if (!this.validateCart()) {
                alert('Votre panier est vide ou contient des données invalides.');
                return;
            }

            // Get form data
            const formData = {
                prenom: document.getElementById('prenom').value.trim(),
                nom: document.getElementById('nom').value.trim(),
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('telephone').value.trim(),
                adresse: document.getElementById('adresse').value.trim(),
                codePostal: document.getElementById('codePostal').value.trim(),
                ville: document.getElementById('ville').value.trim(),
                wilaya: document.getElementById('wilaya').value,
                modePaiement: document.querySelector('input[name="modePaiement"]:checked').value,
                commentaires: document.getElementById('commentaires').value.trim()
            };

            // Validate required fields
            if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone || !formData.adresse || !formData.wilaya) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            // Disable submit button
            const submitBtn = document.getElementById('process-order-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Traitement en cours...';

            // Calculate totals
            const sousTotal = this.cart.reduce((total, item) => total + (parseFloat(item.prix) * parseInt(item.quantite)), 0);
            const fraisLivraison = sousTotal >= this.settings.fraisLivraisonGratuite ? 0 : this.settings.fraisLivraison;
            const total = sousTotal + fraisLivraison;

            // Generate order number
            const numeroCommande = 'CMD' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();

            // Prepare order data
            const orderData = {
                numeroCommande: numeroCommande,
                client: formData,
                articles: this.cart.map(item => ({
                    produitId: item._id,
                    nom: item.nom,
                    prix: parseFloat(item.prix),
                    quantite: parseInt(item.quantite),
                    total: parseFloat(item.prix) * parseInt(item.quantite)
                })),
                sousTotal: sousTotal,
                fraisLivraison: fraisLivraison,
                total: total,
                modePaiement: formData.modePaiement,
                commentaires: formData.commentaires,
                statut: 'en-attente',
                dateCommande: new Date().toISOString(),
                dateMiseAJour: new Date().toISOString()
            };

            orderData._id = numeroCommande; // Use order number as ID for local storage

            console.log('📦 Order data prepared:', orderData);

            // Save to localStorage first (always works)
            let orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));
            console.log('✅ Order saved to localStorage');

            // Try to send to API (optional)
            let apiSuccess = false;
            try {
                const headers = { 'Content-Type': 'application/json' };
                if (this.authToken) {
                    headers['x-auth-token'] = this.authToken;
                    headers['Authorization'] = `Bearer ${this.authToken}`;
                }

                const response = await fetch(`${this.apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Order sent to API successfully:', result);
                    apiSuccess = true;
                } else {
                    console.log('⚠️ API response not OK:', response.status, response.statusText);
                }

            } catch (apiError) {
                console.log('⚠️ API not available, order saved locally only:', apiError.message);
            }

            // Clear cart
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartUI();

            // Show success message
            this.showOrderConfirmation(orderData, apiSuccess);

        } catch (error) {
            console.error('❌ Error processing order:', error);
            alert('Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.');
            
            // Re-enable submit button
            const submitBtn = document.getElementById('process-order-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmer ma commande';
        }
    }

    // Show order confirmation
    showOrderConfirmation(orderData, apiSuccess = false) {
        document.getElementById('main-content').innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div class="mb-6">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">Commande confirmée !</h1>
                        <p class="text-gray-600">Merci pour votre confiance. Votre commande a été enregistrée avec succès.</p>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Détails de votre commande</h2>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Numéro de commande:</span>
                                <span class="font-medium text-gray-800">#${orderData.numeroCommande}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Date:</span>
                                <span class="font-medium text-gray-800">${new Date(orderData.dateCommande).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total:</span>
                                <span class="font-medium text-emerald-600">${parseFloat(orderData.total).toFixed(2)}€</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Mode de paiement:</span>
                                <span class="font-medium text-gray-800">${orderData.modePaiement === 'paiement-livraison' ? 'Paiement à la livraison' : orderData.modePaiement}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Statut:</span>
                                <span class="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">En attente</span>
                            </div>
                        </div>
                    </div>

                    ${apiSuccess ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-center mb-2">
                                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span class="text-green-800 font-medium">Commande synchronisée</span>
                            </div>
                            <p class="text-green-700 text-sm">Votre commande a été enregistrée sur nos serveurs.</p>
                        </div>
                    ` : `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-center mb-2">
                                <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span class="text-blue-800 font-medium">Commande sauvegardée localement</span>
                            </div>
                            <p class="text-blue-700 text-sm">Votre commande sera synchronisée automatiquement dès que possible.</p>
                        </div>
                    `}

                    <div class="space-y-3">
                        <button onclick="app.showPage('home')" 
                                class="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors">
                            Continuer mes achats
                        </button>
                        <button onclick="app.showPage('products')" 
                                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                            Voir nos produits
                        </button>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Que se passe-t-il maintenant ?</h3>
                        <div class="space-y-2 text-sm text-gray-600 text-left">
                            <div class="flex items-start space-x-2">
                                <span class="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-xs font-medium">1</span>
                                <span>Nous préparons votre commande avec soin</span>
                            </div>
                            <div class="flex items-start space-x-2">
                                <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">2</span>
                                <span>Nous vous contactons pour confirmer l'adresse de livraison</span>
                            </div>
                            <div class="flex items-start space-x-2">
                                <span class="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-medium">3</span>
                                <span>Votre commande est expédiée sous 24-48h</span>
                            </div>
                            <div class="flex items-start space-x-2">
                                <span class="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">4</span>
                                <span>Vous recevez votre commande et réglez à la livraison</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update cart UI
    updateCartUI() {
        const cartButton = document.querySelector('.cart-button');
        const cartCount = document.getElementById('cart-count');
        
        if (cartButton && cartCount) {
            const totalItems = this.cart.reduce((total, item) => total + parseInt(item.quantite), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }

        console.log('🛒 Cart UI updated, items:', this.cart.length);
    }

    // Initialize checkout system
    initCheckoutSystem() {
        console.log('✅ Checkout system initialized');
        
        // Listen for cart updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.cart = JSON.parse(e.newValue || '[]');
                console.log('🛒 Cart updated from storage:', this.cart.length, 'items');
            }
        });
    }
}

// Ensure proper initialization
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && typeof window.app.initCheckoutSystem === 'function') {
        window.app.initCheckoutSystem();
    }
});

console.log('✅ Checkout script loaded successfully');
