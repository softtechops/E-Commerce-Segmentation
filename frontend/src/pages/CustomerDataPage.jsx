import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Database, 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { fetchCustomers, uploadCSV, loadDemoData } from '../api';

export default function CustomerDataPage({ onNotify, onRefreshDashboard, dashboardData }) {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    segment: 'All',
    membership: 'All',
    location: 'All',
    sentiment: 'All'
  });
  const [filterOptions, setFilterOptions] = useState({
    memberships: [],
    locations: [],
    sentiments: ['Positive', 'Neutral', 'Negative'],
    segments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = async (currentPage = page, currentFilters = filters, size = pageSize) => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers({
        page: currentPage,
        pageSize: size,
        search: currentFilters.search,
        segment: currentFilters.segment === 'All' ? '' : currentFilters.segment,
        membership: currentFilters.membership === 'All' ? '' : currentFilters.membership,
        location: currentFilters.location === 'All' ? '' : currentFilters.location,
        sentiment: currentFilters.sentiment === 'All' ? '' : currentFilters.sentiment
      });

      if (data.success) {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        if (data.filters) {
          setFilterOptions(prev => ({
            ...prev,
            memberships: data.filters.memberships || prev.memberships,
            locations: data.filters.locations || prev.locations,
            segments: data.filters.segments || prev.segments
          }));
        }
      } else {
        onNotify('error', data.error || 'Failed to fetch customer data.');
      }
    } catch (err) {
      onNotify('error', 'Error connecting to backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, filters, pageSize);
  }, [page, pageSize]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    loadData(1, updated, pageSize);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData(1, filters, pageSize);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      segment: 'All',
      membership: 'All',
      location: 'All',
      sentiment: 'All'
    };
    setFilters(reset);
    setPage(1);
    loadData(1, reset, pageSize);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadCSV(file);
      if (res.success) {
        onNotify('success', res.message || 'Dataset uploaded and preprocessed.');
        if (onRefreshDashboard) onRefreshDashboard();
        setPage(1);
        loadData(1, filters, pageSize);
      } else {
        onNotify('error', res.error || 'Failed to process CSV file.');
      }
    } catch (err) {
      onNotify('error', 'Server error during file upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await loadDemoData();
      if (res.success) {
        onNotify('success', res.message || 'Sample dataset loaded.');
        if (onRefreshDashboard) onRefreshDashboard();
        setPage(1);
        loadData(1, filters, pageSize);
      } else {
        onNotify('error', res.error || 'Failed to load demo data.');
      }
    } catch (err) {
      onNotify('error', 'Server error while loading demo data.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Color-coded styling helpers based on user specifications
  // ---------------------------------------------------------------------------
  const getMembershipBadgeClass = (m) => {
    switch (m?.toLowerCase()) {
      case 'platinum': return 'badge-membership-platinum';
      case 'gold': return 'badge-membership-gold';
      case 'silver': return 'badge-membership-silver';
      case 'bronze': return 'badge-membership-bronze';
      default: return 'badge-membership-none';
    }
  };

  const getSentimentBadgeClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'positive': return 'badge-sentiment-positive';
      case 'negative': return 'badge-sentiment-negative';
      default: return 'badge-sentiment-neutral';
    }
  };

  const getSegmentColorClass = (segmentName) => {
    if (!segmentName) return 'segment-color-default';
    const s = segmentName.toLowerCase();
    if (s.includes('vip') || s.includes('loyalist')) return 'segment-color-vip';
    if (s.includes('fashion')) return 'segment-color-fashion';
    if (s.includes('book') || s.includes('stationery')) return 'segment-color-books';
    if (s.includes('budget') || s.includes('deal')) return 'segment-color-budget';
    return 'segment-color-default';
  };

  const formatRating = (rating) => {
    const num = Number(rating);
    const displayVal = isNaN(num) ? '3.0' : num.toFixed(1);
    return (
      <span className="rating-pill">
        <span className="rating-star">★</span> {displayVal}
      </span>
    );
  };

  // Metrics from dashboardData or fallback
  const kpiCustomers = dashboardData?.metrics?.total_customers || total || 600;
  const kpiSegments = dashboardData?.metrics?.total_segments || filterOptions.segments.length || 4;
  const kpiRating = dashboardData?.metrics?.average_rating || 3.55;
  const kpiSentiment = dashboardData?.metrics?.positive_feedback_pct || 62.8;

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 2. Customer Directory Header Block with Subtle Background Depth */}
      <div className="directory-header-block">
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          <div>
            <div className="directory-title-row">
              <span className="directory-title-accent" />
              <h1 className="directory-title-text">CUSTOMER DIRECTORY</h1>
            </div>
            
            <div className="directory-subtitle-text">
              <span>●</span>
              <span>{kpiCustomers.toLocaleString()} customer profiles &bull; {kpiSegments} active segments</span>
            </div>

            <p className="directory-desc-text">
              Inspect customer demographics, purchasing behavior, sentiment, and K-Modes categorical cluster assignments.
            </p>
          </div>

          {/* Action Buttons: Upload CSV & Load Demo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              style={{ display: 'none' }} 
            />
            
            <button 
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ height: '42px', padding: '0 16px', fontSize: '13.5px' }}
            >
              {isUploading ? (
                <>
                  <div className="spinner" /> Ingesting...
                </>
              ) : (
                <>
                  <Upload size={14} style={{ color: 'var(--forest-green)' }} />
                  <span>Upload CSV</span>
                </>
              )}
            </button>

            <button 
              className="btn btn-secondary"
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              style={{ height: '42px', padding: '0 16px', fontSize: '13.5px' }}
            >
              {isDemoLoading ? (
                <>
                  <div className="spinner" /> Loading...
                </>
              ) : (
                <>
                  <Database size={14} style={{ color: 'var(--warm-amber)' }} />
                  <span>Load Demo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thin green accent line at bottom of header */}
        <div className="directory-header-accent-line" />
      </div>

      {/* 3. Small KPI Analytics Strip with Subtle Tinted Backgrounds */}
      <div className="directory-kpi-grid">
        {/* Total Customers: Soft Green */}
        <div className="directory-kpi-card kpi-customers">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Total Customers</span>
            <span className="directory-kpi-dot" style={{ background: '#21634A' }} />
          </div>
          <div className="directory-kpi-value">{kpiCustomers.toLocaleString()}</div>
          <div className="directory-kpi-meta">Active customer profiles</div>
        </div>

        {/* Segments: Soft Amber */}
        <div className="directory-kpi-card kpi-segments">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Segments</span>
            <span className="directory-kpi-dot" style={{ background: '#C88732' }} />
          </div>
          <div className="directory-kpi-value">{kpiSegments}</div>
          <div className="directory-kpi-meta">K-Modes modal clusters</div>
        </div>

        {/* Rating: Warm Cream */}
        <div className="directory-kpi-card kpi-rating">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Avg Rating</span>
            <span className="directory-kpi-dot" style={{ background: '#C88732' }} />
          </div>
          <div className="directory-kpi-value">
            {kpiRating} <span style={{ fontSize: '20px', color: '#C88732' }}>★</span>
          </div>
          <div className="directory-kpi-meta">Across feedback logs</div>
        </div>

        {/* Positive Sentiment: Pale Green */}
        <div className="directory-kpi-card kpi-sentiment">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Positive Sentiment</span>
            <span className="directory-kpi-dot" style={{ background: '#21634A' }} />
          </div>
          <div className="directory-kpi-value" style={{ color: '#21634A' }}>
            {kpiSentiment}%
          </div>
          <div className="directory-kpi-meta">Calibrated NLP confidence</div>
        </div>
      </div>

      {/* Section Divider: Filter & Search */}
      <div className="section-divider-row" style={{ marginTop: '12px' }}>
        <span className="section-divider-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>FILTER & SEARCH</span>
          <span style={{ color: '#21634A', fontSize: '10px' }}>●</span>
          <span style={{ color: '#66706A', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>
            Refine customer records
          </span>
        </span>
        <span className="section-divider-line" />
      </div>

      {/* 4. Tinted Filter Toolbar (#EEEAE0) */}
      <div className="directory-filter-toolbar">
        <div className="directory-filter-row">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '13px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#66706A' 
              }} 
            />
            <input 
              type="text"
              placeholder="Search Customer ID, city, category..."
              className="filter-control-lg"
              style={{ width: '100%', paddingLeft: '38px' }}
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </form>

          {/* Segment Filter */}
          <select 
            className="filter-control-lg"
            style={{ flex: '1 1 180px', minWidth: '170px' }}
            value={filters.segment}
            onChange={(e) => handleFilterChange('segment', e.target.value)}
          >
            <option value="All">All Segments</option>
            {filterOptions.segments.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Membership Filter */}
          <select 
            className="filter-control-lg"
            style={{ flex: '1 1 160px', minWidth: '150px' }}
            value={filters.membership}
            onChange={(e) => handleFilterChange('membership', e.target.value)}
          >
            <option value="All">All Memberships</option>
            {filterOptions.memberships.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select 
            className="filter-control-lg"
            style={{ flex: '1 1 150px', minWidth: '140px' }}
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option value="All">All Locations</option>
            {filterOptions.locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select 
            className="filter-control-lg"
            style={{ flex: '1 1 150px', minWidth: '140px' }}
            value={filters.sentiment}
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          {/* Reset Button */}
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleResetFilters}
            style={{ height: '44px', padding: '0 16px', fontSize: '14px', gap: '6px' }}
            title="Reset active filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Section Divider: Customer Records */}
      <div className="section-divider-row">
        <span className="section-divider-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>CUSTOMER RECORDS</span>
          <span style={{ color: '#21634A', fontSize: '10px' }}>●</span>
          <span style={{ color: '#66706A', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>
            {total.toLocaleString()} total profiles {total > 0 && `(showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)})`}
          </span>
        </span>
        <span className="section-divider-line" />
      </div>

      {/* 5, 6, 7, 8: High Readability Table with Zebra Rows & Green Hover Indicator */}
      <div className="directory-table-container">
        <table className="directory-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Demographics</th>
              <th>Location</th>
              <th>Membership</th>
              <th>Frequency</th>
              <th>Payment</th>
              <th>Category</th>
              <th>Discount</th>
              <th>Rating</th>
              <th>Sentiment</th>
              <th>Segment</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px', width: '20px', height: '20px' }} />
                  <span style={{ fontSize: '14.5px' }}>Loading customer cohort records...</span>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '50px 0', color: '#66706A' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>No customer records match criteria</div>
                  <div style={{ fontSize: '13px', color: '#8A8D8F' }}>Try clearing active search terms or resetting filters</div>
                </td>
              </tr>
            ) : (
              customers.map(c => (
                <tr key={c.Customer_ID}>
                  {/* Customer ID: 15px, font-weight: 600, dark green */}
                  <td className="customer-id-cell">
                    {c.Customer_ID}
                  </td>

                  {/* Demographics: Gender slightly stronger, age muted */}
                  <td>
                    <div className="demo-cell">
                      <span className="demo-gender">{c.Gender}</span>
                      <span className="demo-age">{c.Age_Group}</span>
                    </div>
                  </td>

                  {/* Location: 14.5px, #202520 */}
                  <td className="location-cell">
                    {c.Location}
                  </td>

                  {/* Membership: Color-coded subtle badges */}
                  <td>
                    <span className={`badge-membership ${getMembershipBadgeClass(c.Membership)}`}>
                      {c.Membership}
                    </span>
                  </td>

                  {/* Purchase Frequency */}
                  <td style={{ color: '#202520' }}>
                    {c.Purchase_Frequency}
                  </td>

                  {/* Payment Method */}
                  <td style={{ color: '#202520' }}>
                    {c.Payment_Method}
                  </td>

                  {/* Product Category */}
                  <td style={{ fontWeight: 500, color: '#202520' }}>
                    {c.Product_Category}
                  </td>

                  {/* Discount Usage */}
                  <td style={{ color: '#66706A' }}>
                    {c.Discount_Usage}
                  </td>

                  {/* Rating: Easy to scan, e.g. ★ 3.0 with amber star */}
                  <td>
                    {formatRating(c.Rating)}
                  </td>

                  {/* Sentiment: Color-coded subtle badges */}
                  <td>
                    <span className={`badge-sentiment ${getSentimentBadgeClass(c.Sentiment)}`}>
                      {c.Sentiment}
                    </span>
                  </td>

                  {/* Segment: 14.5px, medium/semibold, color-coded text */}
                  <td>
                    <span className={`segment-cell ${getSegmentColorClass(c.Segment_Name)}`}>
                      {c.Segment_Name || 'Unassigned'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Directory Pagination Bar */}
        <div className="directory-pagination-bar">
          <div>
            Showing <strong>{total > 0 ? (page - 1) * pageSize + 1 : 0}</strong>–<strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> customer profiles
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', color: '#66706A' }}>Rows per page:</span>
              <select 
                className="filter-control-lg" 
                style={{ width: '70px', height: '36px', padding: '0 8px', fontSize: '13.5px' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className="btn btn-secondary"
                style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                disabled={page <= 1 || isLoading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span style={{ 
                padding: '0 10px', 
                fontFamily: 'var(--font-mono)', 
                fontSize: '13.5px', 
                fontWeight: 600,
                color: '#202520' 
              }}>
                {page} / {totalPages}
              </span>

              <button 
                className="btn btn-secondary"
                style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
