import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuthStore } from '../store';
import api from '../api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Bienvenue!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-circle c1"></div>
        <div className="auth-circle c2"></div>
        <div className="auth-leaf l1">🌿</div>
        <div className="auth-leaf l2">🍃</div>
      </div>
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="var(--primary)" opacity="0.1"/><path d="M20 6C20 6 12 14 12 22C12 26.4 15.6 30 20 30C24.4 30 28 26.4 28 22C28 14 20 6 20 6Z" fill="var(--primary)"/></svg>
          </div>
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte Shifa</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiPhone size={14} /> Numéro de téléphone</label>
            <input className="form-control" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06XXXXXXXX" required />
          </div>
          <div className="form-group">
            <label><FiLock size={14} /> Mot de passe</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'Connexion...' : <><FiLogIn /> Se Connecter</>}
          </button>
        </form>
        <p className="auth-footer">
          Pas de compte? <Link to="/register">Créer un compte</Link>
        </p>
      </motion.div>
    </div>
  );
}
