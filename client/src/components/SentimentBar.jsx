import React from 'react';

export const SentimentBar = ({ stats }) => {
  const total = stats?.total || 0;
  const posPct = stats?.positivePercent || 0;
  const neuPct = stats?.neutralPercent || 0;
  const negPct = stats?.negativePercent || 0;

  if (total === 0) return null;

  return (
    <div className="glass-card sentiment-bar-container">
      <div className="sentiment-bar-header">
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          Sentiment Distribution
        </span>
        <span>{total} Total Submissions</span>
      </div>

      <div className="sentiment-bar-track">
        {posPct > 0 && (
          <div
            className="bar-segment positive"
            style={{ width: `${posPct}%` }}
            title={`Positive: ${stats.positive} (${posPct}%)`}
          />
        )}
        {neuPct > 0 && (
          <div
            className="bar-segment neutral"
            style={{ width: `${neuPct}%` }}
            title={`Neutral: ${stats.neutral} (${neuPct}%)`}
          />
        )}
        {negPct > 0 && (
          <div
            className="bar-segment negative"
            style={{ width: `${negPct}%` }}
            title={`Negative: ${stats.negative} (${negPct}%)`}
          />
        )}
      </div>

      <div className="sentiment-legend">
        <div className="legend-item">
          <div className="legend-dot pos" />
          <span>Positive: {stats.positive || 0} ({posPct}%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot neu" />
          <span>Neutral: {stats.neutral || 0} ({neuPct}%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot neg" />
          <span>Negative: {stats.negative || 0} ({negPct}%)</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentBar;
