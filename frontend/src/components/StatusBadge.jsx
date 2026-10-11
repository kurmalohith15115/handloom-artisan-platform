import React from 'react';

const statusConfig = {
  // Order statuses
  'Pending Payment': { label: 'Pending Payment', bg: '#fef3c7', text: '#b45309' },
  'Confirmed': { label: 'Confirmed', bg: '#dcfce7', text: '#15803d' },
  'Processing': { label: 'In Craft / Processing', bg: '#e0f2fe', text: '#0369a1' },
  'Shipped': { label: 'Shipped', bg: '#ede9fe', text: '#6d28d9' },
  'Out for Delivery': { label: 'Out for Delivery', bg: '#fef9c3', text: '#a16207' },
  'Delivered': { label: 'Delivered', bg: '#dcfce7', text: '#166534' },
  'Cancelled': { label: 'Cancelled', bg: '#fee2e2', text: '#b91c1c' },
  'Refund Pending': { label: 'Refund Pending', bg: '#ffedd5', text: '#c2410c' },
  'Refunded': { label: 'Refunded', bg: '#f3f4f6', text: '#4b5563' },

  // Artisan Application statuses
  'pending': { label: 'Pending Review', bg: '#fef3c7', text: '#b45309' },
  'approved': { label: 'Verified & Approved', bg: '#dcfce7', text: '#15803d' },
  'rejected': { label: 'Not Approved', bg: '#fee2e2', text: '#b91c1c' },
  'suspended': { label: 'Suspended', bg: '#f3f4f6', text: '#4b5563' },

  // Payment statuses
  'paid': { label: 'Paid via Razorpay', bg: '#dcfce7', text: '#15803d' },
  'failed': { label: 'Payment Failed', bg: '#fee2e2', text: '#b91c1c' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    bg: '#f1f5f9',
    text: '#475569',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.78rem',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.text,
        letterSpacing: '0.01em',
        border: `1px solid ${config.text}22`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          marginRight: '6px',
        }}
      />
      {config.label}
    </span>
  );
};
