// ============================================================
// RATE LIMITING MIDDLEWARE
// ============================================================
// Prevents abuse by limiting number of requests per time period
// Tracks requests in memory (for production, use Redis)

// Store request counts: Map<identifier, Array<timestamps>>
const requestCounts = new Map();

// ============================================================
// FORGOT PASSWORD RATE LIMITER
// ============================================================
// Limit: 3 forgot password requests per hour per email
// Purpose: Prevent email spam and brute force attacks
const forgotPasswordLimiter = (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase();
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Use email as identifier
    const identifier = `forgot-pwd-${email}`;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds

    // Get previous requests for this email
    let requests = requestCounts.get(identifier) || [];

    // Remove old requests (older than 1 hour)
    requests = requests.filter(timestamp => timestamp > oneHourAgo);

    // Check if limit exceeded (3 per hour)
    if (requests.length >= 3) {
      const oldestRequest = requests[0];
      const resetTime = new Date(oldestRequest + 60 * 60 * 1000);
      
      return res.status(429).json({
        success: false,
        message: `Too many password reset requests. Please try again after ${resetTime.toLocaleTimeString()}`,
        retryAfter: Math.ceil((resetTime - now) / 1000) // seconds
      });
    }

    // Add current request timestamp
    requests.push(now);
    requestCounts.set(identifier, requests);

    // Continue to next middleware
    next();
  } catch (error) {
    console.log('Rate limiter error:', error.message);
    next(); // Continue even if rate limiter fails
  }
};

// ============================================================
// RESET PASSWORD RATE LIMITER
// ============================================================
// Limit: 5 reset attempts per hour per IP
// Purpose: Prevent brute force token guessing
const resetPasswordLimiter = (req, res, next) => {
  try {
    const userIP = req.ip || req.connection.remoteAddress;
    const identifier = `reset-pwd-${userIP}`;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Get previous requests for this IP
    let requests = requestCounts.get(identifier) || [];

    // Remove old requests (older than 1 hour)
    requests = requests.filter(timestamp => timestamp > oneHourAgo);

    // Check if limit exceeded (5 per hour)
    if (requests.length >= 5) {
      const oldestRequest = requests[0];
      const resetTime = new Date(oldestRequest + 60 * 60 * 1000);
      
      return res.status(429).json({
        success: false,
        message: `Too many password reset attempts. Please try again later.`,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      });
    }

    // Add current request timestamp
    requests.push(now);
    requestCounts.set(identifier, requests);

    // Continue to next middleware
    next();
  } catch (error) {
    console.log('Rate limiter error:', error.message);
    next(); // Continue even if rate limiter fails
  }
};

// ============================================================
// GENERAL RATE LIMITER
// ============================================================
// Limit: 10 requests per minute per IP (for any route)
const generalLimiter = (req, res, next) => {
  try {
    const userIP = req.ip || req.connection.remoteAddress;
    const identifier = `general-${userIP}`;
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);

    let requests = requestCounts.get(identifier) || [];
    requests = requests.filter(timestamp => timestamp > oneMinuteAgo);

    if (requests.length >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    requests.push(now);
    requestCounts.set(identifier, requests);

    next();
  } catch (error) {
    console.log('Rate limiter error:', error.message);
    next();
  }
};

// ============================================================
// CLEANUP OLD REQUESTS (Run every 30 minutes)
// ============================================================
// Remove old entries from memory to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const twoHoursAgo = now - (2 * 60 * 60 * 1000);

  for (const [key, requests] of requestCounts.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > twoHoursAgo);
    
    if (validRequests.length === 0) {
      // Remove entry if no valid requests
      requestCounts.delete(key);
    } else {
      // Update with only valid requests
      requestCounts.set(key, validRequests);
    }
  }

  console.log(`✅ Rate limiter cleanup: ${requestCounts.size} active limiters`);
}, 30 * 60 * 1000); // Every 30 minutes

// Export rate limiters
module.exports = {
  forgotPasswordLimiter,
  resetPasswordLimiter,
  generalLimiter,
};
