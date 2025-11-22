import { useEffect, useState } from 'react';
import './Toast.css';

/**
 * Reusable Toast notification component
 *
 * @param {boolean} show - Whether to show the toast
 * @param {string} message - The message to display
 * @param {function} onClose - Callback when toast is hidden
 * @param {number} duration - How long to show toast in ms (default: 3000)
 * @param {string} type - Toast type: 'success' or 'error' (default: 'success')
 */
export const Toast = ({ show, message, onClose, duration = 3000, type = 'success' }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset fadingOut state when toast is shown
      setFadingOut(false);

      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, duration - 300);

      const hideTimer = setTimeout(() => {
        setFadingOut(false);
        onClose();
      }, duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className={`toast-notification toast-${type} ${fadingOut ? 'toast-fade-out' : ''}`}>
      {message}
    </div>
  );
};
