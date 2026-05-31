// Import useState hook to manage form data
import { useState, useCallback, useMemo } from 'react'
// Import useNavigate to redirect after password reset request
import { useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import toast for professional notifications
import toast from 'react-hot-toast'
// Import validation utilities
import { validateEmail, isEmailValid } from '../utils/validation'
// Import custom hooks for optimization
import { useDebouncedCallback } from '../hooks/useOptimization'

function ForgotPassword() {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State for email input
  const [email, setEmail] = useState('')

  // State for email validation error
  const [emailError, setEmailError] = useState('')

  // State for loading spinner while submitting
  const [loading, setLoading] = useState(false)

  // State to show success message
  const [isSubmitted, setIsSubmitted] = useState(false)

  // ✅ OPTIMIZATION: Memoize validation result (only recalculate when email changes)
  const emailValidation = useMemo(() => {
    if (!email) return { valid: false, message: '' };
    return validateEmail(email);
  }, [email]);

  // ✅ OPTIMIZATION: Debounce email validation (don't validate while typing)
  const handleEmailValidation = useDebouncedCallback((emailValue) => {
    if (!emailValue) {
      setEmailError('');
      return;
    }
    const validation = validateEmail(emailValue);
    setEmailError(validation.valid ? '' : validation.message);
  }, 300); // Wait 300ms after user stops typing

  // Handle email change
  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    // Trigger debounced validation
    handleEmailValidation(value);
  }, [handleEmailValidation]);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault()
    
    // ✅ OPTIMIZATION: Validate before API call
    if (!isEmailValid(email)) {
      toast.error('Please enter a valid email address', {
        style: {
          borderLeft: '4px solid #ef4444',
          fontSize: '1rem',
          fontWeight: '600',
        },
      });
      return;
    }

    // Show loading spinner
    setLoading(true)

    try {
      // Get API URL from environment
      // Send forgot password request to backend
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.toLowerCase().trim(),
        // Send current deployment URL so backend knows where to send the reset link
        frontendUrl: window.location.origin,
      }, {
        // ✅ OPTIMIZATION: Add timeout to prevent hanging requests
        timeout: 10000, // 10 seconds
      })

      // If request successful
      if (response.data.success) {
        // Show success notification
        toast.success('Reset link sent to your email!', {
          style: {
            borderLeft: '4px solid #10b981',
            fontSize: '1rem',
            fontWeight: '600',
          },
        })
        // Show success message on page
        setIsSubmitted(true)
        // Clear email input
        setEmail('')
        setEmailError('')
      }
    } catch (error) {
      // Show error notification
      const errorMessage = error.response?.data?.message || error.message || 'Error sending reset link. Please try again.'
      toast.error(errorMessage, {
        style: {
          borderLeft: '4px solid #ef4444',
          fontSize: '1rem',
          fontWeight: '600',
        },
      })
    } finally {
      // Hide loading spinner
      setLoading(false)
    }
  }

  // ✅ OPTIMIZATION: Use useCallback to prevent unnecessary re-renders of child components
  const handleReset = useCallback(() => {
    setIsSubmitted(false);
    setEmail('');
    setEmailError('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! We'll help you reset your password.
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 font-semibold mb-2">✅ Email Sent Successfully!</p>
              <p className="text-gray-700 text-sm">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-gray-700 text-sm mt-3">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Send Another Email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          /* Forgot Password Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  emailError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {/* ✅ OPTIMIZATION: Show validation feedback immediately */}
              {emailError && (
                <p className="text-red-600 text-sm mt-2 font-medium">❌ {emailError}</p>
              )}
              {email && !emailError && (
                <p className="text-green-600 text-sm mt-2 font-medium">✅ Email looks good</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                Enter the email address associated with your account
              </p>
            </div>

            {/* Submit Button - Disabled if email invalid */}
            <button
              type="submit"
              disabled={loading || !isEmailValid(email)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Back to Login Link */}
            <p className="text-center text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:underline font-semibold"
              >
                Login here
              </button>
            </p>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-500 hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
