import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Technical & Theoretical Documentation
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
          Academic justification for categorical K-Modes clustering versus standard numerical K-Means.
        </p>
      </div>

      {/* Overview Block */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          Problem Formulation & Data Geometry
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65, marginBottom: '12px' }}>
          In e-commerce customer analytics, customer profiles are largely defined by non-continuous, discrete categorical dimensions—such as membership status (Platinum, Gold, Silver, Bronze, None), geographical market, payment method (Credit Card, UPI, Net Banking, COD), and discount sensitivity. Standard clustering pipelines frequently force these categorical variables into Euclidean spaces or expand them into sparse one-hot encodings. This creates geometric distortions, sparsity issues, and results in uninterpretable fractional centroid averages (e.g. <em>Membership = 1.4</em>).
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65 }}>
          <strong>SmartCart</strong> implements an end-to-end unsupervised learning solution utilizing the <strong>K-Modes clustering algorithm</strong> (using Huang centroid initialization and simple matching Hamming distance). Integrated with a deterministic lexicon-based sentiment processing engine, SmartCart groups customer profiles into cohesive behavioral archetypes and generates automated business playbooks.
        </p>
      </div>

      {/* Comparative Academic Table */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          Mathematical Rationale: K-Modes vs. K-Means
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Direct comparison of clustering characteristics for viva evaluation
        </div>

        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Evaluation Axis</th>
              <th style={{ width: '38%' }}>Standard K-Means</th>
              <th style={{ width: '40%' }}>K-Modes Algorithm (SmartCart)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Data Domain</td>
              <td style={{ color: 'var(--text-secondary)' }}>Continuous numerical features (e.g. price, weight)</td>
              <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Discrete categorical & nominal attributes</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Dissimilarity Measure</td>
              <td>Euclidean distance: sqrt(sum((x_i - y_i)^2))</td>
              <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Hamming simple matching distance: D(X, Q) = sum(delta(x_j, q_j))
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Centroid Calculation</td>
              <td style={{ color: 'var(--text-secondary)' }}>Arithmetic mean (produces meaningless fractional categories)</td>
              <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Mode vector (most frequent category per feature)
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Matrix Dimensionality</td>
              <td>Suffers from sparse explosion with One-Hot encoding</td>
              <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Directly computes dissimilarity without expanding sparse dimensions
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            <strong>Objective Cost Formulation:</strong> K-Modes minimizes P(W, Q) = sum_l sum_i w_il * d(X_i, Q_l), where Q_l is the mode centroid vector for cluster l, and delta(x_ij, q_lj) = 0 if identical, and 1 if divergent.
          </p>
        </div>
      </div>

      {/* College Viva Sequence Checklist */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          Viva Demonstration & Evaluation Flow
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '16px' }}>
          Recommended demonstration sequence for project presentation:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            '1. Executive Overview dashboard & KPI inspection',
            '2. Load Demo Data (600 customer records ingestion)',
            '3. Preprocessing audit metrics verification',
            '4. Filter & search customer records in directory',
            '5. Feedback Analytics sentiment & rating charts',
            '6. K-Modes parameter selection (k = 2 to 6)',
            '7. Run Segmentation & inspect modal centroid table',
            '8. Review cluster personas & marketing playbooks',
            '9. Test real-time inference with Archetype Presets',
            '10. Verify predicted cluster and matching features'
          ].map((step, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-primary)'
            }}>
              <CheckCircle2 size={13} color="var(--status-positive)" style={{ flexShrink: 0 }} />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Stack Summary */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>
          Technical Implementation Stack
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ padding: '10px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Frontend</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>React 19 &bull; Vite 8</div>
          </div>
          <div style={{ padding: '10px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Backend API</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>Python 3.13 &bull; Flask</div>
          </div>
          <div style={{ padding: '10px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Clustering ML</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>kmodes &bull; Scikit-Learn</div>
          </div>
          <div style={{ padding: '10px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Visual Design</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>DM Sans &bull; Warm Parchment</div>
          </div>
        </div>
      </div>
    </div>
  );
}
