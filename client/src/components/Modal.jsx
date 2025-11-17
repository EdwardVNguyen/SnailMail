import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Reusable Modal component for add/edit forms
 *
 * @param {boolean} show - Whether to show the modal
 * @param {string} title - The modal title
 * @param {function} onClose - Callback when modal is closed
 * @param {React.ReactNode} children - The content to display inside the modal
 */
export const Modal = ({ show, title, onClose, children }) => {
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

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
};
