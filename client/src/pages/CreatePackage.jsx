import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import StateSelect from '../components/StateSelect';
import './CreatePackage.css';

const CreatePackage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    senderFirstName: '',
    senderMiddleName: '',
    senderLastName: '',
    senderPhone: '',
    senderEmail: '',
    senderStreet: '',
    senderCity: '',
    senderState: '',
    senderZipCode: '',

    recipientFirstName: '',
    recipientMiddleName: '',
    recipientLastName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientStreet: '',
    recipientCity: '',
    recipientState: '',
    recipientZipCode: '',

    packageType: 'parcel', // package type is parcel by default
    weight: '',
    length: '',
    width: '',
    height: '',

    facility_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/getFacilityForCustomer`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Facility API Response:", data);
      // Make sure it's an array before setting
      if (data.success && Array.isArray(data.facilities)) {
        setFacilities(data.facilities);
      } else {
        console.error("Unexpected API response:", data);
        setFacilities([]); // fallback to empty array
      }
    })
    .catch((err) => {
      console.error("Error loading facilities:", err);
      setFacilities([]); // also fallback on error
    });
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "facility_id" ? Number(value) : value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/createPackage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTrackingNumber(data.tracking_number);
        // Reset form
        setFormData({
          senderFirstName: '',
          senderMiddleName: '',
          senderLastName: '',
          senderPhone: '',
          senderEmail: '',
          senderStreet: '',
          senderCity: '',
          senderState: '',
          senderZipCode: '',

          recipientFirstName: '',
          recipientMiddleName: '',
          recipientLastName: '',
          recipientPhone: '',
          recipientEmail: '',
          recipientStreet: '',
          recipientCity: '',
          recipientState: '',
          recipientZipCode: '',

          packageType: 'parcel',
          weight: '',
          length: '',
          width: '',
          height: '',

          facility_id: ''
        });
      } else {
        setError(data.message || 'Failed to create package');
      }
    } catch (err) {
      setError('Failed to create package. Please try again.');
      console.error('Create package error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-package-container">

      {/* Success Message */}
      {success && (
        <div className="success-message">
          <h2>✓ Package Created Successfully!</h2>
          <p>Your tracking number is: <strong>{trackingNumber}</strong></p>
          <p className="save-notice">Please save this tracking number to track your package.</p>
          <button 
            onClick={() => navigate(`/tracking`)}
            className="track-button"
          >
            Track This Package
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="package-form">
        {/* Sender Information Section */}
        <div className="form-section">
          <h2>Sender Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senderFirstName">First Name *</label>
              <input
                type="text"
                id="senderFirstName"
                name="senderFirstName"
                value={formData.senderFirstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderMiddleName">Middle Name</label>
              <input
                type="text"
                id="senderMiddleName"
                name="senderMiddleName"
                value={formData.senderMiddleName}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderLastName">Last Name *</label>
              <input
                type="text"
                id="senderLastName"
                name="senderLastName"
                value={formData.senderLastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senderEmail">Email *</label>
              <input
                type="email"
                id="senderEmail"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderPhone">Phone Number</label>
              <input
                type="tel"
                id="senderPhone"
                name="senderPhone"
                maxLength={10}
                minLength={10}
                pattern="[0-9]*"
                value={formData.senderPhone}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Sender Address Section */}
        <div className="form-section">
          <h2>Sender Address</h2>
          
          <div className="form-group">
            <label htmlFor="senderStreet">Street Address *</label>
            <input
              type="text"
              id="senderStreet"
              name="senderStreet"
              value={formData.senderStreet}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senderCity">City *</label>
              <input
                type="text"
                id="senderCity"
                name="senderCity"
                value={formData.senderCity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderState">State *</label>
              <StateSelect
                value={formData.senderState}
                onChange={handleInputChange}
                id="senderState"
                name="senderState"
              />
             </div>

            <div className="form-group">
              <label htmlFor="senderZipCode">ZIP Code *</label>
              <input
                type="text"
                id="senderZipCode"
                name="senderZipCode"
                maxLength={5}
                minLength={5}
                value={formData.senderZipCode}
                onChange={handleInputChange}
                pattern="[0-9]{5}"
                placeholder="12345"
                required
              />
            </div>
          </div>
        </div>

        {/* Recipient Information Section */}
        <div className="form-section">
          <h2>Recipient Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientFirstName">First Name *</label>
              <input
                type="text"
                id="recipientFirstName"
                name="recipientFirstName"
                value={formData.recipientFirstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderMiddleName">Middle Name</label>
              <input
                type="text"
                id="recipientMiddleName"
                name="recipientMiddleName"
                value={formData.recipientMiddleName}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientLastName">Last Name *</label>
              <input
                type="text"
                id="recipientLastName"
                name="recipientLastName"
                value={formData.recipientLastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientEmail">Email *</label>
              <input
                type="email"
                id="recipientEmail"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientPhone">Phone Number</label>
              <input
                type="tel"
                id="recipientPhone"
                name="recipientPhone"
                maxLength={10}
                minLength={10}
                pattern="[0-9]*"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Recipient Address Section */}
        <div className="form-section">
          <h2>Recipient Address</h2>
          
          <div className="form-group">
            <label htmlFor="recipientStreet">Street Address *</label>
            <input
              type="text"
              id="recipientStreet"
              name="recipientStreet"
              value={formData.recipientStreet}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientCity">City *</label>
              <input
                type="text"
                id="recipientCity"
                name="recipientCity"
                value={formData.recipientCity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientState">State *</label>
              <StateSelect
                value={formData.recipientState}
                onChange={handleInputChange}
                id="recipientState"
                name="recipientState"
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientZipCode">ZIP Code *</label>
              <input
                type="text"
                id="recipientZipCode"
                name="recipientZipCode"
                maxLength={5}
                minLength={5}
                value={formData.recipientZipCode}
                onChange={handleInputChange}
                pattern="[0-9]{5}"
                placeholder="12345"
                required
              />
            </div>
          </div>
        </div>

        {/* Package Details Section */}
        <div className="form-section">
          <h2>Package Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="packageType">Package Type *</label>
              <select
                id="packageType"
                name="packageType"
                value={formData.packageType}
                onChange={handleInputChange}
                required
              >
                <option value="parcel">Parcel</option>
                <option value="mail">Mail</option>
                <option value="package">Package</option>
                <option value="envelope">Envelope</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="length">Length (cm) *</label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="width">Width (cm) *</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (cm) *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Drop Off Location</h2>
        
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="facilitySelect">Select Facility:</label>
                <select
                  id="facilitySelect"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Choose a Facility --</option>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>
                      {facility.facility_name}
                    </option>
                  ))}
                </select>
           </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Package...' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePackage;
