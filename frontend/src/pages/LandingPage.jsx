import React from 'react';
import { 
  Layers, 
  MessageSquare, 
  Target, 
  ArrowRight, 
  Database,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage({ onNavigate, onLoadDemo, isDemoLoading }) {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0 40px' }}>
      {/* Editorial Hero */}
      <div style={{ paddingBottom: '36px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '40px' }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em', 
          color: 'var(--accent-primary)',
          marginBottom: '12px' 
        }}>
          Unsupervised Categorical Machine Learning
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          marginBottom: '14px',
          maxWidth: '720px'
        }}>
          Understand your customers from discrete categorical shopping patterns.
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          SmartCart groups customers through K-Modes clustering with Hamming dissimilarity and deterministic feedback sentiment analytics—revealing meaningful shopper personas without one-hot distortion.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '9px 20px', fontSize: '13px' }}
            onClick={() => onNavigate('segmentation')}
          >
            Explore Segmentation <ArrowRight size={13} />
          </button>

          <button 
            className="btn btn-secondary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
            onClick={onLoadDemo}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? (
              <>
                <div className="spinner" /> Ingesting Cohort...
              </>
            ) : (
              <>
                <Database size={13} /> Load 600-Record Dataset
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editorial Key Highlights */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em', 
          color: 'var(--text-secondary)',
          marginBottom: '20px' 
        }}>
          Core Methodology & Capabilities
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          <div style={{ borderTop: '2px solid var(--accent-primary)', paddingTop: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Categorical K-Modes
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Operates natively on non-continuous categories (membership status, payment method, product category) using modal centroids and simple matching dissimilarity.
            </p>
          </div>

          <div style={{ borderTop: '2px solid var(--accent-amber)', paddingTop: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Explainable Sentiment
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Deterministic, local rule-and-lexicon NLP engine with negation window parsing and star rating cross-calibration. Zero paid API reliance.
            </p>
          </div>

          <div style={{ borderTop: '2px solid var(--status-positive)', paddingTop: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Real-Time Inference
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Instant assignment of prospective customer attributes to nearest mode centroids with matching feature transparency and business actions.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Briefing */}
      <div style={{ 
        padding: '20px 24px', 
        background: 'var(--bg-subtle)', 
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Prepared for Viva & Technical Evaluation
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Includes theoretical justification comparing K-Modes vs. K-Means and comprehensive preprocessing audit trail.
          </div>
        </div>

        <button 
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('about')}
        >
          View Documentation &rarr;
        </button>
      </div>
    </div>
  );
}
