import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiTrash2, FiGrid, FiBox, FiList, FiUsers, FiSettings, FiTruck } from 'react-icons/fi';
import api from '../../api';
import toast from 'react-hot-toast';
import './Admin.css';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-success', delivered: 'badge-primary', cancelled: 'badge-danger' };
const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const load = () => {
    api.get('/orders/admin/all').then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { status }); toast.success('Statut mis à jour'); load(); } catch { toast.error('Erreur'); }
  };
  const deleteOrder = async (id) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try { await api.delete(`/orders/${id}`); toast.success('Commande supprimée'); load(); } catch { toast.error('Erreur'); }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header"><h1>📋 Gestion des Commandes</h1></div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}><FiGrid size={14} /> Dashboard</Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}><FiBox size={14} /> Produits</Link>
          <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}><FiList size={14} /> Commandes</Link>
          <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}><FiUsers size={14} /> Utilisateurs</Link>
          <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''}><FiSettings size={14} /> Paramètres</Link>
        </nav>

        {loading ? <div className="loader"><div className="spinner"></div></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Client</th><th>Téléphone</th><th>Adresse</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                  return (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.username}</td>
                      <td>{o.phone || o.user_phone}</td>
                      <td style={{ maxWidth: 160, fontSize: '0.85rem' }}>{o.address}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {items.map((it, i) => <div key={i}>{it.name} × {it.quantity}</div>)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(o.total).toLocaleString()} DA</td>
                      <td><span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status] || o.status}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="actions">
                          {o.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(o.id, 'confirmed')} style={{ background: 'rgba(40,167,69,0.08)', color: 'var(--success)' }} title="Confirmer"><FiCheck size={14} /></button>
                              <button onClick={() => updateStatus(o.id, 'cancelled')} style={{ background: 'rgba(220,53,69,0.08)', color: 'var(--danger)' }} title="Annuler"><FiX size={14} /></button>
                            </>
                          )}
                          {o.status === 'confirmed' && (
                            <button onClick={() => updateStatus(o.id, 'delivered')} style={{ background: 'rgba(45,106,79,0.08)', color: 'var(--primary)' }} title="Livrée"><FiTruck size={14} /></button>
                          )}
                          <button onClick={() => deleteOrder(o.id)} style={{ background: 'rgba(220,53,69,0.08)', color: 'var(--danger)' }} title="Supprimer"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Aucune commande</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
