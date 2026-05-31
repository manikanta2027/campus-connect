// Import jwt to create tokens
const jwt = require('jsonwebtoken');

// Function to create JWT token
const createToken = (userData) => {
  try {
    // Create token with user data (can be userId string or user object)
    // Extract ID if userData is an object with _id property
    const userId = userData._id ? userData._id.toString() : userData;
    const name = userData.name || '';
    const email = userData.email || '';
    
    // Create token with userId, name, and email
    const token = jwt.sign(
      { 
        userId: userId,
        id: userId,
        name: name,
        email: email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    return token;
  } catch (error) {
    console.log('❌ Error creating token: ' + error.message);
    throw error;
  }
};

module.exports = {
  createToken,
};
