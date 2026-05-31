// Import bcryptjs for password hashing
const bcrypt = require('bcryptjs');

// Middleware to hash password before saving to database
const hashPasswordMiddleware = async (password) => {
  try {
    // Generate a salt (number of rounds = 10)
    const salt = await bcrypt.genSalt(10);

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    console.log('❌ Error hashing password: ' + error.message);
    throw error;
  }
};

// Function to compare password (for login)
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    // Compare plain password with hashed password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.log('❌ Error comparing password: ' + error.message);
    throw error;
  }
};

module.exports = {
  hashPasswordMiddleware,
  comparePassword,
};
