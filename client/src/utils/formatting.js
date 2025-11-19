/**
 * Formatting Utilities
 *
 * Centralized formatting functions for user inputs
 * Provides consistent formatting across the application
 */

/**
 * Format SSN as user types (XXX-XX-XXXX)
 * @param {string} value - Raw SSN value
 * @returns {string} - Formatted SSN
 */
export const formatSSN = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 9 digits
  const limited = digits.slice(0, 9);

  // Format as XXX-XX-XXXX
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
  }
};

/**
 * Format phone number as user types (XXX-XXX-XXXX)
 * @param {string} value - Raw phone number value
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limited = digits.slice(0, 10);

  // Format as XXX-XXX-XXXX
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
};

/**
 * Remove formatting from SSN (returns digits only)
 * @param {string} value - Formatted SSN
 * @returns {string} - Digits only
 */
export const unformatSSN = (value) => {
  return value.replace(/\D/g, '');
};

/**
 * Remove formatting from phone number (returns digits only)
 * @param {string} value - Formatted phone number
 * @returns {string} - Digits only
 */
export const unformatPhoneNumber = (value) => {
  return value.replace(/\D/g, '');
};

/**
 * Format ZIP code (5 digits only)
 * @param {string} value - Raw ZIP code value
 * @returns {string} - Formatted ZIP code
 */
export const formatZipCode = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 5 digits
  return digits.slice(0, 5);
};

/**
 * Format state code (2 uppercase letters only)
 * @param {string} value - Raw state code value
 * @returns {string} - Formatted state code
 */
export const formatStateCode = (value) => {
  // Remove all non-letter characters and convert to uppercase
  const letters = value.replace(/[^a-zA-Z]/g, '').toUpperCase();

  // Limit to 2 characters
  return letters.slice(0, 2);
};

/**
 * Format currency value
 * @param {number|string} value - Raw currency value
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
  const num = parseFloat(value);
  if (isNaN(num)) return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(num);
};

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, locale = 'en-US') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';

  return dateObj.toLocaleDateString(locale);
};

/**
 * Format datetime to locale string
 * @param {Date|string} datetime - Datetime to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (datetime, locale = 'en-US') => {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';

  return dateObj.toLocaleString(locale);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to title case
 * @returns {string} - Title cased string
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
};

/**
 * Format tracking number for display (add spaces every 4 characters)
 * @param {string} trackingNumber - Raw tracking number
 * @returns {string} - Formatted tracking number
 */
export const formatTrackingNumber = (trackingNumber) => {
  if (!trackingNumber) return '';
  return trackingNumber.match(/.{1,4}/g)?.join(' ') || trackingNumber;
};

export default {
  formatSSN,
  formatPhoneNumber,
  unformatSSN,
  unformatPhoneNumber,
  formatZipCode,
  formatStateCode,
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalize,
  titleCase,
  formatTrackingNumber
};
