import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Footer from '../../components/layout/Footer';
import { RiTruckLine, RiCheckDoubleLine, RiArrowLeftLine, RiPrinterLine, RiFileTextLine, RiCloseLine } from 'react-icons/ri';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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

  // 18% GST Paint Tax Breakdown (9% CGST + 9% SGST)
  const totalAmountNum = Number(order.totalAmount || 0);
  const deliveryChargeNum = Number(order.deliveryCharge || 0);
  const discountNum = Number(order.discountAmount || 0);
  const goodsAmount = Math.max(0, totalAmountNum - deliveryChargeNum);
  const taxableValue = Math.round((goodsAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((goodsAmount - taxableValue) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst / 2) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <button
          onClick={() => setShowInvoiceModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-dark)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-btn)',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <RiPrinterLine size={18} /> Download / Print Tax Invoice
        </button>
      </div>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="no-print"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-page)',
                color: 'var(--color-primary)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <RiFileTextLine size={15} /> View Tax Invoice
            </button>
            <Badge style={{ backgroundColor: statusMeta.bg, color: statusMeta.color, fontSize: '0.8125rem', padding: '6px 14px' }}>
              {statusMeta.label}
            </Badge>
          </div>
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

      {/* Tax Invoice Modal */}
      {showInvoiceModal && (
        <div
          className="invoice-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInvoiceModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Actions Bar (Not Printed) */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-page)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
                <RiFileTextLine size={20} />
                <span>GST Tax Invoice — Order #{order.id}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <RiPrinterLine size={18} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                  }}
                  aria-label="Close invoice"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Content */}
            <div
              id="printable-invoice-container"
              style={{
                padding: '36px',
                overflowY: 'auto',
                color: '#1E293B',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Header: Brand & GSTIN */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #1A237E',
                  paddingBottom: '20px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.jpg" alt="Leo Paints" style={{ width: '44px', height: '44px', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1A237E', letterSpacing: '0.5px' }}>
                        LEO PAINTS ROYAL COATINGS PVT. LTD.
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                        CIN: U24222TG2022PTC160000 | GSTIN: 36AABCL8921P1ZK
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '8px', lineHeight: 1.5 }}>
                    Plot 42, IDA Phase-II, Royal Industrial Estate, Hyderabad, Telangana - 500051<br />
                    State Code: 36 | Email: care@leopaints.com | Toll-Free: 1800-425-3366
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#1A237E',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                    }}
                  >
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>Original for Recipient</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', marginTop: '6px', color: '#0F172A' }}>
                    Invoice #: INV-{order.orderNumber || `LP-${order.id}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Date: {formatDate(order.createdAt, true)}
                  </div>
                </div>
              </div>

              {/* Order Meta & Addresses */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Bill To / Buyer:
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: '#0F172A' }}>
                    {order.deliveryAddress?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                    {order.deliveryAddress?.street}<br />
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}<br />
                    Contact: +91 {order.deliveryAddress?.phone}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Dispatch Details:
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6 }}>
                    <strong>Order Reference:</strong> #{order.id}<br />
                    <strong>Payment Method:</strong> {order.paymentMethod}<br />
                    <strong>Payment Status:</strong> <span style={{ color: '#16A34A', fontWeight: '700' }}>PAID / CONFIRMED</span><br />
                    <strong>Airway Bill (AWB):</strong> {order.trackingNumber || 'LP-EXP-STANDARD'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1A237E', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Description of Paint Formulation</th>
                    <th style={{ padding: '10px 12px' }}>Finish</th>
                    <th style={{ padding: '10px 12px' }}>Can Size</th>
                    <th style={{ padding: '10px 12px' }}>HSN</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0F172A' }}>{it.name}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{it.finish || 'Matte'}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{it.size || '4 Litres'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748B', fontFamily: 'monospace' }}>3209</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>{it.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#1A237E' }}>
                        {formatPrice(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax & Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Taxable Value (Before GST):</span>
                    <span>{formatPrice(taxableValue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Central GST (CGST @ 9%):</span>
                    <span>{formatPrice(cgst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>State GST (SGST @ 9%):</span>
                    <span>{formatPrice(sgst)}</span>
                  </div>
                  {deliveryChargeNum > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Doorstep Delivery & Freight:</span>
                      <span>{formatPrice(deliveryChargeNum)}</span>
                    </div>
                  )}
                  {discountNum > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '600' }}>
                      <span>Promotional Discount:</span>
                      <span>- {formatPrice(discountNum)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '2px solid #1A237E',
                      fontWeight: '800',
                      fontSize: '1.05rem',
                      color: '#1A237E',
                    }}
                  >
                    <span>Total Invoiced Amount:</span>
                    <span>{formatPrice(totalAmountNum)}</span>
                  </div>
                </div>
              </div>

              {/* Declarations & Authenticated Seal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '16px',
                }}
              >
                <div style={{ maxWidth: '420px', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                  <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Formulation warranty valid with genuine factory seal.
                  <br />
                  <em>Computer-generated tax invoice. No physical signature required under Rule 46 of CGST Rules, 2017.</em>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      border: '2px dashed #1A237E',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1A237E', textTransform: 'uppercase' }}>
                      ★ LEO PAINTS FACTORY DISPATCH ★
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#16A34A', fontWeight: '700' }}>
                      DIGITALLY VERIFIED QUALITY
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .order-detail-bottom-split {
            grid-template-columns: 1fr !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible !important;
          }
          #printable-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print, header, footer, nav, .sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage;
