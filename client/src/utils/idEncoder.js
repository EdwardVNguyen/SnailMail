/**
 * ID Encoder/Decoder Utility
 * Converts system-generated numeric IDs to user-friendly display IDs
 * and vice versa for database operations
 */

// Base62 characters (0-9, A-Z, a-z)
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Convert number to base62
 */
const toBase62 = (num) => {
  if (num === 0) return '0';

  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
};

/**
 * Convert base62 to number
 */
const fromBase62 = (str) => {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result * 62 + BASE62_CHARS.indexOf(str[i]);
  }
  return result;
};

/**
 * Calculate simple checksum for validation
 */
const calculateChecksum = (num) => {
  const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return BASE62_CHARS[sum % 62];
};

/**
 * Encode a numeric ID to a display format with prefix
 * @param {number} id - System generated ID
 * @param {string} prefix - Prefix (e.g., 'PKG', 'EMP', 'FAC')
 * @returns {string} - Encoded display ID (e.g., 'PKG-4D2F8A')
 */
export const encodeId = (id, prefix = '') => {
  if (!id || isNaN(id)) return 'N/A';

  const encoded = toBase62(id);
  const checksum = calculateChecksum(id);
  const paddedEncoded = encoded.padStart(6, '0');

  return prefix ? `${prefix}-${paddedEncoded}${checksum}` : `${paddedEncoded}${checksum}`;
};

/**
 * Decode a display ID back to numeric system ID
 * @param {string} displayId - Display ID (e.g., 'PKG-4D2F8A')
 * @returns {number|null} - Original numeric ID or null if invalid
 */
export const decodeId = (displayId) => {
  if (!displayId || displayId === 'N/A') return null;

  // Remove prefix if present
  const parts = displayId.split('-');
  const encodedPart = parts.length > 1 ? parts[1] : parts[0];

  // Remove checksum (last character)
  const encoded = encodedPart.slice(0, -1);
  const providedChecksum = encodedPart.slice(-1);

  // Decode to number
  const id = fromBase62(encoded);

  // Validate checksum
  const expectedChecksum = calculateChecksum(id);
  if (providedChecksum !== expectedChecksum) {
    console.warn('Invalid checksum for display ID:', displayId);
    return null;
  }

  return id;
};

/**
 * Encode package ID
 */
export const encodePackageId = (id) => encodeId(id, 'PKG');

/**
 * Encode employee ID
 */
export const encodeEmployeeId = (id) => encodeId(id, 'EMP');

/**
 * Encode facility ID
 */
export const encodeFacilityId = (id) => encodeId(id, 'FAC');

/**
 * Encode customer ID
 */
export const encodeCustomerId = (id) => encodeId(id, 'CUS');

/**
 * Encode tracking event ID
 */
export const encodeTrackingEventId = (id) => encodeId(id, 'TRK');

/**
 * Encode courier request ID
 */
export const encodeCourierRequestId = (id) => encodeId(id, 'REQ');

/**
 * Format tracking number for display (already unique, just format nicely)
 */
export const formatTrackingNumber = (trackingNumber) => {
  if (!trackingNumber) return 'N/A';

  // Format as XXXX-XXXX-XXXX if it's numeric
  const cleaned = trackingNumber.toString().replace(/\s/g, '');
  if (/^\d+$/.test(cleaned) && cleaned.length >= 10) {
    return cleaned.match(/.{1,4}/g).join('-');
  }

  return trackingNumber;
};

/**
 * Decode any prefixed ID back to numeric
 */
export const decodeAnyId = (displayId) => decodeId(displayId);
