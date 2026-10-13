import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import Input from '../common/Input';
import { RiEyeLine, RiSearchLine } from 'react-icons/ri';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    } catch {
      toast.error('Failed to change order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'ALL' || o.status === activeTab;
    const q = (debouncedSearch || '').toLowerCase();
    const matchesSearch =
      !q ||
      (o.orderNumber || o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Order Fulfillment Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Monitor logistics dispatches, transitions, and customer shipment fulfillments.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<RiSearchLine />}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: activeTab === tab ? 'var(--color-primary)' : '#FFFFFF',
              color: activeTab === tab ? '#FFFFFF' : 'var(--color-text-primary)',
              fontWeight: '600',
              fontSize: '0.8125rem',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
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
          <Loader size="md" message="Loading orders..." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer Info</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Total Amount</th>
                <th style={{ padding: '12px 14px' }}>Update Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => {
                const meta = ORDER_STATUSES[ord.status] || ORDER_STATUSES.CONFIRMED;
                return (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary)' }}>
                      {ord.id}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{ord.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>{ord.date}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{formatPrice(ord.amount)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: `1.5px solid ${meta.color}`,
                          backgroundColor: meta.bg,
                          color: meta.color,
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {Object.keys(ORDER_STATUSES).map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUSES[st].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-bg-page)',
                          color: 'var(--color-primary-dark)',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                        }}
                      >
                        <RiEyeLine size={16} /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details - ${selectedOrder.id}` : ''}
        maxWidth="500px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span>Customer Name:</span>
              <strong>{selectedOrder.customerName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span>Contact Phone:</span>
              <strong>{selectedOrder.phone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span>Order Total:</span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>{formatPrice(selectedOrder.amount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span>Current Status:</span>
              <strong>{selectedOrder.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment Verification:</span>
              <strong style={{ color: 'var(--color-success)' }}>{selectedOrder.paymentStatus}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManager;
