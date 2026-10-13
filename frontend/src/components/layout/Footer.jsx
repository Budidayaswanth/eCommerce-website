import React from 'react';
import { Link } from 'react-router-dom';
import {
  RiFacebookBoxFill,
  RiInstagramFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiPhoneFill,
  RiMailFill,
  RiMapPinFill,
  RiShieldCheckLine,
} from 'react-icons/ri';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary-dark)',
        color: '#FFFFFF',
        marginTop: '60px',
        padding: '50px 24px 24px',
        borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
        }}
      >
        {/* Column 1: Brand & About */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <img
              src="/logo.jpg"
              alt="Leo Paints"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1.5px solid var(--color-secondary)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#FFFFFF',
                letterSpacing: '0.8px',
              }}
            >
              LEO PAINTS
            </span>
          </div>
          <p
            style={{
              color: '#B0BEC5',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            Pioneers of architectural excellence, bringing royal pigments, weather-armored durability, and certified eco-safe paints to homes and projects across India.
          </p>
          <div style={{ display: 'flex', gap: '14px', color: 'var(--color-secondary)' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <RiFacebookBoxFill size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <RiInstagramFill size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <RiTwitterXFill size={24} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <RiYoutubeFill size={24} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4
            style={{
              color: 'var(--color-secondary)',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '18px',
            }}
          >
            Paint Categories
          </h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: '#CFD8DC' }}>
            <li><Link to="/explore/interior-paints" className="footer-link">Interior Emulsions</Link></li>
            <li><Link to="/explore/exterior-paints" className="footer-link">Exterior WeatherShield</Link></li>
            <li><Link to="/explore/primers" className="footer-link">Masonry & Wood Primers</Link></li>
            <li><Link to="/explore/wood-finishes" className="footer-link">Exotic Wood PU Finishes</Link></li>
            <li><Link to="/explore/waterproofing" className="footer-link">Heavy Waterproofing Barrier</Link></li>
            <li><Link to="/explore/textures" className="footer-link">Designer Metallic Textures</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Policy */}
        <div>
          <h4
            style={{
              color: 'var(--color-secondary)',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '18px',
            }}
          >
            Customer Care
          </h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: '#CFD8DC' }}>
            <li><Link to="/profile" className="footer-link">Track Your Order</Link></li>
            <li><Link to="/cart" className="footer-link">Shipping & Delivery Rates</Link></li>
            <li><Link to="/explore" className="footer-link">Paint Quantity Calculator</Link></li>
            <li><Link to="/explore" className="footer-link">Warranty Registration</Link></li>
            <li><Link to="/explore" className="footer-link">Terms & Conditions</Link></li>
            <li><Link to="/explore" className="footer-link">Privacy & Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h4
            style={{
              color: 'var(--color-secondary)',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '18px',
            }}
          >
            Headquarters
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: '#CFD8DC' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <RiMapPinFill size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '3px' }} />
              <span>Leo Tower, Plot 48, Industrial Tech Park, Banjara Hills, Hyderabad, 500034</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RiPhoneFill size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
              <span>1800-LEO-PAINTS / +91 40 2345 6789</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RiMailFill size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
              <span>customercare@leopaints.com</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn)',
                marginTop: '8px',
                fontSize: '0.75rem',
                color: 'var(--color-secondary)',
              }}
            >
              <RiShieldCheckLine size={18} />
              <span>100% Certified Eco-Safe Formulation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto',
          fontSize: '0.75rem',
          color: '#90A4AE',
          gap: '12px',
        }}
      >
        <div>© {new Date().getFullYear()} LEO PAINTS PRIVATE LIMITED. All rights reserved.</div>
        <div>Crafted for Indian Homes • BIS & ISO 9001 Certified Quality</div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--color-secondary) !important;
          padding-left: 4px;
          transition: all var(--transition-fast);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
