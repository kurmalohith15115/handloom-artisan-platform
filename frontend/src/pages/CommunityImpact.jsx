import React from 'react';
import { Link } from 'react-router-dom';

export const CommunityImpact = () => {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-forest" style={{ marginBottom: '0.75rem' }}>
            Empowering Weaving Communities
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.6rem', color: 'var(--color-indigo)', marginBottom: '1rem' }}>
            Community Impact & Fair Compensation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Measuring tangible economic uplift, fair remuneration, and generational heritage preservation
            across rural handloom clusters.
          </p>
        </div>

        {/* 3 Impact Stat Boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>💵</span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-terracotta)' }}>
              100%
            </div>
            <strong style={{ display: 'block', margin: '0.35rem 0' }}>Direct Payouts</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Zero middlemen commissions taken from the artisan's asking price.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🌿</span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-forest)' }}>
              Zero Carbon
            </div>
            <strong style={{ display: 'block', margin: '0.35rem 0' }}>Manual Loom Weaving</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Eco-friendly pedal and pit looms operating with clean human kinetic energy.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👩‍🌾</span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-indigo)' }}>
              65%+
            </div>
            <strong style={{ display: 'block', margin: '0.35rem 0' }}>Women Weavers</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Empowering women artisans engaged in yarn preparation, tying, and dying.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', lineHeight: 1.8 }}>
          <h2 className="heading-serif" style={{ fontSize: '1.6rem', color: 'var(--color-indigo)', marginBottom: '1rem' }}>
            Eliminating The Intermediary Penalty
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            In traditional retail systems, a handwoven saree priced at ₹8,000 typically yields as little
            as ₹1,800 to the weaving household, with wholesalers, retail markups, and showroom distributors
            capturing over 75% of the economic value.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            By providing verified artisans with direct digital storefronts, our platform reverses this
            dynamic: the artisan prices their own work, sets their available stock, and receives full proceeds
            directly through secured digital payment gateways upon fulfillment.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/products" className="btn btn-primary btn-lg">
            Support an Artisan Family Today →
          </Link>
        </div>
      </div>
    </div>
  );
};
