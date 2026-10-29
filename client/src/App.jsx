import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import SentimentBar from './components/SentimentBar';
import ReviewForm from './components/ReviewForm';
import FilterBar from './components/FilterBar';
import ReviewList from './components/ReviewList';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    positivePercent: 0,
    negativePercent: 0,
    neutralPercent: 0,
    averageScore: 0,
  });

  // Reviews list state
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);

  // Filters & sorting state
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  // Status flags
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const statsData = await api.getStats();
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Fetch paginated & filtered reviews from backend
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews({
        page: currentPage,
        limit,
        sentiment: selectedSentiment,
        search,
        sort: sortBy,
      });

      setReviews(data.reviews || []);
      setTotalCount(data.count || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      showToast(err.message || 'Failed to load reviews.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, selectedSentiment, search, sortBy]);

  // Initial load and filter change trigger
  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, [fetchReviews]);

  // Handle single review submission
  const handleReviewAdded = async (text) => {
    const res = await api.createReview(text);
    showToast(`Review analyzed: ${res.data.label} (Score: ${res.data.score > 0 ? '+' : ''}${res.data.score})`);
    setCurrentPage(1);
    fetchStats();
    fetchReviews();
  };

  // Handle bulk CSV upload
  const handleBulkUploaded = async (file) => {
    const res = await api.uploadCSV(file);
    showToast(`Batch processed: ${res.count} reviews analyzed successfully!`);
    setCurrentPage(1);
    fetchStats();
    fetchReviews();
  };

  // Handle delete review
  const handleDelete = async (id) => {
    await api.deleteReview(id);
    showToast('Review removed from database.');
    fetchStats();
    fetchReviews();
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all customer reviews?')) return;
    setIsClearing(true);
    try {
      await api.clearAllReviews();
      showToast('All reviews cleared.');
      setCurrentPage(1);
      fetchStats();
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Failed to clear reviews', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // Handle sample dataset seed
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedReviews();
      showToast(`Loaded ${res.count} sample reviews with sentiment analysis!`);
      setCurrentPage(1);
      fetchStats();
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Failed to seed sample data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSelectedSentiment('all');
    setSearch('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedSentiment !== 'all' || search.trim().length > 0 || sortBy !== 'newest';

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        onSeed={handleSeed}
        onClearAll={handleClearAll}
        totalCount={stats?.total || 0}
        isSeeding={isSeeding}
        isClearing={isClearing}
      />

      {/* Aggregate Stats Cards */}
      <StatsCards stats={stats} />

      {/* Sentiment Mood Distribution Bar */}
      <SentimentBar stats={stats} />

      {/* Main Grid: Form on Left, Review Feed & Filters on Right */}
      <main className="main-layout">
        <section>
          <ReviewForm
            onReviewAdded={handleReviewAdded}
            onBulkUploaded={handleBulkUploaded}
          />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            selectedSentiment={selectedSentiment}
            onSentimentChange={(val) => {
              setSelectedSentiment(val);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortChange={(val) => {
              setSortBy(val);
              setCurrentPage(1);
            }}
            totalCount={totalCount}
          />

          <ReviewList
            reviews={reviews}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onDelete={handleDelete}
            onSeed={handleSeed}
            isSeeding={isSeeding}
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>

      {/* Toast Alerts */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: '#34d399' }} />
            ) : (
              <AlertCircle size={18} style={{ color: '#f87171' }} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
