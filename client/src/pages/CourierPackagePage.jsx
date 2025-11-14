import { useState, useEffect } from 'react';
import './CourierPackagePage.css';

const CourierPackagePage = ({ globalAuthId }) => {
  const [availablePackages, setAvailablePackages] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryType: 'recipient_address',
    deliveryNotes: '',
    deliveryPhotoUrl: '',
    recipientName: ''
  });

  // Fetch available packages and courier's assigned packages
  useEffect(() => {
    if (globalAuthId) {
      loadAllPackages();
    }
  }, [globalAuthId]);

  const loadAllPackages = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchAvailablePackages(),
        fetchMyCourierPackages()
      ]);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePackages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getAvailablePackages`
      );
      const data = await response.json();

      if (data.success) {
        setAvailablePackages(data.packages || []);
      } else {
        throw new Error(data.message || 'Failed to fetch available packages');
      }
    } catch (err) {
      console.error('Error fetching available packages:', err);
      throw err;
    }
  };

  const fetchMyCourierPackages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getMyCourierPackages?authId=${globalAuthId}`
      );
      const data = await response.json();

      if (data.success) {
        setMyPackages(data.packages || []);
      } else {
        throw new Error(data.message || 'Failed to fetch your packages');
      }
    } catch (err) {
      console.error('Error fetching courier packages:', err);
      throw err;
    }
  };

  // Request to claim a package (requires clerk approval)
  const handleRequestPackage = async (packageId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/requestPackage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId,
            authId: globalAuthId
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Package request submitted! Waiting for clerk approval.');
        // Remove from available list temporarily
        setAvailablePackages(prev => prev.filter(p => p.package_id !== packageId));

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.message || 'Failed to request package');
      }
    } catch (err) {
      console.error('Error requesting package:', err);
      alert('Error requesting package. Please try again.');
    }
  };

  // Open delivery confirmation modal
  const handleOpenDeliveryModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeliveryModal(true);
    setDeliveryData({
      deliveryType: 'recipient_address',
      deliveryNotes: '',
      deliveryPhotoUrl: '',
      recipientName: ''
    });
  };

  // Close delivery modal
  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedPackage(null);
  };

  // Confirm delivery
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();

    if (!selectedPackage) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/confirmDelivery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPackage.package_id,
            authId: globalAuthId,
            ...deliveryData
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        handleCloseDeliveryModal();

        // Refresh packages
        await fetchMyCourierPackages();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.message || 'Failed to confirm delivery');
      }
    } catch (err) {
      console.error('Error confirming delivery:', err);
      alert('Error confirming delivery. Please try again.');
    }
  };

  return (
    <div className="courierPageContainer">
      {/* Header */}
      <div className="courierPageHeader">
        <h1>Courier Package Dashboard</h1>
        <p>Request packages and manage your deliveries</p>
      </div>

      {/* Error Message */}
      {error && <div className="error">{error}</div>}

      {/* Success Message */}
      {successMessage && (
        <div className="successMessage">{successMessage}</div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading packages...</p>
        </div>
      ) : (
        <>
          {/* Available Packages Section */}
          <section className="packagesSection">
            <h2>Available Packages</h2>
            <p className="sectionDescription">
              Request packages to deliver. Clerk approval required.
            </p>

            {availablePackages.length === 0 ? (
              <p className="emptyState">No packages available at this time.</p>
            ) : (
              <div className="packagesGrid">
                {availablePackages.map(pkg => (
                  <div key={pkg.package_id} className="packageCard">
                    <div className="packageHeader">
                      {pkg.tracking_number}
                    </div>

                    <div className="packageDetails">
                      <p><strong>Type:</strong> {pkg.package_type}</p>
                      <p><strong>Weight:</strong> {pkg.weight} kg</p>
                      <p><strong>From:</strong> {pkg.facility_name}</p>
                      <p><strong>To:</strong> {pkg.recipient_city}, {pkg.recipient_state}</p>
                      <p><strong>Recipient:</strong> {pkg.recipient_first_name} {pkg.recipient_last_name}</p>
                    </div>

                    <button
                      className="actionButton"
                      onClick={() => handleRequestPackage(pkg.package_id)}
                    >
                      Request Package
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Assigned Packages Section */}
          <section className="packagesSection">
            <h2>My Assigned Packages</h2>
            <p className="sectionDescription">
              Packages assigned to you for delivery
            </p>

            {myPackages.length === 0 ? (
              <p className="emptyState">You don't have any assigned packages yet.</p>
            ) : (
              <div className="packagesGrid">
                {myPackages.map(pkg => (
                  <div key={pkg.package_id} className="packageCard assignedCard">
                    <div className="packageHeader">
                      {pkg.tracking_number}
                    </div>

                    <div className="packageDetails">
                      <p><strong>Type:</strong> {pkg.package_type}</p>
                      <p><strong>Weight:</strong> {pkg.weight} kg</p>
                      <p className="packageStatus">
                        <strong>Status:</strong> {pkg.delivery_status}
                      </p>

                      <hr />

                      <p><strong>Deliver To:</strong></p>
                      {pkg.destination_type === 'facility' ? (
                        <p>{pkg.destination_facility_name}</p>
                      ) : (
                        <>
                          <p>{pkg.recipient_first_name} {pkg.recipient_last_name}</p>
                          <p>{pkg.recipient_street}</p>
                          <p>{pkg.recipient_city}, {pkg.recipient_state} {pkg.recipient_zip}</p>
                        </>
                      )}

                      {pkg.notes && (
                        <p><strong>Notes:</strong> {pkg.notes}</p>
                      )}
                    </div>

                    {pkg.delivery_status !== 'delivered' && (
                      <button
                        className="actionButton deliverButton"
                        onClick={() => handleOpenDeliveryModal(pkg)}
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && selectedPackage && (
        <div className="modalOverlay" onClick={handleCloseDeliveryModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Confirm Delivery</h2>
              <button className="closeButton" onClick={handleCloseDeliveryModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery}>
              <div className="formGroup">
                <label>Package: {selectedPackage.tracking_number}</label>
              </div>

              <div className="formGroup">
                <label htmlFor="deliveryType">Delivery Type:</label>
                <select
                  id="deliveryType"
                  value={deliveryData.deliveryType}
                  onChange={(e) => setDeliveryData(prev => ({
                    ...prev,
                    deliveryType: e.target.value
                  }))}
                  required
                >
                  <option value="recipient_address">Recipient Address</option>
                  <option value="facility">Facility</option>
                </select>
              </div>

              {deliveryData.deliveryType === 'recipient_address' && (
                <>
                  <div className="formGroup">
                    <label htmlFor="recipientName">Received By (Optional):</label>
                    <input
                      type="text"
                      id="recipientName"
                      value={deliveryData.recipientName}
                      onChange={(e) => setDeliveryData(prev => ({
                        ...prev,
                        recipientName: e.target.value
                      }))}
                      placeholder="Who received the package"
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="deliveryPhotoUrl">Photo URL (Optional):</label>
                    <input
                      type="text"
                      id="deliveryPhotoUrl"
                      value={deliveryData.deliveryPhotoUrl}
                      onChange={(e) => setDeliveryData(prev => ({
                        ...prev,
                        deliveryPhotoUrl: e.target.value
                      }))}
                      placeholder="URL to delivery photo"
                    />
                    <small>Take a photo of the delivered package and paste the URL here</small>
                  </div>
                </>
              )}

              <div className="formGroup">
                <label htmlFor="deliveryNotes">Delivery Notes (Optional):</label>
                <textarea
                  id="deliveryNotes"
                  value={deliveryData.deliveryNotes}
                  onChange={(e) => setDeliveryData(prev => ({
                    ...prev,
                    deliveryNotes: e.target.value
                  }))}
                  placeholder="Any additional notes about the delivery"
                  rows="3"
                />
              </div>

              <div className="modalActions">
                <button type="button" className="cancelButton" onClick={handleCloseDeliveryModal}>
                  Cancel
                </button>
                <button type="submit" className="confirmButton">
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierPackagePage;
