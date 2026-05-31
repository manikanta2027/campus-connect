# 📊 CAMPUS CONNECT - COMPLETE WORKING STRUCTURE

---

## 🏗️ PROJECT ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (FRONTEND)                         │
│                   React.js + Tailwind                        │
├─────────────────────────────────────────────────────────────┤
│  Login → Register → Feed → Profile → Mentors → Chat → Admin │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (BACKEND)                            │
│              Express.js + Node.js (Port 5000)                │
├─────────────────────────────────────────────────────────────┤
│  Routes → Controllers → Business Logic → Models             │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                        │
│         Collections: Users, Posts, Messages, Events...      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 BACKEND FOLDER STRUCTURE (DETAILED)

### Root Level Files
```
backend/
├── server.js                  ← Main Express server entry point
├── package.json               ← Dependencies (Express, Mongoose, JWT, etc.)
├── .env                       ← Environment variables (MongoDB, JWT_SECRET, etc.)
├── addAdmin.js                ← Script to create admin users
└── testUtils.js               ← Testing helper functions
```

### `config/` - Configuration Files
```
config/
├── db.js                      ← MongoDB connection setup
│   └── connectDB()            - Connects to MongoDB Atlas
│   └── disconnectDB()         - Closes MongoDB connection
│
└── cloudinary.js              ← Cloudinary API configuration
    └── Cloud storage for images
    └── Profile & post images
```

**Key Code Pattern:**
```javascript
// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.log('❌ MongoDB Connection Error');
    process.exit(1);
  }
};
```

---

### `models/` - Database Schemas (Mongoose)
```
models/
├── User.js                    ← User account data
│   Fields: name, email, password, department, year, skills, 
│           profileImage, isMentor, isAdmin, isVerified, otp
│
├── Post.js                    ← Social posts/articles
│   Fields: id, authorName, authorEmail, content, images,
│           reactions (likes, comments, shares), tags
│
├── Comment.js                 ← Comments on posts
│   Fields: postId, authorEmail, content, timestamp
│
├── Event.js                   ← Hackathons & college events
│   Fields: title, description, date, location, registeredUsers
│
├── Message.js                 ← Chat messages
│   Fields: conversationId, senderId, content, timestamp, isRead
│
├── Conversation.js            ← Chat conversations (mentor-student)
│   Fields: mentorId, studentId, messages, isActive
│
├── Notification.js            ← Real-time notifications
│   Fields: recipientId, type, relatedItem, isRead
│
└── News.js                    ← Campus news articles
    Fields: title, content, image, author, category, isPinned
```

**Example Model Code:**
```javascript
// User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  skills: { type: [String], default: [] },
  isMentor: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  profileImage: { type: String, default: null },
  // ... more fields
});

module.exports = mongoose.model('User', userSchema);
```

---

### `controllers/` - Business Logic
```
controllers/
├── authController.js          ← Authentication logic
│   Functions:
│   ├── register()             - Create new user account
│   ├── login()                - Verify credentials & return JWT
│   ├── sendOTP()              - Generate & send OTP email
│   ├── verifyOTP()            - Verify OTP code
│   ├── forgotPassword()       - Send password reset email
│   ├── resetPassword()        - Update password with token
│   └── updateUserProfile()    - Edit user data
│
├── postController.js          ← Post management
│   Functions:
│   ├── createPost()           - Create new post with images
│   ├── getAllPosts()          - Fetch feed with pagination
│   ├── deletePost()           - Soft delete post
│   ├── updateLikes()          - Like/unlike post
│   └── searchPostsByTag()     - Filter posts by AI tags
│
├── commentController.js       ← Comment management
│   Functions:
│   ├── addComment()           - Add comment to post
│   ├── getComments()          - Fetch comments for post
│   └── deleteComment()        - Remove comment
│
├── eventController.js         ← Event management
│   Functions:
│   ├── createEvent()          - Create hackathon/event
│   ├── getAllEvents()         - Fetch all events
│   ├── registerEvent()        - User registers for event
│   └── deleteEvent()          - Remove event
│
├── mentorController.js        ← Mentor discovery
│   Functions:
│   ├── getAllMentors()        - List all mentors
│   ├── getMentorsBySkill()    - Filter by expertise
│   └── filterMentors()        - Advanced filtering
│
├── messageController.js       ← Messaging system
│   Functions:
│   ├── startConversation()    - Create new chat
│   ├── sendMessage()          - Send message
│   ├── getMessages()          - Fetch chat history
│   └── closeConversation()    - End conversation
│
├── uploadController.js        ← Image uploads
│   Functions:
│   ├── uploadProfileImage()   - Profile pic to Cloudinary
│   ├── uploadPostImages()     - Post images to Cloudinary
│   └── deleteImage()          - Remove image
│
├── notificationController.js  ← Real-time alerts
│   Functions:
│   ├── getNotifications()     - Fetch user notifications
│   ├── markAsRead()           - Mark notification read
│   └── deleteNotification()   - Remove notification
│
└── newsController.js          ← Campus news management
    Functions:
    ├── publishNews()          - Create news article
    ├── getAllNews()           - Fetch news feed
    └── deleteNews()           - Remove news
```

