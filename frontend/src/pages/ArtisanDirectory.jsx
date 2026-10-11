import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArtisanCard } from '../components/ArtisanCard';

export const ArtisanDirectory = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (selectedState) query.append('state', selectedState);

        const res = await api.get(`/artisans?${query.toString()}`);
        if (res.success) {
          setArtisans(res.artisans || []);
        }
      } catch (err) {
        console.error('Error loading artisan directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [searchTerm, selectedState]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ maxWidth: '720px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
          <span className="badge badge-terracotta" style={{ marginBottom: '0.5rem' }}>
            Verified Craftsmen & Weavers
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.5rem', color: 'var(--color-indigo)', marginBottom: '0.75rem' }}>
            Master Artisan Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Connect directly with verified generational weavers preserving traditional Indian handloom
            and handicraft heritages across rural craft clusters.
          </p>
        </div>

        {/* Filter bar */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by artisan name, craft (e.g. Ikat, Kalamkari), or village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="form-select"
            >
              <option value="">All States / Regions</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Odisha">Odisha</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading verified artisans...</p>
          </div>
        ) : artisans.length > 0 ? (
          <div className="grid-artisans">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan._id} artisan={artisan} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No artisans found matching your query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
