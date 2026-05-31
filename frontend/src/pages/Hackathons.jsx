// Import useState and useEffect hooks
import { useState, useEffect } from 'react'
// Import useNavigate to redirect
import { useNavigate } from 'react-router-dom'
// Import SearchBar component for global search
import SearchBar from '../components/SearchBar'
// Import API fetch helper
import apiFetch from '../utils/apiFetch'

function Hackathons({ token, onLogout }) {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // State to store list of events
  const [events, setEvents] = useState([])
  // State for loading spinner
  const [loading, setLoading] = useState(true)
  // State to track registered events
  const [registeredEvents, setRegisteredEvents] = useState([])
  // State for lightbox image viewer
  const [selectedImage, setSelectedImage] = useState(null)

  // Fetch events from backend database
  useEffect(() => {
    try {
      setLoading(true)
      // Fetch events from the backend API
      apiFetch('/events')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.events) {
            setEvents(data.events)
            // Also save to localStorage for offline access
            localStorage.setItem('allEvents', JSON.stringify(data.events))
          } else {
            setEvents([])
          }
        })
        .catch(error => {
          console.error('Error fetching events:', error)
          // Fallback to localStorage if API fails
          const savedEvents = localStorage.getItem('allEvents')
          if (savedEvents) {
            setEvents(JSON.parse(savedEvents))
          } else {
            setEvents([])
          }
        })
        .finally(() => setLoading(false))
    } catch (error) {
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }, [token])

  // Function to handle logout
  const handleLogout = () => {
    // Call parent function to update login state
    onLogout()
    // Redirect to login page
    navigate('/login')
  }

  // Function to register/unregister for event
  const handleRegisterEvent = (eventId) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId))
      alert('Unregistered from event!')
    } else {
      setRegisteredEvents([...registeredEvents, eventId])
      alert('Successfully registered for event!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation bar - Responsive */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0">Campus Connect</h1>
          <div className="flex-1 max-w-xs">
            <SearchBar />
          </div>
          <div className="flex items-center gap-0 flex-shrink-0 overflow-x-auto">
            <a href="/feed" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1 text-xs whitespace-nowrap">🏠 Home</a>
            <a href="/profile" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">👤 Profile</a>
            <a href="/hackathons" className="text-blue-600 font-bold px-2 py-1 text-xs whitespace-nowrap border-b-2 border-blue-600">📅 Events</a>
            <a href="/mentors" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">🎓 Mentors</a>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-semibold text-xs transition whitespace-nowrap ml-2">Logout</button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Responsive */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">Discover Extraordinary Events</h2>
          <p className="text-sm sm:text-lg lg:text-xl opacity-90">Join the vibrant campus community and make unforgettable memories</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Loading spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Featured Event Section */}
            {events.length > 0 && (
              <div className="mb-16">
                {(() => {
                  const featuredEvent = events[0];
                  return (
                    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 h-96">
                        {/* Featured Image */}
                        {featuredEvent.eventImage && (
                          <div className="md:col-span-3 relative overflow-hidden cursor-pointer" onClick={() => setSelectedImage(featuredEvent.eventImage)}>
                            <img src={featuredEvent.eventImage} alt={featuredEvent.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-4xl">🔍</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Featured Content */}
                        <div className={`md:col-span-${featuredEvent.eventImage ? '2' : '5'} p-8 flex flex-col justify-between bg-white`}>
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Featured Event</span>
                              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white ${getCategoryBgColor(featuredEvent.category)}`}>
                                {featuredEvent.category}
                              </span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">{featuredEvent.title}</h3>
                            <p className="text-gray-600 text-base line-clamp-3 mb-6">{featuredEvent.description}</p>
                          </div>
                          
                          <div className="space-y-3 border-t pt-6">
                            <div className="flex items-center gap-3 text-gray-700">
                              <span className="text-xl">📅</span>
                              <span className="font-semibold">{featuredEvent.startDate || featuredEvent.date}</span>
                            </div>
                            {featuredEvent.location && (
                              <div className="flex items-center gap-3 text-gray-700">
                                <span className="text-xl">📍</span>
                                <span className="font-semibold">{featuredEvent.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-700">
                              <span className="text-xl">👥</span>
                              <span className="font-semibold">{featuredEvent.registrations} people interested</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Events Grid */}
            {events.length > 1 && (
              <div>
                <h3 className="text-3xl font-bold text-white mb-10">More Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.slice(1).map((event) => (
                    <div key={event.id} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 cursor-pointer" onClick={() => event.eventImage && setSelectedImage(event.eventImage)}>
                        {event.eventImage ? (
                          <img src={event.eventImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">📌</div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          {event.eventImage && <span className="text-white text-3xl">🔍</span>}
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-full text-white ${getCategoryBgColor(event.category)}`}>
                            {event.category}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">{event.title}</h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                        {/* Date and Location Info */}
                        <div className="space-y-2 border-t pt-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="text-lg">📅</span>
                            <span className="font-semibold">{event.startDate || event.date}</span>
                          </div>
                          {event.endDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-lg">→</span>
                              <span>{event.endDate}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-lg">📍</span>
                              <span className="font-semibold truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Attendance */}
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-4">
                          <span className="text-lg">👥</span>
                          <span>{event.registrations} interested</span>
                        </div>

                        {/* Event Registration Link */}
                        {event.eventUrl && (
                          <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                            <span>🔗</span> Register
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {events.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-white mb-3">No Events Yet</h3>
                <p className="text-gray-400 text-lg">Check back soon for exciting campus events!</p>
              </div>
            )}

            {/* Image Lightbox Modal */}
            {selectedImage && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative max-w-4xl w-full"  onClick={(e) => e.stopPropagation()}>
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold transition"
                  >
                    ✕
                  </button>
                  
                  {/* Image */}
                  <img 
                    src={selectedImage} 
                    alt="Event poster" 
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  
                  {/* Click to close hint */}
                  <p className="text-center text-white text-sm mt-4 opacity-75">Click background or press ✕ to close</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Helper function for category background colors
function getCategoryBgColor(category) {
  const colors = {
    'Workshop': 'bg-blue-600',
    'Sports': 'bg-green-600',
    'Tech Talk': 'bg-purple-600',
    'Cultural': 'bg-pink-600',
    'Competition': 'bg-orange-600',
    'Seminar': 'bg-red-600',
    'Other': 'bg-gray-600'
  }
  return colors[category] || colors['Other']
}

export default Hackathons
