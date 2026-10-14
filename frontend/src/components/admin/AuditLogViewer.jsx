import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { RiHistoryLine, RiSearchLine } from 'react-icons/ri';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminService.getAuditLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const searchLower = (debouncedSearch || '').toLowerCase();
  const filtered = logs.filter(
    (l) =>
      (l.action || '').toLowerCase().includes(searchLower) ||
      (l.entity || '').toLowerCase().includes(searchLower) ||
      (l.performedBy || '').toLowerCase().includes(searchLower) ||
      (l.details || '').toLowerCase().includes(searchLower)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          System Security & Audit Trail
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Immutable historical ledger of configuration changes, price revisions, and staff updates.
        </p>
      </div>

      <div style={{ maxWidth: '400px' }}>
        <Input
          placeholder="Filter by action, entity or admin email..."
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
          <Loader size="md" message="Loading audit trail..." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Action Trigger</th>
                <th style={{ padding: '12px 14px' }}>Target Entity</th>
                <th style={{ padding: '12px 14px' }}>Performed By</th>
                <th style={{ padding: '12px 14px' }}>Details / Change Payload</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(log.timestamp, true)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary-dark)',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '600' }}>{log.entity}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-primary)' }}>{log.performedBy}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
