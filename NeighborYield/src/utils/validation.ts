/**
 * Validation utilities for authentication forms
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Error message if invalid, null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'This field is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'This field is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
};

/**
 * Validates username format
 * @param username - Username to validate
 * @returns Error message if invalid, null if valid
 */
export const validateUsername = (username: string): string | null => {
  if (!username || username.trim() === '') {
    return 'This field is required';
  }

  if (username.length < 3 || username.length > 20) {
    return 'Username must be 3-20 characters';
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  
  if (!usernameRegex.test(username)) {
    return 'Username must be 3-20 characters, letters and numbers only';
  }

  return null;
};

/**
 * Validates that password and confirm password match
 * @param password - Original password
 * @param confirm - Confirmation password
 * @returns Error message if invalid, null if valid
 */
export const validatePasswordMatch = (
  password: string,
  confirm: string
): string | null => {
  if (!confirm || confirm.trim() === '') {
    return 'This field is required';
  }

  if (password !== confirm) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Formats phone number to US format (XXX) XXX-XXXX
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 0) {
    return '';
  } else if (digits.length <= 3) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};
