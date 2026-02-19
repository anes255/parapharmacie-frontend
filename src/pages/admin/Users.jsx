import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiGrid, FiBox, FiList, FiUsers, FiSettings } from 'react-icons/fi';
import api from '../../api';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const load = () => {
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('Utilisateur supprimé'); load(); } catch { toast.error('Erreur'); }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header"><h1>👥 Gestion des Utilisateurs</h1></div>
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
                <tr><th>ID</th><th>Nom</th><th>Téléphone</th><th>Adresse</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.phone}</td>
                    <td style={{ maxWidth: 200, fontSize: '0.85rem' }}>{u.address || '—'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <div className="actions">
                          <button onClick={() => deleteUser(u.id)} style={{ background: 'rgba(220,53,69,0.08)', color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Aucun utilisateur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
