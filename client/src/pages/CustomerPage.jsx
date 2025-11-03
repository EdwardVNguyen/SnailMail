import './CustomerPage.css';
import { useState, useEffect } from 'react';
import { getCustomerData } from '../utils/getCustomerData.js';
import { useNavigate } from 'react-router-dom';

const CustomerPage = ({ globalAuthId }) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  // Fetch customer data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getCustomerData(globalAuthId);
      setCustomerInfo(data);
    };
    fetchData();
  }, [globalAuthId]);

  // Handle tracking submission
  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    navigate(`/userTrackPackage/${trackingNumber}`);
  };

  if (!customerInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customerPageContainer">
      {/* Welcome Header */}
      <div className="welcomeSection">
        <h1>Welcome back, {customerInfo.customer.first_name}!</h1>
        <p>Manage your shipments and track packages all in one place.</p>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboardGrid">
        {/* Profile Card */}
        <div className="dashboardCard profileCard">
          <div className="cardHeader">
            <h2>Your Profile</h2>
          </div>
          <div className="cardContent">
            <div className="profileInfo">
              <div className="customerProfileIcon">
                {customerInfo.customer.first_name.charAt(0)}{customerInfo.customer.last_name.charAt(0)}
              </div>
              <div className="profileDetails">
                <div className="profileName">
                  {customerInfo.customer.first_name} {customerInfo.customer.last_name}
                </div>
                <div className="profileEmail">{customerInfo.customer.email}</div>
                <div className="profileId">Account ID: {customerInfo.customer.customer_id}</div>
              </div>
            </div>
            <button 
              className="actionButton"
              onClick={() => navigate('/userProfile')}
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Quick Track Card */}
        <div className="dashboardCard">
          <div className="cardHeader">
            <h2>Quick Track</h2>
          </div>
          <div className="cardContent">
            <p>Enter a tracking number to see your package status instantly.</p>
            <form className="trackForm" onSubmit={handleTrackingSubmit}>
              <input
                type="text"
                className="trackInput"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
              <button type="submit" className="trackButton">
                Track Package
              </button>
            </form>
          </div>
        </div>

        {/* Create Shipment Card */}
        <div className="dashboardCard">
          <div className="cardHeader">
            <h2>Create Shipment</h2>
          </div>
          <div className="cardContent">
            <p>Send a new package with just a few clicks. Get your tracking number instantly.</p>
            <button 
              className="actionButton"
              onClick={() => navigate('/userCreateShipment')}
            >
              Create New Shipment
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="quickLinksSection">
        <h2>Quick Links</h2>
        <div className="quickLinksGrid">
          <div className="quickLinkCard" onClick={() => navigate('/userShipping')}>
            <div className="quickLinkIcon">📦</div>
            <h3>Your Shipments</h3>
            <p>View all packages you've sent</p>
          </div>

          <div className="quickLinkCard" onClick={() => navigate('/tracking')}>
            <div className="quickLinkIcon">🔍</div>
            <h3>Track Package</h3>
            <p>Track any package with a tracking number</p>
          </div>

          <div className="quickLinkCard" onClick={() => navigate('/support')}>
            <div className="quickLinkIcon">💬</div>
            <h3>Support</h3>
            <p>Get help and answers</p>
          </div>

          <div className="quickLinkCard" onClick={() => navigate('/about')}>
            <div className="quickLinkIcon">ℹ️</div>
            <h3>About</h3>
            <p>Learn more about SnailMail</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;