import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserTrackPackage.css';

const UserTrackPackage = ({ globalAuthId }) => {
  const { trackingNumber: urlTrackingNumber } = useParams(); // Get tracking number from URL
  const navigate = useNavigate();
  
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackingData = useCallback(async (tracking_num) => {
    setIsLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await fetch(
        `http://localhost:8000/tracking/${tracking_num}?authId=${globalAuthId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setTrackingData(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch tracking information. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [globalAuthId]);

  useEffect(() => {
    if (urlTrackingNumber) {
      fetchTrackingData(urlTrackingNumber);
    }
  }, [urlTrackingNumber, globalAuthId]);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    
    // Navigate to new URL with the tracking number
    navigate(`/userTrackPackage/${trackingNumber.trim()}`);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time helper function
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="tracking-container">
      <button onClick={() => navigate('/customer')} className="back-button">
        ← Back to Dashboard
      </button>
      
      <h1>Package Tracking</h1>

      {/* Search Form */}
      <div className="tracking-search-section">
        <form onSubmit={handleSubmit} className="tracking-form">
          <input
            type="text"
            value={trackingNumber}
            onChange={handleInputChange}
            placeholder="Enter tracking number"
            className="tracking-input"
          />
          <button type="submit" disabled={isLoading} className="tracking-button">
            {isLoading ? 'Tracking...' : 'Track'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Loading tracking information...</div>}
    
      {/* Package Summary Section */}
      {trackingData && (
        <div className="tracking-results">
          <div className="package-summary">
            <div className="tracking-number-display">
              <span className="label">Tracking Number:</span>
              <span className="value">{trackingData.package.tracking_number}</span>
            </div>
            
            <div className="status-section">
              <h2 className="status">{trackingData.package.package_status}</h2>
              <p className="destination">
                Delivering to: {trackingData.package.city_name}, {trackingData.package.state_name}
              </p>
            </div>

            <div className="package-info-grid">
              <div className="info-item">
                <span className="info-label">Recipient:</span>
                <span className="info-value">{trackingData.package.recipient_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {trackingData.package.street_name}, {trackingData.package.city_name}, {trackingData.package.state_name} {trackingData.package.zip_code}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Package Type:</span>
                <span className="info-value">{trackingData.package.package_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Weight:</span>
                <span className="info-value">{trackingData.package.weight} kg</span>
              </div>
            </div>
          </div>

          {/* Travel History Section */}
          <div className="travel-history">
            <h2>Travel History</h2>
            
            {trackingData.tracking_events.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Activity</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingData.tracking_events.map((event) => (
                    <tr key={event.tracking_event_id}>
                      <td className="date-time-cell">
                        <div className="date">{formatDate(event.event_time)}</div>
                        <div className="time">{formatTime(event.event_time)}</div>
                      </td>
                      <td className="activity-cell">
                        {event.event_type}
                      </td>
                      <td className="location-cell">
                        {event.city_name && event.state_name 
                          ? `${event.city_name}, ${event.state_name}`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No tracking events available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrackPackage;