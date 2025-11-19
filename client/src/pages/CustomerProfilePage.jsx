import './CustomerProfilePage.css';
import { useState, useEffect } from 'react';
import { getCustomerData } from '../utils/getCustomerData.js';
import { useNavigate } from 'react-router-dom';

const CustomerProfilePage = ({ globalAuthId }) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Fetch customer data
  useEffect(() => {
      const fetchData = async () => {
          const data = await getCustomerData(globalAuthId);
          setCustomerInfo(data);
      };
      fetchData();
  }, [globalAuthId]);

  // Fetch notification data (tracking event updates)
  useEffect(() => {
      const fetchData = async () => {
          const data = await getNotificationData(globalAuthId);
          setNotifications(data);
      };
      fetchData();
  }, [globalAuthId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateCustomerInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: customerInfo.customer.customer_id,
          firstName: customerInfo.customer.first_name,
          lastName: customerInfo.customer.last_name,
          birthDate: customerInfo.customer.birth_date,
          streetName: customerInfo.customer.street_name,
          cityName: customerInfo.customer.city_name,
          stateName: customerInfo.customer.state_name,
          zipCode: customerInfo.customer.zip_code,
          addressId: customerInfo.customer.address_id,
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to save changes');
      }
    } catch (err) {
      setError('Failed to save changes. Please check your input and try again.');
      console.error('Save Changes Error:', err);
    } finally {
      setEditing(false);;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!customerInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="customerProfilePageContainer">
      
      {/*Updated Profile Success*/}
      {success && <div className="success-message">
          <h2> Profile Updated! </h2>
      </div>
      }

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Profile Header */}
      <div className="profileHeader">
        <h1>Your Profile</h1>
        <p>Manage your account, subscription, and notifications</p>
      </div>

      {/* Profile Info */}
      <div className="profileCard">
        <h2>Profile Information</h2>

        {editing ? (
          <div className="profileForm">
            <div className="formRow">
              <input
                className="profileInput"
                placeholder="First Name"
                value={customerInfo.customer.first_name || ''}
                onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    first_name: e.target.value
                  }
                })}
              />
              <input
                className="profileInput"
                placeholder="Last Name"
                value={customerInfo.customer.last_name || ''}
                onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    last_name: e.target.value
                  }
                })}
                />
            </div>

              <div className="formRow">
                <input
                  className="profileInput"
                  placeholder="Street"
                  value={customerInfo.customer.street_name || ''}
                  onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    street_name: e.target.value
                  }
                })}
                />
                <input
                  className="profileInput"
                  placeholder="City"
                  value={customerInfo.customer.city_name || ''}
                  onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    city_name: e.target.value
                  }
                })}
                />
              </div>

              <div className="formRow">
                <input
                  className="profileInput"
                  placeholder="State"
                  value={customerInfo.customer.state_name || ''}
                  onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    state_name: e.target.value
                  }
                })}
                />
                <input
                  className="profileInput"
                  placeholder="ZIP Code"
                  value={customerInfo.customer.zip_code || ''}
                  onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    zip_code: e.target.value
                  }
                })}
                />
              </div>

              <div className="formRow">
                <input
                  className="profileInput"
                  type="date"
                  value={customerInfo.customer.birth_date || ''}
                  onChange={(e) => setCustomerInfo({
                  ...customerInfo,
                  customer: {
                    ...customerInfo.customer,
                    birth_date: e.target.value
                  }
                })}
                />
              </div>

              <button className="saveButton" onClick={handleSave}>
                Save Changes
              </button>
            
            </div>
          ) : (
            <div className="profileSummary">
              <p>
                <strong>Name:</strong> {customerInfo.customer.first_name} {customerInfo.customer.last_name}
              </p>
              <p>
                <strong>Address:</strong> {customerInfo.customer.street_name}, {customerInfo.customer.city_name}, {customerInfo.customer.state_name}{' '}
                {customerInfo.customer.zip_code}
              </p>
              <p>
                <strong>Birth Date:</strong> {customerInfo.customer.birth_date || '—'}
              </p>
              <p>
                <strong>Home Post Office:</strong> {customerInfo.customer.home_post_office || '—'}
              </p>

              <button className="actionButton" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="profileCard3">
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p>No recent notifications.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  {n.event_type}: {n.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Log Out */}
        <button className="logoutButton" onClick={handleLogout}>
          Log Out
        </button>
      </div>
  );
};

export default CustomerProfilePage;
