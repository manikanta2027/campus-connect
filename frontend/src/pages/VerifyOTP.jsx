// Import useState hook to manage form data
import { useState, useEffect } from 'react'
// Import useNavigate to redirect after OTP verification
import { useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import API configuration
import API_URL from '../config/api'

function VerifyOTP() {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State for storing OTP code
  const [otp, setOTP] = useState('')
  // State for error messages
  const [error, setError] = useState('')
  // State for loading spinner while submitting
  const [loading, setLoading] = useState(false)

  // Get email from localStorage (saved during registration)
  const email = localStorage.getItem('tempEmail')
  // Get OTP from localStorage if available (for testing)
  const storedOTP = localStorage.getItem('tempOTP')

  // Show OTP in console for debugging
  useEffect(() => {
    if (storedOTP) {
      console.log('OTP found:', storedOTP)
    } else {
      console.log('No OTP in localStorage')
    }
  }, [storedOTP])

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault()
    // Clear previous errors
    setError('')
    // Show loading spinner
    setLoading(true)

    try {
      // Send OTP verification request to backend
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      })

      // If verification successful, redirect to login
      if (response.data.success) {
        alert('Email verified successfully! You can now login.')
        // Remove temporary email from storage
        localStorage.removeItem('tempEmail')
        // Redirect to login page
        navigate('/login')
      }
    } catch (err) {
      // Show error message from backend or generic error
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      // Hide loading spinner
      setLoading(false)
    }
  }

  return (
    // Main container with background color
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      {/* Card container */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Verify Email
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-2">
          Enter the OTP sent to your Gmail
        </p>
        <p className="text-center text-gray-500 text-sm mb-6">
          {email}
        </p>

        {/* Error message display */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Show OTP for testing if available */}
        {storedOTP && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4 border-2 border-blue-400 animate-pulse">
            <p className="font-semibold text-sm mb-2">📋 Your OTP for Testing:</p>
            <p className="text-3xl font-bold text-blue-600 text-center mb-2" style={{letterSpacing: '10px'}}>{storedOTP}</p>
            <p className="text-xs text-blue-700">👆 Copy this OTP above and paste in the input field below</p>
          </div>
        )}

        {/* Show error if no OTP found */}
        {!storedOTP && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4 border border-yellow-300">
            <p className="font-semibold text-sm">⚠️ OTP Not Found</p>
            <p className="text-xs mt-2">Please register first or click "Resend OTP" below to get your OTP</p>
          </div>
        )}

        {/* OTP verification form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP input field */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              OTP Code (6 digits)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {/* Info message */}
        <p className="text-center text-gray-600 text-sm mt-6">
          OTP is valid for 10 minutes
        </p>

        {/* Link to register page */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Didn't receive OTP?{' '}
          <button
            onClick={async () => {
              // Resend OTP by calling send-otp endpoint
              try {
                const response = await axios.post(`${API_URL}/auth/send-otp`, {
                  email,
                })
                if (response.data.otp) {
                  // Show new OTP
                  localStorage.setItem('tempOTP', response.data.otp)
                  window.location.reload()
                }
                alert('OTP resent! Check your email or the box above.')
              } catch (err) {
                alert('Failed to resend OTP: ' + err.response?.data?.message)
              }
            }}
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  )
}

export default VerifyOTP
