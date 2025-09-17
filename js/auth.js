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
                console.log('✅ Token validated, user:', response.email);
                return true;
            }
        } catch (error) {
            console.log('❌ Token validation failed:', error.message);
            this.logout();
        }
        return false;
    }

    // Login method - COMPLETELY FIXED
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

            // Clean inputs
            const cleanEmail = email.toLowerCase().trim();
            const cleanPassword = password.trim();

            console.log('📤 Sending login request...');
            
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: cleanEmail,
                    password: cleanPassword
                })
            });

            console.log('📥 Login response received:', response);

            if (response && response.token && response.user) {
                this.token = response.token;
                this.currentUser = response.user;
                
                localStorage.setItem('token', this.token);
                
                console.log('✅ Login successful for:', response.user.email, 'Role:', response.user.role);
                
                return {
                    success: true,
                    user: response.user,
                    message: response.message || 'Connexion réussie'
                };
            } else {
                console.error('❌ Invalid login response structure:', response);
                throw new Error('Réponse de connexion invalide');
            }

        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Handle specific error messages
            if (error.message.includes('Email ou mot de passe incorrect')) {
                throw new Error('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
            } else if (error.message.includes('401')) {
                throw new Error('Identifiants incorrects. Veuillez réessayer.');
            } else if (error.message.includes('500')) {
                throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
            } else if (error.message.includes('Network')) {
                throw new Error('Problème de connexion. Veuillez vérifier votre connexion internet.');
            }
            
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

            // Clean data
            const cleanData = {
                nom: userData.nom.trim(),
                prenom: userData.prenom.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                telephone: userData.telephone.replace(/\s+/g, ''),
                adresse: userData.adresse ? userData.adresse.trim() : '',
                ville: userData.ville ? userData.ville.trim() : '',
                wilaya: userData.wilaya,
                codePostal: userData.codePostal ? userData.codePostal.trim() : ''
            };

            console.log('📤 Sending registration request...');

            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(cleanData)
            });

            console.log('📥 Registration response received:', response);

            if (response && response.token && response.user) {
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
                console.error('❌ Invalid registration response structure:', response);
                throw new Error('Réponse d\'inscription invalide');
            }

        } catch (error) {
            console.error('❌ Registration error:', error);
            
            // Handle specific error messages
            if (error.message.includes('déjà utilisé') || error.message.includes('already exists')) {
                throw new Error('Un compte avec cet email ou ce téléphone existe déjà.');
            } else if (error.message.includes('400')) {
                throw new Error('Données invalides. Veuillez vérifier vos informations.');
            } else if (error.message.includes('500')) {
                throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
            }
            
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

            if (response && response.user) {
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

    // Logout - Enhanced
    logout() {
        console.log('🚪 Logging out user');
        
        this.token = null;
        this.currentUser = null;
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear any cached data
        localStorage.removeItem('userOrders');
        localStorage.removeItem('userProfile');
        
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

    // Check if user has permission
    hasPermission(permission) {
        if (!this.isAuthenticated()) return false;
        
        if (this.isAdmin()) return true; // Admin has all permissions
        
        // Define user permissions here if needed
        const userPermissions = ['view_products', 'create_orders', 'view_own_orders'];
        return userPermissions.includes(permission);
    }
}

// Global authentication functions for forms - COMPLETELY FIXED
async function handleLogin(event) {
    event.preventDefault();
    
    // Clear any previous error states
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('Login form inputs not found');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showFormError('loginForm', 'Veuillez remplir tous les champs');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...';
    
    try {
        console.log('🔄 Starting login process...');
        const result = await authSystem.login(email, password);
        
        if (result.success) {
            console.log('✅ Login successful in handler');
            
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                
                // Redirect based on user role
                if (result.user.role === 'admin') {
                    window.app.showPage('admin');
                } else {
                    window.app.showPage('home');
                }
            }
            
            // Clear form
            emailInput.value = '';
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('❌ Login error in handler:', error);
        showFormError('loginForm', error.message);
        
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    // Clear any previous error states
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    const formData = {
        prenom: document.getElementById('registerPrenom')?.value.trim() || '',
        nom: document.getElementById('registerNom')?.value.trim() || '',
        email: document.getElementById('registerEmail')?.value.trim() || '',
        telephone: document.getElementById('registerTelephone')?.value.trim() || '',
        password: document.getElementById('registerPassword')?.value || '',
        adresse: document.getElementById('registerAdresse')?.value.trim() || '',
        ville: document.getElementById('registerVille')?.value.trim() || '',
        wilaya: document.getElementById('registerWilaya')?.value || ''
    };
    
    // Basic validation
    const requiredFields = ['prenom', 'nom', 'email', 'telephone', 'password', 'wilaya'];
    for (let field of requiredFields) {
        if (!formData[field]) {
            showFormError('registerForm', `Le champ ${field} est requis`);
            return;
        }
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Inscription...';
    
    try {
        console.log('🔄 Starting registration process...');
        const result = await authSystem.register(formData);
        
        if (result.success) {
            console.log('✅ Registration successful in handler');
            
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                window.app.showPage('home');
            }
            
            // Clear form
            const form = document.getElementById('registerForm');
            if (form) form.reset();
        }
    } catch (error) {
        console.error('❌ Registration error in handler:', error);
        showFormError('registerForm', error.message);
        
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Show form error helper
function showFormError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Remove existing error
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
    
    form.insertBefore(errorDiv, form.firstChild);
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

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Initializing authentication system...');
    authSystem = new AuthenticationSystem();
    window.authSystem = authSystem;
    console.log('✅ Authentication system initialized');
});

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.showFormError = showFormError;

console.log('✅ Fixed Auth.js loaded successfully');
