import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiBox, FiList, FiUsers, FiSettings, FiSave, FiRefreshCw } from 'react-icons/fi';
import api from '../../api';
import toast from 'react-hot-toast';
import './Admin.css';

const presets = {
  nature: { primary_color: '#2d6a4f', secondary_color: '#40916c', accent_color: '#95d5b2', bg_color: '#f0fdf4', text_color: '#1b4332' },
  ocean: { primary_color: '#1e3a5f', secondary_color: '#2e6da4', accent_color: '#87ceeb', bg_color: '#f0f8ff', text_color: '#0a1929' },
  sunset: { primary_color: '#c2410c', secondary_color: '#ea580c', accent_color: '#fed7aa', bg_color: '#fff7ed', text_color: '#431407' },
  lavender: { primary_color: '#6d28d9', secondary_color: '#7c3aed', accent_color: '#c4b5fd', bg_color: '#faf5ff', text_color: '#2e1065' },
  rose: { primary_color: '#be123c', secondary_color: '#e11d48', accent_color: '#fda4af', bg_color: '#fff1f2', text_color: '#4c0519' },
  midnight: { primary_color: '#1e293b', secondary_color: '#334155', accent_color: '#94a3b8', bg_color: '#f8fafc', text_color: '#0f172a' },
  forest: { primary_color: '#14532d', secondary_color: '#166534', accent_color: '#86efac', bg_color: '#f0fdf4', text_color: '#052e16' },
  gold: { primary_color: '#92400e', secondary_color: '#b45309', accent_color: '#fde68a', bg_color: '#fffbeb', text_color: '#451a03' },
  teal: { primary_color: '#115e59', secondary_color: '#0d9488', accent_color: '#99f6e4', bg_color: '#f0fdfa', text_color: '#042f2e' },
  cherry: { primary_color: '#9f1239', secondary_color: '#be123c', accent_color: '#fecdd3', bg_color: '#fff1f2', text_color: '#4c0519' },
};

const fonts = ['Poppins', 'DM Sans', 'Playfair Display', 'Montserrat', 'Lora', 'Raleway', 'Merriweather', 'Nunito', 'Quicksand', 'Josefin Sans', 'Outfit', 'Cabin'];

export default function AdminSettings() {
  const [form, setForm] = useState({
    primary_color: '#2d6a4f', secondary_color: '#40916c', accent_color: '#95d5b2',
    bg_color: '#f0fdf4', text_color: '#1b4332', font_family: 'Poppins',
    hero_title: 'Parapharmacie Shifa', hero_subtitle: 'Votre santé, notre priorité'
  });
  const [saving, setSaving] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.get('/admin/settings').then(r => { if (r.data) setForm(prev => ({ ...prev, ...r.data })); }).catch(() => {});
  }, []);

  const applyPreset = (name) => {
    const p = presets[name];
    setForm(prev => ({ ...prev, ...p }));
    toast.success(`Thème "${name}" appliqué`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', form);
      // Apply to page
      document.documentElement.style.setProperty('--primary', form.primary_color);
      document.documentElement.style.setProperty('--secondary', form.secondary_color);
      document.documentElement.style.setProperty('--accent', form.accent_color);
      document.documentElement.style.setProperty('--bg', form.bg_color);
      document.documentElement.style.setProperty('--text', form.text_color);
      document.documentElement.style.setProperty('--font-body', form.font_family);
      toast.success('Paramètres sauvegardés!');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const colorField = (label, key) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <input type="color" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{form[key]}</div>
      </div>
      <input className="form-control" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: 120, padding: '8px 12px', fontSize: '0.85rem' }} />
    </div>
  );

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>⚙️ Paramètres du Site</h1>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <FiSave /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}><FiGrid size={14} /> Dashboard</Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}><FiBox size={14} /> Produits</Link>
          <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}><FiList size={14} /> Commandes</Link>
          <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}><FiUsers size={14} /> Utilisateurs</Link>
          <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''}><FiSettings size={14} /> Paramètres</Link>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="settings-grid">
          {/* Colors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>🎨 Couleurs</h3>
            {colorField('Couleur Principale', 'primary_color')}
            {colorField('Couleur Secondaire', 'secondary_color')}
            {colorField('Couleur Accent', 'accent_color')}
            {colorField('Couleur de Fond', 'bg_color')}
            {colorField('Couleur du Texte', 'text_color')}
          </motion.div>

          <div>
            {/* Theme Presets */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🎭 Thèmes Prédéfinis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {Object.entries(presets).map(([name, p]) => (
                  <button key={name} onClick={() => applyPreset(name)} style={{
                    padding: '12px 8px', borderRadius: 'var(--radius)', border: '2px solid var(--gray-200)',
                    background: 'white', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = p.primary_color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 6 }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.primary_color }}></span>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.secondary_color }}></span>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.accent_color }}></span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🔤 Typographie</h3>
              <div className="form-group">
                <label>Police du site</label>
                <select className="form-control" value={form.font_family} onChange={e => setForm({ ...form, font_family: e.target.value })}>
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontFamily: form.font_family }}>
                <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>Aperçu de la police</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Parapharmacie Shifa — Votre santé, notre priorité</p>
              </div>
            </motion.div>

            {/* Hero Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>📝 Contenu Hero</h3>
              <div className="form-group">
                <label>Titre principal</label>
                <input className="form-control" value={form.hero_title} onChange={e => setForm({ ...form, hero_title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Sous-titre</label>
                <input className="form-control" value={form.hero_subtitle} onChange={e => setForm({ ...form, hero_subtitle: e.target.value })} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Live Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{
          marginTop: 32, background: form.bg_color, borderRadius: 'var(--radius-xl)', padding: 40,
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-200)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: 24, color: form.text_color, fontFamily: form.font_family }}>👁️ Aperçu en Direct</h3>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 28px', background: form.primary_color, color: 'white', borderRadius: 12, fontWeight: 600, fontFamily: form.font_family }}>Bouton Principal</div>
            <div style={{ padding: '12px 28px', background: form.secondary_color, color: 'white', borderRadius: 12, fontWeight: 600, fontFamily: form.font_family }}>Bouton Secondaire</div>
            <div style={{ padding: '12px 28px', background: form.accent_color, color: form.primary_color, borderRadius: 12, fontWeight: 600, fontFamily: form.font_family }}>Accent</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: form.font_family }}>
            <h2 style={{ color: form.primary_color, fontSize: '1.8rem' }}>{form.hero_title}</h2>
            <p style={{ color: form.secondary_color, fontStyle: 'italic' }}>{form.hero_subtitle}</p>
          </div>
        </motion.div>
      </div>
      <style>{`@media(max-width:768px){.settings-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
