// Complete Cart Management and Demo Order System for Shifa Parapharmacie

// Demo order management for admin panel
function addOrderToDemo(orderData) {
    try {
        console.log('💾 Adding order to demo system:', orderData.numeroCommande);
        
        // Validate order data
        if (!orderData.numeroCommande || !orderData.client || !orderData.articles) {
            throw new Error('Invalid order data');
        }
        
        // Get existing admin orders
        let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        // Add timestamp if missing
        if (!orderData.dateCommande) {
            orderData.dateCommande = new Date().toISOString();
        }
        
        // Ensure proper order structure
        const completeOrder = {
            _id: orderData._id || Date.now().toString(),
            numeroCommande: orderData.numeroCommande,
            client: {
                userId: orderData.client.userId || null,
                prenom: orderData.client.prenom,
                nom: orderData.client.nom,
                email: orderData.client.email,
                telephone: orderData.client.telephone,
                adresse: orderData.client.adresse,
                wilaya: orderData.client.wilaya
            },
            articles: orderData.articles.map(article => ({
                productId: article.productId,
                nom: article.nom,
                prix: parseFloat(article.prix),
                quantite: parseInt(article.quantite),
                image: article.image || ''
            })),
            sousTotal: parseFloat(orderData.sousTotal) || 0,
            fraisLivraison: parseFloat(orderData.fraisLivraison) || 0,
            total: parseFloat(orderData.total) || 0,
            statut: orderData.statut || 'en-attente',
            modePaiement: orderData.modePaiement || 'Paiement à la livraison',
            commentaires: orderData.commentaires || '',
            dateCommande: orderData.dateCommande
        };
        
        // Add to beginning of array (newest first)
        adminOrders.unshift(completeOrder);
        
        // Keep only last 100 orders
        if (adminOrders.length > 100) {
            adminOrders = adminOrders.slice(0, 100);
        }
        
        // Save to localStorage
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        console.log('✅ Order successfully added to demo system');
        return completeOrder;
        
    } catch (error) {
        console.error('❌ Error adding order to demo:', error);
        return null;
    }
}

// Get all demo orders for admin
function getAllDemoOrders() {
    try {
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        console.log(`📦 Retrieved ${adminOrders.length} demo orders`);
        return adminOrders;
    } catch (error) {
        console.error('❌ Error retrieving demo orders:', error);
        return [];
    }
}

// Update demo order status
function updateDemoOrderStatus(orderId, newStatus) {
    try {
        console.log('📝 Updating order status:', orderId, newStatus);
        
        let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const orderIndex = adminOrders.findIndex(order => order._id === orderId || order.numeroCommande === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Order not found');
        }
        
        adminOrders[orderIndex].statut = newStatus;
        
        if (newStatus === 'livrée') {
            adminOrders[orderIndex].dateLivraison = new Date().toISOString();
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        console.log('✅ Order status updated successfully');
        return adminOrders[orderIndex];
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        return null;
    }
}

// Delete demo order
function deleteDemoOrder(orderId) {
    try {
        console.log('🗑️ Deleting demo order:', orderId);
        
        let adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const originalLength = adminOrders.length;
        
        adminOrders = adminOrders.filter(order => order._id !== orderId && order.numeroCommande !== orderId);
        
        if (adminOrders.length === originalLength) {
            throw new Error('Order not found');
        }
        
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        
        console.log('✅ Order deleted successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        return false;
    }
}

// Get demo order statistics
function getDemoOrderStats() {
    try {
        const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        
        const stats = {
            totalOrders: adminOrders.length,
            pendingOrders: adminOrders.filter(o => o.statut === 'en-attente').length,
            completedOrders: adminOrders.filter(o => o.statut === 'livrée').length,
            cancelledOrders: adminOrders.filter(o => o.statut === 'annulée').length,
            monthlyOrders: adminOrders.filter(o => new Date(o.dateCommande) >= startOfMonth).length,
            weeklyOrders: adminOrders.filter(o => new Date(o.dateCommande) >= startOfWeek).length,
            totalRevenue: adminOrders
                .filter(o => ['confirmée', 'préparée', 'expédiée', 'livrée'].includes(o.statut))
                .reduce((sum, o) => sum + (o.total || 0), 0),
            monthlyRevenue: adminOrders
                .filter(o => new Date(o.dateCommande) >= startOfMonth && ['confirmée', 'préparée', 'expédiée', 'livrée'].includes(o.statut))
                .reduce((sum, o) => sum + (o.total || 0), 0),
            ordersByStatus: adminOrders.reduce((acc, order) => {
                acc[order.statut] = (acc[order.statut] || 0) + 1;
                return acc;
            }, {})
        };
        
        console.log('📊 Demo order stats:', stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Error getting demo order stats:', error);
        return {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            monthlyOrders: 0,
            weeklyOrders: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            ordersByStatus: {}
        };
    }
}

// Initialize demo data if needed
function initializeDemoData() {
    try {
        // Check if we already have demo data
        const existingOrders = localStorage.getItem('adminOrders');
        if (!existingOrders || JSON.parse(existingOrders).length === 0) {
            console.log('🔄 Initializing demo order data...');
            
            // Create some sample orders for demo
            const sampleOrders = [
                {
                    _id: Date.now().toString(),
                    numeroCommande: 'CMD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    client: {
                        userId: null,
                        prenom: 'Ahmed',
                        nom: 'Benali',
                        email: 'ahmed.benali@email.com',
                        telephone: '0661234567',
                        adresse: '123 Rue de la Liberté, Alger Centre',
                        wilaya: 'Alger'
                    },
                    articles: [
                        {
                            productId: 'demo1',
                            nom: 'Complément Vitamine D3',
                            prix: 1200,
                            quantite: 2,
                            image: 'https://via.placeholder.com/64x64/10b981/ffffff?text=VD'
                        }
                    ],
                    sousTotal: 2400,
                    fraisLivraison: 250,
                    total: 2650,
                    statut: 'en-attente',
                    modePaiement: 'Paiement à la livraison',
                    commentaires: 'Livraison en matinée si possible',
                    dateCommande: new Date(Date.now() - 86400000).toISOString() // Yesterday
                }
            ];
            
            localStorage.setItem('adminOrders', JSON.stringify(sampleOrders));
            console.log('✅ Demo order data initialized');
        }
    } catch (error) {
        console.error('❌ Error initializing demo data:', error);
    }
}

// Enhanced cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.initializeEventListeners();
    }
    
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }
    
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }
    
    addItem(product, quantity = 1) {
        const existingIndex = this.cart.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            this.cart[existingIndex].quantite += quantity;
        } else {
            this.cart.push({
                ...product,
                quantite: quantity
            });
        }
        
        this.saveCart();
    }
    
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }
    
    updateQuantity(productId, quantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.cart[itemIndex].quantite = quantity;
                this.saveCart();
            }
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
    
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
    }
    
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantite, 0);
    }
    
    updateCartDisplay() {
        // This will be handled by the main app
        if (window.app && typeof window.app.updateCartUI === 'function') {
            window.app.updateCartUI();
        }
    }
    
    initializeEventListeners() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.cart = this.loadCart();
                this.updateCartDisplay();
            }
        });
    }
}

