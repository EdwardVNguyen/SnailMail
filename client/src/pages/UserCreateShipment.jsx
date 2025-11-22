import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCreateShipment.css';

import StateSelect from '../components/StateSelect';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';

const CreateShipment = ({ globalAuthId }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    recipientFirstName: '',
    recipientLastName: '',
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [facilities, setFacilities] = useState([]);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Price calculation state
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calculate shipping price
  const calculatePrice = () => {
    const weight = parseFloat(formData.weight) || 0;
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;

    if (weight === 0) {
      setCalculatedPrice(0);
      return;
    }

    // Base rate
    let price = 5.00;

    // Calculate dimensional weight (L x W x H / 139)
    const dimensionalWeight = (length * width * height) / 139;

    // Use greater of actual weight or dimensional weight
    const billableWeight = Math.max(weight, dimensionalWeight);

    // Add weight charge ($0.50 per lb)
    price += billableWeight * 0.50;

    // Package type modifiers
    const typeModifiers = {
      'envelope': -2.00,
      'parcel': 0.00,
      'package': 1.00,
      'mail': -3.00
    };

    price += typeModifiers[formData.packageType] || 0;

    // Ensure minimum price of $2.00
    price = Math.max(price, 2.00);

    setCalculatedPrice(price);
  };

  // Recalculate price when relevant fields change
  useEffect(() => {
    calculatePrice();
  }, [formData.weight, formData.length, formData.width, formData.height, formData.packageType]);

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
      [name]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      console.log('Submitting shipment with data:', { authId: globalAuthId, ...formData });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/createShipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authId: globalAuthId,
          ...formData,
          price: calculatedPrice
        })
      });

      const data = await response.json();
      console.log('Create shipment response:', data);

      if (data.success) {
        setSuccess(true);
        setTrackingNumber(data.tracking_number);

        // Show toast notification
        setToastMessage(`Shipment created successfully! Tracking number: ${data.tracking_number}`);
        setToastType('success');
        setShowToast(true);

        // Reset form
        setFormData({
          recipientFirstName: '',
          recipientLastName: '',
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
        // Show toast for dimension/weight/payment errors
        if (data.errorType === 'dimension_length' ||
            data.errorType === 'dimension_width_height' ||
            data.errorType === 'weight' ||
            data.errorType === 'missing_payment_info' ||
            data.errorType === 'invalid_payment_info') {
          setToast({ show: true, message: data.message, type: 'error' });
        } else {
          setError(data.message || 'Failed to create shipment');
        }
      }
    } catch (err) {
      const errorMsg = 'Failed to create shipment. Please try again.';
      setError(errorMsg);

      // Show toast notification
      setToastMessage(errorMsg);
      setToastType('error');
      setShowToast(true);

      console.error('Create shipment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-shipment-container">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        duration={5000}
        onClose={() => setToast({ show: false, message: '', type: 'error' })}
      />

      {/* Success Modal */}
      {success && (
        <div className="modal-overlay" onClick={() => setSuccess(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', padding: '20px' }}
          >
            <h2 className="modal-header" style={{ fontSize: '18px', marginBottom: '15px' }}>
              ✓ Shipment Created Successfully!
            </h2>
            <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              Your tracking number is: <br />
              <strong style={{ fontSize: '16px' }}>{trackingNumber}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/userTrackPackage/${trackingNumber}`)}
                className="track-button"
                style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }}
              >
                Track Package
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  window.location.reload();
                }}
                className="submit-button"
                style={{ margin: 0, padding: '8px 16px', fontSize: '14px', backgroundColor: '#6c757d' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="shipment-form">
          
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
                value={formData.recipientZipCode}
                onChange={handleInputChange}
                pattern="[0-9]{5}"
                maxLength={5}
                minLength={5}
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

        {/* Estimated Price Section */}
        {calculatedPrice > 0 && (
          <div className="form-section price-display-section">
            <h2>Estimated Shipping Cost</h2>
            <div className="price-display">
              <div className="price-value">
                ${calculatedPrice.toFixed(2)}
              </div>
              <p className="price-note">
                Based on {formData.packageType} package with weight and dimensions provided
              </p>
            </div>
          </div>
        )}

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
            {isSubmitting ? 'Creating Shipment...' : 'Create Shipment'}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default CreateShipment;
