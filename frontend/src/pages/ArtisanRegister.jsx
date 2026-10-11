import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ArtisanRegister = () => {
  const { registerArtisan } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    craftType: 'Pochampally Ikat',
    craftStory: '',
    experienceYears: 10,
    village: '',
    district: '',
    state: 'Telangana',
    profilePhoto: '',
    languagePreference: 'en',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.craftStory.trim().length < 20) {
      setError('Please provide at least 20 characters about your craft heritage and weaving tradition.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        craftType: formData.craftType,
        craftStory: formData.craftStory,
        experienceYears: Number(formData.experienceYears),
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
          country: 'India',
        },
        profilePhoto: formData.profilePhoto,
        languagePreference: formData.languagePreference,
      };

      const res = await registerArtisan(payload);
      if (res.success) {
        navigate('/artisan/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Artisan registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ padding: '3.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧵</span>
          <h1 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--color-indigo)', marginBottom: '0.35rem' }}>
            Artisan Partner Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto' }}>
            Sell your handcrafted weaves and handicrafts directly to conscious patrons worldwide with
            zero middlemen markups.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#92400e',
            lineHeight: 1.5,
          }}
        >
          <strong>📋 Verification Workflow:</strong> Upon registration, your application will be
          submitted for administrator review. Once approved, your studio will be verified and you can
          begin listing handloom products.
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Master Artisan Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="e.g. Narasimha Chary"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="narasimha@artisan.org"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password * (Min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
                placeholder="+91 98480 12345"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Craft Tradition *</label>
              <select
                value={formData.craftType}
                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                className="form-select"
              >
                <option value="Pochampally Ikat">Pochampally Ikat (Telangana)</option>
                <option value="Kalamkari Art & Handloom">Kalamkari Art (Andhra Pradesh)</option>
                <option value="Mangalagiri Cotton & Silk">Mangalagiri Handloom (Andhra Pradesh)</option>
                <option value="Gadwal Handwoven Sarees">Gadwal Sarees (Telangana)</option>
                <option value="Venkatagiri Jamdani">Venkatagiri Jamdani (Andhra Pradesh)</option>
                <option value="Bidriware Handicraft">Bidriware Handicraft (Karnataka / Telangana)</option>
                <option value="Khadi & Handspun Textiles">Khadi & Handspun Cotton</option>
                <option value="Other Traditional Craft">Other Traditional Craft</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Generational Experience *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Location fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Village / Town *</label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="form-input"
                placeholder="e.g. Bhoodan Pochampally"
              />
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="form-input"
                placeholder="e.g. Yadadri Bhuvanagiri"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="form-select"
              >
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Odisha">Odisha</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo / Studio Image URL (Optional)</label>
            <input
              type="url"
              value={formData.profilePhoto}
              onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
              className="form-input"
              placeholder="https://images.unsplash.com/... or leave blank"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Artisan Heritage Story & Craft Technique * (Min 20 characters)</label>
            <textarea
              required
              rows={4}
              value={formData.craftStory}
              onChange={(e) => setFormData({ ...formData, craftStory: e.target.value })}
              className="form-textarea"
              placeholder="Tell patrons about your family's weaving heritage, loom types, natural dye methods, and what makes your craft unique..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Submitting Application...' : '🧵 Submit Artisan Application'}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.88rem',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            Already an approved artisan?{' '}
            <Link to="/artisan/login" style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}>
              Sign In to Artisan Studio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
