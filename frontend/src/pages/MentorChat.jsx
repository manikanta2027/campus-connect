import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function MentorChat({ token, onLogout }) {
  // Router hooks
  const navigate = useNavigate()
  const { conversationId } = useParams()

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
  const userName = currentUser?.userName;

  // State management
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Ref for auto-scrolling to newest message
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversation and messages on load
  useEffect(() => {
    if (!conversationId) {
      setError('No conversation selected')
      return
    }
    
    console.log('🔍 Loading conversation:', conversationId)
    fetchConversationAndMessages()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [conversationId, token])

  // Fetch conversation details and initial messages
  const fetchConversationAndMessages = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('📥 Fetching messages for conversation:', conversationId)
      
      const response = await fetch(
        `http://localhost:8000/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to load conversation (Status: ${response.status})`)
      }

      console.log('✅ Messages loaded:', data.messages?.length || 0)
      setMessages(data.messages || [])
    } catch (err) {
      setError(err.message)
      console.error('❌ Error fetching conversation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch only messages (for polling)
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (response.ok && data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('❌ Polling error:', err)
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return

    try {
      setError('')
      
      const response = await fetch(`http://localhost:8000/api/messages/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete message')
      }

      console.log('✅ Message deleted')
      setMessages(messages.filter(msg => msg._id !== messageId))
    } catch (err) {
      setError(err.message)
      console.error('❌ Error deleting message:', err)
    }
  }

  // Edit message
  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) {
      setError('Message cannot be empty')
      return
    }

    try {
      setError('')
      
      const response = await fetch(`http://localhost:8000/api/messages/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editingText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to edit message')
      }

      console.log('✅ Message edited')
      setMessages(messages.map(msg => msg._id === messageId ? data.message : msg))
      setEditingId(null)
      setEditingText('')
    } catch (err) {
      setError(err.message)
      console.error('❌ Error editing message:', err)
    }
  }

  // Start editing message
  const startEdit = (message) => {
    setEditingId(message._id)
    setEditingText(message.content)
  }

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageInput.trim()) {
      return
    }

    try {
      setSending(true)
      setError('')

      console.log('📤 Sending message...')
      
      const response = await fetch('http://localhost:8000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: conversationId,
          content: messageInput,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to send message (Status: ${response.status})`)
      }

      console.log('✅ Message sent')
      
      // Add new message to list immediately
      setMessages([...messages, data.message])
      setMessageInput('')
      
      // Fetch latest to ensure we have all messages
      setTimeout(() => {
        fetchConversationAndMessages()
      }, 500)
    } catch (err) {
      setError(err.message)
      console.error('❌ Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-4 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full h-[500px] sm:h-[600px] flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header - Responsive */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 sm:p-4">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/feed')}
                className="text-white hover:text-gray-200 text-xl sm:text-2xl"
              >
                ←
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Chat</h1>
                <p className="text-indigo-100 text-xs sm:text-sm truncate">💬 Real-time messaging</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/conversations')}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-2 sm:px-4 py-2 rounded font-semibold transition text-xs sm:text-base whitespace-nowrap flex-shrink-0"
            >
              All Chats
            </button>
          </div>
        </div>

        {/* Messages Area - Responsive */}
        <div className="flex-1 bg-white overflow-y-auto p-3 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-base">
              ❌ {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600 text-xs sm:text-base">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-base sm:text-lg">No messages yet</p>
                <p className="text-xs sm:text-sm">Start the conversation below!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.senderId === userId
              const isEditing = editingId === msg._id
              
              return (
                <div
                  key={idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-base ${
                      isOwn
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-2 py-1 rounded text-gray-800 text-xs sm:text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditMessage(msg._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditingText('')
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="break-words">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-600'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {msg.editedAt && (
                            <p className={`text-xs italic ${isOwn ? 'text-indigo-100' : 'text-gray-600'}`}>
                              (edited)
                            </p>
                          )}
                        </div>
                        
                        {/* Edit/Delete Buttons - Show on hover for own messages */}
                        {isOwn && (
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(msg)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                              title="Edit message"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                              title="Delete message"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MentorChat
