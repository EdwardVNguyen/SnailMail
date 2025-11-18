import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClerkCourierApprovalPage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { encodeCourierRequestId, encodePackageId, formatTrackingNumber } from '../utils/idEncoder';

const ClerkCourierApprovalPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

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
    fetchRequests();
  }, []);

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
  };

  const handleApproveRequest = async () => {
    try {
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
        showSuccessToast('Request approved successfully!');
        setShowReviewModal(false);
        fetchRequests();
      } else {
        showErrorToast('Error: ' + approveData.message);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      showErrorToast('Error approving request.');
    }
  };

  const handleDirectReject = (requestId) => {
    setRejectingRequestId(requestId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rejectCourierRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: rejectingRequestId,
          authId
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast('Request rejected successfully!');
        setShowRejectModal(false);
        setShowReviewModal(false);
        setRejectingRequestId(null);
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
                    <td>{encodeCourierRequestId(request.request_id)}</td>
                    <td>{new Date(request.request_date).toLocaleString()}</td>
                    <td>{request.courier_first_name} {request.courier_last_name}</td>
                    <td>{encodePackageId(request.package_id)}</td>
                    <td className="tracking-number">{formatTrackingNumber(request.tracking_number)}</td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        show={showReviewModal}
        title="Review Courier Request"
        onClose={() => setShowReviewModal(false)}
      >
        <p className="modal-subtitle">
          Package: {encodePackageId(selectedRequest?.package_id)} - {formatTrackingNumber(selectedRequest?.tracking_number)} |
          Courier: {selectedRequest?.courier_first_name} {selectedRequest?.courier_last_name}
        </p>

        <div className="modal-actions">
          <button onClick={handleApproveRequest} className="modal-submit-button">
            Approve Request
          </button>
          <button
            onClick={() => {
              handleDirectReject(selectedRequest.request_id);
            }}
            className="btn-reject"
          >
            Reject Request
          </button>
          <button
            onClick={() => setShowReviewModal(false)}
            className="modal-cancel-button"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        show={showRejectModal}
        title="Reject Courier Request"
        onClose={() => setShowRejectModal(false)}
      >
        <div className="modal-subtitle">
          <p>Are you sure you want to reject this courier request without creating a tracking event?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        <div className="modal-actions">
          <button onClick={confirmReject} className="modal-submit-button delete-confirm-button">
            Reject Request
          </button>
          <button onClick={() => setShowRejectModal(false)} className="modal-cancel-button">
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

export default ClerkCourierApprovalPage;
