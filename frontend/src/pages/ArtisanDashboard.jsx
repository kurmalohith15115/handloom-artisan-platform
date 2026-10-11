import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const ArtisanDashboard = () => {
  const { user, artisanProfile, refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: 5,
    material: '',
    dimensions: '',
    craftOrigin: '',
    imageUrl: '',
  });
  const [productFormError, setProductFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Fulfillment status updater modal
  const [fulfillmentModalOpen, setFulfillmentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('Processing');
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [updatingFulfillment, setUpdatingFulfillment] = useState(false);

  // Craft Story Form State
  const [storyForm, setStoryForm] = useState({
    craftStory: artisanProfile?.craftStory || '',
    craftType: artisanProfile?.craftType || '',
    experienceYears: artisanProfile?.experienceYears || 0,
    village: artisanProfile?.location?.village || '',
    district: artisanProfile?.location?.district || '',
    state: artisanProfile?.location?.state || '',
  });
  const [storyMessage, setStoryMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes, catRes] = await Promise.all([
        api.get('/artisans/stats'),
        api.get('/products/my/artisan-products'),
        api.get('/orders/artisan-orders'),
        api.get('/categories'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories && catRes.categories.length > 0 && !productForm.category) {
          setProductForm((prev) => ({ ...prev, category: catRes.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching artisan dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = artisanProfile?.applicationStatus === 'approved';

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      originalPrice: '',
      stock: 5,
      material: '',
      dimensions: '',
      craftOrigin: `${artisanProfile?.location?.village || ''}, ${artisanProfile?.location?.state || ''}`,
      imageUrl: '',
    });
    setProductFormError('');
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      description: prod.description,
      category: prod.category?._id || prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      stock: prod.stock,
      material: prod.material,
      dimensions: prod.dimensions || '',
      craftOrigin: prod.craftOrigin,
      imageUrl: prod.images?.[0] || '',
    });
    setProductFormError('');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductFormError('');
    setSavingProduct(true);

    try {
      const payload = {
        title: productForm.title,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        material: productForm.material,
        dimensions: productForm.dimensions,
        craftOrigin: productForm.craftOrigin,
        images: [productForm.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setProductModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setProductFormError(err.message || 'Failed to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleOpenFulfillment = (ord) => {
    setSelectedOrder(ord);
    setFulfillmentStatus(ord.orderStatus === 'Confirmed' ? 'Processing' : ord.orderStatus);
    setCarrierInput(ord.carrier || 'India Post Speed Post');
    setTrackingNumberInput(ord.trackingNumber || '');
    setStatusNoteInput('');
    setFulfillmentModalOpen(true);
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    setUpdatingFulfillment(true);
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, {
        status: fulfillmentStatus,
        carrier: carrierInput,
        trackingNumber: trackingNumberInput,
        note: statusNoteInput || `Status set to ${fulfillmentStatus} by artisan studio`,
      });
      setFulfillmentModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingFulfillment(false);
    }
  };

  const handleUpdateStory = async (e) => {
    e.preventDefault();
    setStoryMessage('');
    try {
      await api.put('/artisans/me', {
        craftStory: storyForm.craftStory,
        craftType: storyForm.craftType,
        experienceYears: Number(storyForm.experienceYears),
        location: {
          village: storyForm.village,
          district: storyForm.district,
          state: storyForm.state,
        },
      });
      setStoryMessage('✓ Craft profile and heritage story updated successfully.');
      refreshUser();
      setTimeout(() => setStoryMessage(''), 3000);
    } catch (err) {
      setStoryMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-wide">
        {/* Header with Application Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)', margin: 0 }}>
                Artisan Craft Studio
              </h1>
              <StatusBadge status={artisanProfile?.applicationStatus || 'pending'} />
            </div>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Welcome back, <strong>{user?.name}</strong> • {artisanProfile?.craftType} • {artisanProfile?.location?.village}, {artisanProfile?.location?.state}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleOpenAddProduct}
              disabled={!isApproved}
              className="btn btn-primary"
              title={!isApproved ? 'Application must be approved first' : ''}
            >
              + List New Handloom Product
            </button>
            <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: '#b91c1c' }}>
              Log Out
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {!isApproved && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>⏳</span>
            <div>
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>
                Application Status: Awaiting Administrator Review
              </strong>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                Your artisan application has been submitted to the platform governance board. You can
                refine your craft story and workshop details below. Once an administrator approves your
                credentials, you will be able to list products for sale.
              </p>
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'overview' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'overview' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            📊 Studio Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'products' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'products' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            🧵 My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'orders' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            📦 Incoming Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('story')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'story' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'story' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            🎨 Craft Story & Profile
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* 4 Stat Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Total Earnings
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-terracotta)', margin: '0.5rem 0' }}>
                  ₹{(stats?.totalEarnings || 0).toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '600' }}>
                  100% Direct Payout Model
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Items Sold
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-indigo)', margin: '0.5rem 0' }}>
                  {stats?.itemsSold || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Units shipped to patrons
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Active Listings
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', margin: '0.5rem 0' }}>
                  {products.length}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Handloom pieces in catalogue
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Artisan Rating
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-saffron)', margin: '0.5rem 0' }}>
                  ★ {(artisanProfile?.rating || 5).toFixed(1)}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  From verified purchases
                </span>
              </div>
            </div>

            {/* Recent Orders quick preview */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="heading-serif" style={{ fontSize: '1.3rem', margin: 0 }}>
                  Recent Orders Needing Fulfillment
                </h3>
                <button onClick={() => setActiveTab('orders')} className="btn btn-outline btn-sm">
                  View All Orders →
                </button>
              </div>

              {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord._id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <strong>#{ord.orderNumber}</strong> • {ord.customer?.name}
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {ord.artisanItems?.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <StatusBadge status={ord.orderStatus} />
                        <button
                          onClick={() => handleOpenFulfillment(ord)}
                          className="btn btn-secondary btn-sm"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No orders received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.4rem', margin: 0 }}>
                My Handloom Listings ({products.length})
              </h3>
              <button
                onClick={handleOpenAddProduct}
                disabled={!isApproved}
                className="btn btn-primary btn-sm"
              >
                + Add Product
              </button>
            </div>

            {products.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map((prod) => (
                  <div
                    key={prod._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      backgroundColor: '#ffffff',
                      flexWrap: 'wrap',
                    }}
                  >
                    <img
                      src={
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={prod.title}
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>{prod.title}</h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Category: {prod.category?.name} • Material: {prod.material} • Origin: {prod.craftOrigin}
                      </div>
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-terracotta)' }}>
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        <span>•</span>
                        <span style={{ color: prod.stock > 0 ? '#15803d' : '#b91c1c', fontWeight: '600', fontSize: '0.85rem' }}>
                          Stock: {prod.stock} units
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="btn btn-sm"
                        style={{ color: '#b91c1c', border: '1px solid #fecaca', background: '#fee2e2' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🧵</span>
                <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  No Products Listed Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Add your handloom pieces with photos, dimensions, and materials.
                </p>
                {isApproved ? (
                  <button onClick={handleOpenAddProduct} className="btn btn-primary">
                    + Add Your First Product
                  </button>
                ) : (
                  <p style={{ color: '#b45309', fontWeight: '600' }}>
                    Listing will become enabled immediately upon admin approval.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INCOMING ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
              Incoming Orders & Fulfillment
            </h3>

            {orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((ord) => (
                  <div key={ord._id} className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-light)',
                        paddingBottom: '1rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--color-indigo)' }}>
                          #{ord.orderNumber}
                        </strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Ordered on {new Date(ord.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <StatusBadge status={ord.orderStatus} />
                        <button
                          onClick={() => handleOpenFulfillment(ord)}
                          className="btn btn-primary btn-sm"
                        >
                          📦 Update Fulfillment Status
                        </button>
                      </div>
                    </div>

                    {/* Artisan's items in this order */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Your Items in this Order:
                      </h5>
                      {ord.artisanItems?.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                            fontSize: '0.92rem',
                          }}
                        >
                          <span>
                            <strong>{item.quantity}x</strong> {item.title}
                          </span>
                          <span style={{ fontWeight: '700', color: 'var(--color-terracotta)' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Shipping Snapshot */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <strong>Ship to:</strong> {ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone})<br />
                      {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.postalCode}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <p style={{ color: 'var(--text-muted)' }}>No incoming orders at this time.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CRAFT STORY */}
        {activeTab === 'story' && (
          <div className="card" style={{ maxWidth: '720px', padding: '2rem', backgroundColor: '#ffffff' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
              Artisan Profile & Heritage Story
            </h3>

            {storyMessage && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                {storyMessage}
              </div>
            )}

            <form onSubmit={handleUpdateStory}>
              <div className="form-group">
                <label className="form-label">Craft Tradition</label>
                <input
                  type="text"
                  required
                  value={storyForm.craftType}
                  onChange={(e) => setStoryForm({ ...storyForm, craftType: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={storyForm.experienceYears}
                  onChange={(e) => setStoryForm({ ...storyForm, experienceYears: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input
                    type="text"
                    value={storyForm.village}
                    onChange={(e) => setStoryForm({ ...storyForm, village: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    value={storyForm.district}
                    onChange={(e) => setStoryForm({ ...storyForm, district: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    value={storyForm.state}
                    onChange={(e) => setStoryForm({ ...storyForm, state: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Heritage Craft Story</label>
                <textarea
                  rows={6}
                  required
                  value={storyForm.craftStory}
                  onChange={(e) => setStoryForm({ ...storyForm, craftStory: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Craft Story Updates
              </button>
            </form>
          </div>
        )}

        {/* Product Add/Edit Modal */}
        <Modal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          title={editingProduct ? 'Edit Handloom Product' : 'List New Handloom Product'}
          maxWidth="640px"
        >
          <form onSubmit={handleSaveProduct}>
            {productFormError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                {productFormError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                required
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="form-input"
                placeholder="e.g. Pure Mulberry Silk Pochampally Ikat Saree"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="form-select"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Loom / Craft Origin *</label>
                <input
                  type="text"
                  required
                  value={productForm.craftOrigin}
                  onChange={(e) => setProductForm({ ...productForm, craftOrigin: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Pochampally, Telangana"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 5400"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 6200"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Stock *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Material Composition *</label>
                <input
                  type="text"
                  required
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 100% Pure Silk (Silk Mark)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dimensions</label>
                <input
                  type="text"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 6.25m with blouse piece"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Image URL *</label>
              <input
                type="url"
                required
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                className="form-input"
                placeholder="https://images.unsplash.com/... or image link"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Description & Technique *</label>
              <textarea
                required
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="form-textarea"
                placeholder="Describe the weaving technique, color palette, motifs, and wash care instructions..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setProductModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={savingProduct} className="btn btn-primary">
                {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'List Product'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Order Fulfillment Status Modal */}
        <Modal
          isOpen={fulfillmentModalOpen}
          onClose={() => setFulfillmentModalOpen(false)}
          title={`Update Fulfillment: #${selectedOrder?.orderNumber}`}
        >
          <form onSubmit={handleUpdateFulfillment}>
            <div className="form-group">
              <label className="form-label">Fulfillment Stage *</label>
              <select
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value)}
                className="form-select"
              >
                <option value="Processing">Processing / Crafting on Loom</option>
                <option value="Shipped">Shipped with Courier</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered to Customer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Courier Carrier</label>
              <input
                type="text"
                value={carrierInput}
                onChange={(e) => setCarrierInput(e.target.value)}
                className="form-input"
                placeholder="e.g. India Post Speed Post, BlueDart, DTDC"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Waybill / Tracking Number</label>
              <input
                type="text"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                className="form-input"
                placeholder="e.g. EW123456789IN"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fulfillment Update Note (Optional)</label>
              <textarea
                rows={2}
                value={statusNoteInput}
                onChange={(e) => setStatusNoteInput(e.target.value)}
                className="form-textarea"
                placeholder="e.g. Handcrafted and dispatched from Pochampally village post office"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setFulfillmentModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={updatingFulfillment} className="btn btn-primary">
                {updatingFulfillment ? 'Updating...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
