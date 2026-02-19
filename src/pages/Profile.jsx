import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiEdit2, FiPackage, FiCalendar, FiSave } from 'react-icons/fi';
import { useAuthStore } from '../store';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-success', delivered: 'badge-primary', cancelled: 'badge-danger' };
const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/profile').then(r => {
      setForm({ username: r.data.username, phone: r.data.phone, address: r.data.address || '' });
    }).catch(() => {});
    api.get('/orders/my').then(r => setOrders(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
    setLoading(false);
  };

  const s = {
    page: { padding: '120px 0 60px' },
    grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, alignItems: 'start' },
    card: { background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)' },
    avatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontFamily: 'var(--font-display)', margin: '0 auto 16px' },
    infoRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.92rem' },
    orderCard: { background: 'white', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 12 },
    orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderItems: { fontSize: '0.88rem', color: 'var(--gray-500)', lineHeight: 1.6 },
  };

  return (
    <div style={s.page}>
      <div className="container">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: 32 }}>
          Mon Profil
        </motion.h1>
        <div style={s.grid} className="profile-grid">
          <motion.div style={s.card} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={s.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            {editing ? (
              <>
                <div className="form-group">
                  <label>Nom</label>
                  <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading}><FiSave /> Sauvegarder</button>
                  <button className="btn btn-outline" onClick={() => setEditing(false)}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: 20, color: 'var(--text)' }}>{user?.username}</h3>
                <div style={s.infoRow}><FiPhone size={16} color="var(--secondary)" /> {user?.phone}</div>
                <div style={s.infoRow}><FiMapPin size={16} color="var(--secondary)" /> {user?.address || 'Non renseignée'}</div>
                <div style={s.infoRow}><FiCalendar size={16} color="var(--secondary)" /> Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}</div>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: 20 }} onClick={() => setEditing(true)}>
                  <FiEdit2 /> Modifier le Profil
                </button>
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPackage /> Mes Commandes ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: 60 }}>
                <span style={{ fontSize: '3rem' }}>📦</span>
                <h3 style={{ marginTop: 12 }}>Aucune commande</h3>
                <p style={{ color: 'var(--gray-400)' }}>Vous n'avez pas encore passé de commande</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} style={s.orderCard}>
                <div style={s.orderTop}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Commande #{order.id}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
                </div>
                <div style={s.orderItems}>
                  {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item, i) => (
                    <div key={i}>{item.name} × {item.quantity} — {(item.price * item.quantity).toLocaleString()} DA</div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>{Number(order.total).toLocaleString()} DA</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.profile-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
