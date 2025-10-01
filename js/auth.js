// Complete Authentication System for Shifa Parapharmacie

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

    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }

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

    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            const required = ['nom', 'prenom', 'email', 'password', 'telephone', 'wilaya'];
            for (let field of required) {
                if (!userData[field] || userData[field].trim() === '') {
                    throw new Error(`Le champ ${field} est requis`);
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Format d\'email invalide');
            }

            if (userData.password.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }

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

    logout() {
        console.log('🚪 Logging out user');
        
        this.token = null;
        this.currentUser = null;
        
        localStorage.removeItem('token');
        
        if (window.app) {
            window.app.currentUser = null;
            window.app.updateUserUI();
        }
    }

    isAuthenticated() {
        return !!(this.token && this.currentUser);
    }

    isAdmin() {
        return this.isAuthenticated() && this.currentUser.role === 'admin';
    }

    getRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    getUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }
}

// FIXED: Define global functions BEFORE DOMContentLoaded to avoid timing issues
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
        }
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');
    const submitSpinner = document.getElementById('loginSubmitSpinner');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Connexion...';
        if (submitSpinner) submitSpinner.classList.remove('hidden');
    }
    
    try {
        if (!window.authSystem) {
            console.error('Auth system not initialized');
            if (window.app) {
                window.app.showToast('Système d\'authentification non initialisé', 'error');
            }
            return;
        }
        
        const result = await window.authSystem.login(email, password);
        
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
    } finally {
        // Restore button state
        if (submitBtn) {
            submitBtn.disabled = false;
            if (submitText) submitText.textContent = 'Se connecter';
            if (submitSpinner) submitSpinner.classList.add('hidden');
        }
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const formData = {
        prenom: document.getElementById('registerPrenom').value.trim(),
        nom: document.getElementById('registerNom').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        telephone: document.getElementById('registerTelephone').value.trim(),
        password: document.getElementById('registerPassword').value,
        adresse: document.getElementById('registerAdresse').value.trim(),
        wilaya: document.getElementById('registerWilaya').value
    };
    
    // Show loading state
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const submitSpinner = document.getElementById('registerSubmitSpinner');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Inscription...';
        if (submitSpinner) submitSpinner.classList.remove('hidden');
    }
    
    try {
        if (!window.authSystem) {
            console.error('Auth system not initialized');
            if (window.app) {
                window.app.showToast('Système d\'authentification non initialisé', 'error');
            }
            return;
        }
        
        const result = await window.authSystem.register(formData);
        
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
    } finally {
        // Restore button state
        if (submitBtn) {
            submitBtn.disabled = false;
            if (submitText) submitText.textContent = 'S\'inscrire';
            if (submitSpinner) submitSpinner.classList.add('hidden');
        }
    }
};

window.logout = function() {
    if (window.authSystem) {
        window.authSystem.logout();
    }
    
    if (window.app) {
        window.app.showToast('Déconnexion réussie', 'success');
        window.app.showPage('home');
    }
};

// Helper functions
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^(\+213|0)[5-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthenticationSystem();
    window.authSystem = authSystem;
    console.log('✅ Authentication system initialized');
});

// Export functions for global access
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;

console.log('✅ Complete auth.js loaded successfully');
