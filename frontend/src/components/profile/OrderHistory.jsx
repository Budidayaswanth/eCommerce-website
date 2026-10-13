import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { RiShoppingBagLine, RiArrowDownSLine, RiArrowUpSLine, RiTruckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you wish to cancel this paint order?')) {
      try {
        await orderService.cancelOrder(orderId, 'Cancelled by user');
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
        );
        toast.success('Order cancelled successfully');
      } catch {
        toast.error('Could not cancel order');
      }
    }
  };

  if (loading) return <Loader size="md" message="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<RiShoppingBagLine />}
        title="No Orders Placed Yet"
        subtitle="You haven't purchased any paint cans yet. Discover trending interior colors and place your first order!"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const statusMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.CONFIRMED;
        const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';

        return (
          <div
            key={order.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            {/* Header Summary Row */}
            <div
              onClick={() => toggleExpand(order.id)}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: isExpanded ? 'var(--color-bg-page)' : '#FFFFFF',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--color-primary-dark)' }}>
                    Order #{order.id}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Placed on {formatDate(order.createdAt, true)}
                  </div>
                </div>

                <Badge
                  style={{
                    backgroundColor: statusMeta.bg,
                    color: statusMeta.color,
                  }}
                >
                  {statusMeta.label}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {order.items?.length || 1} {(order.items?.length || 1) === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {isExpanded ? <RiArrowUpSLine size={24} /> : <RiArrowDownSLine size={24} />}
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {isExpanded && (
              <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                {/* Tracking info */}
                {order.trackingNumber && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-primary-subtle)',
                      borderRadius: 'var(--radius-btn)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-primary-dark)',
                      marginBottom: '16px',
                    }}
                  >
                    <RiTruckLine size={18} />
                    <span>
                      Tracking ID: <strong>{order.trackingNumber}</strong> • Est. Delivery: {order.estimatedDelivery}
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {(order.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{it.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {it.size} • {it.finish} • Qty: {it.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>
                        {formatPrice(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Cancel Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Shipping Destination:</strong>
                    <br />
                    {order.deliveryAddress?.name} ({order.deliveryAddress?.phone})
                    <br />
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                  </div>

                  {isCancellable && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;
