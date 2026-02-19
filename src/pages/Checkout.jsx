import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiPhone } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import api from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const items = useCartStore(s => s.items);
  const getTotal = useCartStore(s => s.getTotal);
  const clearCart = useCartStore(s => s.clearCart);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: user?.address || '',
    phone: user?.phone || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Votre panier est vide');
    if (!form.address || !form.phone) return toast.error('Veuillez remplir tous les champs');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        total: getTotal(),
        address: form.address,
        phone: form.phone,
        notes: form.notes
      });
      clearCart();
      setSuccess(true);
      toast.success('Commande passée avec succès!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la commande');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ padding: '160px 0', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>
            <FiCheck size={36} />
          </div>
          <h2 style={{ color: 'var(--primary)', marginBottom: 12 }}>Commande Confirmée!</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 32 }}>Votre commande a été enregistrée. Nous vous contacterons bientôt.</p>
          <button onClick={() => navigate('/profile')} className="btn btn-primary">Voir mes Commandes</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 0 60px' }}>
      <div className="container">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: 32 }}>
          Finaliser la Commande
        </motion.h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }} className="checkout-grid">
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: 24, color: 'var(--text)' }}>Informations de Livraison</h3>
            <div className="form-group">
              <label><FiMapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Adresse de livraison *</label>
              <textarea className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Votre adresse complète..." required />
            </div>
            <div className="form-group">
              <label><FiPhone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Numéro de téléphone *</label>
              <input className="form-control" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06XXXXXXXX" required />
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Instructions spéciales..." style={{ minHeight: 80 }} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
              {loading ? 'Traitement...' : 'Confirmer la Commande'}
            </button>
          </motion.form>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-md)', position: 'sticky', top: 100 }}>
            <h3 style={{ marginBottom: 20 }}>Résumé ({items.length} articles)</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.9rem' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} DA</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
              <span>Livraison</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Gratuite</span>
            </div>
            <div style={{ height: 1, background: 'var(--gray-200)', margin: '12px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
              <span>Total</span>
              <span>{getTotal().toLocaleString()} DA</span>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.checkout-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
