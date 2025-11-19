/**
 * Validation Utilities
 *
 * Centralized validation functions for form inputs
 * Provides consistent validation across the application
 */

// Regular expression patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ssn: /^\d{3}-\d{2}-\d{4}$/,
  zipCode: /^\d{5}$/,
  state: /^[A-Z]{2}$/,
  phone: /^\d{10}$/,
  phoneFormatted: /^\d{3}-\d{3}-\d{4}$/,
};

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  return PATTERNS.email.test(email);
};

/**
 * Validate SSN (format: XXX-XX-XXXX)
 * @param {string} ssn - SSN to validate
 * @returns {boolean} - True if valid
 */
export const isValidSSN = (ssn) => {
  return PATTERNS.ssn.test(ssn);
};

/**
 * Validate ZIP code (5 digits)
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} - True if valid
 */
export const isValidZipCode = (zipCode) => {
  return PATTERNS.zipCode.test(zipCode);
};

/**
 * Validate state code (2 uppercase letters)
 * @param {string} state - State code to validate
 * @returns {boolean} - True if valid
 */
export const isValidState = (state) => {
  return PATTERNS.state.test(state);
};

/**
 * Validate phone number (10 digits, no formatting)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  return PATTERNS.phone.test(phone);
};

/**
 * Validate formatted phone number (XXX-XXX-XXXX)
 * @param {string} phone - Formatted phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidFormattedPhone = (phone) => {
  return PATTERNS.phoneFormatted.test(phone);
};

/**
 * Validate required field (not empty)
 * @param {string} value - Value to validate
 * @returns {boolean} - True if not empty
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.trim() !== '';
};

/**
 * Validate number is positive
 * @param {number|string} value - Number to validate
 * @returns {boolean} - True if positive
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate number is within range
 * @param {number|string} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - True if within range
 */
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Comprehensive form validation with error messages
 * @param {Object} fields - Object with field names and values
 * @param {Object} rules - Object with field names and validation rules
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForm = (fields, rules) => {
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];

    // Check required
    if (fieldRules.required && !isRequired(value)) {
      errors[fieldName] = fieldRules.requiredMessage || `${fieldName} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!isRequired(value) && !fieldRules.required) {
      return;
    }

    // Check email
    if (fieldRules.email && !isValidEmail(value)) {
      errors[fieldName] = fieldRules.emailMessage || 'Please enter a valid email address';
    }

    // Check SSN
    if (fieldRules.ssn && !isValidSSN(value)) {
      errors[fieldName] = fieldRules.ssnMessage || 'Please enter SSN in format: XXX-XX-XXXX';
    }

    // Check zip code
    if (fieldRules.zipCode && !isValidZipCode(value)) {
      errors[fieldName] = fieldRules.zipCodeMessage || 'Please enter a valid 5-digit zip code';
    }

    // Check state
    if (fieldRules.state && !isValidState(value)) {
      errors[fieldName] = fieldRules.stateMessage || 'Please enter a valid 2-letter state code (e.g., TX, CA)';
    }

    // Check phone
    if (fieldRules.phone && !isValidPhone(value) && !isValidFormattedPhone(value)) {
      errors[fieldName] = fieldRules.phoneMessage || 'Please enter a valid 10-digit phone number';
    }

    // Check positive number
    if (fieldRules.positive && !isPositiveNumber(value)) {
      errors[fieldName] = fieldRules.positiveMessage || 'Please enter a positive number';
    }

    // Check range
    if (fieldRules.min !== undefined && fieldRules.max !== undefined) {
      if (!isInRange(value, fieldRules.min, fieldRules.max)) {
        errors[fieldName] = fieldRules.rangeMessage || `Please enter a value between ${fieldRules.min} and ${fieldRules.max}`;
      }
    }

    // Custom validation function
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value, fields);
      if (customResult !== true) {
        errors[fieldName] = customResult || 'Invalid value';
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get error message for a specific field
 * @param {Object} errors - Errors object from validateForm
 * @param {string} fieldName - Field name to get error for
 * @returns {string|null} - Error message or null
 */
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

/**
 * Check if field has error
 * @param {Object} errors - Errors object from validateForm
 * @param {string} fieldName - Field name to check
 * @returns {boolean} - True if field has error
 */
export const hasFieldError = (errors, fieldName) => {
  return !!errors[fieldName];
};

export default {
  isValidEmail,
  isValidSSN,
  isValidZipCode,
  isValidState,
  isValidPhone,
  isValidFormattedPhone,
  isRequired,
  isPositiveNumber,
  isInRange,
  validateForm,
  getFieldError,
  hasFieldError,
  PATTERNS
};
