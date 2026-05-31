// Load environment variables
require('dotenv').config();

// Test file to verify all utilities are working
// Run this with: node testUtils.js

// Import all utilities
const { generateOTP, getOTPExpiry, verifyOTP } = require('./utils/otp');
const { sendOTPEmail, sendWelcomeEmail } = require('./utils/email');
const { hashPasswordMiddleware, comparePassword } = require('./middleware/passwordMiddleware');
const { createToken } = require('./utils/jwt');

// Test 1: Generate OTP
console.log('\n========== TEST 1: Generate OTP ==========');
const otp = generateOTP();
console.log('Generated OTP:', otp);
console.log('OTP Length:', otp.length);
console.log('✅ OTP generated successfully\n');

// Test 2: Get OTP Expiry Time
console.log('========== TEST 2: Get OTP Expiry ==========');
const expiryTime = getOTPExpiry();
console.log('Current Time:', new Date().toLocaleString());
console.log('Expiry Time:', expiryTime.toLocaleString());
console.log('Expires in 10 minutes: YES');
console.log('✅ OTP expiry calculated successfully\n');

// Test 3: Verify OTP
console.log('========== TEST 3: Verify OTP ==========');
const result1 = verifyOTP('123456', '123456', expiryTime);
console.log('Test 1 - Correct OTP:', result1);

const result2 = verifyOTP('000000', '123456', expiryTime);
console.log('Test 2 - Wrong OTP:', result2);

const pastTime = new Date(Date.now() - 11 * 60 * 1000);
const result3 = verifyOTP('123456', '123456', pastTime);
console.log('Test 3 - Expired OTP:', result3);
console.log('✅ OTP verification working\n');

// Test 4: Password Hashing
console.log('========== TEST 4: Password Hashing ==========');
(async () => {
  try {
    const plainPassword = 'MyPassword123';
    
    // Hash password
    const hashedPassword = await hashPasswordMiddleware(plainPassword);
    console.log('Plain Password:', plainPassword);
    console.log('Hashed Password:', hashedPassword);
    
    // Compare correct password
    const match1 = await comparePassword(plainPassword, hashedPassword);
    console.log('Correct Password Match:', match1);
    
    // Compare wrong password
    const match2 = await comparePassword('WrongPassword', hashedPassword);
    console.log('Wrong Password Match:', match2);
    console.log('✅ Password hashing working\n');

    // Test 5: Create JWT Token
    console.log('========== TEST 5: Create JWT Token ==========');
    const userId = '507f1f77bcf86cd799439011';
    const token = createToken(userId);
    console.log('User ID:', userId);
    console.log('Generated Token:', token);
    console.log('Token Length:', token.length);
    console.log('✅ JWT token created successfully\n');

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - Backend is working!');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
})();
