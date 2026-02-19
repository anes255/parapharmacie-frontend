import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('shifa_user') || 'null'),
  token: localStorage.getItem('shifa_token') || null,
  login: (user, token) => {
    localStorage.setItem('shifa_user', JSON.stringify(user));
    localStorage.setItem('shifa_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('shifa_user');
    localStorage.removeItem('shifa_token');
    set({ user: null, token: null });
  },
  updateUser: (user) => {
    localStorage.setItem('shifa_user', JSON.stringify(user));
    set({ user });
  }
}));

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('shifa_cart') || '[]'),
  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.id === product.id);
    let newItems;
    if (existing) {
      newItems = items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newItems = [...items, { ...product, quantity: 1 }];
    }
    localStorage.setItem('shifa_cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  removeItem: (id) => {
    const newItems = get().items.filter(i => i.id !== id);
    localStorage.setItem('shifa_cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) return get().removeItem(id);
    const newItems = get().items.map(i => i.id === id ? { ...i, quantity } : i);
    localStorage.setItem('shifa_cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  clearCart: () => {
    localStorage.removeItem('shifa_cart');
    set({ items: [] });
  },
  getTotal: () => get().items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0)
}));

export const useSettingsStore = create((set) => ({
  settings: {
    primary_color: '#2d6a4f',
    secondary_color: '#40916c',
    accent_color: '#95d5b2',
    bg_color: '#f0fdf4',
    text_color: '#1b4332',
    font_family: 'Poppins',
    hero_title: 'Parapharmacie Shifa',
    hero_subtitle: 'Votre santé, notre priorité'
  },
  setSettings: (settings) => set({ settings })
}));
