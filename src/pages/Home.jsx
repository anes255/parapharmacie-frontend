import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCartStore, useSettingsStore } from '../store';
import api, { BACKEND_URL } from '../api';
import toast from 'react-hot-toast';
import './Home.css';

const categories = [
  { name: 'Vitalité', label: 'Vitalité & Énergie', icon: '⚡', color: '#f59e0b' },
  { name: 'Sport', label: 'Sport', icon: '🏃', color: '#3b82f6' },
  { name: 'Cheveux', label: 'Cheveux', icon: '💇', color: '#8b5cf6' },
  { name: 'Visage', label: 'Visage', icon: '✨', color: '#ec4899' },
  { name: 'Intime', label: 'Intime', icon: '🌸', color: '#f43f5e' },
  { name: 'Solaire', label: 'Solaire', icon: '☀️', color: '#f97316' },
  { name: 'Soins', label: 'Soins Bébé', icon: '👶', color: '#06b6d4' },
  { name: 'Homme', label: 'Homme', icon: '🧔', color: '#6366f1' },
  { name: 'Dentaire', label: 'Dentaire', icon: '🦷', color: '#10b981' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [promo, setPromo] = useState([]);
  const addItem = useCartStore(s => s.addItem);
  const settings = useSettingsStore(s => s.settings);

  useEffect(() => {
    api.get('/products?featured=true').then(r => setFeatured(r.data.slice(0, 8))).catch(() => {});
    api.get('/products?promo=true').then(r => setPromo(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const handleAdd = (product) => {
    addItem(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <div className="home">
      {/* Floating nature elements */}
      <div className="nature-bg">
        <div className="leaf leaf-1">🍃</div>
        <div className="leaf leaf-2">🌿</div>
        <div className="leaf leaf-3">🍀</div>
        <div className="leaf leaf-4">🌱</div>
        <div className="leaf leaf-5">🍃</div>
        <div className="circle-deco c1"></div>
        <div className="circle-deco c2"></div>
        <div className="circle-deco c3"></div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🌿 Santé & Bien-être Naturel
            </motion.span>
            <h1 className="hero-title">{settings.hero_title || 'Parapharmacie Shifa'}</h1>
            <p className="hero-subtitle">{settings.hero_subtitle || 'Votre santé, notre priorité'}</p>
            <p className="hero-desc">
              Découvrez notre sélection premium de produits de santé, beauté et bien-être. 
              Qualité garantie, livraison rapide partout en Algérie.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg hero-btn">
                Découvrir <FiArrowRight />
              </Link>
              <Link to="/products/Vitalité" className="btn btn-outline btn-lg">
                Vitalité & Énergie
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Produits</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>100%</strong>
                <span>Authentique</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>48h</strong>
                <span>Livraison</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-circle">
              <div className="hero-circle-inner">
                <svg viewBox="0 0 200 200" className="hero-svg">
                  <defs>
                    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" fill="url(#leafGrad)" opacity="0.1"/>
                  <path d="M100 30C100 30 60 70 60 110C60 132 78 150 100 150C122 150 140 132 140 110C140 70 100 30 100 30Z" fill="url(#leafGrad)" opacity="0.4"/>
                  <path d="M100 50C100 50 75 80 75 105C75 119 86 130 100 130C114 130 125 119 125 105C125 80 100 50 100 50Z" fill="var(--primary)" opacity="0.6"/>
                  <path d="M98 60L100 45L102 60L100 140L98 60Z" fill="white" opacity="0.3"/>
                  <circle cx="100" cy="100" r="15" fill="white" opacity="0.15"/>
                  <text x="100" y="108" textAnchor="middle" fill="var(--primary)" fontSize="18" fontWeight="bold" fontFamily="var(--font-display)">شفاء</text>
                </svg>
              </div>
            </div>
            <div className="floating-card fc-1">
              <FiShield size={20} />
              <span>Certifié</span>
            </div>
            <div className="floating-card fc-2">
              <FiHeart size={20} />
              <span>Naturel</span>
            </div>
            <div className="floating-card fc-3">
              <FiStar size={20} />
              <span>Premium</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <span className="section-tag">Nos Catégories</span>
            <h2>Trouvez Ce Dont Vous Avez Besoin</h2>
            <p>Parcourez nos catégories soigneusement organisées</p>
          </motion.div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link to={`/products/${cat.name}`} className="category-card">
                  <div className="cat-icon-wrap" style={{ background: `${cat.color}15` }}>
                    <span className="cat-icon">{cat.icon}</span>
                  </div>
                  <span className="cat-name">{cat.label}</span>
                  <FiArrowRight className="cat-arrow" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: <FiShield />, title: 'Produits Authentiques', desc: 'Tous nos produits sont certifiés et vérifiés' },
              { icon: <FiTruck />, title: 'Livraison Rapide', desc: 'Livraison express partout en Algérie' },
              { icon: <FiStar />, title: 'Qualité Premium', desc: 'Les meilleures marques internationales' },
              { icon: <FiHeart />, title: 'Conseil Expert', desc: 'Des conseils personnalisés pour votre bien-être' },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section products-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <span className="section-tag">⭐ Vedettes</span>
              <h2>Produits en Vedette</h2>
              <p>Notre sélection des meilleurs produits</p>
            </motion.div>
            <div className="products-grid">
              {featured.map((product, i) => (
                <motion.div
                  key={product.id}
                  className="product-card card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <div className="product-img-wrap">
                    {product.image ? (
                      <img src={`${BACKEND_URL}${product.image}`} alt={product.name} />
                    ) : (
                      <div className="product-placeholder">
                        <span>{product.category === 'Visage' ? '✨' : product.category === 'Cheveux' ? '💇' : product.category === 'Sport' ? '🏃' : '🌿'}</span>
                      </div>
                    )}
                    {product.is_promo && <span className="promo-badge">Promo</span>}
                    <button className="quick-add" onClick={() => handleAdd(product)}>
                      <FiShoppingCart size={16} />
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-cat">{product.category}</span>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="product-name">{product.name}</h3>
                    </Link>
                    {product.brand && <span className="product-brand">{product.brand}</span>}
                    <div className="product-bottom">
                      <span className="product-price">{Number(product.price).toLocaleString()} DA</span>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdd(product)}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/products" className="btn btn-outline btn-lg">
                Voir Tous les Produits <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promo Section */}
      {promo.length > 0 && (
        <section className="section promo-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <span className="section-tag">🔥 Promotions</span>
              <h2>Offres Spéciales</h2>
              <p>Profitez de nos meilleures offres</p>
            </motion.div>
            <div className="products-grid">
              {promo.map((product, i) => (
                <motion.div
                  key={product.id}
                  className="product-card card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <div className="product-img-wrap">
                    {product.image ? (
                      <img src={`${BACKEND_URL}${product.image}`} alt={product.name} />
                    ) : (
                      <div className="product-placeholder">
                        <span>🔥</span>
                      </div>
                    )}
                    <span className="promo-badge">Promo</span>
                    <button className="quick-add" onClick={() => handleAdd(product)}>
                      <FiShoppingCart size={16} />
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-cat">{product.category}</span>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="product-name">{product.name}</h3>
                    </Link>
                    <div className="product-bottom">
                      <span className="product-price">{Number(product.price).toLocaleString()} DA</span>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdd(product)}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="cta-content">
              <h2>Besoin de Conseils ?</h2>
              <p>Notre équipe est là pour vous guider vers les meilleurs produits pour votre bien-être.</p>
              <div className="cta-contacts">
                <a href="mailto:parapharmacieshifa@gmail.com" className="cta-link">
                  📧 parapharmacieshifa@gmail.com
                </a>
                <a href="tel:0661201294" className="cta-link">
                  📞 0661 20 12 94
                </a>
              </div>
            </div>
            <div className="cta-deco">
              <div className="cta-circle"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
