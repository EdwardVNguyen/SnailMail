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

  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
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

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateSecurity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: globalAuthId,
          currentPassword: emailForm.currentPassword,
          newEmail: emailForm.newEmail,
          newPassword: null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Email updated successfully!');
        setEditingEmail(false);
        setEmailForm({
          currentPassword: '',
          newEmail: ''
        });
        // Refetch to get updated email
        const refetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeData?authId=${globalAuthId}`);
        const refetchData = await refetchResponse.json();
        if (refetchData.success) {
          setEmployeeData(refetchData.employee);
        }
      } else {
        setErrorMessage(data.message || 'Failed to update email');
      }
    } catch (error) {
      setErrorMessage('Failed to update email');
      console.error('Update email error:', error);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Validate password confirmation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSavingPassword(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateSecurity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: globalAuthId,
          currentPassword: passwordForm.currentPassword,
          newEmail: null,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Password updated successfully!');
        setEditingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrorMessage(data.message || 'Failed to update password');
      }
    } catch (error) {
      setErrorMessage('Failed to update password');
      console.error('Update password error:', error);
    } finally {
      setIsSavingPassword(false);
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
                <span className="infoLabel">Facility:</span>
                <span className="infoValue">{employeeData?.facility_name || '—'}</span>
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

        {/* Login & Security Card */}
        <div className="profileCard" style={{ gridColumn: '1 / -1' }}>
          <div className="cardHeader">
            <h2>Login & Security</h2>
          </div>
          <div className="cardContent">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Email Section */}
              <div style={{
                padding: '1.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Email Address</h3>
                {editingEmail ? (
                  <form onSubmit={handleSaveEmail}>
                    <div className="formGroup">
                      <label>Current Email</label>
                      <input
                        type="email"
                        value={employeeData?.email || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="formGroup">
                      <label>New Email Address *</label>
                      <input
                        type="email"
                        name="newEmail"
                        value={emailForm.newEmail}
                        onChange={handleEmailChange}
                        placeholder="Enter new email"
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={emailForm.currentPassword}
                        onChange={handleEmailChange}
                        placeholder="Enter password to confirm"
                        required
                      />
                    </div>

                    <div className="buttonRow">
                      <button type="submit" className="saveButton" disabled={isSavingEmail}>
                        {isSavingEmail ? 'Saving...' : 'Update Email'}
                      </button>
                      <button type="button" className="cancelButton" onClick={() => {
                        setEditingEmail(false);
                        setEmailForm({ currentPassword: '', newEmail: '' });
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="infoRow">
                      <span className="infoLabel">Current Email:</span>
                      <span className="infoValue">{employeeData?.email || '—'}</span>
                    </div>
                    <button
                      className="editButton"
                      onClick={() => setEditingEmail(true)}
                      disabled={editing || editingPassword}
                      style={{ marginTop: '1rem' }}
                    >
                      Change Email
                    </button>
                  </div>
                )}
              </div>

              {/* Password Section */}
              <div style={{
                padding: '1.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Password</h3>
                {editingPassword ? (
                  <form onSubmit={handleSavePassword}>
                    <div className="formGroup">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <label>New Password *</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <label>Confirm New Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <div className="buttonRow">
                      <button type="submit" className="saveButton" disabled={isSavingPassword}>
                        {isSavingPassword ? 'Saving...' : 'Update Password'}
                      </button>
                      <button type="button" className="cancelButton" onClick={() => {
                        setEditingPassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="infoRow">
                      <span className="infoLabel">Current Password:</span>
                      <span className="infoValue">••••••••</span>
                    </div>
                    <button
                      className="editButton"
                      onClick={() => setEditingPassword(true)}
                      disabled={editing || editingEmail}
                      style={{ marginTop: '1rem' }}
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
