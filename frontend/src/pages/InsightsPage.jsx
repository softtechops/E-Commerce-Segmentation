import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Sliders } from 'lucide-react';
import { fetchClusters } from '../api';

const CLUSTER_COLORS = [
  '#1B4332', // Deep Forest Green
  '#B45309', // Warm Amber
  '#C2410C', // Terracotta
  '#588157', // Muted Olive
  '#3E5C76', // Slate Blue
  '#8D5B4C'  // Muted Ochre
];

export default function InsightsPage({ onNavigate }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadClusterInsights = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClusters();
      if (data.success && data.segmentation) {
        setProfiles(data.segmentation.profiles || []);
      }
    } catch (err) {
      console.warn('Failed to load cluster insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusterInsights();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 10px' }} />
        <span>Synthesizing cluster persona profiles...</span>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <p style={{ marginBottom: '14px' }}>No cluster insights computed yet.</p>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('segmentation')}>
          Run K-Modes Segmentation
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Editorial Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '3px' }}>
            Cluster Personas & Strategic Playbooks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Actionable customer archetypes derived from K-Modes modal centroids and feedback sentiment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadClusterInsights}>
            <RefreshCw size={12} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('predict')}>
            <Target size={12} /> Test Prediction
          </button>
        </div>
      </div>

      {/* Structured Editorial Cards Grid */}
      <div className="insights-grid">
        {profiles.map((p, idx) => {
          const accentColor = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
          return (
            <div key={p.cluster_id} className="insight-editorial-item" style={{ borderTopColor: accentColor }}>
              {/* Header */}
              <div className="insight-header">
                <div>
                  <div className="insight-name">
                    {p.segment_name}
                  </div>
                  <div className="insight-meta">
                    Cluster #{p.cluster_id} &bull; <strong>{p.customer_count.toLocaleString()}</strong> customers ({p.percentage}% share)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.average_rating} ★
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>avg rating</div>
                </div>
              </div>

              {/* Behavioral Narrative */}
              <p className="insight-summary">
                {p.profile_description}
              </p>

              {/* Attributes Key-Value Table */}
              <table className="insight-attributes-table">
                <tbody>
                  <tr>
                    <td className="attr-label">Membership Tier</td>
                    <td className="attr-val" style={{ color: 'var(--accent-amber)' }}>{p.most_common_membership}</td>
                  </tr>
                  <tr>
                    <td className="attr-label">Purchase Frequency</td>
                    <td className="attr-val">{p.most_common_frequency}</td>
                  </tr>
                  <tr>
                    <td className="attr-label">Product Category</td>
                    <td className="attr-val">{p.most_common_category}</td>
                  </tr>
                  <tr>
                    <td className="attr-label">Payment Method</td>
                    <td className="attr-val">{p.most_common_payment}</td>
                  </tr>
                  <tr>
                    <td className="attr-label">Discount Usage</td>
                    <td className="attr-val">{p.most_common_discount}</td>
                  </tr>
                  <tr>
                    <td className="attr-label">Sentiment Favorable</td>
                    <td className="attr-val" style={{ color: 'var(--status-positive)' }}>
                      {p.sentiment_distribution?.positive_percentage}% positive
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Actionable Strategy Callout */}
              <div className="insight-strategy-box">
                <div className="insight-strategy-label">
                  Recommended Business Strategy
                </div>
                <div className="insight-strategy-text">
                  {p.business_recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
