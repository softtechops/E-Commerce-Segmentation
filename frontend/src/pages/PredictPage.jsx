import React, { useState } from 'react';
import { CheckCircle2, Target } from 'lucide-react';
import { predictCustomer } from '../api';

const PRESETS = {
  vip: {
    Gender: 'Female',
    Age_Group: '26-35',
    Location: 'Mumbai',
    Membership: 'Platinum',
    Purchase_Frequency: 'Frequent',
    Payment_Method: 'Credit Card',
    Product_Category: 'Electronics',
    Discount_Usage: 'No',
    Feedback: 'The product quality was extraordinary and packaging was top-notch. Next day delivery was delightful!',
    Rating: 5
  },
  budget: {
    Gender: 'Male',
    Age_Group: '18-25',
    Location: 'Delhi',
    Membership: 'None',
    Purchase_Frequency: 'Regular',
    Payment_Method: 'UPI',
    Product_Category: 'Fashion',
    Discount_Usage: 'High',
    Feedback: 'Great discount during the sale, very affordable price for college students.',
    Rating: 4
  },
  atRisk: {
    Gender: 'Male',
    Age_Group: '36-50',
    Location: 'Bengaluru',
    Membership: 'Bronze',
    Purchase_Frequency: 'Rare',
    Payment_Method: 'Cash on Delivery',
    Product_Category: 'Home & Kitchen',
    Discount_Usage: 'Yes',
    Feedback: 'Delivery was delayed by a week and the package was damaged. Customer care was completely unhelpful.',
    Rating: 1
  },
  occasional: {
    Gender: 'Female',
    Age_Group: '26-35',
    Location: 'Pune',
    Membership: 'Silver',
    Purchase_Frequency: 'Occasional',
    Payment_Method: 'Debit Card',
    Product_Category: 'Beauty & Personal Care',
    Discount_Usage: 'Moderate',
    Feedback: 'Decent experience, product arrived in reasonable time and works as described.',
    Rating: 3
  }
};

export default function PredictPage({ onNotify }) {
  const [formData, setFormData] = useState(PRESETS.vip);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Rating' ? Number(value) : value
    }));
  };

  const handleApplyPreset = (presetKey) => {
    setFormData(PRESETS[presetKey]);
    setPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    try {
      const res = await predictCustomer(formData);
      if (res.success) {
        setPrediction(res.prediction);
        onNotify('success', `Customer matched to ${res.prediction.predicted_segment}`);
      } else {
        onNotify('error', res.error || 'Prediction failed. Model not initialized.');
      }
    } catch (err) {
      onNotify('error', 'Network error during inference.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Editorial Title */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Predict Customer Segment
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '14px' }}>
          Evaluate prospective customer attributes against trained K-Modes modal centroids to identify their natural cohort.
        </p>

        {/* Archetype Quick-Fill Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>
            Archetype Presets:
          </span>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => handleApplyPreset('vip')}
          >
            VIP Loyalist
          </button>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => handleApplyPreset('budget')}
          >
            Budget Hunter
          </button>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => handleApplyPreset('atRisk')}
          >
            At-Risk Churn
          </button>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => handleApplyPreset('occasional')}
          >
            Occasional Buyer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: prediction ? '1.2fr 1fr' : '1fr', gap: '32px' }}>
        {/* Form Container */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* 1. Customer Profile */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                Customer Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gender</label>
                  <select 
                    name="Gender" 
                    className="form-control"
                    value={formData.Gender} 
                    onChange={handleChange}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Age Group</label>
                  <select 
                    name="Age_Group" 
                    className="form-control"
                    value={formData.Age_Group} 
                    onChange={handleChange}
                  >
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-50">36-50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <select 
                    name="Location" 
                    className="form-control"
                    value={formData.Location} 
                    onChange={handleChange}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Purchase Behavior */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                Purchase Behavior
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Membership Tier</label>
                  <select 
                    name="Membership" 
                    className="form-control"
                    value={formData.Membership} 
                    onChange={handleChange}
                  >
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Frequency</label>
                  <select 
                    name="Purchase_Frequency" 
                    className="form-control"
                    value={formData.Purchase_Frequency} 
                    onChange={handleChange}
                  >
                    <option value="Frequent">Frequent</option>
                    <option value="Regular">Regular</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Rare">Rare</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Category</label>
                  <select 
                    name="Product_Category" 
                    className="form-control"
                    value={formData.Product_Category} 
                    onChange={handleChange}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Books & Stationery">Books & Stationery</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Usage</label>
                  <select 
                    name="Discount_Usage" 
                    className="form-control"
                    value={formData.Discount_Usage} 
                    onChange={handleChange}
                  >
                    <option value="No">No</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Yes">Yes</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label className="form-label">Payment Method</label>
                  <select 
                    name="Payment_Method" 
                    className="form-control"
                    value={formData.Payment_Method} 
                    onChange={handleChange}
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Feedback & Rating */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                Feedback & Review
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, Rating: star }))}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: formData.Rating === star ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                        background: formData.Rating === star ? 'var(--accent-amber-subtle)' : '#FFFFFF',
                        color: formData.Rating === star ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Feedback Review Text</label>
                <textarea 
                  name="Feedback"
                  className="form-control"
                  rows="2"
                  placeholder="Enter customer feedback text..."
                  value={formData.Feedback}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '9px', fontSize: '13px' }}
              disabled={isPredicting}
            >
              {isPredicting ? (
                <>
                  <div className="spinner" style={{ borderTopColor: '#FFFFFF' }} /> Calculating Hamming Distance...
                </>
              ) : (
                <>
                  <Target size={14} /> Predict Segment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Panel (Editorial, integrated, NO floating neon box) */}
        {prediction && (
          <div style={{ 
            borderTop: '2px solid var(--accent-primary)', 
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Predicted Cohort
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {prediction.predicted_segment}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Cluster #{prediction.cluster_number} &bull; Match alignment: <strong>{prediction.confidence_percentage}%</strong>
              </div>
            </div>

            {/* Sentiment info */}
            {prediction.sentiment_analysis && (
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-subtle)',
                borderRadius: '4px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sentiment Analysis:</span>
                <span className={`badge ${
                  prediction.sentiment_analysis.sentiment === 'Positive' ? 'badge-positive' :
                  prediction.sentiment_analysis.sentiment === 'Negative' ? 'badge-negative' : 'badge-neutral'
                }`}>
                  {prediction.sentiment_analysis.sentiment} (Score: {prediction.sentiment_analysis.net_score})
                </span>
              </div>
            )}

            {/* Matching characteristics */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Matching Centroid Features:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {prediction.matching_characteristics?.map((m, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={13} color="var(--status-positive)" /> {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Business Action */}
            <div className="insight-strategy-box" style={{ marginTop: 'auto' }}>
              <div className="insight-strategy-label">
                Recommended Action
              </div>
              <div className="insight-strategy-text">
                {prediction.recommended_action}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
