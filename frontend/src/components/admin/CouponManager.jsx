import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { RiAddLine, RiCoupon3Line, RiToggleFill, RiToggleLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 10,
    maxDiscount: 500,
    minOrderValue: 1000,
    active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCoupons();
      setCoupons(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = (id) => {
    setCoupons(
      coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.success('Coupon status toggled');
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error('Coupon code is required');
      return;
    }

    try {
      const saved = await adminService.saveCoupon(formData);
      setCoupons([...coupons, saved]);
      setIsModalOpen(false);
      setFormData({ code: '', discountPercent: 10, maxDiscount: 500, minOrderValue: 1000, active: true });
      toast.success('Coupon created successfully');
    } catch {
      toast.error('Could not save coupon');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Promotional Coupons & Vouchers
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Configure festive campaign codes, minimum order restrictions, and caps.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<RiAddLine />}>
          Create New Coupon
        </Button>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <Loader size="md" message="Loading coupons..." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Coupon Code</th>
                <th style={{ padding: '12px 14px' }}>Discount Type</th>
                <th style={{ padding: '12px 14px' }}>Min Order</th>
                <th style={{ padding: '12px 14px' }}>Max Discount</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Toggle Active</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary)' }}>
                    <span style={{ backgroundColor: 'var(--color-primary-subtle)', padding: '4px 10px', borderRadius: '4px' }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {c.discountPercent ? `${c.discountPercent}% Off` : `Flat ₹${c.flatDiscount} Off`}
                  </td>
                  <td style={{ padding: '12px 14px' }}>₹{c.minOrderValue}</td>
                  <td style={{ padding: '12px 14px' }}>{c.maxDiscount ? `₹${c.maxDiscount}` : 'Unlimited'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: c.active ? 'var(--color-success-bg)' : '#EEEEEE',
                        color: c.active ? 'var(--color-success)' : '#757575',
                      }}
                    >
                      {c.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggle(c.id)}
                      style={{
                        color: c.active ? 'var(--color-success)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {c.active ? <RiToggleFill size={28} /> : <RiToggleLine size={28} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Discount Coupon">
        <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Coupon Code"
            placeholder="e.g. MONSOON20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Discount %"
              type="number"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
            />
            <Input
              label="Max Discount Cap (₹)"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Minimum Order Value (₹)"
            type="number"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CouponManager;
