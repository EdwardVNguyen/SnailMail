import { useState } from 'react';
import './Tracking.css';

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
  };
  // fetch tracking data from backend
  const fetchTrackingData = async (tracking_num) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/tracking/${tracking_num}`);
      const data = await response.json();
      if (data.success) {
        setTrackingData(data);
      } else {
        setError(data.message || 'Error fetching tracking data');
      }
    } catch (error) {
      setError('Failed to fetch tracking information. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setTrackingData(null);
    setHasSearched(false);
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking Number.');
      return;
    }
    
    fetchTrackingData(trackingNumber.trim());
  };

  // format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // format time helper
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
      <h1>Track Your Package</h1>
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
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}
      {/* Loading State */}
      {isLoading && <div className="loading-message">Loading tracking information...</div>}
      {/* Tracking Results */}
      {hasSearched && trackingData && (
        <div className="tracking-results">
          {/* Package Summary Section */}
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

export default Tracking;