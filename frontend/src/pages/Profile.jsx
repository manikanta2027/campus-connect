// Import useState and useEffect hooks
import { useState, useEffect } from 'react'
// Import useNavigate and useSearchParams to redirect and get URL params
import { useNavigate, useSearchParams } from 'react-router-dom'
// Import SearchBar component for global search
import SearchBar from '../components/SearchBar'
// Import toast for professional notifications
import toast from 'react-hot-toast'
// Import API configuration
import API_URL from '../config/api'
// Import API fetch helper
import apiFetch from '../utils/apiFetch'

function Profile({ token, onLogout }) {
  // useNavigate hook to navigate to different pages
  const navigate = useNavigate()
  // useSearchParams to get URL parameters (for viewing other users' profiles)
  const [searchParams] = useSearchParams()
  const viewingUserEmail = searchParams.get('userEmail')

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
  const userEmail = currentUser?.userEmail;
  const userName = currentUser?.userName;
  
  // Debug: Log token and decoded data
  useEffect(() => {
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Decoded user:', currentUser);
    console.log('userName:', userName, 'userEmail:', userEmail);
  }, [token, currentUser, userName, userEmail]);

  // State to store user profile data
  const [profile, setProfile] = useState(null)
  // State to store viewed user's profile (if viewing another user)
  const [viewedProfile, setViewedProfile] = useState(null)

  // State for user posts - fetch from localStorage on load
  const [userPosts, setUserPosts] = useState([])
  // State for main edit mode toggle
  const [isEditing, setIsEditing] = useState(false)
  // State for loading spinner
  const [loading, setLoading] = useState(true)
  // State for post content text
  const [postContent, setPostContent] = useState('')
  // State for selected images before upload
  const [selectedImages, setSelectedImages] = useState([])
  // State for image preview URLs
  const [imagePreviews, setImagePreviews] = useState([])
  // State for profile image upload
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  // State for profile image URL from Cloudinary
  const [profileImageUrl, setProfileImageUrl] = useState(null)
  // State to store temporary edit values before saving
  const [editYearInput, setEditYearInput] = useState('')
  const [editBioInput, setEditBioInput] = useState('')
  const [editSkillsInput, setEditSkillsInput] = useState('')
  const [newSkillInput, setNewSkillInput] = useState('')
  // State to show uploading status
  const [isUploading, setIsUploading] = useState(false)
  // State to store post image URLs from Cloudinary
  const [postImageUrls, setPostImageUrls] = useState([])
  // State to track which post is showing comments
  const [expandedComments, setExpandedComments] = useState({})
  // State to store comment input for each post
  const [commentInputs, setCommentInputs] = useState({})
  // State to track which posts user has liked
  const [userLikes, setUserLikes] = useState({})
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

  // Helper function to safely format post data for rendering
  // Converts Date objects to strings so React can render them
  const formatPostData = (post) => {
    return {
      ...post,
      timestamp: typeof post.timestamp === 'string' ? post.timestamp : 'just now',
      commentsList: post.commentsList || []
    }
  }

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

  // Load profile data from localStorage or use default
  useEffect(() => {
    // ALWAYS reset ALL viewing states at the start of useEffect
    // This prevents showing old profile data when switching users
    setViewedProfile(null);
    setUserPosts([]);
    
    // IMPORTANT: Always reload own profile fresh from localStorage when NOT viewing another user
    // This ensures we don't show stale data from the last visited profile
    const isViewingAnotherUser = viewingUserEmail && viewingUserEmail !== userEmail;
    
    const loadProfileData = async () => {
      if (!isViewingAnotherUser) {
        // Viewing own profile - fetch from backend using email
        try {
          const response = await fetch(`/api/auth/user/${encodeURIComponent(userEmail)}`);
          const data = await response.json();
          
          if (data.success && data.user) {
            setProfile(data.user);
            // Set profile image from the fetched profile
            if (data.user.profileImage) {
              setProfileImageUrl(data.user.profileImage);
              setProfileImagePreview(data.user.profileImage);
            }
            // Initialize edit inputs with actual profile values
            setEditYearInput(data.user.year || '');
            setEditBioInput(data.user.bio || '');
            setEditSkillsInput((data.user.skills || []).join(', '));
          } else {
            // Fallback if API fails
            const savedProfile = localStorage.getItem(`userProfile_${userEmail}`);
            let loadedProfile;

            if (savedProfile) {
              try {
                loadedProfile = JSON.parse(savedProfile);
              } catch (error) {
                console.error('Error loading saved profile:', error);
                loadedProfile = null;
              }
            }

            const sampleProfile = loadedProfile || {
              name: userName || 'Your Name',
              email: userEmail || 'student@example.com',
              department: 'Computer Science',
              year: '3rd Year',
              bio: 'Passionate about web development and machine learning. Coffee enthusiast ☕',
              skills: ['React.js', 'Node.js', 'MongoDB', 'Python', 'Web Development'],
              profileImage: null
            };

            setProfile(sampleProfile);
            if (sampleProfile.profileImage) {
              setProfileImageUrl(sampleProfile.profileImage);
              setProfileImagePreview(sampleProfile.profileImage);
            }
            setEditYearInput(sampleProfile.year);
            setEditBioInput(sampleProfile.bio);
            setEditSkillsInput(sampleProfile.skills.join(', '));
          }
        } catch (error) {
          console.error('Error fetching own profile:', error);
          // Fallback to localStorage
          const savedProfile = localStorage.getItem(`userProfile_${userEmail}`);
          let loadedProfile;

          if (savedProfile) {
            try {
              loadedProfile = JSON.parse(savedProfile);
            } catch (error) {
              console.error('Error loading saved profile:', error);
              loadedProfile = null;
            }
          }

          const sampleProfile = loadedProfile || {
            name: userName || 'Your Name',
            email: userEmail || 'student@example.com',
            department: 'Computer Science',
            year: '3rd Year',
            bio: 'Passionate about web development and machine learning. Coffee enthusiast ☕',
            skills: ['React.js', 'Node.js', 'MongoDB', 'Python', 'Web Development'],
            profileImage: null
          };

          setProfile(sampleProfile);
          if (sampleProfile.profileImage) {
            setProfileImageUrl(sampleProfile.profileImage);
            setProfileImagePreview(sampleProfile.profileImage);
          }
          setEditYearInput(sampleProfile.year);
          setEditBioInput(sampleProfile.bio);
          setEditSkillsInput(sampleProfile.skills.join(', '));
        }
      }
    }

    // Call the function to load profile data
    loadProfileData();

    // Determine which user's posts to fetch
    const emailToFetchPostsFor = isViewingAnotherUser ? viewingUserEmail : userEmail;

    // LOAD POSTS FROM BACKEND API - Fetch posts for the appropriate user
    const fetchUserPosts = async () => {
      try {
        // Fetch posts from backend API for the correct user
        const response = await fetch(`/api/posts/user/${emailToFetchPostsFor}`)
        const data = await response.json()

        if (data.success && data.posts.length > 0) {
          // Use posts from backend and format them
          const formattedPosts = data.posts.map(post => formatPostData(post))
          setUserPosts(formattedPosts)
        } else {
          // If no posts in backend, set empty array
          setUserPosts([])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        // If error, set empty array and let user create posts
        setUserPosts([])
      }
    }

    // Fetch posts from backend
    fetchUserPosts()
    
    // Load user likes from localStorage
    const savedLikes = localStorage.getItem('userLikes');
    if (savedLikes) {
      try {
        setUserLikes(JSON.parse(savedLikes));
      } catch (error) {
        console.error('Error loading likes:', error);
        setUserLikes({});
      }
    }
    
    // Check if viewing another user's profile
    if (isViewingAnotherUser) {
      // Create async function to fetch viewed user's profile
      const fetchViewedProfile = async () => {
        // First check localStorage
        const allProfiles = JSON.parse(localStorage.getItem('allUserProfiles') || '{}');
        
        if (allProfiles[viewingUserEmail] && allProfiles[viewingUserEmail].email === viewingUserEmail) {
          // Use cached profile if available
          setViewedProfile(allProfiles[viewingUserEmail]);
          setLoading(false);
        } else {
          // Fetch from backend if not in localStorage
          try {
            const response = await fetch(`${API_URL}/auth/user/${encodeURIComponent(viewingUserEmail)}`);
            const data = await response.json();
            
            // ✅ DEBUG: Log the received data
            console.log('📥 Received profile data:', data);
            console.log('👤 User data:', data.user);
            console.log('⭐ Skills:', data.user?.skills);
            
            if (data.success && data.user) {
              setViewedProfile(data.user);
              // Cache it for future use
              allProfiles[viewingUserEmail] = data.user;
              localStorage.setItem('allUserProfiles', JSON.stringify(allProfiles));
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
        
        setLoading(false);
      };

      // Call the async function
      fetchViewedProfile();
    } else {
      // If viewing own profile, stop loading immediately
      setLoading(false);
    }
  }, [viewingUserEmail, userEmail, userName]);

  const handleLogout = () => {
    // Call parent function to update login state
    onLogout()
    // Redirect to login page
    navigate('/login')
  }

  // Function to fetch conversations (messages) for current user
  const fetchConversations = async () => {
    try {
      setLoadingMessages(true)
      const response = await fetch('/api/messages/conversations', {
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

  // Function to message another user
  const handleMessage = async () => {
    if (!viewingUserEmail) return;
    
    try {
      // Start a conversation with the target user using their email
      const response = await fetch('/api/messages/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorEmail: viewingUserEmail
        })
      });

      const data = await response.json();

      if (data.success && data.conversation) {
        // Navigate to the mentor chat with the conversation ID
        navigate(`/mentor-chat/${data.conversation._id}`);
      } else {
        alert('Failed to start conversation: ' + data.message);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error starting conversation: ' + error.message);
    }
  }

  // Function to delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      // Delete from backend API
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove post from state
        const updatedPosts = userPosts.filter(post => post.id !== postId);
        setUserPosts(updatedPosts);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
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
      alert('Post content cannot be empty!');
      return;
    }

    try {
      // Find the post to get current images
      const post = userPosts.find(p => p.id === postId);

      // Update on backend API
      const response = await fetch(`/api/posts/${postId}`, {
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
        const updatedPosts = userPosts.map(post => 
          post.id === postId 
            ? { ...post, content: editPostContent }
            : post
        );
        setUserPosts(updatedPosts);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
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

    // If not expanded, fetch comments from backend
    try {
      const response = await fetch(`/api/comments/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        // Update the post with fetched comments
        const updatedPosts = userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: data.comments
            }
          }
          return post
        })
        setUserPosts(updatedPosts)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }

    // Then expand the comments section
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
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
      const response = await fetch('/api/comments', {
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
        const commentsResponse = await fetch(`/api/comments/${postId}`)
        const commentsData = await commentsResponse.json()

        if (commentsData.success) {
          // Update post with new comments
          const updatedPosts = userPosts.map(post => {
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
          setUserPosts(updatedPosts)
          // Save to localStorage as well for persistence
          localStorage.setItem('userPosts', JSON.stringify(updatedPosts))
        }
      } else {
        alert('Failed to add comment: ' + data.message)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error adding comment: ' + error.message)
    }
  }

  // Function to handle comment input change
  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }))
  }

  // Function to refresh and fetch latest comments for a post
  const refreshComments = async (postId) => {
    try {
      const response = await fetch(`/api/comments/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        // Update the post with fetched comments
        const updatedPosts = userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: data.comments
            }
          }
          return post
        })
        setUserPosts(updatedPosts)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  // Function to handle liking/unliking a post
  const handleLike = async (postId) => {
    // Check if user has already liked this post
    const isLiked = userLikes[postId];
    
    // Determine increment value (1 for like, -1 for unlike)
    const increment = isLiked ? -1 : 1;

    try {
      // Send like update to backend API
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ increment })
      });

      const data = await response.json();

      if (data.success) {
        // Update posts with the new like count from backend
        const updatedPosts = userPosts.map(post => {
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
        setUserPosts(updatedPosts);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));

        // Update user likes tracking object
        const updatedLikes = {
          ...userLikes,
          [postId]: !isLiked // Toggle the like status
        };

        // Save updated likes to localStorage for persistence
        setUserLikes(updatedLikes);
        localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
      } else {
        console.error('Failed to update like:', data.message);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  }

  // Function to toggle edit mode
  const toggleEditMode = () => {
    // If entering edit mode, initialize edit inputs with current values
    if (!isEditing) {
      setEditYearInput(profile?.year || '');
      setEditBioInput(profile?.bio || '');
      setEditSkillsInput(profile?.skills?.join(', ') || '');
    }
    setIsEditing(!isEditing)
  }

  // Function to save profile changes
  const handleSaveProfile = async () => {
    try {
      // Update profile with edited values
      const updatedProfile = {
        ...profile,
        email: userEmail, // ALWAYS use the current logged-in user's email
        year: editYearInput,
        bio: editBioInput,
        skills: editSkillsInput.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
        // Use Cloudinary URL if uploaded, else use existing preview
        profileImage: profileImageUrl || profileImagePreview || profile.profileImage
      };
      
      // Save updated profile to state
      setProfile(updatedProfile);
      
      // Save profile to localStorage for persistence using unique key per user
      localStorage.setItem(`userProfile_${userEmail}`, JSON.stringify(updatedProfile));
      
      // Also save to allUserProfiles so it can be viewed by other users
      const allProfiles = JSON.parse(localStorage.getItem('allUserProfiles') || '{}');
      allProfiles[userEmail] = updatedProfile;
      localStorage.setItem('allUserProfiles', JSON.stringify(allProfiles));
      
      // Save to backend
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: updatedProfile.bio,
          skills: updatedProfile.skills,
          year: updatedProfile.year
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Exit edit mode
        setIsEditing(false);
        // Show success message
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Error saving profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setIsEditing(false);
    }
  }

  // Function to handle profile image upload to Cloudinary
  const handleProfileImageUpload = async (event) => {
    // Get the first file selected by user
    const file = event.target.files[0];
    
    if (file) {
      try {
        // Show upload status
        setIsUploading(true);
        
        // Create preview URL for immediate display while uploading
        const previewUrl = URL.createObjectURL(file);
        setProfileImagePreview(previewUrl);

        // Create FormData object to send file to backend
        const formData = new FormData();
        // Add file with field name 'image' (matches backend multer config)
        formData.append('image', file);

        // Send POST request to backend upload endpoint
        const response = await fetch('/api/upload/profile', {
          method: 'POST',
          body: formData,
          // Add JWT token for authentication
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Parse response JSON
        const data = await response.json();

        // Check if upload was successful
        if (data.success) {
          // Store the Cloudinary image URL for later saving
          setProfileImageUrl(data.imageUrl);
          
          // Immediately save profile with new image to localStorage
          const updatedProfile = {
            ...profile,
            profileImage: data.imageUrl
          };
          setProfile(updatedProfile);
          localStorage.setItem(`userProfile_${userEmail}`, JSON.stringify(updatedProfile));
          
          toast.success('Profile image uploaded successfully!');
        } else {
          toast.error('Upload failed: ' + data.message);
        }
      } catch (error) {
        // Log error for debugging
        console.error('Profile image upload error:', error);
        toast.error('Failed to upload profile image. Please try again.');
      } finally {
        // Hide upload status
        setIsUploading(false);
      }
    }
  }

  // Function to handle post image upload to Cloudinary
  const handleImageUpload = async (event) => {
    // Get all files selected by user
    const files = Array.from(event.target.files);
    
    // Limit to maximum 4 images per post
    if (files.length > 4) {
      toast.error('Maximum 4 images allowed per post. Please select up to 4 images.');
      return;
    }
    
    // Store files in state for later reference
    setSelectedImages(files);

    try {
      // Show upload status
      setIsUploading(true);
      
      // Create preview URLs for immediate display
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);

      // Array to store uploaded Cloudinary URLs
      const uploadedUrls = [];

      // Upload each image file to Cloudinary
      for (let file of files) {
        // Create FormData for each file
        const formData = new FormData();
        formData.append('image', file);

        // Upload to backend API
        const response = await fetch('/api/upload/post', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Parse response
        const data = await response.json();

        // If successful, store the Cloudinary URL
        if (data.success) {
          uploadedUrls.push(data.imageUrl);
        } else {
          console.error('Image upload failed:', data);
          toast.error('Failed to upload image: ' + (data.error || data.message));
        }
      }

      // Store all uploaded URLs in state
      if (uploadedUrls.length > 0) {
        setPostImageUrls(uploadedUrls);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      } else if (uploadedUrls.length === 0 && files.length > 0) {
        toast.error('No images were uploaded successfully. Check console for details.');
      }
    } catch (error) {
      // Log error for debugging
      console.error('Post image upload error:', error);
      toast.error('Failed to upload images. Error: ' + error.message);
    } finally {
      // Hide upload status
      setIsUploading(false);
    }
  }

  // Function to remove a specific image from preview
  const removeImage = (indexToRemove) => {
    // Filter out the image at the specified index
    const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove)
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove)
    
    // Update state with filtered arrays
    setSelectedImages(updatedImages)
    setImagePreviews(updatedPreviews)
  }

  // Function to create and post content with images
  const handleCreatePost = async () => {
    // Check if post content is empty
    if (postContent.trim() === '') {
      alert('Please write something before posting!')
      return
    }

    try {
      // Get user info from token (not localStorage, which is shared across tabs)
      // userEmail and userName are already available from token decoding at top of component
      
      // Generate a unique post ID using timestamp + random number
      // This ensures unique IDs across all posts in the database
      const newPostId = Date.now() + Math.floor(Math.random() * 10000)

      // Create new post object with Cloudinary image URLs
      const newPost = {
        id: newPostId,
        authorName: userName || 'Your Name',
        authorDept: profile?.department || 'Department',
        authorAvatar: profile?.name?.charAt(0).toUpperCase() || 'Y',
        authorEmail: userEmail || 'user@campus.local',
        content: postContent.trim(),
        images: postImageUrls.length > 0 ? postImageUrls : imagePreviews, // Use Cloudinary URLs if available, else local previews
        profileImage: profileImageUrl || profileImagePreview || profile?.profileImage || null, // Use uploaded image, preview, or saved profile image
        timestamp: 'just now', // String instead of Date object - React can render strings
        reactions: {
          likes: 0,
          comments: 0,
          shares: 0
        }
      }

      // Save post to backend API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      })

      const data = await response.json()
      
      if (data.success) {
        // Add new post to beginning of posts array
        const updatedPosts = [newPost, ...userPosts];
        setUserPosts(updatedPosts)
        
        // SAVE POSTS TO localStorage - Makes posts persistent across logout/login
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        
        // Clear form inputs
        setPostContent('')
        setSelectedImages([])
        setImagePreviews([])
        setPostImageUrls([])
        
        // Show success message
        toast.success('Post created successfully!')
      } else {
        toast.error('Failed to create post: ' + data.message)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Error creating post: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center gap-3">
          {/* Logo */}
          <h1 className="text-xl font-bold text-blue-600 flex-shrink-0">Campus Connect</h1>

          {/* Search bar for global search */}
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
            <a href="/profile" className="text-gray-700 hover:text-blue-600 font-semibold px-2 py-1 border-b-2 border-blue-600 text-xs whitespace-nowrap">
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
            {/* Message icon - Shows all conversations */}
            <button
              onClick={() => {
                setShowMessages(!showMessages)
                if (!showMessages) {
                  fetchConversations()
                }
              }}
              className="relative text-gray-700 hover:text-blue-600 px-2 py-1 font-semibold transition text-xs whitespace-nowrap"
              title="Messages"
            >
              💬 Messages
              {conversations.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {conversations.length}
                </span>
              )}
            </button>
            {/* User greeting and Logout button */}
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-300">
              <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">Welcome, {userName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-semibold text-xs whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
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
        <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Determine which profile to display */}
        {viewingUserEmail && viewingUserEmail !== userEmail && viewedProfile ? (
          // VIEWING ANOTHER USER'S PROFILE
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Profile header with avatar and info */}
            <div className="px-4 sm:px-6 py-6 relative">
              {/* Avatar and buttons row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                {/* Profile image section */}
                <div>
                  {viewedProfile?.profileImage ? (
                    <img 
                      src={viewedProfile.profileImage} 
                      alt={viewedProfile.name}
                      crossOrigin="anonymous"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-blue-500 shadow-lg">
                      {viewedProfile?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message button */}
                <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
                  <button
                    onClick={handleMessage}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
                  >
                    💬 Message
                  </button>
                </div>
              </div>

              {/* Profile info */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{viewedProfile?.name}</h1>
                <p className="text-gray-600 text-base sm:text-lg">{viewedProfile?.department} • {viewedProfile?.year}</p>
                <p className="text-gray-500 mt-1 text-sm">{viewedProfile?.registerNumber}</p>
              </div>

              {/* Bio and Skills */}
              <div className="space-y-6">
                {/* Bio section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">About Me</h3>
                  <p className="text-gray-700">{viewedProfile?.bio}</p>
                </div>

                {/* Skills section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">⭐ Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewedProfile?.skills && viewedProfile.skills.length > 0 ? (
                      viewedProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // VIEWING OWN PROFILE
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Profile header with avatar and info */}
          <div className="px-4 sm:px-6 py-6 relative">
            {/* Avatar and Edit button row - Responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
              {/* Profile image section - Shows uploaded image or initials */}
              <div className="relative">
                {profileImagePreview ? (
                  <img 
                    src={profileImagePreview} 
                    alt="Profile"
                    crossOrigin="anonymous"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-blue-500 shadow-lg">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Profile image edit button - Only in edit mode */}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-sm disabled:bg-gray-400">
                    {isUploading ? '\u23f3' : '\ud83d\udcf7'}
                    {/* Hidden file input for profile image selection */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={toggleEditMode}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-semibold transition sm:ml-auto w-full sm:w-auto"
              >
                {isEditing ? '✕ Cancel' : '✎ Edit Profile'}
              </button>
            </div>

            {/* Profile info - Name, Department, Register Number */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-600 text-base sm:text-lg">{profile?.department} • {profile?.year}</p>
              <p className="text-gray-500 mt-1 text-sm">{profile?.registerNumber}</p>
            </div>

            {/* Show bio and skills in non-edit mode */}
            {!isEditing && (
            <div className="space-y-6">
              {/* Bio section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About Me</h3>
                <p className="text-gray-700">{profile?.bio}</p>
              </div>

              {/* Skills section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">⭐ Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            )}


            {/* Editable sections - Year, Bio, Skills - Only show in edit mode */}
            {isEditing && (
            <div className="space-y-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Year section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📚 Year</h3>
                <input
                  type="text"
                  value={editYearInput}
                  onChange={(e) => setEditYearInput(e.target.value)}
                  placeholder="e.g., 3rd Year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bio section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About Me</h3>
                <textarea
                  value={editBioInput}
                  onChange={(e) => setEditBioInput(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>

              {/* Skills section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">⭐ Skills</h3>
                <input
                  type="text"
                  value={editSkillsInput}
                  onChange={(e) => setEditSkillsInput(e.target.value)}
                  placeholder="Enter skills separated by commas (e.g., React, Node.js, Python)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">💡 Separate multiple skills with commas</p>
              </div>
            </div>
            )}

            {/* Save button (only in edit mode) */}
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold transition"
              >
                💾 Save Changes
              </button>
            )}
          </div>
        </div>
        )}

        {/* Posts section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>

          {/* Post creation form - Only show when viewing own profile */}
          {(!viewingUserEmail || viewingUserEmail === userEmail) && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
            {/* Form title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a New Post</h3>
            
            {/* Text area for post content */}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts, achievements, or insights..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
            ></textarea>

            {/* Image preview section - shows selected images before posting */}
            {(imagePreviews.length > 0 || isUploading) && (
              <div className="mt-6 mb-6">
                {isUploading && (
                  <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
                    <p className="text-blue-800 font-semibold">⏳ Uploading images to cloud...</p>
                  </div>
                )}
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📷 Image Preview ({imagePreviews.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Loop through each image preview */}
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {/* Display image thumbnail */}
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      {/* Remove button appears on hover */}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons row - Responsive for mobile/desktop */}
            <div className="flex flex-col gap-4 mt-6 sm:flex-row sm:items-center">
              {/* Image upload button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer font-semibold transition">
                📷 Upload Images (Max 4)
                {/* Hidden file input for multiple image selection */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Post button - Disabled while uploading */}
              <button
                onClick={handleCreatePost}
                disabled={postContent.trim() === '' || isUploading}
                className="sm:ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
              >
                {isUploading ? '⏳ Uploading...' : '✓ Post'}
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500 mt-3">
              💡 Tip: You can upload multiple images and they will appear with your post!
            </p>
          </div>
          )}

          {/* Posts list - Responsive layout */}
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Post header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {/* User avatar - Show profile image or fallback to letter */}
                      {post.profileImage ? (
                        <img 
                          src={post.profileImage} 
                          alt={post.authorName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {post.authorAvatar || profile?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* User info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {post.authorName || profile?.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{post.authorDept || profile?.department}</p>
                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                      </div>

                      {/* Edit/Delete buttons - Only show for post author */}
                      {((post.authorEmail?.toLowerCase().trim() === userEmail?.toLowerCase().trim()) || !post.authorEmail) && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditPostContent(post.content);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-3 py-1 rounded hover:bg-blue-50"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-1 rounded hover:bg-red-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                      {/* Debug: Show if emails don't match */}
                      {(post.authorEmail?.toLowerCase().trim() !== userEmail?.toLowerCase().trim()) && post.authorEmail && (
                        <div className="text-xs text-gray-400">
                          (Not your post)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post content or Edit form */}
                  <div className="p-4">
                    {editingPostId === post.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <textarea
                          value={editPostContent}
                          onChange={(e) => setEditPostContent(e.target.value)}
                          placeholder="Edit your post..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows="4"
                        ></textarea>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingPostId(null);
                              setEditPostContent('');
                            }}
                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <p className="text-gray-800 leading-relaxed break-words">
                          {post.content}
                        </p>
                        
                        {/* Show images if post has any images */}
                        {post.images && post.images.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {/* Display each image in the post */}
                              {post.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Post image ${index + 1}`}
                                  crossOrigin="anonymous"
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition cursor-pointer"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Post stats - All reactions */}
                  <div className="px-4 py-2 border-t border-b border-gray-200 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>👍 {post.reactions.likes} likes</span>
                    <span>💬 {post.reactions.comments} comments</span>
                  </div>

                  {/* Post reactions/actions - Like, Comment */}
                  <div className="p-4 grid grid-cols-2 gap-2 sm:flex sm:justify-around">
                    {/* Like button */}
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`py-2 px-2 sm:px-4 rounded hover:bg-gray-100 font-semibold transition flex items-center justify-center gap-1 sm:gap-2 text-sm ${
                        userLikes[post.id] 
                          ? 'text-blue-600' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      👍 <span className="hidden sm:inline">Like</span>
                    </button>

                    {/* Comment button */}
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="py-2 px-2 sm:px-4 rounded hover:bg-gray-100 font-semibold transition text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 sm:gap-2 text-sm"
                    >
                      💬 <span className="hidden sm:inline">Comment</span>
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
                          {profile?.name?.charAt(0).toUpperCase()}
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
              ))
            ) : null}
          </div>
        </div>
        </div>
      )}
    </div>
  )
}

export default Profile
