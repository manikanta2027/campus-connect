// ============================================================
// VALIDATION UTILITIES
// ============================================================
// Reusable validation functions for forms

// Validate email format
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true, message: '' };
};

// Validate password strength
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { 
      valid: false, 
      message: 'Password must be at least 6 characters',
      strength: 'weak'
    };
  }

  if (password.length < 8) {
    return { 
      valid: true, 
      message: 'Password strength: Weak',
      strength: 'weak'
    };
  }

  // Check for mixed case and numbers
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 'weak';
  if (hasUpperCase && hasLowerCase && hasNumbers) {
    strength = 'strong';
  } else if ((hasUpperCase || hasLowerCase) && hasNumbers) {
    strength = 'medium';
  }

  return { 
    valid: true, 
    message: `Password strength: ${strength.charAt(0).toUpperCase() + strength.slice(1)}`,
    strength 
  };
};

// Validate password match
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true, message: '' };
};

// Check if form is valid
export const isEmailValid = (email) => validateEmail(email).valid;
export const isPasswordValid = (password) => validatePassword(password).valid;
export const isPasswordMatchValid = (password, confirmPassword) => 
  validatePasswordMatch(password, confirmPassword).valid;

// Get password strength color
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'weak':
      return '#ef4444'; // red
    case 'medium':
      return '#f59e0b'; // amber
    case 'strong':
      return '#10b981'; // green
    default:
      return '#9ca3af'; // gray
  }
};
