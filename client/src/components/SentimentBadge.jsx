import React from 'react';
import { Smile, Frown, Meh, Sparkles, AlertTriangle } from 'lucide-react';

export const SentimentBadge = ({ label, sentiment, score, showIcon = true, showScore = false }) => {
  const currentLabel = label || sentiment || 'Neutral';

  // Normalize class name
  let badgeClass = 'neutral';
  let IconComponent = Meh;

  if (currentLabel === 'Strongly Positive') {
    badgeClass = 'strongly-positive';
    IconComponent = Sparkles;
  } else if (currentLabel === 'Positive') {
    badgeClass = 'positive';
    IconComponent = Smile;
  } else if (currentLabel === 'Mildly Negative' || currentLabel === 'Negative') {
    badgeClass = 'negative';
    IconComponent = Frown;
  } else if (currentLabel === 'Strongly Negative') {
    badgeClass = 'strongly-negative';
    IconComponent = AlertTriangle;
  }

  const scoreClass = score > 0 ? 'pos' : score < 0 ? 'neg' : 'neu';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span className={`sentiment-badge ${badgeClass}`}>
        {showIcon && <IconComponent size={13} />}
        {currentLabel}
      </span>
      {showScore && typeof score === 'number' && (
        <span className={`score-badge ${scoreClass}`} title={`AFINN Score: ${score > 0 ? '+' : ''}${score}`}>
          {score > 0 ? `+${score}` : score}
        </span>
      )}
    </div>
  );
};

export default SentimentBadge;
