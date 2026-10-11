import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export const AllProducts = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.warn('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (sort) queryParams.append('sort', sort);
        if (page) queryParams.append('page', page);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (inStockOnly) queryParams.append('inStock', 'true');
        queryParams.append('limit', '12');

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.success) {
          setProducts(res.products || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sort, page, minPrice, maxPrice, inStockOnly]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--color-indigo)', marginBottom: '0.5rem' }}>
            {selectedCategory ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Handloom Collection'}` : 'All Handloom & Craft Weaves'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Showing {total} authentic pieces directly from certified Indian weavers.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          {/* Categories Pill Scroller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => updateParam('category', '')}
              className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Crafts
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateParam('category', cat.slug)}
                className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              Sort:
            </label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{t('common.loading')}</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid-products">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '3.5rem',
                }}
              >
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam('page', page - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  ← Previous
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', padding: '0 0.75rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', page + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-card)',
              maxWidth: '560px',
              margin: '2rem auto',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🧶</span>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              No Handloom Crafts Found
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              We could not find any handloom items matching your active search or filter criteria.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary">
              Clear Filters & View All Weaves
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
