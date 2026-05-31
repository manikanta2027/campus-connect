import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CampusNews({ token, onLogout }) {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNewsImage, setSelectedNewsImage] = useState(null)

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
  const userEmail = currentUser?.userEmail
  const adminEmails = [
    'sowrya@gmail.com',
    'admin@campus.local',
    'chitimereddimanikanta2006@gmail.com'
  ]
  const isAdmin = adminEmails.includes(userEmail)

  const categories = [
    'All',
    'Academic',
    'Placement',
    'Sports',
    'Cultural',
    'Infrastructure',
    'Announcement',
    'Other'
  ]

  // Fetch all news on component mount
  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/news')
      if (response.data.success) {
        console.log('News fetched:', response.data.news);
        // Check if news items have _id
        if (response.data.news.length > 0) {
          const firstNews = response.data.news[0];
          console.log('First news item keys:', Object.keys(firstNews));
          console.log('First news item _id:', firstNews._id);
        }
        setNews(response.data.news)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete news
  const handleDeleteNews = async (newsId) => {
    console.log('Delete button clicked, newsId:', newsId);
    
    if (!newsId) {
      alert('Error: News ID is missing. Please try refreshing the page.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this news?')) return

    try {
      console.log('Attempting to delete news with ID:', newsId);
      const response = await axios.delete(`/api/news/${newsId}`)
      console.log('Delete response:', response.data);
      if (response.data.success) {
        // Refresh news list
        fetchNews()
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to delete news')
    }
  }

  // Handle edit news
  const handleEditNews = (newsId) => {
    navigate('/news-admin', { state: { editNewsId: newsId } })
  }

  // Filter news based on category and search
  const filteredNews = news.filter((item) => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory
    const searchMatch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">📰 Campus News</h1>
              <p className="text-lg opacity-90">Stay updated with the latest news and announcements</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mb-4">
            Showing {filteredNews.length} {selectedCategory === 'All' ? 'news' : `"${selectedCategory}"` + ' news'}
          </p>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No news found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((newsItem) => (
              <div
                key={newsItem._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                {/* Image */}
                {newsItem.newsImage && (
                  <div className="relative overflow-hidden bg-gray-200 h-48">
                    <img
                      src={newsItem.newsImage}
                      alt={newsItem.title}
                      onClick={() => setSelectedNewsImage(newsItem.newsImage)}
                      className="w-full h-full object-cover group-hover:scale-110 transition cursor-pointer"
                    />
                    <div
                      onClick={() => setSelectedNewsImage(newsItem.newsImage)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-white text-3xl">🔍</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge + Admin Actions */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {newsItem.category}
                    </span>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNews(newsItem._id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNews(newsItem._id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {newsItem.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {newsItem.description}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                    <span>{new Date(newsItem.createdAt).toLocaleDateString()}</span>
                    <span>By Admin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedNewsImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNewsImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNewsImage(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition font-bold text-xl z-10"
            >
              ✕
            </button>
            <img
              src={selectedNewsImage}
              alt="News"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-center text-white mt-4 text-sm">
              Click background or press ✕ to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusNews
