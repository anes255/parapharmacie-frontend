import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useCartStore } from '../store';
import api from '../api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/products/${id}`).then(r => { setProduct(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${qty}x ${product.name} ajouté au panier`);
  };

  if (loading) return <div className="loader" style={{ minHeight: '60vh', paddingTop: 120 }}><div className="spinner"></div></div>;
  if (!product) return <div style={{ padding: '160px 0', textAlign: 'center' }}><h2>Produit non trouvé</h2></div>;

  const inStock = product.stock > 0;

  return (
    <div style={{ padding: '120px 0 60px' }}>
      <div className="container">
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, color: 'var(--gray-400)', fontWeight: 500, fontSize: '0.9rem' }}>
          <FiArrowLeft /> Retour aux produits
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="product-detail-grid">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-50)', aspectRatio: '1' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🌿</div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-primary">{product.category}</span>
              {product.is_promo && <span className="badge badge-danger">Promotion</span>}
              {product.is_featured && <span className="badge badge-warning">Vedette</span>}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--primary)', marginBottom: 8 }}>{product.name}</h1>
            {product.brand && <p style={{ color: 'var(--gray-400)', fontSize: '1rem', marginBottom: 20 }}>{product.brand}</p>}
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 24 }}>{Number(product.price).toLocaleString()} DA</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.9rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: inStock ? 'var(--success)' : 'var(--danger)' }}></span>
              <span style={{ color: inStock ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {inStock ? `En stock (${product.stock})` : 'Rupture de stock'}
              </span>
            </div>
            <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: 32, fontSize: '0.95rem' }}>{product.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', color: 'var(--text)', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }} onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                <span style={{ width: 50, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
                <button style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', color: 'var(--text)', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }} onClick={() => setQty(qty + 1)}><FiPlus /></button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAdd} disabled={!inStock} style={{ flex: 1 }}>
                <FiShoppingCart /> Ajouter au Panier
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.product-detail-grid{grid-template-columns:1fr !important;gap:24px !important;}}`}</style>
    </div>
  );
}
