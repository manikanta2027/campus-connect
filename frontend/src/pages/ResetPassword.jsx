// Import hooks from React
import { useState, useEffect, useCallback, useMemo } from 'react'
// Import useParams to get reset token from URL
import { useParams, useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import toast for professional notifications
import toast from 'react-hot-toast'
// Import validation utilities
import { validatePassword, validatePasswordMatch, getPasswordStrengthColor } from '../utils/validation'
// Import API configuration
import API_URL from '../config/api'

function ResetPassword() {
  // Get reset token from URL parameter
  const { token } = useParams()
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State for new password input
  const [newPassword, setNewPassword] = useState('')
  // State for confirm password input
  const [confirmPassword, setConfirmPassword] = useState('')
  // State for loading spinner while submitting
  const [loading, setLoading] = useState(false)
  // State for showing password
  const [showPassword, setShowPassword] = useState(false)
  // State for showing confirm password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // State to show success message
  const [isSuccess, setIsSuccess] = useState(false)
  // State for password validation error
  const [passwordError, setPasswordError] = useState('')
  // State for confirm password validation error
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
      navigate('/login')
    }
  }, [token, navigate])

  // ✅ OPTIMIZATION: Memoize password validation (only recalculate when password changes)
  const passwordValidation = useMemo(() => {
    if (!newPassword) return { valid: false, strength: 'weak' };
    return validatePassword(newPassword);
  }, [newPassword]);

  // ✅ OPTIMIZATION: Memoize password match validation
  const passwordMatchValidation = useMemo(() => {
    if (!newPassword || !confirmPassword) return { valid: false };
    return validatePasswordMatch(newPassword, confirmPassword);
  }, [newPassword, confirmPassword]);

  // Handle password change with validation
  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setNewPassword(value);

    // ✅ OPTIMIZATION: Validate password immediately
    if (value) {
      const validation = validatePassword(value);
      setPasswordError(validation.valid ? '' : validation.message);
    } else {
      setPasswordError('');
    }
  }, []);

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = useCallback((e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // ✅ OPTIMIZATION: Validate password match immediately
    if (value && newPassword) {
      const validation = validatePasswordMatch(newPassword, value);
      setConfirmPasswordError(validation.valid ? '' : validation.message);
    } else {
      setConfirmPasswordError('');
    }
  }, [newPassword]);

  // Get password strength color
  const strengthColor = useMemo(() => {
    return getPasswordStrengthColor(passwordValidation.strength);
  }, [passwordValidation.strength]);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault()

    // ✅ OPTIMIZATION: Validate before API call
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message || 'Password is not valid', {
        style: {
          borderLeft: '4px solid #ef4444',
          fontSize: '1rem',
          fontWeight: '600',
        },
      });
      return;
    }

    if (!passwordMatchValidation.valid) {
      toast.error('Passwords do not match!', {
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
      // Send reset password request to backend
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        resetToken: token,
        newPassword,
      }, {
        // ✅ OPTIMIZATION: Add timeout to prevent hanging requests
        timeout: 10000, // 10 seconds
      })

      // If request successful
      if (response.data.success) {
        // Show success notification
        toast.success('Password reset successfully!', {
          style: {
            borderLeft: '4px solid #10b981',
            fontSize: '1rem',
            fontWeight: '600',
          },
        })
        // Show success message on page
        setIsSuccess(true)
      }
    } catch (error) {
      // Show error notification
      const errorMessage = error.response?.data?.message || error.message || 'Error resetting password. Please try again.'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 font-semibold mb-2">✅ Password Reset Successfully!</p>
              <p className="text-gray-700 text-sm">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Go to Login
            </button>
          </div>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    passwordError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {/* ✅ OPTIMIZATION: Show password strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-600">Password Strength</p>
                    <p style={{ color: strengthColor }} className="text-xs font-semibold">
                      {passwordValidation.strength?.toUpperCase()}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{
                        backgroundColor: strengthColor,
                        width:
                          passwordValidation.strength === 'weak'
                            ? '33%'
                            : passwordValidation.strength === 'medium'
                            ? '66%'
                            : '100%',
                      }}
                      className="h-full transition-all duration-300"
                    ></div>
                  </div>
                </div>
              )}
              {passwordError && (
                <p className="text-red-600 text-sm mt-2 font-medium">❌ {passwordError}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                At least 6 characters | Mix uppercase, lowercase, and numbers for strong security
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    confirmPasswordError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-red-600 text-sm mt-2 font-medium">❌ {confirmPasswordError}</p>
              )}
            </div>

            {/* Password Match Indicator */}
            {newPassword && confirmPassword && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${
                passwordMatchValidation.valid
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {passwordMatchValidation.valid ? '✅ Passwords match' : '❌ Passwords do not match'}
              </div>
            )}

            {/* Submit Button - Disabled if passwords invalid */}
            <button
              type="submit"
              disabled={loading || !passwordValidation.valid || !passwordMatchValidation.valid}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to Login Link */}
            <p className="text-center text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:underline font-semibold"
              >
                Back to login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