**Example Controller Code:**
```javascript
// authController.js - register function
exports.register = async (req, res) => {
  try {
    const { name, email, password, registerNumber, department, year } = req.body;

    // Validate all fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await hashPasswordMiddleware(password);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      registerNumber,
      department,
      year
    });

    // Save to database
    await newUser.save();

    return res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      userId: newUser._id 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

---

### `routes/` - API Endpoints
```
routes/
├── authRoutes.js              ← /api/auth endpoints
│   POST /register             - Register new user
│   POST /login                - Login user
│   POST /send-otp             - Send OTP email
│   POST /verify-otp           - Verify OTP
│   POST /forgot-password      - Reset password request
│   POST /reset-password/:token - Update password
│   GET /profile               - Get user profile
│   PUT /profile               - Update profile
│
├── postRoutes.js              ← /api/posts endpoints
│   GET /                      - Get all posts
│   POST /                     - Create post
│   GET /user/:email           - Get posts by user
│   PUT /:postId               - Update post
│   DELETE /:postId            - Delete post
│   POST /:postId/like         - Like post
│
├── commentRoutes.js           ← /api/comments endpoints
│   GET /post/:postId          - Get comments for post
│   POST /                     - Add comment
│   DELETE /:commentId         - Delete comment
│
├── eventRoutes.js             ← /api/events endpoints
│   GET /                      - Get all events
│   POST /                     - Create event
│   POST /:eventId/register    - Register for event
│   DELETE /:eventId           - Delete event
│
├── mentorRoutes.js            ← /api/mentors endpoints
│   GET /                      - List all mentors
│   GET /skill/:skill          - Filter by skill
│   GET /filter                - Advanced search
│
├── messageRoutes.js           ← /api/messages endpoints
│   GET /conversations         - Get all chats
│   POST /conversations/start  - Start new chat
│   GET /conversations/:id/messages - Get messages
│   POST /send                 - Send message
│
├── uploadRoutes.js            ← /api/upload endpoints
│   POST /profile              - Upload profile image
│   POST /post                 - Upload post images
│
├── notificationRoutes.js      ← /api/notifications endpoints
│   GET /                      - Get notifications
│   POST /:id/read             - Mark as read
│   DELETE /:id                - Delete notification
│
└── newsRoutes.js              ← /api/news endpoints
    POST /                     - Publish news
    GET /                      - Get news feed
    DELETE /:id                - Delete news
```

**Example Route Code:**
```javascript
// postRoutes.js
const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// Create new post (protected)
router.post('/', authMiddleware, createPost);

// Get all posts (public)
router.get('/', getAllPosts);

// Delete post (protected)
router.delete('/:postId', authMiddleware, deletePost);

module.exports = router;
```

---

### `middleware/` - Request Interceptors
```
middleware/
├── authMiddleware.js          ← JWT verification
│   Verifies token from Authorization header
│   Attaches user data to request object
│   Protects routes from unauthorized access
│
├── passwordMiddleware.js      ← Password hashing
│   hashPasswordMiddleware()   - Hash password with bcryptjs
│   comparePassword()          - Compare passwords
│
└── rateLimitMiddleware.js     ← Rate limiting
    forgotPasswordLimiter     - Limit forgot password attempts
    resetPasswordLimiter      - Limit reset attempts
```

**Example Middleware Code:**
```javascript
// authMiddleware.js
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

---

