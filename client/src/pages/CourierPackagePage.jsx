import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CourierPackagePage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { encodePackageId, formatTrackingNumber } from '../utils/idEncoder';

const CourierPackagePage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get initial tab from URL params, default to 'available'
  const initialTab = searchParams.get('tab') === 'my-packages' ? 'my-packages' : 'available';
  const [activeTab, setActiveTab] = useState(initialTab); // 'available' or 'my-packages'

  // Available packages state
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [facilityName, setFacilityName] = useState('');

  // My packages state
  const [myPackages, setMyPackages] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [deliveryType, setDeliveryType] = useState('recipient'); // 'recipient' or 'facility'
  const [deliveryFacilityId, setDeliveryFacilityId] = useState('');
  const [facilities, setFacilities] = useState([]);

  // Request package modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPackage, setRequestPackage] = useState(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

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

  // Fetch courier's facility name
  const fetchCourierFacility = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeId?authId=${authId}`);
      const data = await response.json();
      if (data.success && data.employee) {
        setFacilityName(data.employee.facility_name || '');
      }
    } catch (err) {
      console.error('Error fetching courier facility:', err);
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
    fetchCourierFacility();
  }, []);

  // Open request modal
  const openRequestModal = (pkg) => {
    setRequestPackage(pkg);
    setShowRequestModal(true);
  };

  // Handle requesting a package
  const handleRequestPackage = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/createCourierRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: requestPackage.package_id,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Package pickup request submitted successfully! Wait for clerk approval.');
        setShowRequestModal(false);
        fetchAvailablePackages();
      } else {
        showErrorToast('Error requesting package: ' + data.message);
      }
    } catch (err) {
      console.error('Error requesting package:', err);
      showErrorToast('Error requesting package.');
    }
  };

  // Open delivery modal
  const openDeliveryModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeliveryModal(true);
    setDeliveryType('recipient');
    setDeliveryFacilityId('');
  };

  // Handle delivery confirmation
  const handleDeliverPackage = async () => {
    if (deliveryType === 'facility' && !deliveryFacilityId) {
      showErrorToast('Please select a delivery facility.');
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
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Package delivered successfully!');
        setShowDeliveryModal(false);
        fetchMyPackages();
      } else {
        showErrorToast('Error delivering package: ' + data.message);
      }
    } catch (err) {
      console.error('Error delivering package:', err);
      showErrorToast('Error delivering package.');
    }
  };

  return (
    <div className="courier-package-container">
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
          <h2>Available Packages at {facilityName || 'My Facility'}</h2>
          {loadingAvailable ? (
            <p>Loading...</p>
          ) : availablePackages.length === 0 ? (
            <p>No available packages at this time.</p>
          ) : (
            <div className="packages-grid">
              {availablePackages.map((pkg) => (
                <div key={pkg.package_id} className="package-card">
                  <div className="package-header">
                    <h3>{encodePackageId(pkg.package_id)}</h3>
                    <span className="tracking-badge">{formatTrackingNumber(pkg.tracking_number)}</span>
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
                    onClick={() => openRequestModal(pkg)}
                    className="pickup-button"
                  >
                    Request Package
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
                    <h3>{encodePackageId(pkg.package_id)}</h3>
                    <span className="tracking-badge">{formatTrackingNumber(pkg.tracking_number)}</span>
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

      {/* Request Package Modal */}
      <Modal
        show={showRequestModal}
        title="Request Package Pickup"
        onClose={() => setShowRequestModal(false)}
      >
        <p className="modal-subtitle">
          {encodePackageId(requestPackage?.package_id)} - {formatTrackingNumber(requestPackage?.tracking_number)}
        </p>

        <div className="form-group">
          <label>Package Details:</label>
          <p><strong>From:</strong> {requestPackage?.sender_name}</p>
          <p><strong>To:</strong> {requestPackage?.recipient_name}</p>
          <p><strong>Destination:</strong> {requestPackage?.recipient_street}, {requestPackage?.recipient_city}, {requestPackage?.recipient_state}</p>
          <p><strong>Current Location:</strong> {requestPackage?.facility_name}</p>
          <p><strong>Weight:</strong> {requestPackage?.weight} kg</p>
        </div>

        <div className="modal-actions">
          <button onClick={handleRequestPackage} className="modal-submit-button">
            Confirm Request
          </button>
          <button onClick={() => setShowRequestModal(false)} className="modal-cancel-button">
            Cancel
          </button>
        </div>
      </Modal>

      {/* Delivery Modal */}
      <Modal
        show={showDeliveryModal}
        title={`Deliver ${encodePackageId(selectedPackage?.package_id)}`}
        onClose={() => setShowDeliveryModal(false)}
      >
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

        <div className="modal-actions">
          <button onClick={handleDeliverPackage} className="modal-submit-button">
            Confirm Delivery
          </button>
          <button onClick={() => setShowDeliveryModal(false)} className="modal-cancel-button">
            Cancel
          </button>
        </div>
      </Modal>

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

export default CourierPackagePage;
