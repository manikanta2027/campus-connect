# Campus Connect

A comprehensive social networking platform designed for campus communities. Connect with students, participate in events, share knowledge through mentorship, and find skilled team members in hacktons.

## Features

- **User Authentication**: Secure registration and login with OTP verification
- **Social Feed**: Share posts with multimedia support and community engagement
- **Mentorship System**: Connect students with mentors for guidance and knowledge sharing
- **Real-time Messaging**: Direct messaging with real-time chat capabilities
- **Event Management**: Create, discover, and participate in campus events
- **Comments & Reactions**: Engage with posts through comments
- **Notifications**: Real-time notifications for activities
- **Search Functionality**: Find users, posts, and events
- **Admin Dashboard**: Manage news and moderate content
- **File Upload**: Upload images and documents with Cloudinary integration

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Cloud Storage**: Cloudinary
- **Email Service**: SMTP
- **Real-time**: Socket.io

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

## Project Structure

```
campus-connect/
├── backend/                    # Node.js/Express server
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   └── server.js             # Main server file
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main App component
│   └── vite.config.js        # Vite configuration
└── README.md                 # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP credentials for email service

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_SERVICE=your_smtp_service
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_email_password
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Mentorship
- `GET /api/mentors` - Get all mentors
- `GET /api/mentors/:id` - Get mentor by ID
- `POST /api/mentors/request` - Request mentorship

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/join` - Join event

### Messages
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message

### News
- `GET /api/news` - Get news articles
- `POST /api/news` - Create news (Admin only)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries or support, please reach out to the Campus Connect team.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your connection string
- Verify firewall settings if using MongoDB Atlas

### Cloudinary Upload Issues
- Check your Cloudinary credentials in `.env`
- Ensure account has sufficient storage quota

### SMTP Email Issues
- Verify SMTP credentials
- Check if "Less secure app access" is enabled (for Gmail)
- Ensure email service is not rate-limited
