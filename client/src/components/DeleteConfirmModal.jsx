import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DeleteConfirmModal.css';

/**
 * Reusable Delete Confirmation Modal
 *
 * @param {boolean} show - Whether to show the modal
 * @param {string} entityType - Type of entity being deleted (e.g., 'Employee', 'Facility')
 * @param {string} entityName - Name to display and require for confirmation
 * @param {function} onConfirm - Callback when delete is confirmed
 * @param {function} onCancel - Callback when deletion is cancelled
 */
export const DeleteConfirmModal = ({ show, entityType, entityName, onConfirm, onCancel }) => {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!show) {
      setConfirmName('');
      setIsDeleting(false);
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

  const handleConfirm = async () => {
    if (confirmName !== entityName) {
      alert('The name does not match. Please type the exact name to confirm deletion.');
      return;
    }

    // Prevent multiple submissions
    if (isDeleting) return;

    setIsDeleting(true);
    await onConfirm();
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
            Are you sure you want to delete {entityType.toLowerCase()} <strong>{entityName}</strong>?
          </p>
          <p className="delete-warning">
            This action cannot be undone.
          </p>
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
          <button
            onClick={handleConfirm}
            className="modal-submit-button delete-confirm-button"
            disabled={confirmName !== entityName || isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete ${entityType}`}
          </button>
          <button onClick={handleCancel} className="modal-cancel-button" disabled={isDeleting}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
