import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiPackage } from 'react-icons/fi';
import { useAuthStore, useCartStore } from '../store';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const cartCount = useCartStore(s => s.getCount());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="var(--primary)" opacity="0.1"/>
              <path d="M20 6C20 6 12 14 12 22C12 26.4 15.6 30 20 30C24.4 30 28 26.4 28 22C28 14 20 6 20 6Z" fill="var(--primary)" opacity="0.6"/>
              <path d="M20 10C20 10 15 16 15 21C15 23.8 17.2 26 20 26C22.8 26 25 23.8 25 21C25 16 20 10 20 10Z" fill="var(--primary)"/>
              <path d="M19 15L20 12L21 15L20 28L19 15Z" fill="white" opacity="0.4"/>
              <path d="M17 18C17 18 19 17 20 18C21 17 23 18 23 18" stroke="white" strokeWidth="0.5" opacity="0.3"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Shifa</span>
            <span className="logo-sub">Parapharmacie</span>
          </div>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
          <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Produits</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>
              <FiSettings size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  className="cart-count"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={cartCount}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="user-btn">
                <FiUser size={18} />
                <span className="user-name">{user.username?.split(' ')[0]}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile"><FiUser size={14} /> Mon Profil</Link>
                <Link to="/profile"><FiPackage size={14} /> Mes Commandes</Link>
                {user.role === 'admin' && <Link to="/admin"><FiSettings size={14} /> Administration</Link>}
                <button onClick={handleLogout}><FiLogOut size={14} /> Déconnexion</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-login-btn">Connexion</Link>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Link to="/">Accueil</Link>
            <Link to="/products">Produits</Link>
            {user ? (
              <>
                <Link to="/profile">Mon Profil</Link>
                {user.role === 'admin' && <Link to="/admin">Administration</Link>}
                <button onClick={handleLogout}>Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login">Connexion</Link>
                <Link to="/register">Inscription</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
