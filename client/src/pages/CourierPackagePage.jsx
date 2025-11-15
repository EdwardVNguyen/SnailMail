import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourierPackagePage.css';

const CourierPackagePage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-packages'

  // Available packages state
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // My packages state
  const [myPackages, setMyPackages] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [deliveryType, setDeliveryType] = useState('recipient'); // 'recipient' or 'facility'
  const [deliveryFacilityId, setDeliveryFacilityId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [facilities, setFacilities] = useState([]);

  // Fetch available packages
  const fetchAvailablePackages = async () => {
    setLoadingAvailable(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getAvailablePackagesForCourier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId })
      });
      const data = await response.json();
      if (data.success) {
        setAvailablePackages(data.packages);
      }
    } catch (err) {
      console.error('Error fetching available packages:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Fetch my packages (in transit)
  const fetchMyPackages = async () => {
    setLoadingMy(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getMyCourierPackages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId })
      });
      const data = await response.json();
      if (data.success) {
        setMyPackages(data.packages);
      }
    } catch (err) {
      console.error('Error fetching my packages:', err);
    } finally {
      setLoadingMy(false);
    }
  };

  // Fetch facilities for delivery dropdown
  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities?status=active`);
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailablePackages();
    } else {
      fetchMyPackages();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Handle picking up a package
  const handlePickupPackage = async (packageId) => {
    const confirmed = window.confirm('Pick up this package?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pickupPackage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Package picked up successfully!');
        fetchAvailablePackages();
        fetchMyPackages();
      } else {
        alert('Error picking up package: ' + data.message);
      }
    } catch (err) {
      console.error('Error picking up package:', err);
      alert('Error picking up package.');
    }
  };

  // Open delivery modal
  const openDeliveryModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeliveryModal(true);
    setDeliveryType('recipient');
    setDeliveryFacilityId('');
    setPhotoUrl('');
  };

  // Handle delivery confirmation
  const handleDeliverPackage = async () => {
    if (deliveryType === 'facility' && !deliveryFacilityId) {
      alert('Please select a delivery facility.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deliverPackage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.package_id,
          deliveryType,
          deliveryFacilityId: deliveryType === 'facility' ? deliveryFacilityId : null,
          photoUrl: deliveryType === 'recipient' ? photoUrl : null,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Package delivered successfully!');
        setShowDeliveryModal(false);
        fetchMyPackages();
      } else {
        alert('Error delivering package: ' + data.message);
      }
    } catch (err) {
      console.error('Error delivering package:', err);
      alert('Error delivering package.');
    }
  };

  return (
    <div className="courier-package-container">
      <div className="courier-header">
        <h1>Courier Packages</h1>
        <button onClick={() => navigate('/courierPage')} className="back-button">
          ← Back
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="courier-tabs">
        <button
          onClick={() => setActiveTab('available')}
          className={`courier-tab ${activeTab === 'available' ? 'active' : ''}`}
        >
          Available Packages
        </button>
        <button
          onClick={() => setActiveTab('my-packages')}
          className={`courier-tab ${activeTab === 'my-packages' ? 'active' : ''}`}
        >
          My Packages
        </button>
      </div>

      {/* Available Packages Section */}
      {activeTab === 'available' && (
        <div className="packages-section">
          <h2>Available Packages at Facilities</h2>
          {loadingAvailable ? (
            <p>Loading...</p>
          ) : availablePackages.length === 0 ? (
            <p>No available packages at this time.</p>
          ) : (
            <div className="packages-grid">
              {availablePackages.map((pkg) => (
                <div key={pkg.package_id} className="package-card">
                  <div className="package-header">
                    <h3>Package #{pkg.package_id}</h3>
                    <span className="tracking-badge">{pkg.tracking_number}</span>
                  </div>
                  <div className="package-details">
                    <p><strong>From:</strong> {pkg.sender_name}</p>
                    <p><strong>To:</strong> {pkg.recipient_name}</p>
                    <p><strong>Current Location:</strong> {pkg.facility_name}</p>
                    <p><strong>Destination:</strong> {pkg.recipient_street}, {pkg.recipient_city}, {pkg.recipient_state}</p>
                    <p><strong>Weight:</strong> {pkg.weight} kg</p>
                    <p><strong>Status:</strong> <span className="status-badge">{pkg.package_status}</span></p>
                  </div>
                  <button
                    onClick={() => handlePickupPackage(pkg.package_id)}
                    className="pickup-button"
                  >
                    Pick Up Package
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Packages Section */}
      {activeTab === 'my-packages' && (
        <div className="packages-section">
          <h2>My Packages (In Transit)</h2>
          {loadingMy ? (
            <p>Loading...</p>
          ) : myPackages.length === 0 ? (
            <p>You don't have any packages in transit.</p>
          ) : (
            <div className="packages-grid">
              {myPackages.map((pkg) => (
                <div key={pkg.package_id} className="package-card">
                  <div className="package-header">
                    <h3>Package #{pkg.package_id}</h3>
                    <span className="tracking-badge">{pkg.tracking_number}</span>
                  </div>
                  <div className="package-details">
                    <p><strong>From:</strong> {pkg.sender_name}</p>
                    <p><strong>To:</strong> {pkg.recipient_name}</p>
                    <p><strong>Destination:</strong> {pkg.recipient_street}, {pkg.recipient_city}, {pkg.recipient_state}</p>
                    <p><strong>Weight:</strong> {pkg.weight} kg</p>
                    <p><strong>Status:</strong> <span className="status-badge">{pkg.package_status}</span></p>
                  </div>
                  <button
                    onClick={() => openDeliveryModal(pkg)}
                    className="deliver-button"
                  >
                    Deliver Package
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Deliver Package #{selectedPackage?.package_id}</h2>

            <div className="form-group">
              <label>Delivery Type:</label>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                <option value="recipient">Deliver to Recipient</option>
                <option value="facility">Transfer to Facility</option>
              </select>
            </div>

            {deliveryType === 'facility' && (
              <div className="form-group">
                <label>Select Facility:</label>
                <select value={deliveryFacilityId} onChange={(e) => setDeliveryFacilityId(e.target.value)}>
                  <option value="">-- Select Facility --</option>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>
                      {facility.facility_name} ({facility.city_name}, {facility.state_name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {deliveryType === 'recipient' && (
              <div className="form-group">
                <label>Photo URL (optional):</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleDeliverPackage} className="confirm-button">
                Confirm Delivery
              </button>
              <button onClick={() => setShowDeliveryModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierPackagePage;
