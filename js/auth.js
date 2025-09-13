// Authentication Pages for Shifa Parapharmacie - FIXED VERSION
// Add missing authentication methods to PharmacieGaherApp prototype

// Login Page
PharmacieGaherApp.prototype.loadLoginPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <div class="flex justify-center mb-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                            <i class="fas fa-seedling text-white text-3xl"></i>
                        </div>
                    </div>
                    <h2 class="text-3xl font-bold text-emerald-800">Connexion</h2>
                    <p class="mt-2 text-emerald-600">Accédez à votre espace personnel</p>
                </div>

                <!-- Login Form -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                        <div>
                            <label for="loginEmail" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Email
                            </label>
                            <input
                                id="loginEmail"
                                name="email"
                                type="email"
                                required
                                class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80"
                                placeholder="votre@email.com"
                            >
                        </div>

                        <div>
                            <label for="loginPassword" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Mot de passe
                            </label>
                            <div class="relative">
                                <input
                                    id="loginPassword"
                                    name="password"
                                    type="password"
                                    required
                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80 pr-12"
                                    placeholder="••••••••"
                                >
                                <button
                                    type="button"
                                    onclick="togglePasswordVisibility('loginPassword')"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500 hover:text-emerald-700"
                                >
                                    <i class="fas fa-eye" id="loginPassword-icon"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                >
                                <label for="remember-me" class="ml-2 block text-sm text-emerald-700">
                                    Se souvenir de moi
                                </label>
                            </div>
                            <div class="text-sm">
                                <a href="#" onclick="showPage('forgot-password')" class="font-medium text-emerald-600 hover:text-emerald-500">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                id="loginSubmitBtn"
                                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <i class="fas fa-sign-in-alt text-emerald-300 group-hover:text-emerald-200"></i>
                                </span>
                                <span id="loginSubmitText">Se connecter</span>
                                <i id="loginSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </div>

                        <div class="text-center">
                            <span class="text-emerald-600">Pas encore de compte ?</span>
                            <button
                                type="button"
                                onclick="showPage('register')"
                                class="font-medium text-emerald-600 hover:text-emerald-500 ml-1 underline"
                            >
                                Créer un compte
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Back to Home -->
                <div class="text-center">
                    <button
                        onclick="showPage('home')"
                        class="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Register Page
PharmacieGaherApp.prototype.loadRegisterPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <div class="flex justify-center mb-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                            <i class="fas fa-user-plus text-white text-3xl"></i>
                        </div>
                    </div>
                    <h2 class="text-3xl font-bold text-emerald-800">Inscription</h2>
                    <p class="mt-2 text-emerald-600">Créez votre compte Shifa</p>
                </div>

                <!-- Register Form -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                    <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label for="registerPrenom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Prénom *
                                </label>
                                <input
                                    id="registerPrenom"
                                    name="prenom"
                                    type="text"
                                    required
                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80"
                                    placeholder="Votre prénom"
                                >
                            </div>

                            <div>
                                <label for="registerNom" class="block text-sm font-semibold text-emerald-700 mb-2">
                                    Nom *
                                </label>
                                <input
                                    id="registerNom"
                                    name="nom"
                                    type="text"
                                    required
                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80"
                                    placeholder="Votre nom"
                                >
                            </div>
                        </div>

                        <div>
                            <label for="registerEmail" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Email *
                            </label>
                            <input
                                id="registerEmail"
                                name="email"
                                type="email"
                                required
                                class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80"
                                placeholder="votre@email.com"
                            >
                        </div>

                        <div>
                            <label for="registerTelephone" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Téléphone *
                            </label>
                            <input
                                id="registerTelephone"
                                name="telephone"
                                type="tel"
                                required
                                class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80"
                                placeholder="+213 xxx xxx xxx"
                            >
                        </div>

                        <div>
                            <label for="registerPassword" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Mot de passe *
                            </label>
                            <div class="relative">
                                <input
                                    id="registerPassword"
                                    name="password"
                                    type="password"
                                    required
                                    minlength="6"
                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80 pr-12"
                                    placeholder="••••••••"
                                >
                                <button
                                    type="button"
                                    onclick="togglePasswordVisibility('registerPassword')"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500 hover:text-emerald-700"
                                >
                                    <i class="fas fa-eye" id="registerPassword-icon"></i>
                                </button>
                            </div>
                            <p class="text-xs text-emerald-600 mt-1">Minimum 6 caractères</p>
                        </div>

                        <div>
                            <label for="registerConfirmPassword" class="block text-sm font-semibold text-emerald-700 mb-2">
                                Confirmer le mot de passe *
                            </label>
                            <div class="relative">
                                <input
                                    id="registerConfirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all bg-white/80 pr-12"
                                    placeholder="••••••••"
                                >
                                <button
                                    type="button"
                                    onclick="togglePasswordVisibility('registerConfirmPassword')"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500 hover:text-emerald-700"
                                >
                                    <i class="fas fa-eye" id="registerConfirmPassword-icon"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center">
                            <input
                                id="terms-agreement"
                                name="terms"
                                type="checkbox"
                                required
                                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            >
                            <label for="terms-agreement" class="ml-2 block text-sm text-emerald-700">
                                J'accepte les <a href="#" class="font-medium text-emerald-600 hover:text-emerald-500">conditions d'utilisation</a>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                id="registerSubmitBtn"
                                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <i class="fas fa-user-plus text-emerald-300 group-hover:text-emerald-200"></i>
                                </span>
                                <span id="registerSubmitText">Créer mon compte</span>
                                <i id="registerSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                            </button>
                        </div>

                        <div class="text-center">
                            <span class="text-emerald-600">Déjà un compte ?</span>
                            <button
                                type="button"
                                onclick="showPage('login')"
                                class="font-medium text-emerald-600 hover:text-emerald-500 ml-1 underline"
                            >
                                Se connecter
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Back to Home -->
                <div class="text-center">
                    <button
                        onclick="showPage('home')"
                        class="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Profile Page
