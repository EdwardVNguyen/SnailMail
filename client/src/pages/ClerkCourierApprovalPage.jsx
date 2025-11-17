import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClerkCourierApprovalPage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';

const ClerkCourierApprovalPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clerkFacilityAddressId, setClerkFacilityAddressId] = useState(null);

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [eventType, setEventType] = useState('processing');

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
    fetchClerkFacility();
    fetchRequests();
  }, []);

  const fetchClerkFacility = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeId?authId=${authId}`);
      const data = await response.json();
      if (data.success && data.employee) {
        setClerkFacilityAddressId(data.employee.facility_address_id);
      }
    } catch (err) {
      console.error('Error fetching clerk facility:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getPendingCourierRequests`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching courier requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
    setEventType('out-for-delivery');
  };

  const handleReviewRequest = async (e) => {
    e.preventDefault();

    // Ensure clerk facility address is loaded
    if (!clerkFacilityAddressId) {
      showErrorToast('Error: Clerk facility information not loaded. Please refresh the page.');
      return;
    }

    // Define negative event types that should trigger rejection
    const negativeEventTypes = ['lost', 'returned', 'undeliverable', 'failed-delivery', 'damaged'];
    const shouldReject = negativeEventTypes.includes(eventType);

    try {
      // Step 1: Create tracking event first (using clerk's facility address)
      const trackingResponse = await fetch(`${import.meta.env.VITE_API_URL}/createTrackingEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedRequest.package_id,
          eventType,
          locationId: clerkFacilityAddressId,
          authId
        })
      });

      const trackingData = await trackingResponse.json();
      if (!trackingData.success) {
        showErrorToast('Error creating tracking event: ' + trackingData.message);
        return;
      }

      // Step 2: Based on event type, approve or reject
      if (shouldReject) {
        // Automatically reject if it's a negative event
        const rejectResponse = await fetch(`${import.meta.env.VITE_API_URL}/rejectCourierRequest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            authId
          })
        });

        const rejectData = await rejectResponse.json();
        if (rejectData.success) {
          showSuccessToast(`Tracking event created. Request automatically rejected due to "${eventType}" status.`);
          setShowReviewModal(false);
          fetchRequests();
        } else {
          showErrorToast('Tracking event created but rejection failed: ' + rejectData.message);
          setShowReviewModal(false);
          fetchRequests();
        }
      } else {
        // Approve for positive events
        const approveResponse = await fetch(`${import.meta.env.VITE_API_URL}/approveCourierRequest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            authId
          })
        });

        const approveData = await approveResponse.json();
        if (approveData.success) {
          showSuccessToast('Tracking event created and request approved successfully!');
          setShowReviewModal(false);
          fetchRequests();
        } else {
          showErrorToast('Tracking event created but approval failed: ' + approveData.message);
          setShowReviewModal(false);
          fetchRequests();
        }
      }
    } catch (err) {
      console.error('Error in review process:', err);
      showErrorToast('Error processing request.');
    }
  };

  const handleDirectReject = async (requestId) => {
    const confirmed = window.confirm('Reject this courier request without creating a tracking event?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rejectCourierRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Request rejected successfully!');
        fetchRequests();
      } else {
        showErrorToast('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      showErrorToast('Error rejecting request.');
    }
  };

  return (
    <div className="clerk-package-container">
      <div className="clerk-header">
        <h1>Courier Package Requests & Management</h1>
        <button onClick={() => navigate('/clerkPage')} className="back-button">
          ← Back
        </button>
      </div>

      {/* Requests Table */}
      <div className="packages-section">
        <h2>Pending Courier Requests</h2>
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No pending courier requests.</p>
        ) : (
          <div className="table-container">
            <table className="packages-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Request Date</th>
                  <th>Courier</th>
                  <th>Package ID</th>
                  <th>Tracking Number</th>
                  <th>Recipient</th>
                  <th>Destination</th>
                  <th>Weight (kg)</th>
                  <th>Current Facility</th>
                  <th>Package Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.request_id}>
                    <td>{request.request_id}</td>
                    <td>{new Date(request.request_date).toLocaleString()}</td>
                    <td>{request.courier_first_name} {request.courier_last_name}</td>
                    <td>{request.package_id}</td>
                    <td className="tracking-number">{request.tracking_number}</td>
                    <td>{request.recipient_first_name} {request.recipient_last_name}</td>
                    <td>{request.recipient_city}, {request.recipient_state}</td>
                    <td>{request.weight}</td>
                    <td>{request.package_facility_name}</td>
                    <td>
                      <span className={`status-badge status-${request.package_status}`}>
                        {request.package_status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => openReviewModal(request)}
                        className="btn-review"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleDirectReject(request.request_id)}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal with Tracking Event */}
      <Modal
        show={showReviewModal}
        title="Review Request & Create Tracking Event"
        onClose={() => setShowReviewModal(false)}
      >
        <p className="modal-subtitle">
          Package: {selectedRequest?.tracking_number} |
          Courier: {selectedRequest?.courier_first_name} {selectedRequest?.courier_last_name}
        </p>

        <div className="info-box">
          <p><strong>Note:</strong> Creating a tracking event with status 'lost', 'returned', 'undeliverable', 'failed-delivery', or 'damaged' will automatically reject the courier request.</p>
        </div>

        <form onSubmit={handleReviewRequest}>
          <div className="form-group">
            <label>Package Condition:</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
              <option value="out-for-delivery">Good Condition - Ready for Delivery (Approve)</option>
              <option value="lost">Lost (Auto-Reject)</option>
              <option value="returned">Returned (Auto-Reject)</option>
              <option value="undeliverable">Undeliverable (Auto-Reject)</option>
              <option value="failed-delivery">Failed Delivery (Auto-Reject)</option>
              <option value="damaged">Damaged (Auto-Reject)</option>
            </select>
            <small>Tracking event will be created at your facility</small>
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-submit-button">
              Create Event & Process
            </button>
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
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

export default ClerkCourierApprovalPage;
