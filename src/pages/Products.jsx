import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiFilter } from 'react-icons/fi';
import { useCartStore } from '../store';
import api from '../api';
import toast from 'react-hot-toast';
import './Products.css';

const allCategories = ['Vitalité', 'Sport', 'Visage', 'Cheveux', 'Solaire', 'Intime', 'Soins', 'Homme', 'Dentaire'];

export default function Products() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(category || '');
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveCategory(category || '');
  }, [category]);

  useEffect(() => {
    setLoading(true);
    let url = '/products?';
    if (activeCategory) url += `category=${activeCategory}&`;
    if (search) url += `search=${search}&`;
    api.get(url).then(r => { setProducts(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [activeCategory, search]);

  const handleAdd = (product) => {
    addItem(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {activeCategory ? `${activeCategory}` : 'Tous les Produits'}
          </motion.h1>
          <div className="search-bar">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-bar">
          <button className={`filter-chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory('')}>
            Tous
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        ) : (
          <motion.div className="products-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="product-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="product-img-wrap">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="product-placeholder"><span>🌿</span></div>
                  )}
                  {product.is_promo && <span className="promo-badge">Promo</span>}
                  <button className="quick-add" onClick={() => handleAdd(product)}>
                    <FiShoppingCart size={16} />
                  </button>
                </div>
                <div className="product-info">
                  <span className="product-cat">{product.category}</span>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
                  {product.brand && <span className="product-brand">{product.brand}</span>}
                  <div className="product-bottom">
                    <span className="product-price">{Number(product.price).toLocaleString()} DA</span>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(product)}>
                      Ajouter
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
