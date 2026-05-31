// Import useState for managing search input state
import { useState } from 'react'
// Import useNavigate to redirect to search results page
import { useNavigate } from 'react-router-dom'

function SearchBar() {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()
  
  // State to store the search query that user types
  const [searchQuery, setSearchQuery] = useState('')

  // Function to handle search form submission
  const handleSearch = (e) => {
    // Prevent page from reloading
    e.preventDefault()
    
    // Check if search query is not empty
    if (searchQuery.trim() === '') {
      alert('Please enter a search query')
      return
    }

    // Navigate to search page with the query parameter
    // e.g., /search?q=react
    navigate(`/search?q=${searchQuery}`)
    
    // Clear the search input after searching
    setSearchQuery('')
  }

  return (
    // Search form container
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      {/* Search input field */}
      <input
        type="text"
        placeholder="🔍 Search students, posts, events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
      />
      
      {/* Search button */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar
