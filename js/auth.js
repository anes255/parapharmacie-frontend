// Fixed Authentication System for Shifa Parapharmacie

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.isDemo = true; // Enable demo mode
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
            // Don't logout immediately in demo mode
            if (!this.isDemo) {
                this.logout();
            }
        }
        return false;
    }

    // Demo users for testing
    getDemoUsers() {
        return [
            {
                id: 'demo-admin-001',
                email: 'pharmaciegaher@gmail.com',
                password: 'admin123',
                nom: 'Admin',
                prenom: 'Pharmacie',
                role: 'admin',
                telephone: '+213555123456',
                adresse: 'Tipaza, Algérie',
                wilaya: 'Tipaza',
                dateInscription: new Date().toISOString()
            },
            {
                id: 'demo-user-001',
                email: 'client@example.com',
                password: 'client123',
                nom: 'Dupont',
                prenom: 'Jean',
                role: 'client',
                telephone: '+213555654321',
                adresse: 'Alger, Algérie',
                wilaya: 'Alger',
                dateInscription: new Date().toISOString()
            }
        ];
    }

    // Try demo login if API fails
    async tryDemoLogin(email, password) {
        console.log('🎭 Attempting demo login...');
        const demoUsers = this.getDemoUsers();
        
        const user = demoUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // Generate a demo token
            const demoToken = `demo_${user.id}_${Date.now()}`;
            
            this.token = demoToken;
            this.currentUser = { ...user };
            delete this.currentUser.password; // Remove password from current user
            
            localStorage.setItem('token', this.token);
            
            console.log('✅ Demo login successful for:', user.email);
            return {
                success: true,
                user: this.currentUser,
                token: this.token,
                message: 'Connexion réussie (mode démo)'
            };
        } else {
            throw new Error('Email ou mot de passe incorrect');
        }
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

            console.log('📤 Sending login request...');
            
            try {
                // Try API login first
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
                    
                    console.log('✅ API login successful for:', response.user.email);
                    
                    return {
                        success: true,
                        user: response.user,
                        token: response.token,
                        message: response.message || 'Connexion réussie'
                    };
                }
            } catch (apiError) {
                console.log('❌ API login failed:', apiError.message);
                
                // If API fails, try demo login
                if (this.isDemo) {
                    return await this.tryDemoLogin(email, password);
                } else {
                    throw apiError;
                }
            }

        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
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

            try {
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
                        token: response.token,
                        message: response.message || 'Inscription réussie'
                    };
                }
            } catch (apiError) {
                console.log('❌ API registration failed:', apiError.message);
                
                if (this.isDemo) {
                    // In demo mode, create a demo account
                    const newUser = {
                        id: `demo-user-${Date.now()}`,
                        nom: userData.nom.trim(),
                        prenom: userData.prenom.trim(),
                        email: userData.email.toLowerCase().trim(),
                        role: 'client',
                        telephone: userData.telephone.replace(/\s+/g, ''),
                        adresse: userData.adresse || '',
                        ville: userData.ville || '',
                        wilaya: userData.wilaya,
                        codePostal: userData.codePostal || '',
                        dateInscription: new Date().toISOString()
                    };
                    
                    const demoToken = `demo_${newUser.id}_${Date.now()}`;
                    
                    this.token = demoToken;
                    this.currentUser = newUser;
                    
                    localStorage.setItem('token', this.token);
                    
                    console.log('✅ Demo registration successful for:', newUser.email);
                    
                    return {
                        success: true,
                        user: newUser,
                        token: demoToken,
                        message: 'Inscription réussie (mode démo)'
                    };
                } else {
                    throw apiError;
                }
            }

        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    // Get current user profile
    async getProfile() {
        try {
            if (!this.token) {
                throw new Error('Non connecté');
            }

            // If demo mode and token starts with demo_, return current user
            if (this.isDemo && this.token.startsWith('demo_') && this.currentUser) {
                return this.currentUser;
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

            // If demo mode, update local user
            if (this.isDemo && this.token.startsWith('demo_') && this.currentUser) {
                Object.assign(this.currentUser, updateData);
                return {
                    user: this.currentUser,
                    message: 'Profil mis à jour (mode démo)'
                };
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

            // If demo mode, just return success
            if (this.isDemo && this.token.startsWith('demo_')) {
                return { message: 'Mot de passe modifié avec succès (mode démo)' };
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

// Global authentication functions for forms
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        if (window.app) {
            window.app.showToast('Veuillez remplir tous les champs', 'error');
        }
        return;
    }
    
    try {
        console.log('🔑 Starting login process...');
        const result = await authSystem.login(email, password);
        
        if (result.success) {
            if (window.app) {
                window.app.currentUser = result.user;
                window.app.updateUserUI();
                window.app.showToast(result.message, 'success');
                window.app.showPage('home');
            }
            console.log('✅ Login completed successfully');
        }
    } catch (error) {
        console.error('❌ Login error in handler:', error);
        if (window.app) {
            window.app.showToast(error.message, 'error');
        }
    }
}

async function handleRegister(event) {
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
    authSystem = new AuthenticationSystem();
    window.authSystem = authSystem;
    console.log('✅ Authentication system initialized with demo mode');
});

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;

console.log('✅ Fixed Auth.js loaded with demo mode support');
