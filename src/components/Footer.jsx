import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 40L48 45C96 50 192 60 288 55C384 50 480 30 576 25C672 20 768 30 864 40C960 50 1056 60 1152 55C1248 50 1344 30 1392 20L1440 10V120H0V40Z" fill="var(--primary)"/>
        </svg>
      </div>
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Parapharmacie Shifa</h3>
              <p>Votre destination pour des produits de santé, beauté et bien-être de qualité. Nous offrons une sélection soigneusement choisie pour votre bien-être quotidien.</p>
              <div className="footer-social">
                <span className="social-dot"></span>
                <span className="social-dot"></span>
                <span className="social-dot"></span>
              </div>
            </div>
            <div className="footer-col">
              <h4>Navigation</h4>
              <Link to="/">Accueil</Link>
              <Link to="/products">Tous les Produits</Link>
              <Link to="/products/Visage">Soins Visage</Link>
              <Link to="/products/Cheveux">Soins Cheveux</Link>
              <Link to="/products/Solaire">Protection Solaire</Link>
            </div>
            <div className="footer-col">
              <h4>Catégories</h4>
              <Link to="/products/Vitalité">Vitalité & Énergie</Link>
              <Link to="/products/Sport">Sport</Link>
              <Link to="/products/Intime">Hygiène Intime</Link>
              <Link to="/products/Homme">Soins Homme</Link>
              <Link to="/products/Dentaire">Soins Dentaire</Link>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <a href="mailto:parapharmacieshifa@gmail.com" className="footer-contact">
                <FiMail size={16} />
                parapharmacieshifa@gmail.com
              </a>
              <a href="tel:0661201294" className="footer-contact">
                <FiPhone size={16} />
                0661 20 12 94
              </a>
              <div className="footer-contact">
                <FiMapPin size={16} />
                Tipaza, Algérie
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Parapharmacie Shifa. Tous droits réservés.</p>
            <p className="made-with">Fait avec <FiHeart size={14} className="heart-icon" /> en Algérie</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