### `utils/` - Helper Functions
```
utils/
├── otp.js                     ← OTP generation
│   generateOTP()              - Create 6-digit OTP
│   getOTPExpiry()             - Set 10-minute expiry
│   verifyOTP()                - Validate OTP code
│
├── email.js                   ← Email sending (Nodemailer)
│   sendOTPEmail()             - Send OTP to email
│   sendWelcomeEmail()         - Send welcome message
│   sendPasswordResetEmail()   - Send reset link
│
├── jwt.js                     ← JWT token creation
│   createToken()              - Generate JWT token
│   Payload: { userId, email, name }
│   Expires in: 24 hours
│
└── autoTagger.js              ← AI auto-tagging
    Uses Hugging Face API
    Automatically tags posts
    Improves discoverability
```

**Example Util Code:**
```javascript
// otp.js
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPExpiry = () => {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
};

module.exports = { generateOTP, getOTPExpiry };

// jwt.js
const jwt = require('jsonwebtoken');

const createToken = (userId, email, name) => {
  return jwt.sign(
    { userId, email, name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { createToken };
```

---

### `server.js` - Main Server Entry Point

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { connectDB } = require('./config/db');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO for real-time features
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join notification room
  socket.on('join-notification-room', (userEmail) => {
    socket.join(`notifications-${userEmail}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    // Broadcast to conversation room
    io.to(`conversation-${data.conversationId}`).emit('message-received', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

---

## 📱 FRONTEND FOLDER STRUCTURE (DETAILED)

### Root Level
```
frontend/
├── index.html                 ← HTML template (loads React app)
├── vite.config.js             ← Vite build tool config
├── tailwind.config.js         ← Tailwind CSS configuration
├── postcss.config.js          ← PostCSS configuration
├── package.json               ← Dependencies (React, Axios, etc.)
└── src/                       ← Source code
```

---

### `src/` - Source Code
```
src/
├── main.jsx                   ← React entry point
├── App.jsx                    ← Main router & layout
├── index.css                  ← Global styles
│
├── pages/                     ← Full page components (routes)
│   ├── Login.jsx              - User login page
│   │   └── Form to enter email & password
│   │   └── Calls /api/auth/login
│   │   └── Stores JWT in sessionStorage
│   │
│   ├── Register.jsx           - User registration page
│   │   └── Form for name, email, password, registerNumber, etc.
│   │   └── Calls /api/auth/register
│   │   └── Redirects to VerifyOTP after registration
│   │
│   ├── VerifyOTP.jsx          - Email OTP verification
│   │   └── User enters 6-digit OTP
│   │   └── Calls /api/auth/verify-otp
│   │   └── Redirects to Login after verification
│   │
│   ├── Feed.jsx               - Main social feed
│   │   └── Displays all posts from all users
│   │   └── Create post modal with image upload
│   │   └── Like/comment/delete posts
│   │   └── Real-time notifications
│   │
│   ├── Profile.jsx            - User profile page
│   │   └── View/edit profile information
│   │   └── Upload profile image
│   │   └── View own posts
│   │   └── Settings & logout
│   │
│   ├── Search.jsx             - Search posts & users
│   │   └── Search bar to find content
│   │   └── Display search results
│   │   └── Filter by type (posts/users)
│   │
│   ├── Hackathons.jsx         - Events & hackathons listing
│   │   └── View all upcoming events
│   │   └── Register for events
│   │   └── Filter by date/category
│   │
│   ├── MentorsList.jsx        - Browse mentors
│   │   └── See all 3rd & 4th year mentors
│   │   └── Filter by department & skills
│   │   └── View mentor profile
│   │   └── Connect & start chat
│   │
│   ├── MentorChat.jsx         - 1-on-1 chat interface
│   │   └── Send & receive messages
│   │   └── Message history
│   │   └── Auto-polling for new messages
│   │
│   ├── Conversations.jsx      - Active chats list
│   │   └── View all mentorship conversations
│   │   └── Open conversation or start new
│   │   └── Close conversation
│   │
│   ├── CampusNews.jsx         - Campus news feed
│   │   └── View latest news articles
│   │   └── Filter by category
│   │
│   ├── NewsAdmin.jsx          - Admin news management
│   │   └── Publish news articles
│   │   └── Edit/delete news
│   │   └── Pin important news
│   │
│   ├── AdminDashboard.jsx     - Admin control panel
│   │   └── Manage users
│   │   └── Moderate posts
│   │   └── View statistics
│   │
│   ├── ForgotPassword.jsx     - Password reset request
│   │   └── Enter email to receive reset link
│   │
│   ├── ResetPassword.jsx      - New password form
│   │   └── Enter new password
│   │   └── Uses token from email link
│   │
│   └── AboutUs.jsx            - About page
│       └── Project information
│
├── components/                ← Reusable UI components
│   ├── NotificationBell.jsx   - Real-time notification icon
│   │   └── Shows unread count
│   │   └── Socket.IO connection
│   │   └── Dropdown for notifications
│   │
│   └── SearchBar.jsx          - Global search component
│       └── Search posts/users
│       └── Autocomplete suggestions
│
├── hooks/                     ← Custom React hooks
│   ├── useNotifications.js    - Notification logic hook
│   │   └── Fetch notifications
│   │   └── Mark as read
│   │   └── Socket.IO listeners
│   │
│   └── useOptimization.js     - Performance optimization
│       └── Debouncing
│       └── Caching
│
└── utils/                     ← Helper functions
    └── validation.js          - Form validation
        ├── validateEmail()
        ├── validatePassword()
        └── validateForm()
```

---

### `src/App.jsx` - Main App Component

```javascript
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Import all pages
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
// ... more imports

function App() {
  // Get JWT token from sessionStorage (per-tab)
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('token') ? true : false
  );
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');

  // Handle login - store token
  const handleLogin = (jwtToken) => {
    setToken(jwtToken);
    setIsLoggedIn(true);
    sessionStorage.setItem('token', jwtToken);
  };

  // Handle logout - clear token
  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    sessionStorage.removeItem('token');
  };

  return (
    <Router>
      <Toaster position="top-center" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Protected Routes - require login */}
        <Route 
          path="/feed" 
          element={isLoggedIn ? 
            <Feed token={token} onLogout={handleLogout} /> 
            : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isLoggedIn ? 
            <Profile token={token} onLogout={handleLogout} /> 
            : <Navigate to="/login" />} 
        />
        <Route 
          path="/mentors" 
          element={isLoggedIn ? 
            <MentorsList token={token} onLogout={handleLogout} /> 
            : <Navigate to="/login" />} 
        />
        {/* ... more routes */}

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### Page Component Example: `Feed.jsx`

```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

function Feed({ token, onLogout }) {
  // Decode JWT to get current user
  const getCurrentUserFromToken = () => {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  };

  const currentUser = getCurrentUserFromToken();
  const userEmail = currentUser.email;
  const userName = currentUser.name;

  // State for posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});

  // Fetch all posts on component load
  useEffect(() => {
    fetchAllPosts();
  }, []);

  // Fetch posts from backend
  const fetchAllPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  // Create new post
  const createNewPost = async (content, images) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/posts',
        {
          authorName: userName,
          authorEmail: userEmail,
          content,
          images,
          timestamp: new Date()
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setPosts([response.data, ...posts]);
      toast.success('Post created!');
    } catch (error) {
      toast.error('Error creating post');
    }
  };

  // Like/unlike post
  const handleLike = async (postId) => {
    try {
      const isLiked = userLikes[postId];
      
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        { increment: isLiked ? -1 : 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setUserLikes({
        ...userLikes,
        [postId]: !isLiked
      });
    } catch (error) {
      toast.error('Error updating like');
    }
  };

  // Render JSX
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <header className="bg-white shadow p-4 rounded-lg mb-4">
          <h1 className="text-2xl font-bold">Campus Feed</h1>
          <p className="text-gray-600">Hello, {userName}</p>
        </header>

        {/* Create Post Form */}
        <div className="bg-white shadow p-4 rounded-lg mb-4">
          <textarea
            placeholder="Share something with campus..."
            className="w-full p-3 border rounded"
          />
          <button 
            onClick={() => createNewPost()}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Post
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="bg-white shadow p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">{post.authorName}</span>
                  <span className="text-gray-500 text-sm">{post.authorEmail}</span>
                </div>
                
                <p className="text-gray-800 mb-3">{post.content}</p>
                
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {post.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt="post" 
                        className="w-32 h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-4 text-sm text-gray-600">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={userLikes[post._id] ? 'text-red-500' : ''}
                  >
                    👍 {post.reactions?.likes || 0} Likes
                  </button>
                  <button>💬 {post.reactions?.comments || 0} Comments</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
```

---

## 🔄 DATA FLOW EXAMPLE: USER REGISTRATION

### Step-by-Step Flow

```
1. USER ENTERS DATA IN REGISTER.JSX
   ├─ name: "John Doe"
   ├─ email: "john@gmail.com"
   ├─ password: "MyPassword123"
   ├─ registerNumber: "23B91A6129"
   ├─ department: "CSE"
   └─ year: 2

2. FRONTEND SENDS HTTP POST REQUEST
   ├─ URL: http://localhost:5000/api/auth/register
   ├─ Method: POST
   └─ Body: { name, email, password, registerNumber, department, year }

3. BACKEND RECEIVES REQUEST IN AUTHROUTES.JS
   └─ router.post("/register", register)

4. AUTHCONTROLLER.JS - REGISTER FUNCTION EXECUTES
   ├─ Validate all fields provided
   ├─ Check if email already exists in MongoDB
   │  └─ Query: User.findOne({ email })
   ├─ Check if register number already exists
   │  └─ Query: User.findOne({ registerNumber })
   ├─ Hash password with bcryptjs
   │  └─ hashPasswordMiddleware(password)
   ├─ Create new User document
   │  └─ new User({ name, email, hashedPassword, ... })
   └─ Save to MongoDB
      └─ newUser.save()

5. MONGODB STORES DATA
   ├─ Collection: users
   ├─ Document:
   │  {
   │    _id: ObjectId("..."),
   │    name: "John Doe",
   │    email: "john@gmail.com",
   │    password: "$2a$10$...", (hashed)
   │    registerNumber: "23B91A6129",
   │    department: "CSE",
   │    year: 2,
   │    isVerified: false,
   │    createdAt: 2025-01-15...
   │  }
   └─ Returns saved user object to controller

6. BACKEND SENDS RESPONSE
   ├─ Status: 201 (Created)
   └─ Body: {
       success: true,
       message: "User registered successfully",
       userId: "..."
     }

7. FRONTEND RECEIVES RESPONSE IN REGISTER.JSX
   ├─ Checks if response.success === true
   ├─ Shows success toast: "Registration successful"
   └─ Redirects to /verify-otp page

8. USER VERIFIES EMAIL OTP
   ├─ Enters OTP received in email
   ├─ Frontend sends: POST /api/auth/verify-otp
   └─ Backend updates: User.isVerified = true

9. USER CAN NOW LOGIN
   ├─ Enters email & password
   ├─ Backend verifies credentials
   ├─ Generates JWT token: { userId, email, name }
   ├─ Returns JWT to frontend
   └─ Frontend stores in sessionStorage
```

---

## 🔐 DATA FLOW EXAMPLE: USER LOGIN

```
1. USER ENTERS CREDENTIALS
   ├─ email: "john@gmail.com"
   └─ password: "MyPassword123"

2. FRONTEND SENDS LOGIN REQUEST
   └─ POST http://localhost:5000/api/auth/login
      └─ Body: { email, password }

3. BACKEND AUTHCONTROLLER.LOGIN() EXECUTES
   ├─ Find user by email
   │  └─ User.findOne({ email })
   ├─ Compare password with hashed password
   │  └─ comparePassword(inputPassword, user.password)
   ├─ Generate JWT token
   │  └─ createToken(user._id, user.email, user.name)
   └─ Return token to frontend

4. FRONTEND RECEIVES JWT TOKEN
   ├─ Stores token in sessionStorage.setItem('token', jwtToken)
   ├─ Sets isLoggedIn = true
   └─ Redirects to /feed page

5. FRONTEND ACCESSES PROTECTED ROUTE (/FEED)
   └─ App.jsx checks: isLoggedIn ? <Feed /> : <Navigate to="/login" />

6. FEED.JSX MAKES PROTECTED API REQUEST
   ├─ Adds token to request header
   │  └─ headers: { 'Authorization': `Bearer ${token}` }
   └─ Sends: GET http://localhost:5000/api/posts

7. BACKEND RECEIVES REQUEST IN POSTROUTES.JS
   └─ router.get('/', authMiddleware, getAllPosts)

8. AUTHMIDDLEWARE.JS VERIFIES TOKEN
   ├─ Extract token from Authorization header
   ├─ Verify token with JWT_SECRET
   │  └─ jwt.verify(token, JWT_SECRET)
   ├─ Get userId from token payload
   ├─ Fetch user from MongoDB
   │  └─ User.findById(userId)
   ├─ Attach user to request object
   │  └─ req.user = user
   └─ Call next() to continue

9. POSTCONTROLLER.GETALLPOSTS() EXECUTES
   ├─ Query all posts
   │  └─ Post.find().sort({ timestamp: -1 })
   ├─ Return posts to frontend
   └─ Status: 200

10. FRONTEND RECEIVES POSTS
    ├─ Sets state: setPosts(response.data)
    └─ Renders posts on feed
```

---

## 📡 REAL-TIME MESSAGING FLOW (SOCKET.IO)

```
1. USER A (STUDENT) OPENS MENTOR CHAT
   ├─ Connects to Socket.IO server
   └─ Emits: socket.emit('join-conversation', conversationId)

2. BACKEND SOCKET.IO HANDLER RECEIVES EVENT
   └─ socket.on('join-conversation', (conversationId) => {
       socket.join(`conversation-${conversationId}`);
     })

3. USER A SENDS MESSAGE
   ├─ Client: socket.emit('send-message', {
   │    conversationId: "abc123",
   │    senderId: "user1",
   │    content: "Can you help with DSA?"
   │  })
   └─ Backend processes message

4. BACKEND SAVES MESSAGE & BROADCASTS
   ├─ Save to MongoDB
   │  └─ new Message({ conversation, sender, content }).save()
   ├─ Create notification
   │  └─ new Notification({ recipient, type: 'message' }).save()
   └─ Broadcast to conversation room
      └─ io.to(`conversation-${conversationId}`).emit('message-received', data)

5. USER B (MENTOR) RECEIVES MESSAGE
   ├─ Socket.IO receives 'message-received' event
   ├─ Frontend updates state
   │  └─ setMessages([...messages, newMessage])
   ├─ Re-renders chat interface
   └─ Shows notification

6. USER B TYPES REPLY & SENDS
   ├─ Socket.emit('send-message', { conversationId, senderId, content })
   └─ Same flow repeats...
```

---

## 🗄️ MONGODB COLLECTIONS STRUCTURE

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  registerNumber: String (unique),
  department: String,
  year: Number,
  skills: [String],
  bio: String,
  profileImage: String (Cloudinary URL),
  isMentor: Boolean,
  isAdmin: Boolean,
  isVerified: Boolean,
  otp: String (select: false),
  otpExpiry: Date (select: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  id: Number,
  authorName: String,
  authorEmail: String,
  authorDept: String,
  content: String,
  images: [String] (Cloudinary URLs),
  reactions: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  tags: [String] (AI-generated),
  profileImage: String,
  timestamp: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  content: String,
  timestamp: Date,
  isRead: Boolean
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  mentor: ObjectId (ref: User),
  student: ObjectId (ref: User),
  messages: [ObjectId] (refs: Message),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 REQUEST-RESPONSE EXAMPLES

### Example 1: Create Post Request
```
REQUEST:
POST http://localhost:5000/api/posts
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Body: {
  "authorName": "John Doe",
  "authorEmail": "john@gmail.com",
  "content": "Just learned React hooks!",
  "images": [
    "https://res.cloudinary.com/doike6ngk/image/upload/v1234567890/campus-connect/posts/abc123.jpg"
  ]
}

RESPONSE:
Status: 201 Created
{
  "_id": "507f1f77bcf86cd799439011",
  "id": 5,
  "authorName": "John Doe",
  "authorEmail": "john@gmail.com",
  "content": "Just learned React hooks!",
  "images": ["https://res.cloudinary.com/..."],
  "reactions": {
    "likes": 0,
    "comments": 0,
    "shares": 0
  },
  "tags": ["react", "javascript", "learning"],
  "timestamp": "2025-05-22T10:30:00Z"
}
```

### Example 2: Send Message Request
```
REQUEST:
POST http://localhost:5000/api/messages/send
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Body: {
  "conversationId": "507f1f77bcf86cd799439011",
  "senderId": "507f1f77bcf86cd799439012",
  "content": "Can you help me with DSA problems?"
}

RESPONSE:
Status: 201 Created
{
  "_id": "507f1f77bcf86cd799439013",
  "conversation": "507f1f77bcf86cd799439011",
  "sender": "507f1f77bcf86cd799439012",
  "content": "Can you help me with DSA problems?",
  "timestamp": "2025-05-22T10:35:00Z",
  "isRead": false
}
```

### Example 3: Get Notifications Request
```
REQUEST:
GET http://localhost:5000/api/notifications
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

RESPONSE:
Status: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "recipient": "507f1f77bcf86cd799439012",
    "type": "like",
    "relatedItem": "507f1f77bcf86cd799439011",
    "isRead": false,
    "createdAt": "2025-05-22T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "recipient": "507f1f77bcf86cd799439012",
    "type": "comment",
    "relatedItem": "507f1f77bcf86cd799439011",
    "isRead": false,
    "createdAt": "2025-05-22T10:25:00Z"
  }
]
```

---

## 🔗 FEATURE IMPLEMENTATION EXAMPLES

### Feature: POST IMAGE UPLOAD

**File 1: Frontend - `Profile.jsx`**
```javascript
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:5000/api/upload/profile',
      formData,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    setProfileImage(response.data.url);
    toast.success('Image uploaded!');
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

**File 2: Backend Route - `uploadRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../controllers/uploadController');

const upload = multer({ dest: 'uploads/' });

router.post('/profile', authMiddleware, upload.single('file'), uploadProfileImage);

module.exports = router;
```

**File 3: Backend Controller - `uploadController.js`**
```javascript
const cloudinary = require('cloudinary');

exports.uploadProfileImage = async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'campus-connect/profiles',
      width: 200,
      height: 200,
      crop: 'fill'
    });

    // Update user in database
    await User.findByIdAndUpdate(req.userId, {
      profileImage: result.secure_url
    });

    return res.json({ 
      success: true, 
      url: result.secure_url 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

---

## 📊 COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ React Components (Pages & Components)                  │    │
│  │ - Feed.jsx, Profile.jsx, MentorChat.jsx, etc.         │    │
│  └─────────────┬───────────────────────────────────────────┘    │
│                │ HTTP Requests + WebSocket                        │
│                │ (Axios + Socket.IO)                              │
│                │                                                   │
├────────────────┼───────────────────────────────────────────────────┤
│                │          API GATEWAY LAYER                        │
│                ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ Express.js Server (Port 5000)                        │        │
│  │ - CORS middleware                                    │        │
│  │ - JSON body parser                                   │        │
│  │ - Socket.IO for real-time                           │        │
│  └──────┬───────────────────────────────────────────────┘        │
│         │                                                          │
│         │ Routing Layer                                           │
│         │ /api/auth  /api/posts  /api/messages, etc.             │
│         │                                                          │
├─────────┼──────────────────────────────────────────────────────────┤
│         │           BUSINESS LOGIC LAYER                           │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ Controllers (authController, postController, etc.)   │        │
│  │ - Input validation                                   │        │
│  │ - Business logic                                     │        │
│  │ - Error handling                                     │        │
│  └──────┬───────────────────────────────────────────────┘        │
│         │                                                          │
│         │ Database Queries (Mongoose)                             │
│         │                                                          │
├─────────┼──────────────────────────────────────────────────────────┤
│         │         DATA PERSISTENCE LAYER                           │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ MongoDB (Database)                                   │        │
│  │ Collections:                                         │        │
│  │ - users (user accounts)                             │        │
│  │ - posts (social posts)                              │        │
│  │ - messages (chat messages)                          │        │
│  │ - conversations (chat rooms)                        │        │
│  │ - notifications (alerts)                            │        │
│  │ - events (hackathons)                               │        │
│  │ - news (campus articles)                            │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Additional Services:
├─ Cloudinary API ← Image storage (uploads)
├─ Nodemailer ← Email service (OTP, password reset)
├─ Hugging Face API ← AI tagging (post categorization)
└─ Socket.IO Server ← Real-time communication
```

---

## ✅ SUMMARY

This is the complete working structure of Campus Connect:

**Backend:** 9 Controllers × 8 Models × 9 Routes = 50+ API endpoints  
**Frontend:** 16 Pages × 2 Components × 2 Hooks = Complete UI  
**Database:** 8 MongoDB Collections with proper indexing  
**Real-Time:** Socket.IO for messaging & notifications  
**Storage:** Cloudinary for image management  
**Authentication:** JWT tokens with bcryptjs password hashing  

All components work together in a seamless MERN stack application!
