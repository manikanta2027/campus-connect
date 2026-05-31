# 📚 CAMPUS CONNECT - PROJECT SUMMARY

**Project Name:** Campus Connect - College Social Platform  
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
**Status:** ✅ Complete and Functional  
**Created:** January 2025 - Present  

---

## 📋 TABLE OF CONTENTS
1. Project Overview
2. Technology Stack
3. Backend Structure
4. Frontend Structure
5. Features Implemented
6. Database Models
7. API Endpoints
8. Frontend Routes
9. How to Run

---

## 🎯 PROJECT OVERVIEW

Campus Connect is a **college-exclusive social networking platform** designed for SRKREC students to:
- Connect with peers and build professional networks
- Share posts, articles, and campus updates
- Access mentorship from senior students
- Discover college events and hackathons
- View campus news and announcements
- Communicate via real-time messaging
- Manage user profiles and preferences

### Key Objectives:
✅ Build an inclusive college community  
✅ Facilitate peer mentoring and guidance  
✅ Promote collaborative learning  
✅ Share college news and events  
✅ Enable real-time communication  

---

## 🛠️ TECHNOLOGY STACK

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime | - |
| **Express.js** | Web framework | ^4.18.2 |
| **MongoDB** | NoSQL database | - |
| **Mongoose** | MongoDB ORM | ^7.0.0 |
| **JWT (jsonwebtoken)** | Authentication | ^9.0.0 |
| **bcryptjs** | Password encryption | ^2.4.3 |
| **Cloudinary** | Cloud image storage | ^1.33.0 |
| **Multer** | File upload handling | ^1.4.4 |
| **Nodemailer** | Email sending | ^6.9.1 |
| **Socket.IO** | Real-time messaging | ^4.8.3 |
| **CORS** | Cross-origin requests | ^2.8.5 |
| **Hugging Face** | AI tagging (auto-tagging) | ^4.13.15 |

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | ^18.2.0 |
| **React Router** | Client-side routing | ^6.20.0 |
| **Axios** | HTTP client | ^1.6.2 |
| **Tailwind CSS** | Styling framework | ^3.4.1 |
| **Vite** | Build tool | ^5.0.8 |
| **Socket.IO Client** | Real-time communication | ^4.8.3 |
| **React Hot Toast** | Notifications | ^2.4.1 |

---

## 📁 BACKEND STRUCTURE

### Directory Layout
```
backend/
├── config/                    # Configuration files
│   ├── db.js                 # MongoDB connection setup
│   └── cloudinary.js         # Cloudinary image service config
│
├── models/                    # Database schemas (MongoDB)
│   ├── User.js               # User account data
│   ├── Post.js               # User posts/articles
│   ├── Comment.js            # Post comments
│   ├── Event.js              # College events
│   ├── Message.js            # Mentorship chat messages
│   ├── Conversation.js       # Chat conversations
│   ├── Notification.js       # User notifications
│   └── News.js               # Campus news articles
│
├── controllers/               # Business logic for each feature
│   ├── authController.js     # Login, registration, auth logic
│   ├── postController.js     # Create, read, delete posts
│   ├── commentController.js  # Add, delete comments
│   ├── eventController.js    # Manage events
│   ├── mentorController.js   # Find & list mentors
│   ├── messageController.js  # Chat messaging
│   ├── uploadController.js   # Cloudinary image uploads
│   ├── notificationController.js # Send notifications
│   └── newsController.js     # Manage news articles
│
├── routes/                    # API endpoint definitions
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── postRoutes.js         # /api/posts endpoints
│   ├── commentRoutes.js      # /api/comments endpoints
│   ├── eventRoutes.js        # /api/events endpoints
│   ├── mentorRoutes.js       # /api/mentors endpoints
│   ├── messageRoutes.js      # /api/messages endpoints
│   ├── uploadRoutes.js       # /api/upload endpoints
│   ├── notificationRoutes.js # /api/notifications endpoints
│   └── newsRoutes.js         # /api/news endpoints
│
├── middleware/                # Request interceptors
│   ├── authMiddleware.js     # JWT token verification
│   ├── passwordMiddleware.js # Password validation
│   └── rateLimitMiddleware.js # Rate limiting protection
│
├── utils/                     # Helper functions
│   ├── email.js              # Email sending via Nodemailer
│   ├── otp.js                # OTP generation & verification
│   ├── jwt.js                # JWT token creation
│   └── autoTagger.js         # AI-powered auto-tagging
│
├── server.js                  # Main server file (Express app)
├── package.json              # Dependencies
├── addAdmin.js               # Admin user creation script
├── testUtils.js              # Testing utilities
└── .env                      # Environment variables
```

