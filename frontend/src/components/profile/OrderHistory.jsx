import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import {
  RiShoppingBagLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiTruckLine,
  RiArchiveLine,
  RiInboxUnarchiveLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOrders = async (isArchived) => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ isArchived });
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
      toast.error('Unable to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab === 'ARCHIVED');
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you wish to cancel this paint order?')) {
      setActionLoadingId(orderId);
      try {
        await orderService.cancelOrder(orderId, 'Cancelled by user');
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
        );
        toast.success('Order cancelled successfully');
      } catch {
        toast.error('Could not cancel order');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleArchiveOrder = async (orderId, e) => {
    e?.stopPropagation();
    setActionLoadingId(orderId);
    try {
      await orderService.archiveOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success('Order archived successfully. Moved to Archived Orders tab.');
    } catch {
      toast.error('Failed to archive order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnarchiveOrder = async (orderId, e) => {
    e?.stopPropagation();
    setActionLoadingId(orderId);
    try {
      await orderService.unarchiveOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success('Order restored to active orders list');
    } catch {
      toast.error('Failed to restore order');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Archiving Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '14px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
            My Orders & Paint Dispatches
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Track live dispatch status, review invoices, or manage archived painting orders
          </span>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-bg-page)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: activeTab === 'ACTIVE' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'ACTIVE' ? '#FFFFFF' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RiShoppingBagLine size={16} /> Active Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ARCHIVED')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: activeTab === 'ARCHIVED' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'ARCHIVED' ? '#FFFFFF' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RiArchiveLine size={16} /> Archived Orders
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Loader size="md" message={`Loading ${activeTab === 'ACTIVE' ? 'active' : 'archived'} orders...`} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={activeTab === 'ACTIVE' ? <RiShoppingBagLine /> : <RiArchiveLine />}
          title={activeTab === 'ACTIVE' ? 'No Active Orders Placed' : 'No Archived Orders'}
          subtitle={
            activeTab === 'ACTIVE'
              ? "You don't have any ongoing or active orders. Explore our luxury royal emulsions and place your first dispatch!"
              : 'You have not archived any past orders. Once an order is delivered or cancelled, you can archive it here to keep your records neat.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.CONFIRMED;
            const isCancellable = order.status === 'PLACED' || order.status === 'CONFIRMED' || order.status === 'PENDING';
            const isArchiveEligible = order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'REFUNDED';
            const isActionLoading = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-card)',
                  border: order.isArchived ? '1px dashed var(--color-border)' : '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xs)',
                  opacity: order.isArchived ? 0.95 : 1,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--color-primary-dark)' }}>
                          Order #{order.orderNumber || order.id}
                        </span>
                        {order.isArchived && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: '700',
                              backgroundColor: '#F3F4F6',
                              color: '#4B5563',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RiArchiveLine size={12} /> ARCHIVED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Placed on {formatDate(order.placedAt || order.createdAt, true)}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {order.items?.length || 1} {(order.items?.length || 1) === 1 ? 'product' : 'products'}
                      </div>
                    </div>

                    {/* Quick Archive/Unarchive Action in header */}
                    {activeTab === 'ACTIVE' && isArchiveEligible && (
                      <button
                        type="button"
                        onClick={(e) => handleArchiveOrder(order.id, e)}
                        disabled={isActionLoading}
                        title="Archive this completed order"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-btn)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        <RiArchiveLine size={14} /> Archive
                      </button>
                    )}

                    {activeTab === 'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={(e) => handleUnarchiveOrder(order.id, e)}
                        disabled={isActionLoading}
                        title="Restore to active order list"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-btn)',
                          border: '1.5px solid var(--color-primary)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary-dark)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <RiInboxUnarchiveLine size={14} /> Restore
                      </button>
                    )}

                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      {isExpanded ? <RiArrowUpSLine size={24} /> : <RiArrowDownSLine size={24} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                    {/* Status Tracker */}
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
                        Status: <strong>{statusMeta.label}</strong>
                        {order.deliveredAt && ` • Delivered on ${formatDate(order.deliveredAt, true)}`}
                        {order.couponCode && ` • Coupon applied: ${order.couponCode} (-${formatPrice(order.discountAmount)})`}
                      </span>
                    </div>

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
                                alt={it.productName || it.name}
                                style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                {it.productName || it.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {it.size} • {it.finish} • Qty: {it.quantity}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>
                            {formatPrice((it.unitPrice || it.price) * it.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Destination & Action Footer */}
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
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '450px' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Shipping Destination:</strong>
                        <br />
                        {order.address?.receiverName || order.address?.name || 'Valued Customer'}
                        {order.address?.receiverPhone ? ` (📞 +91 ${order.address.receiverPhone})` : ''}
                        <br />
                        {order.address?.fullAddress || order.address?.street}, {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isCancellable && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            isLoading={isActionLoading}
                          >
                            Cancel Order
                          </Button>
                        )}

                        {activeTab === 'ACTIVE' && isArchiveEligible && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleArchiveOrder(order.id, e)}
                            isLoading={isActionLoading}
                            icon={<RiArchiveLine />}
                          >
                            Archive Order
                          </Button>
                        )}

                        {activeTab === 'ARCHIVED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => handleUnarchiveOrder(order.id, e)}
                            isLoading={isActionLoading}
                            icon={<RiInboxUnarchiveLine />}
                          >
                            Restore to Active Orders
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
