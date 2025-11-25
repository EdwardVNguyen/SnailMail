import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeePage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import Pagination from '../utils/Pagination';
import { encodePackageId, formatTrackingNumber } from '../utils/idEncoder';
import { sortData, getSortIndicator } from './ReportPage/components/reportUtils';

const ClerkAllPackagesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Sorting and filtering states
  const [sortField, setSortField] = useState('package_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Tracking event form
  const [eventType, setEventType] = useState('processing');

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
    fetchPackages();
    fetchClerkFacility();
  }, []);

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

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter packages by status
  const filteredPackages = useMemo(() => {
    if (statusFilter === 'all') return packages;
    return packages.filter(pkg => pkg.package_status === statusFilter);
  }, [packages, statusFilter]);

  // Sort filtered packages
  const sortedPackages = sortData(filteredPackages, sortField, sortDirection);

  const openTrackingModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowTrackingModal(true);
    setEventType('pre-shipment');
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
        // Show error toast for dimension/weight constraint violations
        if (data.errorType === 'dimension_length' ||
            data.errorType === 'dimension_width_height' ||
            data.errorType === 'weight') {
          setShowDimensionsModal(false); // Close modal so toast is visible
          showErrorToast(data.message);
        } else {
          showErrorToast('Error: ' + data.message);
        }
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

        {/* Filter Section */}
        <div className="filterSection">
          <h3>Filters</h3>
          <div className="filterControls">
            <div className="filterGroup">
              <label>Package Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="pre-shipment">Pre-shipment</option>
                <option value="in-transit">In Transit</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="lost">Lost</option>
                <option value="returned">Returned</option>
                <option value="undeliverable">Undeliverable</option>
                <option value="failed-delivery">Failed Delivery</option>
                <option value="damaged">Damaged</option>
                <option value="late-delivery">Late Delivery</option>
              </select>
            </div>
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="clearFiltersButton">
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading packages...</p>
        ) : packages.length === 0 ? (
          <p>No packages found.</p>
        ) : (
          <div className="table-container">
            <table className="packages-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('package_id')}>
                    Package ID{getSortIndicator('package_id', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('tracking_number')}>
                    Tracking Number{getSortIndicator('tracking_number', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('package_type')}>
                    Type{getSortIndicator('package_type', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('sender_name')}>
                    From{getSortIndicator('sender_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('recipient_name')}>
                    To{getSortIndicator('recipient_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('facility_name')}>
                    Current Location{getSortIndicator('facility_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('package_status')}>
                    Status{getSortIndicator('package_status', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('weight')}>
                    Weight (kg){getSortIndicator('weight', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('courier_name')}>
                    Courier{getSortIndicator('courier_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => handleSort('created_at')}>
                    Date Created{getSortIndicator('created_at', sortField, sortDirection)}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPackages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td>{encodePackageId(pkg.package_id)}</td>
                    <td className="tracking-number">{formatTrackingNumber(pkg.tracking_number)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{pkg.package_type || 'N/A'}</td>
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
                      {pkg.package_status !== 'delivered' && (
                        <button
                          onClick={() => openTrackingModal(pkg)}
                          className="btn-primary"
                        >
                          Add Event
                        </button>
                      )}
                      <button
                        onClick={() => openHistoryModal(pkg)}
                        className="btn-secondary"
                      >
                        View History
                      </button>
                      {pkg.package_status !== 'delivered' && (
                        <button
                          onClick={() => openDimensionsModal(pkg)}
                          className="btn-primary"
                        >
                          Edit Dimensions
                        </button>
                      )}
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

          <div className="form-info">
            <p><strong>Location:</strong> {facilityName || 'Your Facility'}</p>
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

export default ClerkAllPackagesPage;
