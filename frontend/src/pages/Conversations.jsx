import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../config/api'

function Conversations({ token, onLogout }) {
  // Router hook
  const navigate = useNavigate()

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
  const userId = currentUser?.userId;

  // State management
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch conversations on component load
  useEffect(() => {
    fetchConversations()
    // Optionally set up polling for new messages
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch user's conversations
  const fetchConversations = async () => {
    try {
      setError('')

      const response = await fetch(`${API_URL}/messages/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversations')
      }

      setConversations(data.conversations || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Open conversation chat
  const handleOpenChat = (conversationId) => {
    navigate(`/mentor-chat/${conversationId}`)
  }

  // Close/delete conversation
  const handleCloseConversation = async (conversationId, e) => {
    e.stopPropagation()

    const confirmDelete = window.confirm(
      'Are you sure you want to close this conversation? You can always start a new one later.'
    )
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/messages/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to close conversation')
      }

      // Remove from list
      setConversations(conversations.filter(c => c._id !== conversationId))
    } catch (err) {
      alert('Error closing conversation: ' + err.message)
      console.error('Error closing conversation:', err)
    }
  }

  // Get other user info
  const getOtherUser = (conversation) => {
    return conversation.mentorId._id === userId ? conversation.studentId : conversation.mentorId
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">My Mentorship Chats</h1>
            <button
              onClick={() => navigate('/mentors')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
            >
              Find Mentors
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Connect with your mentors and ask for guidance
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading conversations...</p>
          </div>
        )}

        {/* Conversations List */}
        {!loading && conversations.length > 0 && (
          <div className="space-y-4">
            {conversations.map(conversation => {
              const otherUser = getOtherUser(conversation)
              const isMentor = conversation.mentorId._id === userId

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleOpenChat(conversation._id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg p-3 sm:p-4 cursor-pointer transition hover:bg-indigo-50"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{otherUser.name}</h3>
                        <span className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${
                          isMentor
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isMentor ? 'Student' : 'Mentor'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm truncate">{otherUser.email}</p>
                    </div>
                    <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>

                  {/* Last Message Preview */}
                  {conversation.lastMessage && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenChat(conversation._id)
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition text-sm font-semibold"
                    >
                      Open Chat
                    </button>
                    <button
                      onClick={e => handleCloseConversation(conversation._id, e)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded transition text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No conversations */}
        {!loading && conversations.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No conversations yet</h2>
            <p className="text-gray-600 mb-6">
              Start connecting with mentors to get guidance and support for your college journey.
            </p>
            <button
              onClick={() => navigate('/mentors')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Find Your First Mentor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Conversations
