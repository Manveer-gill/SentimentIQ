import React from 'react';
import { MessageSquareOff, Sparkles, Inbox } from 'lucide-react';
import ReviewCard from './ReviewCard';
import Pagination from './Pagination';

export const ReviewList = ({
  reviews,
  isLoading,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
  onSeed,
  isSeeding,
  hasFilters,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="glass-card empty-state">
        <div className="spinner" style={{ width: '32px', height: '32px', color: '#818cf8' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Loading analyzed reviews...
        </p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass-card empty-state">
        <div className="empty-icon">
          {hasFilters ? <MessageSquareOff size={28} /> : <Inbox size={28} />}
        </div>
        <h3 className="empty-title">
          {hasFilters ? 'No Matching Reviews Found' : 'No Reviews Analyzed Yet'}
        </h3>
        <p className="empty-desc">
          {hasFilters
            ? 'Try adjusting your search keywords or sentiment filter pills to find what you are looking for.'
            : 'Submit your first review above, drag & drop a CSV file, or click below to load demo data.'}
        </p>
        <div>
          {hasFilters ? (
            <button className="btn btn-secondary btn-sm" onClick={onResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={onSeed}
              disabled={isSeeding}
            >
              {isSeeding ? <span className="spinner" /> : <Sparkles size={14} />}
              Load Sample Reviews
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} onDelete={onDelete} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ReviewList;
