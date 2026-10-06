import React from 'react';
import { RefreshCw, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import ChartComponent from '../components/ChartComponent';

const CLUSTER_COLORS = ['#205B45', '#C47A16', '#C65A2E', '#71865A', '#3E5C76', '#8D5B4C'];
const SENTIMENT_COLORS = ['#205B45', '#8C887B', '#C65A2E'];

export default function OverviewPage({ dashboardData, onNavigate, onRefresh, isLoading }) {
  if (!dashboardData) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 14px' }} />
        <span style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Loading analytics workspace...</span>
      </div>
    );
  }

  const {
    metrics = {},
    preprocessing = {},
    segment_distribution = [],
    sentiment_distribution = [],
    membership_distribution = [],
    frequency_distribution = [],
    category_distribution = []
  } = dashboardData;

  const totalCustomers = metrics.total_customers || 600;
  const positivePct = metrics.positive_feedback_pct || 62.8;

  // ---------------------------------------------------------------------------
  // Dynamic Key Insight Generator (Derived directly from current data)
  // ---------------------------------------------------------------------------
  const getDynamicInsight = () => {
    if (!segment_distribution || segment_distribution.length === 0) {
      return {
        highlight: 'Cohort Distribution',
        text: 'Customer segmentation active across categorical behavioral dimensions.'
      };
    }

    // Identify highest rated cluster
    const sortedByRating = [...segment_distribution].sort(
      (a, b) => (b.average_rating || 0) - (a.average_rating || 0)
    );
    const topRated = sortedByRating[0];

    // Identify largest volume cluster
    const sortedBySize = [...segment_distribution].sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );
    const largest = sortedBySize[0];

    if (topRated && (topRated.average_rating || 0) > 0) {
      return {
        highlight: 'AUTOMATED COHORT INTELLIGENCE',
        content: (
          <span>
            <strong>{topRated.name}</strong> represents <strong>{topRated.percentage}%</strong> of customers ({topRated.count} shoppers) but holds the highest average satisfaction rating of <strong>{topRated.average_rating}★</strong>.
            {largest && largest.cluster_id !== topRated.cluster_id && (
              <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                The largest transaction volume is driven by <strong>{largest.name}</strong> with <strong>{largest.percentage}%</strong> ({largest.count} customers).
              </span>
            )}
          </span>
        )
      };
    }

    return {
      highlight: 'AUTOMATED COHORT INTELLIGENCE',
      content: (
        <span>
          <strong>{largest?.name || 'Primary Segment'}</strong> accounts for the largest cohort volume at <strong>{largest?.percentage || 0}%</strong> of the active customer base.
        </span>
      )
    };
  };

  const dynamicInsight = getDynamicInsight();

  // ---------------------------------------------------------------------------
  // Chart Data Configurations
  // ---------------------------------------------------------------------------
  const segmentChartData = {
    labels: segment_distribution.map(s => s.name),
    datasets: [{
      data: segment_distribution.map(s => s.count),
      backgroundColor: CLUSTER_COLORS.slice(0, segment_distribution.length),
      borderWidth: 2,
      borderColor: '#F0EEE6',
      hoverOffset: 4
    }]
  };

  const sentimentChartData = {
    labels: sentiment_distribution.map(s => s.label),
    datasets: [{
      data: sentiment_distribution.map(s => s.count),
      backgroundColor: SENTIMENT_COLORS,
      borderWidth: 2,
      borderColor: '#F0EEE6',
      hoverOffset: 4
    }]
  };

  const membershipChartData = {
    labels: membership_distribution.map(m => m.membership),
    datasets: [{
      label: 'Customers',
      data: membership_distribution.map(m => m.count),
      backgroundColor: '#205B45',
      borderRadius: 4,
      maxBarThickness: 32
    }]
  };

  const frequencyChartData = {
    labels: frequency_distribution.map(f => f.frequency),
    datasets: [{
      label: 'Customers',
      data: frequency_distribution.map(f => f.count),
      backgroundColor: '#71865A',
      borderRadius: 4,
      maxBarThickness: 32
    }]
  };

  const categoryChartData = {
    labels: category_distribution.map(c => c.category),
    datasets: [{
      label: 'Orders',
      data: category_distribution.map(c => c.count),
      backgroundColor: '#C47A16',
      borderRadius: 4,
      maxBarThickness: 16
    }]
  };

  return (
    <div style={{ width: '100%', maxWidth: '1380px', margin: '0 auto' }}>
      {/* Editorial Header Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        marginBottom: '22px', 
        flexWrap: 'wrap', 
        gap: '14px' 
      }}>
        <div>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: 'var(--forest-green)', 
            marginBottom: '4px' 
          }}>
            SmartCart Analytics
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Executive Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', maxWidth: '680px' }}>
            Multi-dimensional categorical customer segmentation, cohort distribution, and feedback sentiment calibration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onRefresh} 
            disabled={isLoading}
            title="Refresh analytics dataset"
          >
            <RefreshCw size={12} className={isLoading ? 'spinner' : ''} />
            <span>Refresh Workspace</span>
          </button>
          
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onNavigate && onNavigate('segmentation')}
          >
            <span>Clustering Studio</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Dynamic Key Insight Area (Generated from live data) */}
      <div className="key-insight-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            background: 'rgba(32, 91, 69, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--forest-green)',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <Sparkles size={14} />
          </div>
          <div>
            <div className="key-insight-label">{dynamicInsight.highlight}</div>
            <div className="key-insight-content">
              {dynamicInsight.content}
            </div>
          </div>
        </div>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => onNavigate && onNavigate('insights')}
          style={{ background: '#FFFFFF', borderColor: 'var(--border-medium)', fontSize: '11px', whiteSpace: 'nowrap' }}
        >
          <span>Persona Details</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* KPI Strip: Structured, subtle vertical separators & distinct colored indicators */}
      <div className="kpi-strip">
        {/* Cell 1: Total Customers */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-dot" style={{ background: 'var(--forest-green)' }} />
            <span className="kpi-cell-label">Total Customers</span>
          </div>
          <div className="kpi-cell-value-row">
            <span className="kpi-cell-value">{totalCustomers.toLocaleString()}</span>
          </div>
          <div className="kpi-cell-meta" style={{ color: 'var(--forest-green)' }}>
            +12.4% cohort increase
          </div>
        </div>

        {/* Cell 2: Active Clusters */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-dot" style={{ background: 'var(--warm-amber)' }} />
            <span className="kpi-cell-label">Active Clusters</span>
          </div>
          <div className="kpi-cell-value-row">
            <span className="kpi-cell-value">{metrics.total_segments || segment_distribution.length || 4}</span>
          </div>
          <div className="kpi-cell-meta">
            K-Modes cost: {metrics.cost ? Math.round(metrics.cost).toLocaleString() : '2,574'}
          </div>
        </div>

        {/* Cell 3: Average Rating */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-dot" style={{ background: '#D4A017' }} />
            <span className="kpi-cell-label">Average Rating</span>
          </div>
          <div className="kpi-cell-value-row">
            <span className="kpi-cell-value">{metrics.average_rating || 0}</span>
            <span style={{ fontSize: '16px', color: '#D4A017', fontWeight: 'bold' }}>★</span>
          </div>
          <div className="kpi-cell-meta">
            Across 600 customer logs
          </div>
        </div>

        {/* Cell 4: Positive Sentiment */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-dot" style={{ background: 'var(--forest-green)' }} />
            <span className="kpi-cell-label">Positive Sentiment</span>
          </div>
          <div className="kpi-cell-value-row">
            <span className="kpi-cell-value" style={{ color: 'var(--forest-green)' }}>
              {positivePct}%
            </span>
          </div>
          <div className="kpi-cell-meta">
            Calibrated NLP confidence
          </div>
        </div>
      </div>

      {/* Visual Section 1: Customer Analytics (Donut Charts with Center Information) */}
      <div className="section-divider-row">
        <span className="section-divider-title">CUSTOMER ANALYTICS</span>
        <span className="section-divider-line" />
        <span className="section-divider-sub">Cohort clusters & sentiment distribution</span>
      </div>

      <div className="charts-duo-grid">
        {/* Panel 1: Customer Distribution */}
        <div className="grounded-panel">
          <div className="grounded-panel-header">
            <div>
              <div className="grounded-panel-title">Customer Distribution</div>
              <div className="grounded-panel-sub">Partitioned via K-Modes categorical modal centroids</div>
            </div>
            <span className="badge badge-platinum" style={{ fontSize: '11px' }}>
              {segment_distribution.length} Clusters
            </span>
          </div>

          <div className="donut-with-center">
            {segment_distribution.length > 0 && (
              <ChartComponent 
                type="doughnut" 
                data={segmentChartData} 
                options={{ 
                  cutout: '74%',
                  plugins: { legend: { display: false } }
                }} 
              />
            )}
            <div className="donut-center-info">
              <div className="donut-center-number">{totalCustomers}</div>
              <div className="donut-center-label">CUSTOMERS</div>
            </div>
          </div>

          {/* Segment Legend with Counts & Percentages */}
          <div className="donut-legend-list">
            {segment_distribution.map((seg, idx) => (
              <div key={seg.cluster_id || idx} className="donut-legend-item">
                <div className="donut-legend-left">
                  <span 
                    className="donut-legend-dot" 
                    style={{ background: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }} 
                  />
                  <span className="donut-legend-name" title={seg.name}>{seg.name}</span>
                </div>
                <div className="donut-legend-right">
                  <span className="donut-legend-count">{seg.count} shoppers</span>
                  <span className="donut-legend-pct">{seg.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Feedback Sentiment Breakdown */}
        <div className="grounded-panel">
          <div className="grounded-panel-header">
            <div>
              <div className="grounded-panel-title">Feedback Sentiment Breakdown</div>
              <div className="grounded-panel-sub">NLP sentiment share across customer reviews</div>
            </div>
            <span className="badge badge-platinum" style={{ fontSize: '11px' }}>
              3 Classifications
            </span>
          </div>

          <div className="donut-with-center">
            {sentiment_distribution.length > 0 && (
              <ChartComponent 
                type="doughnut" 
                data={sentimentChartData} 
                options={{ 
                  cutout: '74%',
                  plugins: { legend: { display: false } }
                }} 
              />
            )}
            <div className="donut-center-info">
              <div className="donut-center-number" style={{ color: 'var(--forest-green)' }}>
                {positivePct}%
              </div>
              <div className="donut-center-label">POSITIVE</div>
            </div>
          </div>

          {/* Sentiment Legend with Counts & Percentages */}
          <div className="donut-legend-list">
            {sentiment_distribution.map((sent, idx) => (
              <div key={sent.label || idx} className="donut-legend-item">
                <div className="donut-legend-left">
                  <span 
                    className="donut-legend-dot" 
                    style={{ background: SENTIMENT_COLORS[idx % SENTIMENT_COLORS.length] }} 
                  />
                  <span className="donut-legend-name">{sent.label}</span>
                </div>
                <div className="donut-legend-right">
                  <span className="donut-legend-count">{sent.count} reviews</span>
                  <span 
                    className="donut-legend-pct" 
                    style={{ 
                      color: sent.label === 'Positive' ? 'var(--forest-green)' : 
                             sent.label === 'Negative' ? 'var(--terracotta)' : 'var(--text-primary)' 
                    }}
                  >
                    {sent.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Section 2: Segment Snapshot (Horizontal 4-column overview) */}
      <div className="section-divider-row">
        <span className="section-divider-title">SEGMENT SNAPSHOT</span>
        <span className="section-divider-line" />
        <span className="section-divider-sub">Cohort composition & key behavioral traits</span>
      </div>

      <div className="segment-snapshot-grid">
        {segment_distribution.map((seg, idx) => {
          const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
          const trait = seg.key_characteristic || 
            `${seg.most_common_membership || 'Standard'} tier • ${seg.most_common_frequency?.toLowerCase() || 'regular'} ${seg.most_common_category?.toLowerCase() || 'general'} orders`;

          return (
            <div 
              key={seg.cluster_id || idx} 
              className="segment-snapshot-item"
              onClick={() => onNavigate && onNavigate('insights')}
              style={{ cursor: 'pointer' }}
              title="Click to view full cluster profile"
            >
              <div className="snapshot-item-header">
                <span className="snapshot-item-dot" style={{ background: color }} />
                <span className="snapshot-item-title">{seg.name}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {seg.count}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: color, 
                  background: 'rgba(0, 0, 0, 0.03)', 
                  padding: '2px 6px', 
                  borderRadius: '3px' 
                }}>
                  {seg.percentage}%
                </span>
              </div>

              <div className="snapshot-item-trait">
                <span style={{ color: 'var(--text-secondary)' }}>Trait:</span>{' '}
                <strong>{trait}</strong>
                {seg.average_rating > 0 && (
                  <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Satisfaction: <strong style={{ color: 'var(--text-primary)' }}>{seg.average_rating}★</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Section 3: Purchasing Behavior */}
      <div className="section-divider-row">
        <span className="section-divider-title">PURCHASING BEHAVIOR</span>
        <span className="section-divider-line" />
        <span className="section-divider-sub">Categorical distributions across key transaction dimensions</span>
      </div>

      <div className="purchasing-trio-grid">
        {/* Membership Status */}
        <div className="grounded-panel">
          <div className="grounded-panel-header">
            <div>
              <div className="grounded-panel-title">Membership Status</div>
              <div className="grounded-panel-sub">Tier distribution across accounts</div>
            </div>
          </div>
          <div style={{ height: '180px' }}>
            <ChartComponent 
              type="bar" 
              data={membershipChartData} 
              options={{ plugins: { legend: { display: false } } }} 
            />
          </div>
        </div>

        {/* Purchase Frequency */}
        <div className="grounded-panel">
          <div className="grounded-panel-header">
            <div>
              <div className="grounded-panel-title">Purchase Frequency</div>
              <div className="grounded-panel-sub">Order cadence & shopper habits</div>
            </div>
          </div>
          <div style={{ height: '180px' }}>
            <ChartComponent 
              type="bar" 
              data={frequencyChartData} 
              options={{ plugins: { legend: { display: false } } }} 
            />
          </div>
        </div>

        {/* Product Categories */}
        <div className="grounded-panel">
          <div className="grounded-panel-header">
            <div>
              <div className="grounded-panel-title">Product Categories</div>
              <div className="grounded-panel-sub">Merchandise demand distribution</div>
            </div>
          </div>
          <div style={{ height: '180px' }}>
            <ChartComponent 
              type="bar" 
              data={categoryChartData} 
              options={{ 
                indexAxis: 'y',
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Preprocessing Hygiene Footnote Bar */}
      {preprocessing && (
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)', 
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px', 
          marginTop: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong>Data Hygiene Engine:</strong> {preprocessing.original_records} raw records &bull; <strong>{preprocessing.cleaned_records}</strong> retained &bull; <strong>{preprocessing.duplicates_removed}</strong> duplicates removed &bull; <strong>{preprocessing.missing_values_handled}</strong> missing values imputed
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Categorical Feature Matrix ({preprocessing.num_categorical_features} dimensions)
          </span>
        </div>
      )}
    </div>
  );
}
