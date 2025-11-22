import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './CustomerProfilePage.css';
import profileIcon from '../assets/profileIcon.svg';

const CustomerProfilePage = ({ globalAuthId }) => {
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    streetName: '',
    cityName: '',
    stateName: '',
    zipCode: '',
    cardNumber: '',
    securityCode: '',
    expirationDate: '',
    profilePictureUrl: ''
  });

  // Helper: Get profile picture URL or default icon
  const getProfilePicture = (url) => {
    if (!url || url.trim() === '') {
      return profileIcon;
    }
    return url;
  };

  // Helper: Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper: Format month for input (YYYY-MM)
  const formatMonthForInput = (mmyyyyString) => {
    if (!mmyyyyString) return '';
    if (/^\d{2}\/\d{4}$/.test(mmyyyyString)) {
      const [month, year] = mmyyyyString.split('/');
      return `${year}-${month}`;
    }
    return mmyyyyString;
  };

  // Helper: Format card number with dashes
  const formatCardNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join('-');
  };

  // Helper: Mask card number for display
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'No card on file';
    const cleanCard = String(cardNumber).replace(/\D/g, '');
    if (cleanCard.length < 4) return cardNumber;
    const lastFour = cleanCard.slice(-4);
    return `****-****-****-${lastFour}`;
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getCustomerData?authId=${globalAuthId}`);
        const data = await response.json();
        if (data.success) {
          setCustomerData(data.customer);
          setFormData({
            firstName: data.customer.first_name || '',
            lastName: data.customer.last_name || '',
            birthDate: formatDateForInput(data.customer.birth_date) || '',
            streetName: data.customer.street_name || '',
            cityName: data.customer.city_name || '',
            stateName: data.customer.state_name || '',
            zipCode: data.customer.zip_code || '',
            cardNumber: data.customer.card_number || '',
            securityCode: data.customer.security_code || '',
            expirationDate: formatMonthForInput(data.customer.expiration_date) || '',
            profilePictureUrl: data.customer.profile_picture_url || ''
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

  const handleChange = (e) => {
    let value = e.target.value;

    // Format card number as user types
    if (e.target.name === 'cardNumber') {
      value = formatCardNumber(value);
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Convert birth_date to YYYY-MM-DD format for database
      let birthDateForDB = formData.birthDate;
      if (birthDateForDB && birthDateForDB.includes('T')) {
        birthDateForDB = birthDateForDB.split('T')[0];
      }

      // Convert expiration date from YYYY-MM to MM/YYYY for database
      let expirationDateForDB = formData.expirationDate;
      if (expirationDateForDB && /^\d{4}-\d{2}$/.test(expirationDateForDB)) {
        const [year, month] = expirationDateForDB.split('-');
        expirationDateForDB = `${month}/${year}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateCustomerInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: customerData.auth_id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: birthDateForDB,
          streetName: formData.streetName,
          cityName: formData.cityName,
          stateName: formData.stateName,
          zipCode: formData.zipCode,
          addressId: customerData.address_id,
          cardNumber: formData.cardNumber || null,
          securityCode: formData.securityCode || null,
          expirationDate: expirationDateForDB || null,
          profilePictureUrl: formData.profilePictureUrl || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Profile updated successfully!');
        setEditing(false);
        // Refetch to get updated data
        const refetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/getCustomerData?authId=${globalAuthId}`);
        const refetchData = await refetchResponse.json();
        if (refetchData.success) {
          setCustomerData(refetchData.customer);
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

  if (!globalAuthId) {
    return (
      <div className="customerProfilePageContainer">
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
      <div className="customerProfilePageContainer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customerProfilePageContainer">
      {/* Header */}
      <div className="profileHeader">
        <button onClick={() => navigate('/customerPage')} className="backButton">
          ← Back to Dashboard
        </button>
        <div className="profileAvatar">
          <img
            src={getProfilePicture(customerData?.profile_picture_url)}
            alt="Profile"
            className="avatarImage"
            onError={(e) => { e.target.src = profileIcon; }}
          />
        </div>
        <h1>Your Profile</h1>
        <p>Manage your personal information and payment details</p>
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
                  <label>Birth Date</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
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
                  <span className="infoValue">{customerData?.first_name} {customerData?.last_name}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Birth Date:</span>
                  <span className="infoValue">{customerData?.birth_date ? new Date(customerData.birth_date).toLocaleDateString() : '—'}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Address:</span>
                  <span className="infoValue">
                    {customerData?.street_name}, {customerData?.city_name}, {customerData?.state_name} {customerData?.zip_code}
                  </span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Email:</span>
                  <span className="infoValue">{customerData?.email || '—'}</span>
                </div>
                <button className="editButton" onClick={() => setEditing(true)}>
                  Edit Information
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information Card */}
        <div className="profileCard">
          <div className="cardHeader">
            <h2>Payment Information</h2>
          </div>
          <div className="cardContent">
            {editing ? (
              <div className="profileForm">
                <div className="formGroup">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234-5678-9012-3456"
                    maxLength="19"
                  />
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Security Code (CVV)</label>
                    <input
                      type="text"
                      name="securityCode"
                      value={formData.securityCode}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="3"
                      pattern="[0-9]{3}"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Expiration Date</label>
                    <input
                      type="month"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="infoDisplay">
                <div className="infoRow">
                  <span className="infoLabel">Card Number:</span>
                  <span className="infoValue">{maskCardNumber(customerData?.card_number)}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Security Code:</span>
                  <span className="infoValue">{customerData?.security_code ? '***' : '—'}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">Expiration:</span>
                  <span className="infoValue">{customerData?.expiration_date || '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
