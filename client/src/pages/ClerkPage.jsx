import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const ClerkPage = ({ globalAuthId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    packagesAtFacility: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch pending courier requests
      const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL}/getPendingCourierRequests`);
      const requestsData = await requestsResponse.json();

      // Fetch packages at clerk's facility
      const packagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/getPackagesAtFacilities?authId=${globalAuthId}`);
      const packagesData = await packagesResponse.json();

      setStats({
        pendingRequests: requestsData.success ? requestsData.requests.length : 0,
        packagesAtFacility: packagesData.success ? packagesData.packages.length : 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Clerk Dashboard</h1>
        <p className="welcome-text">Welcome to your SnailMail clerk portal</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card urgent">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Courier Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.packagesAtFacility}</h3>
            <p>Packages at My Facility</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card primary" onClick={() => navigate('/clerkCourierApproval')}>
            <div className="action-icon">✓</div>
            <h3>Review Courier Requests</h3>
            <p>Approve or reject courier pickup requests and create tracking events</p>
            {stats.pendingRequests > 0 && (
              <span className="badge">{stats.pendingRequests} pending</span>
            )}
          </div>

          <div className="action-card" onClick={() => navigate('/employeePage')}>
            <div className="action-icon">📍</div>
            <h3>Manage Packages</h3>
            <p>View and create tracking events for all packages at your facility</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Your Responsibilities</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>Review Requests</h4>
            <p>Check courier requests, inspect package conditions, and create tracking events before approval</p>
          </div>
          <div className="info-item">
            <h4>Track Packages</h4>
            <p>Create tracking events to record package movements and status changes at your facility</p>
          </div>
          <div className="info-item">
            <h4>Quality Control</h4>
            <p>Reject requests for damaged, lost, or undeliverable packages to maintain service quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClerkPage;
