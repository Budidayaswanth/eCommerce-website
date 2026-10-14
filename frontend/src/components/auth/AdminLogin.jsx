import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { RiLockPasswordLine, RiMailLine, RiShieldUserLine, RiArrowLeftLine } from 'react-icons/ri';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide admin email and password');
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0D1354',
        padding: '24px',
        position: 'relative',
      }}
    >
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          color: 'var(--color-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        <RiArrowLeftLine size={20} /> Back to Store
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          padding: '40px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo.jpg"
            alt="LEO PAINTS"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              margin: '0 auto 12px',
              border: '2px solid var(--color-secondary)',
            }}
          />
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Admin Portal
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
            Authorized personnel management console
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-btn)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@leopaints.com"
            icon={<RiMailLine />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<RiLockPasswordLine />}
            required
          />

          {import.meta.env.DEV && (
            <div
              style={{
                backgroundColor: 'var(--color-primary-subtle)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '0.75rem',
                color: 'var(--color-primary-dark)',
              }}
            >
              <strong>Local Dev Credentials:</strong>
              <br />
              Email: <code>admin@leopaints.com</code>
              <br />
              Password: <code>Admin@123</code>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={loading}
            icon={<RiShieldUserLine />}
          >
            Authenticate & Access
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
