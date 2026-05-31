// Import express framework
const express = require("express");

// Create router object to define routes
const router = express.Router();

// Import authentication controller with all auth functions
const {
  register,
  sendOTP,
  verifyOTP,
  login,
  getUserByEmail,
  getUserByRegisterNumber,
  updateUserProfile,
  getAllStudents,
  getCurrentUserProfile,
  getUserProfileByEmail,
  forgotPassword,
  resetPassword,
  searchUsersBySkill,
  searchUsers,
} = require("../controllers/authController");

// Import authentication middleware to protect routes
const authMiddleware = require("../middleware/authMiddleware");

// Import rate limiting middleware
const { forgotPasswordLimiter, resetPasswordLimiter } = require("../middleware/rateLimitMiddleware");

// ============================================================
// ROUTE 1: POST /api/auth/register
// ============================================================
// What it does:
// 1. Receives user registration data (name, email, password, registerNumber, department, year)
// 2. Calls register function from authController
// 3. Creates new user in database
// 4. Returns success or error message
// Request body example:
// {
//   "name": "John Doe",
//   "email": "john@gmail.com",
//   "password": "MyPassword123",
//   "registerNumber": "23B91A6129",
//   "department": "CSE",
//   "year": 2
// }
router.post("/register", register);

// ============================================================
// ROUTE 2: POST /api/auth/send-otp
// ============================================================
// What it does:
// 1. Receives user email
// 2. Calls sendOTP function from authController
// 3. Generates 6-digit OTP code
// 4. Sends OTP to user's email
// 5. Returns success or error message
// Request body example:
// {
//   "email": "john@srkrec.ac.in"
// }
router.post("/send-otp", sendOTP);

// ============================================================
// ROUTE 3: POST /api/auth/verify-otp
// ============================================================
// What it does:
// 1. Receives user email and OTP code
// 2. Calls verifyOTP function from authController
// 3. Checks if OTP is correct and not expired
// 4. Marks user as verified in database
// 5. Sends welcome email to user
// 6. Returns success or error message
// Request body example:
// {
//   "email": "john@srkrec.ac.in",
//   "otp": "123456"
// }
router.post("/verify-otp", verifyOTP);

// ============================================================
// ROUTE 4: POST /api/auth/login
// ============================================================
// What it does:
// 1. Receives user email and password
// 2. Calls login function from authController
// 3. Verifies email and password
// 4. Generates JWT token for authenticated session
// 5. Returns token and user details
// Request body example:
// {
//   "email": "john@srkrec.ac.in",
//   "password": "MyPassword123"
// }
router.post("/login", login);

// Get user profile by email
router.get("/user/:email", getUserByEmail);

// Get user profile by register number
router.get("/user-by-register/:registerNumber", getUserByRegisterNumber);

// Get current user's profile (requires authentication)
router.get("/profile", authMiddleware, getCurrentUserProfile);

// Get any user's profile by email (public endpoint for profile images)
router.get("/profile/:email", getUserProfileByEmail);

// Get all 4th year students
router.get("/all-students", authMiddleware, getAllStudents);

// Update user profile (bio, skills, year)
router.put("/profile", authMiddleware, updateUserProfile);

// ============================================================
// ROUTE: POST /api/auth/forgot-password
// ============================================================
// What it does:
// 1. User enters email
// 2. Backend generates reset token
// 3. Sends reset link to user's email
// 4. Token valid for 1 hour
// Rate limit: 3 requests per hour per email
// Request body example:
// {
//   "email": "john@gmail.com",
//   "frontendUrl": "http://localhost:5173"
// }
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

// ============================================================
// ROUTE: POST /api/auth/reset-password
// ============================================================
// What it does:
// 1. User enters new password with reset token
// 2. Backend verifies token is valid and not expired
// 3. Updates password in database
// 4. Clears reset token
// Rate limit: 5 attempts per hour per IP
// Request body example:
// {
//   "resetToken": "abc123xyz789",
//   "newPassword": "NewPassword123"
// }
router.post("/reset-password", resetPasswordLimiter, resetPassword);

// ============================================================
// ROUTE: GET /api/auth/search/skill/:skill
// ============================================================
// What it does:
// 1. Takes skill name as URL parameter
// 2. Searches users whose skills array contains the skill
// 3. Case-insensitive search
// 4. Returns all matching users with their profiles
// Example: GET /api/auth/search/skill/React
// Response: { users: [...], count: 5 }
router.get("/search/skill/:skill", searchUsersBySkill);

// ============================================================
// ROUTE: GET /api/auth/search/query/:query
// ============================================================
// What it does:
// 1. Takes search query as URL parameter
// 2. Searches in name, email, department, and skills
// 3. Case-insensitive search
// 4. Returns all matching users
// Example: GET /api/auth/search/query/React
// Response: { users: [...], count: 10 }
router.get("/search/query/:query", searchUsers);

// Export router to use in server.js
module.exports = router;