PharmacieGaherApp.prototype.loadProfilePage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Header -->
            <div class="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div class="flex items-center space-x-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                            <i class="fas fa-user text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-emerald-800">${this.currentUser.prenom} ${this.currentUser.nom}</h1>
                            <p class="text-emerald-600 text-lg">${this.currentUser.email}</p>
                            <span class="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                ${this.currentUser.role === 'admin' ? 'Administrateur' : 'Client'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Profile Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Profile Info -->
                <div class="lg:col-span-2">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations personnelles</h2>
                        
                        <form id="profileForm" onsubmit="updateProfile(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Prénom</label>
                                    <input type="text" id="profilePrenom" value="${this.currentUser.prenom}" 
                                           class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Nom</label>
                                    <input type="text" id="profileNom" value="${this.currentUser.nom}" 
                                           class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Email</label>
                                <input type="email" id="profileEmail" value="${this.currentUser.email}" 
                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Téléphone</label>
                                <input type="tel" id="profileTelephone" value="${this.currentUser.telephone || ''}" 
                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            
                            <div class="flex justify-end">
                                <button type="submit" 
                                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-bold">
                                    Mettre à jour
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="space-y-6">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                        <h3 class="text-lg font-bold text-emerald-800 mb-4">Actions rapides</h3>
                        <div class="space-y-3">
                            <button onclick="showPage('orders')" 
                                    class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-all">
                                <i class="fas fa-box mr-2"></i>Mes commandes
                            </button>
                            <button onclick="showChangePasswordModal()" 
                                    class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl transition-all">
                                <i class="fas fa-lock mr-2"></i>Changer mot de passe
                            </button>
                            ${this.currentUser.role === 'admin' ? `
                                <button onclick="showPage('admin')" 
                                        class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-all">
                                    <i class="fas fa-cog mr-2"></i>Administration
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-6">
                        <h3 class="text-lg font-bold text-red-800 mb-4">Zone dangereuse</h3>
                        <button onclick="logout()" 
                                class="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl transition-all">
                            <i class="fas fa-sign-out-alt mr-2"></i>Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Checkout Page
PharmacieGaherApp.prototype.loadCheckoutPage = async function() {
    const mainContent = document.getElementById('mainContent');
    
    if (this.cart.length === 0) {
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="text-center py-16">
                    <i class="fas fa-shopping-cart text-6xl text-emerald-200 mb-6"></i>
                    <h3 class="text-2xl font-bold text-emerald-800 mb-4">Votre panier est vide</h3>
                    <p class="text-emerald-600 mb-8">Ajoutez des produits avant de passer commande</p>
                    <button onclick="showPage('products')" 
                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                        Découvrir nos produits
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const subtotal = this.getCartTotal();
    const shipping = subtotal >= 5000 ? 0 : 300;
    const total = subtotal + shipping;
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <h1 class="text-3xl font-bold text-emerald-800 mb-8 text-center">Finaliser ma commande</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Order Form -->
                <div class="lg:col-span-2">
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Informations de livraison</h2>
                        
                        <form id="checkoutForm" onsubmit="processOrder(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Prénom *</label>
                                    <input type="text" id="checkoutPrenom" required 
                                           value="${this.currentUser?.prenom || ''}"
                                           class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-emerald-700 mb-2">Nom *</label>
                                    <input type="text" id="checkoutNom" required 
                                           value="${this.currentUser?.nom || ''}"
                                           class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Email *</label>
                                <input type="email" id="checkoutEmail" required 
                                       value="${this.currentUser?.email || ''}"
                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Téléphone *</label>
                                <input type="tel" id="checkoutTelephone" required 
                                       value="${this.currentUser?.telephone || ''}"
                                       class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all"
                                       placeholder="+213 xxx xxx xxx">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Adresse complète *</label>
                                <textarea id="checkoutAdresse" required rows="3" 
                                          class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Adresse complète avec détails"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Wilaya *</label>
                                <select id="checkoutWilaya" required 
                                        class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all">
                                    <option value="">Sélectionnez votre wilaya</option>
                                    <option value="Alger">01 - Alger</option>
                                    <option value="Blida">09 - Blida</option>
                                    <option value="Tipaza">42 - Tipaza</option>
                                    <option value="Boumerdès">35 - Boumerdès</option>
                                    <option value="Médéa">26 - Médéa</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-emerald-700 mb-2">Commentaires</label>
                                <textarea id="checkoutCommentaires" rows="2" 
                                          class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 transition-all resize-none"
                                          placeholder="Instructions spéciales pour la livraison..."></textarea>
                            </div>
                            
                            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <h3 class="font-semibold text-emerald-800 mb-2">Mode de paiement</h3>
                                <label class="flex items-center">
                                    <input type="radio" name="payment" value="cash" checked 
                                           class="text-emerald-600 focus:ring-emerald-500">
                                    <span class="ml-2 text-emerald-700">Paiement à la livraison (Espèces)</span>
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Order Summary -->
                <div>
                    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 sticky top-4">
                        <h2 class="text-2xl font-bold text-emerald-800 mb-6">Récapitulatif</h2>
                        
                        <!-- Cart Items -->
                        <div class="space-y-4 mb-6">
                            ${this.cart.map(item => `
                                <div class="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl">
                                    <img src="${item.image}" alt="${item.nom}" 
                                         class="w-12 h-12 object-cover rounded-lg">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-emerald-800 text-sm">${item.nom}</h4>
                                        <p class="text-xs text-emerald-600">${item.quantite} × ${item.prix} DA</p>
                                    </div>
                                    <span class="font-semibold text-emerald-700">${item.quantite * item.prix} DA</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Totals -->
                        <div class="space-y-3 mb-6 border-t border-emerald-200 pt-4">
                            <div class="flex justify-between text-emerald-700">
                                <span>Sous-total:</span>
                                <span>${subtotal} DA</span>
                            </div>
                            <div class="flex justify-between text-emerald-700">
                                <span>Livraison:</span>
                                <span>${shipping === 0 ? 'Gratuite' : shipping + ' DA'}</span>
                            </div>
                            ${shipping === 0 ? '<p class="text-xs text-green-600">🎉 Livraison gratuite pour les commandes de 5000 DA et plus!</p>' : ''}
                            <div class="flex justify-between text-lg font-bold text-emerald-800 border-t border-emerald-200 pt-3">
                                <span>Total:</span>
                                <span>${total} DA</span>
                            </div>
                        </div>
                        
                        <!-- Place Order Button -->
                        <button onclick="processOrder()" 
                                class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
                            <i class="fas fa-credit-card mr-2"></i>
                            Confirmer la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Order Confirmation Page
PharmacieGaherApp.prototype.loadOrderConfirmationPage = async function(orderNumber) {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="text-center mb-8">
                <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check text-green-600 text-4xl"></i>
                </div>
                <h1 class="text-4xl font-bold text-green-800 mb-4">Commande confirmée !</h1>
                <p class="text-xl text-green-600 mb-2">Merci pour votre commande</p>
                <p class="text-emerald-600">Numéro de commande: <strong>#${orderNumber}</strong></p>
            </div>
            
            <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 class="text-2xl font-bold text-emerald-800 mb-6">Que se passe-t-il maintenant ?</h2>
                
                <div class="space-y-6">
                    <div class="flex items-start space-x-4">
                        <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-envelope text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-emerald-800">Confirmation par email</h3>
                            <p class="text-emerald-600 text-sm">Vous recevrez un email de confirmation avec tous les détails de votre commande.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-box text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-emerald-800">Préparation de votre commande</h3>
                            <p class="text-emerald-600 text-sm">Notre équipe prépare soigneusement votre commande dans les plus brefs délais.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-truck text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-emerald-800">Livraison</h3>
                            <p class="text-emerald-600 text-sm">Votre commande vous sera livrée sous 24-48h. Paiement à la livraison.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center space-y-4">
                <button onclick="showPage('home')" 
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg mr-4">
                    Retour à l'accueil
                </button>
                <button onclick="showPage('products')" 
                        class="bg-white text-emerald-600 py-3 px-8 rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition-all">
                    Continuer les achats
                </button>
            </div>
        </div>
    `;
};

// Authentication Handlers
async function handleLogin(event) {
    event.preventDefault();
    
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');
    const spinner = document.getElementById('loginSubmitSpinner');
    
    // Get form data
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        app.showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response && response.token) {
            // Store token
            localStorage.setItem('token', response.token);
            
            // Update current user
            app.currentUser = response.user;
            app.updateUserUI();
            
            app.showToast(`Bienvenue ${response.user.prenom} !`, 'success');
            
            // Redirect to appropriate page
            if (response.user.role === 'admin') {
                app.showPage('admin');
            } else {
                app.showPage('home');
            }
        } else {
            throw new Error('Réponse invalide du serveur');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        app.showToast(error.message || 'Erreur de connexion', 'error');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const spinner = document.getElementById('registerSubmitSpinner');
    
    // Get form data
    const prenom = document.getElementById('registerPrenom').value.trim();
    const nom = document.getElementById('registerNom').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const telephone = document.getElementById('registerTelephone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!prenom || !nom || !email || !telephone || !password || !confirmPassword) {
        app.showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password.length < 6) {
        app.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        app.showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                prenom,
                nom,
                email,
                telephone,
                password
            })
        });
        
        if (response && response.token) {
            // Store token
            localStorage.setItem('token', response.token);
            
            // Update current user
            app.currentUser = response.user;
            app.updateUserUI();
            
            app.showToast(`Bienvenue ${response.user.prenom} ! Votre compte a été créé.`, 'success');
            app.showPage('home');
        } else {
            throw new Error('Réponse invalide du serveur');
        }
        
    } catch (error) {
        console.error('Register error:', error);
        app.showToast(error.message || 'Erreur lors de la création du compte', 'error');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// Utility Functions
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');
    
    if (field && icon) {
        if (field.type === 'password') {
            field.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            field.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const prenom = document.getElementById('profilePrenom').value.trim();
    const nom = document.getElementById('profileNom').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const telephone = document.getElementById('profileTelephone').value.trim();
    
    if (!prenom || !nom || !email) {
        app.showToast('Veuillez remplir les champs obligatoires', 'error');
        return;
    }
    
    try {
        const response = await apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({
                prenom,
                nom,
                email,
                telephone
            })
        });
        
        // Update local user data
        app.currentUser = { ...app.currentUser, prenom, nom, email, telephone };
        app.showToast('Profil mis à jour avec succès', 'success');
        
    } catch (error) {
        console.error('Profile update error:', error);
        app.showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    }
}

// Checkout Handler
async function processOrder() {
    const form = document.getElementById('checkoutForm');
    
    if (!form || !form.checkValidity()) {
        app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    const orderData = {
        numeroCommande: 'CMD' + Date.now(),
        client: {
            prenom: document.getElementById('checkoutPrenom').value.trim(),
            nom: document.getElementById('checkoutNom').value.trim(),
            email: document.getElementById('checkoutEmail').value.trim(),
            telephone: document.getElementById('checkoutTelephone').value.trim(),
            adresse: document.getElementById('checkoutAdresse').value.trim(),
            wilaya: document.getElementById('checkoutWilaya').value
        },
        articles: app.cart.map(item => ({
            id: item.id,
            nom: item.nom,
            prix: item.prix,
            quantite: item.quantite,
            image: item.image
        })),
        sousTotal: app.getCartTotal(),
        fraisLivraison: app.getCartTotal() >= 5000 ? 0 : 300,
        total: app.getCartTotal() + (app.getCartTotal() >= 5000 ? 0 : 300),
        statut: 'en-attente',
        modePaiement: 'Paiement à la livraison',
        commentaires: document.getElementById('checkoutCommentaires').value.trim(),
        dateCommande: new Date().toISOString()
    };
    
    try {
        // Save order locally
        if (typeof addOrderToDemo === 'function') {
            addOrderToDemo(orderData);
        }
        
        // Try to save to API
        try {
            await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
        } catch (error) {
            console.log('API order save failed, but saved locally');
        }
        
        // Clear cart
        app.clearCart();
        
        // Show confirmation page
        app.showPage('order-confirmation', { orderNumber: orderData.numeroCommande });
        
    } catch (error) {
        console.error('Order processing error:', error);
        app.showToast('Erreur lors du traitement de la commande', 'error');
    }
}

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.togglePasswordVisibility = togglePasswordVisibility;
window.updateProfile = updateProfile;
window.processOrder = processOrder;

console.log('✅ Authentication pages loaded successfully');