### Key Files Description

#### `server.js`
- Main Express application entry point
- Configures routes, middleware, CORS
- Sets up Socket.IO for real-time communication
- Runs scheduled tasks (auto-delete expired events)
- Server runs on **PORT 5000** (or 8000)

#### `config/db.js`
- MongoDB connection using Mongoose
- Handles database initialization
- Error handling for connection failures

#### `config/cloudinary.js`
- Cloudinary API initialization
- Configures cloud storage for image uploads
- Sets upload presets for different media types

---

## 🎨 FRONTEND STRUCTURE

### Directory Layout
```
frontend/
├── src/
│   ├── pages/                 # Full page components (routes)
│   │   ├── Login.jsx          # User login page
│   │   ├── Register.jsx       # User registration page
│   │   ├── VerifyOTP.jsx      # OTP verification
│   │   ├── ForgotPassword.jsx # Password reset request
│   │   ├── ResetPassword.jsx  # New password form
│   │   ├── Feed.jsx           # Main feed (all posts)
│   │   ├── Profile.jsx        # User profile management
│   │   ├── Search.jsx         # Search posts/users
│   │   ├── Hackathons.jsx     # Events & hackathons listing
│   │   ├── MentorsList.jsx    # Browse mentors
│   │   ├── MentorChat.jsx     # 1-on-1 mentor chat
│   │   ├── Conversations.jsx  # Active chats list
│   │   ├── CampusNews.jsx     # Campus news articles
│   │   ├── NewsAdmin.jsx      # Admin news management
│   │   ├── AdminDashboard.jsx # Admin control panel
│   │   └── AboutUs.jsx        # About page
│   │
│   ├── components/            # Reusable UI components
│   │   ├── NotificationBell.jsx # Real-time notifications
│   │   └── SearchBar.jsx      # Search functionality
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useNotifications.js # Notification logic
│   │   └── useOptimization.js # Performance optimization
│   │
│   ├── utils/                 # Helper functions
│   │   └── validation.js      # Form validation utilities
│   │
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # React entry point
│   ├── index.css              # Global styles
│   
├── index.html                 # HTML template
├── vite.config.js             # Vite build config
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
└── package.json              # Dependencies
```

### Page Components Description

| Page | Route | Purpose |
|------|-------|---------|
| **Login** | `/login` | User authentication |
| **Register** | `/register` | New user account creation |
| **VerifyOTP** | `/verify-otp` | Email OTP verification |
| **Feed** | `/feed` | View all posts from users |
| **Profile** | `/profile` | View/edit user profile |
| **Search** | `/search` | Search posts and users |
| **Hackathons** | `/hackathons` | Browse college events |
| **MentorsList** | `/mentors` | Discover mentors |
| **MentorChat** | `/mentor-chat/:id` | 1-on-1 messaging |
| **Conversations** | `/conversations` | View all active chats |
| **CampusNews** | `/news` | Read campus news |
| **NewsAdmin** | `/admin/news` | Manage news (admin only) |
| **AdminDashboard** | `/admin` | Admin control center |
| **AboutUs** | `/about` | Project information |

---

## ✨ FEATURES IMPLEMENTED

### 1. 🔐 Authentication & Authorization
- ✅ User registration with email verification (OTP)
- ✅ Login with JWT token-based authentication
- ✅ Password reset via email link
- ✅ Forgot password flow
- ✅ Session management (sessionStorage per-tab)
- ✅ Protected routes (redirect to login if unauthorized)
- ✅ Role-based access (Student, Mentor, Admin)

