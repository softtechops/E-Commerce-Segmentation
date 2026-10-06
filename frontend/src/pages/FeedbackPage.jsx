import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchFeedback } from '../api';
import ChartComponent from '../components/ChartComponent';

export default function FeedbackPage({ onNotify }) {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const loadFeedback = async (searchQuery = search, filterVal = sentimentFilter) => {
    setIsLoading(true);
    try {
      const data = await fetchFeedback({
        search: searchQuery,
        sentiment: filterVal === 'All' ? '' : filterVal
      });
      if (data.success) {
        setSummary(data.summary);
        setReviews(data.reviews || []);
        setTotalReviews(data.total_reviews || 0);
      } else {
        onNotify('error', data.error || 'Failed to load feedback analytics.');
      }
    } catch (err) {
      onNotify('error', 'Error connecting to feedback API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFeedback(search, sentimentFilter);
  };

  const handleFilterChange = (filterVal) => {
    setSentimentFilter(filterVal);
    loadFeedback(search, filterVal);
  };

  const sentimentChartData = summary ? {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [summary.positive_count, summary.neutral_count, summary.negative_count],
      backgroundColor: ['#2D6A4F', '#8E8E93', '#991B1B'],
      borderWidth: 2,
      borderColor: '#F7F5F0'
    }]
  } : null;

  const ratingDist = summary?.rating_distribution || {};
  const ratingChartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      label: 'Reviews',
      data: [
        ratingDist['1'] || 0,
        ratingDist['2'] || 0,
        ratingDist['3'] || 0,
        ratingDist['4'] || 0,
        ratingDist['5'] || 0
      ],
      backgroundColor: ['#991B1B', '#C2410C', '#8E8E93', '#588157', '#1B4332'],
      borderRadius: 4,
      maxBarThickness: 28
    }]
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Customer Feedback Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
          Lexicon sentiment classification and rating distribution across verified customer purchases.
        </p>
      </div>

      {/* KPI Row (Airy, clean horizontal stats) */}
      <div className="feedback-kpi-bar">
        <div className="feedback-stat-cell">
          <div className="label">Positive Sentiment</div>
          <div className="value" style={{ color: 'var(--status-positive)' }}>
            {summary?.positive_percentage || 0}%
          </div>
          <div className="meta">
            {summary?.positive_count?.toLocaleString() || 0} reviews
          </div>
        </div>

        <div className="feedback-stat-cell">
          <div className="label">Neutral Sentiment</div>
          <div className="value" style={{ color: 'var(--text-secondary)' }}>
            {summary?.neutral_percentage || 0}%
          </div>
          <div className="meta">
            {summary?.neutral_count?.toLocaleString() || 0} reviews
          </div>
        </div>

        <div className="feedback-stat-cell">
          <div className="label">Negative Sentiment</div>
          <div className="value" style={{ color: 'var(--status-negative)' }}>
            {summary?.negative_percentage || 0}%
          </div>
          <div className="meta">
            {summary?.negative_count?.toLocaleString() || 0} reviews
          </div>
        </div>

        <div className="feedback-stat-cell">
          <div className="label">Average Rating</div>
          <div className="value">
            {summary?.average_rating || 0} <span style={{ fontSize: '15px', color: 'var(--accent-amber)' }}>★</span>
          </div>
          <div className="meta">
            From {summary?.total_feedback?.toLocaleString() || 0} total evaluations
          </div>
        </div>
      </div>

      {/* Charts Row: Left Sentiment Distribution, Right Rating Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '36px', marginBottom: '40px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
            Sentiment Distribution
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Classification ratio across total feedback
          </div>
          <div style={{ height: '200px' }}>
            {sentimentChartData && (
              <ChartComponent 
                type="doughnut" 
                data={sentimentChartData} 
                options={{ cutout: '72%' }} 
              />
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
            Rating Distribution
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Review volume per star rating level (1 to 5)
          </div>
          <div style={{ height: '200px' }}>
            <ChartComponent 
              type="bar" 
              data={ratingChartData}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      </div>

      {/* Feedback Logs Table (No outer rectangular box framing) */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Feedback Logs
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Showing {reviews.length} filtered review entries
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '200px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search feedback..."
                className="form-control"
                style={{ paddingLeft: '28px', height: '30px', fontSize: '12px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <div style={{ display: 'flex', gap: '4px' }}>
              {['All', 'Positive', 'Neutral', 'Negative'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleFilterChange(type)}
                  className={`btn btn-sm ${sentimentFilter === type ? 'btn-primary' : 'btn-outline'}`}
                  style={{ height: '30px', padding: '0 8px', fontSize: '12px' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Customer ID</th>
              <th>Feedback Text</th>
              <th style={{ width: '110px' }}>Sentiment</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto 8px' }} />
                  Loading feedback logs...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  No reviews match criteria.
                </td>
              </tr>
            ) : (
              reviews.map(r => (
                <tr key={r.Customer_ID}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {r.Customer_ID}
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>
                    "{r.Feedback}"
                  </td>
                  <td>
                    <span className={`badge ${
                      r.Sentiment === 'Positive' ? 'badge-positive' :
                      r.Sentiment === 'Negative' ? 'badge-negative' : 'badge-neutral'
                    }`}>
                      {r.Sentiment}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--accent-amber)', fontWeight: 500 }}>
                    {r.Rating} ★
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
