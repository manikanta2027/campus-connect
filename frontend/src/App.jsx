// Import React components
import { useState } from 'react'
// Import React Router for page navigation
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// Import Toaster for professional notifications
import { Toaster } from 'react-hot-toast'

// Import page components
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Hackathons from './pages/Hackathons'
import Search from './pages/Search'
import AdminDashboard from './pages/AdminDashboard'
import AboutUs from './pages/AboutUs'
// Import mentorship pages
import MentorsList from './pages/MentorsList'
import MentorChat from './pages/MentorChat'
import Conversations from './pages/Conversations'

function App() {
  // CRITICAL: Use sessionStorage (per-tab) instead of localStorage (shared across tabs)
  // This ensures each browser tab maintains its own independent token
  // When you login with different users in different tabs, each tab keeps its own token
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('token') ? true : false)
  const [token, setToken] = useState(sessionStorage.getItem('token') || '')

  // Update login state and token
  const handleLogin = (jwtToken) => {
    setToken(jwtToken)
    setIsLoggedIn(true)
    // Store in sessionStorage (per-tab only), NOT localStorage (shared across all tabs)
    sessionStorage.setItem('token', jwtToken)
  }

  // Clear login state and token
  const handleLogout = () => {
    setToken('')
    setIsLoggedIn(false)
    // Remove from sessionStorage (per-tab)
    sessionStorage.removeItem('token')
    
    // Also cleanup localStorage for this tab's user-specific data
    localStorage.removeItem('userPosts')
    localStorage.removeItem('userLikes')
  }

  return (
    // Use Router to enable page navigation
    <Router>
      {/* Toast notification container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '500',
          },
          success: {
            style: {
              borderLeft: '4px solid #10b981',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes - Anyone can access */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes - Only logged in users can access */}
        {/* If user tries to access these without logging in, redirect to login */}
        <Route 
          path="/feed" 
          element={isLoggedIn ? <Feed token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isLoggedIn ? <Profile token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/hackathons" 
          element={isLoggedIn ? <Hackathons token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/search" 
          element={isLoggedIn ? <Search token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isLoggedIn ? <AdminDashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/mentors" 
          element={isLoggedIn ? <MentorsList token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/mentor-chat/:conversationId" 
          element={isLoggedIn ? <MentorChat token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/conversations" 
          element={isLoggedIn ? <Conversations token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
