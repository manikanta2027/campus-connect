// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { connectDB } = require('./config/db');
// Import Event model for auto-delete scheduler
const Event = require('./models/Event');
// Import Message model for socket events
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');
const Notification = require('./models/Notification');
// Import News model for index cleanup
const News = require('./models/News');

// Global io instance for use in other modules
let ioInstance;
const getIO = () => ioInstance;

// Import routes
const authRoutes = require('./routes/authRoutes');
// Import upload routes for handling image uploads
const uploadRoutes = require('./routes/uploadRoutes');
// Import comment routes for handling post comments
const commentRoutes = require('./routes/commentRoutes');
// Import post routes for handling user posts
const postRoutes = require('./routes/postRoutes');
// Import event routes for handling college events
const eventRoutes = require('./routes/eventRoutes');
// Import mentor routes for mentorship discovery
const mentorRoutes = require('./routes/mentorRoutes');
// Import message routes for mentorship chat
const messageRoutes = require('./routes/messageRoutes');
// Import notification routes for real-time notifications
const notificationRoutes = require('./routes/notificationRoutes');

// Create express app
const app = express();

// Middleware - allow JSON requests
app.use(express.json());

// Middleware - allow requests from frontend
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
// Use upload routes for image uploads
app.use('/api/upload', uploadRoutes);
// Use comment routes for post comments
app.use('/api/comments', commentRoutes);
// Use post routes for user posts
app.use('/api/posts', postRoutes);
// Use event routes for college events
app.use('/api/events', eventRoutes);
// Use mentor routes for mentorship discovery
app.use('/api/mentors', mentorRoutes);
// Use message routes for mentorship chat
app.use('/api/messages', messageRoutes);
// Use notification routes for real-time notifications
app.use('/api/notifications', notificationRoutes);

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Function to auto-delete expired events
// Deletes events 1 day after their endDate
const autoDeleteExpiredEvents = async () => {
  try {
    // Calculate yesterday's date (delete events that ended 1+ days ago)
    const deleteBeforeDate = new Date();
    deleteBeforeDate.setDate(deleteBeforeDate.getDate() - 1);

    // Find all events with endDate before yesterday
    const expiredEvents = await Event.find({
      endDate: { $lt: deleteBeforeDate }
    });

    if (expiredEvents.length > 0) {
      // Delete the expired events
      const result = await Event.deleteMany({
        endDate: { $lt: deleteBeforeDate }
      });

      console.log(`\n🗑️  Auto-Delete Scheduler: Deleted ${result.deletedCount} expired events`);
      expiredEvents.forEach(event => {
        const endDateStr = event.endDate instanceof Date 
          ? event.endDate.toDateString() 
          : new Date(event.endDate).toDateString();
        console.log(`   - "${event.title}" (ended: ${endDateStr})`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error in auto-delete scheduler:', error.message);
  }
};

// Start the scheduler to run every hour
const startAutoDeleteScheduler = () => {
  // Run immediately when server starts
  autoDeleteExpiredEvents();

  // Then run every hour (3600000 milliseconds = 1 hour)
  setInterval(() => {
    autoDeleteExpiredEvents();
  }, 3600000);

  console.log('✅ Event auto-delete scheduler started (checks every hour)');
};

// Start server function
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;

    // Connect to MongoDB
    await connectDB();

    // Drop old 'id' index from News collection if it exists
    try {
      await News.collection.dropIndex('id_1');
      console.log('✅ Dropped old News id index');
    } catch (error) {
      // Index might not exist, which is fine
      if (error.message.includes('index not found')) {
        console.log('✅ No old News id index to drop');
      } else {
        console.error('⚠️ Error dropping index:', error.message);
      }
    }

    // Start the auto-delete scheduler
    startAutoDeleteScheduler();

    // Create HTTP server with Express app
    const httpServer = http.createServer(app);

    // Initialize Socket.io with CORS settings
    const io = socketIO(httpServer, {
      cors: {
        origin: 'http://localhost:3000', // Frontend URL
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Store io instance globally for use in other modules
    ioInstance = io;

    // Store active socket connections for users
    const activeUsers = new Map(); // Map of userEmail -> socketId

    // Socket.io event handlers
    io.on('connection', (socket) => {
      console.log(`🟢 User connected: ${socket.id}`);

      // User joins their personal notification room using email
      socket.on('join-notification-room', (userEmail) => {
        socket.join(`notifications-${userEmail}`);
        activeUsers.set(userEmail, socket.id);
        console.log(`✅ User ${userEmail} joined notification room`);
      });

      // User joins their personal room for receiving messages
      socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`✅ User ${userId} joined their room`);
      });

      // User joins conversation room
      socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`✅ User joined conversation: ${conversationId}`);
      });

      // Receive message from client
      socket.on('send-message', async (data) => {
        try {
          const { conversationId, senderId, content } = data;
          
          console.log(`📨 Message received - Conversation: ${conversationId}, Sender: ${senderId}`);
          
          // Get conversation and sender info
          const conversation = await Conversation.findById(conversationId);
          const sender = await User.findById(senderId);
          
          if (!conversation || !sender) {
            console.log('❌ Invalid conversation or sender');
            return;
          }

          // Get recipient ID
          const recipientId = 
            conversation.mentorId.toString() === senderId 
              ? conversation.studentId.toString()
              : conversation.mentorId.toString();

          // Broadcast message to conversation room (everyone in chat gets it)
          io.to(`conversation-${conversationId}`).emit('receive-message', {
            conversationId,
            senderId,
            senderName: sender.name,
            senderRole: conversation.mentorId.toString() === senderId ? 'mentor' : 'student',
            content,
            timestamp: new Date(),
            isRead: false,
          });

          console.log(`📤 Message broadcast to conversation-${conversationId}`);
        } catch (error) {
          console.error('❌ Socket message error:', error.message);
        }
      });

      // User leaves conversation
      socket.on('leave-conversation', (conversationId) => {
        socket.leave(`conversation-${conversationId}`);
        console.log(`👋 User left conversation: ${conversationId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        // Find and remove user from activeUsers
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            activeUsers.delete(userId);
            console.log(`🔴 User disconnected: ${userId}`);
            break;
          }
        }
      });
    });

    // Start listening for requests on HTTP server
    httpServer.listen(PORT, () => {
      console.log('✅ Server started on port ' + PORT);
      console.log('✅ Socket.io ready for real-time messaging');
    });
  } catch (error) {
    console.log('❌ Error: ' + error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, getIO };

