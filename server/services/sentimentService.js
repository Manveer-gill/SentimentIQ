const Sentiment = require('sentiment');

// Initialize the lightweight AFINN-165 sentiment engine
const sentimentInstance = new Sentiment();

/**
 * Maps a numeric sentiment score to a human-readable qualitative label
 * @param {number} score - The total AFINN score
 * @returns {string} - Descriptive label
 */
const getSentimentLabel = (score) => {
  if (score >= 4) {
    return 'Strongly Positive';
  } else if (score >= 1) {
    return 'Positive';
  } else if (score === 0) {
    return 'Neutral';
  } else if (score >= -3) {
    return 'Mildly Negative';
  } else {
    return 'Strongly Negative';
  }
};

/**
 * Determines primary sentiment category from score
 * @param {number} score - The total AFINN score
 * @returns {'Positive' | 'Negative' | 'Neutral'}
 */
const getSentimentCategory = (score) => {
  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
};

/**
 * Analyzes text synchronously using AFINN lexicon rules
 * @param {string} text - Review text to score
 * @returns {object} - { text, sentiment, score, comparative, label, positiveWords, negativeWords }
 */
const analyzeText = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Valid review text is required for sentiment analysis.');
  }

  const cleanText = text.trim();
  const analysis = sentimentInstance.analyze(cleanText);

  const score = analysis.score;
  const comparative = parseFloat(analysis.comparative.toFixed(3));
  const sentiment = getSentimentCategory(score);
  const label = getSentimentLabel(score);

  // Extract unique matched positive and negative keywords
  const positiveWords = [...new Set(analysis.positive || [])];
  const negativeWords = [...new Set(analysis.negative || [])];

  return {
    text: cleanText,
    sentiment,
    score,
    comparative,
    label,
    positiveWords,
    negativeWords,
  };
};

module.exports = {
  analyzeText,
  getSentimentLabel,
  getSentimentCategory,
};
