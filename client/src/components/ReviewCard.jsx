import React, { useState } from 'react';
import { Trash2, Clock, Check } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

/**
 * Format relative or absolute timestamp
 */
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ReviewCard = ({ review, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const borderClass =
    review.sentiment === 'Positive'
      ? 'border-positive'
      : review.sentiment === 'Negative'
      ? 'border-negative'
      : 'border-neutral';

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto reset confirm after 3s
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(review._id);
    } catch (err) {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`review-card ${borderClass}`}>
      <div className="review-card-header">
        <div className="review-meta-group">
          {/* Sentiment Badge & Score */}
          <SentimentBadge
            label={review.label}
            sentiment={review.sentiment}
            score={review.score}
            showIcon={true}
            showScore={true}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>{formatTime(review.createdAt)}</span>
          </div>

          <button
            type="button"
            className={`btn-icon ${confirmDelete ? 'danger' : ''}`}
            onClick={handleDelete}
            disabled={isDeleting}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete review'}
            style={{ padding: '4px' }}
          >
            {isDeleting ? (
              <span className="spinner" style={{ width: '12px', height: '12px' }} />
            ) : confirmDelete ? (
              <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600 }}>Confirm?</span>
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Review Text */}
      <p className="review-text">{review.text}</p>

      {/* Keywords Breakdown */}
      {((review.positiveWords && review.positiveWords.length > 0) ||
        (review.negativeWords && review.negativeWords.length > 0)) && (
        <div className="review-card-footer">
          <div className="keywords-group">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Keywords:</span>
            {review.positiveWords?.map((w, idx) => (
              <span key={`pos-${idx}`} className="word-tag pos">
                +{w}
              </span>
            ))}
            {review.negativeWords?.map((w, idx) => (
              <span key={`neg-${idx}`} className="word-tag neg">
                -{w}
              </span>
            ))}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            Density: {review.comparative || 0}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
