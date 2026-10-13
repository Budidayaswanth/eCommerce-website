import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import { RiCheckboxCircleFill, RiCloseCircleFill, RiTimeFill, RiShoppingBag3Line } from 'react-icons/ri';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-984210';
  const status = (searchParams.get('status') || 'success').toLowerCase();

  const isSuccess = status === 'success';
  const isPending = status === 'pending';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div
        style={{
          maxWidth: '540px',
          margin: '40px auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Status Icon */}
        <div style={{ marginBottom: '20px' }}>
          {isSuccess && (
            <RiCheckboxCircleFill size={72} color="var(--color-success)" />
          )}
          {isPending && (
            <RiTimeFill size={72} color="var(--color-warning)" />
          )}
          {!isSuccess && !isPending && (
            <RiCloseCircleFill size={72} color="var(--color-danger)" />
          )}
        </div>

        <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
          {isSuccess && 'Payment Successful & Order Confirmed!'}
          {isPending && 'Payment Pending Verification'}
          {!isSuccess && !isPending && 'Transaction Could Not Complete'}
        </h1>

        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {isSuccess && (
            <>
              Thank you for trusting <strong>LEO PAINTS</strong>. Your paint formulation order <strong>#{orderId}</strong> has been logged in our dispatch pipeline.
            </>
          )}
          {isPending && (
            <>
              Your bank transaction is being verified for order <strong>#{orderId}</strong>. We will notify you via SMS once cleared.
            </>
          )}
          {!isSuccess && !isPending && (
            <>
              Your payment for order <strong>#{orderId}</strong> was declined or timed out. Any deducted funds will be refunded within 48 hours.
            </>
          )}
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          {isSuccess && (
            <>
              <Link to={`/orders/${orderId}`}>
                <Button variant="outline" size="md">
                  View Order Status
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="primary" size="md" icon={<RiShoppingBag3Line />}>
                  Continue Browsing
                </Button>
              </Link>
            </>
          )}

          {!isSuccess && (
            <>
              <Link to="/checkout">
                <Button variant="primary" size="md">
                  Retry Payment
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="md">
                  Return to Store
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentStatusPage;
