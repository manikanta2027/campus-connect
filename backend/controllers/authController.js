// Import User model for database operations
const User = require("../models/User");

// Import Post model to find posts about skills
const Post = require("../models/Post");

// Import password utility for hashing and comparing passwords
const { hashPasswordMiddleware, comparePassword } = require("../middleware/passwordMiddleware");

// Import OTP utility functions for generating and verifying OTP
const { generateOTP, getOTPExpiry, verifyOTP } = require("../utils/otp");

// Import email utility functions for sending OTP and welcome emails
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/email");

// Import JWT utility for creating authentication tokens
const { createToken } = require("../utils/jwt");

// ============================================================
// REGISTER FUNCTION - Create a new user account
// ============================================================
// What it does:
// 1. Check if email already exists in database
// 2. Check if register number already exists
// 3. Check if email is from @srkrec.ac.in domain (college email required)
// 4. Hash the password for security
// 5. Create new user in database
// 6. Return success or error message
exports.register = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, password, registerNumber, department, year } = req.body;

    // Validate all required fields are provided
    if (!name || !email || !password || !registerNumber || !department || !year) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Check if register number already exists
    const existingRegisterNumber = await User.findOne({ registerNumber });
    if (existingRegisterNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Register number already exists" });
    }

    // Check if email is from gmail domain (@gmail.com)
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({
        success: false,
        message: "Only @gmail.com emails are allowed",
      });
    }

    // Hash the password for security
    const hashedPassword = await hashPasswordMiddleware(password);

    // Create new user object with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      registerNumber,
      department,
      year,
      isVerified: true, // User is automatically verified (email verification skipped)
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiryTime = getOTPExpiry();

    // Save OTP to user document
    newUser.otp = otp;
    newUser.otpExpiry = expiryTime;

    // Save user to database
    await newUser.save();

    // Send OTP email ASYNCHRONOUSLY (don't wait for it)
    sendOTPEmail(email, otp).catch(emailError => {
      console.log('⚠️ OTP email sending failed (background task), but user saved');
    });

    // Return success message
    return res.status(201).json({
      success: true,
      message: "User registered successfully. You can now login.",
      userId: newUser._id,
    });
  } catch (error) {
    // If any error occurs, send error message
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ============================================================
// SEND OTP FUNCTION - Send OTP code to user's email
// ============================================================
// What it does:
// 1. Find user by email address
// 2. Generate a random 6-digit OTP code
// 3. Calculate OTP expiry time (10 minutes from now)
// 4. Save OTP and expiry in database
// 5. Send OTP to user's email via Nodemailer
// 6. Return success or error message
exports.sendOTP = async (req, res) => {
  try {
    // Get email from request body
    const { email } = req.body;

    // Validate email is provided
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate random 6-digit OTP code
    const otp = generateOTP();

    // Calculate expiry time (10 minutes from now)
    const expiryTime = getOTPExpiry();

    // Update user with OTP and expiry time in database
    user.otp = otp;
    user.otpExpiry = expiryTime;
    await user.save();

    // Send OTP to user's email ASYNCHRONOUSLY (don't wait for it)
    sendOTPEmail(email, otp).catch(emailError => {
      console.log('⚠️ OTP email sending failed (background task), but OTP saved');
    });

    // Return success message with OTP for testing
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Valid for 10 minutes.",
      otp: otp, // Show OTP for testing purposes (remove in production)
    });
  } catch (error) {
    // If any error occurs, send error message
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ============================================================
// VERIFY OTP FUNCTION - Verify OTP code entered by user
// ============================================================
// What it does:
// 1. Find user by email
// 2. Check if entered OTP matches stored OTP
// 3. Check if OTP has not expired
// 4. Mark user as verified (isVerified = true)
// 5. Clear OTP from database
// 6. Return success or error message
exports.verifyOTP = async (req, res) => {
  try {
    // Get email and OTP from request body
    const { email, otp } = req.body;

    // Log for debugging
    console.log('Verify OTP Request:');
    console.log('Email:', email);
    console.log('Provided OTP:', otp);

    // Validate email and OTP are provided
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // Find user by email and explicitly select OTP fields (they have select: false in schema)
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log('User found:', user.email);
    console.log('Stored OTP:', user.otp);
    console.log('Stored Expiry:', user.otpExpiry);

    // Verify OTP (checks if correct and not expired)
    const otpResult = verifyOTP(otp, user.otp, user.otpExpiry);

    // If OTP verification failed, return error
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
      });
    }

    // Mark user as verified
    user.isVerified = true;

    // Clear OTP from database (no longer needed)
    user.otp = null;
    user.otpExpiry = null;

    // Save changes to database
    await user.save();

    // Send welcome email ASYNCHRONOUSLY (don't wait for it)
    sendWelcomeEmail(email, user.name).catch(emailError => {
      console.log('⚠️ Welcome email sending failed (background task)');
    });

    // Return success message
    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    // If any error occurs, send error message
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ============================================================
// LOGIN FUNCTION - Authenticate user with email and password
// ============================================================
// What it does:
// 1. Find user by email
// 2. Check if user is verified
// 3. Compare entered password with stored hashed password
// 4. Generate JWT token for authenticated session
// 5. Return token or error message
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Validate email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user by email and explicitly select password (it has select: false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user's email is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // Compare entered password with stored hashed password
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update lastLogin timestamp for activity tracking
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token with user data (name and email included in token payload)
    const token = createToken(user);

    // Return success message with token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    // If any error occurs, send error message
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Get user profile by email (public endpoint)
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('-password -otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user profile (public data only, no password)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user profile by register number
exports.getUserByRegisterNumber = async (req, res) => {
  try {
    const { registerNumber } = req.params;

    if (!registerNumber) {
      return res.status(400).json({
        success: false,
        message: "Register number is required",
      });
    }

    // Find user by register number
    const user = await User.findOne({ registerNumber }).select('-password -otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user profile (public data only, no password)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user profile (bio, skills, year, etc.)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id; // From authMiddleware
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    const { bio, skills, year } = req.body;

    // Find user and update profile fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
        ...(year !== undefined && { year }),
      },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        registerNumber: updatedUser.registerNumber,
        department: updatedUser.department,
        year: updatedUser.year,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all 4th year students (for mentor selection)
exports.getAllStudents = async (req, res) => {
  try {
    // Find all 4th year students
    const students = await User.find({ year: 4 }).select('-password -otp -otpExpiry');

    res.status(200).json({
      success: true,
      students: students,
      count: students.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// Get Current User Profile (with authMiddleware)
// ============================================================
// What it does:
// 1. Uses authMiddleware to extract user email from JWT token
// 2. Fetches user profile from database
// 3. Returns user profile including latest profile image
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // Get email from authMiddleware (attached to req.user)
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found in token"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail }).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return user profile
    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// GET USER PROFILE BY EMAIL - Fetch any user's profile publicly
// ============================================================
// What it does:
// 1. Takes email as URL parameter
// 2. Fetches user profile from database (including latest profile image)
// 3. Returns user profile data publicly
exports.getUserProfileByEmail = async (req, res) => {
  try {
    // Get email from URL parameter
    const userEmail = req.params.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail }).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return user profile
    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// FORGOT PASSWORD - Send password reset link to user's email
// ============================================================
// What it does:
// 1. User enters email
// 2. Find user by email
// 3. Generate random reset token (valid for 1 hour)
// 4. Save token to database
// 5. Send reset link to user's email
// 6. Return success or error message
exports.forgotPassword = async (req, res) => {
  try {
    // Get email and frontendUrl from request body
    let { email } = req.body;
    let { frontendUrl } = req.body;

    // ✅ INPUT VALIDATION - Email is required
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // ✅ INPUT VALIDATION - Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // ✅ SECURITY - Normalize email (lowercase & trim)
    email = email.toLowerCase().trim();

    // ✅ OPTIMIZATION - Fetch only needed fields for faster query
    const user = await User.findOne({ email }).select('name email resetToken resetTokenExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found in system"
      });
    }

    // Generate random reset token using crypto
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token and expiry (1 hour from now)
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Use environment variable, passed frontendUrl, or default
    const baseUrl = process.env.FRONTEND_URL || frontendUrl || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    // Send reset email ASYNCHRONOUSLY (don't wait for it)
    // This makes API response faster - user gets immediate feedback
    // Email is sent in background without blocking the response
    const { sendResetEmail } = require("../utils/email");
    sendResetEmail(email, resetLink, user.name).catch(emailError => {
      // Log error but don't fail the request
      console.log('⚠️ Email sending failed (background task):', emailError.message);
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email. Check your spam folder if not received.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// RESET PASSWORD - Update password with reset token
// ============================================================
// What it does:
// 1. User enters new password with reset token
// 2. Find user by reset token
// 3. Check if token is not expired
// 4. Hash new password
// 5. Update password and clear reset token
// 6. Return success or error message
exports.resetPassword = async (req, res) => {
  try {
    // Get reset token and new password from request body
    const { resetToken, newPassword } = req.body;

    // ✅ INPUT VALIDATION - Both fields required
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required"
      });
    }

    // ✅ INPUT VALIDATION - Reset token format (should be 64 char hex string)
    const tokenRegex = /^[a-f0-9]{64}$/i;
    if (!tokenRegex.test(resetToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token format"
      });
    }

    // ✅ INPUT VALIDATION - Password length (minimum 6 characters)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // ✅ INPUT VALIDATION - Password length (maximum 128 characters)
    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password is too long (maximum 128 characters)"
      });
    }

    // ✅ SECURITY - Check for SQL injection patterns in password
    if (newPassword.includes("'") || newPassword.includes('"') || newPassword.includes(";")) {
      // Actually, this is fine - passwords can have special characters
      // The hashing will handle it. Just trim the password.
    }

    // ✅ SECURITY - Trim whitespace from password
    const trimmedPassword = newPassword.trim();

    // ✅ OPTIMIZATION - Fetch only needed fields for faster query
    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() } // Token must not be expired
    }).select('password resetToken resetTokenExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await hashPasswordMiddleware(trimmedPassword);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// SEARCH USERS BY SKILL - Find users with specific skills
// ============================================================
// What it does:
// 1. Takes skill name as query parameter
// 2. Searches users whose skills array contains the skill
// 3. Case-insensitive search
// 4. Returns all matching users with their profiles
// 5. Excludes password and sensitive fields
exports.searchUsersBySkill = async (req, res) => {
  try {
    // Get skill query from URL parameter
    const { skill } = req.params;

    // ✅ INPUT VALIDATION - Skill is required
    if (!skill || skill.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Skill name is required"
      });
    }

    // ✅ SECURITY - Trim whitespace and normalize skill search
    const searchSkill = skill.trim().toLowerCase();

    // ✅ OPTIMIZATION - Use regex for case-insensitive search on skills array
    // This finds users where ANY skill in their skills array matches the search term
    const users = await User.find({
      skills: { $regex: searchSkill, $options: 'i' } // i = case-insensitive
    }).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry');

    // If no users found, return empty array with appropriate message
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No users found with skill: ${skill}`,
        users: [],
        count: 0
      });
    }

    // Return found users
    return res.status(200).json({
      success: true,
      message: `Found ${users.length} user(s) with skill: ${skill}`,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        profileImage: user.profileImage
      })),
      count: users.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// SEARCH USERS BY MULTIPLE CRITERIA - Find users by name, email, or skill
// ============================================================
// What it does:
// 1. Takes search query as parameter
// 2. Searches in name, email, department, and skills
// 3. Returns matching users
// 4. Case-insensitive search
exports.searchUsers = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get search query and searcher's email from request
    const { query } = req.params;
    const searcherEmail = req.headers['x-user-email'] || req.body.searcherEmail;

    // ✅ INPUT VALIDATION - Query is required
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // ✅ SECURITY - Trim whitespace and create search regex
    const searchQuery = query.trim();
    
    // Prevent regex DOS with query length limit
    if (searchQuery.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Search query too long (max 50 characters)"
      });
    }

    const searchRegex = { $regex: searchQuery, $options: 'i' };

    // Function to escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedQuery = escapeRegex(searchQuery);

    // Get searcher's department for network-based ranking
    let searcherDepartment = null;
    if (searcherEmail) {
      const searcher = await User.findOne({ email: searcherEmail });
      if (searcher) {
        searcherDepartment = searcher.department;
      }
    }

    // Search in name, email, department (substring match)
    // For skills, use exact match (case-insensitive)
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { skills: { $regex: `^${escapedQuery}$`, $options: 'i' } }
      ]
    }).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry').lean(); // lean() improves performance

    // ============================================================
    // FIND USERS WHO POSTED ABOUT THIS SKILL & GET ENGAGEMENT
    // ============================================================
    // Use MongoDB aggregation pipeline for efficient processing
    // This prevents memory issues with posts having 300+ likes
    const postEngagementData = await Post.aggregate([
      // 1. Match posts containing the search query
      {
        $match: {
          content: { $regex: searchQuery, $options: 'i' }
        }
      },
      // 2. Use arrayElemAt to get array length efficiently (not loading individual objects)
      {
        $addFields: {
          likeCount: {
            $cond: [
              { $isArray: '$reactions.likes' },
              { $size: '$reactions.likes' },
              0
            ]
          }
        }
      },
      // 3. Group by author and sum their total likes
      {
        $group: {
          _id: { $toLower: '$authorEmail' },
          totalLikes: { $sum: '$likeCount' },
          postCount: { $sum: 1 }
        }
      },
      // 4. Only return authors with posts (optimization)
      {
        $match: {
          _id: { $ne: null }
        }
      },
      // 5. Limit to prevent memory overload (top 100 most engaged users)
      {
        $limit: 100
      }
    ]);

    // Convert to map for O(1) lookup
    const userPostEngagement = {};
    const userEmailsWithPosts = new Set();
    postEngagementData.forEach(data => {
      if (data._id) {
        userPostEngagement[data._id] = data.totalLikes;
        userEmailsWithPosts.add(data._id);
      }
    });

    console.log(`📊 Search optimization: Found ${postEngagementData.length} users with posts about "${searchQuery}"`);

    // ============================================================
    // SMART SCORING SYSTEM - NEW: Engagement + Versatility
    // ============================================================
    const scoredUsers = users.map(user => {
      let score = 0;
      const userEmail = user.email?.toLowerCase();
      const totalLikesOnSkillPosts = userPostEngagement[userEmail] || 0;
      const hasPostedAboutSkill = userEmailsWithPosts.has(userEmail);

      // 1️⃣ POSTED ABOUT SKILL SCORE - 25 points
      // Users who posted about this skill get bonus (shows active interest)
      if (hasPostedAboutSkill) {
        score += 25;
      }

      // 2️⃣ POST ENGAGEMENT SCORE - 25 points
      // Users with popular posts about this skill (more likes = proven expertise)
      // Uses logarithmic scale: 5 likes = 15pts, 50 likes = 23pts, 300+ likes = 25pts
      // This prevents posts with 300+ likes from dominating results
      if (totalLikesOnSkillPosts > 0) {
        // Logarithmic scale: log prevents huge numbers from overwhelming score
        const engagementScore = Math.min(25, Math.log10(totalLikesOnSkillPosts + 1) * 10);
        score += engagementScore;
      }

      // 3️⃣ SKILL VERSATILITY SCORE - 25 points
      // Users with multiple skills show they're well-rounded developers
      if (user.skills && user.skills.length > 0) {
        // 1 skill = 10pts, 2 skills = 15pts, 3+ skills = 25pts
        let versatilityScore = 0;
        if (user.skills.length === 1) versatilityScore = 10;
        else if (user.skills.length === 2) versatilityScore = 15;
        else if (user.skills.length >= 3) versatilityScore = 25;
        score += versatilityScore;
      }

      // 4️⃣ RECENCY SCORE - 15 points
      // Users active in last 30 days score higher
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const userLastActive = user.lastLogin || user.createdAt;
      
      if (userLastActive >= thirtyDaysAgo) {
        score += 15;
      } else {
        const daysSinceActive = (Date.now() - userLastActive) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 15 * (1 - daysSinceActive / 365));
        score += recencyScore;
      }

      // 5️⃣ PROFILE COMPLETENESS SCORE - 10 points
      // Users with complete profiles score higher
      let profileScore = 0;
      if (user.bio && user.bio.trim() !== '') profileScore += 3;
      if (user.profileImage) profileScore += 4;
      if (user.skills && user.skills.length > 0) profileScore += 3;
      score += profileScore;

      return {
        user,
        score,
        hasPostedAboutSkill,
        totalLikesOnSkillPosts,
        skillCount: user.skills?.length || 0
      };
    });

    // ============================================================
    // SORT AND LIMIT RESULTS
    // ============================================================
    const rankedUsers = scoredUsers
      .sort((a, b) => b.score - a.score) // Sort by score (highest first)
      .slice(0, 30); // Limit to 30 results

    const executionTime = Date.now() - startTime;
    
    // ⚡ Performance logging
    console.log(`\n🔍 SEARCH PERFORMANCE for "${query}":
      ├─ Total users found: ${users.length}
      ├─ Posts analyzed: ${postEngagementData.length}
      ├─ Ranked results: ${rankedUsers.length}
      ├─ Execution time: ${executionTime}ms
      └─ Status: ${executionTime > 1000 ? '⚠️ SLOW' : '✅ FAST'}\n`);

    // Return results
    return res.status(200).json({
      success: true,
      message: `Found ${rankedUsers.length} of ${users.length} user(s) matching: ${query} (showing top 30)`,
      users: rankedUsers.map(item => ({
        _id: item.user._id,
        name: item.user.name,
        email: item.user.email,
        registerNumber: item.user.registerNumber,
        department: item.user.department,
        year: item.user.year,
        bio: item.user.bio,
        skills: item.user.skills,
        profileImage: item.user.profileImage,
        score: Math.round(item.score), // Show relevance score (0-100)
        hasPostedAboutSkill: item.hasPostedAboutSkill, // User posted about this skill
        postEngagement: item.totalLikesOnSkillPosts, // Total likes on posts about skill
        skillCount: item.skillCount // Number of skills user has
      })),
      count: rankedUsers.length,
      totalMatched: users.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