### 2. 📱 User Profile Management
- ✅ Create and edit user profiles
- ✅ Profile picture upload to Cloudinary
- ✅ View other user profiles
- ✅ Edit personal information (bio, skills, etc.)
- ✅ Logout functionality

### 3. 📝 Post/Feed System
- ✅ Create posts with text and images
- ✅ Auto-tagging using Hugging Face AI
- ✅ Like/unlike posts
- ✅ Delete own posts
- ✅ Soft-delete implementation (posts marked as deleted)
- ✅ View feed of all posts
- ✅ Pagination for feed

### 4. 💬 Commenting System
- ✅ Add comments to posts
- ✅ View comments on posts
- ✅ Delete own comments
- ✅ Comment notifications

### 5. 🎓 Mentorship System
- ✅ List all available mentors (3rd & 4th year students)
- ✅ Filter mentors by department and skills
- ✅ View mentor profiles and expertise
- ✅ Request mentorship connections
- ✅ 1-on-1 mentor-student matching

### 6. 💬 Real-Time Messaging
- ✅ Direct messages between mentors and students
- ✅ Message history and persistence
- ✅ Start new conversations
- ✅ Close/archive conversations
- ✅ Auto-polling for message updates (3-second refresh)
- ✅ User typing indicators

### 7. 📅 Events & Hackathons
- ✅ Create events/hackathons
- ✅ View all upcoming events
- ✅ Filter events by date and category
- ✅ Register for events
- ✅ Auto-delete expired events (1 day after end date)
- ✅ Event notifications

### 8. 📰 Campus News
- ✅ View latest campus news articles
- ✅ Admin can publish news
- ✅ Admin can edit/delete news
- ✅ Categorize news
- ✅ News feed display

### 9. 🔔 Notifications
- ✅ Real-time notifications (via Socket.IO)
- ✅ Notification bell component
- ✅ Notification types: likes, comments, mentions, events
- ✅ Mark notifications as read
- ✅ Delete notifications

### 10. 🖼️ Image Upload & Cloud Storage
- ✅ Upload profile images to Cloudinary
- ✅ Upload post images to Cloudinary
- ✅ Image preview before upload
- ✅ Multiple image uploads per post
- ✅ Secure cloud storage with CDN delivery

### 11. 🔍 Search Functionality
- ✅ Search posts by keywords
- ✅ Search users by username/name
- ✅ Filter search results
- ✅ Real-time search suggestions

### 12. 👨‍💼 Admin Dashboard
- ✅ Manage users
- ✅ View platform statistics
- ✅ Moderate posts/comments
- ✅ Publish news
- ✅ Manage events

### 13. 🛡️ Security & Middleware
- ✅ JWT token verification
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Rate limiting for API endpoints
- ✅ Input validation and sanitization
- ✅ Protected routes

---

## 🗄️ DATABASE MODELS (MongoDB)

### 1. User Model
```
Fields:
- _id (ObjectId)
- username (String) - unique
- email (String) - unique
- password (String) - hashed
- name (String)
- profileImage (String) - Cloudinary URL
- bio (String)
- department (String)
- year (Number) - 1, 2, 3, 4
- skills (Array) - e.g., ["Web Dev", "DSA"]
- role (String) - "student", "mentor", "admin"
- isMentor (Boolean)
- createdAt (Date)
- updatedAt (Date)
```

### 2. Post Model
```
Fields:
- _id (ObjectId)
- author (ObjectId) - Reference to User
- content (String)
- images (Array) - Cloudinary URLs
- likes (Array) - User IDs
- comments (Array) - Comment references
- tags (Array) - AI auto-generated tags
- isDeleted (Boolean) - Soft delete
- createdAt (Date)
- updatedAt (Date)
```

### 3. Comment Model
```
Fields:
- _id (ObjectId)
- post (ObjectId) - Reference to Post
- author (ObjectId) - Reference to User
- content (String)
- likes (Array) - User IDs
- createdAt (Date)
- updatedAt (Date)
```

### 4. Event Model
```
Fields:
- _id (ObjectId)
- title (String)
- description (String)
- date (Date)
- startTime (String)
- endTime (String)
- location (String)
- category (String)
- registeredUsers (Array) - User IDs
- image (String)
- createdBy (ObjectId) - Reference to User
- createdAt (Date)
- updatedAt (Date)
```

