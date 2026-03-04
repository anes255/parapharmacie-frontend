import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../store';
import './Cart.css';

export default function Cart() {
  const items = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const getTotal = useCartStore(s => s.getTotal);
  const clearCart = useCartStore(s => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <motion.div className="empty-cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <FiShoppingBag size={64} style={{ color: 'var(--gray-300)' }} />
            <h2>Votre Panier est Vide</h2>
            <p>Découvrez nos produits et commencez vos achats</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Voir les Produits <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cart-title">
          Mon Panier <span>({items.length} articles)</span>
        </motion.h1>

        <div className="cart-layout">
          <div className="cart-items">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className="cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  layout
                >
                  <div className="cart-item-img">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">🌿</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <span className="cart-item-cat">{item.category}</span>
                    <span className="cart-item-price">{Number(item.price).toLocaleString()} DA</span>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus size={14} /></button>
                  </div>
                  <div className="cart-item-total">
                    {(Number(item.price) * item.quantity).toLocaleString()} DA
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div className="cart-summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3>Résumé</h3>
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{getTotal().toLocaleString()} DA</span>
            </div>
            <div className="summary-row">
              <span>Livraison</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Gratuite</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{getTotal().toLocaleString()} DA</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}>
              Passer la Commande <FiArrowRight />
            </Link>
            <button onClick={clearCart} style={{ width: '100%', marginTop: 12, padding: 12, background: 'none', color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600 }}>
              Vider le panier
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
