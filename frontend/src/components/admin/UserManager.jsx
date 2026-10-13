import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { RiSearchLine, RiLockLine, RiLockUnlockLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      const updated = await adminService.toggleUserBlock(userId);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      toast.success(`User status updated to ${updated.status}`);
    } catch {
      toast.error('Could not toggle user status');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          Customer & Contractor Accounts
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Registered user directory, order historical counts, and authorization statuses.
        </p>
      </div>

      <div style={{ maxWidth: '400px' }}>
        <Input
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<RiSearchLine />}
        />
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
          <Loader size="md" message="Loading users..." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Customer Name</th>
                <th style={{ padding: '12px 14px' }}>Contact Details</th>
                <th style={{ padding: '12px 14px' }}>Orders Placed</th>
                <th style={{ padding: '12px 14px' }}>Member Since</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '600' }}>{u.name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>+91 {u.phone}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '600' }}>{u.ordersCount} orders</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>{u.joinedDate}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: u.status === 'ACTIVE' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                        color: u.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: u.status === 'ACTIVE' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                        color: u.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                      }}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <RiLockLine /> Block User
                        </>
                      ) : (
                        <>
                          <RiLockUnlockLine /> Unblock User
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManager;
