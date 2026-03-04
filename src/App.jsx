import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useSettingsStore } from './store';
import api from './api';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

function ProtectedRoute({ children }) {
  const user = useAuthStore(s => s.user);
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = useAuthStore(s => s.user);
  return user?.role === 'admin' ? children : <Navigate to="/" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  const setSettings = useSettingsStore(s => s.setSettings);

  useEffect(() => {
    // Track visit
    api.post('/admin/visit').catch(() => {});
    // Load settings
    api.get('/admin/settings').then(res => {
      if (res.data) {
        setSettings(res.data);
        const s = res.data;
        document.documentElement.style.setProperty('--primary', s.primary_color || '#2d6a4f');
        document.documentElement.style.setProperty('--secondary', s.secondary_color || '#40916c');
        document.documentElement.style.setProperty('--accent', s.accent_color || '#95d5b2');
        document.documentElement.style.setProperty('--bg', s.bg_color || '#f0fdf4');
        document.documentElement.style.setProperty('--text', s.text_color || '#1b4332');
        if (s.font_family) {
          document.documentElement.style.setProperty('--font-body', s.font_family);
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1b4332', color: '#fff', fontFamily: 'var(--font-body)' } }} />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
