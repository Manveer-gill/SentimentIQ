import React from 'react';
import { Layers, ThumbsUp, ThumbsDown, MinusCircle, TrendingUp } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  const total = stats?.total || 0;
  const positive = stats?.positive || 0;
  const negative = stats?.negative || 0;
  const neutral = stats?.neutral || 0;

  const positivePercent = stats?.positivePercent || 0;
  const negativePercent = stats?.negativePercent || 0;
  const neutralPercent = stats?.neutralPercent || 0;
  const avgScore = stats?.averageScore !== undefined ? stats.averageScore : 0;

  return (
    <div className="stats-grid">
      {/* Total Card */}
      <div className="glass-card stat-card total">
        <div className="stat-header">
          <span className="stat-title">Total Analyzed</span>
          <div className="stat-icon">
            <Layers size={18} />
          </div>
        </div>
        <div className="stat-body">
          <span className="stat-value">{total.toLocaleString()}</span>
          <span className="stat-percentage">
            Avg Score: {avgScore > 0 ? `+${avgScore}` : avgScore}
          </span>
        </div>
      </div>

      {/* Positive Card */}
      <div className="glass-card stat-card positive">
        <div className="stat-header">
          <span className="stat-title">Positive Reviews</span>
          <div className="stat-icon">
            <ThumbsUp size={18} />
          </div>
        </div>
        <div className="stat-body">
          <span className="stat-value">{positive.toLocaleString()}</span>
          <span className="stat-percentage">{positivePercent}%</span>
        </div>
      </div>

      {/* Negative Card */}
      <div className="glass-card stat-card negative">
        <div className="stat-header">
          <span className="stat-title">Negative Reviews</span>
          <div className="stat-icon">
            <ThumbsDown size={18} />
          </div>
        </div>
        <div className="stat-body">
          <span className="stat-value">{negative.toLocaleString()}</span>
          <span className="stat-percentage">{negativePercent}%</span>
        </div>
      </div>

      {/* Neutral Card */}
      <div className="glass-card stat-card neutral">
        <div className="stat-header">
          <span className="stat-title">Neutral Feedback</span>
          <div className="stat-icon">
            <MinusCircle size={18} />
          </div>
        </div>
        <div className="stat-body">
          <span className="stat-value">{neutral.toLocaleString()}</span>
          <span className="stat-percentage">{neutralPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
