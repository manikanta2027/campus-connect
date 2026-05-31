// Function to create a random 6-digit OTP
const generateOTP = () => {
  // Make a random number between 0 and 999999
  const randomNumber = Math.floor(Math.random() * 999999);
  // Convert to string and add leading zeros to make it 6 digits
  return randomNumber.toString().padStart(6, '0');
};

// Function to get OTP expiry time (10 minutes from now)
const getOTPExpiry = () => {
  // Create new date for current time
  const expiryDate = new Date();
  // Add 10 minutes
  expiryDate.setMinutes(expiryDate.getMinutes() + 10);
  return expiryDate;
};

// Function to check if OTP is valid
const verifyOTP = (providedOTP, storedOTP, expiryTime) => {
  // Convert both to strings and trim whitespace for reliable comparison
  const provided = String(providedOTP || '').trim();
  const stored = String(storedOTP || '').trim();
  
  // Log for debugging
  console.log('OTP Verification:');
  console.log('Provided OTP:', provided);
  console.log('Stored OTP:', stored);
  console.log('Match:', provided === stored);
  
  // Check if OTP matches
  if (provided !== stored) {
    return { success: false, message: 'Wrong OTP' };
  }
  
  // Check if OTP expired - convert to milliseconds for comparison
  const expiryMs = new Date(expiryTime).getTime();
  const nowMs = Date.now();
  
  if (nowMs > expiryMs) {
    return { success: false, message: 'OTP expired' };
  }
  
  return { success: true, message: 'OTP verified' };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  verifyOTP,
};
