import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiBox, FiList, FiUsers, FiSettings, FiImage } from 'react-icons/fi';
import api from '../../api';
import toast from 'react-hot-toast';
import './Admin.css';

const cats = ['Vitalité', 'Sport', 'Visage', 'Cheveux', 'Solaire', 'Intime', 'Soins', 'Homme', 'Dentaire'];

const emptyProduct = { name: '', category: '', brand: '', price: '', stock: '', description: '', is_promo: false, is_featured: false, is_active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyProduct });
  const [editId, setEditId] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const location = useLocation();

  const load = () => {
    api.get('/products/admin/all').then(r => { setProducts(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...emptyProduct }); setEditId(null); setImage(null); setModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, category: p.category, brand: p.brand || '', price: p.price, stock: p.stock, description: p.description || '', is_promo: p.is_promo, is_featured: p.is_featured, is_active: p.is_active }); setEditId(p.id); setImage(null); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.stock) return toast.error('Remplissez les champs obligatoires');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      if (editId) {
        await api.put(`/products/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produit mis à jour');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produit créé');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Produit supprimé'); load(); } catch { toast.error('Erreur'); }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>📦 Gestion des Produits</h1>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Ajouter un Produit</button>
        </div>
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
                <tr>
                  <th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--gray-50)' }}>
                        {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🌿</div>}
                      </div>
                    </td>
                    <td><strong>{p.name}</strong>{p.brand && <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--gray-400)' }}>{p.brand}</span>}</td>
                    <td><span className="badge badge-primary">{p.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{Number(p.price).toLocaleString()} DA</td>
                    <td>{p.stock}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.is_active && <span className="badge badge-success">Actif</span>}
                        {p.is_promo && <span className="badge badge-danger">Promo</span>}
                        {p.is_featured && <span className="badge badge-warning">Vedette</span>}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => openEdit(p)} style={{ background: 'rgba(45,106,79,0.08)', color: 'var(--primary)' }}><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(220,53,69,0.08)', color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Aucun produit</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <AnimatePresence>
          {modal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
              <motion.div className="modal-card" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()}>
                <h2>{editId ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '2px dashed var(--gray-200)' }}>
                    <FiImage size={24} color="var(--gray-400)" />
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--primary)' }}>
                        {image ? image.name : 'Choisir une image'}
                        <input type="file" accept="image/jpeg,image/png" onChange={e => setImage(e.target.files[0])} style={{ display: 'none' }} />
                      </label>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>JPG, PNG (Max 2MB)</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nom du produit *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Catégorie *</label>
                      <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                        <option value="">Sélectionner...</option>
                        {cats.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Marque</label>
                      <input className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Prix (DA) *</label>
                      <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Stock *</label>
                      <input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, display: 'block' }}>Options</label>
                    {[
                      { key: 'is_promo', label: 'En promotion' },
                      { key: 'is_featured', label: 'En vedette' },
                      { key: 'is_active', label: 'Actif' },
                    ].map(opt => (
                      <div className="toggle-row" key={opt.key}>
                        <div className={`toggle-switch ${form[opt.key] ? 'active' : ''}`} onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}></div>
                        <span style={{ fontSize: '0.9rem' }}>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" type="button" onClick={() => setModal(false)}>Annuler</button>
                    <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                      {saving ? 'Enregistrement...' : editId ? 'Modifier le produit' : 'Ajouter le produit'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
