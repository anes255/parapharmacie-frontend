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

    // Login method - FIXED
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

    // Register method - FIXED
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
                throw new Error('Format de téléphone invalide (numéro algérien requis)');
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

    // Get current user profile
    async getProfile() {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            const response = await apiCall('/auth/profile');
            if (response) {
                this.currentUser = response;
                return response;
            }
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(updateData) {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            const response = await apiCall('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });

            if (response.user) {
                this.currentUser = response.user;
                return response;
            }

            return response;

        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            if (!currentPassword || !newPassword) {
                throw new Error('Mot de passe actuel et nouveau mot de passe requis');
            }

            if (newPassword.length < 6) {
                throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
            }

            const response = await apiCall('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            return response;

        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
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

    // Get user role
    getRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    // Get user info
    getUser() {
        return this.currentUser;
    }

    // Get token
    getToken() {
        return this.token;
    }
}

// CRITICAL FIX: Define global functions IMMEDIATELY, not in DOMContentLoaded
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
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
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        prenom: document.getElementById('registerPrenom')?.value.trim(),
        nom: document.getElementById('registerNom')?.value.trim(),
        email: document.getElementById('registerEmail')?.value.trim(),
        telephone: document.getElementById('registerTelephone')?.value.trim(),
        password: document.getElementById('registerPassword')?.value,
        adresse: document.getElementById('registerAdresse')?.value.trim(),
        wilaya: document.getElementById('registerWilaya')?.value
    };
    
    try {
        const result = await authSystem.register(formData);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                window.app.showPage('home');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    }
}

// Global logout function
function logout() {
    if (authSystem) {
        authSystem.logout();
    }
    
    if (window.app) {
        window.app.showToast('Déconnexion réussie', 'success');
        window.app.showPage('home');
    }
}

// Password validation helper
function validatePassword(password) {
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
}

// Email validation helper
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation helper (Algerian format)
function validatePhone(phone) {
    const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// CRITICAL: Export functions IMMEDIATELY to window
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthenticationSystem();
    window.authSystem = authSystem;
    console.log('✅ Authentication system initialized');
});

console.log('✅ Auth.js loaded successfully - Global functions ready');
