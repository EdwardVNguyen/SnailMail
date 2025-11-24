import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const EmployeePage = ({ globalAuthId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPackages: 0,
    pendingRequests: 0
  });
  const [facilityName, setFacilityName] = useState('');

  useEffect(() => {
    fetchStats();
    fetchClerkFacility();
  }, []);

  const fetchClerkFacility = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeId?authId=${globalAuthId}`);
      const data = await response.json();
      if (data.success && data.employee) {
        setFacilityName(data.employee.facility_name || 'Your Facility');
      }
    } catch (err) {
      console.error('Error fetching clerk facility:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch packages at facility
      const packagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/getPackagesAtFacilities?authId=${globalAuthId}&page=1&limit=1000`);
      const packagesData = await packagesResponse.json();

      // Fetch pending courier requests
      const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL}/getPendingCourierRequests?authId=${globalAuthId}`);
      const requestsData = await requestsResponse.json();

      setStats({
        totalPackages: packagesData.success ? packagesData.packages.length : 0,
        pendingRequests: requestsData.success ? requestsData.requests.length : 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Clerk Dashboard</h1>
        <p className="welcome-text">Welcome to your SnailMail clerk portal at {facilityName}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalPackages}</h3>
            <p>Packages at Facility</p>
          </div>
        </div>

        <div className="stat-card urgent">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Courier Requests</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card primary" onClick={() => navigate('/clerkAllPackages')}>
            <div className="action-icon">📋</div>
            <h3>All Packages</h3>
            <p>View and manage all packages at your facility. Add tracking events and edit dimensions.</p>
            {stats.totalPackages > 0 && (
              <span className="badge">{stats.totalPackages} packages</span>
            )}
          </div>

          <div className="action-card" onClick={() => navigate('/clerkCourierApproval')}>
            <div className="action-icon">✅</div>
            <h3>Courier Requests</h3>
            <p>Review and approve or reject courier package pickup requests</p>
            {stats.pendingRequests > 0 && (
              <span className="badge urgent">{stats.pendingRequests} pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Your Responsibilities</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>Manage Packages</h4>
            <p>Track and update package status, edit dimensions, and add tracking events for all packages at your facility</p>
          </div>
          <div className="info-item">
            <h4>Approve Requests</h4>
            <p>Review courier requests for package pickups and approve or deny them based on availability and readiness</p>
          </div>
          <div className="info-item">
            <h4>Monitor Operations</h4>
            <p>Keep track of package flow through your facility and ensure smooth operations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
