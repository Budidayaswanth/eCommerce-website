import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import adminService from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import {
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiGroupLine,
  RiAlertLine,
  RiArrowRightUpLine,
} from 'react-icons/ri';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAllOrders(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader size="md" message="Loading admin operations dashboard..." />;

  // Chart data setup
  const chartData = {
    labels: stats?.dailyRevenue?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Gross Daily Revenue (₹)',
        data: stats?.dailyRevenue?.map((d) => d.revenue) || [],
        fill: true,
        borderColor: '#1A237E',
        backgroundColor: 'rgba(26, 35, 126, 0.08)',
        tension: 0.35,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#1A237E',
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatPrice(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₹${value / 1000}k`,
        },
        grid: { color: '#F1F5F9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          Executive Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Real-time paint manufacturing, inventory velocities, and transactional summaries.
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Monthly Revenue
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', marginTop: '4px' }}>
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '6px', display: 'flex', alignItems: 'center' }}>
              <RiArrowRightUpLine size={16} /> {stats?.revenueChange}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-primary-subtle)', borderRadius: '10px', color: 'var(--color-primary)' }}>
            <RiMoneyDollarCircleLine size={24} />
          </div>
        </div>

        {/* Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginTop: '4px' }}>
              {stats?.totalOrders || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '6px', display: 'flex', alignItems: 'center' }}>
              <RiArrowRightUpLine size={16} /> {stats?.ordersChange}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#E1F5FE', borderRadius: '10px', color: '#0288D1' }}>
            <RiFileList3Line size={24} />
          </div>
        </div>

        {/* Users */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Registered Painters
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginTop: '4px' }}>
              {stats?.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '6px', display: 'flex', alignItems: 'center' }}>
              <RiArrowRightUpLine size={16} /> {stats?.usersChange}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#EDE7F6', borderRadius: '10px', color: '#5E35B1' }}>
            <RiGroupLine size={24} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Low Stock Alerts
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-accent)', marginTop: '4px' }}>
              {stats?.lowStockCount || 0} SKUs
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '6px' }}>
              Needs immediate plant replenishment
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#FFEBEE', borderRadius: '10px', color: 'var(--color-accent)' }}>
            <RiAlertLine size={24} />
          </div>
        </div>
      </div>

      {/* Revenue 30-Day Line Chart */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
              Gross Sales Velocity (Last 30 Days)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Normalized direct-to-consumer and contractor order billing
            </span>
          </div>
          <Badge variant="gold">Real-time Stream</Badge>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
          Recent Customer Orders
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Items</th>
                <th style={{ padding: '12px 14px' }}>Total Amount</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => {
                const meta = ORDER_STATUSES[ord.status] || ORDER_STATUSES.CONFIRMED;
                return (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                      {ord.id}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '500' }}>{ord.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{ord.itemsCount} cans</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{formatPrice(ord.amount)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          backgroundColor: meta.bg,
                          color: meta.color,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: ord.paymentStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: '600', fontSize: '0.8125rem' }}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
