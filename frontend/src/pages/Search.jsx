// Import useState and useEffect hooks for state management
import { useState, useEffect } from 'react'
// Import useNavigate and useSearchParams to handle routing and URL params
import { useNavigate, useSearchParams } from 'react-router-dom'
// Import SearchBar component for search functionality
import SearchBar from '../components/SearchBar'

function Search({ token, onLogout }) {
  // useNavigate hook to navigate between pages
  const navigate = useNavigate()
  // useSearchParams to get the search query from URL
  const [searchParams] = useSearchParams()
  
  // Get the search query from URL (e.g., ?q=react)
  const searchQuery = searchParams.get('q') || ''

  // State to store filtered students
  const [students, setStudents] = useState([])
  // State to store filtered posts
  const [posts, setPosts] = useState([])
  // State to store filtered events
  const [events, setEvents] = useState([])
  // State for loading spinner
  const [loading, setLoading] = useState(true)
  // State for active tab (students only)
  const [activeTab, setActiveTab] = useState('students')

  // Sample events data for local search
  const allEvents = [
    {
      id: 1,
      title: 'React Workshop',
      category: 'Workshop',
      date: 'March 20, 2024'
    },
    {
      id: 2,
      title: 'Machine Learning Seminar',
      category: 'Seminar',
      date: 'March 22, 2024'
    },
    {
      id: 3,
      title: 'Web Development Competition',
      category: 'Competition',
      date: 'March 30, 2024'
    }
  ]

  // ✅ OPTIMIZED: Search students using backend API (skills, name, email, department)
  const searchStudents = async (query) => {
    try {
      // Get API URL from environment or use default
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // Extract email from token (JWT payload is base64 encoded)
      let userEmail = null;
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            userEmail = payload.email;
          }
        } catch (e) {
          console.log('Could not decode token for email');
        }
      }

      // Use the new backend search endpoint with smart scoring
      const response = await fetch(`${apiUrl}/api/auth/search/query/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(userEmail && { 'x-user-email': userEmail }) // Pass searcher's email for dept matching
        }
      })

      if (!response.ok) {
        console.error('Failed to search students')
        return []
      }

      const data = await response.json()
      console.log(`✅ Found ${data.count || 0} of ${data.totalMatched || 0} top students matching: "${query}"`)
      return data.users || []
    } catch (error) {
      console.error('Error searching students:', error)
      return []
    }
  }

  // Function to search posts by content, author name, OR tags (using backend API)
  const searchPosts = async (query) => {
    try {
      // First try: Search by tag using the new backend endpoint
      console.log(`🔍 Searching posts by tag: ${query}`)
      const tagResponse = await fetch(
        `http://localhost:8000/api/posts/search/tag/${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )

      // If tag search succeeds, return tag search results
      if (tagResponse.ok) {
        const tagData = await tagResponse.json()
        console.log(`✅ Found ${tagData.posts?.length || 0} posts with tag "${query}"`)
        return tagData.posts || []
      }

      // Fallback: If no tag results, fetch all posts and filter by content/author
      console.log(`📝 No tag match. Searching by content...`)
      const allPostsResponse = await fetch('http://localhost:8000/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!allPostsResponse.ok) {
        console.error('Failed to fetch posts')
        return []
      }

      const allPostsData = await allPostsResponse.json()
      const lowerQuery = query.toLowerCase()

      // Filter posts by content or author name
      const filtered = allPostsData.posts?.filter(post => {
        return (
          post.content?.toLowerCase().includes(lowerQuery) ||
          post.authorName?.toLowerCase().includes(lowerQuery)
        )
      }) || []

      console.log(`✅ Found ${filtered.length} posts by content/author search`)
      return filtered
    } catch (error) {
      console.error('Error searching posts:', error)
      return []
    }
  }

  // Function to search events by title or category
  const searchEvents = (query) => {
    // Convert query to lowercase for case-insensitive search
    const lowerQuery = query.toLowerCase()
    
    // Filter events that match the search query
    return allEvents.filter(event => {
      // Check if query matches event title or category
      return (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.category.toLowerCase().includes(lowerQuery)
      )
    })
  }

  // Function to check if query is a valid register number (e.g., 23B91A6129)
  const isRegisterNumber = (query) => {
    // Register number format: 2 digits + 1 letter + 2 digits + 1 letter + 4 digits (case-insensitive)
    const registerNumberRegex = /^[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{4}$/i
    return registerNumberRegex.test(query.trim())
  }

  // Function to search for user by register number
  const searchUserByRegisterNumber = async (registerNumber) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/user-by-register/${registerNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        return false
      }

      const data = await response.json()

      if (response.ok && data.user) {
        // User found, navigate to their profile
        navigate(`/profile?userEmail=${encodeURIComponent(data.user.email)}`)
        return true
      }
      return false
    } catch (error) {
      console.error('Error searching by register number:', error)
      return false
    }
  }

  // Hook to search when component loads or search query changes
  useEffect(() => {
    // Show loading spinner while searching
    setLoading(true)

    // Create async function to handle both sync and async searches
    const performSearch = async () => {
      // Check if the search query is a register number
      if (isRegisterNumber(searchQuery)) {
        // Try to search by register number
        const found = await searchUserByRegisterNumber(searchQuery.toUpperCase())
        if (found) {
          // If user found, the navigate will handle the redirect
          setLoading(false)
        } else {
          // If not found by register number, show no results
          setStudents([])
          setPosts([])
          setEvents([])
          setLoading(false)
        }
      } else {
        // Perform normal search on all categories
        // ✅ OPTIMIZED: Now using async searchStudents with backend API
        const studentResults = await searchStudents(searchQuery)
        const eventResults = searchEvents(searchQuery)
        const postResults = await searchPosts(searchQuery)

        // Update state with search results
        setStudents(studentResults)
        setPosts(postResults)
        setEvents(eventResults)

        // Hide loading spinner after search completes
        setLoading(false)
      }
    }

    // Call the async search function
    performSearch()
  }, [searchQuery, token, navigate])

  // Function to handle logout
  const handleLogout = () => {
    // Call parent function to update login state
    onLogout()
    // Redirect to login page
    navigate('/login')
  }

  // Function to navigate to student profile
  const viewStudentProfile = (studentEmail) => {
    // Navigate to profile page with userEmail parameter
    navigate(`/profile?userEmail=${encodeURIComponent(studentEmail)}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center gap-3">
          {/* Logo */}
          <h1 className="text-xl font-bold text-blue-600 flex-shrink-0">Campus Connect</h1>

          {/* Search bar */}
          <div className="flex-1 max-w-xs">
            <SearchBar />
          </div>

          {/* Navigation links and logout button */}
          <div className="flex items-center gap-0 flex-shrink-0">
            {/* Link to home */}
            <a href="/feed" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              🏠 Home
            </a>
            {/* Link to profile */}
            <a href="/profile" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              👤 Profile
            </a>
            {/* Link to events */}
            <a href="/hackathons" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              📅 Events
            </a>
            {/* Link to mentors */}
            <a href="/mentors" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              🎓 Mentors
            </a>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-semibold text-xs whitespace-nowrap ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main search results content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search header showing the query */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Search Results for "<span className="text-blue-600">{searchQuery}</span>"
          </h1>
          <p className="text-gray-600">
            Found {students.length} results
          </p>
        </div>



        {/* Loading spinner */}
        {loading ? (
          <div className="flex justify-center items-center min-h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {/* Show only "Students" results */}
            {students.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 Students ({students.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map(student => (
                    <div key={student.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition border-l-4 border-blue-500">
                      {/* Relevance Score Badge */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                        <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          {student.score}% Match
                        </div>
                      </div>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {/* Posted About Skill Badge */}
                        {student.hasPostedAboutSkill && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
                            ⭐ Posted about this
                          </span>
                        )}
                        
                        {/* Post Engagement Badge */}
                        {student.postEngagement > 0 && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">
                            ❤️ {student.postEngagement} likes
                          </span>
                        )}
                        
                        {/* Skill Versatility Badge */}
                        {student.skillCount >= 3 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                            🎯 {student.skillCount} skills
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">📧 {student.email}</p>
                      <p className="text-sm text-gray-600 mb-1">🏫 {student.department} - Year {student.year}</p>
                      {student.bio && (
                        <p className="text-sm text-gray-700 mb-2 italic">"{student.bio}"</p>
                      )}
                      <p className="text-sm mb-3">
                        <span className="font-semibold text-gray-700">Skills: </span>
                        {student.skills && student.skills.length > 0 ? student.skills.join(', ') : 'No skills listed'}
                      </p>
                      <button
                        onClick={() => viewStudentProfile(student.email)}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm font-semibold"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  😔 No students found for "<span className="font-semibold">{searchQuery}</span>"
                </p>
                <p className="text-gray-500 mb-6">Try searching with different keywords</p>
                <a href="/feed" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Back to Feed
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
