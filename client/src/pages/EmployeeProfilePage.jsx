import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './EmployeeProfilePage.css';
import profileIcon from '../assets/profileIcon.svg';

const EmployeeProfilePage = ({ globalAuthId }) => {
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetName: '',
    cityName: '',
    stateName: '',
    zipCode: '',
    profilePictureUrl: ''
  });

  // Helper: Get profile picture URL or default icon
  const getProfilePicture = (url) => {
    if (!url || url.trim() === '') {
      return profileIcon;
    }
    return url;
  };

  // Helper: Mask SSN (show only last 4 digits)
  const maskSSN = (ssn) => {
    if (!ssn) return '—';
    const ssnStr = String(ssn).trim();
    if (!ssnStr) return '—';
    if (ssnStr.length <= 4) return ssnStr;
    return `***-**-${ssnStr.slice(-4)}`;
  };

  // Helper: Format salary as currency
  const formatSalary = (salary) => {
    if (!salary) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(salary);
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeData?authId=${globalAuthId}`);
        const data = await response.json();
        if (data.success) {
          setEmployeeData(data.employee);
          setFormData({
            firstName: data.employee.first_name || '',
            lastName: data.employee.last_name || '',
            streetName: data.employee.street_name || '',
            cityName: data.employee.city_name || '',
            stateName: data.employee.state_name || '',
            zipCode: data.employee.zip_code || '',
            profilePictureUrl: data.employee.profile_picture_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setErrorMessage('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (globalAuthId) {
      fetchEmployeeData();
    }
  }, [globalAuthId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateEmployeeInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: employeeData.auth_id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetName: formData.streetName,
          cityName: formData.cityName,
          stateName: formData.stateName,
          zipCode: formData.zipCode.trim(),
          addressId: employeeData.address_id,
          profilePictureUrl: formData.profilePictureUrl || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Profile updated successfully!');
        setEditing(false);
        // Refetch to get updated data
        const refetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeData?authId=${globalAuthId}`);
        const refetchData = await refetchResponse.json();
        if (refetchData.success) {
          setEmployeeData(refetchData.employee);
        }
      } else {
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getBackNavigation = () => {
    if (employeeData?.account_type === 'courier') {
      return '/courierPage';
    } else if (employeeData?.account_type === 'clerk') {
      return '/employeePage';
    } else if (employeeData?.account_type === 'manager') {
      return '/managerPage';
    } else {
      return '/employeePage';
    }
  };

  if (!globalAuthId) {
    return (
      <div className="employeeProfilePageContainer">
        <div className="error-state">
          <h2>Authentication Required</h2>
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate('/loginorsignup')} className="primaryButton">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="employeeProfilePageContainer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employeeProfilePageContainer">
      {/* Header */}
      <div className="profileHeader">
        <button onClick={() => navigate(getBackNavigation())} className="backButton">
          ← Back to Dashboard
        </button>
        <div className="profileAvatar">
          <img
            src={getProfilePicture(employeeData?.profile_picture_url)}
            alt="Profile"
            className="avatarImage"
            onError={(e) => { e.target.src = profileIcon; }}
          />
        </div>
        <h1>Your Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {/* Profile Grid */}
      <div className="profileGrid">
        {/* Personal Information Card */}
        <div className="profileCard">
          <div className="cardHeader">
            <h2>Personal Information</h2>
          </div>
          <div className="cardContent">
            {editing ? (
              <form onSubmit={handleSave} className="profileForm">
                <div className="formRow">
                  <div className="formGroup">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label>Profile Picture URL</label>
                  <input
                    type="text"
                    name="profilePictureUrl"
                    value={formData.profilePictureUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>

                <div className="formGroup">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="streetName"
                    value={formData.streetName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>City *</label>
                    <input
                      type="text"
                      name="cityName"
                      value={formData.cityName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label>State *</label>
                    <input
                      type="text"
                      name="stateName"
                      value={formData.stateName}
                      onChange={handleChange}
                      maxLength="2"
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      pattern="[0-9]{5}"
                      required
                    />
                  </div>
                </div>

                <div className="buttonRow">
                  <button type="submit" className="saveButton" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="cancelButton" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="infoDisplay">
                <div className="infoRow">
                  <span className="infoLabel">Name:</span>
                  <span className="infoValue">{employeeData?.first_name} {employeeData?.last_name}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Address:</span>
                  <span className="infoValue">
                    {employeeData?.street_name}, {employeeData?.city_name}, {employeeData?.state_name} {employeeData?.zip_code}
                  </span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Email:</span>
                  <span className="infoValue">{employeeData?.email || '—'}</span>
                </div>
                <button className="editButton" onClick={() => setEditing(true)}>
                  Edit Information
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Employee Information Card (Read-only) */}
        <div className="profileCard">
          <div className="cardHeader">
            <h2>Employment Details</h2>
          </div>
          <div className="cardContent">
            <div className="infoDisplay">
              <div className="infoRow">
                <span className="infoLabel">Employee ID:</span>
                <span className="infoValue">{employeeData?.employee_id || '—'}</span>
              </div>
              <div className="infoRow">
                <span className="infoLabel">Job Type:</span>
                <span className="infoValue">{employeeData?.account_type || '—'}</span>
              </div>
              <div className="infoRow">
                <span className="infoLabel">SSN:</span>
                <span className="infoValue">{maskSSN(employeeData?.employee_ssn)}</span>
              </div>
              <div className="infoRow">
                <span className="infoLabel">Salary:</span>
                <span className="infoValue">{formatSalary(employeeData?.salary)}</span>
              </div>
              {employeeData?.account_type !== 'manager' && (
                <div className="infoNote">
                  <p><strong>Note:</strong> Employment information cannot be edited. Please contact your manager or HR for changes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
