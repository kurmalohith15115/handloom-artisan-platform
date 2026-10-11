import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', lineHeight: 1.8 }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)', marginBottom: '1.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.88rem' }}>
          Last Updated: October 2026
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          1. Information We Collect
        </h3>
        <p>
          We collect personal information necessary to deliver authentic handloom products and process secure
          payments. This includes your name, email address, contact telephone, delivery shipping address,
          and order transaction history.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          2. Payment Security
        </h3>
        <p>
          We do not store complete credit card or debit card numbers on our servers. All digital payments
          are handled securely through Razorpay in full compliance with PCI-DSS payment security standards.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          3. How We Use Artisan and Customer Data
        </h3>
        <p>
          Customer information is used strictly to fulfill orders, provide order tracking, handle customer
          support inquiries, and enable verified product reviews. We never sell customer or artisan data to
          third-party advertisers.
        </p>
      </div>
    </div>
  );
};
