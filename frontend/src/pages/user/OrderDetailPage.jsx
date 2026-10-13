import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Footer from '../../components/layout/Footer';
import { RiTruckLine, RiCheckDoubleLine, RiArrowLeftLine } from 'react-icons/ri';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader fullPage message="Fetching order details..." />;
  if (!order) return <div>Order not found</div>;

  const statusMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.CONFIRMED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link
        to="/profile"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-primary)',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        <RiArrowLeftLine size={18} /> Back to My Orders
      </Link>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Order #{order.id}
            </h1>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Placed on {formatDate(order.createdAt, true)}
            </span>
          </div>

          <Badge style={{ backgroundColor: statusMeta.bg, color: statusMeta.color, fontSize: '0.8125rem', padding: '6px 14px' }}>
            {statusMeta.label}
          </Badge>
        </div>

        {/* Tracking Banner */}
        {order.trackingNumber && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px 18px',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-btn)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-primary-dark)',
            }}
          >
            <RiTruckLine size={24} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>
                Courier Tracking: {order.trackingNumber}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Estimated Delivery Window: {order.estimatedDelivery}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
            Items in this Dispatch
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(order.items || []).map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'var(--color-bg-page)',
                  borderRadius: 'var(--radius-btn)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{it.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      Packaging: {it.size} • Finish: {it.finish} • Qty: {it.quantity}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary)' }}>
                  {formatPrice(it.price * it.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Summary Split */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}
          className="order-detail-bottom-split"
        >
          <div>
            <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              Shipping Destination
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <strong>{order.deliveryAddress?.name}</strong>
              <br />
              {order.deliveryAddress?.street}
              <br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
              <br />
              Phone: +91 {order.deliveryAddress?.phone}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              Payment & Invoicing
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Method: <strong>{order.paymentMethod}</strong>
              <br />
              Status: <strong style={{ color: 'var(--color-success)' }}>{order.paymentStatus}</strong>
              <br />
              Total Invoiced: <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .order-detail-bottom-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage;
