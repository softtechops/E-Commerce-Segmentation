import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  PieChart, 
  Target, 
  MessageSquare, 
  FileText, 
  Database,
  CheckCircle,
  XCircle,
  X,
  Plus
} from 'lucide-react';

import { fetchDashboard, loadDemoData } from './api';
import OverviewPage from './pages/OverviewPage';
import CustomerDataPage from './pages/CustomerDataPage';
import SegmentationPage from './pages/SegmentationPage';
import FeedbackPage from './pages/FeedbackPage';
import InsightsPage from './pages/InsightsPage';
import PredictPage from './pages/PredictPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadInitialDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboard();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialDashboard();
  }, []);

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await loadDemoData();
      if (res.success) {
        showNotification('success', res.message || 'Sample dataset loaded and preprocessed.');
        await loadInitialDashboard();
      } else {
        showNotification('error', res.error || 'Failed to load demo dataset.');
      }
    } catch (err) {
      showNotification('error', 'Error communicating with Flask backend.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const navigationSections = [
    {
      group: 'MAIN',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard }
      ]
    },
    {
      group: 'CUSTOMERS',
      items: [
        { id: 'customers', label: 'Customer Data', icon: Users }
      ]
    },
    {
      group: 'MACHINE LEARNING',
      items: [
        { id: 'segmentation', label: 'Segmentation', icon: Layers },
        { id: 'insights', label: 'Cluster Insights', icon: PieChart },
        { id: 'predict', label: 'Predict Customer', icon: Target }
      ]
    },
    {
      group: 'ANALYTICS',
      items: [
        { id: 'feedback', label: 'Feedback Analytics', icon: MessageSquare }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'about', label: 'About Project', icon: FileText }
      ]
    }
  ];

  const getPageHeader = () => {
    switch (activePage) {
      case 'segmentation':
        return { 
          title: 'Segmentation', 
          desc: 'Discover meaningful customer groups from categorical behavior.' 
        };
      case 'overview':
        return { 
          title: 'Overview', 
          desc: 'Cohort analysis and categorical purchasing distributions.' 
        };
      case 'customers':
        return { 
          title: 'Customer Directory', 
          desc: 'Filter, inspect, and analyze categorical records.' 
        };
      case 'insights':
        return { 
          title: 'Cluster Personas', 
          desc: 'Behavioral profiles and actionable marketing strategies.' 
        };
      case 'predict':
        return { 
          title: 'Predict Customer', 
          desc: 'Real-time assignment to nearest K-Modes centroid.' 
        };
      case 'feedback':
        return { 
          title: 'Customer Feedback Analytics', 
          desc: 'Sentiment distribution and rating evaluation.' 
        };
      case 'about':
        return { 
          title: 'Technical Documentation', 
          desc: 'Theoretical justification for K-Modes vs K-Means.' 
        };
      default:
        return { title: 'SmartCart Analytics', desc: 'Customer Segmentation Platform' };
    }
  };

  const header = getPageHeader();

  return (
    <div className="app-container">
      {/* Sidebar: Deep charcoal/forest (#17201C) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper" onClick={() => setActivePage('overview')}>
            <span className="brand-dot" />
            <div>
              <div className="brand-title">SmartCart</div>
              <div className="brand-subtitle">E-Commerce Analytics</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationSections.map((sec) => (
            <div key={sec.group}>
              <div className="nav-group-title">{sec.group}</div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <Icon className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot-active" />
            <span>K-Modes Ready</span>
          </div>
          <span>v1.0</span>
        </div>
      </aside>

      {/* Main Content Area: Warm off-white background */}
      <div className="main-wrapper">
        {/* Top Header: Warm off-white background, subtle horizontal separator */}
        <header className="top-header">
          <div className="top-header-left">
            <h1>{header.title}</h1>
            <p>{header.desc}</p>
          </div>

          <div className="top-header-right">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              title="Reload sample 600 customer dataset"
            >
              {isDemoLoading ? (
                <>
                  <div className="spinner" /> Loading...
                </>
              ) : (
                <>
                  <Database size={13} /> Load Demo Data
                </>
              )}
            </button>

            {activePage !== 'predict' && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setActivePage('predict')}
              >
                <Plus size={13} /> Predict Customer
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="content-container">
          {/* Notification Alert */}
          {notification && (
            <div className={`alert-toast ${notification.type === 'success' ? 'alert-toast-success' : 'alert-toast-error'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notification.type === 'success' ? (
                  <CheckCircle size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                <span>{notification.message}</span>
              </div>
              <button 
                style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0 }}
                onClick={() => setNotification(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {activePage === 'overview' && (
            <OverviewPage 
              dashboardData={dashboardData}
              onNavigate={setActivePage}
              onRefresh={loadInitialDashboard}
              isLoading={isLoading}
            />
          )}

          {activePage === 'customers' && (
            <CustomerDataPage 
              onNotify={showNotification}
              onRefreshDashboard={loadInitialDashboard}
              dashboardData={dashboardData}
            />
          )}

          {activePage === 'segmentation' && (
            <SegmentationPage 
              onRefreshDashboard={loadInitialDashboard}
              onNotify={showNotification}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'insights' && (
            <InsightsPage 
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'predict' && (
            <PredictPage 
              onNotify={showNotification}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'feedback' && (
            <FeedbackPage 
              onNotify={showNotification}
            />
          )}

          {activePage === 'about' && (
            <AboutPage />
          )}
        </main>
      </div>
    </div>
  );
}
