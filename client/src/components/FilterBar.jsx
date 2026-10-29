import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const FilterBar = ({
  search,
  onSearchChange,
  selectedSentiment,
  onSentimentChange,
  sortBy,
  onSortChange,
  totalCount,
}) => {
  const sentimentOptions = [
    { id: 'all', label: 'All Reviews' },
    { id: 'Positive', label: 'Positive' },
    { id: 'Negative', label: 'Negative' },
    { id: 'Neutral', label: 'Neutral' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-row">
        {/* Search Box */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reviews by keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select-dropdown"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Reviews"
          >
            <option value="newest">Newest First</option>
            <option value="most_negative">Most Negative First ⚠️</option>
            <option value="most_positive">Most Positive First ⭐</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Sentiment Filter Pills */}
      <div className="filter-row">
        <div className="sentiment-pills">
          {sentimentOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`pill-btn ${selectedSentiment === opt.id ? 'active' : ''}`}
              onClick={() => onSentimentChange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
