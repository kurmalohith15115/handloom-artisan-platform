import React from 'react';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-terracotta" style={{ marginBottom: '0.75rem' }}>
            Living Cultural Heritage
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.6rem', color: 'var(--color-indigo)', marginBottom: '1rem' }}>
            Preserving India's Master Weaving Heritage
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            The Handloom Artisan Support Platform bridges ancient Indian craft traditions with conscious
            patrons worldwide through fair, transparent, and direct marketplace technology.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          <h2 className="heading-serif" style={{ fontSize: '1.6rem', color: 'var(--color-terracotta)', marginBottom: '1rem' }}>
            Our Mission: Direct Weaver Sovereignty
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            For generations, the handloom ecosystem in India has produced some of the world's finest
            textiles — from the mathematical precision of Pochampally double ikat to the organic natural
            dyes of Srikalahasti Kalamkari. Yet traditional artisans have historically been separated from
            fair compensation by layered chains of middlemen, traders, and commercial markups.
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Our platform provides master artisans with their own digital storefronts, verified GI (Geographical
            Indication) certifications, direct digital payouts, and sovereign control over their pricing and
            catalogues.
          </p>

          <h3 className="heading-serif" style={{ fontSize: '1.35rem', color: 'var(--color-indigo)', margin: '2rem 0 1rem' }}>
            What Sets Our Marketplace Apart
          </h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <strong>100% Direct Payouts:</strong> Every rupee earned minus essential payment gateway fees
              goes straight to the artisan household.
            </li>
            <li>
              <strong>Preserving GI Certification:</strong> We curate crafts with verified origins, ensuring
              authentic pit-loom and pedal-loom pieces are distinguished from power-loom replicas.
            </li>
            <li>
              <strong>Bilingual & Accessible:</strong> Built with native support for Indian regional languages
              (Telugu and English) to ensure rural weavers can effortlessly manage incoming orders.
            </li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/products" className="btn btn-primary btn-lg" style={{ marginRight: '1rem' }}>
            Explore Handloom Weaves
          </Link>
          <Link to="/artisan/register" className="btn btn-secondary btn-lg">
            Join as an Artisan Partner
          </Link>
        </div>
      </div>
    </div>
  );
};
