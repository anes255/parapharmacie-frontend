import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiEye, FiClock, FiGrid, FiBox, FiList, FiSettings } from 'react-icons/fi';
import api from '../../api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader" style={{ minHeight: '60vh', paddingTop: 120 }}><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>🌿 Tableau de Bord</h1>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}><FiGrid size={14} /> Dashboard</Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}><FiBox size={14} /> Produits</Link>
          <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}><FiList size={14} /> Commandes</Link>
          <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}><FiUsers size={14} /> Utilisateurs</Link>
          <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''}><FiSettings size={14} /> Paramètres</Link>
        </nav>

        <div className="stat-grid">
          {[
            { icon: <FiEye />, label: 'Visites', value: stats?.totalVisits || 0 },
            { icon: <FiUsers />, label: 'Utilisateurs', value: stats?.totalUsers || 0 },
            { icon: <FiShoppingBag />, label: 'Commandes', value: stats?.totalOrders || 0 },
            { icon: <FiClock />, label: 'En Attente', value: stats?.pendingOrders || 0 },
            { icon: <FiPackage />, label: 'Produits', value: stats?.totalProducts || 0 },
            { icon: <FiDollarSign />, label: 'Revenus', value: `${(stats?.totalRevenue || 0).toLocaleString()} DA` },
          ].map((s, i) => (
            <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <h4>{s.label}</h4>
              <div className="stat-val">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="dash-grid">
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text)' }}>Commandes Récentes</h3>
            {stats?.recentOrders?.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Aucune commande</p>
            ) : stats?.recentOrders?.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.9rem' }}>
                <div>
                  <strong>#{o.id}</strong> — {o.username}
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--gray-400)' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(o.total).toLocaleString()} DA</span>
                  <span className={`badge ${o.status === 'pending' ? 'badge-warning' : o.status === 'confirmed' ? 'badge-success' : 'badge-primary'}`} style={{ display: 'block', marginTop: 4 }}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text)' }}>Produits Vedettes</h3>
            {stats?.topProducts?.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Aucun produit vedette</p>
            ) : stats?.topProducts?.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.9rem' }}>
                <div>
                  <strong>{p.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--gray-400)' }}>{p.category} — Stock: {p.stock}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(p.price).toLocaleString()} DA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.dash-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
