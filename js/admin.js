// Enhanced Admin System for Shifa Parapharmacie
class PharmacieGaherApp {

    // Admin page sections
    async switchAdminSection(section) {
        if (!this.requireAdmin()) return;
        
        console.log('🔄 Switching to admin section:', section);
        
        // Update navigation
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
            btn.classList.add('text-emerald-700', 'hover:bg-emerald-50');
        });
        
        const activeBtn = document.querySelector(`.admin-nav-btn.${section}`);
        if (activeBtn) {
            activeBtn.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600', 'text-white');
            activeBtn.classList.remove('text-emerald-700', 'hover:bg-emerald-50');
        }
        
        // Load section content
        switch(section) {
            case 'dashboard':
                await this.loadAdminDashboard();
                break;
            case 'products':
                await this.loadAdminProducts();
                break;
            case 'orders':
                await this.loadAdminOrders();
                break;
            case 'featured':
                await this.loadAdminFeatured();
                break;
            case 'cleanup':
                await this.loadAdminCleanup();
                break;
            default:
                await this.loadAdminDashboard();
        }
    }
    
    // Enhanced products management
    async loadAdminProducts() {
        const adminContent = document.getElementById('adminContent');
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <!-- Products Header -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 class="text-3xl font-bold text-emerald-800 mb-2">Gestion des Produits</h2>
                            <p class="text-emerald-600">Ajoutez, modifiez et gérez vos produits</p>
                        </div>
                        <button onclick="openProductModal()" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                            <i class="fas fa-plus mr-2"></i>Nouveau produit
                        </button>
                    </div>
                </div>
                
                <!-- Filters and Search -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-emerald-700 font-semibold mb-2">Rechercher</label>
                            <input type="text" id="productSearchInput" placeholder="Nom, marque..."
                                   class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                        </div>
                        <div>
                            <label class="block text-emerald-700 font-semibold mb-2">Catégorie</label>
                            <select id="productCategoryFilter" 
                                    class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                <option value="">Toutes les catégories</option>
                                <option value="Vitalité">Vitalité</option>
                                <option value="Sport">Sport</option>
                                <option value="Visage">Visage</option>
                                <option value="Cheveux">Cheveux</option>
                                <option value="Solaire">Solaire</option>
                                <option value="Intime">Intime</option>
                                <option value="Soins">Soins</option>
                                <option value="Bébé">Bébé</option>
                                <option value="Homme">Homme</option>
                                <option value="Dentaire">Dentaire</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-emerald-700 font-semibold mb-2">Stock</label>
                            <select id="productStockFilter"
                                    class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                <option value="">Tous</option>
                                <option value="low">Stock faible (&lt; 5)</option>
                                <option value="out">Rupture de stock</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-emerald-700 font-semibold mb-2">Trier par</label>
                            <select id="productSortFilter"
                                    class="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                <option value="newest">Plus récents</option>
                                <option value="name_asc">Nom A-Z</option>
                                <option value="name_desc">Nom Z-A</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="stock_asc">Stock croissant</option>
                                <option value="stock_desc">Stock décroissant</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-4">
                        <button onclick="applyProductFilters()" 
                                class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">
                            <i class="fas fa-filter mr-2"></i>Appliquer les filtres
                        </button>
                        <button onclick="clearProductFilters()" 
                                class="text-emerald-600 hover:text-emerald-800 transition-all">
                            <i class="fas fa-times mr-1"></i>Effacer
                        </button>
                    </div>
                </div>
                
                <!-- Products List -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
                    <div class="p-6 border-b border-emerald-200">
                        <h3 class="text-xl font-bold text-emerald-800">Liste des Produits</h3>
                        <p class="text-emerald-600" id="productsCount">Chargement...</p>
                    </div>
                    <div class="overflow-x-auto">
                        <div id="productsTable">
                            <div class="flex justify-center items-center py-16">
                                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                                <span class="ml-4 text-emerald-600">Chargement des produits...</span>
                            </div>
                        </div>
                    </div>
                    <div id="productsPagination" class="px-6 py-4 border-t border-emerald-200 bg-emerald-50/50">
                        <!-- Pagination will be inserted here -->
                    </div>
                </div>
            </div>
            
            <!-- Product Modal -->
            <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen px-4 py-8">
                    <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div class="p-8">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-3xl font-bold text-emerald-800" id="productModalTitle">Nouveau Produit</h2>
                                <button onclick="closeProductModal()" 
                                        class="text-gray-400 hover:text-gray-600 text-2xl">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <form id="productForm" class="space-y-6">
                                <input type="hidden" id="productId">
                                
                                <!-- Basic Information -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Nom du produit *</label>
                                        <input type="text" id="productNom" required
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Marque</label>
                                        <input type="text" id="productMarque"
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-emerald-700 font-semibold mb-2">Description *</label>
                                    <textarea id="productDescription" required rows="3"
                                              class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all resize-none"></textarea>
                                </div>
                                
                                <!-- Pricing -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Prix (DA) *</label>
                                        <input type="number" id="productPrix" required min="0" step="0.01"
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Prix original (DA)</label>
                                        <input type="number" id="productPrixOriginal" min="0" step="0.01"
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Stock *</label>
                                        <input type="number" id="productStock" required min="0"
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                    </div>
                                </div>
                                
                                <!-- Category and Options -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Catégorie *</label>
                                        <select id="productCategorie" required
                                                class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all">
                                            <option value="">Sélectionnez une catégorie</option>
                                            <option value="Vitalité">Vitalité</option>
                                            <option value="Sport">Sport</option>
                                            <option value="Visage">Visage</option>
                                            <option value="Cheveux">Cheveux</option>
                                            <option value="Solaire">Solaire</option>
                                            <option value="Intime">Intime</option>
                                            <option value="Soins">Soins</option>
                                            <option value="Bébé">Bébé</option>
                                            <option value="Homme">Homme</option>
                                            <option value="Dentaire">Dentaire</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Image URL</label>
                                        <input type="url" id="productImage"
                                               class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all"
                                               placeholder="https://example.com/image.jpg">
                                    </div>
                                </div>
                                
                                <!-- Checkboxes -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div class="flex items-center space-x-3">
                                        <input type="checkbox" id="productEnVedette" 
                                               class="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded focus:ring-emerald-500">
                                        <label class="text-emerald-700 font-semibold">En vedette</label>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <input type="checkbox" id="productEnPromotion"
                                               class="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded focus:ring-emerald-500">
                                        <label class="text-emerald-700 font-semibold">En promotion</label>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <input type="checkbox" id="productActif" checked
                                               class="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded focus:ring-emerald-500">
                                        <label class="text-emerald-700 font-semibold">Actif</label>
                                    </div>
                                </div>
                                
                                <!-- Additional Information -->
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Ingrédients</label>
                                        <textarea id="productIngredients" rows="2"
                                                  class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Mode d'emploi</label>
                                        <textarea id="productModeEmploi" rows="2"
                                                  class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-emerald-700 font-semibold mb-2">Précautions</label>
                                        <textarea id="productPrecautions" rows="2"
                                                  class="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 transition-all resize-none"></textarea>
                                    </div>
                                </div>
                                
                                <!-- Submit Buttons -->
                                <div class="flex justify-end space-x-4 pt-6">
                                    <button type="button" onclick="closeProductModal()"
                                            class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                                        Annuler
                                    </button>
                                    <button type="submit"
                                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                                        <span id="productSubmitText">Enregistrer</span>
                                        <i id="productSubmitSpinner" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize products management
        this.initProductManagement();
    }
    
    // Enhanced cleanup system
    async loadAdminCleanup() {
        const adminContent = document.getElementById('adminContent');
        
        adminContent.innerHTML = `
            <div class="space-y-8">
                <!-- Cleanup Header -->
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl shadow-2xl border-4 border-red-200 p-8 text-white">
                    <div class="flex items-center mb-6">
                        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                            <i class="fas fa-broom text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-4xl font-bold mb-2">Nettoyage des Produits</h2>
                            <p class="text-red-100 text-lg">Supprimez les produits indésirables de votre base de données</p>
                        </div>
                    </div>
                    <div class="bg-red-600/30 border border-red-300/30 rounded-xl p-4">
                        <p class="flex items-center">
                            <i class="fas fa-exclamation-triangle mr-3 text-yellow-300"></i>
                            <strong>Attention:</strong> Cette action est irréversible. Assurez-vous de bien comprendre les critères avant de continuer.
                        </p>
                    </div>
                </div>
                
                <!-- Current Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6" id="cleanupStats">
                    <!-- Stats will be loaded here -->
                </div>
                
                <!-- Cleanup Criteria -->
                <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 overflow-hidden">
                    <div class="bg-gradient-to-r from-red-50 to-red-100 px-8 py-6 border-b border-red-200">
                        <h3 class="text-2xl font-bold text-red-800 mb-2">Critères de Nettoyage</h3>
                        <p class="text-red-600">Sélectionnez les critères pour identifier les produits à supprimer</p>
                    </div>
                    
                    <div class="p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Status Criteria -->
                            <div class="space-y-6">
                                <h4 class="text-xl font-bold text-gray-800 mb-4">Statut des Produits</h4>
                                
                                <div class="space-y-4">
                                    <label class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer">
                                        <input type="checkbox" id="cleanupInactive" class="w-5 h-5 text-red-600 border-2 border-gray-300 rounded">
                                        <div>
                                            <span class="font-semibold text-gray-700">Produits inactifs</span>
                                            <p class="text-sm text-gray-500">Produits marqués comme inactifs</p>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer">
                                        <input type="checkbox" id="cleanupOutOfStock" class="w-5 h-5 text-red-600 border-2 border-gray-300 rounded">
                                        <div>
                                            <span class="font-semibold text-gray-700">Ruptures de stock</span>
                                            <p class="text-sm text-gray-500">Produits avec stock = 0</p>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer">
                                        <input type="checkbox" id="cleanupLowStock" class="w-5 h-5 text-red-600 border-2 border-gray-300 rounded">
                                        <div>
                                            <span class="font-semibold text-gray-700">Stock très faible</span>
                                            <p class="text-sm text-gray-500">Produits avec stock ≤ 2</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Time Criteria -->
                            <div class="space-y-6">
                                <h4 class="text-xl font-bold text-gray-800 mb-4">Critères Temporels</h4>
                                
                                <div class="space-y-4">
                                    <label class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer">
                                        <input type="checkbox" id="cleanupOldProducts" class="w-5 h-5 text-red-600 border-2 border-gray-300 rounded">
                                        <div class="flex-1">
                                            <span class="font-semibold text-gray-700">Produits anciens</span>
                                            <div class="flex items-center mt-2 space-x-2">
                                                <span class="text-sm text-gray-500">Plus de</span>
                                                <input type="number" id="cleanupDaysBefore" value="90" min="1" max="365"
                                                       class="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm">
                                                <span class="text-sm text-gray-500">jours</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Category Filter -->
                        <div class="mt-8">
                            <h4 class="text-xl font-bold text-gray-800 mb-4">Catégories (optionnel)</h4>
                            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Vitalité">
                                    <span class="text-sm">Vitalité</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Sport">
                                    <span class="text-sm">Sport</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Visage">
                                    <span class="text-sm">Visage</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Cheveux">
                                    <span class="text-sm">Cheveux</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Solaire">
                                    <span class="text-sm">Solaire</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Intime">
                                    <span class="text-sm">Intime</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Soins">
                                    <span class="text-sm">Soins</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Bébé">
                                    <span class="text-sm">Bébé</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Homme">
                                    <span class="text-sm">Homme</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="cleanup-category w-4 h-4 text-red-600" value="Dentaire">
                                    <span class="text-sm">Dentaire</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Price Range Filter -->
                        <div class="mt-8">
                            <h4 class="text-xl font-bold text-gray-800 mb-4">Fourchette de Prix (optionnel)</h4>
                            <div class="flex items-center space-x-4">
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Prix minimum</label>
                                    <input type="number" id="cleanupPriceMin" placeholder="0" min="0"
                                           class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Prix maximum</label>
                                    <input type="number" id="cleanupPriceMax" placeholder="10000" min="0"
                                           class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
                            <button onclick="previewCleanup()" 
                                    class="bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all">
                                <i class="fas fa-eye mr-2"></i>Prévisualiser
                            </button>
                            
                            <div class="space-x-4">
                                <button onclick="resetCleanupCriteria()" 
                                        class="text-gray-600 hover:text-gray-800 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all">
                                    <i class="fas fa-undo mr-2"></i>Réinitialiser
                                </button>
                                <button onclick="executeCleanup()" id="executeCleanupBtn"
                                        class="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-8 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                                    <i class="fas fa-trash-alt mr-2"></i>Exécuter le Nettoyage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Preview Results -->
                <div id="cleanupPreview" class="hidden bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-yellow-200/50 overflow-hidden">
                    <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 px-8 py-6 border-b border-yellow-200">
                        <h3 class="text-2xl font-bold text-yellow-800 mb-2">Prévisualisation</h3>
                        <p class="text-yellow-600">Produits qui seront supprimés selon vos critères</p>
                    </div>
                    <div class="p-8">
                        <div id="previewContent">
                            <!-- Preview content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load cleanup stats
        this.loadCleanupStats();
    }
    
    // Initialize product management
    initProductManagement() {
        this.loadProductsList();
        
        // Setup form submission
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
        
        // Setup search
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.loadProductsList();
            }, 300));
        }
    }
    
    async loadProductsList() {
        const productsTable = document.getElementById('productsTable');
        const productsCount = document.getElementById('productsCount');
        
        try {
            // Get local products from cache
            const localProducts = this.allProducts || [];
            
            // Apply filters
            let filteredProducts = [...localProducts];
            
            const searchTerm = document.getElementById('productSearchInput')?.value.toLowerCase() || '';
            const categoryFilter = document.getElementById('productCategoryFilter')?.value || '';
            const stockFilter = document.getElementById('productStockFilter')?.value || '';
            const sortFilter = document.getElementById('productSortFilter')?.value || 'newest';
            
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(p => 
                    p.nom.toLowerCase().includes(searchTerm) ||
                    (p.marque && p.marque.toLowerCase().includes(searchTerm)) ||
                    (p.description && p.description.toLowerCase().includes(searchTerm))
                );
            }
            
            if (categoryFilter) {
                filteredProducts = filteredProducts.filter(p => p.categorie === categoryFilter);
            }
            
            if (stockFilter) {
                if (stockFilter === 'low') {
                    filteredProducts = filteredProducts.filter(p => p.stock < 5 && p.stock > 0);
                } else if (stockFilter === 'out') {
                    filteredProducts = filteredProducts.filter(p => p.stock === 0);
                }
            }
            
            // Sort products
            filteredProducts.sort((a, b) => {
                switch (sortFilter) {
                    case 'name_asc': return a.nom.localeCompare(b.nom);
                    case 'name_desc': return b.nom.localeCompare(a.nom);
                    case 'price_asc': return a.prix - b.prix;
                    case 'price_desc': return b.prix - a.prix;
                    case 'stock_asc': return a.stock - b.stock;
                    case 'stock_desc': return b.stock - a.stock;
                    case 'newest': return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0);
                    default: return 0;
                }
            });
            
            if (productsCount) {
                productsCount.textContent = `${filteredProducts.length} produits trouvés`;
            }
            
            if (filteredProducts.length === 0) {
                productsTable.innerHTML = `
                    <div class="text-center py-16">
                        <i class="fas fa-box-open text-6xl text-gray-300 mb-6"></i>
                        <h3 class="text-2xl font-bold text-gray-700 mb-4">Aucun produit trouvé</h3>
                        <p class="text-gray-500 mb-8">Aucun produit ne correspond à vos critères de recherche</p>
                        <button onclick="openProductModal()" 
                                class="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                            <i class="fas fa-plus mr-2"></i>Ajouter un produit
                        </button>
                    </div>
                `;
                return;
            }
            
            // Generate products table
            productsTable.innerHTML = `
                <table class="min-w-full">
                    <thead class="bg-emerald-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Produit</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Catégorie</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Prix</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Statut</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${filteredProducts.map(product => this.generateProductRow(product)).join('')}
                    </tbody>
                </table>
            `;
            
        } catch (error) {
            console.error('Error loading products list:', error);
            productsTable.innerHTML = `
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-700 mb-4">Erreur de chargement</h3>
                    <p class="text-red-500">Impossible de charger la liste des produits</p>
                </div>
            `;
        }
    }
    
    generateProductRow(product) {
        const imageUrl = product.image || `https://via.placeholder.com/64x64/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}`;
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img class="h-12 w-12 rounded-lg object-cover border-2 border-emerald-200" 
                             src="${imageUrl}" 
                             alt="${product.nom}"
                             onerror="this.src='https://via.placeholder.com/64x64/10b981/ffffff?text=${encodeURIComponent(product.nom.substring(0, 2).toUpperCase())}'">
                        <div class="ml-4">
                            <div class="text-sm font-bold text-gray-900">${product.nom}</div>
                            <div class="text-sm text-gray-500">${product.marque || 'Sans marque'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        ${product.categorie}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">${product.prix} DA</div>
                    ${product.prixOriginal ? `<div class="text-xs text-gray-500 line-through">${product.prixOriginal} DA</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' :
                        product.stock < 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }">
                        ${product.stock} unités
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col space-y-1">
                        ${product.actif !== false ? '<span class="text-xs text-green-600">✓ Actif</span>' : '<span class="text-xs text-red-600">✗ Inactif</span>'}
                        ${product.enVedette ? '<span class="text-xs text-yellow-600">⭐ Vedette</span>' : ''}
                        ${product.enPromotion ? '<span class="text-xs text-red-600">🏷️ Promo</span>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button onclick="editProduct('${product._id}')" 
                            class="text-emerald-600 hover:text-emerald-900 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleProductFeatured('${product._id}', ${!product.enVedette})" 
                            class="text-yellow-600 hover:text-yellow-900 transition-colors" 
                            title="${product.enVedette ? 'Retirer de la vedette' : 'Mettre en vedette'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button onclick="deleteProduct('${product._id}', '${product.nom}')" 
                            class="text-red-600 hover:text-red-900 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    async saveProduct() {
        const form = document.getElementById('productForm');
        const productId = document.getElementById('productId').value;
        
        // Get form data
        const productData = {
            nom: document.getElementById('productNom').value.trim(),
            marque: document.getElementById('productMarque').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            prix: parseFloat(document.getElementById('productPrix').value),
            prixOriginal: document.getElementById('productPrixOriginal').value ? parseFloat(document.getElementById('productPrixOriginal').value) : null,
            stock: parseInt(document.getElementById('productStock').value),
            categorie: document.getElementById('productCategorie').value,
            image: document.getElementById('productImage').value.trim(),
            enVedette: document.getElementById('productEnVedette').checked,
            enPromotion: document.getElementById('productEnPromotion').checked,
            actif: document.getElementById('productActif').checked,
            ingredients: document.getElementById('productIngredients').value.trim(),
            modeEmploi: document.getElementById('productModeEmploi').value.trim(),
            precautions: document.getElementById('productPrecautions').value.trim()
        };
        
        // Basic validation
        if (!productData.nom || !productData.description || !productData.prix || !productData.categorie) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        if (productData.prix < 0) {
            this.showToast('Le prix ne peut pas être négatif', 'error');
            return;
        }
        
        if (productData.stock < 0) {
            this.showToast('Le stock ne peut pas être négatif', 'error');
            return;
        }
        
        if (productData.prixOriginal && productData.prixOriginal <= productData.prix) {
            this.showToast('Le prix original doit être supérieur au prix actuel', 'error');
            return;
        }
        
        this.showProductLoading(true);
        
        try {
            // Get current products from localStorage
            let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            
            if (productId) {
                // Update existing product
                const productIndex = products.findIndex(p => p._id === productId);
                if (productIndex > -1) {
                    products[productIndex] = { ...products[productIndex], ...productData };
                    console.log('✅ Product updated locally:', productData.nom);
                    this.showToast('Produit mis à jour avec succès !', 'success');
                }
            } else {
                // Create new product
                const newProduct = {
                    _id: Date.now().toString(),
                    ...productData,
                    dateAjout: new Date().toISOString()
                };
                products.push(newProduct);
                console.log('✅ Product created locally:', productData.nom);
                this.showToast('Produit créé avec succès !', 'success');
            }
            
            // Save back to localStorage
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            // Refresh cache
            this.allProducts = products;
            this.refreshProductsCache();
            
            // Close modal and refresh list
            this.closeProductModal();
            this.loadProductsList();
            
        } catch (error) {
            console.error('Product save error:', error);
            this.showToast('Erreur lors de la sauvegarde du produit', 'error');
        } finally {
            this.showProductLoading(false);
        }
    }
    
    loadCleanupStats() {
        const statsContainer = document.getElementById('cleanupStats');
        const products = this.allProducts || [];
        
        const stats = {
            total: products.length,
            inactive: products.filter(p => p.actif === false).length,
            outOfStock: products.filter(p => p.stock === 0).length,
            lowStock: products.filter(p => p.stock <= 2 && p.stock > 0).length
        };
        
        statsContainer.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total</p>
                        <p class="text-3xl font-bold text-blue-800">${stats.total}</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <i class="fas fa-box text-white text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-red-600 uppercase tracking-wide">Inactifs</p>
                        <p class="text-3xl font-bold text-red-800">${stats.inactive}</p>
                    </div>
                    <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <i class="fas fa-pause-circle text-white text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-orange-600 uppercase tracking-wide">Stock épuisé</p>
                        <p class="text-3xl font-bold text-orange-800">${stats.outOfStock}</p>
                    </div>
                    <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Stock faible</p>
                        <p class="text-3xl font-bold text-yellow-800">${stats.lowStock}</p>
                    </div>
                    <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <i class="fas fa-exclamation-circle text-white text-xl"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    showProductLoading(show) {
        const submitText = document.getElementById('productSubmitText');
        const submitSpinner = document.getElementById('productSubmitSpinner');
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        
        if (show) {
            submitText.textContent = 'Enregistrement...';
            submitSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            submitText.textContent = 'Enregistrer';
            submitSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    closeProductModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
        }
    }
}

// Global functions for admin
function switchAdminSection(section) {
    if (window.app) {
        window.app.switchAdminSection(section);
    }
}

function openProductModal() {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    if (modal && title) {
        title.textContent = 'Nouveau Produit';
        modal.classList.remove('hidden');
        
        // Reset form
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productActif').checked = true;
    }
}

function closeProductModal() {
    if (window.app) {
        window.app.closeProductModal();
    }
}

function editProduct(productId) {
    if (!window.app || !window.app.allProducts) return;
    
    const product = window.app.allProducts.find(p => p._id === productId);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('productId').value = product._id;
    document.getElementById('productNom').value = product.nom || '';
    document.getElementById('productMarque').value = product.marque || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrix').value = product.prix || 0;
    document.getElementById('productPrixOriginal').value = product.prixOriginal || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productCategorie').value = product.categorie || '';
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productEnVedette').checked = product.enVedette || false;
    document.getElementById('productEnPromotion').checked = product.enPromotion || false;
    document.getElementById('productActif').checked = product.actif !== false;
    document.getElementById('productIngredients').value = product.ingredients || '';
    document.getElementById('productModeEmploi').value = product.modeEmploi || '';
    document.getElementById('productPrecautions').value = product.precautions || '';
    
    // Update modal title
    document.getElementById('productModalTitle').textContent = 'Modifier le Produit';
    
    // Show modal
    document.getElementById('productModal').classList.remove('hidden');
}

function deleteProduct(productId, productName) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
        return;
    }
    
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        products = products.filter(p => p._id !== productId);
        localStorage.setItem('demoProducts', JSON.stringify(products));
        
        if (window.app) {
            window.app.allProducts = products;
            window.app.refreshProductsCache();
            window.app.loadProductsList();
            window.app.showToast(`"${productName}" supprimé avec succès`, 'success');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la suppression', 'error');
        }
    }
}

function toggleProductFeatured(productId, featured) {
    try {
        let products = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        const productIndex = products.findIndex(p => p._id === productId);
        
        if (productIndex > -1) {
            products[productIndex].enVedette = featured;
            localStorage.setItem('demoProducts', JSON.stringify(products));
            
            if (window.app) {
                window.app.allProducts = products;
                window.app.refreshProductsCache();
                window.app.loadProductsList();
                window.app.showToast(
                    featured ? 'Produit mis en vedette' : 'Produit retiré de la vedette', 
                    'success'
                );
            }
        }
    } catch (error) {
        console.error('Toggle featured error:', error);
        if (window.app) {
            window.app.showToast('Erreur lors de la mise à jour', 'error');
        }
    }
}

function previewCleanup() {
    if (!window.app) return;
    
    const products = window.app.allProducts || [];
    const criteria = getCleanupCriteria();
    const productsToDelete = filterProductsForCleanup(products, criteria);
    
    const previewDiv = document.getElementById('cleanupPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (productsToDelete.length === 0) {
        previewContent.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                <h3 class="text-xl font-bold text-green-800 mb-2">Aucun produit à supprimer</h3>
                <p class="text-green-600">Aucun produit ne correspond aux critères sélectionnés.</p>
            </div>
        `;
    } else {
        previewContent.innerHTML = `
            <div class="mb-6">
                <div class="bg-red-100 border border-red-300 rounded-xl p-4 mb-4">
                    <h4 class="font-bold text-red-800 mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        ${productsToDelete.length} produits seront supprimés
                    </h4>
                    <p class="text-red-600">Cette action est irréversible. Vérifiez attentivement la liste ci-dessous.</p>
                </div>
                
                <div class="max-h-96 overflow-y-auto">
                    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${productsToDelete.map(product => `
                                <tr>
                                    <td class="px-4 py-2 font-medium text-gray-900">${product.nom}</td>
                                    <td class="px-4 py-2 text-gray-500">${product.categorie}</td>
                                    <td class="px-4 py-2 text-gray-500">${product.prix} DA</td>
                                    <td class="px-4 py-2 text-gray-500">${product.stock}</td>
                                    <td class="px-4 py-2">
                                        ${product.actif === false ? '<span class="text-red-600">Inactif</span>' : '<span class="text-green-600">Actif</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    previewDiv.classList.remove('hidden');
}

function getCleanupCriteria() {
    return {
        includeInactive: document.getElementById('cleanupInactive')?.checked || false,
        includeOutOfStock: document.getElementById('cleanupOutOfStock')?.checked || false,
        includeLowStock: document.getElementById('cleanupLowStock')?.checked || false,
        includeOldProducts: document.getElementById('cleanupOldProducts')?.checked || false,
        daysBefore: parseInt(document.getElementById('cleanupDaysBefore')?.value) || 90,
        categories: Array.from(document.querySelectorAll('.cleanup-category:checked')).map(cb => cb.value),
        priceMin: parseFloat(document.getElementById('cleanupPriceMin')?.value) || null,
        priceMax: parseFloat(document.getElementById('cleanupPriceMax')?.value) || null
    };
}

function filterProductsForCleanup(products, criteria) {
    return products.filter(product => {
        // Status criteria
        if (criteria.includeInactive && product.actif === false) return true;
        if (criteria.includeOutOfStock && product.stock === 0) return true;
        if (criteria.includeLowStock && product.stock <= 2 && product.stock > 0) return true;
        
        // Time criteria
        if (criteria.includeOldProducts) {
            const productDate = new Date(product.dateAjout);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - criteria.daysBefore);
            if (productDate < cutoffDate) return true;
        }
        
        // Category criteria
        if (criteria.categories.length > 0 && criteria.categories.includes(product.categorie)) {
            return true;
        }
        
        // Price criteria
        if (criteria.priceMin !== null && criteria.priceMax !== null) {
            if (product.prix >= criteria.priceMin && product.prix <= criteria.priceMax) {
                return true;
            }
        } else if (criteria.priceMin !== null && product.prix >= criteria.priceMin) {
            return true;
        } else if (criteria.priceMax !== null && product.prix <= criteria.priceMax) {
            return true;
        }
        
        return false;
    });
}

function executeCleanup() {
    if (!window.app) return;
    
    const products = window.app.allProducts || [];
    const criteria = getCleanupCriteria();
    const productsToDelete = filterProductsForCleanup(products, criteria);
    
    if (productsToDelete.length === 0) {
        window.app.showToast('Aucun produit à supprimer selon les critères sélectionnés', 'info');
        return;
    }
    
    const confirmMessage = `Êtes-vous absolument sûr de vouloir supprimer ${productsToDelete.length} produits ?\n\nCette action est IRRÉVERSIBLE !`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const remainingProducts = products.filter(product => 
            !productsToDelete.some(toDelete => toDelete._id === product._id)
        );
        
        localStorage.setItem('demoProducts', JSON.stringify(remainingProducts));
        
        window.app.allProducts = remainingProducts;
        window.app.refreshProductsCache();
        
        window.app.showToast(`${productsToDelete.length} produits supprimés avec succès !`, 'success');
        
        // Refresh cleanup stats and hide preview
        window.app.loadCleanupStats();
        document.getElementById('cleanupPreview').classList.add('hidden');
        
        // Reset form
        resetCleanupCriteria();
        
    } catch (error) {
        console.error('Cleanup execution error:', error);
        window.app.showToast('Erreur lors du nettoyage des produits', 'error');
    }
}

function resetCleanupCriteria() {
    document.getElementById('cleanupInactive').checked = false;
    document.getElementById('cleanupOutOfStock').checked = false;
    document.getElementById('cleanupLowStock').checked = false;
    document.getElementById('cleanupOldProducts').checked = false;
    document.getElementById('cleanupDaysBefore').value = 90;
    document.getElementById('cleanupPriceMin').value = '';
    document.getElementById('cleanupPriceMax').value = '';
    
    document.querySelectorAll('.cleanup-category').forEach(cb => {
        cb.checked = false;
    });
    
    document.getElementById('cleanupPreview').classList.add('hidden');
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('✅ Enhanced admin system loaded');
