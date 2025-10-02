// Fixed Authentication System for Shifa Parapharmacie

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        if (this.token) {
            await this.validateToken();
        }
    }

    // Validate token on app startup
    async validateToken() {
        try {
            const response = await apiCall('/auth/profile');
            if (response) {
                this.currentUser = response;
                return true;
            }
        } catch (error) {
            console.log('Token validation failed:', error.message);
            this.logout();
        }
        return false;
    }

    // Login method
    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format d\'email invalide');
            }

            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password
                })
            });

            if (response.token && response.user) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Login successful for:', response.user.email);
                
                return {
                    success: true,
                    user: response.user,
                    message: response.message || 'Connexion réussie'
                };
            } else {
                throw new Error('Réponse de connexion invalide');
            }

        } catch (error) {
            console.error('❌ Login error:', error);
            throw new Error(error.message || 'Erreur de connexion');
        }
    }

    // Register method
    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            // Validation
            const required = ['nom', 'prenom', 'email', 'password', 'telephone', 'wilaya'];
            for (let field of required) {
                if (!userData[field] || userData[field].trim() === '') {
                    throw new Error(`Le champ ${field} est requis`);
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Format d\'email invalide');
            }

            // Password validation
            if (userData.password.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }

            // Phone validation (Algerian format)
            const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
            if (!phoneRegex.test(userData.telephone.replace(/\s+/g, ''))) {
                throw new Error('Format de téléphone invalide (0555123456 ou +213555123456)');
            }

            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    nom: userData.nom.trim(),
                    prenom: userData.prenom.trim(),
                    email: userData.email.toLowerCase().trim(),
                    password: userData.password,
                    telephone: userData.telephone.replace(/\s+/g, ''),
                    adresse: userData.adresse ? userData.adresse.trim() : '',
                    ville: userData.ville ? userData.ville.trim() : '',
                    wilaya: userData.wilaya,
                    codePostal: userData.codePostal ? userData.codePostal.trim() : ''
                })
            });

            if (response.token && response.user) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Registration successful for:', response.user.email);
                
                return {
                    success: true,
                    user: response.user,
                    message: response.message || 'Inscription réussie'
                };
            } else {
                throw new Error('Réponse d\'inscription invalide');
            }

        } catch (error) {
            console.error('❌ Registration error:', error);
            throw new Error(error.message || 'Erreur lors de l\'inscription');
        }
    }

    // Logout
    logout() {
        console.log('🚪 Logging out user');
        
        this.token = null;
        this.currentUser = null;
        
        localStorage.removeItem('token');
        
        // Update UI if app is available
        if (window.app) {
            window.app.currentUser = null;
            window.app.updateUserUI();
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.token && this.currentUser);
    }

    // Check if user is admin
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.role === 'admin';
    }

    // Get user info
    getUser() {
        return this.currentUser;
    }
}

// INITIALIZE IMMEDIATELY - Don't wait for DOMContentLoaded
let authSystem = new AuthenticationSystem();
window.authSystem = authSystem;
console.log('✅ Auth system initialized');

// Global authentication functions for forms
window.handleLogin = async function(event) {
    event.preventDefault();
    
    console.log('🔐 handleLogin called');
    
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
        } else {
            alert('Veuillez remplir tous les champs');
        }
        return;
    }
    
    try {
        const result = await authSystem.login(email, password);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                window.app.showPage('home');
            } else {
                alert(result.message);
                window.location.reload();
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (window.app) {
            window.app.showToast(error.message, 'error');
        } else {
            alert(error.message);
        }
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    console.log('📝 handleRegister called');
    
    const formData = {
        prenom: document.getElementById('registerPrenom')?.value?.trim() || '',
        nom: document.getElementById('registerNom')?.value?.trim() || '',
        email: document.getElementById('registerEmail')?.value?.trim() || '',
        telephone: document.getElementById('registerTelephone')?.value?.trim() || '',
        password: document.getElementById('registerPassword')?.value || '',
        adresse: document.getElementById('registerAdresse')?.value?.trim() || '',
        wilaya: document.getElementById('registerWilaya')?.value || ''
    };
    
    try {
        const result = await authSystem.register(formData);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                window.app.showPage('home');
            } else {
                alert(result.message);
                window.location.reload();
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (window.app) {
            window.app.showToast(error.message, 'error');
        } else {
            alert(error.message);
        }
    }
};

// Global logout function
window.logout = function() {
    console.log('🚪 logout called');
    
    if (authSystem) {
        authSystem.logout();
    }
    
    if (window.app) {
        window.app.showToast('Déconnexion réussie', 'success');
        window.app.showPage('home');
    } else {
        alert('Déconnexion réussie');
        window.location.reload();
    }
};

// Helper functions
window.validatePassword = function(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

window.validateEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

window.validatePhone = function(phone) {
    const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

console.log('✅ Auth.js loaded - all functions exported to window');
console.log('✅ window.handleLogin:', typeof window.handleLogin);
console.log('✅ window.handleRegister:', typeof window.handleRegister);
console.log('✅ window.logout:', typeof window.logout);
