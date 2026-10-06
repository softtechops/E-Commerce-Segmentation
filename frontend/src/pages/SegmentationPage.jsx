import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { runSegmentation, fetchClusters } from '../api';

const CLUSTER_COLORS = [
  '#1B4332', // Deep Forest Green
  '#B45309', // Warm Amber
  '#C2410C', // Terracotta
  '#588157', // Muted Olive
  '#3E5C76', // Slate Blue
  '#8D5B4C'  // Muted Ochre
];

export default function SegmentationPage({ 
  onRefreshDashboard, 
  onNotify,
  onNavigate 
}) {
  const [nClusters, setNClusters] = useState(4);
  const [clusterData, setClusterData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const loadClusters = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClusters();
      if (data.success && data.segmentation) {
        setClusterData(data.segmentation);
        setNClusters(data.segmentation.n_clusters || 4);
      }
    } catch (err) {
      console.warn('Failed to load clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleRunClustering = async () => {
    setIsRunning(true);
    try {
      const res = await runSegmentation(nClusters);
      if (res.success && res.segmentation) {
        setClusterData(res.segmentation);
        onNotify('success', `K-Modes converged with ${nClusters} clusters (Cost: ${Math.round(res.segmentation.cost).toLocaleString()}).`);
        if (onRefreshDashboard) onRefreshDashboard();
      } else {
        onNotify('error', res.error || 'Failed to execute clustering.');
      }
    } catch (err) {
      onNotify('error', 'Server error while running clustering.');
    } finally {
      setIsRunning(false);
    }
  };

  const profiles = clusterData?.profiles || [];
  const cost = clusterData?.cost;
  const totalCustomers = clusterData?.total_customers || 0;
  const maxCustomerCount = Math.max(...profiles.map(p => p.customer_count), 1);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* 1. Header & Summary Stats */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Segmentation
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '14px' }}>
          Understand how your customers naturally group together from categorical shopping behavior.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profiles.length || nClusters} clusters</span>
          <span>&bull;</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{totalCustomers.toLocaleString()} customers</span>
          <span>&bull;</span>
          <span>K-Modes (Huang Initialization & Hamming Distance)</span>
        </div>
      </div>

      {/* 2. Model Settings Row (Integrated, whitespace-driven, NO giant box) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Clusters:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[2, 3, 4, 5, 6].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setNClusters(k)}
                style={{
                  width: '32px',
                  height: '30px',
                  borderRadius: '5px',
                  border: nClusters === k ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: nClusters === k ? 'var(--accent-primary)' : '#FFFFFF',
                  color: nClusters === k ? '#F7F5F0' : 'var(--text-secondary)',
                  fontWeight: nClusters === k ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {k}
              </button>
            ))}
          </div>

          <span style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 6px' }} />

          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Objective cost: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{cost ? Math.round(cost).toLocaleString() : '2,574'}</strong>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ padding: '8px 18px', fontSize: '13px' }}
          onClick={handleRunClustering}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <div className="spinner" style={{ borderTopColor: '#FFFFFF' }} /> Partitioning Modes...
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" /> Run Segmentation
            </>
          )}
        </button>
      </div>

      {/* 3. Customer Segments List (Editorial row layout) */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em', 
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Customer Segments ({profiles.length})</span>
          <button 
            onClick={() => onNavigate('insights')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-primary)', 
              fontSize: '12px', 
              fontWeight: 500, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Explore Marketing Playbooks &rarr;
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 8px' }} />
            Evaluating modal centroids...
          </div>
        ) : (
          <div className="cluster-list-container">
            {profiles.map((p, idx) => (
              <div key={p.cluster_id} className="cluster-row-item">
                {/* 01, 02 number */}
                <div className="cluster-idx">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Name & Count */}
                <div className="cluster-identity">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] 
                      }} 
                    />
                    <span className="cluster-identity-name">{p.segment_name}</span>
                  </div>
                  <div className="cluster-identity-count">
                    {p.customer_count.toLocaleString()} customers &bull; {p.percentage}%
                  </div>
                </div>

                {/* Key Categorical Traits */}
                <div className="cluster-traits-line">
                  <div>
                    <strong>{p.most_common_membership}</strong> &bull; {p.most_common_frequency} &bull; {p.most_common_category}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '2px' }}>
                    Preferred payment: {p.most_common_payment} &bull; Discount: {p.most_common_discount}
                  </div>
                </div>

                {/* Rating */}
                <div className="cluster-rating-box">
                  <div className="cluster-rating-num">{p.average_rating} ★</div>
                  <div className="cluster-rating-label">average rating</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Cluster Size Visuals (Organic, integrated horizontal bars) */}
      <div style={{ paddingBottom: '36px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em', 
          color: 'var(--text-secondary)',
          marginBottom: '16px' 
        }}>
          Cluster Size Distribution
        </div>

        <div className="cluster-bars-block">
          {profiles.map((p, idx) => {
            const barPct = (p.customer_count / maxCustomerCount) * 100;
            const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
            return (
              <div key={p.cluster_id} className="cluster-bar-row">
                <div className="cluster-bar-label" title={p.segment_name}>
                  {p.segment_name}
                </div>
                <div className="cluster-bar-track">
                  <div 
                    className="cluster-bar-fill" 
                    style={{ 
                      width: `${barPct}%`,
                      backgroundColor: color
                    }} 
                  />
                </div>
                <div className="cluster-bar-pct">
                  <strong>{p.percentage}%</strong> ({p.customer_count})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Optional Detailed Table Toggle (Airy, clean, subtle horizontal dividers) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button 
            type="button" 
            onClick={() => setShowTable(!showTable)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              fontSize: '12.5px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            {showTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{showTable ? 'Hide Detailed Mode Centroid Matrix' : 'View Detailed Mode Centroid Matrix'}</span>
          </button>
        </div>

        {showTable && (
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Cluster</th>
                <th>Segment Name</th>
                <th>Customers</th>
                <th>Share</th>
                <th>Membership</th>
                <th>Frequency</th>
                <th>Category</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.cluster_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    #{p.cluster_id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.segment_name}</td>
                  <td>{p.customer_count.toLocaleString()}</td>
                  <td>{p.percentage}%</td>
                  <td>{p.most_common_membership}</td>
                  <td>{p.most_common_frequency}</td>
                  <td>{p.most_common_category}</td>
                  <td>{p.most_common_payment}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{p.average_rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
