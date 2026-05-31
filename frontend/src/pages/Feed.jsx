// Import useState and useEffect hooks
import { useState, useEffect } from 'react'
// Import useNavigate to redirect
import { useNavigate } from 'react-router-dom'
// Import axios to make API requests
import axios from 'axios'
// Import SearchBar component for global search
import SearchBar from '../components/SearchBar'
// Import NotificationBell component for real-time notifications
import NotificationBell from '../components/NotificationBell'
// Import toast for professional notifications
import toast from 'react-hot-toast'
// Import API configuration
import API_URL from '../config/api'
// Import API fetch helper
import apiFetch from '../utils/apiFetch'

function Feed({ token, onLogout }) {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()

  // Decode JWT token to get current user info (more reliable than localStorage which can be overwritten by other tabs)
  const getCurrentUserFromToken = () => {
    try {
      if (!token) return null;
      // JWT format: header.payload.signature - decode the payload
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
  // IMPORTANT: Only use token data, NEVER fallback to localStorage
  // localStorage is shared across all browser tabs and causes conflicts
  const userName = currentUser?.userName
  const userEmail = currentUser?.userEmail
  
  // Debug: Log token and decoded data
  useEffect(() => {
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Decoded user:', currentUser);
    console.log('userName:', userName, 'userEmail:', userEmail);
  }, [token, currentUser, userName, userEmail]);

  // State to store list of posts with interactions
  const [posts, setPosts] = useState([])
  // State for user interactions (likes, comments) - tracks which posts user has liked
  const [userLikes, setUserLikes] = useState({})
  // State for loading spinner
  const [loading, setLoading] = useState(true)
  // Get profile data for left sidebar
  const [profileData, setProfileData] = useState(null)
  // State to store current user's latest profile image
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null)
  // State to cache profile images for all post authors - maps email to profile image URL
  const [authorProfileImages, setAuthorProfileImages] = useState({})
  // State to track which post is showing comments
  const [expandedComments, setExpandedComments] = useState({})
  // State to store comment input for each post
  const [commentInputs, setCommentInputs] = useState({})
  // State to track which post is being edited
  const [editingPostId, setEditingPostId] = useState(null)
  // State to store edited post content
  const [editPostContent, setEditPostContent] = useState('')
  // State to show/hide messages modal
  const [showMessages, setShowMessages] = useState(false)
  // State to store all conversations/messages
  const [conversations, setConversations] = useState([])
  // State for loading messages
  const [loadingMessages, setLoadingMessages] = useState(false)
  // State to toggle mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // State to track selected post for detail view
  const [selectedPost, setSelectedPost] = useState(null)
  // State to show/hide post detail modal
  const [showPostDetail, setShowPostDetail] = useState(false)

  // Admin emails list - Check if user is admin
  const adminEmails = [
    'sowrya@gmail.com',
    'admin@campus.local',
    'chitimereddimanikanta2006@gmail.com'
  ]
  const isAdmin = adminEmails.includes(userEmail)

  // Function to convert ISO timestamp or relative time to simple format
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'just now'
    
    // If it's already in simple format, return it
    if (typeof timestamp === 'string' && (timestamp.includes('ago') || timestamp === 'just now')) {
      return timestamp
    }
    
    // Convert ISO timestamp to relative time
    const date = new Date(timestamp)
    const now = new Date()
    const secondsAgo = Math.floor((now - date) / 1000)
    
    if (secondsAgo < 60) return 'just now'
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minute${Math.floor(secondsAgo / 60) > 1 ? 's' : ''} ago`
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) > 1 ? 's' : ''} ago`
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) > 1 ? 's' : ''} ago`
    return `${Math.floor(secondsAgo / 604800)} week${Math.floor(secondsAgo / 604800) > 1 ? 's' : ''} ago`
  }

  // Helper function to safely format post data for rendering
  // Converts Date objects to strings so React can render them
  const formatPostData = (post) => {
    return {
      ...post,
      timestamp: formatTimeAgo(post.timestamp),
      registrationNumber: post.registrationNumber || 'N/A',
      commentsList: post.commentsList || []
    }
  }

  // Sample posts data - In real app, fetch from API
  useEffect(() => {
    // Function to fetch posts from backend API
    const fetchPosts = async () => {
      try {
        // Fetch all posts from backend
        const response = await apiFetch('/posts');
        const data = await response.json();

        if (data.success && data.posts.length > 0) {
          // Use posts from backend and format them
          const formattedPosts = data.posts.map(post => formatPostData(post))
          setPosts(formattedPosts);
        } else {
          // If no posts in backend, show sample posts for demo
          const samplePosts = [
            {
              id: 1,
              authorName: 'Rahul Kumar',
              authorDept: 'CSE, 3rd Year',
              authorAvatar: 'R',
              profileImage: 'https://res.cloudinary.com/doike6ngk/image/upload/v1690000001/campus-connect/profiles/rahul.jpg',
              timestamp: '2 hours ago',
              content: 'Just completed my first full-stack project using React and Node.js! Feeling excited about the journey ahead. #WebDevelopment #LearningJourney',
              images: [],
              reactions: {
                likes: 45,
                comments: 8,
                shares: 3
              },
              commentsList: []
            },
            {
              id: 2,
              authorName: 'Priya Singh',
              authorDept: 'AIML, 2nd Year',
              authorAvatar: 'P',
              profileImage: 'https://res.cloudinary.com/doike6ngk/image/upload/v1690000002/campus-connect/profiles/priya.jpg',
              timestamp: '4 hours ago',
              content: 'Attending an amazing workshop on Machine Learning today! The insights shared by the industry experts are invaluable. Great learning opportunity!',
              images: [],
              reactions: {
                likes: 67,
                comments: 12,
                shares: 5
              },
              commentsList: []
            },
            {
              id: 3,
              authorName: 'Amith Reddy',
              authorDept: 'ECE, 4th Year',
              authorAvatar: 'A',
              profileImage: 'https://res.cloudinary.com/doike6ngk/image/upload/v1690000003/campus-connect/profiles/amith.jpg',
              timestamp: '6 hours ago',
              content: 'Our college hackathon is coming up next month! Looking for team members interested in building innovative solutions. DM me if interested! 🚀',
              images: [],
              reactions: {
                likes: 89,
                comments: 23,
                shares: 15
              },
              commentsList: []
            },
            {
              id: 4,
              authorName: 'Neha Patel',
              authorDept: 'CIVIL, 2nd Year',
              authorAvatar: 'N',
              profileImage: 'https://res.cloudinary.com/doike6ngk/image/upload/v1690000004/campus-connect/profiles/neha.jpg',
              timestamp: '8 hours ago',
              content: 'Started reading "Clean Code" by Robert Martin. Highly recommended for anyone who wants to write better code. What are your thoughts?',
              images: [],
              reactions: {
                likes: 56,
                comments: 14,
                shares: 4
              },
              commentsList: []
            }
          ];
          setPosts(samplePosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Show sample posts if fetch fails
        const samplePosts = [
          {
            id: 1,
            authorName: 'Rahul Kumar',
            authorDept: 'CSE, 3rd Year',
            authorAvatar: 'R',
            profileImage: 'https://res.cloudinary.com/doike6ngk/image/upload/v1690000001/campus-connect/profiles/rahul.jpg',
            timestamp: '2 hours ago',
            content: 'Just completed my first full-stack project using React and Node.js! Feeling excited about the journey ahead. #WebDevelopment #LearningJourney',
            images: [],
            reactions: {
              likes: 45,
              comments: 8,
              shares: 3
            },
            commentsList: []
          }
        ];
        setPosts(samplePosts);
      }
    };

    // Fetch posts from backend
    fetchPosts();

    // Load user interactions (which posts user has liked) from localStorage
    const savedLikes = localStorage.getItem('userLikes');
    if (savedLikes) {
      try {
        setUserLikes(JSON.parse(savedLikes));
      } catch (error) {
        setUserLikes({});
      }
    }

    // Set profile data for left sidebar - use ONLY token data, never localStorage
    setProfileData({
      name: userName || 'Your Name',
      email: userEmail || 'student@example.com',
      department: 'Computer Science',
      year: '3rd Year',
      profileImage: null
    });

    setLoading(false);
  }, [token, userName, userEmail])

  // Effect to fetch current user's profile image separately
  // This ensures we always have the latest profile image for the current user
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const response = await apiFetch('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success && data.user?.profileImage) {
          setCurrentUserProfileImage(data.user.profileImage);
        }
      } catch (error) {
        console.error('Error fetching user profile image:', error);
      }
    };

    if (token) {
      fetchUserProfileImage();
    }
  }, [token])

  // Effect to fetch and cache profile images for all post authors
  // This ensures everyone sees the latest profile image for each user
  useEffect(() => {
    const fetchAuthorProfileImages = async () => {
      if (posts.length === 0) return;

      // Get all unique author emails from posts
      const uniqueEmails = [...new Set(posts.map(post => post.authorEmail).filter(Boolean))];
      
      // Only fetch emails we haven't cached yet
      const emailsToFetch = uniqueEmails.filter(email => !authorProfileImages[email]);
      
      if (emailsToFetch.length === 0) return; // All emails already cached

      // Fetch profile image for each new author
      const newImages = { ...authorProfileImages };
      
      for (const email of emailsToFetch) {
        try {
          const response = await apiFetch(`/auth/profile/${encodeURIComponent(email)}`);
          const data = await response.json();
          
          if (data.success && data.user?.profileImage) {
            newImages[email] = data.user.profileImage;
          }
        } catch (error) {
          console.error(`Error fetching profile image for ${email}:`, error);
          // Keep the old image if fetch fails
        }
      }
      
      setAuthorProfileImages(newImages);
    };

    fetchAuthorProfileImages();
  }, [posts])


  // Function to fetch conversations (messages) for current user
  const fetchConversations = async () => {
    try {
      setLoadingMessages(true)
      const response = await apiFetch('/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success && data.conversations) {
        setConversations(data.conversations)
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoadingMessages(false)
    }
  }

  // Function to handle logout
  const handleLogout = () => {
    // Call parent function to update login state
    onLogout()
    // Redirect to login page
    navigate('/login')
  }

  // Function to open post detail view
  const handleOpenPostDetail = (post) => {
    setSelectedPost(post)
    setShowPostDetail(true)
  }

  // Function to close post detail view
  const handleClosePostDetail = () => {
    setSelectedPost(null)
    setShowPostDetail(false)
  }

  // Function to toggle comment display for a post and fetch comments from backend
  const toggleComments = async (postId) => {
    // If already expanded, just collapse it
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({
        ...prev,
        [postId]: false
      }))
      return
    }

    // If not expanded, fetch comments from backend and expand
    await refreshComments(postId)
    
    // Then expand the comments section
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  // Function to refresh/reload comments for a post
  const refreshComments = async (postId) => {
    try {
      const response = await apiFetch(`/comments/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        // Update the post with fetched comments
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: data.comments
            }
          }
          return post
        })
        setPosts(updatedPosts)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  // Function to handle adding a comment
  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim()
    if (!commentText) return

    try {
      // Get user info from token (not localStorage, which is shared across tabs)
      // userEmail and userName are already available from token decoding at top of component
      
      // Log for debugging
      console.log('Adding comment:', { postId, text: commentText, author: userName, userEmail })

      // Send comment to backend API
      const response = await apiFetch('/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: postId,
          text: commentText,
          author: userName || 'Anonymous User',
          userEmail: userEmail || 'user@campus.local'
        })
      })

      const data = await response.json()
      console.log('Comment response:', data)
      
      if (data.success) {
        // Clear input field
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ''
        }))

        // Refetch comments from backend to show the new comment
        const commentsResponse = await apiFetch(`/comments/${postId}`)
        const commentsData = await commentsResponse.json()

        if (commentsData.success) {
          // Update post with new comments
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                commentsList: commentsData.comments,
                reactions: {
                  ...post.reactions,
                  comments: commentsData.count
                }
              }
            }
            return post
          })
          setPosts(updatedPosts)

          // Update selectedPost if it's the one being viewed in the modal
          if (selectedPost?.id === postId) {
            setSelectedPost(prev => ({
              ...prev,
              commentsList: commentsData.comments,
              reactions: {
                ...prev.reactions,
                comments: commentsData.count
              }
            }))
          }
        }
      } else {
        toast.error('Failed to add comment: ' + data.message)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error adding comment: ' + error.message)
    }
  }

  // Function to handle comment input change
  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }))
  }



  // Function to handle like reaction on a post
  const handleLike = async (postId) => {
    // Check if user has already liked this post
    const isLiked = userLikes[postId];
    
    // Determine increment value (1 for like, -1 for unlike)
    const increment = isLiked ? -1 : 1;

    try {
      // Send like update to backend API
      const response = await apiFetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          increment,
          currentUserEmail: userEmail,
          currentUserName: userName
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update posts with the new like count from backend
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              reactions: {
                ...post.reactions,
                likes: data.post.reactions.likes
              }
            };
          }
          return post;
        });

        // Update posts state
        setPosts(updatedPosts);

        // Update selectedPost if it's the one being viewed in the modal
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            reactions: {
              ...prev.reactions,
              likes: data.post.reactions.likes
            }
          }));
        }

        // Update user likes tracking object
        const updatedLikes = {
          ...userLikes,
          [postId]: !isLiked // Toggle the like status
        };

        // Save updated likes to localStorage for persistence
        setUserLikes(updatedLikes);
        localStorage.setItem('userLikes', JSON.stringify(updatedLikes));

        // Save updated posts to localStorage
        localStorage.setItem('feedPosts', JSON.stringify(updatedPosts));
      } else {
        console.error('Failed to update like:', data.message);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  }

  // Function to delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      // Delete from backend API
      const response = await apiFetch(`/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove post from state
        const updatedPosts = posts.filter(post => post.id !== postId);
        setPosts(updatedPosts);
        localStorage.setItem('feedPosts', JSON.stringify(updatedPosts));
        toast.success('Post deleted successfully!');
      } else {
        toast.error('Failed to delete post: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post: ' + error.message);
    }
  }

  // Function to update/edit a post
  const handleUpdatePost = async (postId) => {
    if (!editPostContent.trim()) {
      toast.error('Post content cannot be empty!');
      return;
    }

    try {
      // Find the post to get current images
      const post = posts.find(p => p.id === postId);

      // Update on backend API
      const response = await apiFetch(`/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editPostContent,
          images: post.images,
          profileImage: post.profileImage
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update post in state
        const updatedPosts = posts.map(post => 
          post.id === postId 
            ? { ...post, content: editPostContent }
            : post
        );
        setPosts(updatedPosts);
        localStorage.setItem('feedPosts', JSON.stringify(updatedPosts));
        setEditingPostId(null);
        setEditPostContent('');
        toast.success('Post updated successfully!');
      } else {
        toast.error('Failed to update post: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error updating post: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Navigation bar - Sticky at top - Responsive */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center gap-2 sm:gap-3">
          {/* Logo */}
          <h1 className="text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0 whitespace-nowrap">Campus Connect</h1>

          {/* Search bar for global search - Hidden on mobile */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <SearchBar />
          </div>

          {/* Hamburger Menu Button - Only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 text-2xl flex-shrink-0"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Navigation links and logout button - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center gap-0 flex-shrink-0">
            {/* Link to home */}
            <a href="/feed" className="text-gray-700 hover:text-blue-600 font-semibold px-2 py-1 border-b-2 border-blue-600 text-xs whitespace-nowrap">
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
            {/* Link to mentors/mentorship */}
            <a href="/mentors" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-xs whitespace-nowrap">
              🎓 Mentors
            </a>
            {/* Admin Dashboard - Only for admins */}
            {isAdmin && (
              <a href="/admin-dashboard" className="text-purple-700 hover:text-purple-600 px-2 py-1 text-xs font-semibold whitespace-nowrap">
                🎯 Admin
              </a>
            )}
            {/* Message icon - Shows all conversations */}
            <button
              onClick={() => {
                setShowMessages(!showMessages)
                if (!showMessages) {
                  fetchConversations()
                }
              }}
              className="relative text-gray-700 hover:text-blue-600 px-2 py-1 text-xs font-semibold transition whitespace-nowrap"
              title="Messages"
            >
              💬 Messages
              {conversations.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-center text-[10px]">
                  {conversations.length}
                </span>
              )}
            </button>
            {/* Notifications bell - Shows unread notification count */}
            <NotificationBell userEmail={userEmail} token={token} />
            {/* Welcome message and Logout button */}
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-300">
              <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-semibold text-xs whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile nav link - Home */}
              <a
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 font-semibold px-3 py-2 rounded hover:bg-blue-50 text-sm"
              >
                🏠 Home
              </a>
              {/* Mobile nav link - Profile */}
              <a
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-blue-50 text-sm"
              >
                👤 Profile
              </a>
              {/* Mobile nav link - Events */}
              <a
                href="/hackathons"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-blue-50 text-sm"
              >
                📅 Events
              </a>
              {/* Mobile nav link - Mentors */}
              <a
                href="/mentors"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-blue-50 text-sm"
              >
                🎓 Mentors
              </a>
              {/* Mobile nav link - Admin (only for admins) */}
              {isAdmin && (
                <a
                  href="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-purple-700 hover:text-purple-600 font-semibold px-3 py-2 rounded hover:bg-purple-50 text-sm"
                >
                  🎯 Admin
                </a>
              )}
              {/* Mobile nav link - Messages */}
              <button
                onClick={() => {
                  setShowMessages(!showMessages)
                  setMobileMenuOpen(false)
                  if (!showMessages) {
                    fetchConversations()
                  }
                }}
                className="w-full text-left text-gray-700 hover:text-blue-600 font-semibold px-3 py-2 rounded hover:bg-blue-50 text-sm"
              >
                💬 Messages {conversations.length > 0 && `(${conversations.length})`}
              </button>
              {/* Mobile divider */}
              <div className="border-t border-gray-200 my-2"></div>
              {/* Mobile logout button */}
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-semibold text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Messages Modal/Dropdown */}
      {showMessages && (
        <div className="fixed top-16 right-20 bg-white rounded-lg shadow-xl border border-gray-200 z-40 w-96 max-h-96 overflow-y-auto">
          {/* Modal header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">💬 Messages</h2>
              <button
                onClick={() => setShowMessages(false)}
                className="text-white hover:bg-blue-800 rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages content */}
          {loadingMessages ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : conversations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => {
                // Determine who the other person is
                const otherPerson = conv.mentorId?._id === currentUser?.userId ? conv.studentId : conv.mentorId;
                const lastMessage = conv.lastMessage ? (
                  typeof conv.lastMessage === 'object' ? conv.lastMessage.text : conv.lastMessage
                ) : 'No messages yet';
                
                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      // Redirect to mentor chat or conversations
                      navigate(`/mentor-chat/${conv._id}`);
                      setShowMessages(false);
                    }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 border-transparent hover:border-blue-600"
                  >
                    {/* Conversation header with user info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {otherPerson?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {otherPerson?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {otherPerson?.email || 'user@campus.local'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Last message preview */}
                    <p className="text-sm text-gray-600 truncate ml-13">
                      {lastMessage.substring(0, 50)}...
                    </p>
                    
                    {/* Timestamp - show when was last message */}
                    {conv.lastMessageAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(conv.lastMessageAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-2">Start a conversation with a mentor!</p>
            </div>
          )}
        </div>
      )}


      {/* Loading spinner */}
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* LinkedIn-style 3-column layout */}
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* LEFT SIDEBAR - User Profile Card (Hidden on mobile, visible on md and up) */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Cover image */}
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-16"></div>
                
                {/* Profile content */}
                <div className="px-4 pb-4 text-center relative">
                  {/* Profile avatar */}
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-white mx-auto -mt-8 mb-4 shadow-lg">
                    {profileData?.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Profile name and info */}
                  <h3 className="font-semibold text-gray-900 text-sm">{profileData?.name}</h3>
                  <p className="text-gray-600 text-xs">{profileData?.department}</p>

                  {/* Profile stats */}
                  <div className="mt-4 flex flex-col gap-3 text-xs">
                    <button 
                      onClick={() => window.location.href = '/profile'}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                      👤 View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION - Main Feed (Takes up more space on larger screens) */}
            <div className="md:col-span-2">
              {/* Posts feed */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Post header with user info - LinkedIn style */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* User avatar - Shows profile image or fallback to letter */}
                          {/* Use cached author profile image if available (latest), otherwise use stored image */}
                          {authorProfileImages[post.authorEmail?.toLowerCase().trim()] ? (
                            <img
                              src={authorProfileImages[post.authorEmail?.toLowerCase().trim()]}
                              alt={post.authorName}
                              crossOrigin="anonymous"
                              onClick={() => navigate(`/profile?userEmail=${encodeURIComponent(post.authorEmail)}`)}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                            />
                          ) : post.profileImage ? (
                            <img
                              src={post.profileImage}
                              alt={post.authorName}
                              crossOrigin="anonymous"
                              onClick={() => navigate(`/profile?userEmail=${encodeURIComponent(post.authorEmail)}`)}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                            />
                          ) : (
                            <div 
                              onClick={() => navigate(`/profile?userEmail=${encodeURIComponent(post.authorEmail)}`)}
                              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm cursor-pointer hover:opacity-80"
                            >
                              {post.authorAvatar}
                            </div>
                          )}

                          {/* User info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p 
                                onClick={() => navigate(`/profile?userEmail=${encodeURIComponent(post.authorEmail)}`)}
                                className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600"
                              >
                                {post.authorName}
                              </p>
                              <span className="text-xs text-gray-600">• {post.registrationNumber}</span>
                              <span className="text-xs text-gray-500">
                                {post.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{post.authorDept}</p>
                          </div>
                        </div>

                        {/* Edit/Delete buttons - Only show for post author */}
                        {/* DEBUG INFO - Log email comparison */}
                        {(() => {
                          const normalizedPostEmail = post.authorEmail?.toLowerCase().trim();
                          const normalizedUserEmail = userEmail?.toLowerCase().trim();
                          console.log(`Post: "${post.authorName}" | Post email: "${normalizedPostEmail}", Current user email: "${normalizedUserEmail}", Match: ${normalizedPostEmail === normalizedUserEmail}`);
                          return null;
                        })()}
                        {((post.authorEmail?.toLowerCase().trim() === userEmail?.toLowerCase().trim()) || !post.authorEmail) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingPostId(post.id);
                                setEditPostContent(post.content);
                              }}
                              className="text-gray-600 hover:text-blue-600 font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100 transition"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-600 hover:text-red-600 font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100 transition"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post content - Text and images / Edit form */}
                    <div className="px-4 py-3">
                      {editingPostId === post.id ? (
                        // Edit mode
                        <div className="space-y-3">
                          <textarea
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                            placeholder="Edit your post..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows="3"
                          ></textarea>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdatePost(post.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingPostId(null);
                                setEditPostContent('');
                              }}
                              className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-sm transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div 
                          onClick={() => handleOpenPostDetail(post)}
                          className="cursor-pointer hover:bg-gray-50 transition p-1 rounded -mx-1"
                        >
                          <p className="text-gray-800 leading-relaxed text-sm break-words">
                            {post.content}
                          </p>

                          {/* Display tags if they exist */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200 transition cursor-pointer"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Show post images if any exist */}
                          {post.images && post.images.length > 0 && (
                            <div className="mt-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {/* Display each image thumbnail */}
                            {post.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Post image ${index + 1}`}
                                crossOrigin="anonymous"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition"
                              />
                            ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post stats - Likes, comments count */}
                    <div className="px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                      <span>👍 {post.reactions.likes} {post.reactions.likes === 1 ? 'like' : 'likes'}</span>
                      <div className="flex gap-4">
                        <span>💬 {post.reactions.comments} comments</span>
                      </div>
                    </div>

                    {/* Post action buttons - Like, Comment, Share */}
                    <div className="px-4 py-3 flex gap-0 border-t border-gray-100">
                      {/* Like button - Interactive with state */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 py-2 px-3 rounded hover:bg-gray-100 font-semibold transition flex items-center justify-center gap-2 text-sm ${
                          userLikes[post.id] 
                            ? 'text-blue-600' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        👍 Like
                      </button>

                      {/* Comment button */}
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex-1 py-2 px-3 rounded hover:bg-gray-100 font-semibold transition text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 text-sm"
                      >
                        💬 Comment
                      </button>
                    </div>

                    {/* Comments section - Shown when comment button is clicked */}
                    {expandedComments[post.id] && (
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        {/* Comments header with refresh button */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-gray-900">Comments</h4>
                          <button
                            onClick={() => refreshComments(post.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition"
                            title="Refresh to see new comments"
                          >
                            🔄 Refresh
                          </button>
                        </div>

                        {/* Display existing comments */}
                        <div className="space-y-3 mb-4">
                          {post.commentsList && post.commentsList.length > 0 ? (
                            post.commentsList.map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                {/* Comment author avatar */}
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {comment.author.charAt(0)}
                                </div>
                                {/* Comment content */}
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <span className="font-semibold text-gray-900">{comment.author}</span>
                                    <span className="text-gray-700"> {comment.text}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
                          )}
                        </div>

                        {/* Comment input field */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          {/* User avatar */}
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {userName?.charAt(0) || 'Y'}
                          </div>
                          {/* Input and submit */}
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(post.id)
                                }
                              }}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-3 py-1"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state - Shows if no posts */}
                {posts.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 text-sm">No posts yet. Be the first to post something!</p>
                  </div>
                )}
              </div>
            </div>



          </div>
        </>
      )}

      {/* Post Detail Modal - Similar to LinkedIn post detail view */}
      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {/* Modal container */}
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header with close button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Post Details</h2>
              <button
                onClick={handleClosePostDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Post detail content */}
            <div className="p-6">
              {/* Post header with user info */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  {/* User avatar */}
                  {authorProfileImages[selectedPost.authorEmail?.toLowerCase().trim()] ? (
                    <img
                      src={authorProfileImages[selectedPost.authorEmail?.toLowerCase().trim()]}
                      alt={selectedPost.authorName}
                      crossOrigin="anonymous"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : selectedPost.profileImage ? (
                    <img
                      src={selectedPost.profileImage}
                      alt={selectedPost.authorName}
                      crossOrigin="anonymous"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                      {selectedPost.authorAvatar}
                    </div>
                  )}

                  {/* User info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedPost.authorName}</p>
                    <p className="text-sm text-gray-600">{selectedPost.authorDept}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPost.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post content */}
              <div className="mb-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post images - Display in larger format */}
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedPost.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          crossOrigin="anonymous"
                          className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post stats */}
              <div className="py-3 px-0 bg-gray-50 border-y border-gray-100 mb-6 flex items-center justify-between text-sm text-gray-600">
                <span>👍 {selectedPost.reactions.likes} {selectedPost.reactions.likes === 1 ? 'like' : 'likes'}</span>
                <span>💬 {selectedPost.reactions.comments} {selectedPost.reactions.comments === 1 ? 'comment' : 'comments'}</span>
              </div>

              {/* Post action buttons */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                <button
                  onClick={() => {
                    handleLike(selectedPost.id);
                  }}
                  className={`flex-1 py-2 px-3 rounded hover:bg-gray-100 font-semibold transition flex items-center justify-center gap-2 text-sm ${
                    userLikes[selectedPost.id] 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  👍 Like
                </button>

                <button 
                  onClick={() => {
                    toggleComments(selectedPost.id);
                  }}
                  className="flex-1 py-2 px-3 rounded hover:bg-gray-100 font-semibold transition text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 text-sm"
                >
                  💬 Comment
                </button>
              </div>

              {/* Comments section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Comments ({selectedPost.commentsList?.length || 0})
                </h3>

                {/* Comments list */}
                <div className="space-y-4 mb-6">
                  {selectedPost.commentsList && selectedPost.commentsList.length > 0 ? (
                    selectedPost.commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <p className="font-semibold text-sm text-gray-900">{comment.author}</p>
                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                  )}
                </div>

                {/* Comment input */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {userName?.charAt(0) || 'Y'}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[selectedPost.id] || ''}
                        onChange={(e) => handleCommentChange(selectedPost.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(selectedPost.id);
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(selectedPost.id)}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-4 py-2"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Feed
