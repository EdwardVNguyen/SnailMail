import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DeleteConfirmModal.css';
import { Toast } from './Toast';

/**
 * Reusable Delete Confirmation Modal
 *
 * @param {boolean} show - Whether to show the modal
 * @param {string} entityType - Type of entity being deleted (e.g., 'Employee', 'Facility')
 * @param {string} entityName - Name to display and require for confirmation
 * @param {function} onConfirm - Callback when hard delete is confirmed
 * @param {function} onSoftDelete - Optional callback for soft delete (deactivate)
 * @param {function} onCancel - Callback when deletion is cancelled
 */
export const DeleteConfirmModal = ({ show, entityType, entityName, onConfirm, onSoftDelete, onCancel }) => {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'soft' or 'hard'

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!show) {
      setConfirmName('');
      setIsDeleting(false);
      setDeleteType(null);
    }
  }, [show]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const handleConfirm = async (type) => {
    if (confirmName !== entityName) {
      showErrorToast('The name does not match. Please type the exact name to confirm.');
      return;
    }

    // Prevent multiple submissions
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteType(type);

    if (type === 'soft' && onSoftDelete) {
      await onSoftDelete();
    } else {
      await onConfirm();
    }
    // Note: isDeleting will be reset when the modal closes (via useEffect)
  };

  const handleCancel = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setConfirmName('');
    onCancel();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header delete-modal-header">
          Delete {entityType}
        </h2>
        <div className="delete-modal-body">
          <p>
            What would you like to do with {entityType.toLowerCase()} <strong>{entityName}</strong>?
          </p>
          {onSoftDelete && (
            <p style={{ fontSize: '13px', color: '#666', margin: '10px 0' }}>
              <strong>Deactivate:</strong> Mark as inactive (can be reactivated later)<br />
              <strong>Delete Permanently:</strong> Remove from database (cannot be undone)
            </p>
          )}
          <p>To confirm, please type the {entityType.toLowerCase()}'s name below:</p>
          <div className="delete-confirm-field">
            <label>Name:</label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={entityName}
              autoFocus
              disabled={isDeleting}
            />
          </div>
        </div>
        <div className="modal-actions">
          {onSoftDelete && (
            <button
              onClick={() => handleConfirm('soft')}
              className="modal-submit-button"
              style={{ backgroundColor: '#f59e0b' }}
              disabled={confirmName !== entityName || isDeleting}
            >
              {isDeleting && deleteType === 'soft' ? 'Deactivating...' : 'Deactivate'}
            </button>
          )}
          <button
            onClick={() => handleConfirm('hard')}
            className="modal-submit-button delete-confirm-button"
            disabled={confirmName !== entityName || isDeleting}
          >
            {isDeleting && deleteType === 'hard' ? 'Deleting...' : 'Delete Permanently'}
          </button>
          <button onClick={handleCancel} className="modal-cancel-button" disabled={isDeleting}>
            Cancel
          </button>
        </div>

        {/* Toast Notification */}
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>,
    document.body
  );
};