### 5. Conversation Model
```
Fields:
- _id (ObjectId)
- mentor (ObjectId) - Reference to User
- student (ObjectId) - Reference to User
- messages (Array) - Message references
- isActive (Boolean)
- createdAt (Date)
- updatedAt (Date)
```

### 6. Message Model
```
Fields:
- _id (ObjectId)
- conversation (ObjectId) - Reference to Conversation
- sender (ObjectId) - Reference to User
- content (String)
- timestamp (Date)
- isRead (Boolean)
```

### 7. Notification Model
```
Fields:
- _id (ObjectId)
- recipient (ObjectId) - Reference to User
- type (String) - "like", "comment", "mention", "event"
- relatedItem (ObjectId) - Post/Comment/Event
- isRead (Boolean)
- createdAt (Date)
```

### 8. News Model
```
Fields:
- _id (ObjectId)
- title (String)
- content (String)
- image (String)
- author (ObjectId) - Reference to User
- category (String)
- views (Number)
- isPinned (Boolean)
- createdAt (Date)
- updatedAt (Date)
```

---

## 🔗 API ENDPOINTS

### Authentication Routes (`/api/auth`)
```
POST   /register              - Register new user
POST   /login                 - Login user
POST   /verify-otp           - Verify email OTP
POST   /forgot-password      - Request password reset
POST   /reset-password/:token - Reset password
GET    /profile              - Get current user profile
PUT    /profile              - Update user profile
GET    /logout               - Logout user
```

### Post Routes (`/api/posts`)
```
GET    /                      - Get all posts (paginated)
POST   /                      - Create new post
GET    /:id                   - Get single post
PUT    /:id                   - Update post
DELETE /:id                   - Delete post
POST   /:id/like              - Like a post
DELETE /:id/like              - Unlike a post
GET    /:id/likes             - Get post likes count
```

### Comment Routes (`/api/comments`)
```
GET    /post/:postId          - Get comments for a post
POST   /                      - Create comment
DELETE /:id                   - Delete comment
POST   /:id/like              - Like a comment
DELETE /:id/like              - Unlike a comment
```

### Event Routes (`/api/events`)
```
GET    /                      - Get all events
POST   /                      - Create event
GET    /:id                   - Get single event
PUT    /:id                   - Update event
DELETE /:id                   - Delete event
POST   /:id/register          - Register for event
DELETE /:id/register          - Unregister from event
GET    /:id/registrants       - Get registered users
```

### Mentor Routes (`/api/mentors`)
```
GET    /                      - Get all mentors
GET    /:id                   - Get single mentor
GET    /skill/:skill          - Filter mentors by skill
GET    /search/filter         - Advanced filtering
GET    /department/:dept      - Get mentors by department
```

### Message Routes (`/api/messages`)
```
GET    /conversations         - Get user's conversations
POST   /conversations/start   - Start new conversation
GET    /conversations/:id/messages - Get chat messages
POST   /send                  - Send message
DELETE /conversations/:id     - Close conversation
PUT    /conversations/:id/read - Mark as read
```

### Upload Routes (`/api/upload`)
```
POST   /profile               - Upload profile image
POST   /post                  - Upload post images
DELETE /:id                   - Delete image
```

### Notification Routes (`/api/notifications`)
```
GET    /                      - Get user's notifications
POST   /:id/read              - Mark notification as read
DELETE /:id                   - Delete notification
DELETE /read-all              - Mark all as read
```

### News Routes (`/api/news`)
```
GET    /                      - Get all news articles
POST   /                      - Create news (admin)
GET    /:id                   - Get single news
PUT    /:id                   - Update news (admin)
DELETE /:id                   - Delete news (admin)
```

---

## 🛣️ FRONTEND ROUTES

```
Public Routes:
  /                    → Redirect to /feed
  /login               → Login page
  /register            → Registration page
  /verify-otp          → OTP verification
  /forgot-password     → Password reset request
  /reset-password/:token → New password form
  /about               → About page

Protected Routes (Logged-in users only):
  /feed                → Main feed (all posts)
  /profile             → User profile management
  /hackathons          → Events & hackathons
  /search              → Search posts & users
  /mentors             → Browse mentors
  /mentor-chat/:id     → 1-on-1 mentor chat
  /conversations       → Active chats list
  /news                → Campus news
  /admin               → Admin dashboard
  /admin/news          → Admin news management
```

