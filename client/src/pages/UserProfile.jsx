import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './UserProfile.css';

const UserProfile = ({ globalAuthId }) => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [contactForm, setContactForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    streetName: '',
    cityName: '',
    stateName: '',
    zipCode: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/getCustomerData?authId=${globalAuthId}`);
        const data = await response.json();
        
        if (data.success) {
          setCustomerData(data.customer);
          setContactForm({
            firstName: data.customer.first_name || '',
            middleName: data.customer.middle_name || '',
            lastName: data.customer.last_name || '',
            phoneNumber: data.customer.phone_number || '',
            streetName: data.customer.street_name || '',
            cityName: data.customer.city_name || '',
            stateName: data.customer.state_name || '',
            zipCode: data.customer.zip_code || ''
          });
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setErrorMessage('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (globalAuthId) {
      fetchCustomerData();
    }
  }, [globalAuthId]);

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };
  const handleSecurityChange = (e) => {
    setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
  };
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8000/updateCustomer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: globalAuthId,
          firstName: contactForm.firstName,
          middleName: contactForm.middleName,
          lastName: contactForm.lastName,
          phoneNumber: contactForm.phoneNumber,
          streetName: contactForm.streetName,
          cityName: contactForm.cityName,
          stateName: contactForm.stateName,
          zipCode: contactForm.zipCode
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Contact information updated successfully!');
        refetchCustomerData
      } else {
        setErrorMessage(data.message || 'Failed to update contact information');
      } 
    } catch (error) {
      setErrorMessage('Failed to update contact information', error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/updateSecurity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: globalAuthId,
          currentPassword: securityForm.currentPassword,
          newEmail: securityForm.newEmail || null,
          newPassword: securityForm.newPassword || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Security settings updated successfully!');
        setSecurityForm({
          currentPassword: '',
          newEmail: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          refetchCustomerData
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to update security settings');
      }

    } catch (error) {
      setErrorMessage('Failed to update security settings', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!globalAuthId) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>Authentication Required</h2>
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate('/login')} className="primary-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  const refetchCustomerData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/getCustomerData?authId=${globalAuthId}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerData(data.customer);
        setContactForm({
          firstName: data.customer.first_name || '',
          middleName: data.customer.middle_name || '',
          lastName: data.customer.last_name || '',
          phoneNumber: data.customer.phone_number || '',
          streetName: data.customer.street_name || '',
          cityName: data.customer.city_name || '',
          stateName: data.customer.state_name || '',
          zipCode: data.customer.zip_code || ''
        });
      }
    } catch (error) {
      console.error('Error refetching customer data:', error);
    }
  };


  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  
  
  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-content">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <button 
            onClick={() => navigate('/customerPage')}
            className="back-nav-button"
          >
            <span className="back-icon">←</span>
          </button>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">OVERVIEW</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">CONTACT INFORMATION</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <span className="nav-icon">🔐</span>
              <span className="nav-text">LOGIN & SECURITY</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="profile-main">
          {/* Messages */}
          {successMessage && (
            <div className="success-banner">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="error-banner">
              {errorMessage}
            </div>
          )}

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="section-content">
              <h2>Overview</h2>
              <div className="overview-subtitle">User Account Tools</div>

              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon">⚠️</div>
                  <div className="card-content">
                    <h3>Review your information</h3>
                    <p>Please confirm your contact information is current.</p>
                  </div>
                  <button 
                    className="card-action-button"
                    onClick={() => setActiveSection('contact')}
                  >
                    UPDATE
                  </button>
                </div>

                <div className="overview-card">
                  <div className="card-icon">🔐</div>
                  <div className="card-content">
                    <h3>Manage your security</h3>
                    <p>Update your email and password to keep your account secure.</p>
                  </div>
                  <button 
                    className="card-action-button"
                    onClick={() => setActiveSection('security')}
                  >
                    UPDATE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {activeSection === 'contact' && (
            <div className="section-content">
              <h2>Contact Information</h2>
              <p className="section-description">Update your personal details and address</p>

              <form onSubmit={handleSaveContact} className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={contactForm.firstName}
                        onChange={handleContactChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={contactForm.middleName}
                        onChange={handleContactChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={contactForm.lastName}
                        onChange={handleContactChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={contactForm.phoneNumber}
                      onChange={handleContactChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Address</h3>
                  
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="streetName"
                      value={contactForm.streetName}
                      onChange={handleContactChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="cityName"
                        value={contactForm.cityName}
                        onChange={handleContactChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="stateName"
                        value={contactForm.stateName}
                        onChange={handleContactChange}
                        maxLength="2"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={contactForm.zipCode}
                        onChange={handleContactChange}
                        pattern="[0-9]{5}"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="save-button" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Login & Security Section */}
          {activeSection === 'security' && (
            <div className="section-content">
              <h2>Login & Security</h2>
              <p className="section-description">Manage your email and password</p>

              <form onSubmit={handleSaveSecurity} className="profile-form">
                <div className="form-section">
                  <h3>Email Address</h3>
                  <p className="field-description">Current email: <strong>{customerData?.email}</strong></p>
                  
                  <div className="form-group">
                    <label>New Email Address</label>
                    <input
                      type="email"
                      name="newEmail"
                      value={securityForm.newEmail}
                      onChange={handleSecurityChange}
                      placeholder="Enter new email"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Password</h3>
                  
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={securityForm.currentPassword}
                      onChange={handleSecurityChange}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={securityForm.newPassword}
                      onChange={handleSecurityChange}
                      placeholder="Enter new password (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={securityForm.confirmPassword}
                      onChange={handleSecurityChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button type="submit" className="save-button" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
