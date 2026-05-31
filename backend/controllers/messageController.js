// Import models
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for current user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get conversations where user is either mentor or student
    const conversations = await Conversation.find({
      $or: [{ mentorId: userId }, { studentId: userId }],
      isActive: true,
    })
      .populate('mentorId', 'name email skills year')
      .populate('studentId', 'name email year')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations: conversations,
      count: conversations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

// Start a new conversation between student and mentor
exports.startConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mentorId, mentorEmail } = req.body;

    console.log(`🔍 startConversation - userId: ${userId}, mentorId: ${mentorId}, mentorEmail: ${mentorEmail}`);

    // Validate inputs - need either mentorId or mentorEmail
    if (!mentorId && !mentorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID or Email is required',
      });
    }

    // If email provided, get the user ID first
    let targetMentorId = mentorId;
    if (mentorEmail && !mentorId) {
      const targetUser = await User.findOne({ email: mentorEmail });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      targetMentorId = targetUser._id;
    }

    // Get target user details
    const targetUser = await User.findById(targetMentorId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get current user details
    const currentUser = await User.findById(userId);

    // Check if conversation already exists in EITHER direction
    // This is important because both users might be mentors (3rd/4th year)
    let conversation = await Conversation.findOne({
      $or: [
        { mentorId: targetMentorId, studentId: userId },
        { mentorId: userId, studentId: targetMentorId }
      ],
    });

    console.log(`🔍 Found existing conversation: ${conversation ? conversation._id : 'None'}`);

    // If conversation exists, just return it
    if (conversation) {
      await conversation.populate('mentorId', 'name email skills year');
      await conversation.populate('studentId', 'name email year');
      return res.json({
        success: true,
        conversation: conversation,
        message: 'Conversation already exists',
      });
    }

    // Create new conversation
    // Determine who should be mentor/student based on year
    let finalMentorId, finalStudentId;
    
    if (currentUser.year > targetUser.year) {
      // Current user is older/higher year = mentor
      finalMentorId = userId;
      finalStudentId = targetMentorId;
    } else {
      // Target user is older/higher year = mentor
      finalMentorId = targetMentorId;
      finalStudentId = userId;
    }

    conversation = new Conversation({
      mentorId: finalMentorId,
      studentId: finalStudentId,
      department: currentUser.department,
    });

    await conversation.save();
    console.log(`✅ Created new conversation: ${conversation._id}`);

    // Populate and return
    await conversation.populate('mentorId', 'name email skills year');
    await conversation.populate('studentId', 'name email year');

    res.status(201).json({
      success: true,
      conversation: conversation,
      message: 'Conversation started',
    });
  } catch (error) {
    console.error(`❌ startConversation error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation',
      error: error.message,
    });
  }
};

// Get messages from a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isMember =
      conversation.mentorId.toString() === userId.toString() ||
      conversation.studentId.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Get all messages, sorted by timestamp
    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ timestamp: 1 });

    // Mark all messages as read for current user
    await Message.updateMany(
      { conversationId: conversationId, senderId: { $ne: userId } },
      { isRead: true }
    );

    res.json({
      success: true,
      messages: messages,
      count: messages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, content } = req.body;

    console.log(`📤 sendMessage called - senderId: ${senderId}, conversationId: ${conversationId}`);

    // Validate inputs
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required',
      });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isMember =
      conversation.mentorId.toString() === senderId.toString() ||
      conversation.studentId.toString() === senderId.toString();

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found',
      });
    }

    const senderRole =
      conversation.mentorId.toString() === senderId.toString() ? 'mentor' : 'student';

    console.log(`📝 Creating message - senderRole: ${senderRole}, senderName: ${sender.name}`);

    // Create message
    const message = new Message({
      conversationId: conversationId,
      senderId: senderId,
      senderRole: senderRole,
      senderName: sender.name,
      content: content,
    });

    await message.save();
    console.log(`✅ Message saved to DB: ${message._id}`);

    // Update conversation's last message
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    console.log(`✅ Conversation updated`);

    // ============================================================
    // SEND MESSAGE NOTIFICATION TO RECIPIENT
    // ============================================================
    try {
      // Determine recipient (the other person in conversation)
      const recipientId = conversation.mentorId.toString() === senderId.toString() 
        ? conversation.studentId 
        : conversation.mentorId;
      
      const recipient = await User.findById(recipientId);
      
      if (recipient && recipient.email) {
        console.log(`\n💬 Attempting to send message notification...`);
        console.log(`   To: ${recipient.name} (${recipient.email})`);
        console.log(`   From: ${sender.name}`);
        
        const { sendNotification } = require('./notificationController');
        await sendNotification(
          recipient.email,
          'message',
          sender.email,
          sender.name,
          conversationId,
          `${sender.name} sent you a message`
        );
      }
    } catch (notificationError) {
      console.error('⚠️  Error sending message notification:', notificationError.message);
      // Don't fail the message sending if notification fails
    }

    res.status(201).json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error(`❌ sendMessage error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Delete/close a conversation
exports.closeConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user._id;

    // Find and verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isMember =
      conversation.mentorId.toString() === userId.toString() ||
      conversation.studentId.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Close conversation
    conversation.isActive = false;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation closed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing conversation',
      error: error.message,
    });
  }
};

// Delete a specific message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    console.log(`🗑️ deleteMessage called - messageId: ${messageId}, userId: ${userId}`);

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Delete message
    await Message.findByIdAndDelete(messageId);
    console.log(`✅ Message deleted: ${messageId}`);

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error(`❌ deleteMessage error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

// Edit a specific message
exports.editMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;
    const { content } = req.body;

    console.log(`✏️ editMessage called - messageId: ${messageId}, userId: ${userId}`);

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Update message
    message.content = content.trim();
    message.editedAt = new Date();
    await message.save();

    console.log(`✅ Message edited: ${messageId}`);

    res.json({
      success: true,
      message: message,
      isEdited: true,
    });
  } catch (error) {
    console.error(`❌ editMessage error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message,
    });
  }
};
