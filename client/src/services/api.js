/**
 * SentimentIQ API Service
 * Encapsulates all backend communication
 */

const BASE_URL = '/api';

export const api = {
  /**
   * Fetch paginated & filtered reviews
   */
  async getReviews(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sentiment && params.sentiment !== 'all') query.append('sentiment', params.sentiment);
    if (params.label && params.label !== 'all') query.append('label', params.label);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${BASE_URL}/reviews?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');
    return data;
  },

  /**
   * Fetch aggregate sentiment statistics
   */
  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch sentiment stats');
    return data.stats;
  },

  /**
   * Analyze and submit a single review
   */
  async createReview(text) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to analyze review');
    return data;
  },

  /**
   * Upload CSV file for batch processing
   */
  async uploadCSV(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/reviews/bulk`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to upload CSV batch');
    return data;
  },

  /**
   * Delete a single review by ID
   */
  async deleteReview(id) {
    const res = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete review');
    return data;
  },

  /**
   * Clear all reviews in the database
   */
  async clearAllReviews() {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clear reviews');
    return data;
  },

  /**
   * Seed realistic sample reviews
   */
  async seedReviews() {
    const res = await fetch(`${BASE_URL}/reviews/seed`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to seed sample reviews');
    return data;
  },
};
