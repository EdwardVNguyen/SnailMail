/**
 * Unified Response Utilities
 *
 * Provides consistent response patterns across all API endpoints
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to return (optional)
 * @param {string} message - Success message (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  const response = { success: true };

  if (message) response.message = message;
  if (data !== null) {
    // If data is an object with a single key, flatten it
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 1) {
      const key = Object.keys(data)[0];
      response[key] = data[key];
    } else {
      response.data = data;
    }
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
};

/**
 * Send a client error response (4xx)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Array} errors - Optional array of specific errors
 */
export const sendClientError = (res, message = 'Bad Request', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors && Array.isArray(errors)) {
    response.errors = errors;
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
};

/**
 * Send a server error response (5xx)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const sendServerError = (res, message = 'Internal Server Error', statusCode = 500) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: false,
    message
  }));
};

/**
 * Send a not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  sendClientError(res, message, 404);
};

/**
 * Send an unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  sendClientError(res, message, 401);
};

/**
 * Send a forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  sendClientError(res, message, 403);
};

/**
 * Wrapper for database operations with automatic error handling
 * @param {Function} operation - Async function to execute
 * @param {Object} res - Express response object
 * @param {string} errorMessage - Custom error message for failures
 */
export const withErrorHandling = async (operation, res, errorMessage = 'Operation failed') => {
  try {
    await operation();
  } catch (error) {
    console.error(`Error: ${errorMessage}`, error);
    sendServerError(res, errorMessage);
  }
};

// Backwards compatibility with existing badRequest utilities
export const badClientRequest = (res, error) => {
  const message = typeof error === 'string' ? error : error?.message || 'Bad Request';
  sendClientError(res, message);
};

export const badServerRequest = (res, error) => {
  const message = typeof error === 'string' ? error : error?.message || 'Internal Server Error';
  sendServerError(res, message);
};
