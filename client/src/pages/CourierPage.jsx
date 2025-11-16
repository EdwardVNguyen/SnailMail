import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const CourierPage = ({ globalAuthId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    availablePackages: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch courier's active packages (packages assigned to this courier)
      const myPackagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/getMyCourierPackages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: globalAuthId })
      });
      const myPackagesData = await myPackagesResponse.json();

      // Fetch available packages at courier's facility
      const availableResponse = await fetch(`${import.meta.env.VITE_API_URL}/getAvailablePackagesForCourier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: globalAuthId })
      });
      const availableData = await availableResponse.json();

      setStats({
        activeDeliveries: myPackagesData.success ? myPackagesData.packages.length : 0,
        availablePackages: availableData.success ? availableData.packages.length : 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Courier Dashboard</h1>
        <p className="welcome-text">Welcome to your SnailMail courier portal</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card urgent">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>{stats.activeDeliveries}</h3>
            <p>Active Deliveries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.availablePackages}</h3>
            <p>Available Packages</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card primary" onClick={() => navigate('/courierPackagePage')}>
            <div className="action-icon">📋</div>
            <h3>Available Packages</h3>
            <p>Request packages for pickup and delivery from your facility</p>
            {stats.availablePackages > 0 && (
              <span className="badge">{stats.availablePackages} available</span>
            )}
          </div>

          <div className="action-card" onClick={() => navigate('/courierMyPackagePage')}>
            <div className="action-icon">🚛</div>
            <h3>My Deliveries</h3>
            <p>View and manage packages currently assigned to you</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Your Responsibilities</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>Request Packages</h4>
            <p>Submit requests to pick up available packages at your facility and wait for clerk approval</p>
          </div>
          <div className="info-item">
            <h4>Deliver Packages</h4>
            <p>Transport approved packages safely and efficiently to their destinations</p>
          </div>
          <div className="info-item">
            <h4>Update Status</h4>
            <p>Keep tracking information current by updating package locations and delivery statuses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierPage;
