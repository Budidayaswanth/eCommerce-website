import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import StarRating from '../common/StarRating';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { RiCheckLine, RiCloseLine, RiStarLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const ReviewManager = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPendingReviews();
      setPendingReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    await adminService.approveReview(id, true);
    setPendingReviews(pendingReviews.filter((r) => r.id !== id));
    toast.success('Review verified and published to product page');
  };

  const handleReject = async (id) => {
    await adminService.approveReview(id, false);
    setPendingReviews(pendingReviews.filter((r) => r.id !== id));
    toast.success('Review rejected');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          User Review & Feedback Moderation
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Approve authentic homeowner ratings before they display publicly on the storefront.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        {loading ? (
          <Loader size="md" message="Loading reviews queue..." />
        ) : pendingReviews.length === 0 ? (
          <EmptyState
            icon={<RiStarLine />}
            title="All Reviews Moderated"
            subtitle="There are no pending product ratings in the moderation queue right now."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{rev.userName}</span>
                    <StarRating rating={rev.rating} size={15} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '6px' }}>
                    {rev.productName}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-primary-dark)' }}>
                    "{rev.title}"
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignSelf: 'center' }}>
                  <button
                    onClick={() => handleReject(rev.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-danger-bg)',
                      color: 'var(--color-danger)',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                    }}
                  >
                    <RiCloseLine size={18} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(rev.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                    }}
                  >
                    <RiCheckLine size={18} /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManager;
