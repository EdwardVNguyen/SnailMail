import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const ManagerPage = ({ globalAuthId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalFacilities: 0,
    activeFacilities: 0,
    problemPackages: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch employees count
      const employeesResponse = await fetch(`${import.meta.env.VITE_API_URL}/getEmployees`);
      const employeesData = await employeesResponse.json();

      // Fetch facilities count
      const facilitiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities`);
      const facilitiesData = await facilitiesResponse.json();

      // Fetch problem packages
      const problemResponse = await fetch(`${import.meta.env.VITE_API_URL}/getProblemPackagesReport`);
      const problemData = await problemResponse.json();

      const activeFacilities = facilitiesData.success
        ? facilitiesData.facilities.filter(f => f.status === 'active').length
        : 0;

      setStats({
        totalEmployees: employeesData.success ? employeesData.employees.length : 0,
        totalFacilities: facilitiesData.success ? facilitiesData.facilities.length : 0,
        activeFacilities: activeFacilities,
        problemPackages: problemData.success ? problemData.problemPackages.length : 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p className="welcome-text">Welcome to your SnailMail management portal</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{stats.activeFacilities}</h3>
            <p>Active Facilities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalFacilities}</h3>
            <p>Total Facilities</p>
          </div>
        </div>

        <div className={`stat-card ${stats.problemPackages > 0 ? 'urgent' : ''}`}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.problemPackages}</h3>
            <p>Problem Packages</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card primary" onClick={() => navigate('/employeesPage')}>
            <div className="action-icon">👥</div>
            <h3>Manage Employees</h3>
            <p>View, add, edit, and manage all employees across your facilities</p>
          </div>

          <div className="action-card" onClick={() => navigate('/facilitiesPage')}>
            <div className="action-icon">🏢</div>
            <h3>Manage Facilities</h3>
            <p>Oversee all facilities, update details, and monitor operations</p>
          </div>

          <div className="action-card" onClick={() => navigate('/reportPage')}>
            <div className="action-icon">📈</div>
            <h3>View Reports</h3>
            <p>Access analytics, problem packages, and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Your Responsibilities</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>Workforce Management</h4>
            <p>Hire, train, and manage employees across all facilities to ensure smooth operations</p>
          </div>
          <div className="info-item">
            <h4>Facility Oversight</h4>
            <p>Monitor facility performance, manage locations, and optimize distribution networks</p>
          </div>
          <div className="info-item">
            <h4>Strategic Planning</h4>
            <p>Use reports and analytics to make data-driven decisions and improve service quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
