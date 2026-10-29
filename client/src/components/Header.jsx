import React from 'react';
import { Activity, Sparkles, Trash2, Download, Database } from 'lucide-react';

export const Header = ({ onSeed, onClearAll, totalCount, isSeeding, isClearing }) => {
  return (
    <header className="header-wrapper">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-logo">
            <Activity size={26} />
          </div>
          <div className="brand-title-group">
            <h1>
              SentimentIQ
              <span className="brand-badge">MERN Engine</span>
            </h1>
            <p className="brand-subtitle">
              Instant AFINN lexicon sentiment intelligence & bulk customer feedback analysis
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onSeed}
            disabled={isSeeding}
            title="Populate with 12 diverse positive, negative, and neutral reviews"
          >
            {isSeeding ? <span className="spinner" /> : <Sparkles size={15} style={{ color: '#a855f7' }} />}
            Load Sample Data
          </button>

          <a
            href="/sample_reviews.csv"
            download="sentiment_sample_reviews.csv"
            className="btn btn-secondary btn-sm"
            title="Download formatted sample CSV file"
          >
            <Download size={15} />
            Sample CSV
          </a>

          {totalCount > 0 && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onClearAll}
              disabled={isClearing}
              title="Delete all reviews from database"
            >
              {isClearing ? <span className="spinner" /> : <Trash2 size={15} />}
              Clear All
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
