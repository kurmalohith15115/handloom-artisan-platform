import React from 'react';

export const ShippingRefundPolicy = () => {
  return (
    <div className="page-wrapper container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', lineHeight: 1.8 }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)', marginBottom: '1.5rem' }}>
          Shipping, Cancellation & Refund Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.88rem' }}>
          Last Updated: October 2026
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          1. Pan-India Shipping & Timelines
        </h3>
        <p>
          Products are dispatched directly from the artisan's cluster location (e.g. Pochampally,
          Srikalahasti, Mangalagiri). In-stock items are typically dispatched within 2 to 4 business days.
          Orders valued at ₹1,999 and above qualify for <strong>FREE Pan-India shipping</strong>. Standard
          shipping on orders under ₹1,999 is billed at ₹99 flat.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          2. Order Cancellation Window
        </h3>
        <p>
          Customers may cancel eligible orders directly from the <em>My Account &gt; Order History</em>{' '}
          portal as long as the order is in <strong>Confirmed</strong> or <strong>Processing</strong> status
          and has not yet been marked as Shipped. Upon cancellation, the product stock is restored instantly
          to the artisan's inventory.
        </p>

        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          3. Refunds & Payment Reversals
        </h3>
        <p>
          When an eligible paid order is cancelled, a refund is processed back to the original payment source
          (UPI, Card, or Netbanking) via Razorpay within 5 to 7 business days.
        </p>
      </div>
    </div>
  );
};
