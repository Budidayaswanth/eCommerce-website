import React from 'react';
import {
  RiShieldStarLine,
  RiCustomerService2Line,
  RiTruckLine,
  RiArrowGoBackLine,
} from 'react-icons/ri';

const PROMISES = [
  {
    icon: RiShieldStarLine,
    title: 'Premium Quality Guarantee',
    desc: 'Low-VOC, non-toxic, and ISO 9001 certified paint formulations for lifelong sheen.',
  },
  {
    icon: RiCustomerService2Line,
    title: 'Expert Paint Consultants',
    desc: 'Free digital shade visualizer and technical estimation assistance from masters.',
  },
  {
    icon: RiTruckLine,
    title: 'Fast & Secure Delivery',
    desc: 'Tamper-proof specialized liquid packaging dispatched across 25,000+ PIN codes.',
  },
  {
    icon: RiArrowGoBackLine,
    title: 'Easy Replacement Support',
    desc: 'Hassle-free replacement guarantee on any transit damage or shade variance.',
  },
];

const BrandPromise = () => {
  return (
    <section
      style={{
        marginBottom: '48px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '36px 24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}
        className="brand-promises-grid"
      >
        {PROMISES.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '12px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Icon size={28} />
              </div>

              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'var(--color-primary-dark)',
                  marginBottom: '6px',
                }}
              >
                {p.title}
              </h4>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .brand-promises-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .brand-promises-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default BrandPromise;
