import React, { useState, useRef } from 'react';
import { Send, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const ReviewForm = ({ onReviewAdded, onBulkUploaded }) => {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  // Single review state
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Bulk CSV state
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Single Review Submit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setSingleError('Please enter review text before analyzing.');
      return;
    }
    setSingleError('');
    setIsSubmitting(true);

    try {
      await onReviewAdded(text.trim());
      setText('');
    } catch (err) {
      setSingleError(err.message || 'Failed to analyze and save review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setBulkError('');
    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setBulkError('Please select a valid .csv file.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setBulkError('File size exceeds maximum 5MB limit.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  // Handle Bulk Upload Submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setBulkError('Please select or drop a CSV file.');
      return;
    }
    setBulkError('');
    setIsUploading(true);

    try {
      await onBulkUploaded(file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setBulkError(err.message || 'Failed to process CSV bulk upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card">
      {/* Tab Switcher */}
      <div className="tab-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          <FileText size={16} />
          Single Review
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          <Upload size={16} />
          Bulk CSV Upload
        </button>
      </div>

      {/* Tab 1: Single Review Input */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="review-input">
              Enter Customer Feedback / Review
            </label>
            <textarea
              id="review-input"
              className="text-area"
              placeholder="e.g. 'The product quality exceeded my expectations and delivery was super fast!'"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (singleError) setSingleError('');
              }}
              rows={4}
              maxLength={5000}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>AFINN Lexicon Engine scores instantly</span>
              <span>{text.length} / 5000</span>
            </div>
          </div>

          {singleError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertCircle size={15} />
              {singleError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {text && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setText(''); setSingleError(''); }}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Analyze & Save Review
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Bulk CSV Upload */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit}>
          <div className="form-group">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="csv-file-input"
            />

            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">
                <Upload size={22} />
              </div>
              <div>
                <p className="dropzone-text">
                  {file ? file.name : 'Click to select or drag & drop CSV file'}
                </p>
                <p className="dropzone-subtext">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB — Ready to analyze`
                    : 'Supports .csv files with headers (e.g. text, review, feedback)'}
                </p>
              </div>
            </div>
          </div>

          {bulkError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertCircle size={15} />
              {bulkError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <a
              href="/sample_reviews.csv"
              download="sample_reviews.csv"
              style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'underline' }}
            >
              Need a sample CSV? Download here
            </a>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <>
                  <span className="spinner" />
                  Processing Batch...
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Analyze CSV Batch
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
