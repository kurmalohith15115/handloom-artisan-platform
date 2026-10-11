import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCraftType, setNewCatCraftType] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        appsRes,
        usersRes,
        prodsRes,
        ordersRes,
        catsRes,
        auditRes,
      ] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/artisan-applications'),
        api.get('/admin/users'),
        api.get('/products?limit=50'),
        api.get('/orders/all-orders?limit=50'),
        api.get('/categories'),
        api.get('/admin/audit-logs'),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (appsRes.success) setApplications(appsRes.applications || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (prodsRes.success) setProductsList(prodsRes.products || []);
      if (ordersRes.success) setOrdersList(ordersRes.orders || []);
      if (catsRes.success) setCategoriesList(catsRes.categories || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtisanStatus = async (artisanId, status) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = window.prompt('Please enter the reason for rejecting this artisan application:') || 'Incomplete craft heritage verification';
    }

    try {
      const res = await api.put(`/admin/artisan-applications/${artisanId}/status`, {
        status,
        rejectionReason,
      });
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleProductApproval = async (productId, currentStatus) => {
    try {
      await api.put(`/admin/products/${productId}/moderate`, {
        isApprovedByAdmin: !currentStatus,
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleProductFeatured = async (productId, currentFeatured) => {
    try {
      await api.put(`/admin/products/${productId}/moderate`, {
        featured: !currentFeatured,
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const res = await api.post('/categories', {
        name: newCatName,
        craftType: newCatCraftType,
        description: newCatDesc,
        image: newCatImage,
      });
      if (res.success) {
        setCategoryModalOpen(false);
        setNewCatName('');
        setNewCatCraftType('');
        setNewCatDesc('');
        setNewCatImage('');
        fetchDashboardData();
      }
    } catch (err) {
      alert(`Failed to create category: ${err.message}`);
    } finally {
      setSavingCategory(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-wide">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
              <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)', margin: 0 }}>
                Platform Administration
              </h1>
              <span className="badge badge-indigo">Super Administrator</span>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
              🔄 Refresh Data
            </button>
            <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: '#b91c1c' }}>
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'overview', label: '📊 Metrics Overview' },
            { id: 'applications', label: `🎨 Artisan Applications (${applications.filter(a => a.applicationStatus === 'pending').length} Pending)` },
            { id: 'users', label: `👥 User Accounts (${usersList.length})` },
            { id: 'products', label: `🧵 Products (${productsList.length})` },
            { id: 'orders', label: `📦 Orders Oversight (${ordersList.length})` },
            { id: 'categories', label: `🏷️ Craft Categories (${categoriesList.length})` },
            { id: 'audit', label: `📋 Audit Logs (${auditLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.15rem',
                border: 'none',
                background: 'none',
                fontSize: '0.92rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: activeTab === tab.id ? 'var(--color-indigo)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--color-indigo)' : 'none',
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Metrics Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Platform Revenue
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-terracotta)', margin: '0.4rem 0' }}>
                  ₹{(metrics?.financials?.totalSalesRevenue || 0).toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '600' }}>
                  100% Verified Paid Orders
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Artisan Partners
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-indigo)', margin: '0.4rem 0' }}>
                  {metrics?.artisans?.approved || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '600' }}>
                  {metrics?.artisans?.pending || 0} Pending Approvals
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Total Customers
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', margin: '0.4rem 0' }}>
                  {metrics?.users?.customers || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Registered patron accounts
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Total Orders
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-indigo)', margin: '0.4rem 0' }}>
                  {metrics?.orders?.total || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '600' }}>
                  {metrics?.orders?.paid || 0} Paid & Confirmed
                </span>
              </div>
            </div>

            {/* Quick Action: Pending Artisan Applications alert */}
            {applications.filter((a) => a.applicationStatus === 'pending').length > 0 && (
              <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="heading-serif" style={{ fontSize: '1.25rem', color: '#92400e', margin: 0 }}>
                    ⚠️ Pending Artisan Applications Requiring Review
                  </h3>
                  <button onClick={() => setActiveTab('applications')} className="btn btn-outline btn-sm">
                    Review Applications →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {applications
                    .filter((a) => a.applicationStatus === 'pending')
                    .slice(0, 3)
                    .map((app) => (
                      <div
                        key={app._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#fef3c7',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div>
                          <strong>{app.user?.name}</strong> • {app.craftType} ({app.location?.village}, {app.location?.state})
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateArtisanStatus(app._id, 'approved')}
                            className="btn btn-primary btn-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleUpdateArtisanStatus(app._id, 'rejected')}
                            className="btn btn-sm"
                            style={{ color: '#b91c1c', border: '1px solid #fecaca', background: '#fee2e2' }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARTISAN APPLICATIONS */}
        {activeTab === 'applications' && (
          <div>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Artisan Partner Verification & Governance
            </h3>

            {applications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {applications.map((app) => (
                  <div key={app._id} className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-light)',
                        paddingBottom: '1rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{app.user?.name}</h4>
                          <StatusBadge status={app.applicationStatus} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Email: {app.user?.email} • Phone: {app.user?.phone || 'N/A'} • Submitted: {new Date(app.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {app.applicationStatus !== 'approved' && (
                          <button
                            onClick={() => handleUpdateArtisanStatus(app._id, 'approved')}
                            className="btn btn-primary btn-sm"
                          >
                            ✓ Approve Artisan
                          </button>
                        )}
                        {app.applicationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateArtisanStatus(app._id, 'rejected')}
                            className="btn btn-sm"
                            style={{ color: '#b91c1c', border: '1px solid #fecaca', background: '#fee2e2' }}
                          >
                            Reject
                          </button>
                        )}
                        {app.applicationStatus === 'approved' && (
                          <button
                            onClick={() => handleUpdateArtisanStatus(app._id, 'suspended')}
                            className="btn btn-sm btn-secondary"
                            style={{ color: '#b91c1c' }}
                          >
                            Suspend Studio
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Craft Tradition</span>
                        <strong>{app.craftType}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Location</span>
                        <strong>{app.location?.village}, {app.location?.district}, {app.location?.state}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Experience</span>
                        <strong>{app.experienceYears} Years</strong>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-indigo)' }}>Craft Story & Background:</strong>
                      "{app.craftStory}"
                    </div>

                    {app.rejectionReason && (
                      <div style={{ marginTop: '0.75rem', color: '#b91c1c', fontSize: '0.85rem' }}>
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No artisan applications on record.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              All Registered Accounts ({usersList.length})
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Joined</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor:
                            u.role === 'admin' ? '#fee2e2' : u.role === 'artisan' ? '#fef3c7' : '#dbeafe',
                          color:
                            u.role === 'admin' ? '#991b1b' : u.role === 'artisan' ? '#92400e' : '#1e40af',
                          textTransform: 'capitalize',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: u.isActive ? '#15803d' : '#b91c1c', fontWeight: '600' }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserActive(u._id)}
                          className="btn btn-sm btn-secondary"
                          style={{ color: u.isActive ? '#b91c1c' : '#15803d', fontSize: '0.75rem' }}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: PRODUCTS MODERATION */}
        {activeTab === 'products' && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Products Catalogue Oversight ({productsList.length})
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Title</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem' }}>Featured</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((prod) => (
                  <tr key={prod._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{prod.title}</td>
                    <td style={{ padding: '0.75rem' }}>{prod.category?.name}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>₹{prod.price.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem' }}>{prod.stock}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleToggleProductFeatured(prod._id, prod.featured)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                      >
                        {prod.featured ? '⭐ Featured' : '☆ Standard'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: prod.isApprovedByAdmin ? '#15803d' : '#b91c1c', fontWeight: '600' }}>
                        {prod.isApprovedByAdmin ? 'Approved' : 'Unpublished'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleProductApproval(prod._id, prod.isApprovedByAdmin)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {prod.isApprovedByAdmin ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: ORDERS OVERSIGHT */}
        {activeTab === 'orders' && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Platform Order History ({ordersList.length})
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Order Number</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem' }}>Fulfillment</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--color-indigo)' }}>
                      #{ord.orderNumber}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {ord.customer?.name} ({ord.shippingAddress?.phone})
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: ord.paymentStatus === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: CRAFT CATEGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.4rem', margin: 0 }}>
                Craft Taxonomy & Categories ({categoriesList.length})
              </h3>
              <button onClick={() => setCategoryModalOpen(true)} className="btn btn-primary btn-sm">
                + Add Craft Category
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {categoriesList.map((cat) => (
                <div key={cat._id} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
                  />
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{cat.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-terracotta)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    {cat.craftType || 'Handloom Tradition'}
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Administrative Audit Trail ({auditLogs.length})
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Immutable record of security, role changes, and artisan moderation operations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--color-indigo)' }}>{log.action}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      by {log.actorEmail} ({log.actorRole})
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        <Modal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          title="Create Craft Category"
        >
          <form onSubmit={handleCreateCategory}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="form-input"
                placeholder="e.g. Dharmavaram Silk Sarees"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Craft Type Classification *</label>
              <input
                type="text"
                required
                value={newCatCraftType}
                onChange={(e) => setNewCatCraftType(e.target.value)}
                className="form-input"
                placeholder="e.g. Broad Border Pure Silk Weaving"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL *</label>
              <input
                type="url"
                required
                value={newCatImage}
                onChange={(e) => setNewCatImage(e.target.value)}
                className="form-input"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                required
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="form-textarea"
                placeholder="Details regarding historical heritage, loom techniques, and geographical region..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={savingCategory} className="btn btn-primary">
                {savingCategory ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
