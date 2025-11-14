import { useState, useEffect } from 'react';
import './ClerkCourierApprovalPage.css';

const ClerkCourierApprovalPage = ({ globalAuthId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (globalAuthId) {
      loadPendingRequests();
    }
  }, [globalAuthId]);

  const loadPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getPendingCourierRequests`
      );
      const data = await response.json();

      if (data.success) {
        setPendingRequests(data.requests || []);
      } else {
        throw new Error(data.message || 'Failed to fetch pending requests');
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/approveCourierRequest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            authId: globalAuthId,
            destinationType: 'recipient_address'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Request approved successfully!');
        setPendingRequests(prev => prev.filter(r => r.request_id !== requestId));

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.message || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Error approving request. Please try again.');
    }
  };

  const handleOpenRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleReject = async (e) => {
    e.preventDefault();

    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rejectCourierRequest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            authId: globalAuthId,
            rejectionReason
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Request rejected successfully');
        setPendingRequests(prev => prev.filter(r => r.request_id !== selectedRequest.request_id));
        handleCloseRejectModal();

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Error rejecting request. Please try again.');
    }
  };

  return (
    <div className="clerkApprovalContainer">
      {/* Header */}
      <div className="clerkApprovalHeader">
        <h1>Courier Package Requests</h1>
        <p>Review and approve/reject courier delivery requests</p>
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
          <p>Loading requests...</p>
        </div>
      ) : (
        <section className="requestsSection">
          {pendingRequests.length === 0 ? (
            <p className="emptyState">No pending courier requests at this time.</p>
          ) : (
            <div className="requestsGrid">
              {pendingRequests.map(request => (
                <div key={request.request_id} className="requestCard">
                  <div className="requestHeader">
                    <span className="trackingNumber">{request.tracking_number}</span>
                    <span className="requestDate">
                      {new Date(request.request_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="requestDetails">
                    <div className="detailSection">
                      <h4>Package Details</h4>
                      <p><strong>Type:</strong> {request.package_type}</p>
                      <p><strong>Weight:</strong> {request.weight} kg</p>
                      <p><strong>Current Location:</strong> {request.package_facility_name}</p>
                    </div>

                    <div className="detailSection">
                      <h4>Courier</h4>
                      <p><strong>Name:</strong> {request.courier_first_name} {request.courier_last_name}</p>
                      <p><strong>ID:</strong> {request.courier_id}</p>
                    </div>

                    <div className="detailSection">
                      <h4>Destination</h4>
                      <p><strong>Recipient:</strong> {request.recipient_first_name} {request.recipient_last_name}</p>
                      <p><strong>Location:</strong> {request.recipient_city}, {request.recipient_state}</p>
                    </div>
                  </div>

                  <div className="requestActions">
                    <button
                      className="approveButton"
                      onClick={() => handleApprove(request.request_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="rejectButton"
                      onClick={() => handleOpenRejectModal(request)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modalOverlay" onClick={handleCloseRejectModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Reject Request</h2>
              <button className="closeButton" onClick={handleCloseRejectModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleReject}>
              <div className="formGroup">
                <label>Package: {selectedRequest.tracking_number}</label>
                <p className="modalInfo">
                  Courier: {selectedRequest.courier_first_name} {selectedRequest.courier_last_name}
                </p>
              </div>

              <div className="formGroup">
                <label htmlFor="rejectionReason">Rejection Reason: *</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows="4"
                  required
                />
              </div>

              <div className="modalActions">
                <button type="button" className="cancelButton" onClick={handleCloseRejectModal}>
                  Cancel
                </button>
                <button type="submit" className="confirmButton rejectConfirmButton">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkCourierApprovalPage;
