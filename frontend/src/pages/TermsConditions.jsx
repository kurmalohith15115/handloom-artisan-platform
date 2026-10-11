import React from 'react';

export const TermsConditions = () => {
  return (
    <div className="page-wrapper container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', lineHeight: 1.8 }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)', marginBottom: '1.5rem' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.88rem' }}>
          Last Updated: October 2026
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          1. Platform Marketplace Architecture
        </h3>
        <p>
          The Handloom Artisan Support Platform operates as a direct-to-consumer marketplace connecting
          verified Indian master artisans with customers. Each order placed constitutes a purchase directly
          from the respective artisan studio.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          2. Handcrafted Uniqueness & Subtle Variations
        </h3>
        <p>
          Because our products are crafted on traditional manual pit and pedal looms using natural vegetable
          and fermented dyes, subtle natural variations in weave slub, motif positioning, and organic dye
          shading are natural hallmarks of authentic Indian handlooms, not defects.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          3. Artisan Code of Conduct
        </h3>
        <p>
          Artisans agree to supply only genuine handloom, hand-spun, or handcrafted items with accurate
          material descriptions and fair pricing. Any attempt to misrepresent mass-produced power-loom
          goods as authentic GI handlooms will result in immediate suspension.
        </p>
      </div>
    </div>
  );
};
