// Import useState hook to manage form data
import { useState } from 'react'
// Import useNavigate to redirect after login
import { useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import toast for professional notifications
import toast from 'react-hot-toast'
// Import API configuration
import API_URL from '../config/api'

function Login({ onLogin }) {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State for storing form input values
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // State for error messages
  const [error, setError] = useState('')
  // State for loading spinner while submitting
  const [loading, setLoading] = useState(false)

  // Function to handle input changes
  const handleChange = (e) => {
    // Get name and value from input element
    const { name, value } = e.target
    // Update form data with new value
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault()
    // Clear previous errors
    setError('')
    // Show loading spinner
    setLoading(true)

    try {
      // Send login request to backend
      const response = await axios.post(`${API_URL}/auth/login`, formData)

      // Log the response for debugging
      console.log('Login response:', response.data);

      // If login successful, save token and redirect to feed
      if (response.data.success) {
        // Get JWT token from response (contains user data: name, email, id)
        const token = response.data.token
        const newEmail = response.data.email
        const newName = response.data.name
        
        // Clear any old profile data from localStorage for this tab
        // (in case user was previously logged in as different user in this same tab)
        localStorage.removeItem('userPosts')
        localStorage.removeItem('userLikes')
        localStorage.removeItem('expandedComments')
        
        // Call parent function to update login state and store token in sessionStorage
        onLogin(token)
        
        // NO LONGER STORE USERNAME/EMAIL IN LOCALSTORAGE!
        // Each tab now has independent token in sessionStorage
        // User data is decoded from JWT token, not read from localStorage
        // This prevents multi-tab user data contamination
        
        // Show professional greeting notification
        toast.success(`Welcome back, ${newName}! 👋`, {
          style: {
            borderLeft: '4px solid #10b981',
            fontSize: '1rem',
            fontWeight: '600',
          },
        })
        // Redirect to feed page
        navigate('/feed')
      }
    } catch (err) {
      // Show error message from backend or generic error
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      // Hide loading spinner
      setLoading(false)
    }
  }

  return (
    // Main container with background color
    <div className="min-h-screen bg-blue-50">
      {/* Navigation Bar - Responsive */}
      <nav className="bg-white shadow-md px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 whitespace-nowrap">Campus Connect</h1>
        <div className="flex gap-2 sm:gap-4 items-center">
          <button
            onClick={() => navigate('/about')}
            className="text-sm sm:text-base text-gray-700 hover:text-blue-600 font-medium transition"
          >
            About Us
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-2 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition whitespace-nowrap"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Login Form - Responsive */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8" style={{ minHeight: 'calc(100vh - 70px)' }}>
        {/* Card container */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-sm">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6 sm:mb-8">
            Campus Connect
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
            Login to your account
          </p>

          {/* Error message display */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@gmail.com"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Link to registration page */}
          <p className="text-center text-gray-600 mt-6 text-sm sm:text-base">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Register here
            </a>
          </p>

          {/* Forgot password link */}
          <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Forgot password?
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
