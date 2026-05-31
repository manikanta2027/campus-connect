// Import useState and useEffect hooks
import { useState, useEffect } from 'react'
// Import useNavigate to redirect
import { useNavigate } from 'react-router-dom'
// Import SearchBar component
import SearchBar from '../components/SearchBar'
// Import API configuration
import API_URL from '../config/api'

function AdminDashboard({ token, onLogout }) {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State to store list of all events
  const [events, setEvents] = useState([])
  // State for loading spinner
  const [loading, setLoading] = useState(true)
  // State to track if showing create event form
  const [showCreateForm, setShowCreateForm] = useState(false)
  // State to track if showing edit form
  const [showEditForm, setShowEditForm] = useState(false)
  // State for which event is being edited
  const [editingEventId, setEditingEventId] = useState(null)
  // State to track active tab (events or mentors)
  const [activeTab, setActiveTab] = useState('events')
  // State to store all students (for mentor selection)
  const [allStudents, setAllStudents] = useState([])
  // State to store current mentors
  const [mentors, setMentors] = useState([])
  // State for mentor search input
  const [mentorSearch, setMentorSearch] = useState('')

  // State for event form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    eventUrl: '',
    eventImage: null,
    eventImagePreview: ''
  })
  // State for image upload status
  const [isUploading, setIsUploading] = useState(false)

  // Decode JWT token to get current user info
  const getCurrentUserFromToken = () => {
    try {
      if (!token) return null;
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        userEmail: decoded.email,
        userName: decoded.name,
        userId: decoded.id || decoded._id
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const currentUser = getCurrentUserFromToken();
  const userName = currentUser?.userName
  const userEmail = currentUser?.userEmail

  // Admin emails list - Add your admin emails here
  const adminEmails = [
    'sowrya@gmail.com',
    'admin@campus.local',
    'chitimereddimanikanta2006@gmail.com'
  ]

  // Check if current user is admin
  const isAdmin = adminEmails.includes(userEmail)

  // Redirect non-admins to home
  useEffect(() => {
    if (!isAdmin && userEmail) {
      alert('Access Denied: Only administrators can access this page.')
      navigate('/feed')
    }
  }, [userEmail, isAdmin, navigate])

  // Fetch events from backend database
  useEffect(() => {
    try {
      setLoading(true)
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.events) {
            setEvents(data.events)
            // Also save to localStorage for sync
            localStorage.setItem('allEvents', JSON.stringify(data.events))
          }
        })
        .catch(error => {
          console.error('Error fetching events:', error)
          // Fallback to localStorage if API fails
          const savedEvents = localStorage.getItem('allEvents')
          if (savedEvents) {
            setEvents(JSON.parse(savedEvents))
          }
        })
        .finally(() => setLoading(false))
    } catch (error) {
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }, [])

  // Fetch mentors
  useEffect(() => {
    fetchMentors()
    fetchAllStudents()
  }, [token])

  // Fetch all mentors from backend
  const fetchMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/mentors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMentors(data.mentors || [])
      }
    } catch (err) {
      console.error('Error fetching mentors:', err)
    }
  }

  // Fetch all students (4th year candidates for mentors)
  const fetchAllStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/all-students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Filter 4th year students and exclude those already mentors
        const fourthYearStudents = (data.students || []).filter(s => s.year === 4)
        console.log('Fourth year students:', fourthYearStudents)
        setAllStudents(fourthYearStudents)
      } else {
        console.error('Error response:', data)
        setAllStudents([])
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setAllStudents([])
    }
  }

  // Add a mentor
  const handleAddMentor = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/mentors/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Mentor added successfully!')
        fetchMentors()
        fetchAllStudents()
      } else {
        alert(data.message || 'Failed to add mentor')
      }
    } catch (err) {
      console.error('Error adding mentor:', err)
      alert('Error adding mentor')
    }
  }

  // Remove a mentor
  const handleRemoveMentor = async (userId) => {
    if (window.confirm('Are you sure you want to remove this mentor?')) {
      try {
        const response = await fetch(`${API_URL}/mentors/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        })

        const data = await response.json()

        if (response.ok) {
          alert('Mentor removed successfully!')
          fetchMentors()
          fetchAllStudents()
        } else {
          alert(data.message || 'Failed to remove mentor')
        }
      } catch (err) {
        console.error('Error removing mentor:', err)
        alert('Error removing mentor')
      }
    }
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEventForm({
      ...eventForm,
      [name]: value
    })
  }

  // Handle event image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setIsUploading(true)
        
        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file)
        setEventForm({
          ...eventForm,
          eventImage: file,
          eventImagePreview: previewUrl
        })
        
        alert('Event poster uploaded successfully!')
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image')
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Remove event image
  const removeEventImage = () => {
    setEventForm({
      ...eventForm,
      eventImage: null,
      eventImagePreview: ''
    })
  }

  // Handle create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault()

    // Validate form - Only title, startDate, endDate, and category are required
    if (!eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.category) {
      alert('Please fill in all required fields: Title, Start Date, End Date, and Category!')
      return
    }

    try {
      setIsUploading(true)
      
      let imageUrl = ''

      // Upload image to Cloudinary if selected
      if (eventForm.eventImage) {
        const formData = new FormData()
        formData.append('image', eventForm.eventImage)

        try {
          const uploadResponse = await fetch('/api/upload/post', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            imageUrl = uploadData.imageUrl
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          alert('Failed to upload event image, but event will be created without image')
        }
      }
      
      // Create event object
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        location: eventForm.location,
        category: eventForm.category,
        eventUrl: eventForm.eventUrl,
        eventImage: imageUrl, // Use Cloudinary URL instead of preview
        createdBy: userEmail
      }

      // Send event to backend
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (data.success) {
        // Add to events list
        const updatedEvents = [data.event, ...events]
        setEvents(updatedEvents)
        localStorage.setItem('allEvents', JSON.stringify(updatedEvents))

        // Reset form
        setEventForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          category: '',
          eventUrl: '',
          eventImage: null,
          eventImagePreview: ''
        })
        setShowCreateForm(false)

        alert('Event created successfully!')
      } else {
        alert('Failed to create event: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle edit event
  const handleEditEvent = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEventForm({
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        category: event.category,
        eventUrl: event.eventUrl || '',
        eventImage: null,
        eventImagePreview: event.eventImage || ''
      })
      setEditingEventId(eventId)
      setShowEditForm(true)
    }
  }

  // Handle update event
  const handleUpdateEvent = async (e) => {
    e.preventDefault()

    if (!eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.category) {
      alert('Please fill in all required fields!')
      return
    }

    try {
      setIsUploading(true)

      let imageUrl = ''

      // Upload new image to Cloudinary if selected
      if (eventForm.eventImage && eventForm.eventImagePreview && eventForm.eventImagePreview.startsWith('blob:')) {
        const formData = new FormData()
        formData.append('image', eventForm.eventImage)

        try {
          const uploadResponse = await fetch('/api/upload/post', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            imageUrl = uploadData.imageUrl
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          alert('Failed to upload new image, keeping existing image')
        }
      } else if (!eventForm.eventImage) {
        // Keep existing image if no new image selected
        const existingEvent = events.find(e => e.id === editingEventId)
        imageUrl = existingEvent ? existingEvent.eventImage : ''
      }

      // Prepare event data for update
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        location: eventForm.location,
        category: eventForm.category,
        eventUrl: eventForm.eventUrl,
        eventImage: imageUrl || '' // Use Cloudinary URL or keep existing
      }

      // Send update request to backend
      const response = await fetch(`/api/events/${editingEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (data.success) {
        // Update events list
        const updatedEvents = events.map(event => 
          event.id === editingEventId ? data.event : event
        )
        setEvents(updatedEvents)
        localStorage.setItem('allEvents', JSON.stringify(updatedEvents))

        // Reset form
        setEventForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          category: '',
          eventUrl: '',
          eventImage: null,
          eventImagePreview: ''
        })
        setShowEditForm(false)
        setEditingEventId(null)

        alert('Event updated successfully!')
      } else {
        alert('Failed to update event: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        // Send delete request to backend
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        // Check if response is HTML (error page) instead of JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response:', response.status)
          alert('Error: Backend server is not responding properly. Please try again later.')
          return
        }

        const data = await response.json()

        if (data.success) {
          const updatedEvents = events.filter(event => event.id !== eventId)
          setEvents(updatedEvents)
          localStorage.setItem('allEvents', JSON.stringify(updatedEvents))
          alert('Event deleted successfully!')
        } else {
          alert('Failed to delete event: ' + (data.message || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Backend server may be down. Error: ' + error.message)
      }
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar - Responsive */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center gap-2 sm:gap-3">
          {/* Logo */}
          <h1 className="text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0 whitespace-nowrap">Campus Connect - Admin</h1>

          {/* Search bar */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <SearchBar />
          </div>

          {/* Navigation links and logout button */}
          <div className="flex items-center gap-0 flex-shrink-0 overflow-x-auto">
            <a href="/feed" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              🏠 Home
            </a>
            <a href="/admin-dashboard" className="text-gray-700 hover:text-blue-600 font-semibold px-2 py-1 border-b-2 border-blue-600 text-xs whitespace-nowrap">
              🎯 Admin
            </a>
            <a href="/mentors" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              🎓 Mentors
            </a>
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-300">
              <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-semibold text-xs whitespace-nowrap ml-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Loading spinner */}
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation - Responsive */}
          <div className="flex gap-2 sm:gap-4 mb-8 border-b border-gray-300 overflow-x-auto">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-3 sm:px-4 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📅 Events Management
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`py-2 px-3 sm:px-4 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'mentors'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎓 Mentor Management
            </button>
          </div>

          {/* Events Management Section */}
          {activeTab === 'events' && (
            <>
          {/* Header section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Events Management Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage all campus events and activities</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(true)
                  setShowEditForm(false)
                  setEventForm({
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    location: '',
                    category: '',
                    eventUrl: '',
                    eventImage: null,
                    eventImagePreview: ''
                  })
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                ➕ Create New Event
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-blue-600">{events.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Categories</p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(events.map(e => e.category)).size}
                </p>
              </div>
            </div>
          </div>

          {/* Create/Edit Event Form */}
          {(showCreateForm || showEditForm) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {showEditForm ? '✏️ Edit Event' : '➕ Create New Event'}
              </h2>
              
              <form onSubmit={showEditForm ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Tech Workshop 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleInputChange}
                    placeholder="Describe the event details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  ></textarea>
                </div>

                {/* Start Date and End Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="text"
                      name="startDate"
                      value={eventForm.startDate}
                      onChange={handleInputChange}
                      placeholder="e.g., March 20, 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                    <input
                      type="text"
                      name="endDate"
                      value={eventForm.endDate}
                      onChange={handleInputChange}
                      placeholder="e.g., March 20, 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Location (Optional) and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      name="location"
                      value={eventForm.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Seminar Hall A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      name="category"
                      value={eventForm.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Competition">Competition</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Tech Talk">Tech Talk</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Event URL (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event URL (Optional)</label>
                  <input
                    type="url"
                    name="eventUrl"
                    value={eventForm.eventUrl}
                    onChange={handleInputChange}
                    placeholder="e.g., https://example.com/event"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional link to event details or registration page</p>
                </div>

                {/* Event Image/Poster Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Poster/Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload an attractive poster for your event</p>

                  {/* Event Image Preview */}
                  {eventForm.eventImagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={eventForm.eventImagePreview}
                        alt="Event Poster Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeEventImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Form buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    {showEditForm ? '💾 Update Event' : '✅ Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setShowEditForm(false)
                      setEditingEventId(null)
                      setEventForm({
                        title: '',
                        description: '',
                        startDate: '',
                        endDate: '',
                        location: '',
                        category: '',
                        eventUrl: '',
                        eventImage: null,
                        eventImagePreview: ''
                      })
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">All Events ({events.length})</h2>
            </div>

            {events.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="text-lg">No events yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dates</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Poster</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Registrations</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.description?.substring(0, 50)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <p>{event.startDate}</p>
                          <p className="text-gray-500">to {event.endDate}</p>
                        </td>
                        <td className="px-6 py-4">
                          {event.eventImage ? (
                            <img
                              src={event.eventImage}
                              alt={event.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{event.registrations || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}

          {/* Mentors Management Section */}
          {activeTab === 'mentors' && (
            <>
              {/* Header section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mentor Management Dashboard</h1>
                    <p className="text-gray-600 mt-2">Add or remove mentors from the platform</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Total Mentors</p>
                    <p className="text-3xl font-bold text-blue-600">{mentors.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Available 4th Year Students</p>
                    <p className="text-3xl font-bold text-purple-600">{allStudents.length - mentors.length}</p>
                  </div>
                </div>
              </div>

              {/* Current Mentors */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Mentors ({mentors.length})</h2>
                
                {mentors.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No mentors added yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentors.map(mentor => (
                      <div key={mentor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
                            <p className="text-sm text-gray-600">{mentor.registerNumber}</p>
                            <p className="text-sm text-gray-600">{mentor.department}</p>
                          </div>
                          {mentor.profileImage ? (
                            <img
                              src={mentor.profileImage}
                              alt={mentor.name}
                              className="w-12 h-12 rounded-full object-cover ml-2"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center ml-2 font-bold text-lg">
                              {mentor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMentor(mentor._id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          Remove Mentor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Mentors */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Mentors</h2>
                
                {/* Search field */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search students by name or register number..."
                    value={mentorSearch}
                    onChange={(e) => setMentorSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Available Students for Mentor */}
                {allStudents.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No 4th year students available to add as mentors</p>
                ) : (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allStudents
                      .filter(student => {
                        // Exclude students already added as mentors
                        const alreadyMentor = mentors.some(m => m._id === student._id);
                        if (alreadyMentor) return false;
                        
                        // Filter by search term
                        const searchLower = mentorSearch.toLowerCase();
                        const nameMatch = (student.name || '').toLowerCase().includes(searchLower);
                        const regMatch = (student.registerNumber || '').toLowerCase().includes(searchLower);
                        
                        return searchLower === '' || nameMatch || regMatch;
                      })
                      .map(student => (
                        <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                              <p className="text-sm text-gray-600">{student.registerNumber}</p>
                              <p className="text-sm text-gray-600">{student.department}</p>
                            </div>
                            {student.profileImage ? (
                              <img
                                src={student.profileImage}
                                alt={student.name}
                                className="w-12 h-12 rounded-full object-cover ml-2"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center ml-2 font-bold text-lg">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddMentor(student._id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                          >
                            Add as Mentor
                          </button>
                        </div>
                      ))}
                    {allStudents.filter(student => {
                      const alreadyMentor = mentors.some(m => m._id === student._id);
                      if (alreadyMentor) return false;
                      const searchLower = mentorSearch.toLowerCase();
                      const nameMatch = (student.name || '').toLowerCase().includes(searchLower);
                      const regMatch = (student.registerNumber || '').toLowerCase().includes(searchLower);
                      return searchLower === '' || nameMatch || regMatch;
                    }).length === 0 && mentorSearch !== '' && (
                      <div className="col-span-full text-center py-8 text-gray-600">
                        No students found matching "{mentorSearch}"
                      </div>
                    )}
                  </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
