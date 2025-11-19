import './CustomerProfilePage.css';
import { useState, useEffect } from 'react';
import { getEmployeeData } from '../utils/getEmployeeData.js';
import { useNavigate } from 'react-router-dom';

const EmployeeProfilePage = ({ globalAuthId }) => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Fetch employee data
  useEffect(() => {
      const fetchData = async () => {
          const data = await getEmployeeData(globalAuthId);
          setEmployeeInfo(data);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateEmployee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: employeeInfo.employee.employee_id,
          firstName: employeeInfo.employee.first_name,
          lastName: employeeInfo.employee.last_name,
          streetName: employeeInfo.employee.street_name,
          cityName: employeeInfo.employee.city_name,
          stateName: employeeInfo.employee.state_name,
          zipCode: employeeInfo.employee.zip_code,
          addressId: employeeInfo.employee.address_id,
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

  if (!employeeInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="EmployeeProfilePageContainer">
      
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
                value={employeeInfo.employee.first_name || ''}
                onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    first_name: e.target.value
                  }
                })}
              />
              <input
                className="profileInput"
                placeholder="Last Name"
                value={employeeInfo.employee.last_name || ''}
                onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    last_name: e.target.value
                  }
                })}
                />
            </div>

              <div className="formRow">
                <input
                  className="profileInput"
                  placeholder="Street"
                  value={employeeInfo.employee.street_name || ''}
                  onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    street_name: e.target.value
                  }
                })}
                />
                <input
                  className="profileInput"
                  placeholder="City"
                  value={employeeInfo.employee.city_name || ''}
                  onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    city_name: e.target.value
                  }
                })}
                />
              </div>

              <div className="formRow">
                <input
                  className="profileInput"
                  placeholder="State"
                  value={employeeInfo.employee.state_name || ''}
                  onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    state_name: e.target.value
                  }
                })}
                />
                <input
                  className="profileInput"
                  placeholder="ZIP Code"
                  value={employeeInfo.employee.zip_code || ''}
                  onChange={(e) => setEmployeeInfo({
                  ...employeeInfo,
                  employee: {
                    ...employeeInfo.employee,
                    zip_code: e.target.value
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
                <strong>Name:</strong> {employeeInfo.employee.first_name} {employeeInfo.employee.last_name}
              </p>
              <p>
                <strong>Address:</strong> {employeeInfo.employee.street_name}, {employeeInfo.employee.city_name}, {employeeInfo.employee.state_name}{' '}
                {employeeInfo.employee.zip_code}
              </p>
              <p>
                <strong>Home Post Office:</strong> {employeeInfo.employee.home_post_office || '—'}
              </p>
              <p>
                <strong>Role:</strong> {employeeInfo.employee.account_type || '—'}
              </p>
              <p>
                <strong>SSN:</strong> {employeeInfo.employee.employee_ssn || '—'}
              </p>
              <p>
                <strong>Salary:</strong> {employeeInfo.employee.salary || '—'}
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

export default EmployeeProfilePage;