// Initialize cart manager
let cartManager;

// Utility functions for product management
function createProductImage(product) {
    if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:image'))) {
        return product.image;
    }
    
    // Generate placeholder with category color
    const categoryColors = {
        'Vitalité': '10b981',
        'Sport': 'f43f5e', 
        'Visage': 'ec4899',
        'Cheveux': 'f59e0b',
        'Solaire': 'f97316',
        'Intime': 'ef4444',
        'Bébé': '06b6d4',
        'Homme': '3b82f6',
        'Soins': '22c55e',
        'Dentaire': '6366f1'
    };
    
    const color = categoryColors[product.categorie] || '10b981';
    const initials = product.nom.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    
    return `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
}

// Format price display
function formatPrice(price) {
    return `${parseInt(price)} DA`;
}

// Format date display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Clean phone number (Algerian format)
function cleanPhoneNumber(phone) {
    return phone.replace(/\s+/g, '').replace(/^(\+213|213)/, '0');
}

// Validate Algerian phone number
function isValidAlgerianPhone(phone) {
    const cleaned = cleanPhoneNumber(phone);
    return /^0[5-9]\d{8}$/.test(cleaned);
}

// Get shipping cost based on wilaya
function getShippingCost(wilaya, cartTotal) {
    if (cartTotal >= 5000) {
        return 0; // Free shipping
    }
    
    const shippingRates = {
        'Alger': 250,
        'Blida': 250,
        'Boumerdès': 250,
        'Tipaza': 200,
        'Médéa': 300
    };
    
    return shippingRates[wilaya] || 350; // Default rate
}

// Initialize demo data and cart manager on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Initializing cart system...');
    
    // Initialize demo data
    initializeDemoData();
    
    // Initialize cart manager
    cartManager = new CartManager();
    window.cartManager = cartManager;
    
    console.log('✅ Cart system initialized');
});

// Export functions for global access
window.addOrderToDemo = addOrderToDemo;
window.getAllDemoOrders = getAllDemoOrders;
window.updateDemoOrderStatus = updateDemoOrderStatus;
window.deleteDemoOrder = deleteDemoOrder;
window.getDemoOrderStats = getDemoOrderStats;
window.initializeDemoData = initializeDemoData;
window.createProductImage = createProductImage;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.generateUniqueId = generateUniqueId;
window.cleanPhoneNumber = cleanPhoneNumber;
window.isValidAlgerianPhone = isValidAlgerianPhone;
window.getShippingCost = getShippingCost;

console.log('✅ Complete cart.js and demo order system loaded');
