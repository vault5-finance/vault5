/**
 * Phone number utilities for Kenyan phone number normalization and validation
 */

/**
 * Normalizes Kenyan phone numbers to a consistent format
 * Handles various input formats and converts them to +254XXXXXXXXX format
 * @param {string} phoneNumber - The phone number to normalize
 * @returns {string|null} - Normalized phone number or null if invalid
 */
const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return null;
  }

  // Remove spaces, dashes, parentheses, and plus sign
  let cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

  // Special case: handle "+2540..." input (UI prefilled +254 and user typed leading 0)
  // After cleaning, this appears as "2540...". Strip the extra 0.
  if (cleaned.startsWith('2540')) {
    cleaned = '254' + cleaned.substring(4);
  }

  // Handle different starting formats and normalize to +254XXXXXXXXX
  let normalized;

  if (cleaned.startsWith('254')) {
    // Already has country code
    normalized = `+254${cleaned.substring(3)}`;
  } else if (cleaned.startsWith('0')) {
    // Local format starting with 0
    normalized = `+254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    // Local format without leading 0 (e.g., 7XXXXXXXX or 1XXXXXXXX)
    normalized = `+254${cleaned}`;
  } else if (/^\d{12}$/.test(cleaned) && cleaned.startsWith('254')) {
    // Numeric 12-digit with 254 prefix (redundant case, already handled)
    normalized = `+${cleaned}`;
  } else {
    return null;
  }

  // Final validation: Kenyan mobile numbers start with 7 or 1 after +254 and total 9 digits after code
  const kenyanPhoneRegex = /^\+254[17]\d{8}$/;
  return kenyanPhoneRegex.test(normalized) ? normalized : null;
};

/**
 * Validates if a phone number is a valid Kenyan mobile number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid Kenyan phone number
 */
const isValidKenyanPhone = (phoneNumber) => {
  const normalized = normalizePhoneNumber(phoneNumber);
  return normalized !== null;
};

/**
 * Extracts network provider from phone number
 * @param {string} phoneNumber - The phone number
 * @returns {string} - Network provider name
 */
const getNetworkProvider = (phoneNumber) => {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return 'Unknown';

  const prefix = normalized.substring(4, 6); // Extract first two digits after +254

  const networkMap = {
    '70': 'Safaricom',
    '71': 'Safaricom',
    '72': 'Safaricom',
    '79': 'Airtel',
    '78': 'Airtel',
    '73': 'Orange/Telkom',
    '77': 'Orange/Telkom',
    '76': 'Orange/Telkom',
    '10': 'Airtel',
    '11': 'Safaricom',
    '12': 'Safaricom'
  };

  return networkMap[prefix] || 'Unknown';
};

/**
 * Formats phone number for display
 * @param {string} phoneNumber - The phone number to format
 * @param {string} format - Display format ('local', 'international', 'clean')
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber, format = 'international') => {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return phoneNumber;

  switch (format) {
    case 'local':
      return `0${normalized.substring(4)}`;
    case 'clean':
      return normalized.substring(1); // Remove + sign
    case 'international':
    default:
      return normalized;
  }
};

/**
 * Checks if two phone numbers are the same (handles different formats)
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} - True if phone numbers match
 */
const arePhoneNumbersEqual = (phone1, phone2) => {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);

  return normalized1 !== null && normalized2 !== null && normalized1 === normalized2;
};

module.exports = {
  normalizePhoneNumber,
  isValidKenyanPhone,
  getNetworkProvider,
  formatPhoneNumber,
  arePhoneNumbersEqual
};