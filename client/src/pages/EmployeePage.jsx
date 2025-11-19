import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeePage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import Pagination from '../utils/Pagination';
import { encodePackageId, formatTrackingNumber } from '../utils/idEncoder';

const EmployeePage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Tracking event form
  const [eventType, setEventType] = useState('processing');
  const [locationId, setLocationId] = useState('');

  // Package dimensions form
  const [editLength, setEditLength] = useState('');
  const [editWidth, setEditWidth] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');

  // Tracking history
  const [trackingHistory, setTrackingHistory] = useState([]);

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

  useEffect(() => {
    fetchFacilities();
    fetchPackages();
    fetchClerkFacility();
  }, []);

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

  const fetchClerkFacility = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeId?authId=${authId}`);
      const data = await response.json();
      if (data.success && data.employee) {
        setFacilityName(data.employee.facility_name || '');
      }
    } catch (err) {
      console.error('Error fetching clerk facility:', err);
    }
  };

  const fetchPackages = async (pageNum = 1) => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/getPackagesAtFacilities?authId=${authId}&page=${pageNum}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
        setTotalPages(data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTrackingModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowTrackingModal(true);
    setEventType('processing');
    setLocationId(pkg.facility_address_id || '');
  };

  const openHistoryModal = async (pkg) => {
    setSelectedPackage(pkg);
    setShowHistoryModal(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getPackageTrackingHistory?packageId=${pkg.package_id}`
      );
      const data = await response.json();
      if (data.success) {
        setTrackingHistory(data.trackingEvents);
      }
    } catch (err) {
      console.error('Error fetching tracking history:', err);
    }
  };

  const openDimensionsModal = (pkg) => {
    setSelectedPackage(pkg);
    setEditLength(pkg.length || '');
    setEditWidth(pkg.width || '');
    setEditHeight(pkg.height || '');
    setEditWeight(pkg.weight || '');
    setShowDimensionsModal(true);
  };

  const handleUpdateDimensions = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updatePackageDimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.package_id,
          length: editLength,
          width: editWidth,
          height: editHeight,
          weight: editWeight,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Package dimensions updated successfully!');
        setShowDimensionsModal(false);
        fetchPackages();
      } else {
        showErrorToast('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating dimensions:', err);
      showErrorToast('Error updating package dimensions');
    }
  };

  const handleAddTrackingEvent = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/createTrackingEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.package_id,
          eventType,
          locationId: locationId || null,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Tracking event added successfully!');
        setShowTrackingModal(false);
        fetchPackages();
      } else {
        showErrorToast('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error adding tracking event:', err);
      showErrorToast('Error adding tracking event');
    }
  };

  return (
    <div className="clerk-package-container">
      {/* Packages Table */}
      <div className="packages-section">
        <h2>Packages at {facilityName || 'My Facility'}</h2>
        <Pagination
          currentPage={page}
          totalCount={totalPages * limit}
          pageSize={limit}
          onPageChange={fetchPackages}
        />
        {loading ? (
          <p>Loading packages...</p>
        ) : packages.length === 0 ? (
          <p>No packages found.</p>
        ) : (
          <div className="table-container">
            <table className="packages-table">
              <thead>
                <tr>
                  <th>Package ID</th>
                  <th>Tracking Number</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Current Location</th>
                  <th>Status</th>
                  <th>Weight (kg)</th>
                  <th>Courier</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td>{encodePackageId(pkg.package_id)}</td>
                    <td className="tracking-number">{formatTrackingNumber(pkg.tracking_number)}</td>
                    <td>{pkg.sender_name}</td>
                    <td>{pkg.recipient_name}</td>
                    <td>{pkg.facility_name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge status-${pkg.package_status}`}>
                        {pkg.package_status}
                      </span>
                    </td>
                    <td>{pkg.weight}</td>
                    <td>{pkg.courier_name || 'Not Assigned'}</td>
                    <td>{new Date(pkg.created_at).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button
                        onClick={() => openTrackingModal(pkg)}
                        className="btn-primary"
                      >
                        Add Event
                      </button>
                      <button
                        onClick={() => openHistoryModal(pkg)}
                        className="btn-secondary"
                      >
                        View History
                      </button>
                      <button
                        onClick={() => openDimensionsModal(pkg)}
                        className="btn-primary"
                      >
                        Edit Dimensions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tracking Event Modal */}
      <Modal
        show={showTrackingModal}
        title="Add Tracking Event"
        onClose={() => setShowTrackingModal(false)}
      >
        <p className="modal-subtitle">
          Package {encodePackageId(selectedPackage?.package_id)}: {formatTrackingNumber(selectedPackage?.tracking_number)}
        </p>

        <form onSubmit={handleAddTrackingEvent}>
          <div className="form-group">
            <label>Event Type:</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
              <option value="processing">Processing</option>
              <option value="pre-shipment">Pre-shipment</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="lost">Lost</option>
              <option value="returned">Returned</option>
              <option value="undeliverable">Undeliverable</option>
              <option value="failed-delivery">Failed Delivery</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location (Facility):</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">-- Select Facility (Optional) --</option>
              {facilities.map((facility) => (
                <option key={facility.facility_id} value={facility.address_id}>
                  {facility.facility_name}
                </option>
              ))}
            </select>
            <small>Leave empty if event has no specific facility</small>
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-submit-button">
              Add Event
            </button>
            <button
              type="button"
              onClick={() => setShowTrackingModal(false)}
              className="modal-cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Tracking History Modal */}
      <Modal
        show={showHistoryModal}
        title="Tracking History"
        onClose={() => setShowHistoryModal(false)}
      >
        <p className="modal-subtitle">
          Package {encodePackageId(selectedPackage?.package_id)}: {formatTrackingNumber(selectedPackage?.tracking_number)}
        </p>

        {trackingHistory.length === 0 ? (
          <p className="empty-state">No tracking events found.</p>
        ) : (
          <div className="tracking-timeline">
            {trackingHistory.map((event) => (
              <div key={event.tracking_event_id} className="timeline-event">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="event-type-badge">
                    {event.event_type}
                  </div>
                  <div className="event-time">
                    {new Date(event.event_time).toLocaleString()}
                  </div>
                  {event.facility_name && (
                    <div className="event-location">
                      <strong>Location:</strong> {event.facility_name}
                      {event.location_address && (
                        <div className="location-address">{event.location_address}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            onClick={() => setShowHistoryModal(false)}
            className="modal-cancel-button"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Edit Dimensions Modal */}
      <Modal
        show={showDimensionsModal}
        title="Edit Package Dimensions"
        onClose={() => setShowDimensionsModal(false)}
      >
        <p className="modal-subtitle">
          Package {encodePackageId(selectedPackage?.package_id)}: {formatTrackingNumber(selectedPackage?.tracking_number)}
        </p>

        <form onSubmit={handleUpdateDimensions}>
          <div className="form-group">
            <label>Length (cm):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editLength}
              onChange={(e) => setEditLength(e.target.value)}
              placeholder="Enter length"
            />
          </div>

          <div className="form-group">
            <label>Width (cm):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editWidth}
              onChange={(e) => setEditWidth(e.target.value)}
              placeholder="Enter width"
            />
          </div>

          <div className="form-group">
            <label>Height (cm):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editHeight}
              onChange={(e) => setEditHeight(e.target.value)}
              placeholder="Enter height"
            />
          </div>

          <div className="form-group">
            <label>Weight (kg):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              placeholder="Enter weight"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-submit-button">
              Update Dimensions
            </button>
            <button
              type="button"
              onClick={() => setShowDimensionsModal(false)}
              className="modal-cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
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

export default EmployeePage;
