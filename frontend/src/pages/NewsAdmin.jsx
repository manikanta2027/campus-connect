import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config/api'
import apiFetch from '../utils/apiFetch'

function NewsAdmin({ token, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNewsId, setEditingNewsId] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Announcement',
    deleteAfterDays: 7,
    newsImage: null,
    newsImagePreview: null
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  // Admin emails list
  const adminEmails = [
    'sowrya@gmail.com',
    'admin@campus.local',
    'chitimereddimanikanta2006@gmail.com'
  ]
  const isAdmin = adminEmails.includes(userEmail)

  // Check if user is admin on component mount
  useEffect(() => {
    if (!isAdmin) {
      alert('Only admins can access this page!')
      navigate('/')
      return
    }

    fetchNews()

    // If coming from CampusNews to edit
    if (location.state?.editNewsId) {
      setEditingNewsId(location.state.editNewsId)
      // Load the news item for editing
      loadNewsForEdit(location.state.editNewsId)
    }
  }, [])

  // Load news item for editing
  const loadNewsForEdit = async (newsId) => {
    try {
      const response = await axios.get(`${API_URL}/news/${newsId}`)
      if (response.data.success) {
        const newsItem = response.data.news
        setFormData({
          title: newsItem.title,
          description: newsItem.description,
          category: newsItem.category,
          deleteAfterDays: newsItem.deleteAfterDays || 7,
          newsImage: null,
          newsImagePreview: newsItem.newsImage
        })
      }
    } catch (error) {
      console.error('Error loading news for edit:', error.response?.data || error.message)
      setError('Failed to load news for editing')
    }
  }

  // Fetch all news created by this admin
  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_URL}/news/admin/${userEmail}`)
      if (response.data.success) {
        setNews(response.data.news)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          newsImage: file,
          newsImagePreview: reader.result
        })
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  // Upload image to Cloudinary via backend
  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const uploadResponse = await apiFetch('/upload/post', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const uploadData = await uploadResponse.json()

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Upload failed')
      }

      return uploadData.imageUrl
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error('Failed to upload image')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    try {
      let imageUrl = null
      
      // Upload image if selected
      if (formData.newsImage) {
        imageUrl = await uploadImage(formData.newsImage)
      }

      const newsData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        deleteAfterDays: parseInt(formData.deleteAfterDays) || 7,
        newsImage: imageUrl || (editingNewsId ? news.find(n => n._id === editingNewsId)?.newsImage : null),
        createdBy: userEmail
      }

      if (editingNewsId) {
        // Update existing news
        const response = await axios.put(
          `${API_URL}/news/${editingNewsId}`,
          newsData
        )
        if (response.data.success) {
          setSuccess('News updated successfully!')
          setEditingNewsId(null)
          setFormData({
            title: '',
            description: '',
            category: 'Announcement',
            deleteAfterDays: 7,
            newsImage: null,
            newsImagePreview: null
          })
          fetchNews()
        }
      } else {
        // Create new news
        const response = await axios.post(`${API_URL}/news`, newsData)
        if (response.data.success) {
          setSuccess('News created successfully!')
          setFormData({
            title: '',
            description: '',
            category: 'Announcement',
            deleteAfterDays: 7,
            newsImage: null,
            newsImagePreview: null
          })
          fetchNews()
          
          // Auto-redirect to home after 2 seconds
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save news')
    }
  }

  // Handle delete
  const handleDelete = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return

    try {
      const response = await axios.delete(`${API_URL}/news/${newsId}`)
      if (response.data.success) {
        setSuccess('News deleted successfully!')
        setEditingNewsId(null)
        setFormData({
          title: '',
          description: '',
          category: 'Announcement',
          deleteAfterDays: 7,
          newsImage: null,
          newsImagePreview: null
        })
        fetchNews()
      }
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message)
      setError(error.response?.data?.message || 'Failed to delete news')
    }
  }

  // Handle edit
  const handleEdit = (newsItem) => {
    setEditingNewsId(newsItem._id)
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      category: newsItem.category,
      deleteAfterDays: newsItem.deleteAfterDays || 7,
      newsImage: null,
      newsImagePreview: newsItem.newsImage
    })
  }

  if (!isAdmin) {
    return <div className="text-center py-10">Access Denied</div>
  }

  if (loading) {
    return <div className="text-center py-10 text-sm sm:text-base">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📰 Campus News Admin</h1>
          <button
            onClick={() => navigate('/')}
            className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-xs sm:text-base whitespace-nowrap"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Form Section - Responsive */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                {editingNewsId ? 'Edit News' : 'Post New News'}
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-xs sm:text-base">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-xs sm:text-base">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter news title"
                    className="w-full px-3 py-2 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter news description"
                    rows="4"
                    className="w-full px-3 py-2 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Academic</option>
                    <option>Placement</option>
                    <option>Sports</option>
                    <option>Cultural</option>
                    <option>Infrastructure</option>
                    <option>Announcement</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Auto-Delete Duration */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Auto-Delete After (days)
                  </label>
                  <input
                    type="number"
                    name="deleteAfterDays"
                    value={formData.deleteAfterDays}
                    onChange={handleChange}
                    min="1"
                    max="365"
                    placeholder="7"
                    className="w-full px-3 py-2 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    News will automatically be deleted after this many days (default: 7 days)
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    News Image (Thumbnail)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.newsImagePreview && (
                    <img
                      src={formData.newsImagePreview}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {editingNewsId ? 'Update News' : 'Post News'}
                  </button>
                  {editingNewsId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNewsId(null)
                        setFormData({
                          id: '',
                          title: '',
                          description: '',
                          category: 'Announcement',
                          newsImage: null,
                          newsImagePreview: null
                        })
                      }}
                      className="px-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* News List Section */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Your News Posts ({news.length})</h2>

              {news.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No news posted yet. Create your first news post!</p>
                </div>
              ) : (
                news.map((newsItem) => (
                  <div key={newsItem._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {newsItem.newsImage && (
                        <img
                          src={newsItem.newsImage}
                          alt={newsItem.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{newsItem.title}</h3>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                              {newsItem.category}
                            </span>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{newsItem.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              Posted: {new Date(newsItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(newsItem)}
                              className="text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(newsItem._id)}
                              className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-50"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsAdmin
