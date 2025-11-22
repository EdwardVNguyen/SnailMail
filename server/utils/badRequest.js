/**
 * Legacy error handling utilities
 * Maintained for backwards compatibility
 * New code should use responseUtils.js instead
 */
import { sendServerError, sendClientError } from './responseUtils.js';

// sends a message that server made a bad request
export const badServerRequest = (res, error) => {
  const message = typeof error === 'string' ? error : error?.message || 'Database query failed';
  sendServerError(res, message);
};

// sends a message that client made a bad request
export const badClientRequest = (res, error) => {
  const message = typeof error === 'string' ? error : error?.message || 'Bad Request';
  sendClientError(res, message);
};