---

## 🚀 HOW TO RUN THE PROJECT

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Git

### Step 1: Clone Repository
```bash
cd campus\ connect
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# MONGODB_URI=mongodb://localhost:27017/campus-connect
# JWT_SECRET=your_secret_key
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# PORT=5000

# Start backend server
npm run dev
# or
node server.js
```

Backend runs on: **http://localhost:5000**

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:3000 or 5173**

### Step 4: Create Admin User (Optional)

```bash
cd backend
node addAdmin.js
```

### Step 5: Test the Application

1. Open browser → http://localhost:5173
2. Register a new account
3. Verify OTP sent to email
4. Login with credentials
5. Explore feed, profile, mentors, events

---

## 📊 PROJECT STATISTICS

| Metric | Count |
|--------|-------|
| **Backend Controllers** | 9 |
| **Database Models** | 8 |
| **API Routes** | 9 |
| **Frontend Pages** | 16 |
| **UI Components** | 2+ |
| **Custom Hooks** | 2+ |
| **Total Features** | 13+ |
| **API Endpoints** | 50+ |

---

## 🎓 LEARNING OUTCOMES

Through building Campus Connect, you've learned:

✅ Full-stack MERN development  
✅ RESTful API design  
✅ MongoDB schema design  
✅ JWT authentication & authorization  
✅ File upload handling (Cloudinary)  
✅ Real-time communication (Socket.IO)  
✅ Email integration (Nodemailer)  
✅ React routing & state management  
✅ Tailwind CSS styling  
✅ Responsive UI design  
✅ Security best practices  
✅ Error handling & validation  
✅ Database optimization  

---

## 🔐 SECURITY FEATURES IMPLEMENTED

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes (auth middleware)
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ Environment variable protection
- ✅ Secure cookie handling
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📝 ENVIRONMENT VARIABLES

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🐛 TROUBLESHOOTING

### Backend won't start?
- Check MongoDB is running
- Verify PORT 5000 is not in use
- Check .env file has all required variables

### Frontend won't connect to backend?
- Ensure backend is running on PORT 5000
- Check CORS settings in server.js
- Verify API_URL in frontend

### Images not uploading?
- Check Cloudinary credentials in .env
- Verify CLOUDINARY_CLOUD_NAME is set
- Check file size limits

### Email not sending?
- Use Gmail app password (not regular password)
- Enable "Less secure app access" or use 2FA
- Check EMAIL_USER and EMAIL_PASSWORD in .env

---

## 📞 SUPPORT & RESOURCES

- **GitHub**: campus-connect repo
- **MongoDB Docs**: https://docs.mongodb.com
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## 📅 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial release with core features |
| 1.1.0 | Feb 2025 | Added mentorship system |
| 1.2.0 | Mar 2025 | Integrated Cloudinary uploads |
| 1.3.0 | Apr 2025 | Added real-time notifications |
| 1.4.0 | May 2025 | Campus news feature |

---

## ✅ FINAL CHECKLIST

- ✅ Authentication system working
- ✅ Post creation & feed functional
- ✅ Comments system operational
- ✅ Mentorship matching working
- ✅ Real-time messaging active
- ✅ Image uploads to Cloudinary
- ✅ Event management functional
- ✅ Admin dashboard operational
- ✅ Notifications system active
- ✅ Search functionality working

---

**Project Status:** 🟢 FULLY FUNCTIONAL  
**Last Updated:** May 2025  
**Maintained By:** Campus Connect Team

---

## 🎉 CONCLUSION

Campus Connect is a fully functional MERN stack application that demonstrates professional-level full-stack development. It includes modern features like real-time messaging, cloud storage, AI tagging, and comprehensive user management.

The project is production-ready and can be deployed to platforms like Heroku, AWS, or DigitalOcean.

---

*This document serves as a comprehensive reference for understanding the complete Campus Connect project architecture and implementation.*
