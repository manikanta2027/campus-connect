// Import useState hook to manage form data
import { useState } from 'react'
// Import useNavigate to redirect after registration
import { useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import toast for professional notifications
import toast from 'react-hot-toast'

function Register() {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State for storing form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registerNumber: '',
    department: '',
    year: '',
  })

  // State for error messages
  const [error, setError] = useState('')
  // State for loading spinner while submitting
  const [loading, setLoading] = useState(false)
  // State for field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    registerNumber: '',
  })

  // Validation function for email
  const validateEmail = (email) => {
    // Check if email is provided
    if (!email) return 'Email is required'
    // Regex for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    // Check if it's a gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return 'Please use a Gmail address (@gmail.com)'
    }
    return ''
  }

  // Validation function for register number
  const validateRegisterNumber = (regNum) => {
    // Check if register number is provided
    if (!regNum) return 'Register number is required'
    // Check if it's exactly 10 characters (alphanumeric: letters and numbers)
    const alphanumericRegex = /^[A-Za-z0-9]{10}$/
    if (!alphanumericRegex.test(regNum)) {
      return 'Register number must be exactly 10 characters (letters and numbers)'
    }
    return ''
  }

  // Function to handle input changes
  const handleChange = (e) => {
    // Get name and value from input element
    const { name, value } = e.target
    // Update form data with new value
    setFormData({
      ...formData,
      [name]: value,
    })
    // Real-time validation for email
    if (name === 'email') {
      setFieldErrors({
        ...fieldErrors,
        email: validateEmail(value),
      })
    }
    // Real-time validation for register number
    if (name === 'registerNumber') {
      setFieldErrors({
        ...fieldErrors,
        registerNumber: validateRegisterNumber(value),
      })
    }
  }

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault()
    // Clear previous errors
    setError('')

    // Validate email
    const emailError = validateEmail(formData.email)
    if (emailError) {
      setFieldErrors({ ...fieldErrors, email: emailError })
      setError('Please fix validation errors before submitting')
      return
    }

    // Validate register number
    const regError = validateRegisterNumber(formData.registerNumber)
    if (regError) {
      setFieldErrors({ ...fieldErrors, registerNumber: regError })
      setError('Please fix validation errors before submitting')
      return
    }

    // Show loading spinner
    setLoading(true)

    try {
      // Send registration request to backend
      const response = await axios.post('/api/auth/register', formData)

      // If registration successful, redirect to login page
      if (response.data.success) {
        // Show professional success notification
        toast.success('Welcome to Campus Connect! 🎉', {
          style: {
            borderLeft: '4px solid #10b981',
            fontSize: '1rem',
            fontWeight: '600',
          },
        })
        toast.success('Registration successful! Please login to continue.', {
          style: {
            borderLeft: '4px solid #10b981',
            fontSize: '0.95rem',
          },
          duration: 2000,
        })
        // // Store email temporarily to use in OTP verification
        // localStorage.setItem('tempEmail', formData.email)
        // // Also store OTP if available for testing
        // if (response.data.otp) {
        //   localStorage.setItem('tempOTP', response.data.otp)
        // }
        // Redirect to login page
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err) {
      // Show error message from backend or generic error
      setError(err.response?.data?.message || 'Registration failed')
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
            onClick={() => navigate('/login')}
            className="px-2 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Register Form - Responsive */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8" style={{ minHeight: 'calc(100vh - 70px)' }}>
        {/* Card container */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-4 sm:mb-6">
            Campus Connect
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
            Create your account to join the college community
          </p>

          {/* Error message display */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email (@gmail.com)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@gmail.com"
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Register Number input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Register Number
              </label>
              <input
                type="text"
                name="registerNumber"
                value={formData.registerNumber}
                onChange={handleChange}
                placeholder="e.g., 23B91A6129"
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.registerNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {fieldErrors.registerNumber && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{fieldErrors.registerNumber}</p>
              )}
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
                placeholder="Enter a strong password"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Department input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                <option value="AIDS">AIDS (Artificial Intelligence and Data Science)</option>
                <option value="AIML">AIML (AI & Machine Learning)</option>
                <option value="CIC">CIC (Cybersecurity)</option>
                <option value="CIVIL">CIVIL (Civil Engineering)</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="CSD">CSD (Computer Science and Design)</option>
                <option value="CSIT">CSIT (Computer Science and Information Technology)</option>
                <option value="CSBS">CSBS (Computer Science and Business Systems)</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="MECH">MECH (Mechanical)</option>
              </select>
            </div>

            {/* Year input field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Link to login page */}
          <p className="text-center text-gray-600 mt-6 text-sm sm:text-base">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
