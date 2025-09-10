// FIXED: Enhanced method to get all products from backend first, then localStorage
PharmacieGaherApp.prototype.getAllProducts = async function() {
    let allProducts = [];
    
    try {
        // Try to get products from backend first
        console.log('🌐 Fetching products from backend...');
        const response = await apiCall('/products'); // Use regular products endpoint, not admin
        if (response && response.products) {
            allProducts = response.products;
            console.log('✅ Backend products loaded:', allProducts.length);
            
            // Update localStorage with backend data
            localStorage.setItem('demoProducts', JSON.stringify(allProducts));
        }
    } catch (error) {
        console.log('⚠️ Backend unavailable, using localStorage');
    }
    
    // If no products from backend, use localStorage
    if (allProducts.length === 0) {
        const localProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
        allProducts = localProducts;
        console.log('📁 Local products loaded:', allProducts.length);
    }
    
    return allProducts;
};

// FIXED: Enhanced loadDemoProducts to force refresh from backend
PharmacieGaherApp.prototype.loadDemoProducts = async function(params = {}) {
    // First try to get fresh data from backend
    let allProducts = [];
    
    try {
        const response = await apiCall('/products?limit=100'); // Get more products
        if (response && response.products) {
            allProducts = response.products;
            // Update localStorage with fresh backend data
            localStorage.setItem('demoProducts', JSON.stringify(allProducts));
            console.log('✅ Fresh products loaded from backend:', allProducts.length);
        }
    } catch (error) {
        console.log('⚠️ Backend unavailable, using localStorage cache');
        // Fallback to localStorage
        allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
    }
    
    // Apply filters
    let filteredProducts = allProducts.filter(product => {
        if (params.categorie && product.categorie !== params.categorie) return false;
        if (params.search && !product.nom.toLowerCase().includes(params.search.toLowerCase())) return false;
        if (params.priceMin && product.prix < parseFloat(params.priceMin)) return false;
        if (params.priceMax && product.prix > parseFloat(params.priceMax)) return false;
        if (params.enPromotion && !product.enPromotion) return false;
        if (params.enVedette && !product.enVedette) return false;
        return true;
    });
    
    // Apply sorting
    if (params.sort === 'price_asc') {
        filteredProducts.sort((a, b) => a.prix - b.prix);
    } else if (params.sort === 'price_desc') {
        filteredProducts.sort((a, b) => b.prix - a.prix);
    } else if (params.sort === 'name_asc') {
        filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (params.sort === 'name_desc') {
        filteredProducts.sort((a, b) => b.nom.localeCompare(a.nom));
    }
    
    this.displayProducts(filteredProducts, null, true);
};

// FIXED: Enhanced loadFeaturedProducts method for home page
PharmacieGaherApp.prototype.loadFeaturedProducts = async function() {
    console.log('🌟 Loading featured products...');
    
    try {
        let featuredProducts = [];
        
        // Try backend first
        try {
            const response = await apiCall('/products/featured/all');
            if (response && response.length > 0) {
                featuredProducts = response;
                console.log('✅ Featured products from backend:', featuredProducts.length);
            }
        } catch (error) {
            console.log('⚠️ Backend featured products unavailable');
        }
        
        // Fallback to localStorage
        if (featuredProducts.length === 0) {
            const allProducts = JSON.parse(localStorage.getItem('demoProducts') || '[]');
            featuredProducts = allProducts.filter(p => p.enVedette && p.actif !== false).slice(0, 8);
            console.log('📁 Featured products from localStorage:', featuredProducts.length);
        }
        
        // Update featured products section if it exists
        const featuredContainer = document.getElementById('featuredProducts');
        if (featuredContainer) {
            if (featuredProducts.length === 0) {
                featuredContainer.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <i class="fas fa-star text-6xl text-emerald-200 mb-6"></i>
                        <h3 class="text-2xl font-bold text-emerald-800 mb-4">Aucun produit en vedette</h3>
                        <p class="text-emerald-600">Les produits mis en vedette apparaîtront ici</p>
                    </div>
                `;
            } else {
                featuredContainer.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
            }
        }
        
        return featuredProducts;
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        return [];
    }
};

// FIXED: Add global product refresh function
window.refreshAllProducts = function() {
    console.log('🔄 Refreshing all products across the site...');
    
    // Clear localStorage to force fresh fetch
    localStorage.removeItem('demoProducts');
    
    if (window.app) {
        // Refresh based on current page
        if (window.app.currentPage === 'products') {
            console.log('🔄 Refreshing products page...');
            window.app.runProductsLoad({});
        } else if (window.app.currentPage === 'home') {
            console.log('🔄 Refreshing home page featured products...');
            window.app.loadFeaturedProducts();
        }
    }
};

// FIXED: Add event listener for products updated
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Setting up product update listeners...');
    
    // Listen for products updated events
    document.addEventListener('productsUpdated', function(event) {
        console.log('📢 Products updated event received:', event.detail);
        
        // Small delay to ensure backend sync
        setTimeout(() => {
            if (typeof window.refreshAllProducts === 'function') {
                window.refreshAllProducts();
            }
        }, 1000);
    });
    
    console.log('✅ Product update listeners set up');
});

// Enhanced clearFilters function
function clearFilters() {
    console.log('🧹 Clearing all filters...');
    
    ['categoryFilter', 'priceMin', 'priceMax', 'productSearch'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'newest';
    
    ['promotionFilter', 'featuredFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = false;
    });
    
    if (window.app) {
        // Force refresh from backend
        localStorage.removeItem('demoProducts');
        window.app.runProductsLoad({});
    }
}

// FIXED: Enhanced forceRefreshProducts for global use
function forceRefreshProducts() {
    console.log('🔄 Force refreshing products globally...');
    
    // Clear localStorage cache
    localStorage.removeItem('demoProducts');
    
    // Refresh current view
    if (window.app) {
        if (window.app.currentPage === 'products') {
            window.app.runProductsLoad({});
        } else if (window.app.currentPage === 'home') {
            window.app.loadFeaturedProducts();
        }
    }
    
    // Show success message
    if (window.app && window.app.showToast) {
        window.app.showToast('Produits actualisés depuis le serveur', 'success');
    }
}
